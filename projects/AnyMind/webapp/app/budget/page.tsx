'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { budgetProgress, formatPercent } from '../data/report-data';

export default function BudgetProgressPage() {
  const gpData = budgetProgress.grossProfit.map(item => ({
    name: item.name,
    progress: item.ytd * 100,
    target: 100,
  }));

  const opData = budgetProgress.operatingProfit.map(item => ({
    name: item.name,
    progress: item.ytd * 100,
    target: 100,
  }));

  const getBarColor = (progress: number) => {
    if (progress >= 100) return '#10b981';
    if (progress >= 80) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Japan Overall Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Gross Profit Progress</h3>
              <span className={`text-2xl font-bold ${budgetProgress.grossProfit[0].ytd >= 1 ? 'text-green-600' : 'text-amber-600'}`}>
                {formatPercent(budgetProgress.grossProfit[0].ytd)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${budgetProgress.grossProfit[0].ytd >= 1 ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(budgetProgress.grossProfit[0].ytd * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Gap: {formatPercent(budgetProgress.grossProfit[0].gap)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Operating Profit Progress</h3>
              <span className={`text-2xl font-bold ${budgetProgress.operatingProfit[0].ytd >= 1 ? 'text-green-600' : 'text-amber-600'}`}>
                {formatPercent(budgetProgress.operatingProfit[0].ytd)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${budgetProgress.operatingProfit[0].ytd >= 1 ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(budgetProgress.operatingProfit[0].ytd * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Gap: {formatPercent(budgetProgress.operatingProfit[0].gap)}
            </p>
          </div>
        </div>
      </section>

      {/* Gross Profit Progress by BU */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Gross Profit Budget Progress by BU (%)</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={gpData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 350]} fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={12} width={80} />
              <Tooltip formatter={(value) => [`${(value as number).toFixed(1)}%`, '']} />
              <ReferenceLine x={100} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '100%', position: 'top' }} />
              <Bar
                dataKey="progress"
                name="Progress"
                fill="#3b82f6"
                label={{ position: 'right', fontSize: 10 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Operating Profit Progress by BU */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Operating Profit Budget Progress by BU (%)</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={opData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 800]} fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={12} width={80} />
              <Tooltip formatter={(value) => [`${(value as number).toFixed(1)}%`, '']} />
              <ReferenceLine x={100} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '100%', position: 'top' }} />
              <Bar
                dataKey="progress"
                name="Progress"
                fill="#10b981"
                label={{ position: 'right', fontSize: 10 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Progress Heatmap Table */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Progress Heatmap</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Unit</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GP Progress</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GP Gap</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">OP Progress</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">OP Gap</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetProgress.grossProfit.map((gp, idx) => {
                const op = budgetProgress.operatingProfit[idx];
                const gpColor = gp.ytd >= 1 ? 'bg-green-100 text-green-800' : gp.ytd >= 0.8 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800';
                const opColor = op.ytd >= 1 ? 'bg-green-100 text-green-800' : op.ytd >= 0.8 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800';

                return (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gp.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${gpColor}`}>
                        {formatPercent(gp.ytd)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${gp.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {gp.gap > 0 ? '-' : '+'}{formatPercent(Math.abs(gp.gap))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${opColor}`}>
                        {formatPercent(op.ytd)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${op.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {op.gap > 0 ? '-' : '+'}{formatPercent(Math.abs(op.gap))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
