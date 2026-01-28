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
        <div className="space-y-6">
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

function InsightCard({ insight }: { insight: LoyaltySummaryInsight }) {
  const Icon = LOYALTY_ICONS[insight.level];
  const hasPersonas = insight.personas && insight.personas.length > 0;

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
      </div>

      {/* Content: Personas Grid + Topic Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Personas Grid (2/3 width on xl) */}
        <div className="xl:col-span-2">
          {hasPersonas ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {insight.personas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  levelColor={insight.levelColor}
                />
              ))}
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
