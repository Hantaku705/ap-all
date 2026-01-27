/**
 * UGC Evidence Fetcher
 *
 * Fetches relevant UGC posts from Supabase for regenerating report sections.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy initialization of Supabase client
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are required");
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}

export interface UGCEvidence {
  id: number;
  content: string;
  sentiment: string;
  engagement: number;
  cep_name?: string;
  dish_category?: string;
  life_stage?: string;
  cooking_for?: string;
  meal_occasion?: string;
  when_detail?: string;
  url?: string;
  published?: string;
}

export type SectionType =
  | "userProfile"
  | "cep"
  | "dish"
  | "ws"
  | "risks"
  | "content"
  | "general";

/**
 * Get section type from section title
 */
export function getSectionType(sectionTitle: string): SectionType {
  if (sectionTitle.includes("ユーザー像")) return "userProfile";
  if (sectionTitle.includes("CEP") || sectionTitle.includes("利用文脈")) return "cep";
  if (sectionTitle.includes("メニュー") || sectionTitle.includes("料理")) return "dish";
  if (sectionTitle.includes("W's") || sectionTitle.includes("詳細分析")) return "ws";
  if (sectionTitle.includes("弱み") || sectionTitle.includes("リスク")) return "risks";
  if (sectionTitle.includes("コンテンツ") || sectionTitle.includes("エンゲージメント")) return "content";
  return "general";
}

/**
 * Fetch UGC evidence for user profile section
 */
async function fetchUserProfileUGC(brandName: string, limit: number): Promise<UGCEvidence[]> {
  const { data, error } = await getSupabase()
    .from("sns_posts")
    .select(`
      id,
      content,
      sentiment,
      engagement_total,
      life_stage,
      cooking_for,
      url,
      published
    `)
    .ilike("brand_mentions", `%${brandName}%`)
    .not("life_stage", "eq", "unknown")
    .not("content", "is", null)
    .order("engagement_total", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching userProfile UGC:", error);
    return [];
  }

  return (data || []).map((post) => ({
    id: post.id,
    content: truncateContent(post.content),
    sentiment: post.sentiment || "neutral",
    engagement: post.engagement_total || 0,
    life_stage: post.life_stage,
    cooking_for: post.cooking_for,
    url: post.url,
    published: post.published,
  }));
}

/**
 * Fetch UGC evidence for CEP section
 */
async function fetchCEPUGC(brandName: string, limit: number): Promise<UGCEvidence[]> {
  const { data, error } = await getSupabase()
    .from("sns_posts")
    .select(`
      id,
      content,
      sentiment,
      engagement_total,
      cep_id,
      ceps(cep_name),
      url,
      published
    `)
    .ilike("brand_mentions", `%${brandName}%`)
    .not("cep_id", "is", null)
    .not("content", "is", null)
    .order("engagement_total", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching CEP UGC:", error);
    return [];
  }

  return (data || []).map((post) => ({
    id: post.id,
    content: truncateContent(post.content),
    sentiment: post.sentiment || "neutral",
    engagement: post.engagement_total || 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cep_name: (post.ceps as any)?.cep_name,
    url: post.url,
    published: post.published,
  }));
}

/**
 * Fetch UGC evidence for dish section
 */
async function fetchDishUGC(brandName: string, limit: number): Promise<UGCEvidence[]> {
  const { data, error } = await getSupabase()
    .from("sns_posts")
    .select(`
      id,
      content,
      sentiment,
      engagement_total,
      dish_category,
      url,
      published
    `)
    .ilike("brand_mentions", `%${brandName}%`)
    .not("dish_category", "eq", "unknown")
    .not("dish_category", "is", null)
    .not("content", "is", null)
    .order("engagement_total", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching dish UGC:", error);
    return [];
  }

  return (data || []).map((post) => ({
    id: post.id,
    content: truncateContent(post.content),
    sentiment: post.sentiment || "neutral",
    engagement: post.engagement_total || 0,
    dish_category: post.dish_category,
    url: post.url,
    published: post.published,
  }));
}

/**
 * Fetch UGC evidence for W's analysis section
 */
