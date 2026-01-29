// コーポレートブランド分析用の型定義

// ============================================
// 基本型
// ============================================

// コーポレートブランド
export interface CorporateBrand {
  id: number;
  name: string;                 // '味の素株式会社'
  ticker_symbol: string | null; // '2802.T'
  english_name: string | null;
  founded_year: number | null;
  headquarters: string | null;
  industry: string | null;
  logo_url: string | null;
}

// ブランド階層
export interface BrandHierarchy {
  id: number;
  corporate_brand_id: number;
  product_brand_id: number;
  weight: number;               // 0-1
  category: string;             // 'seasoning', 'instant_food' 等
  product_brand_name?: string;  // JOINで取得
}

// ============================================
// 株価データ
// ============================================

export interface StockPrice {
  id: number;
  corporate_brand_id: number;
  date: string;                 // 'YYYY-MM-DD'
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  adj_close: number;
  volume: number;
}

// 株価時系列（チャート用）
export interface StockPricePoint {
  date: string;
  close: number;
  volume: number;
  change?: number;              // 前日比（%）
}

// ============================================
// MVV（Mission/Vision/Value）
// ============================================

// パーソナリティ5軸（双極軸: -50〜+50）
export interface PersonalityTraits {
  intellect: number;            // エモーショナル(-50) ↔ ラショナル(+50)
  innovation: number;           // クラシック(-50) ↔ トレンディ(+50)
  warmth: number;               // 独立的(-50) ↔ 共感的(+50)
  reliability: number;          // カジュアル(-50) ↔ フォーマル(+50)
  boldness: number;             // 抑制的(-50) ↔ 表現的(+50)
}

// パーソナリティ軸詳細（スコア根拠）
export interface PersonalityAxisDetail {
  score: number;
  keywords: Record<string, number>;  // キーワード -> 出現回数
  top_evidence: string[];            // 根拠投稿サンプル
}

// パーソナリティ5軸詳細
export interface PersonalityTraitsDetailed {
  intellect: PersonalityAxisDetail;
  innovation: PersonalityAxisDetail;
  warmth: PersonalityAxisDetail;
  reliability: PersonalityAxisDetail;
  boldness: PersonalityAxisDetail;
}

// パーソナリティ代替案（拡張版）
export interface PersonalityAlternative {
  name: string;           // '食卓の頭脳派サポーター'
  description: string;    // 説明文
  tone: string;           // 'トーン: 安心・信頼'
  shadow: string;         // 影（弱点・課題）
}

// MVVエビデンス
export interface MVVEvidence {
  mission_evidence: string[];
  vision_evidence: string[];
  values_evidence: string[];
  personality_evidence: string[];
}

// MVVキャッシュ
export interface CorporateMVV {
  id: number;
  corporate_brand_id: number;

  // MVV
  mission: string | null;
  vision: string | null;
  purpose: string | null;
  values: string[];

  // パーソナリティ
  personality: string | null;   // '料理を支える賢者' 等
  personality_description?: string | null;  // パーソナリティの説明
  personality_tone?: string | null;         // トーン（親しみやすい/尊敬等）
  personality_shadow?: string | null;       // 影（弱点・課題）
  personality_reasoning?: string | null;    // LLMの選定理由
  personality_alternatives?: PersonalityAlternative[];  // 代替案（拡張版）
  personality_traits: PersonalityTraits;
  personality_traits_detailed?: PersonalityTraitsDetailed;  // 詳細スコア根拠

  // エビデンス
  evidence: MVVEvidence;

  // メタ情報
  llm_provider: string;
  llm_model: string;
  posts_analyzed: number;
  methodology?: string;         // 分析手法
  generated_at: string;
  expires_at: string;
}

// ============================================
// Base of Authority
// ============================================

export type AuthorityCategory = 'rd' | 'patent' | 'invention' | 'award' | 'history';

