"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { ProjectedMilestone } from "@/types/corporate.types";

interface LoyaltyProjectionChartProps {
  timeline: ProjectedMilestone[];
  targetDate: string;
}

export function LoyaltyProjectionChart({
  timeline,
  targetDate,
}: LoyaltyProjectionChartProps) {
  // 日付を見やすいフォーマットに変換
  const chartData = timeline.map((point) => ({
    ...point,
    displayDate: new Date(point.date).toLocaleDateString("ja-JP", {
      month: "short",
    }),
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          成長予測タイムライン
        </h3>
        <span className="ml-auto text-sm text-gray-500">
          目標: {targetDate}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                highPercentage: "高ロイヤリティ",
                mediumPercentage: "中ロイヤリティ",
                lowPercentage: "低ロイヤリティ",
              };
              return [`${value}%`, labels[name as string] || name];
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                const data = payload[0].payload as ProjectedMilestone & { displayDate: string };
                return (
                  <div>
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs text-gray-500">{data.keyAction}</div>
                  </div>
                );
              }
              return label;
            }}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          />
          <Legend
            formatter={(value) => {
              const labels: Record<string, string> = {
                highPercentage: "高ロイヤリティ",
                mediumPercentage: "中ロイヤリティ",
                lowPercentage: "低ロイヤリティ",
              };
              return labels[value] || value;
            }}
          />

          {/* 目標ライン */}
          <ReferenceLine
            y={35}
            stroke="#22c55e"
            strokeDasharray="5 5"
            label={{
              value: "目標 35%",
              position: "right",
              fill: "#22c55e",
              fontSize: 12,
            }}
          />

          <Line
            type="monotone"
            dataKey="highPercentage"
            stroke="#22c55e"
            strokeWidth={3}
            dot={{ r: 6, fill: "#22c55e" }}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="mediumPercentage"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4, fill: "#f59e0b" }}
          />
          <Line
            type="monotone"
            dataKey="lowPercentage"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4, fill: "#ef4444" }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* マイルストーン一覧 */}
      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          主要マイルストーン
        </h4>
        <div className="flex gap-4 overflow-x-auto">
          {timeline.map((milestone, index) => (
            <div
              key={milestone.date}
              className={`flex-shrink-0 p-3 rounded-lg border ${
                index === 0
                  ? "bg-blue-50 border-blue-200"
                  : index === timeline.length - 1
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">
                {new Date(milestone.date).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="text-sm font-medium text-gray-800 mb-1">
                高: {milestone.highPercentage}%
              </div>
              <div className="text-xs text-gray-600">{milestone.keyAction}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
