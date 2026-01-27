/**
 * Feature Encoder for Persona Clustering
 *
 * Converts categorical SNS post attributes into numeric vectors
 * for k-means clustering. Uses one-hot encoding with explicit
 * "unknown" category to preserve data transparency.
 */

// Encoding maps for each categorical attribute
// Each attribute is one-hot encoded with "unknown" as explicit category

export const LIFE_STAGE_CATEGORIES = [
  "single",
  "couple",
  "child_raising",
  "empty_nest",
  "senior",
  "unknown",
] as const;

export const COOKING_SKILL_CATEGORIES = [
  "beginner",
  "intermediate",
  "advanced",
  "unknown",
] as const;

export const MOTIVATION_CATEGORIES = [
  "time_pressure",
  "taste_assurance",
  "variety_seeking",
  "skill_confidence",
  "cost_saving",
  "health_concern",
  "comfort_food",
  "impression",
  "unknown",
] as const;

export const MEAL_OCCASION_CATEGORIES = [
  "weekday_dinner_rush",
  "weekday_dinner_leisurely",
  "weekend_brunch",
  "weekend_dinner",
  "lunch_box",
  "late_night_snack",
  "breakfast",
  "party",
  "unknown",
] as const;

export const COOKING_FOR_CATEGORIES = [
  "self",
  "family",
  "kids",
  "spouse",
  "parents",
  "guest",
  "multiple",
  "unknown",
] as const;

export const EMOTION_CATEGORIES = [
  "anxiety",
  "relief",
  "satisfaction",
  "guilt",
  "excitement",
  "frustration",
  "neutral",
  "unknown",
] as const;

// Japanese label mappings for display
export const LABEL_MAPPINGS = {
  life_stage: {
    single: "一人暮らし",
    couple: "夫婦二人",
    child_raising: "子育て世帯",
    empty_nest: "子ども独立後",
    senior: "シニア世帯",
    unknown: "不明",
  },
  cooking_skill: {
    beginner: "初級",
    intermediate: "中級",
    advanced: "上級",
    unknown: "不明",
  },
  motivation_category: {
    time_pressure: "時短・効率化",
    taste_assurance: "味の確実性",
    variety_seeking: "バリエーション",
    skill_confidence: "自信がない",
    cost_saving: "節約",
    health_concern: "健康志向",
    comfort_food: "定番の味",
    impression: "誰かを喜ばせる",
    unknown: "不明",
  },
  meal_occasion: {
    weekday_dinner_rush: "平日夕食（急ぎ）",
    weekday_dinner_leisurely: "平日夕食（ゆっくり）",
    weekend_brunch: "週末ブランチ",
    weekend_dinner: "週末夕食",
    lunch_box: "お弁当",
    late_night_snack: "夜食・晩酌",
    breakfast: "朝食",
    party: "おもてなし",
    unknown: "不明",
  },
  cooking_for: {
    self: "自分",
    family: "家族",
    kids: "子ども",
    spouse: "配偶者",
    parents: "親",
    guest: "来客",
    multiple: "複数",
    unknown: "不明",
  },
  emotion: {
    anxiety: "不安",
    relief: "安心",
    satisfaction: "満足",
    guilt: "罪悪感",
    excitement: "ワクワク",
    frustration: "イライラ",
    neutral: "中立",
    unknown: "不明",
  },
} as const;

// Total feature dimensions
export const FEATURE_DIMENSIONS =
  LIFE_STAGE_CATEGORIES.length +
  COOKING_SKILL_CATEGORIES.length +
  MOTIVATION_CATEGORIES.length +
  MEAL_OCCASION_CATEGORIES.length +
  COOKING_FOR_CATEGORIES.length +
  EMOTION_CATEGORIES.length;

// Attribute field names
export const ATTRIBUTE_FIELDS = [
  "life_stage",
  "cooking_skill",
  "motivation_category",
  "meal_occasion",
  "cooking_for",
  "emotion",
] as const;

export type AttributeField = (typeof ATTRIBUTE_FIELDS)[number];

// Post data structure for clustering
export interface PostForClustering {
  id: string;
  content: string;
  engagement_total: number;
  life_stage: string | null;
  cooking_skill: string | null;
  motivation_category: string | null;
  meal_occasion: string | null;
  cooking_for: string | null;
  emotion: string | null;
}

// Encoded feature vector with metadata
export interface EncodedPost {
  postId: string;
  vector: number[];
  metadata: {
    content: string;
    engagement: number;
    attributes: Record<AttributeField, string>;
    unknownCount: number;
  };
}