export interface CorporateAuthority {
  id: number;
  corporate_brand_id: number;
  category: AuthorityCategory;
  title: string;
  description: string | null;
  year: number | null;
  source_url: string | null;
  evidence_count: number;
  importance_score: number;     // 0-1
}

// ============================================
// ファン資産
// ============================================

export type FanSegmentType =
  | 'core_fan'
  | 'loyal_fan'
  | 'new_fan'
  | 'casual_user'
  | 'at_risk'
  | 'detractor';

export interface FanAsset {
  id: number;
  corporate_brand_id: number;
  segment_type: FanSegmentType;
  segment_name: string;         // 日本語名

  // セグメント指標
  user_count: number;
  post_count: number;
  avg_sentiment: number;        // -1 to 1
  avg_engagement: number;

  // ウニ/タイヤ可視化用
  relationship_strength: number; // 0-1: トゲの太さ
  relationship_distance: number; // 0-1: トゲの長さ（0=近い）

  // セグメント詳細
  top_keywords: string[];
  representative_posts: { id: string; content: string }[];

  generated_at: string;
}

// ウニ可視化用データポイント
export interface UrchinSpine {
  segment: FanSegmentType;
  name: string;
  angle: number;                // 0-360度
  thickness: number;            // トゲの太さ（relationship_strength）
  length: number;               // トゲの長さ（1 - relationship_distance）
  color: string;                // セグメント色
  userCount: number;
  sentiment: number;
}

// タイヤ可視化用データ
export interface TireRing {
  segment: FanSegmentType;
  name: string;
  innerRadius: number;          // 内側半径
  outerRadius: number;          // 外側半径
  userCount: number;
  color: string;
}

// ============================================
// 株価×UGC相関
// ============================================

export type UGCMetric = 'mention_count' | 'sentiment_score' | 'positive_rate' | 'engagement';
export type StockMetric = 'close_price' | 'price_change' | 'volume';

export interface StockUGCCorrelation {
  id: number;
  corporate_brand_id: number;
  ugc_metric: UGCMetric;
  stock_metric: StockMetric;
  lag_days: number;             // -7 to +7
  correlation_coefficient: number; // -1 to 1
  p_value: number;
  sample_size: number;
  is_significant: boolean;
  start_date: string;
  end_date: string;
  calculated_at: string;
}

// 相関マトリクス（ヒートマップ用）
export interface CorrelationMatrixCell {
  ugc_metric: UGCMetric;
  stock_metric: StockMetric;
  lag_days: number;
  correlation: number;
  is_significant: boolean;
}

// ============================================
// 影響イベント
// ============================================

export type EventType = 'earnings' | 'pr' | 'scandal' | 'product_launch' | 'executive' | 'external';

export interface InfluentialEvent {
  id: number;
  corporate_brand_id: number;
  event_date: string;
  event_type: EventType;
  event_title: string;
  event_description: string | null;

  // 株価影響
  stock_change_percent: number;
  stock_change_days: number;

  // UGC影響
  ugc_spike_percent: number;
  ugc_sentiment_change: number;

  source_url: string | null;
  related_posts: { id: string; content: string }[];
}

// ============================================
// API レスポンス型
// ============================================

// コーポレートサマリー
export interface CorporateSummaryResponse {
  corporate: CorporateBrand;
  product_brands: {
    id: number;
    name: string;
    category: string;
    weight: number;
    mention_count: number;
    sentiment_score: number;
  }[];
  aggregated_metrics: {
    total_mentions: number;
    avg_sentiment: number;
    positive_rate: number;
    cep_coverage: number;
  };
  latest_stock: StockPricePoint | null;
  best_correlation: StockUGCCorrelation | null;
}

// MVVレスポンス
export interface MVVResponse {
  mvv: CorporateMVV;
  cached: boolean;
  generation_time_ms?: number;
}

