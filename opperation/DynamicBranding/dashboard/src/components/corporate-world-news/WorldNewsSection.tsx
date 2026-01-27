"use client";

import { useState } from "react";
import { Globe, BarChart3, TrendingUp, AlertCircle, Plus } from "lucide-react";
import { WorldNewsTimeline } from "./WorldNewsTimeline";
import { WorldNewsCategorySummary } from "./WorldNewsCategorySummary";
import { WorldNewsSentimentChart } from "./WorldNewsSentimentChart";
import { WorldNewsAlerts } from "./WorldNewsAlerts";
import { WorldNewsFilters } from "./WorldNewsFilters";
import { WorldNewsImportModal } from "./WorldNewsImportModal";

interface WorldNewsSectionProps {
  corpId: number;
}

type TabType = "timeline" | "category" | "sentiment" | "alerts";

const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
  { key: "timeline", label: "タイムライン", icon: <Globe className="w-4 h-4" /> },
  { key: "category", label: "カテゴリ", icon: <BarChart3 className="w-4 h-4" /> },
  { key: "sentiment", label: "センチメント", icon: <TrendingUp className="w-4 h-4" /> },
  { key: "alerts", label: "アラート", icon: <AlertCircle className="w-4 h-4" /> },
];

export function WorldNewsSection({ corpId }: WorldNewsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>("timeline");
  const [showImportModal, setShowImportModal] = useState(false);

  // フィルター状態
  const [category, setCategory] = useState("all");
  const [sentiment, setSentiment] = useState("all");
  const [sourceType, setSourceType] = useState("all");
  const [companyRelevance, setCompanyRelevance] = useState("all");
  const [isImportant, setIsImportant] = useState(false);
  const [search, setSearch] = useState("");

  const handleImportSuccess = () => {
    setShowImportModal(false);
    // リフレッシュのためにstateを更新（タイムラインが再フェッチ）
    setSearch(search + " ");
    setTimeout(() => setSearch(search), 100);
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">世の中分析</h2>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          記事を追加
        </button>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WorldNewsSentimentChart corpId={corpId} />
        <WorldNewsAlerts corpId={corpId} limit={3} />
      </div>

      {/* タブ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="border-b flex">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* タイムラインタブはフィルター付き */}
          {activeTab === "timeline" && (
            <>
              <WorldNewsFilters
                category={category}
                setCategory={setCategory}
                sentiment={sentiment}
                setSentiment={setSentiment}
                sourceType={sourceType}
                setSourceType={setSourceType}
                companyRelevance={companyRelevance}
                setCompanyRelevance={setCompanyRelevance}
                isImportant={isImportant}
                setIsImportant={setIsImportant}
                search={search}
                setSearch={setSearch}
              />
              <WorldNewsTimeline
                corpId={corpId}
                category={category}
                sentiment={sentiment}
                sourceType={sourceType}
                companyRelevance={companyRelevance}
                isImportant={isImportant}
                search={search}
              />
            </>
          )}

          {activeTab === "category" && <WorldNewsCategorySummary corpId={corpId} />}

          {activeTab === "sentiment" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WorldNewsSentimentChart corpId={corpId} />
              <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center text-gray-500">
                <p>センチメント推移チャート（準備中）</p>
              </div>
            </div>
          )}

          {activeTab === "alerts" && <WorldNewsAlerts corpId={corpId} limit={20} />}
        </div>
      </div>

      {/* インポートモーダル */}
      {showImportModal && (
        <WorldNewsImportModal
          corpId={corpId}
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
