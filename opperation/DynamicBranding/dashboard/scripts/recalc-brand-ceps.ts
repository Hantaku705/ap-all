/**
 * brand_ceps 再計算スクリプト
 *
 * sns_posts テーブルの cep_id カラムから
 * ブランド別CEPスコアを再計算して brand_ceps を更新
 *
 * 実行方法:
 * npx tsx scripts/recalc-brand-ceps.ts
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

interface CepCount {
  count: number;
  engagementTotal: number;
}

async function main() {
  console.log("=== brand_ceps 再計算 ===\n");

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

  // 2. CEPマスタ取得
  const { data: ceps, error: cepsError } = await supabase
    .from("ceps")
    .select("id, cep_name");

  if (cepsError) {
    console.error("Error fetching ceps:", cepsError);
    process.exit(1);
  }

  const cepIdMap: Record<number, string> = {};
  ceps?.forEach((c) => {
    cepIdMap[c.id] = c.cep_name;
  });
  console.log(`CEP数: ${Object.keys(cepIdMap).length}\n`);

  // 3. sns_postsからブランド×CEP別集計
  console.log("sns_postsからCEP集計中...\n");

  // ブランド×CEP → {count, engagementTotal}
  const brandCepCounts: Record<string, Record<number, CepCount>> = {};
  for (const brand of BRANDS) {
    brandCepCounts[brand] = {};
  }

  // 全投稿を取得してブランド×CEP別に集計
  const { data: posts, error: postsError } = await supabase
    .from("sns_posts")
    .select("brand_mentions, cep_id, engagement_total")
    .not("cep_id", "is", null);

  if (postsError) {
    console.error("Error fetching posts:", postsError);
    process.exit(1);
  }

  console.log(`分析対象投稿数: ${posts?.length || 0}\n`);

  for (const post of posts || []) {
    if (!post.brand_mentions || !post.cep_id) continue;

    const mentionedBrands = post.brand_mentions.split(",").map((b: string) => b.trim());
    const cepId = post.cep_id as number;
    const engagement = (post.engagement_total as number) || 0;

    for (const brand of mentionedBrands) {
      if (brandCepCounts[brand]) {
        if (!brandCepCounts[brand][cepId]) {
          brandCepCounts[brand][cepId] = { count: 0, engagementTotal: 0 };
        }
        brandCepCounts[brand][cepId].count++;
        brandCepCounts[brand][cepId].engagementTotal += engagement;
      }
    }
  }

  // 4. 集計結果表示
  console.log("ブランド別CEP分布 (上位3):");
  console.log("-".repeat(80));

  const records: Array<{
    brand_id: number;
    cep_id: number;
    mention_count: number;
    reach_score: number;
    frequency_score: number;
  }> = [];

  for (const brand of BRANDS) {
    const brandId = brandIdMap[brand];
    if (!brandId) continue;

    const cepData = brandCepCounts[brand];
    const sortedCeps = Object.entries(cepData)
      .map(([cepIdStr, data]) => ({
        cepId: parseInt(cepIdStr),
        count: data.count,
        engagement: data.engagementTotal,
      }))
      .sort((a, b) => b.count - a.count);

    const totalMentions = sortedCeps.reduce((sum, c) => sum + c.count, 0);

    console.log(`\n${brand}:`);
    for (const { cepId, count, engagement } of sortedCeps.slice(0, 3)) {
      const cepName = cepIdMap[cepId] || `CEP#${cepId}`;
      const pct = totalMentions > 0 ? (count / totalMentions) * 100 : 0;
      console.log(`  - ${cepName}: ${count}件 (${pct.toFixed(1)}%), エンゲージ計: ${engagement}`);
    }

    // 全CEPのレコードを作成
    for (const { cepId, count, engagement } of sortedCeps) {
      // reach_score: 全ブランド中のシェア (0-1)
      const maxTotal = Math.max(...BRANDS.map((b) => {
        const data = brandCepCounts[b][cepId];
        return data ? data.count : 0;
      }));
      const reachScore = maxTotal > 0 ? count / maxTotal : 0;

      // frequency_score: 平均エンゲージメント
      const frequencyScore = count > 0 ? engagement / count : 0;

      records.push({
        brand_id: brandId,
        cep_id: cepId,
        mention_count: count,
        reach_score: Math.round(reachScore * 10000) / 10000,
        frequency_score: Math.round(frequencyScore * 100) / 100,
      });
    }
  }

  console.log("\n" + "-".repeat(80));

  // 5. 既存レコード削除（今日分）
  console.log("\n既存レコードを削除中...");
  const today = new Date().toISOString().split("T")[0];

  const { error: deleteError } = await supabase
    .from("brand_ceps")
    .delete()
    .eq("analysis_date", today);

  if (deleteError) {
    console.error("Error deleting old records:", deleteError);
    // エラーでも続行（レコードがなければエラーになる可能性）
  }

  // 6. brand_ceps 更新
  console.log("brand_ceps テーブルを更新中...");

  if (records.length === 0) {
    console.log("⚠️  更新するレコードがありません（CEPラベルが付与されていない可能性）");
    process.exit(0);
  }

  const { error: upsertError } = await supabase
    .from("brand_ceps")
    .upsert(records, {
      onConflict: "brand_id,cep_id,analysis_date",
    });

  if (upsertError) {
    console.error("Error upserting brand_ceps:", upsertError);
    process.exit(1);
  }

  console.log(`✅ ${records.length} 件のレコードを更新しました\n`);
  console.log("完了!");
}

main().catch(console.error);
