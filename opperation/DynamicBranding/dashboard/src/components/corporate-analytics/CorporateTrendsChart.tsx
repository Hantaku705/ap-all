"use client";

import { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrendData {
  week: string;
  count: number;
  positive: number;
  neutral: number;
  negative: number;
  engagement: number;
  avgEngagement: number;
  positiveRate: number;
  negativeRate: number;
}

interface TrendsResponse {
  trends: TrendData[];
  total: number;
}

export function CorporateTrendsChart() {
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEngagement, setShowEngagement] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/corporate/trends");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch corporate trends:", error);
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

  if (!data || data.trends.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 h-80 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <p>時系列データがありません</p>
        </div>
      </div>
    );
  }

  const chartData = data.trends.map((t) => ({
    week: t.week.slice(5), // MM-DD形式
    投稿数: t.count,
    ポジティブ率: t.positiveRate,
    ネガティブ率: t.negativeRate,
    エンゲージメント: t.avgEngagement,
  }));

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">週次推移（直近12週）</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showEngagement}
            onChange={(e) => setShowEngagement(e.target.checked)}
            className="rounded border-gray-300"
          />
          エンゲージメント表示
        </label>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis
              yAxisId="left"
              orientation="left"
              label={{ value: "投稿数", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              label={{ value: "%", angle: 90, position: "insideRight" }}
            />
            {showEngagement && (
              <YAxis
                yAxisId="engagement"
                orientation="right"
                hide
              />
            )}
            <Tooltip
              formatter={(value, name) => {
                const v = value as number;
                const n = name as string;
                if (n === "投稿数") return [`${v}件`, n];
                if (n.includes("率")) return [`${v.toFixed(1)}%`, n];
                return [v.toFixed(1), n];
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="投稿数"
              fill="#3B82F6"
              opacity={0.7}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ポジティブ率"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ネガティブ率"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            {showEngagement && (
              <Line
                yAxisId="engagement"
                type="monotone"
                dataKey="エンゲージメント"
                stroke="#8B5CF6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
