// 新機能用の型定義

// ブランド影響度
export type ImpactLevel = "high" | "medium" | "low";

export interface BrandImpact {
  brand_id: number;
  brand_name: string;
  brand_color?: string;
  impact_level: ImpactLevel;
  confidence_score: number;
  analysis_reason?: string;
}

// Google Trends 生データ
export interface GoogleTrendsRow {
  date: string;
  ほんだし: number;
  クックドゥ: number;
  味の素: number;
  丸鶏がらスープ: number;
  香味ペースト: number;
  コンソメ: number;
  ピュアセレクト: number;
  アジシオ: number;
}

export interface GoogleTrendsResponse {
  data: GoogleTrendsRow[];
  total: number;
  page: number;
  limit: number;
}

// センチメント・CEP型
export type Sentiment = "positive" | "neutral" | "negative";

// UGCラベリング用ENUM型
export type TimeSlot = "morning" | "afternoon" | "evening" | "night";
export type DayType = "weekday" | "weekend";
export type Intent = "purchase_consider" | "usage_report" | "recipe_share" | "question" | "complaint" | "other";
export type LifeStage = "single" | "couple" | "child_raising" | "empty_nest" | "senior" | "unknown";
export type CookingSkill = "beginner" | "intermediate" | "advanced" | "unknown";
export type Emotion = "anxiety" | "relief" | "satisfaction" | "guilt" | "excitement" | "frustration" | "neutral";
export type WithWhom = "solo" | "family" | "kids" | "guest" | "unknown";

// CEPカテゴリ（12種類）
export type CEPCategory =
  | "time_saving_weeknight"  // 平日夜の時短ニーズ
  | "taste_anxiety"          // 味付け不安の解消
  | "weekend_cooking"        // 週末の本格料理挑戦
  | "kids_picky_eating"      // 子どもの好き嫌い対策
  | "solo_easy_meal"         // 一人暮らしの手抜き飯
  | "health_conscious"       // 健康意識
  | "entertaining"           // おもてなし料理
  | "drinking_snacks"        // 晩酌のおつまみ
  | "leftover_remake"        // 残り物リメイク
  | "seasonal_taste"         // 季節の味覚
  | "diet_satisfaction"      // ダイエット中の満足感
  | "morning_time_save";     // 朝の時間節約

export interface CEP {
  id: number;
  cep_name: string;
  description: string;
}

// SNS 生データ
export interface SNSPost {
  url: string;
  published: string;
  title: string;
  content: string;
  lang: string;
  source_type: string;
  extra_author_attributes_name: string | null;
  brand_mentions?: string;
  brand_count?: number;
  is_multi_brand?: boolean;
  content_length?: number;
  has_negative_kw?: boolean;
  source_category?: "twitter" | "news" | "blog" | "messageboard" | "other";
  sentiment?: Sentiment | null;
  cep_id?: number | null;
  cep?: CEP | null;
  // UGCラベリング用カラム
  time_slot?: TimeSlot | null;
  day_type?: DayType | null;
  intent?: Intent | null;
  life_stage?: LifeStage | null;
  cooking_skill?: CookingSkill | null;
  emotion?: Emotion | null;
  with_whom?: WithWhom | null;
  when_detail?: string | null;
  why_motivation?: string | null;
  paired_keywords?: string[] | null;
  cep_category?: CEPCategory | null;
  // W's詳細カラム（008_cep_detail.sql）
  dish_category?: string | null;       // soup, stir_fry, stew, chinese, rice等
  dish_name?: string | null;           // 味噌汁、麻婆豆腐等
  meal_occasion?: string | null;       // weekday_dinner_rush, weekend_brunch等
  cooking_for?: string | null;         // self, family, kids, spouse等
  motivation_category?: string | null; // time_pressure, taste_assurance等
  // 投稿者情報
  author_name?: string | null;         // 投稿者名
  // エンゲージメント
  likes_count?: number;                // いいね数
  retweets_count?: number;             // リツイート数
  comments_count?: number;             // コメント数
  engagement_total?: number;           // 合計エンゲージメント
  impressions?: number;                // インプレッション
  followers?: number;                  // フォロワー数
  // ブランド影響度
  brand_impacts?: BrandImpact[];       // 各ブランドの影響度
  // 口コミ分類
  is_unexpected?: boolean | null;      // 意外性: true=意外, false=王道, null=未判定
  // コーポレートタグ
  is_corporate?: boolean | null;       // 企業情報: true=企業情報, false=商品関連, null=未判定
  corporate_reason?: string | null;    // コーポレート判定理由
}

