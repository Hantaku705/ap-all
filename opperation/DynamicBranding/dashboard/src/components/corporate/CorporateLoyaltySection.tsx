"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Heart, MessageCircle, ThumbsUp, ThumbsDown, Minus, TrendingUp, ChevronDown, ChevronUp, Filter, X, Calendar } from "lucide-react";
import type { CorporateLoyalty, LoyaltyLevelData, LoyaltyPost, LoyaltyTrendPoint } from "@/types/corporate.types";
import { LoyaltySummaryReport } from "./LoyaltySummaryReport";

// トピックラベル定義
const TOPIC_LABELS: Record<string, string> = {
  stock_ir: "株価・IR",
  csr_sustainability: "CSR・採用等",
  employment: "採用・働き方",
  company_news: "企業ニュース",
  rnd: "研究開発",
  management: "経営・理念",
  other: "その他",
};

// トピックの色定義
const TOPIC_COLORS: Record<string, string> = {
  stock_ir: "#3B82F6",
  csr_sustainability: "#10B981",
  employment: "#F59E0B",
  company_news: "#8B5CF6",
  rnd: "#EC4899",
  management: "#06B6D4",
  other: "#6B7280",
};

interface CorporateLoyaltySectionProps {
  corporateId: number;
}

const LOYALTY_ICONS: Record<string, React.ElementType> = {
  high: ThumbsUp,
  medium: Minus,
  low: ThumbsDown,
};

