"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { SNSPost, SNSDataResponse, SNSFilters } from "@/types/data.types";
import { BRAND_COLORS } from "@/lib/utils/colors";

// ラベルマッピング定義
const SOURCE_LABELS: Record<string, string> = {
  twitter: "Twitter",
  news: "ニュース",
  blog: "ブログ",
  messageboard: "掲示板",
  other: "その他",
};

const SENTIMENT_LABELS: Record<string, { label: string; color: string }> = {
  positive: { label: "ポジティブ", color: "bg-green-100 text-green-800" },
  neutral: { label: "ニュートラル", color: "bg-gray-100 text-gray-800" },
  negative: { label: "ネガティブ", color: "bg-red-100 text-red-800" },
};

const IMPACT_LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: "メイン", color: "bg-emerald-100 text-emerald-800" },
  medium: { label: "関連", color: "bg-yellow-100 text-yellow-800" },
  low: { label: "サブ", color: "bg-gray-100 text-gray-600" },
};

const CORPORATE_LABELS: Record<string, { label: string; color: string }> = {
  true: { label: "企業情報", color: "bg-purple-100 text-purple-800" },
  false: { label: "商品関連", color: "bg-green-100 text-green-800" },
};

const INTENT_LABELS: Record<string, { label: string; color: string }> = {
  purchase_consider: { label: "購入検討", color: "bg-blue-100 text-blue-800" },
  usage_report: { label: "使用報告", color: "bg-green-100 text-green-800" },
  recipe_share: { label: "レシピ共有", color: "bg-yellow-100 text-yellow-800" },
  question: { label: "質問", color: "bg-purple-100 text-purple-800" },
  complaint: { label: "不満", color: "bg-red-100 text-red-800" },
  other: { label: "その他", color: "bg-gray-100 text-gray-800" },
};

const EMOTION_LABELS: Record<string, { label: string; color: string }> = {
  anxiety: { label: "不安", color: "bg-yellow-100 text-yellow-800" },
  relief: { label: "安心", color: "bg-green-100 text-green-800" },
  satisfaction: { label: "満足", color: "bg-blue-100 text-blue-800" },
  guilt: { label: "罪悪感", color: "bg-purple-100 text-purple-800" },
  excitement: { label: "ワクワク", color: "bg-pink-100 text-pink-800" },
  frustration: { label: "イライラ", color: "bg-red-100 text-red-800" },
  neutral: { label: "特になし", color: "bg-gray-100 text-gray-800" },
};

const DISH_CATEGORY_LABELS: Record<string, string> = {
  soup: "汁物",
  stir_fry: "炒め物",
  stew: "煮込み",
  chinese: "中華",
  rice: "ご飯もの",
  salad: "サラダ",
  noodle: "麺類",
  fried: "揚げ物",
  grilled: "焼き物",
  seasoning: "下味・調味",
  other: "その他",
  unknown: "不明",
};

const MEAL_OCCASION_LABELS: Record<string, string> = {
  weekday_dinner_rush: "平日夜（急ぎ）",
  weekday_dinner_leisurely: "平日夜（ゆっくり）",
  weekend_brunch: "週末ブランチ",
  weekend_dinner: "週末夕食",
  lunch_box: "お弁当",
  late_night_snack: "夜食・晩酌",
  breakfast: "朝食",
  party: "パーティー",
  unknown: "不明",
};

const COOKING_FOR_LABELS: Record<string, string> = {
  self: "自分用",
  family: "家族",
  kids: "子ども",
  spouse: "配偶者",
  parents: "親・高齢者",
  guest: "来客",
  multiple: "複数",
  unknown: "不明",
};

const MOTIVATION_LABELS: Record<string, string> = {
  time_pressure: "時間がない",
  taste_assurance: "味を失敗したくない",
  health_concern: "健康志向",
  cost_saving: "節約",
  skill_confidence: "料理に自信がない",
  variety_seeking: "いつもと違うもの",
  comfort_food: "定番・安心感",
  impression: "相手を喜ばせたい",
  unknown: "不明",
};

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "朝",
  afternoon: "昼",
  evening: "夕方",
  night: "夜",
};

const DAY_TYPE_LABELS: Record<string, string> = {
  weekday: "平日",
  weekend: "週末",
};

