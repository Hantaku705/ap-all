/**
 * sns_sentiments 再計算スクリプト
 *
 * sns_posts テーブルの sentiment カラムから
 * ブランド別のセンチメント集計を再計算して sns_sentiments を更新
 *
 * 実行方法:
 * npx tsx scripts/recalc-sentiments.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: SUPABASE environment variables required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BRANDS = [
  "ほんだし",
  "クックドゥ",
  "味の素",
  "丸鶏がらスープ",
  "香味ペースト",
  "コンソメ",
  "ピュアセレクト",
  "アジシオ",
];

interface SentimentCount {
  positive: number;
  neutral: number;
  negative: number;
}

async function main() {
  console.log("=== sns_sentiments 再計算 ===\n");

  // 1. ブランドIDマップ取得
  const { data: brands, error: brandsError } = await supabase
    .from("brands")
    .select("id, name");

  if (brandsError) {
    console.error("Error fetching brands:", brandsError);
    process.exit(1);
  }

  const brandIdMap: Record<string, number> = {};
  brands?.forEach((b) => {
    brandIdMap[b.name] = b.id;
  });
  console.log(`ブランド数: ${Object.keys(brandIdMap).length}\n`);

  // 2. sns_postsからブランド別センチメント集計
  console.log("sns_postsからセンチメント集計中...\n");

  const brandSentiments: Record<string, SentimentCount> = {};
  for (const brand of BRANDS) {
    brandSentiments[brand] = { positive: 0, neutral: 0, negative: 0 };
  }

  // 全投稿を取得してブランド別に集計
  // (brand_mentionsがカンマ区切りなのでクライアント側で処理)
  const { data: posts, error: postsError } = await supabase
    .from("sns_posts")
    .select("brand_mentions, sentiment")
    .not("sentiment", "is", null);

  if (postsError) {
    console.error("Error fetching posts:", postsError);
    process.exit(1);
  }

  console.log(`分析対象投稿数: ${posts?.length || 0}\n`);

  for (const post of posts || []) {
    if (!post.brand_mentions || !post.sentiment) continue;

    const mentionedBrands = post.brand_mentions.split(",").map((b: string) => b.trim());
    const sentiment = post.sentiment as "positive" | "neutral" | "negative";

    for (const brand of mentionedBrands) {
      if (brandSentiments[brand]) {
        brandSentiments[brand][sentiment]++;
      }
    }
  }

  // 3. 集計結果表示
  console.log("ブランド別センチメント分布:");
  console.log("-".repeat(70));
  console.log(
    "ブランド".padEnd(20) +
      "Positive".padStart(10) +
      "Neutral".padStart(10) +
      "Negative".padStart(10) +
      "Neg率".padStart(10)
  );
  console.log("-".repeat(70));

  const records = [];
  for (const brand of BRANDS) {
    const s = brandSentiments[brand];
    const total = s.positive + s.neutral + s.negative;
    const negRate = total > 0 ? (s.negative / total) * 100 : 0;

    console.log(
      brand.padEnd(20) +
        s.positive.toString().padStart(10) +
        s.neutral.toString().padStart(10) +
        s.negative.toString().padStart(10) +
        `${negRate.toFixed(1)}%`.padStart(10)
    );

    if (brandIdMap[brand]) {
      records.push({
        brand_id: brandIdMap[brand],
        positive_count: s.positive,
        neutral_count: s.neutral,
        negative_count: s.negative,
        negative_rate: Math.round(negRate * 100) / 100,
      });
    }
  }
  console.log("-".repeat(70));

  // 4. sns_sentiments 更新
  console.log("\nsns_sentiments テーブルを更新中...");

  const { error: upsertError } = await supabase
    .from("sns_sentiments")
    .upsert(records, {
      onConflict: "brand_id,analysis_date",
    });

  if (upsertError) {
    console.error("Error upserting sentiments:", upsertError);
    process.exit(1);
  }

  console.log(`✅ ${records.length} 件のレコードを更新しました\n`);
  console.log("完了!");
}

main().catch(console.error);
