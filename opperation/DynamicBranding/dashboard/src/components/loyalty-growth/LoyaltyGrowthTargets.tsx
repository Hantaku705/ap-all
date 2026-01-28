"use client";

import { Target, TrendingUp, TrendingDown, Users } from "lucide-react";
import type { LoyaltyGrowthTarget } from "@/types/corporate.types";

interface LoyaltyGrowthTargetsProps {
  targets: LoyaltyGrowthTarget;
}

export function LoyaltyGrowthTargets({ targets }: LoyaltyGrowthTargetsProps) {
  const { currentDistribution, targetDistribution } = targets;

  // 進捗計算
  const highProgress = Math.round(
    ((currentDistribution.high.percentage - 25) /
      (targetDistribution.high.percentage - 25)) *
      100
  );

  const kpiCards = [
    {
      label: "高ロイヤリティ",
      current: currentDistribution.high.percentage,
      target: targetDistribution.high.percentage,
      count: currentDistribution.high.count,
      color: "#22c55e",
      icon: TrendingUp,
      trend: "up",
    },
    {
      label: "中ロイヤリティ",
      current: currentDistribution.medium.percentage,
      target: targetDistribution.medium.percentage,
      count: currentDistribution.medium.count,
      color: "#f59e0b",
      icon: Users,
      trend: "stable",
    },
    {
      label: "低ロイヤリティ",
      current: currentDistribution.low.percentage,
      target: targetDistribution.low.percentage,
      count: currentDistribution.low.count,
      color: "#ef4444",
      icon: TrendingDown,
      trend: "down",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          ロイヤリティ成長目標
        </h3>
        <span className="ml-auto text-sm text-gray-500">
          目標期日: {targetDistribution.high.targetDate}
        </span>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const isTarget = kpi.label === "高ロイヤリティ";
          const diff = kpi.target - kpi.current;

          return (
            <div
              key={kpi.label}
              className={`rounded-lg p-4 ${
                isTarget ? "bg-green-50 border-2 border-green-200" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{kpi.label}</span>
                <Icon
                  className="w-4 h-4"
                  style={{ color: kpi.color }}
                />
              </div>
              <div className="flex items-end gap-2">
                <span
                  className="text-3xl font-bold"
                  style={{ color: kpi.color }}
                >
                  {kpi.current}%
                </span>
                <span className="text-sm text-gray-500 mb-1">
                  → {kpi.target}%
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {kpi.count.toLocaleString()}件
                {diff !== 0 && (
                  <span className={diff > 0 ? "text-green-600" : "text-red-600"}>
                    {" "}
                    ({diff > 0 ? "+" : ""}
                    {diff}%目標)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 全体進捗バー */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            高ロイヤリティ目標達成進捗
          </span>
          <span className="text-sm text-gray-600">
            {Math.max(0, highProgress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, highProgress))}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>開始: 25%</span>
          <span>現在: {currentDistribution.high.percentage}%</span>
          <span>目標: {targetDistribution.high.percentage}%</span>
        </div>
      </div>
    </div>
  );
}
