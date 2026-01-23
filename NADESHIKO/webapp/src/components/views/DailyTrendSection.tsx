'use client';

import { useState, useMemo } from 'react';
import { ViewRecord } from '@/data/views-data';
import {
  filterByLastNDays,
  filterByDateRange,
  calculateDailyViewsForAccount,
  calculateDailyViewsMultiAccount,
} from '@/lib/view-calculations';
import AccountSelector from './AccountSelector';
import DailyTrendChart from './DailyTrendChart';

interface DailyTrendSectionProps {
  data: ViewRecord[];
}

type PeriodOption = '30' | '60' | '90' | 'custom';
type ViewMode = 'single' | 'multi';

export default function DailyTrendSection({ data }: DailyTrendSectionProps) {
  const [period, setPeriod] = useState<PeriodOption>('30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // アカウント一覧
  const accountOptions = useMemo(() => {
    return [...new Set(data.map(r => r.accountName))].sort();
  }, [data]);

  // 期間でフィルタしたデータ
  const filteredData = useMemo(() => {
    if (period === 'custom' && customStart && customEnd) {
      return filterByDateRange(data, customStart, customEnd);
    }
    const days = parseInt(period);
    return filterByLastNDays(data, days);
  }, [data, period, customStart, customEnd]);

  // グラフデータ
  const chartData = useMemo(() => {
    if (selectedAccounts.length === 0) return null;

    if (viewMode === 'single' && selectedAccounts.length === 1) {
      return {
        mode: 'single' as const,
        data: calculateDailyViewsForAccount(filteredData, selectedAccounts[0]),
        accountName: selectedAccounts[0],
      };
    }

    return {
      mode: 'multi' as const,
      data: calculateDailyViewsMultiAccount(filteredData, selectedAccounts),
      accountNames: selectedAccounts,
    };
  }, [filteredData, selectedAccounts, viewMode]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold">日別再生数トラッキング</h3>

        {/* 期間選択 */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">期間:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodOption)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="30">直近30日</option>
            <option value="60">直近60日</option>
            <option value="90">直近90日</option>
            <option value="custom">カスタム</option>
          </select>
        </div>

        {/* カスタム期間入力 */}
        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm"
            />
            <span className="text-gray-500">〜</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm"
            />
          </div>
        )}

        {/* 表示モード */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">モード:</label>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => {
                setViewMode('single');
                setSelectedAccounts(selectedAccounts.slice(0, 1));
              }}
              className={`px-3 py-1 text-sm ${
                viewMode === 'single'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              単一
            </button>
            <button
              onClick={() => setViewMode('multi')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'multi'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              比較
            </button>
          </div>
        </div>

        {/* アカウント選択 */}
        <AccountSelector
          accounts={accountOptions}
          selectedAccounts={selectedAccounts}
          onSelectionChange={setSelectedAccounts}
          maxSelection={viewMode === 'single' ? 1 : 10}
          mode={viewMode}
        />
      </div>

      {/* グラフエリア */}
      {chartData ? (
        chartData.mode === 'single' ? (
          <DailyTrendChart
            mode="single"
            data={chartData.data}
            accountName={chartData.accountName}
          />
        ) : (
          <DailyTrendChart
            mode="multi"
            data={chartData.data}
            accountNames={chartData.accountNames}
          />
        )
      ) : (
        <div className="text-center text-gray-500 py-12">
          アカウントを選択してください
        </div>
      )}

      {/* 期間内の件数表示 */}
      <div className="mt-2 text-sm text-gray-500 text-right">
        期間内: {filteredData.length.toLocaleString()} 件
      </div>
    </div>
  );
}