export function CorporateLoyaltySection({ corporateId }: CorporateLoyaltySectionProps) {
  const [data, setData] = useState<CorporateLoyalty | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>("high");
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const INITIAL_POSTS_COUNT = 5;

  // 選択中のレベルの投稿から利用可能な月を抽出
  const getAvailableMonths = (): { value: string; label: string }[] => {
    if (!data) return [];
    const levelData = data.levels.find((l) => l.level === selectedLevel);
    if (!levelData) return [];
    const months = new Set<string>();
    levelData.representative_posts.forEach((post) => {
      if (post.posted_at) {
        const yearMonth = post.posted_at.substring(0, 7); // YYYY-MM
        months.add(yearMonth);
      }
    });
    return Array.from(months)
      .sort()
      .reverse()
      .map((ym) => {
        const [year, month] = ym.split("-");
        return {
          value: ym,
          label: `${year}年${parseInt(month)}月`,
        };
      });
  };

  // 選択中のレベルの投稿からユニークなtopicを抽出
  const getAvailableTopics = (): string[] => {
    if (!data) return [];
    const levelData = data.levels.find((l) => l.level === selectedLevel);
    if (!levelData) return [];
    const topics = new Set<string>();
    levelData.representative_posts.forEach((post) => {
      if (post.topic) {
        topics.add(post.topic);
      }
    });
    return Array.from(topics).sort();
  };

  // フィルター適用後の投稿（トピック + 月）
  const getFilteredPosts = (posts: LoyaltyPost[]): LoyaltyPost[] => {
    let filtered = posts;

    // トピックフィルター
    if (selectedTopics.length > 0) {
      filtered = filtered.filter((post) => post.topic && selectedTopics.includes(post.topic));
    }

    // 月フィルター
    if (selectedMonth) {
      filtered = filtered.filter((post) => post.posted_at && post.posted_at.startsWith(selectedMonth));
    }

    return filtered;
  };

  // トピック選択の切り替え
  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  // フィルターをクリア
  const clearFilters = () => {
    setSelectedTopics([]);
    setSelectedMonth("");
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/corporate/${corporateId}/fans`);
        if (res.ok) {
          const json = await res.json();
          if (json.corporate_loyalty) {
            setData(json.corporate_loyalty);
          }
        }
      } catch (err) {
        console.error("Error fetching loyalty data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [corporateId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          ロイヤリティデータがありません
        </CardContent>
      </Card>
    );
  }

  const chartData = data.levels.map((l) => ({
    name: l.name,
    value: l.count,
    color: l.color,
    level: l.level,
  }));

  const selectedLevelData = data.levels.find((l) => l.level === selectedLevel);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            コーポレートロイヤリティ分布
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            株価・IR・CSR・採用・研究開発・経営に関する投稿のセンチメント分類
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 円グラフ */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={(entry) => {
                      setSelectedLevel(entry.level);
                      setShowAllPosts(false);
                      setSelectedTopics([]);
                      setSelectedMonth("");
                    }}
                    className="cursor-pointer"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.level === selectedLevel ? "#1f2937" : "transparent"}
                        strokeWidth={entry.level === selectedLevel ? 2 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `${(value as number).toLocaleString()}件`,
                      "投稿数",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 凡例・サマリー */}
            <div className="space-y-3">
              {data.levels.map((level) => {
                const Icon = LOYALTY_ICONS[level.level];
                const isSelected = selectedLevel === level.level;
                return (
                  <button
                    key={level.level}
                    onClick={() => {
                      setSelectedLevel(level.level);
                      setShowAllPosts(false);
                      setSelectedTopics([]);
                      setSelectedMonth("");
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isSelected
                        ? "border-gray-400 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: level.color }}
                      />
                      <Icon className="h-4 w-4" style={{ color: level.color }} />
                      <span className="font-medium">{level.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">{level.percentage}%</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({level.count.toLocaleString()}件)
                      </span>
                    </div>
                  </button>
                );
              })}

              <div className="pt-2 text-sm text-muted-foreground">
                コーポレート投稿総数: <strong>{data.total.toLocaleString()}件</strong>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 時系列推移チャート */}
      {data.trends && data.trends.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              ロイヤリティ時系列推移
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              週次でのロイヤリティ別投稿数の推移（積み上げエリアチャート）
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.trends}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getFullYear()}/${date.getMonth() + 1}`;
                    }}
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日週`;
                    }}
                    formatter={(value, name) => {
                      const labels: Record<string, string> = {
                        high: "ロイヤリティ高",
                        medium: "ロイヤリティ中",
                        low: "ロイヤリティ低",
                      };
                      return [`${value}件`, labels[name as string] || name];
                    }}
                  />
                  <Legend
                    formatter={(value) => {
                      const labels: Record<string, string> = {
                        high: "ロイヤリティ高",
                        medium: "ロイヤリティ中",
                        low: "ロイヤリティ低",
                      };
                      return labels[value] || value;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="low"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="medium"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="high"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ロイヤリティ別 顧客インサイト */}
      <LoyaltySummaryReport corporateId={corporateId} />

      {/* 代表口コミ */}
      {selectedLevelData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              代表口コミ
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                全{getFilteredPosts(selectedLevelData.representative_posts).length.toLocaleString()}件
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* フィルター */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">フィルター</span>
                {(selectedTopics.length > 0 || selectedMonth) && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    すべてクリア
                  </button>
                )}
              </div>

              {/* ロイヤリティフィルター */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">ロイヤリティ</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.levels.map((level) => {
                    const isSelected = selectedLevel === level.level;
                    return (
                      <button
                        key={level.level}
                        onClick={() => {
                          setSelectedLevel(level.level);
                          setShowAllPosts(false);
                        }}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "text-white border-transparent"
                            : "bg-white hover:bg-gray-50"
                        }`}
                        style={{
                          backgroundColor: isSelected ? level.color : undefined,
                          borderColor: isSelected ? level.color : "#d1d5db",
                          color: isSelected ? "white" : "#374151",
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: isSelected ? "white" : level.color }}
                        />
                        {level.name}
                        <span className="opacity-70">({level.percentage}%)</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(getAvailableTopics().length > 0 || getAvailableMonths().length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 月フィルター */}
                  {getAvailableMonths().length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs font-medium text-gray-600">時期</span>
                      </div>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">すべての時期</option>
                        {getAvailableMonths().map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* トピックフィルター */}
                  {getAvailableTopics().length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Filter className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs font-medium text-gray-600">トピック</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getAvailableTopics().map((topic) => {
                          const isSelected = selectedTopics.includes(topic);
                          const color = TOPIC_COLORS[topic] || "#6B7280";
                          return (
                            <button
                              key={topic}
                              onClick={() => toggleTopic(topic)}
                              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                isSelected
                                  ? "text-white"
                                  : "bg-white hover:bg-gray-50"
                              }`}
                              style={{
                                backgroundColor: isSelected ? color : undefined,
                                borderColor: color,
                                color: isSelected ? "white" : color,
                              }}
                            >
                              {TOPIC_LABELS[topic] || topic}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={`space-y-3 ${showAllPosts ? "max-h-[600px] overflow-y-auto pr-2" : ""}`}>
              {getFilteredPosts(selectedLevelData.representative_posts).length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {selectedTopics.length > 0 ? "選択したトピックに該当する投稿がありません" : "代表的な投稿がありません"}
                </p>
              ) : (
                (showAllPosts
                  ? getFilteredPosts(selectedLevelData.representative_posts)
                  : getFilteredPosts(selectedLevelData.representative_posts).slice(0, INITIAL_POSTS_COUNT)
                ).map((post, idx) => (
                  <div
                    key={post.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: selectedLevelData.color + "20",
                          color: selectedLevelData.color,
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {post.content}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          {post.topic && (
                            <span className="px-2 py-0.5 bg-gray-200 rounded">
                              {post.topic}
                            </span>
                          )}
                          {post.likes > 0 && (
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {post.likes.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {getFilteredPosts(selectedLevelData.representative_posts).length > INITIAL_POSTS_COUNT && (
              <button
                onClick={() => setShowAllPosts(!showAllPosts)}
                className="mt-4 w-full py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {showAllPosts ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    折りたたむ
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    すべて表示（残り{(getFilteredPosts(selectedLevelData.representative_posts).length - INITIAL_POSTS_COUNT).toLocaleString()}件）
                  </>
                )}
              </button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
