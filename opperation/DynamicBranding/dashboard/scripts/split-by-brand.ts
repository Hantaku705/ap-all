/**
 * SNSデータをブランド別に分割するスクリプト
 *
 * 入力: data/sns/processed/with_brands.csv
 * 出力: data/sns/by_brand/{ブランド名}.csv + brand_summary.json
 */

import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

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

const INSUFFICIENT_THRESHOLD = 100;

interface UGCRow {
  url: string;
  published: string;
  title: string;
  content: string;
  lang: string;
  source_type: string;
  "extra_author_attributes.name": string;
  brand_mentions: string;
  brand_count: string;
  is_multi_brand: string;
  content_length: string;
  has_negative_kw: string;
  source_category: string;
}

interface BrandStats {
  name: string;
  count: number;
  percentage: number;
  status: "sufficient" | "moderate" | "insufficient";
}

interface BrandSummary {
  generated_at: string;
  total_ugc: number;
  brands: BrandStats[];
  insufficient_brands: string[];
  threshold: number;
}

async function main() {
  const projectRoot = path.resolve(__dirname, "../..");
  const inputPath = path.join(projectRoot, "data/sns/processed/with_brands.csv");
  const outputDir = path.join(projectRoot, "data/sns/by_brand");

  // 出力ディレクトリ作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // CSVファイル読み込み
  console.log("📖 Reading CSV file...");
  const csvContent = fs.readFileSync(inputPath, "utf-8");
  const records: UGCRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`   Total records: ${records.length}`);

  // ブランド別にデータを分類
  const brandData: Map<string, UGCRow[]> = new Map();
  BRANDS.forEach((brand) => brandData.set(brand, []));

  for (const row of records) {
    const mentions = row.brand_mentions || "";
    for (const brand of BRANDS) {
      if (mentions.includes(brand)) {
        brandData.get(brand)!.push(row);
      }
    }
  }

  // ブランド別CSVを出力
  console.log("\n📝 Writing brand CSV files...");
  const brandStats: BrandStats[] = [];

  for (const brand of BRANDS) {
    const data = brandData.get(brand)!;
    const outputPath = path.join(outputDir, `${brand}.csv`);

    if (data.length > 0) {
      const csvOutput = stringify(data, { header: true });
      fs.writeFileSync(outputPath, csvOutput);
    } else {
      // 空の場合はヘッダーのみ
      const headers = Object.keys(records[0] || {}).join(",") + "\n";
      fs.writeFileSync(outputPath, headers);
    }

    // 統計情報を計算
    const percentage = (data.length / records.length) * 100;
    let status: "sufficient" | "moderate" | "insufficient";
    if (data.length >= 500) {
      status = "sufficient";
    } else if (data.length >= INSUFFICIENT_THRESHOLD) {
      status = "moderate";
    } else {
      status = "insufficient";
    }

    brandStats.push({
      name: brand,
      count: data.length,
      percentage: Math.round(percentage * 100) / 100,
      status,
    });

    const statusIcon = status === "sufficient" ? "✅" : status === "moderate" ? "⚠️" : "❌";
    console.log(`   ${statusIcon} ${brand}: ${data.length} records (${percentage.toFixed(1)}%)`);
  }

  // ブランド統計を件数順にソート
  brandStats.sort((a, b) => b.count - a.count);

  // サマリーJSONを出力
  const insufficientBrands = brandStats
    .filter((b) => b.status === "insufficient")
    .map((b) => b.name);

  const summary: BrandSummary = {
    generated_at: new Date().toISOString(),
    total_ugc: records.length,
    brands: brandStats,
    insufficient_brands: insufficientBrands,
    threshold: INSUFFICIENT_THRESHOLD,
  };

  const summaryPath = path.join(outputDir, "brand_summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`\n📊 Summary saved to: ${summaryPath}`);

  // サマリー表示
  console.log("\n" + "=".repeat(50));
  console.log("📈 BRAND UGC SUMMARY");
  console.log("=".repeat(50));
  console.log(`Total UGC: ${records.length}`);
  console.log(`Threshold for insufficient: < ${INSUFFICIENT_THRESHOLD}`);
  console.log("");

  if (insufficientBrands.length > 0) {
    console.log("⚠️  INSUFFICIENT BRANDS (need more UGC):");
    for (const brand of insufficientBrands) {
      const stats = brandStats.find((b) => b.name === brand)!;
      console.log(`   - ${brand}: ${stats.count} records`);
    }
  } else {
    console.log("✅ All brands have sufficient UGC data.");
  }

  console.log("\n✅ Done!");
}

main().catch(console.error);
