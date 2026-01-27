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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { WorldNewsSummaryResponse, WorldNewsCategorySummary as CategorySummary } from "@/types/corporate.types";

interface WorldNewsCategorySummaryProps {
  corpId: number;
}

export function WorldNewsCategorySummary({ corpId }: WorldNewsCategorySummaryProps) {
  const [data, setData] = useState<WorldNewsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"pie" | "bar">("pie");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/corporate/${corpId}/world-news/summary`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch category summary:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [corpId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 h-80 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data || data.by_category.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 h-80 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <p>カテゴリデータがありません</p>
        </div>
      </div>
    );
  }

  const chartData = data.by_category.map((cat) => ({
    name: cat.label,
    value: cat.count,
    percentage: cat.percentage,
    color: cat.color,
    ...cat.sentiment_breakdown,
  }));

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">カテゴリ別分布</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("pie")}
            className={`px-3 py-1 text-xs rounded ${
              viewMode === "pie"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            円グラフ
          </button>
          <button
            onClick={() => setViewMode("bar")}
            className={`px-3 py-1 text-xs rounded ${
              viewMode === "bar"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            棒グラフ
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === "pie" ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="40%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={false}
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
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ paddingLeft: 20, fontSize: 12 }}
                formatter={(value) => {
                  const item = chartData.find((d) => d.name === value);
                  return `${value} (${item?.percentage?.toFixed(1) ?? 0}%)`;
                }}
              />
            </PieChart>
          ) : (
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [`${(value as number).toLocaleString()}件`, "件数"]}
              />
              <Bar dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-center text-sm text-gray-500">
        総ニュース数: {data.total_news.toLocaleString()}件
      </div>
    </div>
  );
}
