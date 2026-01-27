/**
 * Quality Metrics Calculator for Persona Clustering
 *
 * Calculates silhouette score, unknown rates, and overall confidence
 * to help users assess data reliability.
 */

import {
  PostForClustering,
  countUnknowns,
  ATTRIBUTE_FIELDS,
  AttributeField,
} from "./feature-encoder";
import { ClusteringResult, ClusterInfo } from "./kmeans";

// Quality metrics structure
export interface QualityMetrics {
  silhouetteScore: number; // -1 to 1, higher is better
  unknownRates: UnknownRates;
  dataCompleteness: number; // 0-100%
  clusterSeparation: number; // 0-100, higher means more distinct clusters
  overallConfidence: number; // 0-100, composite score
}

export interface UnknownRates {
  life_stage: number;
  cooking_skill: number;
  motivation_category: number;
  meal_occasion: number;
  cooking_for: number;
  emotion: number;
  average: number;
}

/**
 * Calculate Euclidean distance between two vectors
 */
function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

/**
 * Calculate simplified silhouette score
 *
 * For each point:
 * - a = average distance to other points in same cluster
 * - b = average distance to points in nearest other cluster
 * - silhouette = (b - a) / max(a, b)
 *
 * Note: This is a simplified version that uses centroids
 * for efficiency with large datasets.
 */
export function calculateSilhouetteScore(
  clusteringResult: ClusteringResult
): number {
  const { clusters } = clusteringResult;

  if (clusters.length < 2) {
    return 0; // Need at least 2 clusters
  }

  // Calculate inter-centroid distances
  const centroidDistances: number[][] = [];
  for (let i = 0; i < clusters.length; i++) {
    centroidDistances[i] = [];
    for (let j = 0; j < clusters.length; j++) {
      if (i === j) {
        centroidDistances[i][j] = 0;
      } else {
        centroidDistances[i][j] = euclideanDistance(
          clusters[i].centroid,
          clusters[j].centroid
        );
      }
    }
  }

  // Calculate average intra-cluster distance (using centroid as proxy)
  // and nearest neighbor cluster distance
  let totalSilhouette = 0;
  let count = 0;

  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    if (cluster.size < 2) continue;

    // Find nearest other cluster
    let minDist = Infinity;
    for (let j = 0; j < clusters.length; j++) {
      if (i !== j && centroidDistances[i][j] < minDist) {
        minDist = centroidDistances[i][j];
      }
    }

    // Simplified silhouette using cluster size as weight
    // Assumes intra-cluster variance is proportional to 1/sqrt(size)
    const a = 1 / Math.sqrt(cluster.size); // Proxy for avg intra-cluster distance
    const b = minDist;

    if (Math.max(a, b) > 0) {
      const silhouette = (b - a) / Math.max(a, b);
      totalSilhouette += silhouette * cluster.size;
      count += cluster.size;
    }
  }

  return count > 0 ? Math.min(1, Math.max(-1, totalSilhouette / count)) : 0;
}

/**
 * Calculate unknown rates for each attribute
 */
export function calculateUnknownRates(
  posts: PostForClustering[]
): UnknownRates {
  const counts: Record<AttributeField, number> = {
    life_stage: 0,
    cooking_skill: 0,
    motivation_category: 0,
    meal_occasion: 0,
    cooking_for: 0,
    emotion: 0,
  };

  for (const post of posts) {
    if (!post.life_stage || post.life_stage === "unknown") {
      counts.life_stage++;
    }
    if (!post.cooking_skill || post.cooking_skill === "unknown") {
      counts.cooking_skill++;
    }
    if (!post.motivation_category || post.motivation_category === "unknown") {
      counts.motivation_category++;
    }
    if (!post.meal_occasion || post.meal_occasion === "unknown") {
      counts.meal_occasion++;
    }
    if (!post.cooking_for || post.cooking_for === "unknown") {
      counts.cooking_for++;
    }
    if (!post.emotion || post.emotion === "unknown") {
      counts.emotion++;
    }
  }

  const total = posts.length;
  const toPercent = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const rates: UnknownRates = {
    life_stage: toPercent(counts.life_stage),
    cooking_skill: toPercent(counts.cooking_skill),
    motivation_category: toPercent(counts.motivation_category),
    meal_occasion: toPercent(counts.meal_occasion),
    cooking_for: toPercent(counts.cooking_for),
    emotion: toPercent(counts.emotion),
    average: 0,
  };

  // Calculate average unknown rate
  const sum =
    rates.life_stage +
    rates.cooking_skill +
    rates.motivation_category +
    rates.meal_occasion +
    rates.cooking_for +
    rates.emotion;
  rates.average = Math.round(sum / 6);

  return rates;
}

