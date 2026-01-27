"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SentimentByTopicData {
  topic: string;
  label: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  positiveRate: number;
  negativeRate: number;
}

interface SentimentByTopicResponse {
  data: SentimentByTopicData[];
  total: number;
}

export function CorporateSentimentByTopic() {
  const [data, setData] = useState<SentimentByTopicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"count" | "percentage">("count");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/corporate/sentiment-by-topic");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch sentiment by topic:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 h-80 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <p>センチメントデータがありません</p>
          <p className="text-sm mt-1">ラベリングスクリプトを実行してください</p>
        </div>
      </div>
    );
  }

  const chartData = data.data.map((d) => ({
    name: d.label,
    ポジティブ: viewMode === "count" ? d.positive : d.positiveRate,
    ニュートラル: viewMode === "count" ? d.neutral : (100 - d.positiveRate - d.negativeRate),
    ネガティブ: viewMode === "count" ? d.negative : d.negativeRate,
  }));

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">トピック×センチメント</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("count")}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === "count"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            件数
          </button>
          <button
            onClick={() => setViewMode("percentage")}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === "percentage"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            割合
          </button>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={viewMode === "percentage" ? [0, 100] : undefined}
              tickFormatter={(value) =>
                viewMode === "percentage" ? `${value}%` : value.toLocaleString()
              }
            />
            <YAxis type="category" dataKey="name" width={70} />
            <Tooltip
              formatter={(value, name) => [
                viewMode === "percentage"
                  ? `${(value as number).toFixed(1)}%`
                  : `${(value as number).toLocaleString()}件`,
                name as string,
              ]}
            />
            <Legend />
            <Bar
              dataKey="ポジティブ"
              stackId="a"
              fill="#10B981"
            />
            <Bar
              dataKey="ニュートラル"
              stackId="a"
              fill="#9CA3AF"
            />
            <Bar
              dataKey="ネガティブ"
              stackId="a"
              fill="#EF4444"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
