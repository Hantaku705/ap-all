/**
 * 株価データ取得スクリプト: Yahoo Finance → Supabase
 *
 * 機能:
 * - 味の素株式会社（2802.T）の株価を5年分取得
 * - Yahoo Finance APIを使用（無料、レート制限あり）
 * - Supabase stock_prices テーブルに保存
 *
 * 実行方法:
 * npx tsx scripts/fetch-stock-prices.ts
 *
 * オプション:
 * --years 3     # 過去3年分を取得（デフォルト: 5年）
 * --ticker 2802.T  # 銘柄コード（デフォルト: 2802.T）
 * --dry-run     # DB更新なし（確認用）
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

// .env.local を明示的に読み込み
config({ path: resolve(process.cwd(), ".env.local") });

// 環境変数チェック（\n文字を除去）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\\n/g, "").trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\\n/g, "").trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  console.error("Please set them in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// コマンドライン引数の解析
const args = process.argv.slice(2);
const yearArg = args.find((a) => a.startsWith("--years="));
const tickerArg = args.find((a) => a.startsWith("--ticker="));
const dryRun = args.includes("--dry-run");

const YEARS = yearArg ? parseInt(yearArg.split("=")[1]) : 5;
const TICKER = tickerArg ? tickerArg.split("=")[1] : "2802.T";

// Yahoo Finance API URL
function getYahooFinanceURL(ticker: string, period1: number, period2: number): string {
  return `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d&events=history`;
}

interface YahooFinanceResponse {
  chart: {
    result: {
      meta: {
        currency: string;
        symbol: string;
        regularMarketPrice: number;
      };
      timestamp: number[];
      indicators: {
        quote: {
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
        }[];
        adjclose?: {
          adjclose: number[];
        }[];
      };
    }[];
    error: {
      code: string;
      description: string;
    } | null;
  };
}

interface StockPriceRow {
  corporate_brand_id: number;
  date: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  adj_close: number;
  volume: number;
}

async function fetchStockPrices(ticker: string, years: number): Promise<StockPriceRow[]> {
  const now = Math.floor(Date.now() / 1000);
  const yearsAgo = now - years * 365 * 24 * 60 * 60;

  console.log(`Fetching ${ticker} stock prices for the last ${years} years...`);
  console.log(`Period: ${new Date(yearsAgo * 1000).toISOString().split("T")[0]} to ${new Date(now * 1000).toISOString().split("T")[0]}`);

  const url = getYahooFinanceURL(ticker, yearsAgo, now);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
  }

  const data: YahooFinanceResponse = await response.json();

  if (data.chart.error) {
    throw new Error(`Yahoo Finance error: ${data.chart.error.description}`);
  }

  const result = data.chart.result[0];
  if (!result || !result.timestamp || !result.indicators.quote[0]) {
    throw new Error("No data returned from Yahoo Finance");
  }

  const { timestamp, indicators } = result;
  const quote = indicators.quote[0];
  const adjclose = indicators.adjclose?.[0]?.adjclose;

  // コーポレートブランドIDを取得
  const { data: corpBrand, error: corpError } = await supabase
    .from("corporate_brands")
    .select("id")
    .eq("ticker_symbol", ticker)
    .single();

  if (corpError || !corpBrand) {
    throw new Error(`Corporate brand not found for ticker: ${ticker}`);
  }

  const corporateBrandId = corpBrand.id;

  const prices: StockPriceRow[] = [];
  for (let i = 0; i < timestamp.length; i++) {
    // NaN値をスキップ
    if (
      quote.open[i] == null ||
      quote.high[i] == null ||
      quote.low[i] == null ||
      quote.close[i] == null
    ) {
      continue;
    }

    const date = new Date(timestamp[i] * 1000).toISOString().split("T")[0];

    prices.push({
      corporate_brand_id: corporateBrandId,
      date,
      open_price: Math.round(quote.open[i] * 100) / 100,
      high_price: Math.round(quote.high[i] * 100) / 100,
      low_price: Math.round(quote.low[i] * 100) / 100,
      close_price: Math.round(quote.close[i] * 100) / 100,
      adj_close: adjclose ? Math.round(adjclose[i] * 100) / 100 : Math.round(quote.close[i] * 100) / 100,
      volume: Math.round(quote.volume[i] || 0),
    });
  }

  return prices;
}

async function saveStockPrices(prices: StockPriceRow[]): Promise<void> {
  console.log(`\nSaving ${prices.length} stock price records...`);

  // バッチでUPSERT（日付でON CONFLICT）
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < prices.length; i += BATCH_SIZE) {
    const batch = prices.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from("stock_prices")
      .upsert(batch as never, {
        onConflict: "corporate_brand_id,date",
      });

    if (error) {
      console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
      throw error;
    }

    inserted += batch.length;
    process.stdout.write(`\rProgress: ${inserted}/${prices.length} (${Math.round((inserted / prices.length) * 100)}%)`);
  }

  console.log(`\nSuccessfully saved ${inserted} records.`);
}

async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("Stock Price Fetcher - Yahoo Finance → Supabase");
  console.log("=".repeat(60));
  console.log(`Ticker: ${TICKER}`);
  console.log(`Years: ${YEARS}`);
  console.log(`Dry run: ${dryRun}`);
  console.log("=".repeat(60));

  try {
    // 株価データ取得
    const prices = await fetchStockPrices(TICKER, YEARS);

    console.log(`\nFetched ${prices.length} trading days.`);

    if (prices.length > 0) {
      console.log(`\nSample data (first 5 records):`);
      prices.slice(0, 5).forEach((p) => {
        console.log(`  ${p.date}: Open=${p.open_price}, Close=${p.close_price}, Volume=${p.volume.toLocaleString()}`);
      });

      console.log(`\nSample data (last 5 records):`);
      prices.slice(-5).forEach((p) => {
        console.log(`  ${p.date}: Open=${p.open_price}, Close=${p.close_price}, Volume=${p.volume.toLocaleString()}`);
      });

      // 統計情報
      const closes = prices.map((p) => p.close_price);
      const minPrice = Math.min(...closes);
      const maxPrice = Math.max(...closes);
      const avgPrice = closes.reduce((a, b) => a + b, 0) / closes.length;
      const latestPrice = closes[closes.length - 1];

      console.log(`\nStatistics:`);
      console.log(`  Min: ${minPrice.toFixed(2)}`);
      console.log(`  Max: ${maxPrice.toFixed(2)}`);
      console.log(`  Avg: ${avgPrice.toFixed(2)}`);
      console.log(`  Latest: ${latestPrice.toFixed(2)}`);

      if (!dryRun) {
        await saveStockPrices(prices);
      } else {
        console.log("\n[DRY RUN] Skipping database save.");
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("Done!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\nError:", error);
    process.exit(1);
  }
}

main();