/**
 * Calculate data completeness (inverse of average unknown rate)
 */
export function calculateDataCompleteness(unknownRates: UnknownRates): number {
  return 100 - unknownRates.average;
}

/**
 * Calculate cluster separation score
 * Higher score means clusters are more distinct
 */
export function calculateClusterSeparation(
  clusteringResult: ClusteringResult
): number {
  const { clusters } = clusteringResult;

  if (clusters.length < 2) {
    return 0;
  }

  // Calculate average inter-centroid distance
  let totalDist = 0;
  let count = 0;

  for (let i = 0; i < clusters.length; i++) {
    for (let j = i + 1; j < clusters.length; j++) {
      totalDist += euclideanDistance(clusters[i].centroid, clusters[j].centroid);
      count++;
    }
  }

  const avgDist = count > 0 ? totalDist / count : 0;

  // Normalize to 0-100 scale
  // Assuming max meaningful distance in our feature space is ~5 (sqrt of sum of one-hot)
  const maxExpectedDist = 5;
  return Math.min(100, Math.round((avgDist / maxExpectedDist) * 100));
}

/**
 * Calculate overall confidence score
 * Composite of silhouette, completeness, and separation
 */
export function calculateOverallConfidence(
  silhouetteScore: number,
  dataCompleteness: number,
  clusterSeparation: number,
  postsClusteredRatio: number
): number {
  // Weights for each component
  const weights = {
    silhouette: 0.25, // Cluster quality
    completeness: 0.35, // Data quality
    separation: 0.20, // Cluster distinctness
    coverage: 0.20, // How much data was usable
  };

  // Normalize silhouette from [-1, 1] to [0, 100]
  const normalizedSilhouette = ((silhouetteScore + 1) / 2) * 100;

  // Calculate weighted score
  const score =
    normalizedSilhouette * weights.silhouette +
    dataCompleteness * weights.completeness +
    clusterSeparation * weights.separation +
    postsClusteredRatio * 100 * weights.coverage;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Calculate all quality metrics
 */
export function calculateQualityMetrics(
  posts: PostForClustering[],
  clusteringResult: ClusteringResult
): QualityMetrics {
  const unknownRates = calculateUnknownRates(posts);
  const dataCompleteness = calculateDataCompleteness(unknownRates);
  const silhouetteScore = calculateSilhouetteScore(clusteringResult);
  const clusterSeparation = calculateClusterSeparation(clusteringResult);

  const postsClusteredRatio =
    posts.length > 0 ? clusteringResult.postsClustered / posts.length : 0;

  const overallConfidence = calculateOverallConfidence(
    silhouetteScore,
    dataCompleteness,
    clusterSeparation,
    postsClusteredRatio
  );

  return {
    silhouetteScore: Math.round(silhouetteScore * 100) / 100,
    unknownRates,
    dataCompleteness,
    clusterSeparation,
    overallConfidence,
  };
}

/**
 * Get confidence level label and color
 */
export function getConfidenceLevel(confidence: number): {
  level: "high" | "medium" | "low" | "very_low";
  label: string;
  color: string;
  message: string;
} {
  if (confidence >= 80) {
    return {
      level: "high",
      label: "高信頼",
      color: "#22c55e", // green-500
      message: "十分なデータ量と品質があります",
    };
  } else if (confidence >= 60) {
    return {
      level: "medium",
      label: "中程度",
      color: "#eab308", // yellow-500
      message: "一部のデータが不明ですが、参考になります",
    };
  } else if (confidence >= 40) {
    return {
      level: "low",
      label: "低信頼",
      color: "#f97316", // orange-500
      message: "データ不足のため参考程度としてご覧ください",
    };
  } else {
    return {
      level: "very_low",
      label: "要注意",
      color: "#ef4444", // red-500
      message: "データが不十分です",
    };
  }
}

/**
 * Get interpretation text for silhouette score
 */
export function getSilhouetteInterpretation(score: number): string {
  if (score >= 0.7) {
    return "クラスターが明確に分離";
  } else if (score >= 0.5) {
    return "適度な分離";
  } else if (score >= 0.25) {
    return "重複あり";
  } else {
    return "分離が不明確";
  }
}
