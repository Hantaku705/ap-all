'use client';

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from 'recharts';
import { monthlyPL, costBreakdown, formatCurrency, formatPercent } from '../data/report-data';

export default function PLSummaryPage() {
  const marginData = monthlyPL.map(d => ({
    month: d.month,
    gpMargin: d.gpMargin * 100,
    opMargin: d.opMargin * 100,
  }));

  const perHeadData = monthlyPL.map(d => ({
    month: d.month,
    gpPerHead: d.gpPerHead,
    opPerHead: d.opPerHead,
    headcount: d.headcount,
  }));

  const costData = monthlyPL.map(d => ({
    month: d.month,
    personnel: d.personnelCost / 1000,
    otherSGA: d.otherSGA / 1000,
    admin: d.adminCost / 1000,
    engineer: d.engineerCost / 1000,
  }));

  return (
    <div className="space-y-8">
      {/* Revenue & Profit Trend */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Revenue & Profit Trend (千円)</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={monthlyPL.map(d => ({
              month: d.month,
              revenue: d.revenue ? d.revenue / 1000 : null,
              grossProfit: d.grossProfit / 1000,
              operatingProfit: d.operatingProfit / 1000,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => [`¥${(value as number)?.toFixed(0)}K`, '']} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#94a3b8" />
              <Line type="monotone" dataKey="grossProfit" name="Gross Profit" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="operatingProfit" name="Operating Profit" stroke="#10b981" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Margin Trend */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Margin Trend (%)</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={marginData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} domain={[-10, 60]} />
              <Tooltip formatter={(value) => [`${(value as number).toFixed(1)}%`, '']} />
              <Legend />
              <Line type="monotone" dataKey="gpMargin" name="GP Margin" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="opMargin" name="OP Margin" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Per Head Metrics */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Per Head Metrics (千円)</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={perHeadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis yAxisId="left" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="gpPerHead" name="GP/Head" fill="#3b82f6" />
              <Bar yAxisId="left" dataKey="opPerHead" name="OP/Head" fill="#10b981" />
              <Line yAxisId="right" type="monotone" dataKey="headcount" name="Headcount" stroke="#f59e0b" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Cost Breakdown */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Cost Breakdown (千円)</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => [`¥${(value as number).toFixed(0)}K`, '']} />
              <Legend />
              <Bar dataKey="personnel" name="Personnel" stackId="a" fill="#3b82f6" />
              <Bar dataKey="otherSGA" name="Other SG&A" stackId="a" fill="#10b981" />
              <Bar dataKey="admin" name="Admin" stackId="a" fill="#f59e0b" />
              <Bar dataKey="engineer" name="Engineer" stackId="a" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* YTD Cost Summary */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">YTD Cost Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Personnel Cost</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(costBreakdown.personnel, 'thousand')}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Other SG&A</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(costBreakdown.otherSGA, 'thousand')}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Admin Cost</p>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(costBreakdown.adminCost, 'thousand')}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Engineer Cost</p>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(costBreakdown.engineerCost, 'thousand')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
