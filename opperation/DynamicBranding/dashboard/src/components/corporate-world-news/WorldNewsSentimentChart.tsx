"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { WorldNewsSummaryResponse, WORLD_NEWS_SENTIMENT_COLORS } from "@/types/corporate.types";

interface WorldNewsSentimentChartProps {
  corpId: number;
}

const SENTIMENT_DISPLAY_NAMES: Record<string, string> = {
  positive: "ポジティブ",
  neutral: "ニュートラル",
  negative: "ネガティブ",
};

export function WorldNewsSentimentChart({ corpId }: WorldNewsSentimentChartProps) {
  const [data, setData] = useState<WorldNewsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/corporate/${corpId}/world-news/summary`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch sentiment data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [corpId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data || data.by_sentiment.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 h-64 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <p>センチメントデータがありません</p>
        </div>
      </div>
    );
  }

  const chartData = data.by_sentiment.map((s) => ({
    name: SENTIMENT_DISPLAY_NAMES[s.sentiment] || s.sentiment,
    value: s.count,
    percentage: s.percentage,
    color: WORLD_NEWS_SENTIMENT_COLORS[s.sentiment as keyof typeof WORLD_NEWS_SENTIMENT_COLORS],
  }));

  // ポジティブ・ネガティブ比率
  const positiveRate = data.by_sentiment.find((s) => s.sentiment === "positive")?.percentage || 0;
  const negativeRate = data.by_sentiment.find((s) => s.sentiment === "negative")?.percentage || 0;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">センチメント分析</h3>

      <div className="flex items-center gap-4">
        {/* 円グラフ */}
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${(value as number).toLocaleString()}件`,
                  name as string,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 詳細 */}
        <div className="flex-1 space-y-3">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">{item.value.toLocaleString()}</span>
                <span className="text-gray-500 text-sm ml-1">
                  ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}

          {/* サマリー指標 */}
          <div className="pt-3 border-t mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ポジティブ率</span>
              <span className="font-semibold text-green-600">
                {positiveRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">ネガティブ率</span>
              <span className="font-semibold text-red-600">
                {negativeRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
