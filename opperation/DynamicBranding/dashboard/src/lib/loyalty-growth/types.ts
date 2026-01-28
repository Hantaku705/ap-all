/**
 * ロイヤリティ成長戦略の型定義
 */

// ============================================
// RPC関数からの戻り値型
// ============================================

export interface LoyaltyDistribution {
  sentiment: "positive" | "neutral" | "negative";
  count: number;
  percentage: number;
}

export interface TopicEngagement {
  sentiment: string;
  topic: string;
  avg_engagement: number;
  avg_likes: number;
  avg_retweets: number;
  avg_comments: number;
  post_count: number;
}

export interface WeeklyTrend {
  week_start: string;
  high_count: number;
  medium_count: number;
  low_count: number;
  total_count: number;
  high_percentage: number;
  medium_percentage: number;
  low_percentage: number;
}

export interface RepresentativePost {
  sentiment: string;
  id: number;
  content: string;
  topic: string | null;
  engagement_total: number;
  likes_count: number;
  retweets_count: number;
  url: string;
  published: string;
}

export interface TopicCorrelation {
  topic: string;
  total_posts: number;
  high_ratio: number;
  medium_ratio: number;
  low_ratio: number;
  overall_high_ratio: number;
  loyalty_correlation: number;
}

// ============================================
// LLM入力データ構造
// ============================================

export interface LoyaltyGrowthInput {
  // 現状分布
  distribution: {
    high: { count: number; percentage: number };
    medium: { count: number; percentage: number };
    low: { count: number; percentage: number };
    total: number;
  };

  // トピック×エンゲージメント（ロイヤリティ層別）
  topicEngagement: {
    high: { topic: string; avgEngagement: number; postCount: number }[];
    medium: { topic: string; avgEngagement: number; postCount: number }[];
    low: { topic: string; avgEngagement: number; postCount: number }[];
  };

  // 週次トレンド（直近24週）
  weeklyTrends: WeeklyTrend[];

  // 代表投稿（各層上位10件）
  representativePosts: {
    high: RepresentativePost[];
    medium: RepresentativePost[];
    low: RepresentativePost[];
  };

  // トピック×ロイヤリティ相関
  topicCorrelations: TopicCorrelation[];

  // 算出メトリクス
  calculatedMetrics: CalculatedMetrics;
}

export interface CalculatedMetrics {
  trendDirection: "improving" | "stable" | "declining";
  avgEngagementByLevel: { high: number; medium: number; low: number };
  topPerformingTopics: {
    topic: string;
    avgEngagement: number;
    loyaltyCorrelation: number;
  }[];
  estimatedConversionRates: {
    lowToMedium: number;
    mediumToHigh: number;
  };
  trendSlope: {
    high: number;
    medium: number;
    low: number;
  };
}

// ============================================
// LLM出力データ構造（既存LoyaltyGrowthResponseと互換）
// ============================================

export interface ConversionFunnel {
  fromLevel: "low" | "medium" | "high";
  toLevel: "medium" | "high" | "low";
  conversionRate: number;
  averageTimeToConvert: number;
  sampleSize: number;
  topTriggers: {
    type: "topic" | "event" | "content" | "engagement";
    name: string;
    description: string;
    impactScore: number;
    frequency: number;
  }[];
}

export interface BehavioralPattern {
  level: "high" | "medium" | "low";
  engagementMetrics: {
    avgPostFrequency: number;
    avgLikes: number;
    avgRetweets: number;
    avgReplies: number;
  };
  topicPreferences: {
    topic: string;
    topicLabel: string;
    engagementRate: number;
    loyaltyCorrelation: number;
  }[];
}

export interface GrowthTargets {
  currentDistribution: {
    high: { count: number; percentage: number };
    medium: { count: number; percentage: number };
    low: { count: number; percentage: number };
  };
  targetDistribution: {
    high: { percentage: number; targetDate: string };
    medium: { percentage: number };
    low: { percentage: number };
  };
  projectedTimeline: {
    date: string;
    highPercentage: number;
    mediumPercentage: number;
    lowPercentage: number;
    keyAction: string;
  }[];
}

export interface StrategyRecommendation {
  segment: string;
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: "low" | "medium" | "high";
  timeToResult: string;
  requiredResources: string[];
  kpis: {
    name: string;
    currentValue: number;
    targetValue: number;
    unit: string;
  }[];
}

export interface LoyaltyGrowthOutput {
  conversionFunnels: ConversionFunnel[];
  behavioralPatterns: BehavioralPattern[];
  growthTargets: GrowthTargets;
  recommendations: StrategyRecommendation[];
}

// ============================================
// APIレスポンス
// ============================================

export interface LoyaltyGrowthResponse extends LoyaltyGrowthOutput {
  generatedAt: string;
  cached: boolean;
  isFallback?: boolean;
  inputHash?: string;
}