// パーソナリティレスポンス
export interface PersonalityResponse {
  personality: string;
  traits: PersonalityTraits;
  evidence: string[];
  llm_provider: string;
  generated_at: string;
}

// 株価レスポンス
export interface StockResponse {
  prices: StockPricePoint[];
  ticker: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    latest_price: number;
    change_1d: number;
    change_1w: number;
    change_1m: number;
    change_1y: number;
    volume_avg: number;
  };
}

// 相関レスポンス
export interface CorrelationResponse {
  correlations: StockUGCCorrelation[];
  significant_correlations: StockUGCCorrelation[];
  matrix: CorrelationMatrixCell[];
  best_correlation: StockUGCCorrelation | null;
}

// コーポレートロイヤリティ（高/中/低）
export type LoyaltyLevel = 'high' | 'medium' | 'low';

export interface LoyaltyPost {
  id: number;
  content: string;
  topic: string | null;
  likes: number;
  posted_at?: string;  // YYYY-MM-DD形式
}

export interface LoyaltyLevelData {
  level: LoyaltyLevel;
  name: string;              // 'ロイヤリティ高' etc
  description: string;       // 説明
  count: number;
  percentage: string;        // '27.0'
  color: string;             // '#22c55e'
  representative_posts: LoyaltyPost[];
}

// ロイヤリティ時系列データ
export interface LoyaltyTrendPoint {
  week: string;       // YYYY-MM-DD（月曜始まり）
  high: number;       // positive投稿数
  medium: number;     // neutral投稿数
  low: number;        // negative投稿数
  total: number;
}

export interface CorporateLoyalty {
  total: number;
  levels: LoyaltyLevelData[];
  trends?: LoyaltyTrendPoint[];  // 週次時系列
  generated_at: string;
}

// ファン資産レスポンス
export interface FanAssetsResponse {
  segments: FanAsset[];
  urchin_data: UrchinSpine[];
  tire_data: TireRing[];
  total_fans: number;
  health_score: number;        // 0-100（ファン資産健全度）
  corporate_loyalty?: CorporateLoyalty; // コーポレートロイヤリティ
  generated_at: string;
}

// イベントレスポンス
export interface EventsResponse {
  events: InfluentialEvent[];
  most_impactful: InfluentialEvent | null;
  period: {
    start: string;
    end: string;
  };
}

// Authorityレスポンス
export interface AuthorityResponse {
  authorities: CorporateAuthority[];
  by_category: Record<AuthorityCategory, CorporateAuthority[]>;
  total_count: number;
}

// ============================================
// チャート用データ型
// ============================================

// 株価+UGC 2軸チャート用
export interface StockUGCChartPoint {
  date: string;
  stock_price: number;
  ugc_count: number;
  sentiment: number;
  event?: InfluentialEvent;
}

// ラグ相関ヒートマップ用
export interface LagCorrelationHeatmapData {
  lag_days: number[];           // [-7, -6, ..., 6, 7]
  metrics: UGCMetric[];
  values: number[][];           // [ugc_metric_index][lag_index]
}

// ============================================
// 定数
// ============================================

export const FAN_SEGMENT_COLORS: Record<FanSegmentType, string> = {
  core_fan: '#22c55e',          // 緑
  loyal_fan: '#3b82f6',         // 青
  new_fan: '#f59e0b',           // 黄
  casual_user: '#8b5cf6',       // 紫
  at_risk: '#f97316',           // オレンジ
  detractor: '#ef4444',         // 赤
};

export const FAN_SEGMENT_LABELS: Record<FanSegmentType, string> = {
  core_fan: '熱狂的支持者',
  loyal_fan: 'ロイヤルファン',
  new_fan: '新規ファン',
  casual_user: 'カジュアルユーザー',
  at_risk: '離反リスク',
  detractor: 'デトラクター',
};

export const UGC_METRIC_LABELS: Record<UGCMetric, string> = {
  mention_count: '言及数',
  sentiment_score: 'センチメントスコア',
  positive_rate: 'ポジティブ率',
  engagement: 'エンゲージメント',
};

