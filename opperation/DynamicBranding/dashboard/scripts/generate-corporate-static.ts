/**
 * コーポレート分析データ静的化スクリプト
 *
 * 現在のAPI出力をJSONファイルとして保存し、
 * APIがファイルから読み込むようにする
 *
 * 実行方法:
 * npx tsx scripts/generate-corporate-static.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import fs from "fs";
import path from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\\n/g, "").trim() || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\\n/g, "").trim() || "";

const supabase = createClient(supabaseUrl, supabaseKey);

const OUTPUT_DIR = path.resolve(process.cwd(), "output/corporate");

// 出力ディレクトリ作成
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateSummary(corpId: number) {
  console.log("Generating corporate summary...");

  // 1. コーポレートブランド情報
  const { data: corporate } = await supabase
    .from("corporate_brands")
    .select("*")
    .eq("id", corpId)
    .single();

  if (!corporate) {
    throw new Error("Corporate brand not found");
  }

  // 2. 製品ブランド階層
  const { data: hierarchy } = await supabase
    .from("brand_hierarchy")
    .select(`
      id,
      weight,
      category,
      product_brand_id,
      brands:product_brand_id (
        id,
        name
      )
    `)
    .eq("corporate_brand_id", corpId);

  // 3. 各ブランドの集計データ
  const productBrands = [];
  let totalMentions = 0;
  let totalPositiveCount = 0;
  let totalPostCount = 0;

  if (hierarchy && hierarchy.length > 0) {
    for (const h of hierarchy) {
      const brandData = h.brands as unknown;
      const brand = Array.isArray(brandData) ? brandData[0] : brandData;
      if (!brand || typeof brand !== "object" || !("id" in brand)) continue;
      const typedBrand = brand as { id: number; name: string };

      const { data: mentions } = await supabase
        .from("sns_mentions")
        .select("mention_count, share_percentage")
        .eq("brand_id", typedBrand.id)
        .single();

      const { data: sentiment } = await supabase
        .from("sns_sentiments")
        .select("positive_count, neutral_count, negative_count, total_count")
        .eq("brand_id", typedBrand.id)
        .single();

      const mentionCount = mentions?.mention_count ?? 0;
      const positiveCount = sentiment?.positive_count ?? 0;
      const totalCount = sentiment?.total_count ?? 0;
      const sentimentScore = totalCount > 0 ? positiveCount / totalCount : 0;

      productBrands.push({
        id: typedBrand.id,
        name: typedBrand.name,
        category: h.category ?? "other",
        weight: h.weight ?? 1.0,
        mention_count: mentionCount,
        sentiment_score: Math.round(sentimentScore * 100) / 100,
      });

      totalMentions += mentionCount;
      if (sentiment) {
        totalPositiveCount += positiveCount;
        totalPostCount += totalCount;
      }
    }
  }

  // 4. 集計メトリクス
  const avgSentiment = totalPostCount > 0 ? totalPositiveCount / totalPostCount : 0;
  const positiveRate = totalPostCount > 0 ? (totalPositiveCount / totalPostCount) * 100 : 0;

  // CEPカバレッジ
  const { data: cepCoverage } = await supabase
    .from("brand_ceps")
    .select("cep_id")
    .in("brand_id", productBrands.map(b => b.id));

  const uniqueCEPs = new Set(cepCoverage?.map(c => c.cep_id) ?? []);

  // 5. 最新株価
  const { data: latestStock } = await supabase
    .from("stock_prices")
    .select("date, close_price, volume")
    .eq("corporate_brand_id", corpId)
    .order("date", { ascending: false })
    .limit(2);

  let latestStockPoint = null;
  if (latestStock && latestStock.length > 0) {
    const change = latestStock.length > 1
      ? ((latestStock[0].close_price - latestStock[1].close_price) / latestStock[1].close_price) * 100
      : 0;
    latestStockPoint = {
      date: latestStock[0].date,
      close: latestStock[0].close_price,
      volume: latestStock[0].volume,
      change: Math.round(change * 100) / 100,
    };
  }

  const summary = {
    corporate: {
      id: corporate.id,
      name: corporate.name,
      ticker_symbol: corporate.ticker_symbol,
      english_name: corporate.english_name,
      founded_year: corporate.founded_year,
      headquarters: corporate.headquarters,
      industry: corporate.industry,
      logo_url: corporate.logo_url,
    },
    product_brands: productBrands,
    aggregated_metrics: {
      total_mentions: totalMentions,
      avg_sentiment: Math.round(avgSentiment * 100) / 100,
      positive_rate: Math.round(positiveRate * 10) / 10,
      cep_coverage: uniqueCEPs.size,
    },
    latest_stock: latestStockPoint,
    best_correlation: null,
    generated_at: new Date().toISOString(),
  };

  const filePath = path.join(OUTPUT_DIR, `${corpId}-summary.json`);
  fs.writeFileSync(filePath, JSON.stringify(summary, null, 2));
  console.log(`  Saved: ${filePath}`);

  return summary;
}

async function generateStock(corpId: number) {
  console.log("Generating stock data...");

  // 全株価データ取得
  const PAGE_SIZE = 1000;
  let offset = 0;
  let hasMore = true;
  const allPrices: Array<{
    date: string;
    close_price: number;
    volume: number;
  }> = [];

  while (hasMore) {
    const { data } = await supabase
      .from("stock_prices")
      .select("date, close_price, volume")
      .eq("corporate_brand_id", corpId)
      .order("date", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (data && data.length > 0) {
      allPrices.push(...data);
      offset += PAGE_SIZE;
    }
    hasMore = !!(data && data.length === PAGE_SIZE);
  }

  // 日次変化率を計算
  const prices = allPrices.map((p, i) => {
    const prevClose = i > 0 ? allPrices[i - 1].close_price : p.close_price;
    const change = ((p.close_price - prevClose) / prevClose) * 100;
    return {
      date: p.date,
      close: p.close_price,
      volume: p.volume,
      change: Math.round(change * 100) / 100,
    };
  });

  // サマリー計算
  const closes = prices.map(p => p.close);
  const volumes = prices.map(p => p.volume);
  const latest = prices[prices.length - 1];
  const weekAgo = prices[prices.length - 6];
  const monthAgo = prices[prices.length - 22];
  const yearAgo = prices[prices.length - 252];

  const summary = {
    latest_price: latest?.close ?? 0,
    change_1d: latest?.change ?? 0,
    change_1w: weekAgo ? Math.round(((latest.close - weekAgo.close) / weekAgo.close) * 10000) / 100 : 0,
    change_1m: monthAgo ? Math.round(((latest.close - monthAgo.close) / monthAgo.close) * 10000) / 100 : 0,
    change_1y: yearAgo ? Math.round(((latest.close - yearAgo.close) / yearAgo.close) * 10000) / 100 : 0,
    volume_avg: Math.round(volumes.reduce((a, b) => a + b, 0) / volumes.length),
  };

  // ティッカー取得
  const { data: corp } = await supabase
    .from("corporate_brands")
    .select("ticker_symbol")
    .eq("id", corpId)
    .single();

  const stockData = {
    prices,
    ticker: corp?.ticker_symbol ?? "2802.T",
    period: {
      start: prices[0]?.date ?? "",
      end: latest?.date ?? "",
    },
    summary,
    generated_at: new Date().toISOString(),
  };

  const filePath = path.join(OUTPUT_DIR, `${corpId}-stock.json`);
  fs.writeFileSync(filePath, JSON.stringify(stockData, null, 2));
  console.log(`  Saved: ${filePath} (${prices.length} days)`);

  return stockData;
}

async function generateMVV(corpId: number) {
  console.log("Generating MVV data (calling API for LLM generation)...");

  // ローカルAPIを呼び出してLLM生成結果を取得
  try {
    const res = await fetch(`http://localhost:3001/api/corporate/${corpId}/mvv`);
    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }
    const data = await res.json();

    const mvvData = {
      ...data,
      generated_at: new Date().toISOString(),
    };

    const filePath = path.join(OUTPUT_DIR, `${corpId}-mvv.json`);
    fs.writeFileSync(filePath, JSON.stringify(mvvData, null, 2));
    console.log(`  Saved: ${filePath}`);

    return mvvData;
  } catch (error) {
    console.error("  Failed to generate MVV:", error);
    return null;
  }
}

async function generateFans(corpId: number) {
  console.log("Generating fans data (calling API for LLM generation)...");

  try {
    const res = await fetch(`http://localhost:3001/api/corporate/${corpId}/fans`);
    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }
    const data = await res.json();

    const fansData = {
      ...data,
      generated_at: new Date().toISOString(),
    };

    const filePath = path.join(OUTPUT_DIR, `${corpId}-fans.json`);
    fs.writeFileSync(filePath, JSON.stringify(fansData, null, 2));
    console.log(`  Saved: ${filePath}`);

    return fansData;
  } catch (error) {
    console.error("  Failed to generate fans:", error);
    return null;
  }
}

async function generateCorrelation(corpId: number) {
  console.log("Generating correlation data (calling API)...");

  try {
    const res = await fetch(`http://localhost:3001/api/corporate/${corpId}/stock/correlation`);
    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }
    const data = await res.json();

    const correlationData = {
      ...data,
      generated_at: new Date().toISOString(),
    };

    const filePath = path.join(OUTPUT_DIR, `${corpId}-correlation.json`);
    fs.writeFileSync(filePath, JSON.stringify(correlationData, null, 2));
    console.log(`  Saved: ${filePath}`);

    return correlationData;
  } catch (error) {
    console.error("  Failed to generate correlation:", error);
    return null;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("Corporate Static Data Generator");
  console.log("=".repeat(60));

  const corpId = 1; // 味の素株式会社

  // 1. Summary（Supabaseから直接）
  await generateSummary(corpId);

  // 2. Stock（Supabaseから直接）
  await generateStock(corpId);

  // 3. MVV（APIから - LLM生成済みキャッシュ利用）
  await generateMVV(corpId);

  // 4. Fans（APIから - LLM生成済みキャッシュ利用）
  await generateFans(corpId);

  // 5. Correlation（APIから）
  await generateCorrelation(corpId);

  console.log("");
  console.log("=".repeat(60));
  console.log("Done! Static files saved to:", OUTPUT_DIR);
  console.log("=".repeat(60));
}

main().catch(console.error);
