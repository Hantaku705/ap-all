/**
 * Loyalty Growth Strategy Module
 *
 * SNSデータからロイヤリティ成長戦略を動的に生成
 */

// Types
export * from "./types";

// Data Fetching
export {
  fetchLoyaltyDistribution,
  fetchTopicEngagementByLoyalty,
  fetchWeeklyLoyaltyTrends,
  fetchRepresentativePosts,
  fetchTopicLoyaltyCorrelation,
  fetchAllLoyaltyGrowthData,
  sentimentToLoyalty,
  groupPostsByLoyalty,
  groupEngagementByLoyalty,
  truncateContent,
} from "./data-fetcher";
export type { LoyaltyGrowthRawData } from "./data-fetcher";

// Metrics Calculation
export {
  transformToLLMInput,
  generateInputHash,
  formatInputForPrompt,
} from "./metrics-calculator";

// LLM Generation
export {
  generateLoyaltyGrowthStrategy,
  isLLMAvailable,
  getAvailableLLMProvider,
} from "./llm-generator";

// Cache Operations
export {
  getCachedLoyaltyGrowth,
  saveLoyaltyGrowthCache,
  invalidateCache,
  isCacheValid,
  getCacheMetadata,
} from "./cache";