async function fetchWsUGC(brandName: string, limit: number): Promise<UGCEvidence[]> {
  const { data, error } = await getSupabase()
    .from("sns_posts")
    .select(`
      id,
      content,
      sentiment,
      engagement_total,
      meal_occasion,
      cooking_for,
      when_detail,
      url,
      published
    `)
    .ilike("brand_mentions", `%${brandName}%`)
    .not("meal_occasion", "is", null)
    .not("content", "is", null)
    .order("engagement_total", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching W's UGC:", error);
    return [];
  }

  return (data || []).map((post) => ({
    id: post.id,
    content: truncateContent(post.content),
    sentiment: post.sentiment || "neutral",
    engagement: post.engagement_total || 0,
    meal_occasion: post.meal_occasion,
    cooking_for: post.cooking_for,
    when_detail: post.when_detail,
    url: post.url,
    published: post.published,
  }));
}

/**
 * Fetch UGC evidence for risks/weaknesses section
 */
async function fetchRisksUGC(brandName: string, limit: number): Promise<UGCEvidence[]> {
  const { data, error } = await getSupabase()
    .from("sns_posts")
    .select(`
      id,
      content,
      sentiment,
      engagement_total,
      url,
      published
    `)
    .ilike("brand_mentions", `%${brandName}%`)
    .eq("sentiment", "negative")
    .not("content", "is", null)
    .order("engagement_total", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching risks UGC:", error);
    return [];
  }

  return (data || []).map((post) => ({
    id: post.id,
    content: truncateContent(post.content),
    sentiment: "negative",
    engagement: post.engagement_total || 0,
    url: post.url,
    published: post.published,
  }));
}

/**
 * Fetch UGC evidence for content/engagement section
 */
async function fetchContentUGC(brandName: string, limit: number): Promise<UGCEvidence[]> {
  const { data, error } = await getSupabase()
    .from("sns_posts")
    .select(`
      id,
      content,
      sentiment,
      engagement_total,
      cep_id,
      ceps(cep_name),
      url,
      published
    `)
    .ilike("brand_mentions", `%${brandName}%`)
    .gt("engagement_total", 100)
    .not("content", "is", null)
    .order("engagement_total", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching content UGC:", error);
    return [];
  }

  return (data || []).map((post) => ({
    id: post.id,
    content: truncateContent(post.content),
    sentiment: post.sentiment || "neutral",
    engagement: post.engagement_total || 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cep_name: (post.ceps as any)?.cep_name,
    url: post.url,
    published: post.published,
  }));
}

/**
 * Fetch general UGC evidence
 */
async function fetchGeneralUGC(brandName: string, limit: number): Promise<UGCEvidence[]> {
  const { data, error } = await getSupabase()
    .from("sns_posts")
    .select(`
      id,
      content,
      sentiment,
      engagement_total,
      life_stage,
      cooking_for,
      dish_category,
      url,
      published
    `)
    .ilike("brand_mentions", `%${brandName}%`)
    .not("content", "is", null)
    .order("engagement_total", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching general UGC:", error);
    return [];
  }

  return (data || []).map((post) => ({
    id: post.id,
    content: truncateContent(post.content),
    sentiment: post.sentiment || "neutral",
    engagement: post.engagement_total || 0,
    life_stage: post.life_stage,
    cooking_for: post.cooking_for,
    dish_category: post.dish_category,
    url: post.url,
    published: post.published,
  }));
}

/**
 * Fetch UGC evidence for a specific section type
 */
export async function fetchUGCForSection(
  brandName: string,
  sectionType: SectionType,
  limit: number = 30
): Promise<UGCEvidence[]> {
  switch (sectionType) {
    case "userProfile":
      return fetchUserProfileUGC(brandName, limit);
    case "cep":
      return fetchCEPUGC(brandName, limit);
    case "dish":
      return fetchDishUGC(brandName, limit);
    case "ws":
      return fetchWsUGC(brandName, limit);
    case "risks":
      return fetchRisksUGC(brandName, limit);
    case "content":
      return fetchContentUGC(brandName, limit);
    default:
      return fetchGeneralUGC(brandName, limit);
  }
}

/**
 * Fetch UGC for multiple section types (for strategy regeneration)
 */
export async function fetchUGCForStrategy(
  brandName: string,
  limit: number = 20
): Promise<{
  highEngagement: UGCEvidence[];
  negative: UGCEvidence[];
  withCEP: UGCEvidence[];
}> {
  const [highEngagement, negative, withCEP] = await Promise.all([
    fetchContentUGC(brandName, limit),
    fetchRisksUGC(brandName, limit),
    fetchCEPUGC(brandName, limit),
  ]);

  return { highEngagement, negative, withCEP };
}