/**
 * One-hot encode a categorical value
 */
function oneHotEncode(value: string | null, categories: readonly string[]): number[] {
  const normalized = value?.toLowerCase() || "unknown";
  const index = categories.indexOf(normalized as string);
  const encoding = new Array(categories.length).fill(0);

  if (index >= 0) {
    encoding[index] = 1;
  } else {
    // Default to "unknown" if value not found
    const unknownIndex = categories.indexOf("unknown");
    if (unknownIndex >= 0) {
      encoding[unknownIndex] = 1;
    }
  }

  return encoding;
}

/**
 * Get the effective value for an attribute (normalize to known categories)
 */
function normalizeAttribute(
  value: string | null,
  categories: readonly string[]
): string {
  if (!value) return "unknown";
  const normalized = value.toLowerCase();
  return categories.includes(normalized as string) ? normalized : "unknown";
}

/**
 * Count unknown attributes for a post
 */
export function countUnknowns(post: PostForClustering): number {
  let count = 0;
  if (!post.life_stage || post.life_stage === "unknown") count++;
  if (!post.cooking_skill || post.cooking_skill === "unknown") count++;
  if (!post.motivation_category || post.motivation_category === "unknown") count++;
  if (!post.meal_occasion || post.meal_occasion === "unknown") count++;
  if (!post.cooking_for || post.cooking_for === "unknown") count++;
  if (!post.emotion || post.emotion === "unknown") count++;
  return count;
}

/**
 * Check if a post has enough known attributes for clustering
 * Requires at least MIN_KNOWN_FIELDS known attributes (not unknown/null)
 */
export function isClusterable(
  post: PostForClustering,
  minKnownFields: number = 3
): boolean {
  const unknownCount = countUnknowns(post);
  return ATTRIBUTE_FIELDS.length - unknownCount >= minKnownFields;
}

/**
 * Encode a single post into a feature vector
 */
export function encodePost(post: PostForClustering): EncodedPost {
  // Normalize all attributes
  const lifeStage = normalizeAttribute(post.life_stage, LIFE_STAGE_CATEGORIES);
  const cookingSkill = normalizeAttribute(post.cooking_skill, COOKING_SKILL_CATEGORIES);
  const motivation = normalizeAttribute(post.motivation_category, MOTIVATION_CATEGORIES);
  const occasion = normalizeAttribute(post.meal_occasion, MEAL_OCCASION_CATEGORIES);
  const cookingFor = normalizeAttribute(post.cooking_for, COOKING_FOR_CATEGORIES);
  const emotion = normalizeAttribute(post.emotion, EMOTION_CATEGORIES);

  // Concatenate one-hot encodings
  const vector = [
    ...oneHotEncode(lifeStage, LIFE_STAGE_CATEGORIES),
    ...oneHotEncode(cookingSkill, COOKING_SKILL_CATEGORIES),
    ...oneHotEncode(motivation, MOTIVATION_CATEGORIES),
    ...oneHotEncode(occasion, MEAL_OCCASION_CATEGORIES),
    ...oneHotEncode(cookingFor, COOKING_FOR_CATEGORIES),
    ...oneHotEncode(emotion, EMOTION_CATEGORIES),
  ];

  return {
    postId: post.id,
    vector,
    metadata: {
      content: post.content,
      engagement: post.engagement_total || 0,
      attributes: {
        life_stage: lifeStage,
        cooking_skill: cookingSkill,
        motivation_category: motivation,
        meal_occasion: occasion,
        cooking_for: cookingFor,
        emotion: emotion,
      },
      unknownCount: countUnknowns(post),
    },
  };
}

/**
 * Encode multiple posts into feature vectors
 * Optionally filters out posts with too many unknowns
 */
export function encodePosts(
  posts: PostForClustering[],
  options: {
    minKnownFields?: number;
    filterUnclusterable?: boolean;
  } = {}
): {
  encoded: EncodedPost[];
  excluded: PostForClustering[];
  stats: {
    total: number;
    clusterable: number;
    excluded: number;
  };
} {
  const { minKnownFields = 3, filterUnclusterable = true } = options;

  const encoded: EncodedPost[] = [];
  const excluded: PostForClustering[] = [];

  for (const post of posts) {
    if (filterUnclusterable && !isClusterable(post, minKnownFields)) {
      excluded.push(post);
    } else {
      encoded.push(encodePost(post));
    }
  }

  return {
    encoded,
    excluded,
    stats: {
      total: posts.length,
      clusterable: encoded.length,
      excluded: excluded.length,
    },
  };
}

