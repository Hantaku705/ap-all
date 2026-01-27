"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SourceData {
  source: string;
  label: string;
  count: number;
  positive: number;
  neutral: number;
  negative: number;
  engagement: number;
  avgEngagement: number;
  positiveRate: number;
  percentage: number;
}

interface SourcesResponse {
  sources: SourceData[];
  total: number;
}

const COLORS: Record<string, string> = {
  twitter: "#1DA1F2",
  instagram: "#E4405F",
  news: "#FF6B6B",
  blog: "#4ECDC4",
  unknown: "#6B7280",
};

export function CorporateSourceChart() {
  const [data, setData] = useState<SourcesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/corporate/sources");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch corporate sources:", error);
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

  if (!data || data.sources.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 h-80 flex items-center justify-center">
        <div className="text-gray-500">ソースデータがありません</div>
      </div>
    );
  }

  const chartData = data.sources.map((s) => ({
    name: s.label,
    source: s.source,
    投稿数: s.count,
    percentage: s.percentage,
    avgEngagement: s.avgEngagement,
    positiveRate: s.positiveRate,
  }));

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">ソース別分布</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                if (name === "投稿数") return [`${(value as number).toLocaleString()}件`, name as string];
                return [(value as number).toFixed(1), name as string];
              }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0].payload;
                return (
                  <div className="bg-white p-3 rounded shadow-lg border">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm">投稿数: {item.投稿数.toLocaleString()}件</p>
                    <p className="text-sm">シェア: {item.percentage.toFixed(1)}%</p>
                    <p className="text-sm">平均エンゲージメント: {item.avgEngagement.toFixed(1)}</p>
                    <p className="text-sm text-green-600">ポジティブ率: {item.positiveRate.toFixed(1)}%</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="投稿数" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.source] || COLORS.unknown}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {data.sources.map((s) => (
          <div key={s.source} className="flex items-center gap-1 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[s.source] || COLORS.unknown }}
            />
            <span className="text-gray-600">
              {s.label}: {s.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
