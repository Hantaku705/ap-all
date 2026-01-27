// ペルソナ分析用の型定義

// ペルソナの散布図上の位置
export interface PersonaPosition {
  x: number; // 料理スキル（-2:初心者 ～ +2:上級者）
  y: number; // こだわり度（-2:手抜き志向 ～ +2:本格志向）
}

// ペルソナの属性情報
export interface PersonaAttributes {
  life_stage: string;         // "子育て世帯", "一人暮らし"等
  cooking_skill: string;      // "初級", "中級", "上級"
  primary_motivation: string; // "時短・効率化", "本格的な味"等
  primary_occasion: string;   // "平日夕食", "週末料理"等
  primary_emotion: string;    // "焦り", "満足感"等
}

// ペルソナの行動パターン
export interface PersonaBehavior {
  cooking_for: string[];      // ["家族", "子ども"]
  peak_occasions: string[];   // ["平日夕食", "急ぎの食事"]
  keywords: string[];         // ["時短", "簡単", "子ども向け"]
}

// ペルソナの指標
export interface PersonaMetrics {
  post_count: number;         // 該当投稿数
  avg_engagement: number;     // 平均エンゲージメント
  share_percentage: number;   // シェア率（%）
  is_real_data?: boolean;     // 実測値フラグ（true=クラスタリング結果）
}

// ペルソナへの行動推奨（NEW）
export interface PersonaRecommendations {
  targetCEPs: string[];       // このペルソナに効果的なCEP
  contentThemes: string[];    // 推奨コンテンツテーマ
  communicationTips: string[]; // コミュニケーション施策
}

// ペルソナの深いインサイト（NEW）
export interface PersonaInsights {
  painPoints: string[];       // 課題・不満
  motivations: string[];      // 動機・欲求
  brandPerception: string;    // ブランドへの認識
}

// unknown率（各属性）
export interface UnknownRates {
  life_stage: number;
  cooking_skill: number;
  motivation_category: number;
  meal_occasion: number;
  cooking_for: number;
  emotion: number;
  average: number;
}

// クラスタリング品質メトリクス
export interface ClusteringQuality {
  silhouetteScore: number;      // -1〜1、高いほどクラスターが明確
  unknownRates: UnknownRates;   // 各属性のunknown率
  dataCompleteness: number;     // データ完全性（0-100%）
  clusterSeparation: number;    // クラスター分離度（0-100）
  overallConfidence: number;    // 総合信頼度（0-100）
  postsAnalyzed: number;        // 分析対象の総投稿数
  postsClustered: number;       // クラスタリングに使用した投稿数
  postsExcluded: number;        // 除外された投稿数
  clusteringMethod: string;     // 'kmeans' | 'legacy'
  clusterSizes?: number[];      // 各クラスターのサイズ
}

// 単一ペルソナ
export interface Persona {
  id: string;                 // "p_1", "p_2"等
  name: string;               // "忙しいワーママ"
  description: string;        // 詳細説明
  brand: string;              // "ほんだし"
  position: PersonaPosition;  // 散布図上の位置
  attributes: PersonaAttributes;
  behavior: PersonaBehavior;
  metrics: PersonaMetrics;
  sample_posts: string[];     // 代表的な投稿（5件）
  recommendations?: PersonaRecommendations; // 行動推奨（NEW）
  insights?: PersonaInsights; // 深いインサイト（NEW）
}

// クラスター設定（軸定義）
export interface ClusterAxisConfig {
  label: string;              // "料理スキル"
  min: number;                // -2
  max: number;                // 2
  labels: {
    min: string;              // "初心者"
    max: string;              // "上級者"
  };
}

export interface ClusterConfig {
  x_axis: ClusterAxisConfig;
  y_axis: ClusterAxisConfig;
}

// API レスポンス（単一ブランド）
export interface PersonaResponse {
  brand: string;
  personas: Persona[];
  clusterConfig: ClusterConfig;
  postCount: number;
  personaCount: number;
  generatedAt: string;
  expiresAt: string;
  cached: boolean;
  llmProvider?: string;
  llmModel?: string;
  generationTimeMs?: number;
  quality?: ClusteringQuality;  // クラスタリング品質メトリクス
}

// API レスポンス（全ブランド）
export interface AllPersonasResponse {
  brands: PersonaResponse[];
  totalPersonas: number;
  clusterConfig: ClusterConfig;
  generatedAt: string;
}

// 散布図用データポイント（Recharts用）
export interface PersonaScatterPoint {
  x: number;
  y: number;
  z: number;                  // バブルサイズ（post_count）
  persona: Persona;
  brand: string;
  color: string;              // ブランドカラー
}

// クラスター境界（ReferenceArea用）
export interface ClusterBoundary {
  brand: string;
  color: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  opacity: number;
}

// 詳細パネル用
export interface PersonaDetail {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
}

// フィルター状態
export interface PersonaFilters {
  selectedBrands: string[];
  showClusterBoundaries: boolean;
  highlightedPersona: string | null;
}

// デフォルトのクラスター設定
export const DEFAULT_CLUSTER_CONFIG: ClusterConfig = {
  x_axis: {
    label: "時間・労力投資",
    min: -2,
    max: 2,
    labels: {
      min: "手軽・効率重視",
      max: "丁寧・時間投資",
    },
  },
  y_axis: {
    label: "心理的関与度",
    min: -2,
    max: 2,
    labels: {
      min: "ルーティン",
      max: "こだわり・喜ばせたい",
    },
  },
};
