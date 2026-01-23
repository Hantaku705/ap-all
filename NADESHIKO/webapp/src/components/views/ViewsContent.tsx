'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { viewsData } from '@/data/views-data';
import {
  calculateMonthlyViews,
  calculateAccountViewRanking,
  calculateManagerViewRanking,
  calculateAccountViews,
  calculateViewsKPI,
  filterByPeriods,
  generatePeriodOptions,
} from '@/lib/view-calculations';
import ViewsKPICards from './ViewsKPICards';
import ViewsTrendChart from './ViewsTrendChart';
import AccountRanking from './AccountRanking';
import AccountPieChart from './AccountPieChart';
import DailyTrendSection from './DailyTrendSection';

export default function ViewsContent() {
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['all']);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [prTypeFilter, setPrTypeFilter] = useState<'all' | 'PR' | '通常'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target as Node)) {
        setPeriodDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const periodOptions = useMemo(
    () => generatePeriodOptions(viewsData),
    []
  );

  // アカウント一覧を取得
  const accountOptions = useMemo(() => {
    const accounts = [...new Set(viewsData.map(r => r.accountName))].sort();
    return accounts;
  }, []);

  // プラットフォーム一覧を取得
  const platformOptions = useMemo(() => {
    const platforms = [...new Set(viewsData.map(r => r.platform))].sort();
    return platforms;
  }, []);

  const filteredData = useMemo(() => {
    let data = filterByPeriods(viewsData, selectedPeriods);

    if (prTypeFilter !== 'all') {
      data = data.filter(r => r.prType === prTypeFilter);
    }
    if (accountFilter !== 'all') {
      data = data.filter(r => r.accountName === accountFilter);
    }
    if (platformFilter !== 'all') {
      data = data.filter(r => r.platform === platformFilter);
    }

    return data;
  }, [selectedPeriods, prTypeFilter, accountFilter, platformFilter]);

  // 期間選択ハンドラー
  const handlePeriodToggle = (value: string) => {
    if (value === 'all') {
      setSelectedPeriods(['all']);
    } else {
      setSelectedPeriods(prev => {
        const withoutAll = prev.filter(p => p !== 'all');
        if (withoutAll.includes(value)) {
          const newPeriods = withoutAll.filter(p => p !== value);
          return newPeriods.length === 0 ? ['all'] : newPeriods;
        } else {
          return [...withoutAll, value];
        }
      });
    }
  };

  // 選択中の期間ラベル
  const selectedPeriodsLabel = useMemo(() => {
    if (selectedPeriods.includes('all')) return '全期間';
    if (selectedPeriods.length === 1) {
      const opt = periodOptions.find(o => o.value === selectedPeriods[0]);
      return opt?.label || selectedPeriods[0];
    }
    return `${selectedPeriods.length}件選択中`;
  }, [selectedPeriods, periodOptions]);

  const kpi = useMemo(() => calculateViewsKPI(filteredData), [filteredData]);

  const monthlyData = useMemo(
    () => calculateMonthlyViews(filteredData),
    [filteredData]
  );

  const accountRanking = useMemo(
    () => calculateAccountViewRanking(filteredData),
    [filteredData]
  );

  const managerRanking = useMemo(
    () => calculateManagerViewRanking(filteredData),
    [filteredData]
  );

  const accountPieData = useMemo(
    () => calculateAccountViews(filteredData),
    [filteredData]
  );

  // グループ化されたオプション
  const groupedOptions = useMemo(() => {
    const groups: Record<string, typeof periodOptions> = {};
    for (const opt of periodOptions) {
      if (!groups[opt.group]) {
        groups[opt.group] = [];
      }
      groups[opt.group].push(opt);
    }
    return groups;
  }, [periodOptions]);

  return (
    <div className="space-y-6">
      {/* フィルターバー */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2" ref={periodDropdownRef}>
          <label className="text-sm font-medium text-gray-700">期間:</label>
          <div className="relative">
            <button
              onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
              className="border rounded-lg px-3 py-2 text-sm bg-white min-w-[140px] text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="truncate">{selectedPeriodsLabel}</span>
              <svg className={`w-4 h-4 transition-transform ${periodDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {periodDropdownOpen && (
              <div className="absolute z-50 mt-1 w-64 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {Object.entries(groupedOptions).map(([group, options]) => (
                  <div key={group}>
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                      {group}
                    </div>
                    {options.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPeriods.includes(opt.value)}
                          onChange={() => handlePeriodToggle(opt.value)}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">PR/通常:</label>
          <select
            value={prTypeFilter}
            onChange={(e) => setPrTypeFilter(e.target.value as 'all' | 'PR' | '通常')}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全て</option>
            <option value="PR">PR</option>
            <option value="通常">通常</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">アカウント:</label>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全て</option>
            {accountOptions.map((account) => (
              <option key={account} value={account}>
                {account}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">SNS:</label>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全て</option>
            {platformOptions.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">グラフ:</label>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-sm ${
                chartType === 'line'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              折れ線
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm ${
                chartType === 'bar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              棒グラフ
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {filteredData.length.toLocaleString()} 件
        </div>
      </div>

      {/* KPIカード */}
      <ViewsKPICards
        totalViews={kpi.totalViews}
        avgViews={kpi.avgViews}
        medianViews={kpi.medianViews}
        postCount={kpi.postCount}
        avgEngagement={kpi.avgEngagement}
        avgRetention={kpi.avgRetention}
      />

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ViewsTrendChart data={monthlyData} chartType={chartType} />
        </div>
        <div>
          <AccountPieChart data={accountPieData} />
        </div>
      </div>

      {/* 日別再生数トラッキング */}
      <DailyTrendSection data={filteredData} />

      {/* ランキング */}
      <AccountRanking
        accountRanking={accountRanking}
        managerRanking={managerRanking}
      />

      {/* データテーブル */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">投稿データ一覧</h3>
        </div>
        <div className="overflow-x-auto max-h-[600px]">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">投稿日</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">アカウント名</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">PR/通常</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">sns</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">担当者</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">タイトル</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">URL</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">種別</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700 whitespace-nowrap">動画尺</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700 whitespace-nowrap">再生数</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700 whitespace-nowrap">いいね</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700 whitespace-nowrap">コメント</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700 whitespace-nowrap">共有</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700 whitespace-nowrap">保存</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 100).map((record, i) => (
                <tr key={record.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 whitespace-nowrap">{record.postDate}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{record.accountName}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      record.prType === 'PR'
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {record.prType}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{record.platform}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{record.manager || '-'}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate" title={record.title}>
                    {record.title}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {record.url ? (
                      <a
                        href={record.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Link
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{record.category || '-'}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {record.duration
                      ? `${Math.floor(record.duration / 60)}:${String(record.duration % 60).padStart(2, '0')}`
                      : '-'}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{record.views.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{record.likes.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{record.comments.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{record.shares.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{record.saves.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length > 100 && (
          <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-200">
            ※最新100件を表示（全{filteredData.length.toLocaleString()}件）
          </div>
        )}
      </div>
    </div>
  );
}