/**
 * Decode a centroid vector back to dominant attributes
 * Returns the most likely category for each attribute based on centroid values
 */
export function decodeCentroid(centroid: number[]): Record<AttributeField, { value: string; score: number }> {
  let offset = 0;
  const result: Record<string, { value: string; score: number }> = {};

  // Life stage
  const lifeStageScores = centroid.slice(offset, offset + LIFE_STAGE_CATEGORIES.length);
  offset += LIFE_STAGE_CATEGORIES.length;
  const maxLifeStageIdx = lifeStageScores.indexOf(Math.max(...lifeStageScores));
  result.life_stage = {
    value: LIFE_STAGE_CATEGORIES[maxLifeStageIdx],
    score: lifeStageScores[maxLifeStageIdx],
  };

  // Cooking skill
  const cookingSkillScores = centroid.slice(offset, offset + COOKING_SKILL_CATEGORIES.length);
  offset += COOKING_SKILL_CATEGORIES.length;
  const maxSkillIdx = cookingSkillScores.indexOf(Math.max(...cookingSkillScores));
  result.cooking_skill = {
    value: COOKING_SKILL_CATEGORIES[maxSkillIdx],
    score: cookingSkillScores[maxSkillIdx],
  };

  // Motivation
  const motivationScores = centroid.slice(offset, offset + MOTIVATION_CATEGORIES.length);
  offset += MOTIVATION_CATEGORIES.length;
  const maxMotivationIdx = motivationScores.indexOf(Math.max(...motivationScores));
  result.motivation_category = {
    value: MOTIVATION_CATEGORIES[maxMotivationIdx],
    score: motivationScores[maxMotivationIdx],
  };

  // Meal occasion
  const occasionScores = centroid.slice(offset, offset + MEAL_OCCASION_CATEGORIES.length);
  offset += MEAL_OCCASION_CATEGORIES.length;
  const maxOccasionIdx = occasionScores.indexOf(Math.max(...occasionScores));
  result.meal_occasion = {
    value: MEAL_OCCASION_CATEGORIES[maxOccasionIdx],
    score: occasionScores[maxOccasionIdx],
  };

  // Cooking for
  const cookingForScores = centroid.slice(offset, offset + COOKING_FOR_CATEGORIES.length);
  offset += COOKING_FOR_CATEGORIES.length;
  const maxCookingForIdx = cookingForScores.indexOf(Math.max(...cookingForScores));
  result.cooking_for = {
    value: COOKING_FOR_CATEGORIES[maxCookingForIdx],
    score: cookingForScores[maxCookingForIdx],
  };

  // Emotion
  const emotionScores = centroid.slice(offset, offset + EMOTION_CATEGORIES.length);
  const maxEmotionIdx = emotionScores.indexOf(Math.max(...emotionScores));
  result.emotion = {
    value: EMOTION_CATEGORIES[maxEmotionIdx],
    score: emotionScores[maxEmotionIdx],
  };

  return result as Record<AttributeField, { value: string; score: number }>;
}

/**
 * Attribute score maps for X-axis (Time & Effort Investment)
 */
const SKILL_EFFORT_MAP: Record<string, number> = {
  beginner: -1.0,
  intermediate: 0,
  advanced: 1.0,
  unknown: 0,
};

const OCCASION_EFFORT_MAP: Record<string, number> = {
  weekday_dinner_rush: -1.0,
  breakfast: -0.8,
  lunch_box: -0.5,
  late_night_snack: -0.3,
  weekday_dinner_leisurely: 0.3,
  weekend_brunch: 0.5,
  weekend_dinner: 0.7,
  party: 1.0,
  unknown: 0,
};

const MOTIVATION_EFFORT_MAP: Record<string, number> = {
  time_pressure: -0.8,
  cost_saving: -0.5,
  skill_confidence: -0.3,
  comfort_food: 0,
  taste_assurance: 0.2,
  health_concern: 0.3,
  variety_seeking: 0.6,
  impression: 0.8,
  unknown: 0,
};

const EMOTION_EFFORT_MAP: Record<string, number> = {
  frustration: -0.5,
  anxiety: -0.4,
  guilt: -0.2,
  neutral: 0,
  relief: 0.2,
  satisfaction: 0.4,
  excitement: 0.5,
  unknown: 0,
};

/**
 * Attribute score maps for Y-axis (Psychological Engagement)
 */
