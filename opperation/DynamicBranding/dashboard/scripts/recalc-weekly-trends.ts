/**
 * 週次トレンド再計算スクリプト
 * キャンペーン投稿削除後に実行
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Supabase credentials not found");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

async function main() {
  // 1. ブランドマスタ取得
  console.log("1. Fetching brands...");
  const { data: brands } = await supabase.from("brands").select("id, name");
  const brandIdMap: Record<string, number> = {};
  brands?.forEach((b) => (brandIdMap[b.name] = b.id));
  console.log("   Brands:", Object.keys(brandIdMap).length);

  // 2. 全投稿取得（ページネーション対応）
  console.log("2. Fetching all posts...");
  const posts: Array<{ published: string; brand_mentions: string | null }> = [];
  const PAGE_SIZE = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("sns_posts")
      .select("published, brand_mentions")
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error:", error);
      return;
    }

    if (data && data.length > 0) {
      posts.push(...data);
      offset += PAGE_SIZE;
      console.log(`   Fetched ${posts.length} posts...`);
    }

    hasMore = data && data.length === PAGE_SIZE;
  }
  console.log("   Total posts:", posts.length);

  // 3. 週次集計
  console.log("3. Calculating weekly trends...");
  const weeklyData: Record<string, Record<string, number>> = {};

  for (const post of posts) {
    const weekStart = getWeekStart(post.published);
    const brandMentions = (post.brand_mentions || "").split(",").filter(Boolean);

    if (!weeklyData[weekStart]) {
      weeklyData[weekStart] = {};
    }

    for (const brand of brandMentions) {
      const trimmed = brand.trim();
      weeklyData[weekStart][trimmed] = (weeklyData[weekStart][trimmed] || 0) + 1;
    }
  }

  // レコード配列に変換
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

  console.log("   Weeks:", Object.keys(weeklyData).length);
  console.log("   Records:", weeklyRecords.length);

  // 4. 既存データ削除
  console.log("4. Clearing old weekly trends...");
  const { error: deleteError } = await supabase
    .from("sns_weekly_trends")
    .delete()
    .neq("id", 0);

  if (deleteError) {
    console.error("Delete error:", deleteError);
  }

  // 5. 新データ投入
  console.log("5. Inserting new weekly trends...");
  const { error: insertError } = await supabase
    .from("sns_weekly_trends")
    .insert(weeklyRecords);

  if (insertError) {
    console.error("Insert error:", insertError);
  } else {
    console.log("   Inserted:", weeklyRecords.length, "records");
  }

  // 6. 検証: 2025-12-22週を確認
  console.log("\n6. Verifying 2025-12-22 week...");
  const { data: verify } = await supabase
    .from("sns_weekly_trends")
    .select("brand_id, mention_count, brands(name)")
    .eq("week_start", "2025-12-22");

  console.log("   2025-12-22 week:");
  verify?.forEach((v) => {
    const brandName = Array.isArray(v.brands) ? v.brands[0]?.name : (v.brands as { name: string })?.name;
    console.log("     " + brandName + ": " + v.mention_count);
  });

  console.log("\nDone!");
}

main().catch(console.error);