const LIFE_STAGE_LABELS: Record<string, string> = {
  single: "一人暮らし",
  couple: "二人暮らし",
  child_raising: "子育て中",
  empty_nest: "子供独立後",
  senior: "シニア",
  unknown: "不明",
};

const COOKING_SKILL_LABELS: Record<string, string> = {
  beginner: "初心者",
  intermediate: "中級者",
  advanced: "上級者",
  unknown: "不明",
};

const WITH_WHOM_LABELS: Record<string, string> = {
  solo: "一人",
  family: "家族",
  kids: "子ども",
  guest: "来客",
  unknown: "不明",
};

const CEP_OPTIONS = [
  { id: 1, name: "time_saving_weeknight", label: "平日夜の時短" },
  { id: 2, name: "taste_anxiety", label: "味付け不安解消" },
  { id: 3, name: "weekend_cooking", label: "週末の本格料理" },
  { id: 4, name: "kids_picky_eating", label: "子ども好き嫌い" },
  { id: 5, name: "solo_easy_meal", label: "一人暮らし手抜き" },
  { id: 6, name: "health_conscious", label: "健康意識" },
  { id: 7, name: "entertaining", label: "おもてなし" },
  { id: 8, name: "drinking_snacks", label: "晩酌おつまみ" },
  { id: 9, name: "leftover_remake", label: "残り物リメイク" },
  { id: 10, name: "seasonal_taste", label: "季節の味覚" },
  { id: 11, name: "diet_satisfaction", label: "ダイエット中" },
  { id: 12, name: "morning_time_save", label: "朝の時短" },
];

const BRANDS = [
  "味の素",
  "ほんだし",
  "クックドゥ",
  "コンソメ",
  "丸鶏がらスープ",
  "香味ペースト",
  "アジシオ",
  "ピュアセレクト",
  "コーポレート", // 企業情報（株価、CSR、採用など）
];

// 列定義
const COLUMN_DEFINITIONS = [
  { key: "date", label: "日付", default: true },
  { key: "source", label: "ソース", default: true },
  { key: "brand", label: "ブランド", default: true },
  { key: "impact_level", label: "影響度", default: true },
  { key: "sentiment", label: "感情", default: true },
  { key: "engagement_total", label: "ENG合計", default: true },
  { key: "likes_count", label: "いいね", default: false },
  { key: "retweets_count", label: "RT", default: false },
  { key: "impressions", label: "IMP", default: false },
  { key: "followers", label: "FW数", default: false },
  { key: "intent", label: "意図", default: false },
  { key: "emotion", label: "感情詳細", default: false },
  { key: "cep", label: "CEP", default: true },
  { key: "dish_category", label: "料理カテゴリ", default: false },
  { key: "dish_name", label: "料理名", default: false },
  { key: "meal_occasion", label: "食事シーン", default: false },
  { key: "cooking_for", label: "誰のため", default: false },
  { key: "motivation", label: "動機", default: false },
  { key: "time_slot", label: "時間帯", default: false },
  { key: "day_type", label: "曜日種別", default: false },
  { key: "life_stage", label: "ライフステージ", default: false },
  { key: "cooking_skill", label: "料理スキル", default: false },
  { key: "with_whom", label: "誰と食べる", default: false },
  { key: "when_detail", label: "いつ詳細", default: false },
  { key: "why_motivation", label: "なぜ動機", default: false },
  { key: "paired_keywords", label: "関連KW", default: false },
  { key: "author_name", label: "投稿者", default: false },
  { key: "is_corporate", label: "コーポレート", default: false },
  { key: "content", label: "内容", default: true },
  { key: "link", label: "リンク", default: true },
];

