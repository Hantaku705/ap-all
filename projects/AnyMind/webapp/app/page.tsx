'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import KPICard from './components/KPICard';
import { groupKPIs, monthlyPL, formatCurrency, formatYoY } from './data/report-data';

export default function OverviewPage() {
  const chartData = monthlyPL.map(d => ({
    month: d.month,
    grossProfit: d.grossProfit / 1000,
    operatingProfit: d.operatingProfit / 1000,
  }));

  return (
    <div className="space-y-8">
      {/* Global KPIs */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Global Performance (December 2025)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Revenue"
            value={formatCurrency(groupKPIs.global.revenue.current, 'million')}
            change={formatYoY(groupKPIs.global.revenue.yoy)}
            changeType="positive"
            subtitle="YoY Growth"
          />
          <KPICard
            title="Gross Profit"
            value={formatCurrency(groupKPIs.global.grossProfit.current, 'million')}
            change={formatYoY(groupKPIs.global.grossProfit.yoy)}
            changeType="positive"
            subtitle="YoY Growth"
          />
          <KPICard
            title="Operating Profit"
            value={formatCurrency(groupKPIs.global.operatingProfit.current, 'million')}
            change={formatYoY(groupKPIs.global.operatingProfit.yoy)}
            changeType="positive"
            subtitle="YoY Growth"
          />
        </div>
      </section>

      {/* Japan KPIs */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Japan Performance (December 2025)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Revenue"
            value={formatCurrency(groupKPIs.japan.revenue.current, 'million')}
            change={formatYoY(groupKPIs.japan.revenue.yoy)}
            changeType="positive"
            subtitle="YoY Growth"
          />
          <KPICard
            title="Gross Profit"
            value={formatCurrency(groupKPIs.japan.grossProfit.current, 'million')}
            change={formatYoY(groupKPIs.japan.grossProfit.yoy)}
            changeType="positive"
            subtitle="YoY Growth"
          />
          <KPICard
            title="Operating Profit"
            value={formatCurrency(groupKPIs.japan.operatingProfit.current, 'million')}
            change={formatYoY(groupKPIs.japan.operatingProfit.yoy)}
            changeType="positive"
            subtitle="YoY Growth"
          />
        </div>
      </section>

      {/* YTD Summary */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">YTD Summary (Japan)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="YTD Revenue"
            value={formatCurrency(groupKPIs.japan.ytd.revenue, 'million')}
            subtitle="Jan - Dec 2025"
          />
          <KPICard
            title="YTD Gross Profit"
            value={formatCurrency(groupKPIs.japan.ytd.grossProfit, 'million')}
            subtitle="Jan - Dec 2025"
          />
          <KPICard
            title="YTD Operating Profit"
            value={formatCurrency(groupKPIs.japan.ytd.operatingProfit, 'million')}
            subtitle="Jan - Dec 2025"
          />
        </div>
      </section>

      {/* Monthly Trend Chart */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Monthly Trend (Japan, 千円)</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => [`¥${(value as number).toFixed(0)}K`, '']} />
              <Legend />
              <Line
                type="monotone"
                dataKey="grossProfit"
                name="Gross Profit"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
              <Line
                type="monotone"
                dataKey="operatingProfit"
                name="Operating Profit"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
