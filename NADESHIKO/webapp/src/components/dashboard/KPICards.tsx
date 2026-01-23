"use client";

import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface KPICardsProps {
  totalSales: number;
  totalGrossProfit: number;
  grossProfitRate: number;
  achievementRate: number;
  target: number;
  dealCount: number;
  completedCount: number;
  salesChange?: number | null;
  grossProfitChange?: number | null;
  dealCountChange?: number | null;
  comparisonLabel?: string; // "MoM" | "QoQ" | "YoY"
}

function formatChange(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function getChangeColor(value: number | null | undefined): string {
  if (value === null || value === undefined) return "text-gray-400";
  return value >= 0 ? "text-green-600" : "text-red-600";
}

function getChangeArrow(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return value >= 0 ? "↑" : "↓";
}

export default function KPICards({
  totalSales,
  totalGrossProfit,
  grossProfitRate,
  achievementRate,
  target,
  dealCount,
  completedCount,
  salesChange,
  grossProfitChange,
  dealCountChange,
  comparisonLabel = "YoY",
}: KPICardsProps) {
  const cards = [
    {
      label: "売上",
      value: formatCurrency(totalSales),
      subValue: target > 0 ? `目標: ${formatCurrency(target)}` : undefined,
      change: salesChange,
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700",
    },
    {
      label: "粗利",
      value: formatCurrency(totalGrossProfit),
      subValue: `粗利率: ${formatPercentage(grossProfitRate)}`,
      change: grossProfitChange,
      color: "bg-green-50 border-green-200",
      textColor: "text-green-700",
    },
    {
      label: "目標達成率",
      value: target > 0 ? formatPercentage(achievementRate) : "-",
      subValue: target > 0 ? (achievementRate >= 100 ? "目標達成!" : "目標未達") : "目標未設定",
      change: null, // 達成率の比較は複雑なので省略
      color: achievementRate >= 100 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200",
      textColor: achievementRate >= 100 ? "text-emerald-700" : "text-amber-700",
    },
    {
      label: "案件数",
      value: `${dealCount}件`,
      subValue: `完了: ${completedCount}件`,
      change: dealCountChange,
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${card.color}`}
        >
          <p className="text-sm text-gray-600 mb-1">{card.label}</p>
          <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
          <div className="flex items-center justify-between mt-1">
            {card.subValue && (
              <p className="text-xs text-gray-500">{card.subValue}</p>
            )}
            <p className={`text-xs font-medium ${getChangeColor(card.change)}`}>
              {getChangeArrow(card.change)} {comparisonLabel} {formatChange(card.change)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
