/**
 * Loyalty Growth Metrics Calculator
 *
 * 生データから戦略に必要なメトリクスを算出
 */

import type {
  LoyaltyGrowthInput,
  CalculatedMetrics,
  WeeklyTrend,
  TopicCorrelation,
} from "./types";
import type { LoyaltyGrowthRawData } from "./data-fetcher";
import {
  groupPostsByLoyalty,
  groupEngagementByLoyalty,
} from "./data-fetcher";

// ============================================
// Main Transformation Function
// ============================================

/**
 * Transform raw data into LLM input format
 */
export function transformToLLMInput(rawData: LoyaltyGrowthRawData): LoyaltyGrowthInput {
  // Calculate distribution summary
  const distribution = calculateDistribution(rawData.distribution);

  // Group topic engagement by loyalty
  const topicEngagement = groupEngagementByLoyalty(rawData.topicEngagement);

  // Weekly trends (already in correct format)
  const weeklyTrends = rawData.weeklyTrends;

  // Group representative posts
  const representativePosts = groupPostsByLoyalty(rawData.representativePosts);

  // Topic correlations
  const topicCorrelations = rawData.topicCorrelations;

  // Calculate metrics
  const calculatedMetrics = calculateMetrics(
    rawData.distribution,
    rawData.topicEngagement,
    rawData.weeklyTrends,
    rawData.topicCorrelations
  );

  return {
    distribution,
    topicEngagement,
    weeklyTrends,
    representativePosts,
    topicCorrelations,
    calculatedMetrics,
  };
}

// ============================================
// Distribution Calculation
// ============================================

function calculateDistribution(distribution: LoyaltyGrowthRawData["distribution"]): LoyaltyGrowthInput["distribution"] {
  const high = distribution.find((d) => d.sentiment === "positive") || {
    count: 0,
    percentage: 0,
  };
  const medium = distribution.find((d) => d.sentiment === "neutral") || {
    count: 0,
    percentage: 0,
  };
  const low = distribution.find((d) => d.sentiment === "negative") || {
    count: 0,
    percentage: 0,
  };

  const total = high.count + medium.count + low.count;

  return {
    high: { count: high.count, percentage: high.percentage },
    medium: { count: medium.count, percentage: medium.percentage },
    low: { count: low.count, percentage: low.percentage },
    total,
  };
}

// ============================================
// Metrics Calculation
// ============================================

function calculateMetrics(
  distribution: LoyaltyGrowthRawData["distribution"],
  engagement: LoyaltyGrowthRawData["topicEngagement"],
  weeklyTrends: WeeklyTrend[],
  topicCorrelations: TopicCorrelation[]
): CalculatedMetrics {
  // Calculate trend direction and slope
  const { direction: trendDirection, slope: trendSlope } =
    calculateTrendDirection(weeklyTrends);

  // Calculate average engagement by level
  const avgEngagementByLevel = calculateAvgEngagementByLevel(engagement);

  // Identify top performing topics
  const topPerformingTopics = identifyTopPerformingTopics(
    engagement,
    topicCorrelations
  );

  // Estimate conversion rates from trend data
  const estimatedConversionRates = estimateConversionRates(weeklyTrends);

  return {
    trendDirection,
    avgEngagementByLevel,
    topPerformingTopics,
    estimatedConversionRates,
    trendSlope,
  };
}

// ============================================
// Trend Analysis
// ============================================

interface TrendAnalysis {
  direction: "improving" | "stable" | "declining";
  slope: { high: number; medium: number; low: number };
}

function calculateTrendDirection(weeklyTrends: WeeklyTrend[]): TrendAnalysis {
  if (weeklyTrends.length < 4) {
    return {
      direction: "stable",
      slope: { high: 0, medium: 0, low: 0 },
    };
  }

  // Take last 12 weeks for analysis
  const recentWeeks = weeklyTrends.slice(-12);

  // Calculate linear regression slope for high percentage
  const highSlope = calculateSlope(
    recentWeeks.map((w) => w.high_percentage)
  );
  const mediumSlope = calculateSlope(
    recentWeeks.map((w) => w.medium_percentage)
  );
  const lowSlope = calculateSlope(
    recentWeeks.map((w) => w.low_percentage)
  );

  // Determine overall direction based on high loyalty trend
  // Threshold: ±0.3% per week is considered stable
  let direction: "improving" | "stable" | "declining";
  if (highSlope > 0.3) {
    direction = "improving";
  } else if (highSlope < -0.3) {
    direction = "declining";
  } else {
    direction = "stable";
  }

  return {
    direction,
    slope: {
      high: roundToDecimal(highSlope, 2),
      medium: roundToDecimal(mediumSlope, 2),
      low: roundToDecimal(lowSlope, 2),
    },
  };
}

