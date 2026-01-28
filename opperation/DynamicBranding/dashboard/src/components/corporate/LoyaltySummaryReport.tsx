"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  List,
  ExternalLink,
} from "lucide-react";
import type { LoyaltySummaryInsight, LoyaltySummaryResponse } from "@/types/corporate.types";
import { PersonaCard } from "./PersonaCard";

interface LoyaltySummaryReportProps {
  corporateId: number;
}

const LOYALTY_ICONS: Record<string, React.ElementType> = {
  high: ThumbsUp,
  medium: Minus,
  low: ThumbsDown,
};

export function LoyaltySummaryReport({ corporateId }: LoyaltySummaryReportProps) {
  const [data, setData] = useState<LoyaltySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/corporate/${corporateId}/loyalty-summary`);
        if (!res.ok) {
          throw new Error("Failed to fetch loyalty summary");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching loyalty summary:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
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
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              インサイトを生成中...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {error || "インサイトデータがありません"}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          ロイヤリティ別 顧客インサイト
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          各ロイヤリティレベルの顧客像・関心事・声のトーンを分析
        </p>
      </CardHeader>
      <CardContent>
        {/* 全トライブ一覧 */}
        <AllPersonasSummary insights={data.insights} />

        {/* ロイヤリティ別詳細 */}
        <div className="space-y-6 mt-8">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            ロイヤリティ別 詳細
          </h3>
          {data.insights.map((insight) => (
            <InsightCard key={insight.level} insight={insight} />
          ))}
        </div>
        {data.cached && (
          <p className="text-xs text-muted-foreground mt-4 text-right">
            キャッシュ済み（{new Date(data.generatedAt).toLocaleString("ja-JP")}）
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AllPersonasSummary({ insights }: { insights: LoyaltySummaryInsight[] }) {
  // 全ペルソナをフラットに展開し、投稿数でソート（多い順）
  const allPersonas = insights.flatMap((insight) =>
    (insight.personas || []).map((persona) => ({
      ...persona,
      level: insight.level,
      levelName: insight.levelName,
      levelColor: insight.levelColor,
    }))
  ).sort((a, b) => (b.postCount || 0) - (a.postCount || 0));

  if (allPersonas.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
        <List className="h-4 w-4 text-purple-500" />
        全トライブ一覧（{allPersonas.length}件）
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-2 px-3 font-medium text-gray-600 w-24">ロイヤリティ</th>
              <th className="text-left py-2 px-3 font-medium text-gray-600 w-40">ペルソナ名</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600 w-20">vol</th>
              <th className="text-left py-2 px-3 font-medium text-gray-600 w-24">年代</th>
              <th className="text-left py-2 px-3 font-medium text-gray-600">関心事</th>
              <th className="text-left py-2 px-3 font-medium text-gray-600 w-28">代表口コミ</th>
            </tr>
          </thead>
          <tbody>
            {allPersonas.map((persona) => (
              <tr
                key={persona.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-2 px-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${persona.levelColor}15`,
                      color: persona.levelColor,
                    }}
                  >
                    {persona.levelName}
                  </span>
                </td>
                <td className="py-2 px-3 font-medium text-gray-900">
                  {persona.personaName}
                </td>
                <td className="py-2 px-3 text-right font-mono text-gray-700">
                  {persona.postCount?.toLocaleString() || "-"}
                </td>
                <td className="py-2 px-3 text-gray-600">
                  {persona.ageRange}
                </td>
                <td className="py-2 px-3 text-gray-600">
                  {persona.interests.slice(0, 3).join("・")}
                  {persona.interests.length > 3 && "..."}
                </td>
                <td className="py-2 px-3">
                  {persona.representativeQuoteUrl ? (
                    <a
                      href={persona.representativeQuoteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span className="truncate max-w-[100px]">投稿を見る</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: LoyaltySummaryInsight }) {
  const Icon = LOYALTY_ICONS[insight.level];
  const hasPersonas = insight.personas && insight.personas.length > 0;
  const [currentIndex, setCurrentIndex] = useState(0);
  const personaCount = insight.personas?.length || 0;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? personaCount - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === personaCount - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: insight.levelColor + "40" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: insight.levelColor + "20" }}
          >
            <Icon className="h-4 w-4" style={{ color: insight.levelColor }} />
          </div>
          <div>
            <span
              className="font-semibold"
              style={{ color: insight.levelColor }}
            >
              {insight.levelName}
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              ({insight.count.toLocaleString()}件・{insight.percentage}%)
            </span>
          </div>
        </div>
        {/* Carousel Navigation (top-right) */}
        {hasPersonas && personaCount > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {personaCount}
            </span>
            <button
              onClick={handlePrev}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="前のペルソナ"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="次のペルソナ"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Content: Persona Carousel + Topic Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Persona Carousel (2/3 width on xl) */}
        <div className="xl:col-span-2">
          {hasPersonas ? (
            <div className="relative">
              {/* Single Persona Card */}
              <div className="transition-all duration-300 ease-in-out">
                <PersonaCard
                  persona={insight.personas[currentIndex]}
                  levelColor={insight.levelColor}
                />
              </div>

              {/* Dot Indicators */}
              {personaCount > 1 && (
                <div className="flex justify-center gap-2 mt-3">
                  {insight.personas.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentIndex
                          ? "w-4"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      style={{
                        backgroundColor:
                          idx === currentIndex ? insight.levelColor : undefined,
                      }}
                      aria-label={`ペルソナ ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Fallback: 旧形式（customerProfile）を表示
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {insight.customerProfile}
              </p>
            </div>
          )}
        </div>

        {/* Topic Distribution Chart (1/3 width on xl) */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">トピック分布</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={insight.topicDistribution}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="topicLabel"
                  width={80}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value as number}%`, "割合"]}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                  {insight.topicDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
