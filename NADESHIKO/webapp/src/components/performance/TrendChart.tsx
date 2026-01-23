"use client";

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
import { TimeSeriesItem } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters";

// トップ10用の色パレット
const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#6366f1", // indigo
];

interface TrendChartProps {
  items: TimeSeriesItem[];
  months: string[];
  title: string;
}

export default function TrendChart({ items, months, title }: TrendChartProps) {
  if (items.length === 0 || months.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        データがありません
      </div>
    );
  }

  // 月別データをRechartsフォーマットに変換
  const chartData = months.map((month) => {
    const dataPoint: Record<string, string | number> = {
      month: `${month.slice(2, 4)}/${month.split("-")[1]}`, // "2024-01" → "24/01"
    };

    items.forEach((item) => {
      const monthData = item.monthlyData.find((m) => m.month === month);
      dataPoint[item.name] = monthData?.sales || 0;
    });

    return dataPoint;
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-xs font-medium text-gray-500 mb-2">{title}</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
            <YAxis
              tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
              stroke="#6b7280"
              fontSize={11}
              width={50}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              labelFormatter={(label) => `期間: ${label}`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px" }}
              iconType="square"
            />
            {items.map((item, index) => (
              <Bar
                key={item.name}
                dataKey={item.name}
                fill={COLORS[index % COLORS.length]}
                stackId="stack"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