/**
 * Truncate content to max length
 */
function truncateContent(content: string | null, maxLength: number = 300): string {
  if (!content) return "";
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
}

// ============================================
// Aggregation Types and Functions
// ============================================

export interface UGCAggregation {
  totalCount: number;
  sentimentDistribution: { sentiment: string; count: number; percentage: number }[];
  lifeStageDistribution: { life_stage: string; count: number; percentage: number }[];
  cepDistribution: { cep_name: string; count: number; avgEngagement: number }[];
  dishDistribution: { dish_category: string; count: number; percentage: number }[];
  engagementStats: { avg: number; median: number; max: number; total: number };
  topKeywords: { keyword: string; count: number }[];
}

/**
 * Fetch aggregated statistics for a brand (uses all 50,000 UGC)
 */
export async function fetchUGCAggregation(brandName: string): Promise<UGCAggregation> {
  const supabase = getSupabase();

  // Parallel queries for efficiency
  const [
    totalResult,
    sentimentResult,
    lifeStageResult,
    cepResult,
    dishResult,
    engagementResult,
  ] = await Promise.all([
    // Total count
    supabase
      .from("sns_posts")
      .select("id", { count: "exact", head: true })
      .ilike("brand_mentions", `%${brandName}%`),

    // Sentiment distribution
    supabase.rpc("get_sentiment_distribution", { brand_filter: brandName }),

    // Life stage distribution
    supabase.rpc("get_life_stage_distribution", { brand_filter: brandName }),

    // CEP distribution with avg engagement
    supabase.rpc("get_cep_distribution", { brand_filter: brandName }),

    // Dish category distribution
    supabase.rpc("get_dish_distribution", { brand_filter: brandName }),

    // Engagement stats
    supabase.rpc("get_engagement_stats", { brand_filter: brandName }),
  ]);

  const totalCount = totalResult.count || 0;

  // Process sentiment distribution
  const sentimentDistribution = (sentimentResult.data || []).map((row: { sentiment: string; count: number }) => ({
    sentiment: row.sentiment || "unknown",
    count: row.count,
    percentage: totalCount > 0 ? Math.round((row.count / totalCount) * 100) : 0,
  }));

  // Process life stage distribution
  const lifeStageDistribution = (lifeStageResult.data || []).map((row: { life_stage: string; count: number }) => ({
    life_stage: row.life_stage || "unknown",
    count: row.count,
    percentage: totalCount > 0 ? Math.round((row.count / totalCount) * 100) : 0,
  }));

  // Process CEP distribution
  const cepDistribution = (cepResult.data || []).map((row: { cep_name: string; count: number; avg_engagement: number }) => ({
    cep_name: row.cep_name || "unknown",
    count: row.count,
    avgEngagement: Math.round(row.avg_engagement || 0),
  }));

  // Process dish distribution
  const dishDistribution = (dishResult.data || []).map((row: { dish_category: string; count: number }) => ({
    dish_category: row.dish_category || "unknown",
    count: row.count,
    percentage: totalCount > 0 ? Math.round((row.count / totalCount) * 100) : 0,
  }));

  // Process engagement stats
  const engStats = engagementResult.data?.[0] || {};
  const engagementStats = {
    avg: Math.round(engStats.avg_engagement || 0),
    median: Math.round(engStats.median_engagement || 0),
    max: engStats.max_engagement || 0,
    total: engStats.total_engagement || 0,
  };

  return {
    totalCount,
    sentimentDistribution,
    lifeStageDistribution,
    cepDistribution,
    dishDistribution,
    engagementStats,
    topKeywords: [], // TODO: implement keyword extraction
  };
}

/**
 * Fallback aggregation using direct queries (if RPC not available)
 */
