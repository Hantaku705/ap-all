"use client";

import { Search, Filter, X } from "lucide-react";
import {
  WORLD_NEWS_CATEGORY_LABELS,
  WORLD_NEWS_SENTIMENT_LABELS,
  WORLD_NEWS_SOURCE_TYPE_LABELS,
  WORLD_NEWS_COMPANY_RELEVANCE_LABELS,
} from "@/types/corporate.types";

interface WorldNewsFiltersProps {
  category: string;
  setCategory: (value: string) => void;
  sentiment: string;
  setSentiment: (value: string) => void;
  sourceType: string;
  setSourceType: (value: string) => void;
  companyRelevance: string;
  setCompanyRelevance: (value: string) => void;
  isImportant: boolean;
  setIsImportant: (value: boolean) => void;
  search: string;
  setSearch: (value: string) => void;
}

export function WorldNewsFilters({
  category,
  setCategory,
  sentiment,
  setSentiment,
  sourceType,
  setSourceType,
  companyRelevance,
  setCompanyRelevance,
  isImportant,
  setIsImportant,
  search,
  setSearch,
}: WorldNewsFiltersProps) {
  const hasFilters =
    category !== "all" ||
    sentiment !== "all" ||
    sourceType !== "all" ||
    companyRelevance !== "all" ||
    isImportant ||
    search !== "";

  const clearFilters = () => {
    setCategory("all");
    setSentiment("all");
    setSourceType("all");
    setCompanyRelevance("all");
    setIsImportant(false);
    setSearch("");
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium">フィルター</span>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <X className="w-3 h-3" />
            クリア
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {/* 検索 */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="キーワード検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border rounded-md w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* カテゴリ */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全カテゴリ</option>
          {Object.entries(WORLD_NEWS_CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* センチメント */}
        <select
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value)}
          className="text-sm border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全センチメント</option>
          {Object.entries(WORLD_NEWS_SENTIMENT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* ソースタイプ */}
        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
          className="text-sm border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全ソース</option>
          {Object.entries(WORLD_NEWS_SOURCE_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* 自社/競合/業界 */}
        <select
          value={companyRelevance}
          onChange={(e) => setCompanyRelevance(e.target.value)}
          className="text-sm border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全関連性</option>
          {Object.entries(WORLD_NEWS_COMPANY_RELEVANCE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* 重要のみ */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isImportant}
            onChange={(e) => setIsImportant(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>重要のみ</span>
        </label>
      </div>
    </div>
  );
}