export const STOCK_METRIC_LABELS: Record<StockMetric, string> = {
  close_price: '終値',
  price_change: '変動率',
  volume: '出来高',
};

export const AUTHORITY_CATEGORY_LABELS: Record<AuthorityCategory, string> = {
  rd: 'R&D',
  patent: '特許',
  invention: '発明',
  award: '受賞',
  history: '沿革',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  earnings: '決算',
  pr: 'PR/広報',
  scandal: '不祥事',
  product_launch: '新製品',
  executive: '経営陣',
  external: '外部要因',
};

// ============================================
// デフォルト値
// ============================================

export const DEFAULT_PERSONALITY_TRAITS: PersonalityTraits = {
  intellect: 0,
  innovation: 0,
  warmth: 0,
  reliability: 0,
  boldness: 0,
};

// 双極軸ラベル
export interface BipolarLabel {
  left: string;   // -50側
  right: string;  // +50側
}

export const PERSONALITY_TRAIT_LABELS: Record<keyof PersonalityTraits, BipolarLabel> = {
  intellect: { left: 'エモーショナル', right: 'ラショナル' },
  innovation: { left: 'クラシック', right: 'トレンディ' },
  warmth: { left: '独立的', right: '共感的' },
  reliability: { left: 'カジュアル', right: 'フォーマル' },
  boldness: { left: '抑制的', right: '表現的' },
};

// ============================================
// 世の中分析（World Analysis）
// ============================================

export type WorldNewsSourceType = 'news' | 'report' | 'sns' | 'blog' | 'manual';
export type WorldNewsSentiment = 'positive' | 'neutral' | 'negative';
export type WorldNewsCategory =
  | 'ir_finance'
  | 'product_service'
  | 'esg_sustainability'
  | 'management'
  | 'industry'
  | 'reputation'
  | 'other';

// 自社/競合/業界ラベル
export type WorldNewsCompanyRelevance = 'self' | 'competitor' | 'industry';

// 世の中ニュースアイテム
export interface WorldNewsItem {
  id: string;
  corp_id: number;
  title: string;
  content: string | null;
  url: string;
  source_name: string;
  source_type: WorldNewsSourceType;
  published_at: string;
  fetched_at: string;

  // LLM分析結果
  category: WorldNewsCategory | null;
  sentiment: WorldNewsSentiment | null;
  sentiment_score: number | null;
  relevance_score: number | null;
  summary: string | null;
  keywords: string[];
  is_important: boolean;
  company_relevance_type: WorldNewsCompanyRelevance | null;

  // メタデータ
  author: string | null;
  image_url: string | null;

  created_at: string;
  updated_at: string;
}

// カテゴリマスタ
export interface WorldNewsCategoryMaster {
  id: number;
  name: string;
  label: string;
  color: string;
  priority: number;
}

// フェッチログ
export interface WorldNewsFetchLog {
  id: string;
  corp_id: number;
  source: string;
  fetched_at: string;
  articles_count: number;
  status: 'success' | 'error' | 'partial';
  error_message: string | null;
  duration_ms: number | null;
}

// ============================================
// 世の中分析 API レスポンス型
// ============================================

// ニュース一覧レスポンス
export interface WorldNewsListResponse {
  news: WorldNewsItem[];
  total: number;
  page: number;
  limit: number;
  filters: {
    category?: WorldNewsCategory;
    sentiment?: WorldNewsSentiment;
    source_type?: WorldNewsSourceType;
    company_relevance?: WorldNewsCompanyRelevance;
    start_date?: string;
    end_date?: string;
    is_important?: boolean;
  };
}

