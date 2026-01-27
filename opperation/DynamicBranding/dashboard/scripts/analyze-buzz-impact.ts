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
  change: number;
}

interface BuzzPost {
  published: string;
  content: string;
  engagement_total: number;
  sentiment: string | null;
  corporate_topic: string | null;
  url: string | null;
}

interface Coherence {
  isCoherent: boolean;
  coherenceScore: number;
  coherenceLabel: string;
}

interface BuzzImpact {
  post: BuzzPost;
  postDate: string;
  nextTradingDay: string | null;
  stockChange: number | null;
  impact: "high" | "medium" | "low" | "none";
  impactLabel: string;
  coherence: Coherence;
  reliabilityScore: number;
  reliabilityLabel: string;
}

// 整合性チェック関数
function calculateCoherence(
  sentiment: string | null,
  stockChange: number | null
): Coherence {
  if (stockChange === null) {
    return { isCoherent: false, coherenceScore: 0, coherenceLabel: "データなし" };
  }

  const isUp = stockChange >= 0;

  // neutralは整合性判定不能
  if (!sentiment || sentiment === "neutral") {
    return {
      isCoherent: false,
      coherenceScore: 50,
      coherenceLabel: "⚠️ 中立（判定不能）",
    };
  }

  // positive + 上昇 または negative + 下落 = 整合
  const isCoherent =
    (sentiment === "positive" && isUp) ||
    (sentiment === "negative" && !isUp);

  return {
    isCoherent,
    coherenceScore: isCoherent ? 100 : 20,
    coherenceLabel: isCoherent ? "✅ 整合" : "❌ 矛盾",
  };
}

// 信頼度スコア計算
function calculateReliabilityScore(
  impact: string,
  coherenceScore: number,
  engagement: number
): { score: number; label: string } {
  const baseScore =
    impact === "high" ? 60 :
    impact === "medium" ? 40 : 20;

  const coherenceMultiplier = coherenceScore / 100;

  const engagementMultiplier =
    engagement >= 1000 ? 1.2 :
    engagement >= 500 ? 1.0 : 0.8;

  const score = Math.round(baseScore * coherenceMultiplier * engagementMultiplier);

  const label =
    score >= 70 ? "高信頼" :
    score >= 40 ? "中信頼" : "低信頼";

  return { score, label };
}

