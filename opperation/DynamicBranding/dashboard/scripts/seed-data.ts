/**
 * シードスクリプト: CSV/Markdown → Supabase
 *
 * 実行方法:
 * 1. .env.local に Supabase 接続情報を設定
 * 2. npx tsx scripts/seed-data.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

// 環境変数チェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  console.error("Please set them in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ブランド名の配列
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

// 相関マトリクスのデータ
const CORRELATION_MATRIX: Record<string, Record<string, number>> = {
  ほんだし: {
    ほんだし: 1.0,
    クックドゥ: -0.11,
    味の素: -0.03,
    丸鶏がらスープ: 0.14,
    香味ペースト: -0.15,
    コンソメ: 0.38,
    ピュアセレクト: -0.01,
    アジシオ: 0.02,
  },
  クックドゥ: {
    ほんだし: -0.11,
    クックドゥ: 1.0,
    味の素: 0.26,
    丸鶏がらスープ: 0.11,
    香味ペースト: 0.04,
    コンソメ: 0.05,
    ピュアセレクト: 0.08,
    アジシオ: 0.08,
  },
  味の素: {
    ほんだし: -0.03,
    クックドゥ: 0.26,
    味の素: 1.0,
    丸鶏がらスープ: 0.2,
    香味ペースト: -0.17,
    コンソメ: 0.06,
    ピュアセレクト: 0.09,
    アジシオ: 0.35,
  },
  丸鶏がらスープ: {
    ほんだし: 0.14,
    クックドゥ: 0.11,
    味の素: 0.2,
    丸鶏がらスープ: 1.0,
    香味ペースト: -0.04,
    コンソメ: 0.26,
    ピュアセレクト: 0.14,
    アジシオ: 0.19,
  },
  香味ペースト: {
    ほんだし: -0.15,
    クックドゥ: 0.04,
    味の素: -0.17,
    丸鶏がらスープ: -0.04,
    香味ペースト: 1.0,
    コンソメ: 0.12,
    ピュアセレクト: -0.06,
    アジシオ: -0.14,
  },
  コンソメ: {
    ほんだし: 0.38,
    クックドゥ: 0.05,
    味の素: 0.06,
    丸鶏がらスープ: 0.26,
    香味ペースト: 0.12,
    コンソメ: 1.0,
    ピュアセレクト: 0.04,
    アジシオ: 0.08,
  },
  ピュアセレクト: {
    ほんだし: -0.01,
    クックドゥ: 0.08,
    味の素: 0.09,
    丸鶏がらスープ: 0.14,
    香味ペースト: -0.06,
    コンソメ: 0.04,
    ピュアセレクト: 1.0,
    アジシオ: 0.12,
  },
  アジシオ: {
    ほんだし: 0.02,
    クックドゥ: 0.08,
    味の素: 0.35,
    丸鶏がらスープ: 0.19,
    香味ペースト: -0.14,
    コンソメ: 0.08,
    ピュアセレクト: 0.12,
    アジシオ: 1.0,
  },
};

// 季節性データ（月別平均スコア）
const SEASONALITY_DATA: Record<string, number[]> = {
  ほんだし: [11.3, 10.2, 9.0, 9.4, 8.5, 7.6, 7.6, 7.8, 8.4, 10.1, 11.2, 11.9],
  クックドゥ: [4.6, 5.4, 5.9, 4.9, 4.8, 5.4, 4.8, 4.7, 4.8, 4.5, 4.0, 4.2],
  味の素: [45.1, 49.8, 49.9, 46.1, 53.0, 50.6, 48.5, 47.3, 50.6, 45.3, 50.3, 43.4],
  丸鶏がらスープ: [0.5, 0.8, 0.6, 0.6, 0.5, 0.7, 0.3, 0.4, 0.6, 0.8, 0.7, 0.6],
  香味ペースト: [2.0, 2.6, 2.2, 2.2, 2.1, 2.0, 1.8, 2.1, 1.8, 2.0, 1.8, 1.4],
  コンソメ: [80.4, 81.4, 74.5, 73.7, 74.5, 67.2, 59.0, 63.0, 70.2, 77.3, 82.4, 78.1],
  ピュアセレクト: [1.0, 1.0, 1.0, 1.0, 0.8, 1.0, 0.8, 1.0, 1.0, 1.0, 0.9, 0.8],
  アジシオ: [1.5, 1.6, 1.6, 1.5, 1.4, 1.6, 1.5, 1.4, 1.5, 1.3, 1.7, 1.4],
};

// インサイトデータ
const INSIGHTS = [
  {
    title: "だし連合：ほんだし×コンソメの強い連動",
    description:
      "ほんだしとコンソメは r=0.38 の強い正の相関を持つ。料理ジャンル（和食/洋食）を超えた「だし」という共通概念で連動している。季節性パターンも一致（冬型）。",
    category: "correlation" as const,
    confidence: "A" as const,
    confidence_reason:
      "r > 0.3 の強い相関、n=262 の十分なサンプル、p<0.01 の統計的有意性、季節性パターンの一致",
    related_brands: ["ほんだし", "コンソメ"],
    action_items: [
      "冬季キャンペーンでの同時訴求を検討",
      "「だし」を軸にしたクロスセル施策の企画",
    ],
    sort_order: 1,
  },
  {
    title: "うま味連合：味の素×アジシオの連動",
    description:
      "味の素とアジシオは r=0.35 の正の相関を持つ。「うま味」という共通概念と商品名の関連性（アジシオに「味の素」を含む）で説明可能。",
    category: "correlation" as const,
    confidence: "A" as const,
    confidence_reason:
      "r > 0.3 の強い相関、十分なサンプル数、商品名の関連性",
    related_brands: ["味の素", "アジシオ"],
    action_items: [
      "「うま味」訴求のブランディング統一",
      "ネガティブ連動リスクのセンチメント分析",
    ],
    sort_order: 2,
  },
  {
    title: "ほんだし×クックドゥは負の相関",
    description:
      "事前仮説では正の相関を想定していたが、実際は r=-0.11 の弱い負の相関。和食（ほんだし）と中華（クックドゥ）は連動していない。",
    category: "correlation" as const,
    confidence: "B" as const,
    confidence_reason:
      "相関係数は小さいが負の方向は明確。因果関係の解釈には追加データが必要",
    related_brands: ["ほんだし", "クックドゥ"],
    action_items: [
      "UGC共起分析での裏付け",
      "購買データでの併買率確認",
    ],
    sort_order: 3,
  },
  {
    title: "香味ペーストの独自ポジション",
    description:
      "香味ペーストは複数のブランドと負の相関を持つ（味の素 r=-0.17、ほんだし r=-0.15）。他ブランドと異なる独自の動きをしている。",
    category: "strategy" as const,
    confidence: "B" as const,
    confidence_reason:
      "複数の負の相関は一貫しているが、その理由の解釈には消費者調査が必要",
    related_brands: ["香味ペースト", "味の素", "ほんだし"],
    action_items: [
      "香味ペースト独自のポジショニング戦略検討",
      "ユーザー調査での使用シーン把握",
    ],
    sort_order: 4,
  },
  {
    title: "コンソメの強い季節性（冬型）",
    description:
      "コンソメは変動幅23.3で最も強い季節性を持つ。11月ピーク（82.4）、7月ボトム（59.0）の冬型パターン。シチュー・ポトフ等の冬メニューとの関連が明確。",
    category: "seasonality" as const,
    confidence: "A" as const,
    confidence_reason:
      "変動幅が他ブランドの4倍以上、冬季のピークは生活実態と整合",
    related_brands: ["コンソメ"],
    action_items: [
      "冬季への投資集中を検討",
      "夏季の底上げ施策（冷製スープ訴求等）",
    ],
    sort_order: 5,
  },
  {
    title: "味の素のハブ役割は限定的",
    description:
      "「味の素がグループ全体のハブとなる」という仮説は部分的にのみ支持。平均相関 r=0.11 と低く、アジシオ以外との連動は弱い。",
    category: "strategy" as const,
    confidence: "B" as const,
    confidence_reason:
      "定量的にはハブ役割は確認できない。ただしブランド認知の観点からは別の検証が必要",
    related_brands: ["味の素"],
    action_items: [
      "売上データでの検証",
      "ブランド認知調査との照合",
    ],
    sort_order: 6,
  },
];

// CSVパース関数
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",");
  const data: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || "";
    });
    data.push(row);
  }

  return data;
}

// メイン処理
async function main() {
  console.log("Starting seed process...\n");

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

  // 2. Google Trendsデータの投入
  console.log("2. Importing Google Trends data...");
  const trendsPath = path.join(
    __dirname,
    "../../data/trends/google-trends-data.csv"
  );
  const trendsContent = fs.readFileSync(trendsPath, "utf-8");
  const trendsData = parseCSV(trendsContent);

  const weeklyTrends: Array<{
    week_start: string;
    brand_id: number;
    score: number;
  }> = [];

  for (const row of trendsData) {
    const weekStart = row.date;
    for (const brand of BRANDS) {
      const score = parseInt(row[brand], 10);
      if (!isNaN(score) && brandIdMap[brand]) {
        weeklyTrends.push({
          week_start: weekStart,
          brand_id: brandIdMap[brand],
          score,
        });
      }
    }
  }

  // バッチ挿入（500件ずつ）
  const batchSize = 500;
  for (let i = 0; i < weeklyTrends.length; i += batchSize) {
    const batch = weeklyTrends.slice(i, i + batchSize);
    const { error } = await supabase.from("weekly_trends").upsert(batch, {
      onConflict: "week_start,brand_id",
    });
    if (error) {
      console.error("Error inserting trends:", error);
    }
  }
  console.log(`  Inserted ${weeklyTrends.length} trend records\n`);

  // 3. 相関データの投入
  console.log("3. Importing correlation data...");
  const correlations: Array<{
    brand_a_id: number;
    brand_b_id: number;
    coefficient: number;
  }> = [];

  for (const brandA of BRANDS) {
    for (const brandB of BRANDS) {
      const coefficient = CORRELATION_MATRIX[brandA]?.[brandB];
      if (coefficient !== undefined && brandIdMap[brandA] && brandIdMap[brandB]) {
        correlations.push({
          brand_a_id: brandIdMap[brandA],
          brand_b_id: brandIdMap[brandB],
          coefficient,
        });
      }
    }
  }

  const { error: corrError } = await supabase
    .from("correlations")
    .upsert(correlations, {
      onConflict: "brand_a_id,brand_b_id,analysis_date",
    });
  if (corrError) {
    console.error("Error inserting correlations:", corrError);
  }
  console.log(`  Inserted ${correlations.length} correlation records\n`);

  // 4. 季節性データの投入
  console.log("4. Importing seasonality data...");
  const seasonalityRecords: Array<{
    brand_id: number;
    month: number;
    avg_score: number;
  }> = [];

  for (const [brand, scores] of Object.entries(SEASONALITY_DATA)) {
    scores.forEach((score, index) => {
      if (brandIdMap[brand]) {
        seasonalityRecords.push({
          brand_id: brandIdMap[brand],
          month: index + 1,
          avg_score: score,
        });
      }
    });
  }

  const { error: seasonError } = await supabase
    .from("seasonality")
    .upsert(seasonalityRecords, {
      onConflict: "brand_id,month,analysis_date",
    });
  if (seasonError) {
    console.error("Error inserting seasonality:", seasonError);
  }
  console.log(`  Inserted ${seasonalityRecords.length} seasonality records\n`);

  // 5. インサイトデータの投入
  console.log("5. Importing insights data...");
  const { error: insightsError } = await supabase
    .from("insights")
    .upsert(INSIGHTS, {
      onConflict: "id",
    });
  if (insightsError) {
    console.error("Error inserting insights:", insightsError);
  }
  console.log(`  Inserted ${INSIGHTS.length} insight records\n`);

  console.log("Seed process completed!");
}

main().catch(console.error);