// カテゴリ別集計
export interface WorldNewsCategorySummary {
  category: string;
  label: string;
  color: string;
  count: number;
  percentage: number;
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

// センチメント集計
export interface WorldNewsSentimentSummary {
  sentiment: WorldNewsSentiment;
  count: number;
  percentage: number;
  avg_score: number;
}

// サマリーレスポンス
export interface WorldNewsSummaryResponse {
  total_news: number;
  by_category: WorldNewsCategorySummary[];
  by_sentiment: WorldNewsSentimentSummary[];
  by_source_type: { source_type: WorldNewsSourceType; count: number }[];
  important_count: number;
  last_fetched_at: string | null;
  date_range: {
    earliest: string | null;
    latest: string | null;
  };
}

// アラートレスポンス
export interface WorldNewsAlert {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  source_name: string;
  category: WorldNewsCategory | null;
  sentiment: WorldNewsSentiment | null;
  relevance_score: number | null;
  published_at: string;
}

export interface WorldNewsAlertsResponse {
  alerts: WorldNewsAlert[];
  total: number;
}

// 手動インポートリクエスト
export interface WorldNewsImportRequest {
  url: string;
  title?: string;
  content?: string;
  source_name?: string;
  source_type?: WorldNewsSourceType;
  published_at?: string;
}

// ============================================
// 世の中分析 定数
// ============================================

export const WORLD_NEWS_SOURCE_TYPE_LABELS: Record<WorldNewsSourceType, string> = {
  news: 'ニュース',
  report: 'レポート',
  sns: 'SNS',
  blog: 'ブログ',
  manual: '手動登録',
};

export const WORLD_NEWS_CATEGORY_LABELS: Record<string, string> = {
  ir_finance: 'IR・財務',
  product_service: '製品・サービス',
  esg_sustainability: 'ESG・サステナ',
  management: '経営・人事',
  industry: '業界動向',
  reputation: '評判・評価',
  other: 'その他',
};

export const WORLD_NEWS_CATEGORY_COLORS: Record<string, string> = {
  ir_finance: '#3B82F6',
  product_service: '#10B981',
  esg_sustainability: '#8B5CF6',
  management: '#F59E0B',
  industry: '#EC4899',
  reputation: '#06B6D4',
  other: '#6B7280',
};

export const WORLD_NEWS_SENTIMENT_LABELS: Record<WorldNewsSentiment, string> = {
  positive: 'ポジティブ',
  neutral: 'ニュートラル',
  negative: 'ネガティブ',
};

export const WORLD_NEWS_SENTIMENT_COLORS: Record<WorldNewsSentiment, string> = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#ef4444',
};

// 自社/競合/業界ラベル定数
export const WORLD_NEWS_COMPANY_RELEVANCE_LABELS: Record<WorldNewsCompanyRelevance, string> = {
  self: '自社',
  competitor: '競合',
  industry: '業界',
};

export const WORLD_NEWS_COMPANY_RELEVANCE_COLORS: Record<WorldNewsCompanyRelevance, string> = {
  self: '#3B82F6',      // 青
  competitor: '#EF4444', // 赤
  industry: '#F59E0B',   // オレンジ
};

// ============================================
// 戦略提案（Strategy）
// ============================================

// 戦略入力データ（各タブからの集約）
export interface StrategyInput {
  // UGC分析から
  ugc: {
    totalPosts: number;
    positiveRate: number;
    topTopics: { name: string; count: number }[];
    recentSpikes: { date: string; event: string; impact: string }[];
    sentimentTrend: 'improving' | 'stable' | 'declining';
  };

  // 株価×UGCから
  stockCorrelation: {
    coefficient: number;           // ピアソン相関係数
    optimalLag: number;            // 最適ラグ日数
    significance: 'high' | 'medium' | 'low';
  };

  // ファン資産から
  loyalty: {
    high: { count: number; percentage: number };
    medium: { count: number; percentage: number };
    low: { count: number; percentage: number };
    trend: 'growing' | 'stable' | 'shrinking';
  };

  // 世の中分析から
  worldNews: {
    topCategories: string[];
    emergingTrends: string[];
    competitorMoves: string[];
  };
}