async function analyze() {
  // 1. 株価データを読み込み
  const stockJson = JSON.parse(fs.readFileSync("output/corporate/1-stock.json", "utf-8"));
  const stockPrices: StockPrice[] = stockJson.prices;

  // 株価データをMapに変換（日付→データ）
  const stockMap = new Map<string, StockPrice>();
  for (const price of stockPrices) {
    stockMap.set(price.date, price);
  }

  // 2. バズ投稿を取得（ENG >= 100）
  const BUZZ_THRESHOLD = 100;
  const { data: buzzPosts, error } = await supabase
    .from("sns_posts")
    .select("published, content, engagement_total, sentiment, corporate_topic, url")
    .eq("is_corporate", true)
    .gte("engagement_total", BUZZ_THRESHOLD)
    .order("engagement_total", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching buzz posts:", error.message);
    return;
  }

  console.log("=== バズ投稿 → 株価影響分析 ===");
  console.log(`バズ閾値: ENG >= ${BUZZ_THRESHOLD}`);
  console.log(`バズ投稿数: ${buzzPosts?.length || 0}件`);
  console.log("");

  if (!buzzPosts || buzzPosts.length === 0) {
    console.log("バズ投稿がありません");
    return;
  }

  // 3. 各バズ投稿の翌営業日の株価変動を確認
  const impacts: BuzzImpact[] = [];

  for (const post of buzzPosts) {
    const postDate = new Date(post.published);
    const postDateStr = postDate.toISOString().split("T")[0];

    // 翌営業日を探す（最大5日先まで）
    let nextTradingDay: string | null = null;
    let stockChange: number | null = null;

    for (let i = 1; i <= 5; i++) {
      const checkDate = new Date(postDate);
      checkDate.setDate(checkDate.getDate() + i);
      const checkDateStr = checkDate.toISOString().split("T")[0];

      if (stockMap.has(checkDateStr)) {
        nextTradingDay = checkDateStr;
        stockChange = stockMap.get(checkDateStr)!.change;
        break;
      }
    }

    // 影響度を判定
    let impact: "high" | "medium" | "low" | "none" = "none";
    let impactLabel = "データなし";

    if (stockChange !== null) {
      const absChange = Math.abs(stockChange);
      if (absChange >= 3) {
        impact = "high";
        impactLabel = stockChange >= 0 ? "📈 大幅上昇" : "📉 大幅下落";
      } else if (absChange >= 1.5) {
        impact = "medium";
        impactLabel = stockChange >= 0 ? "↗️ 上昇" : "↘️ 下落";
      } else {
        impact = "low";
        impactLabel = "→ 横ばい";
      }
    }

    // 整合性と信頼度を計算
    const coherence = calculateCoherence(post.sentiment, stockChange);
    const { score: reliabilityScore, label: reliabilityLabel } = calculateReliabilityScore(
      impact,
      coherence.coherenceScore,
      post.engagement_total
    );

    impacts.push({
      post,
      postDate: postDateStr,
      nextTradingDay,
      stockChange,
      impact,
      impactLabel,
      coherence,
      reliabilityScore,
      reliabilityLabel,
    });
  }

  // 4. 結果を出力（整合性優先 → 信頼度 → 株価変動）
  const sortedImpacts = impacts
    .filter((i) => i.stockChange !== null)
    .sort((a, b) => {
      // 1. 整合性優先（整合 > 中立 > 矛盾）
      const coherenceOrder = (c: number) => c === 100 ? 0 : c === 50 ? 1 : 2;
      const coherenceA = coherenceOrder(a.coherence.coherenceScore);
      const coherenceB = coherenceOrder(b.coherence.coherenceScore);
      if (coherenceA !== coherenceB) return coherenceA - coherenceB;

      // 2. 信頼度スコア（高い順）
      if (a.reliabilityScore !== b.reliabilityScore) {
        return b.reliabilityScore - a.reliabilityScore;
      }

      // 3. 株価変動絶対値（フォールバック）
      return Math.abs(b.stockChange!) - Math.abs(a.stockChange!);
    });

  console.log("=== 株価影響が大きかったバズ投稿 TOP 15 ===\n");

  for (const item of sortedImpacts.slice(0, 15)) {
    const changeSign = (item.stockChange ?? 0) >= 0 ? "+" : "";
    const contentPreview = (item.post.content || "").substring(0, 50).replace(/\n/g, " ");
    const sentiment = item.post.sentiment || "neutral";
    const sentimentMark = sentiment === "positive" ? "😊" : sentiment === "negative" ? "😠" : "😐";

    console.log(`${item.impactLabel}【投稿日: ${item.postDate}】${item.coherence.coherenceLabel}`);
    console.log(`  ENG: ${item.post.engagement_total} | ${sentimentMark} ${sentiment} | 信頼度: ${item.reliabilityScore}（${item.reliabilityLabel}）`);
    console.log(`  内容: ${contentPreview}...`);
    console.log(`  → 翌営業日(${item.nextTradingDay}): 株価 ${changeSign}${item.stockChange?.toFixed(2)}%`);
    console.log("");
  }

  // 5. 統計サマリー
  const highImpact = sortedImpacts.filter((i) => i.impact === "high").length;
  const mediumImpact = sortedImpacts.filter((i) => i.impact === "medium").length;
  const lowImpact = sortedImpacts.filter((i) => i.impact === "low").length;

  // 整合性統計
  const coherentCount = sortedImpacts.filter((i) => i.coherence.isCoherent).length;
  const incoherentCount = sortedImpacts.filter((i) => i.coherence.coherenceScore === 20).length;
  const neutralCount = sortedImpacts.filter((i) => i.coherence.coherenceScore === 50).length;

  // 信頼度統計
  const highReliability = sortedImpacts.filter((i) => i.reliabilityScore >= 70).length;
  const mediumReliability = sortedImpacts.filter((i) => i.reliabilityScore >= 40 && i.reliabilityScore < 70).length;
  const lowReliability = sortedImpacts.filter((i) => i.reliabilityScore < 40).length;

  console.log("=== 統計サマリー ===");
  console.log(`バズ投稿数: ${buzzPosts.length}件（ENG >= ${BUZZ_THRESHOLD}）`);
  console.log(`  高影響（±3%以上）: ${highImpact}件 (${((highImpact / sortedImpacts.length) * 100).toFixed(1)}%)`);
  console.log(`  中影響（±1.5%以上）: ${mediumImpact}件`);
  console.log(`  低影響（横ばい）: ${lowImpact}件`);
  console.log("");
  console.log("=== 整合性チェック ===");
  console.log(`  ✅ 整合（センチメント×株価一致）: ${coherentCount}件`);
  console.log(`  ❌ 矛盾（センチメント×株価不一致）: ${incoherentCount}件`);
  console.log(`  ⚠️ 中立（判定不能）: ${neutralCount}件`);
  console.log("");
  console.log("=== 信頼度分布 ===");
  console.log(`  高信頼（70+）: ${highReliability}件`);
  console.log(`  中信頼（40-69）: ${mediumReliability}件`);
  console.log(`  低信頼（0-39）: ${lowReliability}件`);

  // 6. JSONファイルに出力（UIで使用）
  const outputData = {
    threshold: BUZZ_THRESHOLD,
    totalBuzzPosts: buzzPosts.length,
    analyzedPosts: sortedImpacts.length,
    summary: {
      highImpact,
      mediumImpact,
      lowImpact,
      highImpactRate: sortedImpacts.length > 0 ? (highImpact / sortedImpacts.length) * 100 : 0,
      coherentCount,
      incoherentCount,
      neutralCount,
      highReliability,
      mediumReliability,
      lowReliability,
    },
    impacts: sortedImpacts.map((item) => ({
      postDate: item.postDate,
      engagement: item.post.engagement_total,
      sentiment: item.post.sentiment,
      content: (item.post.content || "").substring(0, 100),
      topic: item.post.corporate_topic,
      url: item.post.url,
      nextTradingDay: item.nextTradingDay,
      stockChange: item.stockChange,
      impact: item.impact,
      impactLabel: item.impactLabel,
      coherence: item.coherence,
      reliabilityScore: item.reliabilityScore,
      reliabilityLabel: item.reliabilityLabel,
    })),
  };

  fs.writeFileSync("output/corporate/1-buzz-impact.json", JSON.stringify(outputData, null, 2));
  console.log("\n出力: output/corporate/1-buzz-impact.json");
}

analyze();
