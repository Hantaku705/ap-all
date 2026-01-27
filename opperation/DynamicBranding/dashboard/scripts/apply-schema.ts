/**
 * Apply SNS posts schema to Supabase
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";

// Load .env.local from dashboard directory
config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const schema = `
-- sns_posts table
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

-- sns_weekly_trends table
CREATE TABLE IF NOT EXISTS sns_weekly_trends (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  mention_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_start, brand_id)
);
`;

async function main() {
  console.log("Applying SNS posts schema...");

  // Try to create tables using raw SQL via RPC
  // If that doesn't work, we'll use the REST API directly

  // First, let's check if the table already exists
  const { data: existingTable, error: checkError } = await supabase
    .from("sns_posts")
    .select("id")
    .limit(1);

  if (!checkError) {
    console.log("sns_posts table already exists!");
  } else if (checkError.code === "42P01") {
    console.log("Table doesn't exist, need to create via SQL Editor");
    console.log("\nPlease run this SQL in Supabase SQL Editor:");
    console.log("https://supabase.com/dashboard/project/usjfsbvdawhsfdkabqzg/sql/new");
    console.log("\n" + schema);
    process.exit(1);
  } else {
    console.log("Error checking table:", checkError.message);
  }

  // Check sns_weekly_trends
  const { error: checkError2 } = await supabase
    .from("sns_weekly_trends")
    .select("id")
    .limit(1);

  if (!checkError2) {
    console.log("sns_weekly_trends table already exists!");
  } else if (checkError2.code === "42P01") {
    console.log("sns_weekly_trends table doesn't exist");
    process.exit(1);
  }

  console.log("\nBoth tables exist. Ready to seed data.");
}

main().catch(console.error);
