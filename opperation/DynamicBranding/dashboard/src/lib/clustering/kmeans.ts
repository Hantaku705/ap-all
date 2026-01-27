/**
 * K-Means Clustering Wrapper
 *
 * Wraps ml-kmeans library with preprocessing, post-processing,
 * and persona-specific functionality.
 */

import { kmeans } from "ml-kmeans";
import {
  EncodedPost,
  PostForClustering,
  encodePosts,
  decodeCentroid,
  centroidToPosition,
  getJapaneseLabel,
  ATTRIBUTE_FIELDS,
  AttributeField,
  LABEL_MAPPINGS,
} from "./feature-encoder";

// Cluster information structure
export interface ClusterInfo {
  id: number;
  centroid: number[];
  postIds: string[];
  size: number;
  sharePercentage: number;
  position: { x: number; y: number };
  dominantAttributes: DominantAttributes;
  attributeDistribution: AttributeDistribution;
  samplePosts: SamplePost[];
  avgEngagement: number;
  totalEngagement: number;
}

export interface DominantAttributes {
  life_stage: { value: string; label: string; percentage: number };
  cooking_skill: { value: string; label: string; percentage: number };
  motivation_category: { value: string; label: string; percentage: number };
  meal_occasion: { value: string; label: string; percentage: number };
  cooking_for: { value: string; label: string; percentage: number };
  emotion: { value: string; label: string; percentage: number };
}

export interface AttributeDistribution {
  [field: string]: { [value: string]: number };
}

export interface SamplePost {
  id: string;
  content: string;
  engagement: number;
}

// Clustering result structure
export interface ClusteringResult {
  clusters: ClusterInfo[];
  iterations: number;
  converged: boolean;
  totalPosts: number;
  postsAnalyzed: number;
  postsClustered: number;
  postsExcluded: number;
}

// Clustering options
export interface ClusteringOptions {
  k?: number; // Number of clusters (auto-determined if not specified)
  minK?: number; // Minimum clusters
  maxK?: number; // Maximum clusters
  minKnownFields?: number; // Minimum known fields per post
  maxIterations?: number; // Max k-means iterations
  samplePostCount?: number; // Number of sample posts per cluster
}

const DEFAULT_OPTIONS: Required<ClusteringOptions> = {
  k: 0, // 0 means auto-determine
  minK: 5, // Increased from 3 for finer segmentation
  maxK: 8, // Increased from 5 for finer segmentation
  minKnownFields: 2, // Reduced from 3 to include more posts (72% → ~40% exclusion)
  maxIterations: 100,
  samplePostCount: 10, // Increased from 5 for more sample posts
};

/**
 * Determine optimal K based on data size
 */
function determineK(dataSize: number, minK: number, maxK: number): number {
  // Rule: K = min(maxK, max(minK, floor(dataSize / 100)))
  const suggestedK = Math.floor(dataSize / 100);
  return Math.min(maxK, Math.max(minK, suggestedK));
}

/**
 * Calculate attribute distribution within a cluster
 */
function calculateAttributeDistribution(
  posts: EncodedPost[]
): AttributeDistribution {
  const distribution: AttributeDistribution = {};

  for (const field of ATTRIBUTE_FIELDS) {
    distribution[field] = {};
  }

  for (const post of posts) {
    for (const field of ATTRIBUTE_FIELDS) {
      const value = post.metadata.attributes[field];
      distribution[field][value] = (distribution[field][value] || 0) + 1;
    }
  }

  return distribution;
}

/**
 * Get dominant attribute for each field in a cluster
 */
function getDominantAttributes(
  distribution: AttributeDistribution,
  clusterSize: number
): DominantAttributes {
  const result: Partial<DominantAttributes> = {};

  for (const field of ATTRIBUTE_FIELDS) {
    const fieldDist = distribution[field];
    let maxValue = "unknown";
    let maxCount = 0;

    for (const [value, count] of Object.entries(fieldDist)) {
      if (count > maxCount) {
        maxCount = count;
        maxValue = value;
      }
    }

    result[field] = {
      value: maxValue,
      label: getJapaneseLabel(field, maxValue),
      percentage: Math.round((maxCount / clusterSize) * 100),
    };
  }

  return result as DominantAttributes;
}

/**
 * Select representative sample posts from a cluster
 * Prioritizes posts with higher engagement and more complete data
 */
function selectSamplePosts(
  posts: EncodedPost[],
  count: number
): SamplePost[] {
  // Sort by engagement (descending), then by unknown count (ascending)
  const sorted = [...posts].sort((a, b) => {
    // First, prefer posts with fewer unknowns
    if (a.metadata.unknownCount !== b.metadata.unknownCount) {
      return a.metadata.unknownCount - b.metadata.unknownCount;
    }
    // Then, prefer higher engagement
    return b.metadata.engagement - a.metadata.engagement;
  });

  return sorted.slice(0, count).map((post) => ({
    id: post.postId,
    content: post.metadata.content.slice(0, 200), // Truncate for display
    engagement: post.metadata.engagement,
  }));
}

