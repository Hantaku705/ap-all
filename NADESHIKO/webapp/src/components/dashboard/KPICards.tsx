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
}

export default function KPICards({
  totalSales,
  totalGrossProfit,
  grossProfitRate,
  achievementRate,
  target,
  dealCount,
  completedCount,
}: KPICardsProps) {
  const cards = [
    {
      label: "売上",
      value: formatCurrency(totalSales),
      subValue: target > 0 ? `目標: ${formatCurrency(target)}` : undefined,
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700",
    },
    {
      label: "粗利",
      value: formatCurrency(totalGrossProfit),
      subValue: `粗利率: ${formatPercentage(grossProfitRate)}`,
      color: "bg-green-50 border-green-200",
      textColor: "text-green-700",
    },
    {
      label: "目標達成率",
      value: target > 0 ? formatPercentage(achievementRate) : "-",
      subValue: target > 0 ? (achievementRate >= 100 ? "目標達成!" : "目標未達") : "目標未設定",
      color: achievementRate >= 100 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200",
      textColor: achievementRate >= 100 ? "text-emerald-700" : "text-amber-700",
    },
    {
      label: "案件数",
      value: `${dealCount}件`,
      subValue: `完了: ${completedCount}件`,
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
          {card.subValue && (
            <p className="text-xs text-gray-500 mt-1">{card.subValue}</p>
          )}
        </div>
      ))}
    </div>
  );
}