export async function fetchUGCAggregationFallback(brandName: string): Promise<UGCAggregation> {
  const supabase = getSupabase();

  // Fetch a larger sample for manual aggregation
  const { data: posts, count } = await supabase
    .from("sns_posts")
    .select("sentiment, life_stage, dish_category, cep_id, engagement_total", { count: "exact" })
    .ilike("brand_mentions", `%${brandName}%`)
    .limit(5000);

  const totalCount = count || 0;
  const samplePosts = posts || [];

  // Manual aggregation
  const sentimentCounts: Record<string, number> = {};
  const lifeStageCounts: Record<string, number> = {};
  const dishCounts: Record<string, number> = {};
  let totalEngagement = 0;
  let maxEngagement = 0;
  const engagements: number[] = [];

  for (const post of samplePosts) {
    // Sentiment
    const sentiment = post.sentiment || "unknown";
    sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1;

    // Life stage
    const lifeStage = post.life_stage || "unknown";
    lifeStageCounts[lifeStage] = (lifeStageCounts[lifeStage] || 0) + 1;

    // Dish category
    const dish = post.dish_category || "unknown";
    dishCounts[dish] = (dishCounts[dish] || 0) + 1;

    // Engagement
    const eng = post.engagement_total || 0;
    totalEngagement += eng;
    maxEngagement = Math.max(maxEngagement, eng);
    engagements.push(eng);
  }

  // Calculate median
  engagements.sort((a, b) => a - b);
  const medianEngagement = engagements.length > 0
    ? engagements[Math.floor(engagements.length / 2)]
    : 0;

  return {
    totalCount,
    sentimentDistribution: Object.entries(sentimentCounts)
      .map(([sentiment, count]) => ({
        sentiment,
        count,
        percentage: Math.round((count / samplePosts.length) * 100),
      }))
      .sort((a, b) => b.count - a.count),
    lifeStageDistribution: Object.entries(lifeStageCounts)
      .map(([life_stage, count]) => ({
        life_stage,
        count,
        percentage: Math.round((count / samplePosts.length) * 100),
      }))
      .sort((a, b) => b.count - a.count),
    cepDistribution: [], // Simplified for fallback
    dishDistribution: Object.entries(dishCounts)
      .map(([dish_category, count]) => ({
        dish_category,
        count,
        percentage: Math.round((count / samplePosts.length) * 100),
      }))
      .sort((a, b) => b.count - a.count),
    engagementStats: {
      avg: Math.round(totalEngagement / samplePosts.length) || 0,
      median: medianEngagement,
      max: maxEngagement,
      total: totalEngagement,
    },
    topKeywords: [],
  };
}

/**
 * Fetch stratified sample (diverse selection from different segments)
 */
export async function fetchStratifiedSample(
  brandName: string,
  sectionType: SectionType,
  totalSamples: number = 30
): Promise<UGCEvidence[]> {
  const supabase = getSupabase();
  const samples: UGCEvidence[] = [];
  const samplesPerStratum = Math.ceil(totalSamples / 5);

  // Stratum 1: High engagement (top performers)
  const { data: highEng } = await supabase
    .from("sns_posts")
    .select("id, content, sentiment, engagement_total, life_stage, cooking_for, dish_category, cep_id, meal_occasion, url, published")
    .ilike("brand_mentions", `%${brandName}%`)
    .not("content", "is", null)
    .order("engagement_total", { ascending: false })
    .limit(samplesPerStratum);

  // Stratum 2: Positive sentiment
  const { data: positive } = await supabase
    .from("sns_posts")
    .select("id, content, sentiment, engagement_total, life_stage, cooking_for, dish_category, cep_id, meal_occasion, url, published")
    .ilike("brand_mentions", `%${brandName}%`)
    .eq("sentiment", "positive")
    .not("content", "is", null)
    .order("engagement_total", { ascending: false })
    .limit(samplesPerStratum);

  // Stratum 3: Negative sentiment (for risk understanding)
  const { data: negative } = await supabase
    .from("sns_posts")
    .select("id, content, sentiment, engagement_total, life_stage, cooking_for, dish_category, cep_id, meal_occasion, url, published")
    .ilike("brand_mentions", `%${brandName}%`)
    .eq("sentiment", "negative")
    .not("content", "is", null)
    .order("engagement_total", { ascending: false })
    .limit(samplesPerStratum);

  // Stratum 4: Known life stage (non-unknown)
  const { data: knownLifeStage } = await supabase
    .from("sns_posts")
    .select("id, content, sentiment, engagement_total, life_stage, cooking_for, dish_category, cep_id, meal_occasion, url, published")
    .ilike("brand_mentions", `%${brandName}%`)
    .not("life_stage", "eq", "unknown")
    .not("life_stage", "is", null)
    .not("content", "is", null)
    .order("engagement_total", { ascending: false })
    .limit(samplesPerStratum);

  // Stratum 5: Has CEP assigned
  const { data: withCep } = await supabase
    .from("sns_posts")
    .select("id, content, sentiment, engagement_total, life_stage, cooking_for, dish_category, cep_id, meal_occasion, url, published")
    .ilike("brand_mentions", `%${brandName}%`)
    .not("cep_id", "is", null)
    .not("content", "is", null)
    .order("engagement_total", { ascending: false })
    .limit(samplesPerStratum);

  // Combine and deduplicate
  const seenIds = new Set<number>();
  const allPosts = [...(highEng || []), ...(positive || []), ...(negative || []), ...(knownLifeStage || []), ...(withCep || [])];

  for (const post of allPosts) {
    if (seenIds.has(post.id)) continue;
    if (samples.length >= totalSamples) break;

    seenIds.add(post.id);
    samples.push({
      id: post.id,
      content: truncateContent(post.content),
      sentiment: post.sentiment || "neutral",
      engagement: post.engagement_total || 0,
      life_stage: post.life_stage,
      cooking_for: post.cooking_for,
      dish_category: post.dish_category,
      meal_occasion: post.meal_occasion,
      url: post.url,
      published: post.published,
    });
  }

  return samples;
}

