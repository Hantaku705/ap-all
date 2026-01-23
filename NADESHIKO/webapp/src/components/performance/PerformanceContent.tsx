"use client";

import { useMemo } from "react";
import { useEdit } from "@/contexts/EditContext";
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
import {
  calculateManagerPerformance,
  calculateAccountPerformance,
  calculateClientPerformance,
} from "@/lib/calculations";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { categoryColors } from "@/data/constants";

export default function PerformanceContent() {
  const { deals, selectedMonth } = useEdit();

  // フィルター済みの案件
  const filteredDeals = useMemo(() => {
    if (selectedMonth === "all") return deals;
    return deals.filter((d) => d.month === selectedMonth);
  }, [deals, selectedMonth]);

  // パフォーマンス計算
  const managerPerformance = useMemo(
    () => calculateManagerPerformance(filteredDeals).slice(0, 10),
    [filteredDeals]
  );

  const accountPerformance = useMemo(
    () => calculateAccountPerformance(filteredDeals).slice(0, 10),
    [filteredDeals]
  );

  const clientPerformance = useMemo(
    () => calculateClientPerformance(filteredDeals).slice(0, 10),
    [filteredDeals]
  );

  return (
    <div className="space-y-6">
      {/* 担当者別ランキング */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">担当者別 売上ランキング</h3>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* グラフ */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={managerPerformance}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="manager"
                  stroke="#6b7280"
                  fontSize={12}
                  width={70}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="totalSales" name="売上" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-2 py-1 text-left text-gray-600">#</th>
                  <th className="px-2 py-1 text-left text-gray-600">担当者</th>
                  <th className="px-2 py-1 text-right text-gray-600">売上</th>
                  <th className="px-2 py-1 text-right text-gray-600">粗利</th>
                  <th className="px-2 py-1 text-right text-gray-600">件数</th>
                </tr>
              </thead>
              <tbody>
                {managerPerformance.map((p, i) => (
                  <tr key={p.manager} className="border-b border-gray-100">
                    <td className="px-2 py-1 text-gray-500">{i + 1}</td>
                    <td className="px-2 py-1 text-gray-900">{p.manager}</td>
                    <td className="px-2 py-1 text-right font-medium">{formatCurrency(p.totalSales)}</td>
                    <td className="px-2 py-1 text-right text-green-600">{formatCurrency(p.totalGrossProfit)}</td>
                    <td className="px-2 py-1 text-right text-gray-600">{p.dealCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* アカウント別ランキング */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">アカウント別 売上ランキング</h3>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* グラフ */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={accountPerformance}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="accountName"
                  stroke="#6b7280"
                  fontSize={12}
                  width={90}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="totalSales" name="売上" radius={[0, 4, 4, 0]}>
                  {accountPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.mainCategory]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-2 py-1 text-left text-gray-600">#</th>
                  <th className="px-2 py-1 text-left text-gray-600">アカウント</th>
                  <th className="px-2 py-1 text-center text-gray-600">区分</th>
                  <th className="px-2 py-1 text-right text-gray-600">売上</th>
                  <th className="px-2 py-1 text-right text-gray-600">粗利率</th>
                </tr>
              </thead>
              <tbody>
                {accountPerformance.map((p, i) => (
                  <tr key={p.accountName} className="border-b border-gray-100">
                    <td className="px-2 py-1 text-gray-500">{i + 1}</td>
                    <td className="px-2 py-1 text-gray-900">{p.accountName}</td>
                    <td className="px-2 py-1 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          p.mainCategory === "AJP"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {p.mainCategory}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-right font-medium">{formatCurrency(p.totalSales)}</td>
                    <td className="px-2 py-1 text-right text-gray-600">{formatPercentage(p.grossProfitRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* クライアント別ランキング */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">クライアント別 売上ランキング</h3>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* グラフ */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clientPerformance}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="client"
                  stroke="#6b7280"
                  fontSize={12}
                  width={90}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="totalSales" name="売上" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-2 py-1 text-left text-gray-600">#</th>
                  <th className="px-2 py-1 text-left text-gray-600">クライアント</th>
                  <th className="px-2 py-1 text-right text-gray-600">売上</th>
                  <th className="px-2 py-1 text-right text-gray-600">粗利</th>
                  <th className="px-2 py-1 text-right text-gray-600">件数</th>
                </tr>
              </thead>
              <tbody>
                {clientPerformance.map((p, i) => (
                  <tr key={p.client} className="border-b border-gray-100">
                    <td className="px-2 py-1 text-gray-500">{i + 1}</td>
                    <td className="px-2 py-1 text-gray-900 max-w-40 truncate">{p.client}</td>
                    <td className="px-2 py-1 text-right font-medium">{formatCurrency(p.totalSales)}</td>
                    <td className="px-2 py-1 text-right text-green-600">{formatCurrency(p.totalGrossProfit)}</td>
                    <td className="px-2 py-1 text-right text-gray-600">{p.dealCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