export function SNSDataView() {
  const [data, setData] = useState<SNSPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<SNSFilters>({
    sources: ["twitter", "news", "blog", "messageboard"],
    brands: [],
    search: "",
    sentiment: "all",
    cep_id: "all",
    intent: "all",
    emotion: "all",
    dish_category: "all",
    meal_occasion: "all",
    cooking_for: "all",
    motivation_category: "all",
    cooking_skill: "all",
    with_whom: "all",
    impact_level: "all",
    is_corporate: "all",
  });
  const [searchInput, setSearchInput] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    COLUMN_DEFINITIONS.filter((c) => c.default).map((c) => c.key)
  );
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [excludeCampaign, setExcludeCampaign] = useState(false);
  const limit = 50;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (filters.sources.length > 0) {
          params.set("sources", filters.sources.join(","));
        }
        if (filters.brands.length > 0) {
          params.set("brands", filters.brands.join(","));
        }
        if (filters.search) {
          params.set("search", filters.search);
        }
        if (filters.sentiment && filters.sentiment !== "all") {
          params.set("sentiment", filters.sentiment);
        }
        if (filters.cep_id && filters.cep_id !== "all") {
          params.set("cep_id", filters.cep_id.toString());
        }
        // 追加フィルター
        if (filters.intent && filters.intent !== "all") {
          params.set("intent", filters.intent);
        }
        if (filters.emotion && filters.emotion !== "all") {
          params.set("emotion", filters.emotion);
        }
        if (filters.dish_category && filters.dish_category !== "all") {
          params.set("dish_category", filters.dish_category);
        }
        if (filters.meal_occasion && filters.meal_occasion !== "all") {
          params.set("meal_occasion", filters.meal_occasion);
        }
        if (filters.cooking_for && filters.cooking_for !== "all") {
          params.set("cooking_for", filters.cooking_for);
        }
        if (filters.motivation_category && filters.motivation_category !== "all") {
          params.set("motivation_category", filters.motivation_category);
        }
        if (filters.cooking_skill && filters.cooking_skill !== "all") {
          params.set("cooking_skill", filters.cooking_skill);
        }
        if (filters.with_whom && filters.with_whom !== "all") {
          params.set("with_whom", filters.with_whom);
        }
        // キャンペーン除外フラグ
        if (excludeCampaign) {
          params.set("excludeCampaign", "true");
        }
        // ブランド影響度フィルター
        if (filters.impact_level && filters.impact_level !== "all") {
          params.set("impact_level", filters.impact_level);
        }
        // コーポレートタグフィルター
        // 「コーポレート」ブランド選択時は is_corporate=true でフィルタ
        const hasCorporateBrand = filters.brands.includes("コーポレート");
        const hasProductBrands = filters.brands.filter(b => b !== "コーポレート").length > 0;

        if (hasCorporateBrand && !hasProductBrands) {
          // コーポレートのみ選択 → コーポレートUGCのみ表示
          params.set("is_corporate", "true");
          // brand_mentionsフィルタは不要なのでbrandsパラメータをクリア
          params.delete("brands");
        } else if (hasProductBrands && !hasCorporateBrand) {
          // 製品ブランドのみ選択 → コーポレートUGCを除外（is_corporateフィルタが未指定の場合）
          if (filters.is_corporate === undefined || filters.is_corporate === "all") {
            params.set("is_corporate", "false");
          } else {
            params.set("is_corporate", String(filters.is_corporate));
          }
        } else if (filters.is_corporate !== undefined && filters.is_corporate !== "all") {
          // 明示的にコーポレートフィルターが設定されている場合
          params.set("is_corporate", String(filters.is_corporate));
        }

        const res = await fetch(`/api/data/sns?${params}`);
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        const json: SNSDataResponse = await res.json();
        setData(json.data);
        setTotal(json.total);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "データの取得に失敗しました";
        setError(errorMessage);
        console.error("Failed to fetch SNS data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, filters, excludeCampaign]);

  const handleSearch = () => {
    setFilters((f) => ({ ...f, search: searchInput }));
    setPage(1);
  };

  const toggleSource = (source: string) => {
    setFilters((f) => ({
      ...f,
      sources: f.sources.includes(source)
        ? f.sources.filter((s) => s !== source)
        : [...f.sources, source],
    }));
    setPage(1);
  };

  const toggleBrand = (brand: string) => {
    setFilters((f) => ({
      ...f,
      brands: f.brands.includes(brand)
        ? f.brands.filter((b) => b !== brand)
        : [...f.brands, brand],
    }));
    setPage(1);
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns((cols) =>
      cols.includes(key) ? cols.filter((c) => c !== key) : [...cols, key]
    );
  };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split(" ");
      return parts[0].replace(/\//g, "-");
    } catch {
      return dateStr;
    }
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (!content) return "";
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  const clearFilters = () => {
    setFilters({
      sources: ["twitter", "news", "blog", "messageboard"],
      brands: [],
      search: "",
      sentiment: "all",
      cep_id: "all",
      intent: "all",
      emotion: "all",
      dish_category: "all",
      meal_occasion: "all",
      cooking_for: "all",
      motivation_category: "all",
      cooking_skill: "all",
      with_whom: "all",
      impact_level: "all",
      is_corporate: "all",
    });
    setSearchInput("");
    setPage(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      {/* Sidebar Filters */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">フィルター</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* キャンペーン除外トグル */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeCampaign}
                onChange={(e) => {
                  setExcludeCampaign(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-amber-400"
              />
              <span className="text-sm font-medium text-amber-800">
                キャンペーン投稿を除外
              </span>
            </label>
            <p className="text-xs text-amber-600 mt-1 ml-5">
              「私が作りたい料理は」等のキャンペーン投稿を非表示
            </p>
          </div>

          {/* Search */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              キーワード検索
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="検索..."
                className="flex-1 px-2 py-1 text-sm border rounded"
              />
              <button
                onClick={handleSearch}
                className="px-3 py-2 border rounded hover:bg-gray-200 active:bg-gray-300 active:scale-95 transition-all duration-150"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Source Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              ソース
            </label>
            <div className="space-y-1">
              {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.sources.includes(key)}
                    onChange={() => toggleSource(key)}
                    className="rounded"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              ブランド
            </label>
            <div className="space-y-1">
              {BRANDS.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="rounded"
                  />
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        BRAND_COLORS[brand as keyof typeof BRAND_COLORS],
                    }}
                  />
                  {brand}
                </label>
              ))}
            </div>
          </div>

          {/* Sentiment Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              センチメント
            </label>
            <select
              value={filters.sentiment || "all"}
              onChange={(e) => {
                setFilters((f) => ({
                  ...f,
                  sentiment: e.target.value as "positive" | "neutral" | "negative" | "all",
                }));
                setPage(1);
              }}
              className="w-full px-2 py-1 text-sm border rounded"
            >
              <option value="all">すべて</option>
              <option value="positive">ポジティブ</option>
              <option value="neutral">ニュートラル</option>
              <option value="negative">ネガティブ</option>
            </select>
          </div>

          {/* CEP Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              CEP（生活文脈）
            </label>
            <select
              value={filters.cep_id?.toString() || "all"}
              onChange={(e) => {
                const val = e.target.value;
                setFilters((f) => ({
                  ...f,
                  cep_id: val === "all" ? "all" : parseInt(val, 10),
                }));
                setPage(1);
              }}
              className="w-full px-2 py-1 text-sm border rounded"
            >
              <option value="all">すべて</option>
              {CEP_OPTIONS.map((cep) => (
                <option key={cep.id} value={cep.id}>
                  {cep.label}
                </option>
              ))}
            </select>
          </div>

          {/* Impact Level Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              ブランド影響度
            </label>
            <select
              value={filters.impact_level || "all"}
              onChange={(e) => {
                setFilters((f) => ({
                  ...f,
                  impact_level: e.target.value as "high" | "medium" | "low" | "all",
                }));
                setPage(1);
              }}
              className="w-full px-2 py-1 text-sm border rounded"
            >
              <option value="all">すべて</option>
              <option value="high">メイン（主題）</option>
              <option value="medium">関連（組み合わせ）</option>
              <option value="low">サブ（背景）</option>
            </select>
          </div>

          {/* Corporate Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              コーポレートタグ
            </label>
            <select
              value={filters.is_corporate === "all" ? "all" : String(filters.is_corporate)}
              onChange={(e) => {
                const val = e.target.value;
                setFilters((f) => ({
                  ...f,
                  is_corporate: val === "all" ? "all" : val === "true",
                }));
                setPage(1);
              }}
              className="w-full px-2 py-1 text-sm border rounded"
            >
              <option value="all">すべて</option>
              <option value="false">商品関連</option>
              <option value="true">企業情報（株価・CSR等）</option>
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-full py-1 hover:bg-muted/50 rounded transition-all duration-200"
          >
            {showAdvancedFilters ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            詳細フィルター
          </button>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="space-y-3 pt-2 border-t">
              {/* Intent Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  意図
                </label>
                <select
                  value={filters.intent || "all"}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, intent: e.target.value as typeof filters.intent }));
                    setPage(1);
                  }}
                  className="w-full px-2 py-1 text-xs border rounded"
                >
                  <option value="all">すべて</option>
                  {Object.entries(INTENT_LABELS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Emotion Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  感情詳細
                </label>
                <select
                  value={filters.emotion || "all"}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, emotion: e.target.value as typeof filters.emotion }));
                    setPage(1);
                  }}
                  className="w-full px-2 py-1 text-xs border rounded"
                >
                  <option value="all">すべて</option>
                  {Object.entries(EMOTION_LABELS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Dish Category Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  料理カテゴリ
                </label>
                <select
                  value={filters.dish_category || "all"}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, dish_category: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full px-2 py-1 text-xs border rounded"
                >
                  <option value="all">すべて</option>
                  {Object.entries(DISH_CATEGORY_LABELS).filter(([k]) => k !== "unknown").map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Meal Occasion Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  食事シーン
                </label>
                <select
                  value={filters.meal_occasion || "all"}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, meal_occasion: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full px-2 py-1 text-xs border rounded"
                >
                  <option value="all">すべて</option>
                  {Object.entries(MEAL_OCCASION_LABELS).filter(([k]) => k !== "unknown").map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Cooking For Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  誰のため
                </label>
                <select
                  value={filters.cooking_for || "all"}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, cooking_for: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full px-2 py-1 text-xs border rounded"
                >
                  <option value="all">すべて</option>
                  {Object.entries(COOKING_FOR_LABELS).filter(([k]) => k !== "unknown").map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Motivation Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  動機
                </label>
                <select
                  value={filters.motivation_category || "all"}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, motivation_category: e.target.value }));
                    setPage(1);
                  }}
                  className="w-full px-2 py-1 text-xs border rounded"
                >
                  <option value="all">すべて</option>
                  {Object.entries(MOTIVATION_LABELS).filter(([k]) => k !== "unknown").map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Cooking Skill Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  料理スキル
                </label>
                <select
                  value={filters.cooking_skill || "all"}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, cooking_skill: e.target.value as typeof filters.cooking_skill }));
                    setPage(1);
                  }}
                  className="w-full px-2 py-1 text-xs border rounded"
                >
                  <option value="all">すべて</option>
                  {Object.entries(COOKING_SKILL_LABELS).filter(([k]) => k !== "unknown").map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* With Whom Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  誰と食べる
                </label>
                <select
                  value={filters.with_whom || "all"}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, with_whom: e.target.value as typeof filters.with_whom }));
                    setPage(1);
                  }}
                  className="w-full px-2 py-1 text-xs border rounded"
                >
                  <option value="all">すべて</option>
                  {Object.entries(WITH_WHOM_LABELS).filter(([k]) => k !== "unknown").map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            フィルターをクリア
          </button>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <CardTitle>SNS 生データ</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {total.toLocaleString()} 件
            </span>
            {/* Column Settings */}
            <div className="relative">
              <button
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className="flex items-center gap-1 px-2 py-1 text-xs border rounded hover:bg-muted"
              >
                <Settings className="h-3 w-3" />
                列設定
              </button>
              {showColumnSettings && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg p-3 z-50 w-48 max-h-80 overflow-y-auto">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    表示列を選択
                  </p>
                  {COLUMN_DEFINITIONS.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 text-xs cursor-pointer py-1"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.key)}
                        onChange={() => toggleColumn(col.key)}
                        className="rounded"
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              エラー: {error}
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              データが見つかりません
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead>
                    <tr className="border-b">
                      {visibleColumns.includes("date") && (
                        <th className="px-2 py-2 text-left w-20 sticky left-0 bg-white">日付</th>
                      )}
                      {visibleColumns.includes("source") && (
                        <th className="px-2 py-2 text-left w-16">ソース</th>
                      )}
                      {visibleColumns.includes("brand") && (
                        <th className="px-2 py-2 text-left w-24">ブランド</th>
                      )}
                      {visibleColumns.includes("impact_level") && (
                        <th className="px-2 py-2 text-left w-20">影響度</th>
                      )}
                      {visibleColumns.includes("sentiment") && (
                        <th className="px-2 py-2 text-left w-20">感情</th>
                      )}
                      {visibleColumns.includes("engagement_total") && (
                        <th className="px-2 py-2 text-right w-16">ENG</th>
                      )}
                      {visibleColumns.includes("likes_count") && (
                        <th className="px-2 py-2 text-right w-14">いいね</th>
                      )}
                      {visibleColumns.includes("retweets_count") && (
                        <th className="px-2 py-2 text-right w-14">RT</th>
                      )}
                      {visibleColumns.includes("impressions") && (
                        <th className="px-2 py-2 text-right w-16">IMP</th>
                      )}
                      {visibleColumns.includes("followers") && (
                        <th className="px-2 py-2 text-right w-16">FW数</th>
                      )}
                      {visibleColumns.includes("intent") && (
                        <th className="px-2 py-2 text-left w-20">意図</th>
                      )}
                      {visibleColumns.includes("emotion") && (
                        <th className="px-2 py-2 text-left w-20">感情詳細</th>
                      )}
                      {visibleColumns.includes("cep") && (
                        <th className="px-2 py-2 text-left w-24">CEP</th>
                      )}
                      {visibleColumns.includes("dish_category") && (
                        <th className="px-2 py-2 text-left w-20">料理カテゴリ</th>
                      )}
                      {visibleColumns.includes("dish_name") && (
                        <th className="px-2 py-2 text-left w-24">料理名</th>
                      )}
                      {visibleColumns.includes("meal_occasion") && (
                        <th className="px-2 py-2 text-left w-24">食事シーン</th>
                      )}
                      {visibleColumns.includes("cooking_for") && (
                        <th className="px-2 py-2 text-left w-20">誰のため</th>
                      )}
                      {visibleColumns.includes("motivation") && (
                        <th className="px-2 py-2 text-left w-28">動機</th>
                      )}
                      {visibleColumns.includes("time_slot") && (
                        <th className="px-2 py-2 text-left w-14">時間帯</th>
                      )}
                      {visibleColumns.includes("day_type") && (
                        <th className="px-2 py-2 text-left w-14">曜日</th>
                      )}
                      {visibleColumns.includes("life_stage") && (
                        <th className="px-2 py-2 text-left w-20">ライフステージ</th>
                      )}
                      {visibleColumns.includes("cooking_skill") && (
                        <th className="px-2 py-2 text-left w-20">料理スキル</th>
                      )}
                      {visibleColumns.includes("with_whom") && (
                        <th className="px-2 py-2 text-left w-20">誰と食べる</th>
                      )}
                      {visibleColumns.includes("when_detail") && (
                        <th className="px-2 py-2 text-left w-28">いつ詳細</th>
                      )}
                      {visibleColumns.includes("why_motivation") && (
                        <th className="px-2 py-2 text-left w-28">なぜ動機</th>
                      )}
                      {visibleColumns.includes("paired_keywords") && (
                        <th className="px-2 py-2 text-left w-32">関連KW</th>
                      )}
                      {visibleColumns.includes("author_name") && (
                        <th className="px-2 py-2 text-left w-24">投稿者</th>
                      )}
                      {visibleColumns.includes("is_corporate") && (
                        <th className="px-2 py-2 text-left w-20">コーポレート</th>
                      )}
                      {visibleColumns.includes("content") && (
                        <th className="px-2 py-2 text-left">内容</th>
                      )}
                      {visibleColumns.includes("link") && (
                        <th className="px-2 py-2 text-center w-10">リンク</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((post, idx) => (
                      <tr
                        key={`${post.url}-${idx}`}
                        className={`${idx % 2 === 0 ? "bg-muted/20" : ""} hover:bg-muted/40`}
                      >
                        {visibleColumns.includes("date") && (
                          <td className="px-2 py-2 font-mono text-xs sticky left-0 bg-inherit">
                            {formatDate(post.published)}
                          </td>
                        )}
                        {visibleColumns.includes("source") && (
                          <td className="px-2 py-2">
                            <span
                              className={`inline-block px-1.5 py-0.5 text-xs rounded ${
                                post.source_category === "twitter"
                                  ? "bg-blue-100 text-blue-800"
                                  : post.source_category === "news"
                                    ? "bg-green-100 text-green-800"
                                    : post.source_category === "blog"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {SOURCE_LABELS[post.source_category || "other"]}
                            </span>
                          </td>
                        )}
                        {visibleColumns.includes("brand") && (
                          <td className="px-2 py-2">
                            {post.is_corporate ? (
                              <span className="inline-block px-1 py-0.5 text-xs rounded bg-indigo-600 text-white">
                                コーポレート
                              </span>
                            ) : post.brand_mentions ? (
                              <div className="flex flex-wrap gap-1">
                                {post.brand_mentions.split(",").map((brand) => (
                                  <span
                                    key={brand}
                                    className="inline-block px-1 py-0.5 text-xs rounded text-white"
                                    style={{
                                      backgroundColor:
                                        BRAND_COLORS[
                                          brand.trim() as keyof typeof BRAND_COLORS
                                        ] || "#666",
                                    }}
                                  >
                                    {brand.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("impact_level") && (
                          <td className="px-2 py-2">
                            {post.brand_impacts && post.brand_impacts.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {post.brand_impacts.map((impact, i) => (
                                  <span
                                    key={`${impact.brand_name}-${i}`}
                                    className={`inline-block px-1 py-0.5 text-xs rounded ${IMPACT_LEVEL_LABELS[impact.impact_level]?.color || "bg-gray-100"}`}
                                    title={impact.analysis_reason || `${impact.brand_name}: ${IMPACT_LEVEL_LABELS[impact.impact_level]?.label}`}
                                  >
                                    {impact.brand_name.slice(0, 4)}:{IMPACT_LEVEL_LABELS[impact.impact_level]?.label || impact.impact_level}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("sentiment") && (
                          <td className="px-2 py-2">
                            {post.sentiment ? (
                              <span
                                className={`inline-block px-1.5 py-0.5 text-xs rounded ${SENTIMENT_LABELS[post.sentiment]?.color || "bg-gray-100"}`}
                              >
                                {SENTIMENT_LABELS[post.sentiment]?.label || post.sentiment}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("engagement_total") && (
                          <td className="px-2 py-2 text-right text-xs font-mono">
                            {post.engagement_total ? (
                              <span className="text-orange-600 font-medium">
                                {post.engagement_total.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("likes_count") && (
                          <td className="px-2 py-2 text-right text-xs font-mono">
                            {post.likes_count ? (
                              <span className="text-pink-600">
                                {post.likes_count.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("retweets_count") && (
                          <td className="px-2 py-2 text-right text-xs font-mono">
                            {post.retweets_count ? (
                              <span className="text-green-600">
                                {post.retweets_count.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("impressions") && (
                          <td className="px-2 py-2 text-right text-xs font-mono">
                            {post.impressions ? (
                              <span className="text-blue-600">
                                {post.impressions.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("followers") && (
                          <td className="px-2 py-2 text-right text-xs font-mono">
                            {post.followers ? (
                              <span className="text-purple-600">
                                {post.followers.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("intent") && (
                          <td className="px-2 py-2">
                            {post.intent ? (
                              <span
                                className={`inline-block px-1.5 py-0.5 text-xs rounded ${INTENT_LABELS[post.intent]?.color || "bg-gray-100"}`}
                              >
                                {INTENT_LABELS[post.intent]?.label || post.intent}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("emotion") && (
                          <td className="px-2 py-2">
                            {post.emotion ? (
                              <span
                                className={`inline-block px-1.5 py-0.5 text-xs rounded ${EMOTION_LABELS[post.emotion]?.color || "bg-gray-100"}`}
                              >
                                {EMOTION_LABELS[post.emotion]?.label || post.emotion}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("cep") && (
                          <td className="px-2 py-2 text-xs">
                            {post.cep ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                                {CEP_OPTIONS.find((c) => c.id === post.cep_id)?.label || post.cep.cep_name}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("dish_category") && (
                          <td className="px-2 py-2 text-xs">
                            {post.dish_category && post.dish_category !== "unknown" ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-orange-50 text-orange-700">
                                {DISH_CATEGORY_LABELS[post.dish_category] || post.dish_category}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("dish_name") && (
                          <td className="px-2 py-2 text-xs">
                            {post.dish_name ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                                {post.dish_name}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("meal_occasion") && (
                          <td className="px-2 py-2 text-xs">
                            {post.meal_occasion && post.meal_occasion !== "unknown" ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-teal-50 text-teal-700">
                                {MEAL_OCCASION_LABELS[post.meal_occasion] || post.meal_occasion}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("cooking_for") && (
                          <td className="px-2 py-2 text-xs">
                            {post.cooking_for && post.cooking_for !== "unknown" ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                                {COOKING_FOR_LABELS[post.cooking_for] || post.cooking_for}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("motivation") && (
                          <td className="px-2 py-2 text-xs">
                            {post.motivation_category && post.motivation_category !== "unknown" ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
                                {MOTIVATION_LABELS[post.motivation_category] || post.motivation_category}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("time_slot") && (
                          <td className="px-2 py-2 text-xs">
                            {post.time_slot ? (
                              <span className="text-muted-foreground">
                                {TIME_SLOT_LABELS[post.time_slot] || post.time_slot}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("day_type") && (
                          <td className="px-2 py-2 text-xs">
                            {post.day_type ? (
                              <span className="text-muted-foreground">
                                {DAY_TYPE_LABELS[post.day_type] || post.day_type}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("life_stage") && (
                          <td className="px-2 py-2 text-xs">
                            {post.life_stage && post.life_stage !== "unknown" ? (
                              <span className="text-muted-foreground">
                                {LIFE_STAGE_LABELS[post.life_stage] || post.life_stage}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("cooking_skill") && (
                          <td className="px-2 py-2 text-xs">
                            {post.cooking_skill && post.cooking_skill !== "unknown" ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700">
                                {COOKING_SKILL_LABELS[post.cooking_skill] || post.cooking_skill}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("with_whom") && (
                          <td className="px-2 py-2 text-xs">
                            {post.with_whom && post.with_whom !== "unknown" ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-violet-50 text-violet-700">
                                {WITH_WHOM_LABELS[post.with_whom] || post.with_whom}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("when_detail") && (
                          <td className="px-2 py-2 text-xs">
                            {post.when_detail ? (
                              <span className="text-muted-foreground">
                                {truncateContent(post.when_detail, 30)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("why_motivation") && (
                          <td className="px-2 py-2 text-xs">
                            {post.why_motivation ? (
                              <span className="text-muted-foreground">
                                {truncateContent(post.why_motivation, 30)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("paired_keywords") && (
                          <td className="px-2 py-2 text-xs">
                            {post.paired_keywords && post.paired_keywords.length > 0 ? (
                              <span className="text-muted-foreground">
                                {post.paired_keywords.slice(0, 3).join(", ")}
                                {post.paired_keywords.length > 3 && "..."}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("author_name") && (
                          <td className="px-2 py-2 text-xs">
                            {post.author_name ? (
                              <span className="text-muted-foreground">
                                {truncateContent(post.author_name, 20)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("is_corporate") && (
                          <td className="px-2 py-2 text-xs">
                            {post.is_corporate !== null && post.is_corporate !== undefined ? (
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded ${
                                  post.is_corporate
                                    ? CORPORATE_LABELS["true"].color
                                    : CORPORATE_LABELS["false"].color
                                }`}
                                title={post.corporate_reason || undefined}
                              >
                                {post.is_corporate
                                  ? CORPORATE_LABELS["true"].label
                                  : CORPORATE_LABELS["false"].label}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.includes("content") && (
                          <td className="px-2 py-2 text-xs max-w-md">
                            <div className="line-clamp-2">
                              {truncateContent(post.content, 150)}
                            </div>
                          </td>
                        )}
                        {visibleColumns.includes("link") && (
                          <td className="px-2 py-2 text-center">
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink className="h-4 w-4 inline" />
                            </a>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {((page - 1) * limit + 1).toLocaleString()} -{" "}
                  {Math.min(page * limit, total).toLocaleString()} /{" "}
                  {total.toLocaleString()} 件
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 border rounded disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 border rounded disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
