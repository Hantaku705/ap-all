"use client";

import { useMemo, useState } from "react";
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
  calculateTimeSeriesPerformance,
} from "@/lib/calculations";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { categoryColors, monthOptions } from "@/data/constants";
import TrendChart from "./TrendChart";

type FilterType = 'month' | 'year' | 'quarter';
type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

// 年オプション（データ期間: 2023-11〜2026-04）
const yearOptions = [2023, 2024, 2025, 2026];

// 四半期オプション
const quarterOptions: { value: Quarter; label: string }[] = [
  { value: 'Q1', label: 'Q1 (1-3月)' },
  { value: 'Q2', label: 'Q2 (4-6月)' },
  { value: 'Q3', label: 'Q3 (7-9月)' },
  { value: 'Q4', label: 'Q4 (10-12月)' },
];

// 四半期の月範囲
const quarterMonths: Record<Quarter, { start: string; end: string }> = {
  Q1: { start: '01', end: '03' },
  Q2: { start: '04', end: '06' },
  Q3: { start: '07', end: '09' },
  Q4: { start: '10', end: '12' },
};

export default function PerformanceContent() {
  const { deals } = useEdit();

  // フィルタータイプ状態
  const [filterType, setFilterType] = useState<FilterType>('month');

  // 月フィルター状態
  const [startMonth, setStartMonth] = useState(
    monthOptions.length > 6 ? monthOptions[monthOptions.length - 7].value : monthOptions[0].value
  );
  const [endMonth, setEndMonth] = useState(
    monthOptions[monthOptions.length - 1].value
  );

  // 年フィルター状態
  const [selectedYear, setSelectedYear] = useState(2025);

  // 四半期フィルター状態
  const [selectedQuarterYear, setSelectedQuarterYear] = useState(2025);
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('Q1');

  // 実際のフィルター期間を計算
  const { effectiveStartMonth, effectiveEndMonth } = useMemo(() => {
    if (filterType === 'year') {
      return {
        effectiveStartMonth: `${selectedYear}-01`,
        effectiveEndMonth: `${selectedYear}-12`,
      };
    }
    if (filterType === 'quarter') {
      const range = quarterMonths[selectedQuarter];
      return {
        effectiveStartMonth: `${selectedQuarterYear}-${range.start}`,
        effectiveEndMonth: `${selectedQuarterYear}-${range.end}`,
      };
    }
    // filterType === 'month'
    return {
      effectiveStartMonth: startMonth,
      effectiveEndMonth: endMonth,
    };
  }, [filterType, startMonth, endMonth, selectedYear, selectedQuarterYear, selectedQuarter]);

  // フィルター済みの案件
  const filteredDeals = useMemo(() => {
    return deals.filter((d) => d.month >= effectiveStartMonth && d.month <= effectiveEndMonth);
  }, [deals, effectiveStartMonth, effectiveEndMonth]);

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

  // 時系列データ計算
  const managerTimeSeries = useMemo(
    () => calculateTimeSeriesPerformance(deals, "manager", effectiveStartMonth, effectiveEndMonth, 10),
    [deals, effectiveStartMonth, effectiveEndMonth]
  );

  const accountTimeSeries = useMemo(
    () => calculateTimeSeriesPerformance(deals, "accountName", effectiveStartMonth, effectiveEndMonth, 10),
    [deals, effectiveStartMonth, effectiveEndMonth]
  );

  const clientTimeSeries = useMemo(
    () => calculateTimeSeriesPerformance(deals, "client", effectiveStartMonth, effectiveEndMonth, 10),
    [deals, effectiveStartMonth, effectiveEndMonth]
  );

  // 変動率でソートしてボトルネック（減少上位3）を特定
  const getBottleneckNames = (items: { name: string; changeRate: number | null }[]) => {
    return items
      .filter((item) => item.changeRate !== null && item.changeRate < 0)
      .sort((a, b) => (a.changeRate ?? 0) - (b.changeRate ?? 0))
      .slice(0, 3)
      .map((item) => item.name);
  };

  const managerBottlenecks = useMemo(
    () => getBottleneckNames(managerTimeSeries.items),
    [managerTimeSeries.items]
  );

  const accountBottlenecks = useMemo(
    () => getBottleneckNames(accountTimeSeries.items),
    [accountTimeSeries.items]
  );

  const clientBottlenecks = useMemo(
    () => getBottleneckNames(clientTimeSeries.items),
    [clientTimeSeries.items]
  );

  // 比較ラベル（filterTypeに応じて変更）
  const comparisonLabel = useMemo(() => {
    switch (filterType) {
      case 'year':
        return '前年比';
      case 'quarter':
        return '前Q比';
      default:
        return '前月比';
    }
  }, [filterType]);

  // 期間ラベル（セクションタイトル用）
  const periodLabel = useMemo(() => {
    if (filterType === 'year') {
      return `${selectedYear}年`;
    }
    if (filterType === 'quarter') {
      return `${selectedQuarterYear}年 ${selectedQuarter}`;
    }
    // month
    const formatMonth = (m: string) => m.replace(/^20/, '').replace('-', '年') + '月';
    return `${formatMonth(startMonth)}〜${formatMonth(endMonth)}`;
  }, [filterType, selectedYear, selectedQuarterYear, selectedQuarter, startMonth, endMonth]);

  // 比較期間ラベル（比較対象の期間を表示）
  const comparisonPeriodLabel = useMemo(() => {
    if (filterType === 'year') {
      return `${selectedYear - 1}年`;
    }
    if (filterType === 'quarter') {
      // 前Qを計算
      const prevQ = selectedQuarter === 'Q1' ? 'Q4' : `Q${parseInt(selectedQuarter[1]) - 1}`;
      const prevYear = selectedQuarter === 'Q1' ? selectedQuarterYear - 1 : selectedQuarterYear;
      return `${prevYear}年 ${prevQ}`;
    }
    // month - 前月の範囲
    const getPrevMonth = (m: string) => {
      const [y, mo] = m.split('-').map(Number);
      const prev = new Date(y, mo - 2, 1);
      return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
    };
    const prevStart = getPrevMonth(effectiveStartMonth);
    const prevEnd = getPrevMonth(effectiveEndMonth);
    const formatMonth = (m: string) => m.replace(/^20/, '').replace('-', '年') + '月';
    return `${formatMonth(prevStart)}〜${formatMonth(prevEnd)}`;
  }, [filterType, selectedYear, selectedQuarterYear, selectedQuarter, effectiveStartMonth, effectiveEndMonth]);

  // 変動率表示コンポーネント
  const ChangeRateBadge = ({
    rate,
    isBottleneck,
  }: {
    rate: number | null;
    isBottleneck: boolean;
  }) => {
    if (rate === null) {
      return <span className="text-gray-400 text-xs">-</span>;
    }

    const isPositive = rate >= 0;
    const baseClasses = "text-xs font-medium px-1.5 py-0.5 rounded";

    if (isBottleneck) {
      return (
        <span className={`${baseClasses} bg-red-100 text-red-700`}>
          ↓ {Math.abs(rate).toFixed(1)}%
        </span>
      );
    }

    return (
      <span
        className={`${baseClasses} ${
          isPositive
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {isPositive ? "↑" : "↓"} {Math.abs(rate).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 期間フィルター - sticky */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700">分析期間:</span>

          {/* フィルタータイプ切り替え */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {(['month', 'year', 'quarter'] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  filterType === type
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type === 'month' ? '月' : type === 'year' ? '年' : '四半期'}
              </button>
            ))}
          </div>

          {/* 月フィルター */}
          {filterType === 'month' && (
            <>
              <select
                value={startMonth}
                onChange={(e) => {
                  setStartMonth(e.target.value);
                  if (e.target.value > endMonth) {
                    setEndMonth(e.target.value);
                  }
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="text-gray-500">〜</span>
              <select
                value={endMonth}
                onChange={(e) => {
                  setEndMonth(e.target.value);
                  if (e.target.value < startMonth) {
                    setStartMonth(e.target.value);
                  }
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {monthOptions
                  .filter((opt) => opt.value >= startMonth)
                  .map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>
            </>
          )}

          {/* 年フィルター */}
          {filterType === 'year' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
          )}

          {/* 四半期フィルター */}
          {filterType === 'quarter' && (
            <>
              <select
                value={selectedQuarterYear}
                onChange={(e) => setSelectedQuarterYear(Number(e.target.value))}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </select>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value as Quarter)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {quarterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </>
          )}

          <span className="text-xs text-gray-400 ml-2">
            ({filteredDeals.length}件)
          </span>
        </div>
      </div>

      {/* 担当者別ランキング */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          担当者別 売上ランキング
          <span className="ml-2 text-xs font-normal text-gray-500">（{periodLabel}）</span>
        </h3>

        {/* 時系列グラフ */}
        <TrendChart
          items={managerTimeSeries.items}
          months={managerTimeSeries.months}
          title="月別売上推移（トップ10）"
        />

        <div className="grid lg:grid-cols-2 gap-6 mt-4">
          {/* 棒グラフ */}
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
                <Bar
                  dataKey="totalSales"
                  name="売上"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                />
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
                  <th className="px-2 py-1 text-right text-gray-600">売上<span className="text-xs font-normal text-gray-400 ml-1">({periodLabel})</span></th>
                  <th className="px-2 py-1 text-right text-gray-600">粗利<span className="text-xs font-normal text-gray-400 ml-1">({periodLabel})</span></th>
                  <th className="px-2 py-1 text-right text-gray-600">{comparisonLabel}<span className="text-xs font-normal text-gray-400 ml-1">({comparisonPeriodLabel})</span></th>
                </tr>
              </thead>
              <tbody>
                {managerPerformance.map((p, i) => {
                  const tsItem = managerTimeSeries.items.find(
                    (item) => item.name === p.manager
                  );
                  const isBottleneck = managerBottlenecks.includes(p.manager);

                  return (
                    <tr
                      key={p.manager}
                      className={`border-b border-gray-100 ${
                        isBottleneck ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-2 py-1 text-gray-500">{i + 1}</td>
                      <td className="px-2 py-1 text-gray-900">{p.manager}</td>
                      <td className="px-2 py-1 text-right font-medium">
                        {formatCurrency(p.totalSales)}
                      </td>
                      <td className="px-2 py-1 text-right text-green-600">
                        {formatCurrency(p.totalGrossProfit)}
                      </td>
                      <td className="px-2 py-1 text-right">
                        <ChangeRateBadge
                          rate={tsItem?.changeRate ?? null}
                          isBottleneck={isBottleneck}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* アカウント別ランキング */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          アカウント別 売上ランキング
          <span className="ml-2 text-xs font-normal text-gray-500">（{periodLabel}）</span>
        </h3>

        {/* 時系列グラフ */}
        <TrendChart
          items={accountTimeSeries.items}
          months={accountTimeSeries.months}
          title="月別売上推移（トップ10）"
        />

        <div className="grid lg:grid-cols-2 gap-6 mt-4">
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
                    <Cell
                      key={`cell-${index}`}
                      fill={categoryColors[entry.mainCategory]}
                    />
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
                  <th className="px-2 py-1 text-left text-gray-600">
                    アカウント
                  </th>
                  <th className="px-2 py-1 text-center text-gray-600">区分</th>
                  <th className="px-2 py-1 text-right text-gray-600">売上<span className="text-xs font-normal text-gray-400 ml-1">({periodLabel})</span></th>
                  <th className="px-2 py-1 text-right text-gray-600">{comparisonLabel}<span className="text-xs font-normal text-gray-400 ml-1">({comparisonPeriodLabel})</span></th>
                </tr>
              </thead>
              <tbody>
                {accountPerformance.map((p, i) => {
                  const tsItem = accountTimeSeries.items.find(
                    (item) => item.name === p.accountName
                  );
                  const isBottleneck = accountBottlenecks.includes(
                    p.accountName
                  );

                  return (
                    <tr
                      key={p.accountName}
                      className={`border-b border-gray-100 ${
                        isBottleneck ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-2 py-1 text-gray-500">{i + 1}</td>
                      <td className="px-2 py-1 text-gray-900">
                        {p.accountName}
                      </td>
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
                      <td className="px-2 py-1 text-right font-medium">
                        {formatCurrency(p.totalSales)}
                      </td>
                      <td className="px-2 py-1 text-right">
                        <ChangeRateBadge
                          rate={tsItem?.changeRate ?? null}
                          isBottleneck={isBottleneck}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* クライアント別ランキング */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          クライアント別 売上ランキング
          <span className="ml-2 text-xs font-normal text-gray-500">（{periodLabel}）</span>
        </h3>

        {/* 時系列グラフ */}
        <TrendChart
          items={clientTimeSeries.items}
          months={clientTimeSeries.months}
          title="月別売上推移（トップ10）"
        />

        <div className="grid lg:grid-cols-2 gap-6 mt-4">
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
                <Bar
                  dataKey="totalSales"
                  name="売上"
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-2 py-1 text-left text-gray-600">#</th>
                  <th className="px-2 py-1 text-left text-gray-600">
                    クライアント
                  </th>
                  <th className="px-2 py-1 text-right text-gray-600">売上<span className="text-xs font-normal text-gray-400 ml-1">({periodLabel})</span></th>
                  <th className="px-2 py-1 text-right text-gray-600">粗利<span className="text-xs font-normal text-gray-400 ml-1">({periodLabel})</span></th>
                  <th className="px-2 py-1 text-right text-gray-600">{comparisonLabel}<span className="text-xs font-normal text-gray-400 ml-1">({comparisonPeriodLabel})</span></th>
                </tr>
              </thead>
              <tbody>
                {clientPerformance.map((p, i) => {
                  const tsItem = clientTimeSeries.items.find(
                    (item) => item.name === p.client
                  );
                  const isBottleneck = clientBottlenecks.includes(p.client);

                  return (
                    <tr
                      key={p.client}
                      className={`border-b border-gray-100 ${
                        isBottleneck ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-2 py-1 text-gray-500">{i + 1}</td>
                      <td className="px-2 py-1 text-gray-900 max-w-40 truncate">
                        {p.client}
                      </td>
                      <td className="px-2 py-1 text-right font-medium">
                        {formatCurrency(p.totalSales)}
                      </td>
                      <td className="px-2 py-1 text-right text-green-600">
                        {formatCurrency(p.totalGrossProfit)}
                      </td>
                      <td className="px-2 py-1 text-right">
                        <ChangeRateBadge
                          rate={tsItem?.changeRate ?? null}
                          isBottleneck={isBottleneck}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
