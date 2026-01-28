/**
 * Loyalty Growth Data Fetcher
 *
 * SNS投稿データからロイヤリティ成長戦略に必要なデータを取得
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  LoyaltyDistribution,
  TopicEngagement,
  WeeklyTrend,
  RepresentativePost,
  TopicCorrelation,
} from "./types";

// Lazy initialization of Supabase client
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are required"
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}

// ============================================
// Individual RPC Functions
// ============================================

/**
 * Get loyalty distribution (sentiment-based)
 * positive = high, neutral = medium, negative = low
 */
export async function fetchLoyaltyDistribution(): Promise<LoyaltyDistribution[]> {
  const { data, error } = await getSupabase().rpc(
    "get_corporate_loyalty_distribution"
  );

  if (error) {
    console.error("Error fetching loyalty distribution:", error);
    return [];
  }

  return (data || []).map(
    (row: { sentiment: string; count: number; percentage: number }) => ({
      sentiment: row.sentiment as "positive" | "neutral" | "negative",
      count: Number(row.count),
      percentage: Number(row.percentage),
    })
  );
}

/**
 * Get topic engagement by loyalty level
 */
export async function fetchTopicEngagementByLoyalty(): Promise<TopicEngagement[]> {
  const { data, error } = await getSupabase().rpc(
    "get_topic_engagement_by_loyalty"
  );

  if (error) {
    console.error("Error fetching topic engagement:", error);
    return [];
  }

  return (data || []).map(
    (row: {
      sentiment: string;
      topic: string;
      avg_engagement: number;
      avg_likes: number;
      avg_retweets: number;
      avg_comments: number;
      post_count: number;
    }) => ({
      sentiment: row.sentiment,
      topic: row.topic,
      avg_engagement: Number(row.avg_engagement),
      avg_likes: Number(row.avg_likes),
      avg_retweets: Number(row.avg_retweets),
      avg_comments: Number(row.avg_comments),
      post_count: Number(row.post_count),
    })
  );
}

/**
 * Get weekly loyalty trends (last 24 weeks)
 */
export async function fetchWeeklyLoyaltyTrends(): Promise<WeeklyTrend[]> {
  const { data, error } = await getSupabase().rpc("get_weekly_loyalty_trends");

  if (error) {
    console.error("Error fetching weekly trends:", error);
    return [];
  }

  return (data || []).map(
    (row: {
      week_start: string;
      high_count: number;
      medium_count: number;
      low_count: number;
      total_count: number;
      high_percentage: number;
      medium_percentage: number;
      low_percentage: number;
    }) => ({
      week_start: row.week_start,
      high_count: Number(row.high_count),
      medium_count: Number(row.medium_count),
      low_count: Number(row.low_count),
      total_count: Number(row.total_count),
      high_percentage: Number(row.high_percentage),
      medium_percentage: Number(row.medium_percentage),
      low_percentage: Number(row.low_percentage),
    })
  );
}

/**
 * Get representative posts for each loyalty level
 */
export async function fetchRepresentativePosts(
  limit: number = 10
): Promise<RepresentativePost[]> {
  const { data, error } = await getSupabase().rpc("get_representative_posts", {
    post_limit: limit,
  });

  if (error) {
    console.error("Error fetching representative posts:", error);
    return [];
  }

  return (data || []).map(
    (row: {
      sentiment: string;
      id: number;
      content: string;
      topic: string | null;
      engagement_total: number;
      likes_count: number;
      retweets_count: number;
      url: string;
      published: string;
    }) => ({
      sentiment: row.sentiment,
      id: row.id,
      content: row.content,
      topic: row.topic,
      engagement_total: Number(row.engagement_total),
      likes_count: Number(row.likes_count),
      retweets_count: Number(row.retweets_count),
      url: row.url,
      published: row.published,
    })
  );
}

/**
 * Get topic-loyalty correlation
 */
