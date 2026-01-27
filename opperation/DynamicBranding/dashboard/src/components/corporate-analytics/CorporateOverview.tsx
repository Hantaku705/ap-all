"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, MessageSquare, ThumbsUp, ThumbsDown, Activity } from "lucide-react";

interface AnalyticsData {
  total: number;
  sentimentCounts: {
    positive: number;
    neutral: number;
    negative: number;
  };
  positiveRate: number;
  negativeRate: number;
  neutralRate: number;
  weeklyChange: number;
  thisWeekCount: number;
  lastWeekCount: number;
  totalEngagement: number;
  avgEngagement: number;
}

export function CorporateOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/corporate/analytics");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch corporate analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return <div className="text-red-500">データの取得に失敗しました</div>;
  }

  const kpis = [
    {
      label: "総投稿数",
      value: data.total.toLocaleString(),
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "ポジティブ率",
      value: `${data.positiveRate.toFixed(1)}%`,
      icon: ThumbsUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      subValue: `${data.sentimentCounts.positive.toLocaleString()}件`,
    },
    {
      label: "ネガティブ率",
      value: `${data.negativeRate.toFixed(1)}%`,
      icon: ThumbsDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      subValue: `${data.sentimentCounts.negative.toLocaleString()}件`,
    },
    {
      label: "週次変化",
      value: `${data.weeklyChange >= 0 ? "+" : ""}${data.weeklyChange.toFixed(1)}%`,
      icon: data.weeklyChange >= 0 ? TrendingUp : TrendingDown,
      color: data.weeklyChange >= 0 ? "text-green-600" : "text-red-600",
      bgColor: data.weeklyChange >= 0 ? "bg-green-50" : "bg-red-50",
      subValue: `今週 ${data.thisWeekCount}件 / 先週 ${data.lastWeekCount}件`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`${kpi.bgColor} rounded-lg p-4 shadow-sm border border-gray-100`}
          >
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <span className="text-sm text-gray-600">{kpi.label}</span>
            </div>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            {kpi.subValue && (
              <div className="text-xs text-gray-500 mt-1">{kpi.subValue}</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">総エンゲージメント</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {data.totalEngagement.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            平均 {data.avgEngagement.toFixed(1)}/投稿
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600 mb-2">センチメント分布</div>
          <div className="flex h-4 rounded-full overflow-hidden">
            <div
              className="bg-green-500"
              style={{ width: `${data.positiveRate}%` }}
              title={`ポジティブ: ${data.positiveRate.toFixed(1)}%`}
            />
            <div
              className="bg-gray-300"
              style={{ width: `${data.neutralRate}%` }}
              title={`ニュートラル: ${data.neutralRate.toFixed(1)}%`}
            />
            <div
              className="bg-red-500"
              style={{ width: `${data.negativeRate}%` }}
              title={`ネガティブ: ${data.negativeRate.toFixed(1)}%`}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>ポジ {data.positiveRate.toFixed(1)}%</span>
            <span>中立 {data.neutralRate.toFixed(1)}%</span>
            <span>ネガ {data.negativeRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
