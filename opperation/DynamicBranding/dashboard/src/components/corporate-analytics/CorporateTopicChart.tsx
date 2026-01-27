"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface TopicData {
  topic: string;
  label: string;
  count: number;
  percentage: number;
}

interface TopicsResponse {
  topics: TopicData[];
  total: number;
}

const COLORS = [
  "#3B82F6", // blue - stock_ir
  "#10B981", // green - csr_sustainability
  "#F59E0B", // amber - employment
  "#8B5CF6", // violet - company_news
  "#EC4899", // pink - rnd
  "#06B6D4", // cyan - management
  "#6B7280", // gray - other
];

export function CorporateTopicChart() {
  const [data, setData] = useState<TopicsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/corporate/topics");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch corporate topics:", error);
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

  if (!data || data.topics.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 h-80 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <p>トピック分類データがありません</p>
          <p className="text-sm mt-1">ラベリングスクリプトを実行してください</p>
        </div>
      </div>
    );
  }

  const chartData = data.topics.map((t) => ({
    name: t.label,
    value: t.count,
    percentage: t.percentage,
  }));

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">トピック分布</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="35%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              label={false}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
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
                const item = chartData.find(d => d.name === value);
                return `${value} (${item?.percentage?.toFixed(1) ?? 0}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-center text-sm text-gray-500">
        総投稿数: {data.total.toLocaleString()}件
      </div>
    </div>
  );
}
