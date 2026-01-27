/**
 * SNSデータ シードスクリプト
 *
 * 実行方法:
 * 1. .env.local に Supabase 接続情報を設定
 * 2. npx tsx scripts/seed-sns-data.ts
 *
 * データソース: output/sns/report.md
 */

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

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

// ブランド名の配列（既存のseed-data.tsと同じ順序）
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

// ============================================
// SNS言及データ（output/sns/report.md より）
// ============================================
const MENTIONS_DATA: Array<{ brand: string; count: number; share: number }> = [
  { brand: "味の素", count: 3740, share: 43.9 },
  { brand: "コンソメ", count: 1048, share: 12.3 },
  { brand: "ほんだし", count: 271, share: 3.2 },
  { brand: "丸鶏がらスープ", count: 243, share: 2.9 },
  { brand: "クックドゥ", count: 240, share: 2.8 },
  { brand: "アジシオ", count: 96, share: 1.1 },
  { brand: "ピュアセレクト", count: 30, share: 0.4 },
  { brand: "香味ペースト", count: 24, share: 0.3 },
];

// ============================================
// 共起データ（output/sns/report.md より）
// ============================================
const COOCCURRENCES_DATA: Array<{
  brandA: string;
  brandB: string;
  count: number;
}> = [
  { brandA: "クックドゥ", brandB: "味の素", count: 40 },
  { brandA: "ほんだし", brandB: "味の素", count: 36 },
  { brandA: "コンソメ", brandB: "味の素", count: 28 },
  { brandA: "丸鶏がらスープ", brandB: "味の素", count: 12 },
  { brandA: "アジシオ", brandB: "味の素", count: 10 },
  { brandA: "ほんだし", brandB: "コンソメ", count: 9 },
  { brandA: "クックドゥ", brandB: "香味ペースト", count: 4 },
  { brandA: "ほんだし", brandB: "クックドゥ", count: 3 },
  { brandA: "丸鶏がらスープ", brandB: "コンソメ", count: 2 },
  { brandA: "ピュアセレクト", brandB: "味の素", count: 2 },
  { brandA: "香味ペースト", brandB: "味の素", count: 1 },
  { brandA: "丸鶏がらスープ", brandB: "ほんだし", count: 1 },
];

// ============================================
// センチメントデータ（output/sns/report.md より）
// ネガティブ率 = ネガティブ件数 / 総言及数 * 100
// ============================================
const SENTIMENTS_DATA: Array<{
  brand: string;
  positive: number;
  neutral: number;
  negative: number;
  negativeRate: number;
}> = [
  {
    brand: "味の素",
    positive: 1870,
    neutral: 413,
    negative: 101,
    negativeRate: 4.2,
  },
  {
    brand: "アジシオ",
    positive: 72,
    neutral: 20,
    negative: 4,
    negativeRate: 4.2,
  },
  {
    brand: "ほんだし",
    positive: 224,
    neutral: 43,
    negative: 4,
    negativeRate: 1.5,
  },
  {
    brand: "クックドゥ",
    positive: 124,
    neutral: 16,
    negative: 1,
    negativeRate: 0.7,
  },
  {
    brand: "コンソメ",
    positive: 943,
    neutral: 103,
    negative: 2,
    negativeRate: 0.2,
  },
  {
    brand: "丸鶏がらスープ",
    positive: 218,
    neutral: 24,
    negative: 1,
    negativeRate: 0.4,
  },
  {
    brand: "香味ペースト",
    positive: 21,
    neutral: 3,
    negative: 0,
    negativeRate: 0.0,
  },
  {
    brand: "ピュアセレクト",
    positive: 27,
    neutral: 3,
    negative: 0,
    negativeRate: 0.0,
  },
];

// メイン処理
async function main() {
  console.log("Starting SNS seed process...\n");

  // 1. ブランドIDの取得
  console.log("1. Fetching brand IDs...");
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

  // 2. sns_mentions投入
  console.log("2. Inserting SNS mentions data...");
  const mentionsRecords = MENTIONS_DATA.map((m) => ({
    brand_id: brandIdMap[m.brand],
    mention_count: m.count,
    share_percentage: m.share,
  })).filter((r) => r.brand_id !== undefined);

  const { error: mentionsError } = await supabase
    .from("sns_mentions")
    .upsert(mentionsRecords, {
      onConflict: "brand_id,analysis_date",
    });

  if (mentionsError) {
    console.error("Error inserting mentions:", mentionsError);
  } else {
    console.log(`  Inserted ${mentionsRecords.length} mention records\n`);
  }

  // 3. sns_cooccurrences投入（双方向）
  console.log("3. Inserting SNS cooccurrence data...");
  const cooccurrenceRecords: Array<{
    brand_a_id: number;
    brand_b_id: number;
    cooccurrence_count: number;
  }> = [];

  // 全ブランドペアを初期化（0件）
  for (const brandA of BRANDS) {
    for (const brandB of BRANDS) {
      if (brandIdMap[brandA] && brandIdMap[brandB]) {
        cooccurrenceRecords.push({
          brand_a_id: brandIdMap[brandA],
          brand_b_id: brandIdMap[brandB],
          cooccurrence_count: 0, // デフォルト0
        });
      }
    }
  }

  // 実際の共起データで上書き（双方向）
  for (const co of COOCCURRENCES_DATA) {
    const aId = brandIdMap[co.brandA];
    const bId = brandIdMap[co.brandB];
    if (aId && bId) {
      // A→B
      const indexAB = cooccurrenceRecords.findIndex(
        (r) => r.brand_a_id === aId && r.brand_b_id === bId
      );
      if (indexAB >= 0) {
        cooccurrenceRecords[indexAB].cooccurrence_count = co.count;
      }
      // B→A（対称）
      const indexBA = cooccurrenceRecords.findIndex(
        (r) => r.brand_a_id === bId && r.brand_b_id === aId
      );
      if (indexBA >= 0) {
        cooccurrenceRecords[indexBA].cooccurrence_count = co.count;
      }
    }
  }

  const { error: cooccurrenceError } = await supabase
    .from("sns_cooccurrences")
    .upsert(cooccurrenceRecords, {
      onConflict: "brand_a_id,brand_b_id,analysis_date",
    });

  if (cooccurrenceError) {
    console.error("Error inserting cooccurrences:", cooccurrenceError);
  } else {
    console.log(
      `  Inserted ${cooccurrenceRecords.length} cooccurrence records\n`
    );
  }

  // 4. sns_sentiments投入
  console.log("4. Inserting SNS sentiment data...");
  const sentimentRecords = SENTIMENTS_DATA.map((s) => ({
    brand_id: brandIdMap[s.brand],
    positive_count: s.positive,
    neutral_count: s.neutral,
    negative_count: s.negative,
    negative_rate: s.negativeRate,
  })).filter((r) => r.brand_id !== undefined);

  const { error: sentimentError } = await supabase
    .from("sns_sentiments")
    .upsert(sentimentRecords, {
      onConflict: "brand_id,analysis_date",
    });

  if (sentimentError) {
    console.error("Error inserting sentiments:", sentimentError);
  } else {
    console.log(`  Inserted ${sentimentRecords.length} sentiment records\n`);
  }

  console.log("SNS seed process completed!");
}

main().catch(console.error);