/**
 * Run k-means clustering on posts
 */
export async function runKMeans(
  posts: PostForClustering[],
  options: ClusteringOptions = {}
): Promise<ClusteringResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Encode posts
  const { encoded, stats } = encodePosts(posts, {
    minKnownFields: opts.minKnownFields,
    filterUnclusterable: true,
  });

  // Check if we have enough data
  if (encoded.length < opts.minK * 10) {
    throw new Error(
      `Not enough clusterable posts: ${encoded.length} (need at least ${opts.minK * 10})`
    );
  }

  // Determine K
  const k = opts.k > 0 ? opts.k : determineK(encoded.length, opts.minK, opts.maxK);

  // Prepare data matrix
  const data = encoded.map((e) => e.vector);

  // Run k-means
  const result = kmeans(data, k, {
    maxIterations: opts.maxIterations,
    initialization: "kmeans++",
  });

  // Build cluster info
  const clusters: ClusterInfo[] = [];

  for (let i = 0; i < k; i++) {
    // Get posts in this cluster
    const clusterPosts = encoded.filter((_, idx) => result.clusters[idx] === i);

    if (clusterPosts.length === 0) continue;

    // Calculate distribution
    const distribution = calculateAttributeDistribution(clusterPosts);
    const dominantAttributes = getDominantAttributes(
      distribution,
      clusterPosts.length
    );

    // Calculate engagement
    const totalEngagement = clusterPosts.reduce(
      (sum, p) => sum + p.metadata.engagement,
      0
    );
    const avgEngagement = totalEngagement / clusterPosts.length;

    // Get position from centroid
    const position = centroidToPosition(result.centroids[i]);

    clusters.push({
      id: i,
      centroid: result.centroids[i],
      postIds: clusterPosts.map((p) => p.postId),
      size: clusterPosts.length,
      sharePercentage: Math.round((clusterPosts.length / encoded.length) * 100),
      position,
      dominantAttributes,
      attributeDistribution: distribution,
      samplePosts: selectSamplePosts(clusterPosts, opts.samplePostCount),
      avgEngagement: Math.round(avgEngagement),
      totalEngagement,
    });
  }

  // Sort clusters by size (descending)
  clusters.sort((a, b) => b.size - a.size);

  // Re-assign IDs after sorting
  clusters.forEach((c, idx) => {
    c.id = idx;
  });

  return {
    clusters,
    iterations: result.iterations,
    converged: result.converged,
    totalPosts: stats.total,
    postsAnalyzed: stats.total,
    postsClustered: stats.clusterable,
    postsExcluded: stats.excluded,
  };
}

/**
 * Generate persona-friendly attributes for a cluster
 * Used as input for LLM persona generation
 */
export function clusterToPersonaInput(cluster: ClusterInfo): {
  clusterId: number;
  size: number;
  sharePercentage: number;
  position: { x: number; y: number };
  dominantAttributes: {
    lifeStage: string;
    cookingSkill: string;
    motivation: string;
    occasion: string;
    cookingFor: string;
    emotion: string;
  };
  dominantPercentages: {
    lifeStage: number;
    cookingSkill: number;
    motivation: number;
    occasion: number;
    cookingFor: number;
    emotion: number;
  };
  avgEngagement: number;
  samplePosts: string[];
} {
  return {
    clusterId: cluster.id,
    size: cluster.size,
    sharePercentage: cluster.sharePercentage,
    position: cluster.position,
    dominantAttributes: {
      lifeStage: cluster.dominantAttributes.life_stage.label,
      cookingSkill: cluster.dominantAttributes.cooking_skill.label,
      motivation: cluster.dominantAttributes.motivation_category.label,
      occasion: cluster.dominantAttributes.meal_occasion.label,
      cookingFor: cluster.dominantAttributes.cooking_for.label,
      emotion: cluster.dominantAttributes.emotion.label,
    },
    dominantPercentages: {
      lifeStage: cluster.dominantAttributes.life_stage.percentage,
      cookingSkill: cluster.dominantAttributes.cooking_skill.percentage,
      motivation: cluster.dominantAttributes.motivation_category.percentage,
      occasion: cluster.dominantAttributes.meal_occasion.percentage,
      cookingFor: cluster.dominantAttributes.cooking_for.percentage,
      emotion: cluster.dominantAttributes.emotion.percentage,
    },
    avgEngagement: cluster.avgEngagement,
    samplePosts: cluster.samplePosts.map((p) => p.content),
  };
}
