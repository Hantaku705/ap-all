"use client";

import { ExternalLink, AlertCircle, Clock } from "lucide-react";
import {
  WorldNewsItem,
  WORLD_NEWS_CATEGORY_COLORS,
  WORLD_NEWS_CATEGORY_LABELS,
  WORLD_NEWS_SENTIMENT_COLORS,
  WORLD_NEWS_SENTIMENT_LABELS,
  WORLD_NEWS_SOURCE_TYPE_LABELS,
  WORLD_NEWS_COMPANY_RELEVANCE_LABELS,
  WORLD_NEWS_COMPANY_RELEVANCE_COLORS,
  WorldNewsCompanyRelevance,
} from "@/types/corporate.types";

interface WorldNewsCardProps {
  news: WorldNewsItem;
  showFull?: boolean;
}

export function WorldNewsCard({ news, showFull = false }: WorldNewsCardProps) {
  const categoryColor = WORLD_NEWS_CATEGORY_COLORS[news.category || "other"];
  const categoryLabel = WORLD_NEWS_CATEGORY_LABELS[news.category || "other"];
  const sentimentColor = WORLD_NEWS_SENTIMENT_COLORS[news.sentiment || "neutral"];
  const sentimentLabel = WORLD_NEWS_SENTIMENT_LABELS[news.sentiment || "neutral"];
  const sourceTypeLabel = WORLD_NEWS_SOURCE_TYPE_LABELS[news.source_type];
  const companyRelevanceType = news.company_relevance_type as WorldNewsCompanyRelevance | null;
  const companyRelevanceLabel = companyRelevanceType ? WORLD_NEWS_COMPANY_RELEVANCE_LABELS[companyRelevanceType] : null;
  const companyRelevanceColor = companyRelevanceType ? WORLD_NEWS_COMPANY_RELEVANCE_COLORS[companyRelevanceType] : null;

  const publishedDate = news.published_at
    ? new Date(news.published_at).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "日付不明";

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* ヘッダー: カテゴリ・センチメント・ソース */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {news.is_important && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
                <AlertCircle className="w-3 h-3" />
                重要
              </span>
            )}
            {news.category && (
              <span
                className="text-xs px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: categoryColor }}
              >
                {categoryLabel}
              </span>
            )}
            {news.sentiment && (
              <span
                className="text-xs px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: sentimentColor }}
              >
                {sentimentLabel}
              </span>
            )}
            {companyRelevanceLabel && companyRelevanceColor && (
              <span
                className="text-xs px-2 py-0.5 rounded text-white font-medium"
                style={{ backgroundColor: companyRelevanceColor }}
              >
                {companyRelevanceLabel}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              {sourceTypeLabel}
            </span>
          </div>

          {/* タイトル */}
          <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
            {news.title}
          </h4>

          {/* サマリー */}
          {news.summary && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {news.summary}
            </p>
          )}

          {/* コンテンツ（フル表示時） */}
          {showFull && news.content && (
            <p className="text-sm text-gray-700 mb-2">
              {news.content.slice(0, 300)}
              {news.content.length > 300 && "..."}
            </p>
          )}

          {/* キーワード */}
          {news.keywords && news.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {news.keywords.slice(0, 5).map((kw, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* メタ情報 */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {publishedDate}
            </span>
            <span>{news.source_name}</span>
            {news.author && <span>by {news.author}</span>}
          </div>
        </div>

        {/* 右側: 画像・リンク */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          {news.image_url && (
            <img
              src={news.image_url}
              alt=""
              className="w-20 h-14 object-cover rounded"
            />
          )}
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            記事を見る
          </a>
          {news.relevance_score !== null && (
            <div className="text-right">
              <div className="text-sm font-semibold text-purple-600">
                {Math.round(news.relevance_score * 100)}%
              </div>
              <div className="text-xs text-gray-400">関連度</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