export async function fetchTopicLoyaltyCorrelation(): Promise<TopicCorrelation[]> {
  const { data, error } = await getSupabase().rpc(
    "get_topic_loyalty_correlation"
  );

  if (error) {
    console.error("Error fetching topic correlation:", error);
    return [];
  }

  return (data || []).map(
    (row: {
      topic: string;
      total_posts: number;
      high_ratio: number;
      medium_ratio: number;
      low_ratio: number;
      overall_high_ratio: number;
      loyalty_correlation: number;
    }) => ({
      topic: row.topic,
      total_posts: Number(row.total_posts),
      high_ratio: Number(row.high_ratio),
      medium_ratio: Number(row.medium_ratio),
      low_ratio: Number(row.low_ratio),
      overall_high_ratio: Number(row.overall_high_ratio),
      loyalty_correlation: Number(row.loyalty_correlation),
    })
  );
}

// ============================================
// Aggregated Data Fetching
// ============================================

export interface LoyaltyGrowthRawData {
  distribution: LoyaltyDistribution[];
  topicEngagement: TopicEngagement[];
  weeklyTrends: WeeklyTrend[];
  representativePosts: RepresentativePost[];
  topicCorrelations: TopicCorrelation[];
}

/**
 * Fetch all loyalty growth data in parallel
 */
export async function fetchAllLoyaltyGrowthData(): Promise<LoyaltyGrowthRawData> {
  const [
    distribution,
    topicEngagement,
    weeklyTrends,
    representativePosts,
    topicCorrelations,
  ] = await Promise.all([
    fetchLoyaltyDistribution(),
    fetchTopicEngagementByLoyalty(),
    fetchWeeklyLoyaltyTrends(),
    fetchRepresentativePosts(10),
    fetchTopicLoyaltyCorrelation(),
  ]);

  return {
    distribution,
    topicEngagement,
    weeklyTrends,
    representativePosts,
    topicCorrelations,
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Map sentiment to loyalty level
 */
export function sentimentToLoyalty(
  sentiment: string
): "high" | "medium" | "low" {
  switch (sentiment) {
    case "positive":
      return "high";
    case "neutral":
      return "medium";
    case "negative":
      return "low";
    default:
      return "medium";
  }
}

/**
 * Group representative posts by loyalty level
 */
export function groupPostsByLoyalty(posts: RepresentativePost[]): {
  high: RepresentativePost[];
  medium: RepresentativePost[];
  low: RepresentativePost[];
} {
  return {
    high: posts.filter((p) => p.sentiment === "positive"),
    medium: posts.filter((p) => p.sentiment === "neutral"),
    low: posts.filter((p) => p.sentiment === "negative"),
  };
}

/**
 * Group topic engagement by loyalty level
 */
export function groupEngagementByLoyalty(engagement: TopicEngagement[]): {
  high: { topic: string; avgEngagement: number; postCount: number }[];
  medium: { topic: string; avgEngagement: number; postCount: number }[];
  low: { topic: string; avgEngagement: number; postCount: number }[];
} {
  const grouped = {
    high: [] as { topic: string; avgEngagement: number; postCount: number }[],
    medium: [] as { topic: string; avgEngagement: number; postCount: number }[],
    low: [] as { topic: string; avgEngagement: number; postCount: number }[],
  };

  for (const item of engagement) {
    const level = sentimentToLoyalty(item.sentiment);
    grouped[level].push({
      topic: item.topic,
      avgEngagement: item.avg_engagement,
      postCount: item.post_count,
    });
  }

  // Sort by avgEngagement descending
  grouped.high.sort((a, b) => b.avgEngagement - a.avgEngagement);
  grouped.medium.sort((a, b) => b.avgEngagement - a.avgEngagement);
  grouped.low.sort((a, b) => b.avgEngagement - a.avgEngagement);

  return grouped;
}

/**
 * Truncate content for display
 */
export function truncateContent(
  content: string | null,
  maxLength: number = 200
): string {
  if (!content) return "";
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
}