// 課題
export interface StrategyChallenge {
  description: string;
  severity: 'high' | 'medium' | 'low';
  source: 'ugc' | 'stock' | 'loyalty' | 'world';
}

// 機会
export interface StrategyOpportunity {
  description: string;
  potential: 'high' | 'medium' | 'low';
  source: 'ugc' | 'stock' | 'loyalty' | 'world';
}

// 戦略提案
export interface StrategyRecommendation {
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  expectedImpact: string;
  relatedData: string;           // 根拠となるデータ
}

// アクションプラン
export interface StrategyActionPlan {
  shortTerm: string[];           // 1ヶ月
  midTerm: string[];             // 3ヶ月
  longTerm: string[];            // 1年
}

// 戦略生成出力
export interface StrategyOutput {
  strengths: string[];           // 現状の強み
  challenges: StrategyChallenge[];
  opportunities: StrategyOpportunity[];
  recommendations: StrategyRecommendation[];
  actionPlan: StrategyActionPlan;
}

// 戦略APIレスポンス
export interface StrategyResponse {
  input: StrategyInput;
  strategy: StrategyOutput;
  generatedAt: string;
  model: string;                 // 使用したLLMモデル
  cached: boolean;
}

// 戦略定数
export const STRATEGY_SOURCE_LABELS: Record<StrategyChallenge['source'], string> = {
  ugc: 'UGC分析',
  stock: '株価×UGC',
  loyalty: 'ファン資産',
  world: '世の中分析',
};

export const STRATEGY_SEVERITY_COLORS: Record<StrategyChallenge['severity'], string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b7280',
};

export const STRATEGY_POTENTIAL_COLORS: Record<StrategyOpportunity['potential'], string> = {
  high: '#22c55e',
  medium: '#3b82f6',
  low: '#6b7280',
};

export const STRATEGY_PRIORITY_LABELS: Record<StrategyRecommendation['priority'], string> = {
  1: '最優先',
  2: '重要',
  3: '推奨',
};

// ============================================
// ロイヤリティサマリーインサイト
// ============================================

// トピック分布
export interface TopicDistribution {
  topic: string;
  topicLabel: string;
  count: number;
  percentage: number;
  color: string;
}

// ロイヤリティレベル内の個別ペルソナ
export interface LoyaltyPersona {
  id: string;                        // "high_p1", "high_p2"
  personaName: string;               // "株式投資家"
  ageRange: string;                  // "40-50代"
  lifeStage: string;                 // "投資家・ビジネスパーソン"
  interests: string[];               // ["株価動向", "企業業績"]
  motivations: string[];             // ["資産運用", "情報収集"]
  voiceTone: string[];               // ["期待", "分析的"]
  representativeQuote: string;       // 実際の投稿から引用
  representativeQuoteUrl?: string;   // 投稿URL（クリックで元投稿に遷移）
  representativeQuotePostId?: number; // sns_posts.id
  postCount: number;
  percentage: number;                // このレベル内の割合
}

// ロイヤリティレベル別インサイト
export interface LoyaltySummaryInsight {
  level: LoyaltyLevel;
  levelName: string;
  levelColor: string;
  count: number;
  percentage: string;
  personas: LoyaltyPersona[];        // 2-3ペルソナ
  topicDistribution: TopicDistribution[];
  // 後方互換（deprecated）
  customerProfile?: string;          // 顧客像
  mainInterests?: string[];          // 主な関心事
  voiceTone?: string[];              // 声のトーン
  keywords?: string[];               // キーワード
}

// ロイヤリティサマリーレスポンス
export interface LoyaltySummaryResponse {
  insights: LoyaltySummaryInsight[];
  generatedAt: string;
  cached: boolean;
}

// ============================================
// ロイヤリティ成長戦略（Loyalty Growth Strategy）
// ============================================