export interface SNSDataResponse {
  data: SNSPost[];
  total: number;
  page: number;
  limit: number;
  note?: string;
}

export interface SNSFilters {
  sources: string[];
  brands: string[];
  search: string;
  startDate?: string;
  endDate?: string;
  sentiment?: Sentiment | "all";
  cep_id?: number | "all";
  // UGCラベリング用フィルター
  time_slot?: TimeSlot | "all";
  day_type?: DayType | "all";
  intent?: Intent | "all";
  life_stage?: LifeStage | "all";
  emotion?: Emotion | "all";
  cep_category?: CEPCategory | "all";
  cooking_skill?: CookingSkill | "all";
  with_whom?: WithWhom | "all";
  // W's詳細フィルター
  dish_category?: string | "all";
  meal_occasion?: string | "all";
  cooking_for?: string | "all";
  motivation_category?: string | "all";
  // ブランド影響度フィルター
  impact_level?: ImpactLevel | "all";
  // 口コミ分類フィルター
  is_unexpected?: boolean | "all";
  // コーポレートタグフィルター
  is_corporate?: boolean | "all";
}

// レポート
export interface Report {
  id: string;
  title: string;
  path?: string;
  category: "total" | "sns" | "googletrend" | "brand" | "issue";
  isDynamic?: boolean;
  brandName?: string;
  issueId?: string;
}

// 投稿原文エビデンス
export interface SamplePost {
  content: string;
  sentiment?: "positive" | "neutral" | "negative";
  engagement?: number;
  source?: string;
  date?: string;
  url?: string;
}

// ペルソナサマリー（レポート用）
export interface PersonaSummary {
  id: string;
  name: string;
  description: string;
  postCount: number;
  sharePercentage: number;
  avgEngagement: number;
  keywords: string[];
}

// Issue分析レポート（3層分析フレームワーク）
export interface IssueSection {
  title: string;
  question: string;
  // Layer 1: FACT（事実）
  findings: string[];
  dataTable?: Array<Record<string, string | number>>;
  samplePosts?: SamplePost[];
  personas?: PersonaSummary[];
  // Layer 2: INSIGHT（洞察）
  insights?: string[];
  crossAnalysis?: string;
  // Layer 3: ACTION（施策）
  recommendations?: string[];
  priority?: 'high' | 'medium' | 'low';
}

export interface IssueReport {
  issueId: string;
  title: string;
  generatedAt: string;
  sections: IssueSection[];
  strategy: {
    findings: string[];
    recommendations: string[];
    keyInsight: string;
  };
  markdown: string;
}

// ブランド別動的レポート
export interface BrandReport {
  brandName: string;
  generatedAt: string;
  summary: {
    mentionShare: number;
    positiveRate: number;
    negativeRate: number;
    topCEP: string;
  };
  trends: {
    googleTrendsPeak: string;
    snsWeeklyChange: number;
  };
  cep: {
    topCEPs: Array<{ name: string; score: number; quadrant: string }>;
    portfolioDistribution: Record<string, number>;
  };
  dpt: {
    useCases: Array<{
      name: string;
      count: number;
      context: string;
      positioning: { pop: string[]; pod: string[] };
    }>;
  };
  wsDetail: {
    topDishCategory: string;
    topMealOccasion: string;
    topMotivation: string;
  };
  relations: {
    positiveCorrelations: string[];
    cooccurrences: Array<{ brand: string; count: number }>;
  };
  strategy: {
    strengths: string[];
    risks: string[];
    opportunities: string[];
  };
  markdown: string;
}

export interface ReportContent {
  content: string;
  headings: ReportHeading[];
}

export interface ReportHeading {
  level: number;
  text: string;
  id: string;
}

// チャット
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  section?: string;
  tab?: string;
  selectedBrand?: string;
}

export interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  context?: ChatContext;
}

export interface ChatResponse {
  message: string;
}

// ページネーション共通
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
