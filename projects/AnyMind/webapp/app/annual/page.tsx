'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import KPICard from '../components/KPICard';
import {
  annualSummary,
  quarterlyPerformance,
  perHeadMetrics,
  businessUnitsExtended,
  perHeadByUnit,
  formatYoY,
} from '../data/report-data';

const COLORS = {
  blue2024: '#93c5fd',
  blue2025: '#3b82f6',
  green2024: '#86efac',
  green2025: '#10b981',
  highlight: '#f59e0b',
};

const ALL_UNITS = ['ALL', ...businessUnitsExtended.map(u => u.name)];
const QUARTERS = ['ALL', '1Q', '2Q', '3Q', '4Q'];

export default function AnnualSummaryPage() {
  // Filter state
  const [selectedUnits, setSelectedUnits] = useState<string[]>(['ALL']);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('ALL');

  // Format currency in billions
  const formatBillion = (value: number) => `¥${(value / 100000000).toFixed(1)}億`;
  const formatMillion = (value: number) => `¥${(value / 1000000).toFixed(0)}M`;

  // Toggle unit selection
  const toggleUnit = (unit: string) => {
    if (unit === 'ALL') {
      setSelectedUnits(['ALL']);
    } else {
      setSelectedUnits(prev => {
        const newUnits = prev.filter(u => u !== 'ALL');
        if (newUnits.includes(unit)) {
          const filtered = newUnits.filter(u => u !== unit);
          return filtered.length === 0 ? ['ALL'] : filtered;
        } else {
          return [...newUnits, unit];
        }
      });
    }
  };

  // Filtered Annual KPIs based on selected units
  const filteredAnnualKPIs = useMemo(() => {
    if (selectedUnits.includes('ALL')) {
      return {
        revenue: annualSummary.revenue,
        grossProfit: annualSummary.grossProfit,
        operatingProfit: annualSummary.operatingProfit,
        gpMargin: annualSummary.gpMargin,
        opMargin: annualSummary.opMargin,
        revenueYoY: annualSummary.revenueYoY,
        grossProfitYoY: annualSummary.grossProfitYoY,
        operatingProfitYoY: annualSummary.operatingProfitYoY,
        label: '全社',
      };
    }

    // Calculate totals for selected units
    const filtered = businessUnitsExtended.filter(u => selectedUnits.includes(u.name));
    const totalRevenue = filtered.reduce((sum, u) => sum + u.revenue, 0) * 1000; // 千円→円
    const totalGP = filtered.reduce((sum, u) => sum + u.gp, 0) * 1000;
    const totalOP = filtered.reduce((sum, u) => sum + u.op, 0) * 1000;

    // Calculate weighted average YoY (or average for simplicity)
    const avgGPGrowth = filtered.filter(u => u.gpGrowth !== null).reduce((sum, u) => sum + (u.gpGrowth || 0), 0) / filtered.filter(u => u.gpGrowth !== null).length || 0;
    const avgOPGrowth = filtered.filter(u => u.opGrowth !== null).reduce((sum, u) => sum + (u.opGrowth || 0), 0) / filtered.filter(u => u.opGrowth !== null).length || 0;

    return {
      revenue: totalRevenue,
      grossProfit: totalGP,
      operatingProfit: totalOP,
      gpMargin: totalRevenue > 0 ? totalGP / totalRevenue : 0,
      opMargin: totalRevenue > 0 ? totalOP / totalRevenue : 0,
      revenueYoY: avgGPGrowth, // approximation
      grossProfitYoY: avgGPGrowth,
      operatingProfitYoY: avgOPGrowth,
      label: selectedUnits.join(', '),
    };
  }, [selectedUnits]);

  // Filtered business units
  const filteredUnits = useMemo(() => {
    if (selectedUnits.includes('ALL')) return businessUnitsExtended;
    return businessUnitsExtended.filter(u => selectedUnits.includes(u.name));
  }, [selectedUnits]);

  // Filtered per head by unit (exclude ALL row for charts)
  const filteredPerHead = useMemo(() => {
    const data = perHeadByUnit.filter(u => u.name !== 'ALL');
    if (selectedUnits.includes('ALL')) return data;
    return data.filter(u => selectedUnits.includes(u.name));
  }, [selectedUnits]);

  // Quarterly chart data (convert to percentage)
  const quarterlyChartData = quarterlyPerformance.map(q => ({
    quarter: q.quarter,
    Revenue: q.revenueYoY * 100,
    'Gross Profit': q.gpYoY * 100,
    'Operating Profit': q.opYoY * 100,
    isSelected: selectedQuarter === 'ALL' || selectedQuarter === q.quarter,
  }));

  // GP Per Head chart data
  const gpPerHeadChartData = filteredPerHead.map(u => ({
    name: u.name,
    '2024': u.gpPerHead24 || 0,
    '2025': u.gpPerHead25 || 0,
    growth: u.gpGrowth,
  }));

  // OP Per Head chart data
  const opPerHeadChartData = filteredPerHead.map(u => ({
    name: u.name,
    '2024': u.opPerHead24 || 0,
    '2025': u.opPerHead25 || 0,
    growth: u.opGrowth,
  }));

  return (
    <div className="space-y-8">
      {/* Filter Section - Sticky */}
      <section className="sticky top-0 z-10 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="space-y-4">
          {/* Unit Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">部署フィルター</label>
            <div className="flex flex-wrap gap-2">
              {ALL_UNITS.map(unit => (
                <button
                  key={unit}
                  onClick={() => toggleUnit(unit)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    selectedUnits.includes(unit) || (unit === 'ALL' && selectedUnits.includes('ALL'))
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Quarter Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">四半期フィルター</label>
            <div className="flex gap-1">
              {QUARTERS.map(q => (
                <button
                  key={q}
                  onClick={() => setSelectedQuarter(q)}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                    selectedQuarter === q
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Annual KPIs - Now uses filtered data */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          2025 Annual Performance (Jan - Dec)
          {!selectedUnits.includes('ALL') && (
            <span className="ml-2 text-sm font-normal text-blue-600">- {filteredAnnualKPIs.label}</span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Revenue"
            value={formatBillion(filteredAnnualKPIs.revenue)}
            change={formatYoY(filteredAnnualKPIs.revenueYoY)}
            changeType={filteredAnnualKPIs.revenueYoY >= 0 ? 'positive' : 'negative'}
            subtitle="YoY Growth"
          />
          <KPICard
            title="Gross Profit"
            value={`${formatBillion(filteredAnnualKPIs.grossProfit)} (${(filteredAnnualKPIs.gpMargin * 100).toFixed(1)}%)`}
            change={formatYoY(filteredAnnualKPIs.grossProfitYoY)}
            changeType={filteredAnnualKPIs.grossProfitYoY >= 0 ? 'positive' : 'negative'}
            subtitle="YoY Growth"
          />
          <KPICard
            title="Operating Profit"
            value={`${formatBillion(filteredAnnualKPIs.operatingProfit)} (${(filteredAnnualKPIs.opMargin * 100).toFixed(1)}%)`}
            change={formatYoY(filteredAnnualKPIs.operatingProfitYoY)}
            changeType={filteredAnnualKPIs.operatingProfitYoY >= 0 ? 'positive' : 'negative'}
            subtitle="YoY Growth"
          />
        </div>
      </section>

      {/* GP Achievement Rate - Only shown for ALL */}
      {selectedUnits.includes('ALL') && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Gross Profit Achievement</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Target</p>
                <p className="text-2xl font-bold text-gray-700">{formatMillion(annualSummary.targetGrossProfit)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Actual</p>
                <p className="text-2xl font-bold text-blue-600">{formatMillion(annualSummary.actualGrossProfit)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Achievement Rate</p>
                <p className={`text-4xl font-bold ${annualSummary.achievementRate >= 1 ? 'text-green-600' : 'text-red-500'}`}>
                  {(annualSummary.achievementRate * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${annualSummary.achievementRate >= 1 ? 'bg-green-500' : 'bg-red-400'}`}
                style={{ width: `${Math.min(annualSummary.achievementRate * 100, 100)}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Quarterly Performance YoY */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Quarterly YoY Growth (%)
          {selectedQuarter !== 'ALL' && (
            <span className="ml-2 text-sm font-normal text-blue-600">- {selectedQuarter} highlighted</span>
          )}
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={quarterlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => [`${(value as number).toFixed(1)}%`, '']} />
              <Legend />
              <ReferenceLine y={0} stroke="#000" />
              <Bar dataKey="Revenue" fill="#6366f1">
                {quarterlyChartData.map((entry, index) => (
                  <Cell key={`revenue-${index}`} opacity={entry.isSelected ? 1 : 0.3} />
                ))}
              </Bar>
              <Bar dataKey="Gross Profit" fill="#3b82f6">
                {quarterlyChartData.map((entry, index) => (
                  <Cell key={`gp-${index}`} opacity={entry.isSelected ? 1 : 0.3} />
                ))}
              </Bar>
              <Bar dataKey="Operating Profit" fill="#10b981">
                {quarterlyChartData.map((entry, index) => (
                  <Cell key={`op-${index}`} opacity={entry.isSelected ? 1 : 0.3} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Per Head Metrics - Overview */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Per Head Metrics - 全社 (千円)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-md font-semibold text-gray-600 mb-3">GP per Head</h3>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-3xl font-bold text-blue-600">¥{perHeadMetrics.gpPerHead.actual.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Actual (2025)</p>
              </div>
              <div>
                <p className="text-xl text-gray-400">¥{perHeadMetrics.gpPerHead.target.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Target</p>
              </div>
            </div>
            <div className="mt-3 flex gap-4">
              <span className={`text-sm font-medium ${perHeadMetrics.gpPerHead.yoy >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                YoY {formatYoY(perHeadMetrics.gpPerHead.yoy)}
              </span>
              <span className={`text-sm font-medium ${perHeadMetrics.gpPerHead.achievement >= 1 ? 'text-green-600' : 'text-red-500'}`}>
                Achievement {(perHeadMetrics.gpPerHead.achievement * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-md font-semibold text-gray-600 mb-3">OP per Head</h3>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-3xl font-bold text-green-600">¥{perHeadMetrics.opPerHead.actual.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Actual (2025)</p>
              </div>
              <div>
                <p className="text-xl text-gray-400">¥{perHeadMetrics.opPerHead.target.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Target</p>
              </div>
            </div>
            <div className="mt-3 flex gap-4">
              <span className={`text-sm font-medium ${perHeadMetrics.opPerHead.yoy >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                YoY {formatYoY(perHeadMetrics.opPerHead.yoy)}
              </span>
              <span className={`text-sm font-medium ${perHeadMetrics.opPerHead.achievement >= 1 ? 'text-green-600' : 'text-red-500'}`}>
                Achievement {(perHeadMetrics.opPerHead.achievement * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Per Head Metrics - By Unit Charts */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Per Head Metrics - 部署別比較 (千円)
          {!selectedUnits.includes('ALL') && (
            <span className="ml-2 text-sm font-normal text-blue-600">
              - {selectedUnits.join(', ')} selected
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GP Per Head Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-md font-semibold text-gray-600 mb-4">GP per Head (2024 vs 2025)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gpPerHeadChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={11} tickFormatter={(v) => `¥${v.toLocaleString()}`} />
                <YAxis type="category" dataKey="name" fontSize={11} width={80} />
                <Tooltip
                  formatter={(value) => [`¥${(value as number).toLocaleString()}`, '']}
                />
                <Legend />
                <Bar dataKey="2024" fill={COLORS.blue2024} name="2024" />
                <Bar dataKey="2025" fill={COLORS.blue2025} name="2025" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* OP Per Head Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-md font-semibold text-gray-600 mb-4">OP per Head (2024 vs 2025)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={opPerHeadChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={11} tickFormatter={(v) => `¥${v.toLocaleString()}`} />
                <YAxis type="category" dataKey="name" fontSize={11} width={80} />
                <Tooltip
                  formatter={(value) => [`¥${(value as number).toLocaleString()}`, '']}
                />
                <Legend />
                <ReferenceLine x={0} stroke="#000" />
                <Bar dataKey="2024" fill={COLORS.green2024} name="2024" />
                <Bar dataKey="2025" fill={COLORS.green2025} name="2025" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Business Units Extended Table */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Business Unit Performance (2025, 千円)
          {!selectedUnits.includes('ALL') && (
            <span className="ml-2 text-sm font-normal text-blue-600">
              - {filteredUnits.length} units selected
            </span>
          )}
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Unit</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Revenue</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">GP</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">GP Growth</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">GP Achieve</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">OP</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">OP Growth</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">OP Achieve</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map((unit, idx) => (
                <tr key={unit.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-700">{unit.name}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{unit.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{unit.gp.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right font-medium ${unit.gpGrowth !== null && unit.gpGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {unit.gpGrowth !== null ? formatYoY(unit.gpGrowth) : '-'}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${unit.gpAchieve >= 1 ? 'text-green-600' : 'text-red-500'}`}>
                    {(unit.gpAchieve * 100).toFixed(0)}%
                  </td>
                  <td className={`px-4 py-3 text-right ${unit.op >= 0 ? 'text-gray-600' : 'text-red-500'}`}>
                    {unit.op < 0 ? `(${Math.abs(unit.op).toLocaleString()})` : unit.op.toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${unit.opGrowth !== null && unit.opGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {unit.opGrowth !== null ? formatYoY(unit.opGrowth) : '-'}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${unit.opAchieve >= 1 ? 'text-green-600' : 'text-red-500'}`}>
                    {(unit.opAchieve * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
