import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StockPrice {
  date: string;
  close: number;
  volume: number;
  change: number;
}

async function analyze() {
  // 1. 静的ファイルから株価データを読み込み
  const stockJson = JSON.parse(fs.readFileSync("output/corporate/1-stock.json", "utf-8"));
  const stockPrices: StockPrice[] = stockJson.prices;

  // 2. 大幅変動日を特定（±3%以上、2024年以降のみ）
  const bigMoves = stockPrices.filter((s) =>
    Math.abs(s.change) >= 3 && s.date >= "2024-01-01"
  );

  console.log("=== 株価大幅変動日（±3%以上）===");
  console.log(`件数: ${bigMoves.length}件（全${stockPrices.length}日中）`);
  console.log("");

  if (bigMoves.length === 0) {
    console.log("大幅変動日がありません");
    return;
  }

  // 3. 各変動日の前後3日間のUGCを確認
  for (const stock of bigMoves.slice(0, 15)) {
    const stockDate = new Date(stock.date);
    const startDate = new Date(stockDate);
    startDate.setDate(startDate.getDate() - 3);
    const endDate = new Date(stockDate);
    endDate.setDate(endDate.getDate() + 3);

    const { data: ugcData } = await supabase
      .from("sns_posts")
      .select("published, content, sentiment, engagement_total, corporate_topic")
      .eq("is_corporate", true)
      .gte("published", startDate.toISOString())
      .lte("published", endDate.toISOString())
      .order("engagement_total", { ascending: false })
      .limit(5);

    const changeSign = stock.change >= 0 ? "+" : "";
    const direction = stock.change >= 0 ? "📈" : "📉";
    console.log(`${direction}【${stock.date}】株価: ¥${stock.close.toLocaleString()} (${changeSign}${stock.change.toFixed(2)}%)`);
    console.log(`  前後3日間のUGC: ${ugcData?.length || 0}件`);

    if (ugcData && ugcData.length > 0) {
      for (const ugc of ugcData.slice(0, 3)) {
        const sentiment = ugc.sentiment || "neutral";
        const sentimentMark = sentiment === "positive" ? "😊" : sentiment === "negative" ? "😠" : "😐";
        const text = (ugc.content || "").substring(0, 60).replace(/\n/g, " ");
        console.log(`    ${sentimentMark} [ENG:${ugc.engagement_total || 0}] ${text}...`);
      }
    } else {
      console.log("    (UGCなし)");
    }
    console.log("");
  }
}

analyze();