// 転換トリガー
export interface ConversionTrigger {
  type: 'topic' | 'event' | 'content' | 'engagement';
  name: string;
  description: string;
  impactScore: number;           // 0-100
  frequency: number;             // 観測回数
}

// 転換ファネルデータ
export interface LoyaltyConversionFunnel {
  fromLevel: LoyaltyLevel;
  toLevel: LoyaltyLevel;
  conversionRate: number;        // 0-100%
  averageTimeToConvert: number;  // 日数
  sampleSize: number;
  topTriggers: ConversionTrigger[];
}

// トピック嗜好
export interface TopicPreference {
  topic: string;
  topicLabel: string;
  engagementRate: number;        // 平均比
  loyaltyCorrelation: number;    // -1 to 1
}

// エンゲージメント指標
export interface EngagementMetrics {
  avgPostFrequency: number;      // 月間投稿数
  avgLikes: number;
  avgRetweets: number;
  avgReplies: number;
}

// 行動パターン分析
export interface LoyaltyBehavioralPattern {
  level: LoyaltyLevel;
  engagementMetrics: EngagementMetrics;
  topicPreferences: TopicPreference[];
}

// 予測マイルストーン
export interface ProjectedMilestone {
  date: string;
  highPercentage: number;
  mediumPercentage: number;
  lowPercentage: number;
  keyAction: string;
}

// ロイヤリティ成長目標
export interface LoyaltyGrowthTarget {
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
  projectedTimeline: ProjectedMilestone[];
}

// 戦略KPI
export interface StrategyKPI {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
}

// ロイヤリティ戦略提案
export interface LoyaltyStrategyRecommendation {
  segment: 'medium_to_high' | 'low_to_medium' | 'retention';
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  timeToResult: string;
  requiredResources: string[];
  kpis: StrategyKPI[];
}

// ロイヤリティ成長APIレスポンス
export interface LoyaltyGrowthResponse {
  conversionFunnels: LoyaltyConversionFunnel[];
  behavioralPatterns: LoyaltyBehavioralPattern[];
  growthTargets: LoyaltyGrowthTarget;
  recommendations: LoyaltyStrategyRecommendation[];
  generatedAt: string;
  cached: boolean;
  isFallback?: boolean;          // LLM失敗時の静的フォールバックフラグ
  inputHash?: string;            // 入力データハッシュ（キャッシュ検証用）
}

// ============================================
// ロイヤリティ成長戦略 定数
// ============================================

export const LOYALTY_SEGMENT_LABELS: Record<LoyaltyStrategyRecommendation['segment'], string> = {
  medium_to_high: '中→高転換',
  low_to_medium: '低→中転換',
  retention: '高層維持',
};

export const IMPLEMENTATION_EFFORT_LABELS: Record<LoyaltyStrategyRecommendation['implementationEffort'], string> = {
  low: '低',
  medium: '中',
  high: '高',
};

export const IMPLEMENTATION_EFFORT_COLORS: Record<LoyaltyStrategyRecommendation['implementationEffort'], string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
};

// ============================================
// ネガティブ分析（Negative Analysis）
// ============================================

// ネガティブカテゴリ
export type NegativeCategory =
  | 'additive_concern'    // 添加物懸念
  | 'stealth_marketing'   // ステマ・PR批判
  | 'scandal_reaction'    // 企業スキャンダル反応
  | 'cost_performance'    // コスパ不満
  | 'white_company_gap'   // ホワイト企業ギャップ
  | 'quality_taste'       // 品質・味
  | 'portfolio_confusion' // ポートフォリオ混乱
  | 'stock_criticism'     // 株価批判
  | 'uncategorized';      // 未分類

// 時系列データポイント
export interface NegativeTrendPoint {
  week: string;                                    // "2024-01-01"
  total: number;                                   // 総ネガ数
  categories: Record<NegativeCategory, number>;   // カテゴリ別件数
}

