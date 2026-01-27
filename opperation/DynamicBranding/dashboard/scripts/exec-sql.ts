/**
 * SQL実行スクリプト
 *
 * 使用方法:
 *   npx tsx scripts/exec-sql.ts                    # 引数なしでデフォルトスキーマ適用
 *   npx tsx scripts/exec-sql.ts path/to/file.sql  # 指定SQLファイル実行
 *
 * 必要な環境変数:
 *   DATABASE_URL - Supabase Direct接続文字列
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import dns from "dns";
import { config } from "dotenv";

// IPv4を優先（Supabase接続でIPv6エラー回避）
dns.setDefaultResultOrder("ipv4first");

// .env.local を読み込み
config({ path: path.resolve(__dirname, "../.env.local") });

// 環境変数から接続文字列を取得
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: DATABASE_URL is not set in .env.local");
  console.error("");
  console.error("Add this to your .env.local:");
  console.error("DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres");
  process.exit(1);
}

// デフォルトSQL（sns_posts スキーマ）
const defaultSQL = `
-- ============================================
-- SNS Posts & Weekly Trends Schema
-- ============================================

CREATE TABLE IF NOT EXISTS sns_posts (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  published TIMESTAMPTZ NOT NULL,
  title TEXT,
  content TEXT,
  lang TEXT DEFAULT 'ja',
  source_type TEXT,
  author_name TEXT,
  brand_mentions TEXT,
  brand_count INTEGER DEFAULT 0,
  is_multi_brand BOOLEAN DEFAULT FALSE,
  content_length INTEGER DEFAULT 0,
  has_negative_kw BOOLEAN DEFAULT FALSE,
  source_category TEXT CHECK (source_category IN ('twitter', 'news', 'blog', 'messageboard', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sns_posts_published ON sns_posts(published);
CREATE INDEX IF NOT EXISTS idx_sns_posts_source ON sns_posts(source_category);

CREATE TABLE IF NOT EXISTS sns_weekly_trends (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  mention_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_start, brand_id)
);

CREATE INDEX IF NOT EXISTS idx_sns_weekly_week ON sns_weekly_trends(week_start);
CREATE INDEX IF NOT EXISTS idx_sns_weekly_brand ON sns_weekly_trends(brand_id);

ALTER TABLE sns_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_weekly_trends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read" ON sns_posts;
CREATE POLICY "Allow anonymous read" ON sns_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access" ON sns_posts;
CREATE POLICY "Service role full access" ON sns_posts FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Allow anonymous read" ON sns_weekly_trends;
CREATE POLICY "Allow anonymous read" ON sns_weekly_trends FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access" ON sns_weekly_trends;
CREATE POLICY "Service role full access" ON sns_weekly_trends FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
`;

async function main() {
  // 引数でSQLファイルが指定された場合はそれを読む
  const sqlArg = process.argv[2];
  let sql: string;

  if (sqlArg) {
    const sqlPath = path.resolve(process.cwd(), sqlArg);
    if (!fs.existsSync(sqlPath)) {
      console.error(`Error: SQL file not found: ${sqlPath}`);
      process.exit(1);
    }
    sql = fs.readFileSync(sqlPath, "utf-8");
    console.log(`Executing SQL from: ${sqlPath}`);
  } else {
    sql = defaultSQL;
    console.log("Executing default SNS schema...");
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("Connected!");

    console.log("Executing SQL...");
    await client.query(sql);
    console.log("SQL executed successfully!");
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error:", err.message);

    // 接続エラーの詳細なヘルプ
    if (err.message.includes("ECONNREFUSED")) {
      console.error("");
      console.error("Connection refused. Check:");
      console.error("1. DATABASE_URL format: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres");
      console.error("2. Password special characters are URL-encoded (! -> %21)");
      console.error("3. Supabase project is active");
    } else if (err.message.includes("password authentication failed")) {
      console.error("");
      console.error("Password authentication failed. Check:");
      console.error("1. Database password is correct");
      console.error("2. Special characters are URL-encoded");
    }

    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
