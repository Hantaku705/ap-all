"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Globe } from "lucide-react";
import type { StrategyInput } from "@/types/corporate.types";

interface StrategySummaryProps {
  input: StrategyInput;
}

export function StrategySummary({ input }: StrategySummaryProps) {
  const summaryCards = [
    {
      icon: BarChart3,
      title: "UGC分析",
      color: "#3B82F6",
      items: [
        { label: "総投稿数", value: `${input.ugc.totalPosts.toLocaleString()}件` },
        { label: "ポジティブ率", value: `${input.ugc.positiveRate}%` },
        { label: "トレンド", value: input.ugc.sentimentTrend === "improving" ? "改善中" : input.ugc.sentimentTrend === "declining" ? "悪化中" : "安定" },
      ],
    },
    {
      icon: TrendingUp,
      title: "株価相関",
      color: "#10B981",
      items: [
        { label: "相関係数", value: input.stockCorrelation.coefficient >= 0 ? `+${input.stockCorrelation.coefficient.toFixed(2)}` : input.stockCorrelation.coefficient.toFixed(2) },
        { label: "最適ラグ", value: `${input.stockCorrelation.optimalLag}日` },
        { label: "有意性", value: input.stockCorrelation.significance === "high" ? "高" : input.stockCorrelation.significance === "medium" ? "中" : "低" },
      ],
    },
    {
      icon: Users,
      title: "ファン資産",
      color: "#F59E0B",
      items: [
        { label: "高ロイヤリティ", value: `${input.loyalty.high.percentage}%` },
        { label: "中ロイヤリティ", value: `${input.loyalty.medium.percentage}%` },
        { label: "低ロイヤリティ", value: `${input.loyalty.low.percentage}%` },
      ],
    },
    {
      icon: Globe,
      title: "世の中分析",
      color: "#8B5CF6",
      items: [
        { label: "カテゴリ", value: `${input.worldNews.topCategories.length}種` },
        { label: "トレンド", value: `${input.worldNews.emergingTrends.length}件` },
        { label: "競合動向", value: `${input.worldNews.competitorMoves.length}件` },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">現状サマリー</CardTitle>
        <p className="text-sm text-muted-foreground">
          4つのタブから得られたデータの要約
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="p-4 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4" style={{ color: card.color }} />
                  <span className="text-sm font-medium">{card.title}</span>
                </div>
                <div className="space-y-2">
                  {card.items.map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* トップトピック・トップトレンド */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {input.ugc.topTopics.length > 0 && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs font-medium text-blue-700 mb-2">主要トピック</p>
              <div className="flex flex-wrap gap-2">
                {input.ugc.topTopics.slice(0, 5).map((topic) => (
                  <span
                    key={topic.name}
                    className="px-2 py-1 text-xs bg-white rounded border border-blue-200"
                  >
                    {topic.name} ({topic.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {input.worldNews.emergingTrends.length > 0 && (
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
              <p className="text-xs font-medium text-purple-700 mb-2">注目トレンド</p>
              <div className="flex flex-wrap gap-2">
                {input.worldNews.emergingTrends.slice(0, 5).map((trend, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-white rounded border border-purple-200"
                  >
                    {trend}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