// カテゴリ別深刻度
export interface CategorySeverity {
  category: NegativeCategory;
  categoryLabel: string;                           // 日本語名
  count: number;                                   // 件数
  avgLikes: number;                                // 平均いいね数
  avgRetweets: number;                             // 平均リツイート数
  severityScore: number;                           // 総合スコア（0-100）
  trend: 'increasing' | 'stable' | 'decreasing';  // トレンド方向
  topPosts: Array<{ id: string; text: string; likes: number; published: string }>;
}

// ネガティブ分析APIレスポンス
export interface NegativeAnalysisResponse {
  timeSeries: NegativeTrendPoint[];
  categories: CategorySeverity[];
  summary: {
    totalNegative: number;
    categorizedCount: number;
    uncategorizedCount: number;
    overallTrend: 'increasing' | 'stable' | 'decreasing';
    mostCriticalCategory: NegativeCategory;
  };
  generatedAt: string;
  cached: boolean;
}

// ============================================
// ネガティブ分析 定数
// ============================================

export const NEGATIVE_CATEGORY_LABELS: Record<NegativeCategory, string> = {
  additive_concern: '添加物懸念',
  stealth_marketing: 'ステマ・PR批判',
  scandal_reaction: '企業スキャンダル',
  cost_performance: 'コスパ不満',
  white_company_gap: 'ホワイト企業ギャップ',
  quality_taste: '品質・味',
  portfolio_confusion: 'ポートフォリオ混乱',
  stock_criticism: '株価批判',
  uncategorized: '未分類',
};

export const NEGATIVE_CATEGORY_COLORS: Record<NegativeCategory, string> = {
  additive_concern: '#ef4444',     // 赤
  stealth_marketing: '#f97316',    // オレンジ
  scandal_reaction: '#dc2626',     // 濃い赤
  cost_performance: '#eab308',     // 黄
  white_company_gap: '#a855f7',    // 紫
  quality_taste: '#f43f5e',        // ローズ
  portfolio_confusion: '#6366f1',  // インディゴ
  stock_criticism: '#64748b',      // スレート
  uncategorized: '#9ca3af',        // グレー
};

// カテゴリ分類用キーワード
export const NEGATIVE_CATEGORY_KEYWORDS: Record<NegativeCategory, string[]> = {
  additive_concern: ['MSG', '化学調味料', '添加物', '人工', '合成', 'うま味調味料', '体に悪い', '発がん', '健康被害', 'グルタミン酸'],
  stealth_marketing: ['ステマ', 'PR', '案件', '広告', 'タイアップ', '宣伝', 'プロモーション', 'インフルエンサー', '押し売り'],
  scandal_reaction: ['不祥事', '問題', '謝罪', '隠蔽', '説明責任', '炎上', 'リュウジ', 'スキャンダル', '不正'],
  cost_performance: ['値上げ', '高い', '代わり', '代替', '乗り換え', 'コスパ', '安い方', '割高', '価格'],
  white_company_gap: ['ブラック', '労働', '残業', '採用', '落ちた', '福利厚生', '退職', 'パワハラ', '過労'],
  quality_taste: ['まずい', '美味しくない', '味が変わった', '品質', 'リニューアル', '劣化', '不味い', '味落ちた'],
  portfolio_confusion: ['半導体', '多角化', '本業', '事業拡大', '迷走', 'バイオ', '何の会社'],
  stock_criticism: ['株', '配当', '株主', '株価', '投資', '損', '暴落', '下落'],
  uncategorized: [],
};

export const NEGATIVE_TREND_LABELS: Record<CategorySeverity['trend'], string> = {
  increasing: '増加傾向',
  stable: '横ばい',
  decreasing: '減少傾向',
};

export const NEGATIVE_TREND_COLORS: Record<CategorySeverity['trend'], string> = {
  increasing: '#ef4444',
  stable: '#6b7280',
  decreasing: '#22c55e',
};
