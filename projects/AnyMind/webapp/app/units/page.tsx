'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { businessUnits, formatCurrency, formatPercent } from '../data/report-data';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6'];

export default function BusinessUnitsPage() {
  const budgetVsActual = businessUnits.map(bu => ({
    name: bu.name.length > 12 ? bu.name.substring(0, 12) + '...' : bu.name,
    fullName: bu.name,
    budget: bu.budget / 1000000,
    actual: bu.actual / 1000000,
  }));

  const pieData = businessUnits.map((bu, i) => ({
    name: bu.name,
    value: bu.actual,
    color: COLORS[i % COLORS.length],
  }));

  const acmData = businessUnits.map(bu => ({
    name: bu.name.length > 10 ? bu.name.substring(0, 10) + '...' : bu.name,
    fullName: bu.name,
    acmRate: bu.acmRate,
    yoy: bu.yoy,
  }));

  return (
    <div className="space-y-8">
      {/* Budget vs Actual */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Budget vs Actual (Gross Profit, 百万円)</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={budgetVsActual} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={11} width={100} />
              <Tooltip
                formatter={(value) => [`¥${(value as number).toFixed(0)}M`, '']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
              />
              <Legend />
              <Bar dataKey="budget" name="Budget" fill="#94a3b8" />
              <Bar dataKey="actual" name="Actual" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Gross Profit Composition */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Gross Profit Composition</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${(name || '').substring(0, 8)}${(name || '').length > 8 ? '...' : ''} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(value as number, 'million'), 'Gross Profit']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ACM Rate & YoY */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">ACM Rate & YoY Growth</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={acmData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={80} />
              <YAxis fontSize={12} />
              <Tooltip
                formatter={(value) => [`${(value as number).toFixed(2)}x`, '']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
              />
              <Legend />
              <Bar dataKey="acmRate" name="ACM Rate" fill="#3b82f6" />
              <Bar dataKey="yoy" name="YoY" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Data Table */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Business Unit Details</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Unit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ACM Rate</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">YoY</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {businessUnits.map((bu, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bu.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(bu.budget, 'million')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">{formatCurrency(bu.actual, 'million')}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${bu.acmRate >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {bu.acmRate.toFixed(2)}x
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${bu.yoy >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(bu.yoy)}
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