/**
 * Format aggregation for LLM prompt
 */
export function formatAggregationForPrompt(agg: UGCAggregation): string {
  const lines: string[] = [];

  lines.push(`## 全体統計（${agg.totalCount.toLocaleString()}件のUGCから集計）`);
  lines.push("");

  // Sentiment
  lines.push("### センチメント分布");
  for (const s of agg.sentimentDistribution.slice(0, 5)) {
    lines.push(`- ${s.sentiment}: ${s.count}件 (${s.percentage}%)`);
  }
  lines.push("");

  // Life stage
  lines.push("### ライフステージ分布");
  for (const l of agg.lifeStageDistribution.slice(0, 6)) {
    lines.push(`- ${l.life_stage}: ${l.count}件 (${l.percentage}%)`);
  }
  lines.push("");

  // Dish
  if (agg.dishDistribution.length > 0) {
    lines.push("### 料理カテゴリ分布");
    for (const d of agg.dishDistribution.slice(0, 6)) {
      lines.push(`- ${d.dish_category}: ${d.count}件 (${d.percentage}%)`);
    }
    lines.push("");
  }

  // CEP
  if (agg.cepDistribution.length > 0) {
    lines.push("### CEP分布（利用文脈）");
    for (const c of agg.cepDistribution.slice(0, 8)) {
      lines.push(`- ${c.cep_name}: ${c.count}件 (平均ENG: ${c.avgEngagement})`);
    }
    lines.push("");
  }

  // Engagement
  lines.push("### エンゲージメント統計");
  lines.push(`- 平均: ${agg.engagementStats.avg}`);
  lines.push(`- 中央値: ${agg.engagementStats.median}`);
  lines.push(`- 最大: ${agg.engagementStats.max}`);
  lines.push("");

  return lines.join("\n");
}

/**
 * Format UGC evidence for LLM prompt
 */
export function formatUGCForPrompt(ugcList: UGCEvidence[]): string {
  if (ugcList.length === 0) return "（関連UGCなし）";

  return ugcList
    .map((ugc, index) => {
      const attrs: string[] = [];
      if (ugc.life_stage) attrs.push(`ライフステージ: ${ugc.life_stage}`);
      if (ugc.cooking_for) attrs.push(`調理対象: ${ugc.cooking_for}`);
      if (ugc.cep_name) attrs.push(`CEP: ${ugc.cep_name}`);
      if (ugc.dish_category) attrs.push(`料理: ${ugc.dish_category}`);
      if (ugc.meal_occasion) attrs.push(`シーン: ${ugc.meal_occasion}`);

      const attrStr = attrs.length > 0 ? `[${attrs.join(", ")}]` : "";

      return `${index + 1}. [ID:${ugc.id}] ${ugc.sentiment.toUpperCase()} / ENG:${ugc.engagement} ${attrStr}
   「${ugc.content}」`;
    })
    .join("\n\n");
}
