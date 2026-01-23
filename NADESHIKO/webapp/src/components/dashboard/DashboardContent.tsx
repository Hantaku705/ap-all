"use client";

import { useMemo } from "react";
import { useEdit } from "@/contexts/EditContext";
import KPICards from "./KPICards";
import MonthlyTrendChart from "./MonthlyTrendChart";
import { calculateMonthlySummary, calculateTotalSummary } from "@/lib/calculations";
import { monthOptions } from "@/data/constants";

export default function DashboardContent() {
  const { deals, targets, selectedMonth, setSelectedMonth } = useEdit();

  // フィルター済みの案件
  const filteredDeals = useMemo(() => {
    if (selectedMonth === "all") return deals;
    return deals.filter((d) => d.month === selectedMonth);
  }, [deals, selectedMonth]);

  // 月別サマリー
  const monthlySummaries = useMemo(() => {
    return calculateMonthlySummary(deals, targets);
  }, [deals, targets]);

  // 全体サマリー（フィルター適用）
  const summary = useMemo(() => {
    const filteredTargets =
      selectedMonth === "all"
        ? targets
        : targets.filter((t) => t.month === selectedMonth);
    return calculateTotalSummary(filteredDeals, filteredTargets);
  }, [filteredDeals, targets, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* 月セレクター */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">表示期間:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="all">全期間</option>
          {monthOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* KPIカード */}
      <KPICards
        totalSales={summary.totalSales}
        totalGrossProfit={summary.totalGrossProfit}
        grossProfitRate={summary.grossProfitRate}
        achievementRate={summary.achievementRate}
        target={summary.totalTarget}
        dealCount={summary.dealCount}
        completedCount={summary.completedCount}
      />

      {/* 月次推移グラフ */}
      <MonthlyTrendChart data={monthlySummaries} />

      {/* 月別詳細 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">月別詳細</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 text-left text-gray-600">月</th>
                <th className="px-3 py-2 text-right text-gray-600">目標</th>
                <th className="px-3 py-2 text-right text-gray-600">売上</th>
                <th className="px-3 py-2 text-right text-gray-600">粗利</th>
                <th className="px-3 py-2 text-right text-gray-600">粗利率</th>
                <th className="px-3 py-2 text-right text-gray-600">達成率</th>
                <th className="px-3 py-2 text-right text-gray-600">案件数</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummaries.map((s) => (
                <tr key={s.month} className="border-b border-gray-100">
                  <td className="px-3 py-2 text-gray-900">
                    {s.month.replace("-", "年") + "月"}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {s.target > 0
                      ? `¥${(s.target / 10000).toFixed(0)}万`
                      : "-"}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-900 font-medium">
                    ¥{(s.totalSales / 10000).toFixed(0)}万
                  </td>
                  <td className="px-3 py-2 text-right text-green-600">
                    ¥{(s.totalGrossProfit / 10000).toFixed(0)}万
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {s.grossProfitRate.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        s.achievementRate >= 100
                          ? "bg-green-100 text-green-700"
                          : s.target > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.target > 0 ? `${s.achievementRate.toFixed(1)}%` : "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {s.dealCount}件
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
