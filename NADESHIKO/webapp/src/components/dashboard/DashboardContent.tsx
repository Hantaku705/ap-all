"use client";

import { useMemo } from "react";
import { useEdit } from "@/contexts/EditContext";
import KPICards from "./KPICards";
import MonthlyTrendChart from "./MonthlyTrendChart";
import {
  calculateMonthlySummary,
  calculateMonthlySummaryWithYoY,
  calculatePeriodComparison,
  getPeriodType,
  periodToMonths,
} from "@/lib/calculations";
import { periodOptions, PeriodType } from "@/data/constants";

function formatChange(value: number | null): string {
  if (value === null) return "-";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function getChangeColor(value: number | null): string {
  if (value === null) return "text-gray-400";
  return value >= 0 ? "text-green-600" : "text-red-600";
}

export default function DashboardContent() {
  const { deals, targets, selectedMonth, setSelectedMonth } = useEdit();

  // 期間タイプを判定
  const periodType = useMemo((): PeriodType => {
    return getPeriodType(selectedMonth);
  }, [selectedMonth]);

  // フィルター済みの案件
  const filteredDeals = useMemo(() => {
    if (selectedMonth === "all") return deals;
    const months = periodToMonths(selectedMonth);
    if (months.length === 0) return deals;
    return deals.filter((d) => months.includes(d.month));
  }, [deals, selectedMonth]);

  // 月別サマリー
  const monthlySummaries = useMemo(() => {
    return calculateMonthlySummary(deals, targets);
  }, [deals, targets]);

  // 月別サマリー with YoY（テーブル用）
  const monthlySummariesWithYoY = useMemo(() => {
    return calculateMonthlySummaryWithYoY(monthlySummaries);
  }, [monthlySummaries]);

  // 期間比較計算（MoM/QoQ/YoY）
  const periodComparison = useMemo(() => {
    return calculatePeriodComparison(deals, targets, selectedMonth);
  }, [deals, targets, selectedMonth]);

  // グループ化されたオプション
  const groupedOptions = useMemo(() => {
    const groups: Record<string, typeof periodOptions> = {};
    periodOptions.forEach((opt) => {
      const group = opt.group || "";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(opt);
    });
    return groups;
  }, []);

  return (
    <div className="space-y-6">
      {/* 期間セレクター */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">表示期間:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {Object.entries(groupedOptions).map(([group, options]) => (
            group === "" ? (
              options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            ) : (
              <optgroup key={group} label={`── ${group} ──`}>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            )
          ))}
        </select>
        {periodType !== "all" && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {periodComparison.comparisonLabel}比較
          </span>
        )}
      </div>

      {/* KPIカード */}
      <KPICards
        totalSales={periodComparison.currentPeriod.totalSales}
        totalGrossProfit={periodComparison.currentPeriod.totalGrossProfit}
        grossProfitRate={periodComparison.currentPeriod.grossProfitRate}
        achievementRate={periodComparison.currentPeriod.achievementRate}
        target={periodComparison.currentPeriod.target}
        dealCount={periodComparison.currentPeriod.dealCount}
        completedCount={periodComparison.currentPeriod.completedCount}
        salesChange={periodComparison.salesChange}
        grossProfitChange={periodComparison.grossProfitChange}
        dealCountChange={periodComparison.dealCountChange}
        comparisonLabel={periodComparison.comparisonLabel}
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
                <th className="px-3 py-2 text-right text-gray-600">売上YoY</th>
                <th className="px-3 py-2 text-right text-gray-600">粗利</th>
                <th className="px-3 py-2 text-right text-gray-600">粗利YoY</th>
                <th className="px-3 py-2 text-right text-gray-600">粗利率</th>
                <th className="px-3 py-2 text-right text-gray-600">達成率</th>
                <th className="px-3 py-2 text-right text-gray-600">案件数</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummariesWithYoY.map((s) => (
                <tr key={s.month} className="border-b border-gray-100">
                  <td className="px-3 py-2 text-gray-900">
                    {s.month.slice(2, 4)}年{parseInt(s.month.split("-")[1])}月
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {s.target > 0
                      ? `¥${(s.target / 10000).toFixed(0)}万`
                      : "-"}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-900 font-medium">
                    ¥{(s.totalSales / 10000).toFixed(0)}万
                  </td>
                  <td className={`px-3 py-2 text-right font-medium ${getChangeColor(s.salesYoY)}`}>
                    {formatChange(s.salesYoY)}
                  </td>
                  <td className="px-3 py-2 text-right text-green-600">
                    ¥{(s.totalGrossProfit / 10000).toFixed(0)}万
                  </td>
                  <td className={`px-3 py-2 text-right font-medium ${getChangeColor(s.grossProfitYoY)}`}>
                    {formatChange(s.grossProfitYoY)}
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
