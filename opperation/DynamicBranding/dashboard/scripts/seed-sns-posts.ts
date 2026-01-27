/**
 * SNS投稿データ シードスクリプト
 *
 * 実行方法:
 * 1. .env.local に Supabase 接続情報を設定
 * 2. npx tsx scripts/seed-sns-posts.ts
 *
 * データソース: data/sns/processed/with_brands.csv
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { config } from "dotenv";
import { resolve } from "path";

// .env.local を明示的に読み込み
config({ path: resolve(process.cwd(), ".env.local") });

// 環境変数チェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
  );
  console.error("Please set them in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CSVファイルパス
const CSV_PATH = path.resolve(
  __dirname,
  "../../data/sns/processed/with_brands.csv"
);

/**
 * 日付パース: "25/10/25 20:58:31" → ISO形式
 */
function parseDate(dateStr: string): string {
  try {
    const [datePart, timePart] = dateStr.split(" ");
    const [yy, mm, dd] = datePart.split("/");
    const year = parseInt(yy) < 50 ? 2000 + parseInt(yy) : 1900 + parseInt(yy);
    return `${year}-${mm}-${dd}T${timePart}`;
  } catch {
    return new Date().toISOString();
  }
}

/**
 * 週の開始日を取得（月曜始まり）
 */
function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

// メイン処理
async function main() {
  console.log("Starting SNS posts seed process...\n");

  // 1. CSVパース
  console.log("1. Parsing CSV file...");
  const csvContent = fs.readFileSync(CSV_PATH, "utf-8");
  const records = parse(csvContent, { columns: true, skip_empty_lines: true });
  console.log(`  Found ${records.length} records\n`);

  // 2. ブランドIDの取得
  console.log("2. Fetching brand IDs...");
  const { data: brands, error: brandsError } = await supabase
    .from("brands")
    .select("id, name");

  if (brandsError) {
    console.error("Error fetching brands:", brandsError);
    process.exit(1);
  }

  const brandIdMap: Record<string, number> = {};
  brands?.forEach((brand) => {
    brandIdMap[brand.name] = brand.id;
  });
  console.log(`  Found ${Object.keys(brandIdMap).length} brands\n`);

  // 3. sns_posts投入
  console.log("3. Inserting SNS posts data...");
  const posts = (records as Record<string, string>[]).map((row) => ({
    url: row.url,
    published: parseDate(row.published),
    title: row.title || null,
    content: row.content || null,
    lang: row.lang || "ja",
    source_type: row.source_type || null,
    author_name: row["extra_author_attributes.name"] || null,
    brand_mentions: row.brand_mentions || null,
    brand_count: parseInt(row.brand_count) || 0,
    is_multi_brand: row.is_multi_brand === "True",
    content_length: parseInt(row.content_length) || 0,
    has_negative_kw: row.has_negative_kw === "True",
    source_category: row.source_category || "other",
  }));

  // バッチ投入（500件ずつ）
  const BATCH_SIZE = 500;
  let insertedCount = 0;

  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("sns_posts").upsert(batch, {
      onConflict: "url",
    });

    if (error) {
      console.error(`  Error at batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
    } else {
      insertedCount += batch.length;
      console.log(`  Inserted ${insertedCount}/${posts.length} posts...`);
    }
  }
  console.log(`  Total inserted: ${insertedCount} posts\n`);

  // 4. 週次集計 → sns_weekly_trends投入
  console.log("4. Calculating weekly trends...");
  const weeklyData: Record<string, Record<string, number>> = {};

  for (const post of posts) {
    const weekStart = getWeekStart(post.published);
    const brandMentions = (post.brand_mentions || "").split(",").filter(Boolean);

    if (!weeklyData[weekStart]) {
      weeklyData[weekStart] = {};
    }

    for (const brand of brandMentions) {
      const trimmed = brand.trim();
      weeklyData[weekStart][trimmed] =
        (weeklyData[weekStart][trimmed] || 0) + 1;
    }
  }

  // 週次データをレコード配列に変換
  const weeklyRecords: Array<{
    week_start: string;
    brand_id: number;
    mention_count: number;
  }> = [];

  for (const [weekStart, brandCounts] of Object.entries(weeklyData)) {
    for (const [brandName, count] of Object.entries(brandCounts)) {
      if (brandIdMap[brandName]) {
        weeklyRecords.push({
          week_start: weekStart,
          brand_id: brandIdMap[brandName],
          mention_count: count,
        });
      }
    }
  }

  console.log(`  Found ${Object.keys(weeklyData).length} weeks`);
  console.log(`  Total weekly records: ${weeklyRecords.length}`);

  // 5. sns_weekly_trends投入
  console.log("\n5. Inserting weekly trends data...");
  const { error: weeklyError } = await supabase
    .from("sns_weekly_trends")
    .upsert(weeklyRecords, {
      onConflict: "week_start,brand_id",
    });

  if (weeklyError) {
    console.error("  Error inserting weekly trends:", weeklyError);
  } else {
    console.log(`  Inserted ${weeklyRecords.length} weekly trend records\n`);
  }

  console.log("SNS posts seed process completed!");
}

main().catch(console.error);
