"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ExternalLink,
  Heart,
  Repeat,
  Sparkles,
  Crown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Flame,
} from "lucide-react";
import type { SNSPost } from "@/types/data.types";

// ブランド一覧（固定）
const BRANDS = [
  "ほんだし",
  "クックドゥ",
  "味の素",
  "丸鶏がらスープ",
  "香味ペースト",
  "コンソメ",
  "ピュアセレクト",
  "アジシオ",
];

// センチメント設定
const SENTIMENT_CONFIG: Record<
  string,
  { icon: typeof ThumbsUp; color: string; bgColor: string; label: string }
> = {
  positive: {
    icon: ThumbsUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
    label: "ポジティブ",
  },
  neutral: {
    icon: Minus,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    label: "ニュートラル",
  },
  negative: {
    icon: ThumbsDown,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "ネガティブ",
  },
};

interface ReviewsResponse {
  data: SNSPost[];
  total: number;
  page: number;
  limit: number;
}

export function ReviewCardsTab() {
  const [posts, setPosts] = useState<SNSPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  // フィルター状態
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [unexpectedFilter, setUnexpectedFilter] = useState<string>("all");
  const [buzzOnly, setBuzzOnly] = useState<boolean>(false);

  // バズ投稿の閾値（engagement_total >= 100）
  const BUZZ_THRESHOLD = 100;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (brandFilter !== "all") {
        params.set("brand", brandFilter);
      }
      if (sentimentFilter !== "all") {
        params.set("sentiment", sentimentFilter);
      }
      if (unexpectedFilter !== "all") {
        params.set("is_unexpected", unexpectedFilter);
      }
      if (buzzOnly) {
        params.set("min_engagement", BUZZ_THRESHOLD.toString());
      }

      const res = await fetch(`/api/reviews?${params.toString()}`);
      if (!res.ok) throw new Error("データの取得に失敗しました");

      const json: ReviewsResponse = await res.json();
      setPosts(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("口コミデータの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [page, brandFilter, sentimentFilter, unexpectedFilter, buzzOnly]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // フィルター変更時にページをリセット
  const handleFilterChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const renderPost = (post: SNSPost, index: number) => {
    const sentimentConfig =
      SENTIMENT_CONFIG[post.sentiment || "neutral"] || SENTIMENT_CONFIG.neutral;
    const SentimentIcon = sentimentConfig.icon;

    // ブランドバッジの色
    const brandImpact = post.brand_impacts?.[0];
    const brandColor = brandImpact?.brand_color || "#6b7280";

    return (
      <Card
        key={`${post.url}-${index}`}
        className="hover:shadow-lg transition-all duration-200 overflow-hidden"
      >
        <CardContent className="p-4">
          {/* ヘッダー: ブランド + 意外性 + 日付 */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* ブランドバッジ */}
              {brandImpact && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  {brandImpact.brand_name}
                </span>
              )}
              {/* 意外性バッジ */}
              {post.is_unexpected === true && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  意外
                </span>
              )}
              {post.is_unexpected === false && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  王道
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(post.published)}
            </span>
          </div>

          {/* 投稿内容 */}
          <p className="text-sm line-clamp-4 mb-3 min-h-[5rem]">
            {post.content || post.title || "（内容なし）"}
          </p>

          {/* フッター: センチメント + エンゲージメント + リンク */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3">
              {/* センチメント */}
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded ${sentimentConfig.bgColor}`}
              >
                <SentimentIcon
                  className={`h-3 w-3 ${sentimentConfig.color}`}
                />
                <span className={`text-xs ${sentimentConfig.color}`}>
                  {sentimentConfig.label}
                </span>
              </div>

              {/* エンゲージメント */}
              {(post.likes_count || 0) > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Heart className="h-3 w-3" />
                  {formatNumber(post.likes_count || 0)}
                </div>
              )}
              {(post.retweets_count || 0) > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Repeat className="h-3 w-3" />
                  {formatNumber(post.retweets_count || 0)}
                </div>
              )}
            </div>

            {/* 元投稿リンク */}
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              元投稿
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* フィルターUI */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* ブランドフィルター */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">ブランド:</label>
              <select
                value={brandFilter}
                onChange={(e) =>
                  handleFilterChange(setBrandFilter, e.target.value)
                }
                className="px-3 py-1.5 text-sm border rounded-md bg-background"
              >
                <option value="all">すべて</option>
                {BRANDS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* 意外性フィルター */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">タイプ:</label>
              <select
                value={unexpectedFilter}
                onChange={(e) =>
                  handleFilterChange(setUnexpectedFilter, e.target.value)
                }
                className="px-3 py-1.5 text-sm border rounded-md bg-background"
              >
                <option value="all">すべて</option>
                <option value="true">意外</option>
                <option value="false">王道</option>
              </select>
            </div>

            {/* センチメントフィルター */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">センチメント:</label>
              <select
                value={sentimentFilter}
                onChange={(e) =>
                  handleFilterChange(setSentimentFilter, e.target.value)
                }
                className="px-3 py-1.5 text-sm border rounded-md bg-background"
              >
                <option value="all">すべて</option>
                <option value="positive">ポジティブ</option>
                <option value="neutral">ニュートラル</option>
                <option value="negative">ネガティブ</option>
              </select>
            </div>

            {/* バズ投稿フィルター */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={buzzOnly}
                  onChange={(e) => {
                    setBuzzOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="flex items-center gap-1 text-sm font-medium">
                  <Flame className="h-4 w-4 text-orange-500" />
                  バズ投稿のみ
                </span>
                <span className="text-xs text-muted-foreground">
                  (ENG≥{BUZZ_THRESHOLD})
                </span>
              </label>
            </div>

            {/* 件数表示 */}
            <div className="ml-auto text-sm text-muted-foreground">
              {total.toLocaleString()}件
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ローディング状態 */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* エラー状態 */}
      {error && !loading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-400" />
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* データ表示 */}
      {!loading && !error && (
        <>
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>該当する口コミがありません</p>
                <p className="text-sm mt-2">
                  フィルター条件を変更してお試しください
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {posts.map((post, index) => renderPost(post, index))}
            </div>
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                前へ
              </button>

              <div className="flex items-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span className="text-sm">
                  {page} / {totalPages}ページ
                </span>
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