/**
 * Calculate linear regression slope
 */
function calculateSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0;

  return (n * sumXY - sumX * sumY) / denominator;
}

// ============================================
// Engagement Analysis
// ============================================

function calculateAvgEngagementByLevel(
  engagement: LoyaltyGrowthRawData["topicEngagement"]
): { high: number; medium: number; low: number } {
  const byLevel = {
    high: [] as number[],
    medium: [] as number[],
    low: [] as number[],
  };

  for (const item of engagement) {
    const level =
      item.sentiment === "positive"
        ? "high"
        : item.sentiment === "negative"
          ? "low"
          : "medium";
    byLevel[level].push(item.avg_engagement);
  }

  return {
    high: calculateAverage(byLevel.high),
    medium: calculateAverage(byLevel.medium),
    low: calculateAverage(byLevel.low),
  };
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return roundToDecimal(sum / values.length, 1);
}

// ============================================
// Topic Analysis
// ============================================

function identifyTopPerformingTopics(
  engagement: LoyaltyGrowthRawData["topicEngagement"],
  correlations: TopicCorrelation[]
): { topic: string; avgEngagement: number; loyaltyCorrelation: number }[] {
  // Create correlation map for quick lookup
  const correlationMap = new Map<string, number>();
  for (const c of correlations) {
    correlationMap.set(c.topic, c.loyalty_correlation);
  }

  // Get high loyalty topics with engagement
  const highLoyaltyTopics = engagement
    .filter((e) => e.sentiment === "positive")
    .map((e) => ({
      topic: e.topic,
      avgEngagement: e.avg_engagement,
      loyaltyCorrelation: correlationMap.get(e.topic) || 0,
    }));

  // Sort by combined score (engagement * correlation)
  return highLoyaltyTopics
    .sort((a, b) => {
      const scoreA = a.avgEngagement * (1 + a.loyaltyCorrelation);
      const scoreB = b.avgEngagement * (1 + b.loyaltyCorrelation);
      return scoreB - scoreA;
    })
    .slice(0, 5)
    .map((t) => ({
      topic: t.topic,
      avgEngagement: roundToDecimal(t.avgEngagement, 1),
      loyaltyCorrelation: roundToDecimal(t.loyaltyCorrelation, 3),
    }));
}

// ============================================
// Conversion Rate Estimation
// ============================================

function estimateConversionRates(weeklyTrends: WeeklyTrend[]): {
  lowToMedium: number;
  mediumToHigh: number;
} {
  if (weeklyTrends.length < 8) {
    return { lowToMedium: 5, mediumToHigh: 3 };
  }

  // Compare first half vs second half
  const midpoint = Math.floor(weeklyTrends.length / 2);
  const firstHalf = weeklyTrends.slice(0, midpoint);
  const secondHalf = weeklyTrends.slice(midpoint);

  const firstHighAvg = calculateAverage(firstHalf.map((w) => w.high_percentage));
  const secondHighAvg = calculateAverage(secondHalf.map((w) => w.high_percentage));

  const firstMediumAvg = calculateAverage(firstHalf.map((w) => w.medium_percentage));
  const secondMediumAvg = calculateAverage(secondHalf.map((w) => w.medium_percentage));

  const firstLowAvg = calculateAverage(firstHalf.map((w) => w.low_percentage));
  const secondLowAvg = calculateAverage(secondHalf.map((w) => w.low_percentage));

  // Estimate conversion rates based on percentage changes
  // If high increased and low decreased, some conversion happened
  const lowDecrease = firstLowAvg - secondLowAvg;
  const mediumChange = secondMediumAvg - firstMediumAvg;
  const highIncrease = secondHighAvg - firstHighAvg;

  // Simple estimation: conversion rate ≈ percentage point change / 4 weeks
  // Clamped between 1% and 15%
  const lowToMedium = clamp(Math.abs(lowDecrease) / 2, 1, 15);
  const mediumToHigh = clamp(Math.abs(highIncrease) / 2, 1, 15);

  return {
    lowToMedium: roundToDecimal(lowToMedium, 1),
    mediumToHigh: roundToDecimal(mediumToHigh, 1),
  };
}

