"use client";

import { useEffect, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { WorldNewsCard } from "./WorldNewsCard";
import { WorldNewsItem, WorldNewsListResponse } from "@/types/corporate.types";

interface WorldNewsTimelineProps {
  corpId: number;
  category?: string;
  sentiment?: string;
  sourceType?: string;
  companyRelevance?: string;
  isImportant?: boolean;
  search?: string;
}

export function WorldNewsTimeline({
  corpId,
  category,
  sentiment,
  sourceType,
  companyRelevance,
  isImportant,
  search,
}: WorldNewsTimelineProps) {
  const [data, setData] = useState<WorldNewsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", limit.toString());
        if (category && category !== "all") params.set("category", category);
        if (sentiment && sentiment !== "all") params.set("sentiment", sentiment);
        if (sourceType && sourceType !== "all") params.set("source_type", sourceType);
        if (companyRelevance && companyRelevance !== "all") params.set("company_relevance", companyRelevance);
        if (isImportant) params.set("is_important", "true");
        if (search) params.set("search", search);

        const res = await fetch(`/api/corporate/${corpId}/world-news?${params}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch world news:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [corpId, category, sentiment, sourceType, companyRelevance, isImportant, search, page]);

  // フィルター変更時にページをリセット
  useEffect(() => {
    setPage(1);
  }, [category, sentiment, sourceType, companyRelevance, isImportant, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data || data.news.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>ニュースがありません</p>
        <p className="text-sm mt-1">データ収集を実行してください</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / limit);

  return (
    <div>
      {/* ニュース一覧 */}
      <div className="space-y-3">
        {data.news.map((news) => (
          <WorldNewsCard key={news.id} news={news} />
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-gray-500">
            {data.total}件中 {(page - 1) * limit + 1}-
            {Math.min(page * limit, data.total)}件
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
