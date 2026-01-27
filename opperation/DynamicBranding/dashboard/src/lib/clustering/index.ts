/**
 * Clustering Module
 *
 * Exports all clustering-related functions and types
 * for persona analysis.
 */

// Feature encoder
export {
  // Categories
  LIFE_STAGE_CATEGORIES,
  COOKING_SKILL_CATEGORIES,
  MOTIVATION_CATEGORIES,
  MEAL_OCCASION_CATEGORIES,
  COOKING_FOR_CATEGORIES,
  EMOTION_CATEGORIES,
  LABEL_MAPPINGS,
  FEATURE_DIMENSIONS,
  ATTRIBUTE_FIELDS,
  // Types
  type AttributeField,
  type PostForClustering,
  type EncodedPost,
  // Functions
  countUnknowns,
  isClusterable,
  encodePost,
  encodePosts,
  decodeCentroid,
  centroidToPosition,
  getJapaneseLabel,
} from "./feature-encoder";

// K-means clustering
export {
  // Types
  type ClusterInfo,
  type DominantAttributes,
  type AttributeDistribution,
  type SamplePost,
  type ClusteringResult,
  type ClusteringOptions,
  // Functions
  runKMeans,
  clusterToPersonaInput,
} from "./kmeans";

// Quality metrics
export {
  // Types
  type QualityMetrics,
  type UnknownRates,
  // Functions
  calculateSilhouetteScore,
  calculateUnknownRates,
  calculateDataCompleteness,
  calculateClusterSeparation,
  calculateOverallConfidence,
  calculateQualityMetrics,
  getConfidenceLevel,
  getSilhouetteInterpretation,
} from "./quality-metrics";