// ============================================
// Utility Functions
// ============================================

function roundToDecimal(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ============================================
// Input Hash for Caching
// ============================================

/**
 * Generate a hash of the input data for cache validation
 */
export function generateInputHash(input: LoyaltyGrowthInput): string {
  // Create a simplified signature of the input
  const signature = {
    distributionTotal: input.distribution.total,
    highPercentage: input.distribution.high.percentage,
    trendDirection: input.calculatedMetrics.trendDirection,
    topTopics: input.calculatedMetrics.topPerformingTopics
      .slice(0, 3)
      .map((t) => t.topic)
      .join(","),
    weekCount: input.weeklyTrends.length,
    lastWeek: input.weeklyTrends[input.weeklyTrends.length - 1]?.week_start || "",
  };

  // Simple hash based on stringified signature
  const str = JSON.stringify(signature);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// ============================================
// Format for LLM Prompt
// ============================================

/**
 * Format input data for LLM prompt
 */
export function formatInputForPrompt(input: LoyaltyGrowthInput): string {
  const lines: string[] = [];

  // Distribution summary
  lines.push("## 現状のロイヤリティ分布");
  lines.push(`- 高ロイヤリティ（positive）: ${input.distribution.high.count}件 (${input.distribution.high.percentage}%)`);
  lines.push(`- 中ロイヤリティ（neutral）: ${input.distribution.medium.count}件 (${input.distribution.medium.percentage}%)`);
  lines.push(`- 低ロイヤリティ（negative）: ${input.distribution.low.count}件 (${input.distribution.low.percentage}%)`);
  lines.push(`- 合計: ${input.distribution.total}件`);
  lines.push("");

  // Trend analysis
  lines.push("## トレンド分析");
  lines.push(`- 傾向: ${input.calculatedMetrics.trendDirection}`);
  lines.push(`- 高ロイヤリティ傾き: ${input.calculatedMetrics.trendSlope.high}%/週`);
  lines.push(`- 推定転換率（低→中）: ${input.calculatedMetrics.estimatedConversionRates.lowToMedium}%`);
  lines.push(`- 推定転換率（中→高）: ${input.calculatedMetrics.estimatedConversionRates.mediumToHigh}%`);
  lines.push("");

  // Top topics
  lines.push("## 高パフォーマンストピック");
  for (const topic of input.calculatedMetrics.topPerformingTopics) {
    lines.push(`- ${topic.topic}: ENG=${topic.avgEngagement}, 相関=${topic.loyaltyCorrelation}`);
  }
  lines.push("");

  // Average engagement by level
  lines.push("## 平均エンゲージメント（レベル別）");
  lines.push(`- 高ロイヤリティ: ${input.calculatedMetrics.avgEngagementByLevel.high}`);
  lines.push(`- 中ロイヤリティ: ${input.calculatedMetrics.avgEngagementByLevel.medium}`);
  lines.push(`- 低ロイヤリティ: ${input.calculatedMetrics.avgEngagementByLevel.low}`);
  lines.push("");

  // Representative posts
  lines.push("## 代表投稿（各レベル上位）");
  lines.push("### 高ロイヤリティ");
  for (const post of input.representativePosts.high.slice(0, 3)) {
    const content = post.content.length > 100
      ? post.content.substring(0, 100) + "..."
      : post.content;
    lines.push(`- [ENG:${post.engagement_total}] 「${content}」`);
  }
  lines.push("### 低ロイヤリティ");
  for (const post of input.representativePosts.low.slice(0, 3)) {
    const content = post.content.length > 100
      ? post.content.substring(0, 100) + "..."
      : post.content;
    lines.push(`- [ENG:${post.engagement_total}] 「${content}」`);
  }
  lines.push("");

  // Topic correlations
  lines.push("## トピック×ロイヤリティ相関");
  for (const corr of input.topicCorrelations.slice(0, 5)) {
    lines.push(`- ${corr.topic}: 高=${corr.high_ratio}%, 相関=${corr.loyalty_correlation}`);
  }

  return lines.join("\n");
}