const MOTIVATION_ENGAGEMENT_MAP: Record<string, number> = {
  time_pressure: -0.8,
  cost_saving: -0.4,
  skill_confidence: -0.2,
  comfort_food: 0.1,
  health_concern: 0.3,
  taste_assurance: 0.4,
  variety_seeking: 0.7,
  impression: 1.0,
  unknown: 0,
};

const COOKING_FOR_ENGAGEMENT_MAP: Record<string, number> = {
  self: -0.5,
  multiple: 0.2,
  family: 0.3,
  spouse: 0.4,
  kids: 0.5,
  parents: 0.6,
  guest: 1.0,
  unknown: 0,
};

const LIFE_STAGE_ENGAGEMENT_MAP: Record<string, number> = {
  single: -0.3,
  couple: 0.2,
  empty_nest: 0.3,
  senior: 0.3,
  child_raising: 0.5,
  unknown: 0,
};

const EMOTION_ENGAGEMENT_MAP: Record<string, number> = {
  frustration: -0.5,
  guilt: -0.3,
  anxiety: -0.2,
  neutral: 0,
  relief: 0.3,
  satisfaction: 0.6,
  excitement: 0.8,
  unknown: 0,
};

/**
 * Axis weights configuration
 */
const X_AXIS_WEIGHTS = {
  cooking_skill: 0.35,
  meal_occasion: 0.35,
  motivation_category: 0.20,
  emotion: 0.10,
};

const Y_AXIS_WEIGHTS = {
  motivation_category: 0.35,
  cooking_for: 0.30,
  life_stage: 0.20,
  emotion: 0.15,
};

/**
 * Convert centroid to 2D position using composite scoring
 * X-axis: Time & Effort Investment (手軽・効率重視 ← → 丁寧・時間投資)
 * Y-axis: Psychological Engagement (ルーティン ← → こだわり・喜ばせたい)
 */
export function centroidToPosition(centroid: number[]): { x: number; y: number } {
  const decoded = decodeCentroid(centroid);

  // Calculate X-axis score (Time & Effort Investment)
  const skillScore = SKILL_EFFORT_MAP[decoded.cooking_skill.value] ?? 0;
  const occasionScore = OCCASION_EFFORT_MAP[decoded.meal_occasion.value] ?? 0;
  const motivationEffortScore = MOTIVATION_EFFORT_MAP[decoded.motivation_category.value] ?? 0;
  const emotionEffortScore = EMOTION_EFFORT_MAP[decoded.emotion.value] ?? 0;

  const xRaw =
    skillScore * X_AXIS_WEIGHTS.cooking_skill +
    occasionScore * X_AXIS_WEIGHTS.meal_occasion +
    motivationEffortScore * X_AXIS_WEIGHTS.motivation_category +
    emotionEffortScore * X_AXIS_WEIGHTS.emotion;

  // Calculate Y-axis score (Psychological Engagement)
  const motivationEngagementScore = MOTIVATION_ENGAGEMENT_MAP[decoded.motivation_category.value] ?? 0;
  const cookingForScore = COOKING_FOR_ENGAGEMENT_MAP[decoded.cooking_for.value] ?? 0;
  const lifeStageScore = LIFE_STAGE_ENGAGEMENT_MAP[decoded.life_stage.value] ?? 0;
  const emotionEngagementScore = EMOTION_ENGAGEMENT_MAP[decoded.emotion.value] ?? 0;

  const yRaw =
    motivationEngagementScore * Y_AXIS_WEIGHTS.motivation_category +
    cookingForScore * Y_AXIS_WEIGHTS.cooking_for +
    lifeStageScore * Y_AXIS_WEIGHTS.life_stage +
    emotionEngagementScore * Y_AXIS_WEIGHTS.emotion;

  // Scale to -2 to +2 range with amplification factor (2.5x for wider spread)
  const amplification = 2.5;
  const x = Math.max(-2, Math.min(2, xRaw * amplification));
  const y = Math.max(-2, Math.min(2, yRaw * amplification));

  // Add jitter to avoid exact overlaps (increased from 0.15 to 0.3)
  const jitterX = (Math.random() - 0.5) * 0.3;
  const jitterY = (Math.random() - 0.5) * 0.3;

  return {
    x: Math.round((x + jitterX) * 100) / 100,
    y: Math.round((y + jitterY) * 100) / 100,
  };
}

/**
 * Get Japanese label for an attribute value
 */
export function getJapaneseLabel(
  field: AttributeField,
  value: string
): string {
  const mapping = LABEL_MAPPINGS[field] as Record<string, string>;
  return mapping?.[value] ?? value;
}
