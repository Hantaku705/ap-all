'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  buBottlenecks, overallBottlenecks, bottleneckTypeLabels, actionItems, formatCurrency,
  BUBottleneck
} from '../data/report-data';

const STATUS_COLORS = {
  ok: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', fill: '#10b981' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', fill: '#f59e0b' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', fill: '#ef4444' },
};

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-500', text: 'text-white' },
  high: { bg: 'bg-orange-500', text: 'text-white' },
  medium: { bg: 'bg-yellow-500', text: 'text-gray-900' },
  low: { bg: 'bg-green-500', text: 'text-white' },
};

const BOTTLENECK_COLORS = {
  profitability: '#ef4444',
  achievement: '#f59e0b',
  growth: '#3b82f6',
  efficiency: '#10b981',
};

// BU詳細モーダルコンポーネント
function BUDetailModal({ bu, onClose }: { bu: BUBottleneck; onClose: () => void }) {
  const severity = SEVERITY_COLORS[bu.severity];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b ${bu.severity === 'critical' ? 'bg-red-50' : bu.severity === 'high' ? 'bg-orange-50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{bu.bu}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${severity.bg} ${severity.text}`}>
                {bu.severity.toUpperCase()}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-gray-600">{bu.insights.summary}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 4軸スコア */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              📊 4軸スコア
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: '収益性', data: bu.profitability },
                { label: '成長性', data: bu.growth },
                { label: '効率性', data: bu.efficiency },
                { label: '達成度', data: bu.achievement },
              ].map(({ label, data }) => (
                <div
                  key={label}
                  className={`p-3 rounded-lg text-center ${STATUS_COLORS[data.status].bg} ${STATUS_COLORS[data.status].border} border`}
                >
                  <p className="text-xs text-gray-600 mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${STATUS_COLORS[data.status].text}`}>
                    {data.score}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate" title={data.detail}>
                    {data.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 主要指標 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              📊 主要指標（Fact）
            </h3>
            <ul className="space-y-2">
              {bu.insights.keyMetrics.map((metric, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="text-gray-700">{metric}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* トレンド */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              📈 トレンド
            </h3>
            <p className="text-gray-700 leading-relaxed">{bu.insights.trend}</p>
          </section>

          {/* リスク評価 */}
          <section className={`rounded-lg p-4 ${
            bu.insights.riskLevel.includes('危機') ? 'bg-red-50 border border-red-200' :
            bu.insights.riskLevel.includes('高') ? 'bg-orange-50 border border-orange-200' :
            bu.insights.riskLevel.includes('中') ? 'bg-yellow-50 border border-yellow-200' :
            'bg-green-50 border border-green-200'
          }`}>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${
              bu.insights.riskLevel.includes('危機') ? 'text-red-700' :
              bu.insights.riskLevel.includes('高') ? 'text-orange-700' :
              bu.insights.riskLevel.includes('中') ? 'text-yellow-700' :
              'text-green-700'
            }`}>
              ⚠️ リスク評価
            </h3>
            <p className={`font-medium ${
              bu.insights.riskLevel.includes('危機') ? 'text-red-800' :
              bu.insights.riskLevel.includes('高') ? 'text-orange-800' :
              bu.insights.riskLevel.includes('中') ? 'text-yellow-800' :
              'text-green-800'
            }`}>{bu.insights.riskLevel}</p>
          </section>

          {/* OP金額 */}
          <div className="pt-4 border-t flex justify-between items-center">
            <span className="text-gray-500">営業利益（OP）</span>
            <span className={`text-2xl font-bold ${bu.opAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(bu.opAmount * 1000, 'million')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// BUカードコンポーネント
function BUCard({ bu, onClick }: { bu: BUBottleneck; onClick: () => void }) {
  const severity = SEVERITY_COLORS[bu.severity];
  const radarData = [
    { axis: '収益性', value: bu.profitability.score },
    { axis: '成長性', value: bu.growth.score },
    { axis: '効率性', value: bu.efficiency.score },
    { axis: '達成度', value: bu.achievement.score },
  ];

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all ${bu.severity === 'critical' ? 'ring-2 ring-red-300' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-gray-900">{bu.bu}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${severity.bg} ${severity.text}`}>
          {bu.severity.toUpperCase()}
        </span>
      </div>

      {/* Radar Chart */}
      <div className="h-32 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name={bu.bu}
              dataKey="value"
              stroke={bu.severity === 'critical' ? '#ef4444' : bu.severity === 'high' ? '#f59e0b' : '#10b981'}
              fill={bu.severity === 'critical' ? '#ef4444' : bu.severity === 'high' ? '#f59e0b' : '#10b981'}
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Primary Bottleneck */}
      {bu.primaryBottleneck ? (
        <div className={`mt-2 p-2 rounded ${STATUS_COLORS.critical.bg} ${STATUS_COLORS.critical.border} border`}>
          <p className="text-xs font-semibold text-red-700">
            🔴 {bottleneckTypeLabels[bu.primaryBottleneck]}が課題
          </p>
          <p className="text-xs text-red-600 mt-1">
            {bu[bu.primaryBottleneck].detail}
          </p>
        </div>
      ) : (
        <div className="mt-2 p-2 rounded bg-green-50 border border-green-200">
          <p className="text-xs font-semibold text-green-700">✅ 優等生</p>
          <p className="text-xs text-green-600 mt-1">全指標が良好</p>
        </div>
      )}

      {/* Insight Summary */}
      <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
        <p className="text-xs text-gray-600 line-clamp-2">
          💡 {bu.insights.summary}
        </p>
      </div>

      {/* OP Amount & CTA */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-blue-600 hover:underline">▼ 詳細を見る</span>
        <span className={`text-sm font-bold ${bu.opAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          OP: {formatCurrency(bu.opAmount * 1000, 'million')}
        </span>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [selectedBU, setSelectedBU] = useState<BUBottleneck | null>(null);

  // 課題タイプ別の円グラフデータ
  const pieData = Object.entries(overallBottlenecks.byType)
    .filter(([_, data]) => data.count > 0)
    .map(([key, data]) => ({
      name: data.label,
      value: data.count,
      color: BOTTLENECK_COLORS[key as keyof typeof BOTTLENECK_COLORS],
    }));

  // 影響額の棒グラフデータ
  const impactData = Object.entries(overallBottlenecks.byType)
    .filter(([_, data]) => data.impact !== null)
    .map(([key, data]) => ({
      name: data.label,
      impact: Math.abs(data.impact || 0) / 1000, // 百万円
      color: BOTTLENECK_COLORS[key as keyof typeof BOTTLENECK_COLORS],
    }));

  // BUをseverityでソート（critical → high → medium → low）
  const sortedBUs = [...buBottlenecks].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="space-y-8">
      {/* Modal */}
      {selectedBU && (
        <BUDetailModal bu={selectedBU} onClose={() => setSelectedBU(null)} />
      )}

      {/* Part 1: 事業部別ボトルネック診断 */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Part 1: 事業部別ボトルネック診断</h2>
        <p className="text-sm text-gray-600 mb-4">
          各事業部を4軸（収益性・成長性・効率性・達成度）で評価し、最大のボトルネックを特定。<strong>カードをクリック</strong>で詳細を表示
        </p>

        {/* BU Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedBUs.map((bu) => (
            <BUCard key={bu.bu} bu={bu} onClick={() => setSelectedBU(bu)} />
          ))}
        </div>

        {/* 詳細テーブル */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">BU</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">収益性</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">成長性</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">効率性</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">達成度</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">ボトルネック</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">OP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedBUs.map((bu) => (
                <tr
                  key={bu.bu}
                  className={`cursor-pointer hover:bg-blue-50 transition-colors ${bu.severity === 'critical' ? 'bg-red-50' : bu.severity === 'high' ? 'bg-orange-50' : ''}`}
                  onClick={() => setSelectedBU(bu)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{bu.bu}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${STATUS_COLORS[bu.profitability.status].bg} ${STATUS_COLORS[bu.profitability.status].text}`}>
                      {bu.profitability.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${STATUS_COLORS[bu.growth.status].bg} ${STATUS_COLORS[bu.growth.status].text}`}>
                      {bu.growth.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${STATUS_COLORS[bu.efficiency.status].bg} ${STATUS_COLORS[bu.efficiency.status].text}`}>
                      {bu.efficiency.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${STATUS_COLORS[bu.achievement.status].bg} ${STATUS_COLORS[bu.achievement.status].text}`}>
                      {bu.achievement.score}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {bu.primaryBottleneck ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                        {bottleneckTypeLabels[bu.primaryBottleneck]}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        なし
                      </span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${bu.opAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(bu.opAmount * 1000, 'million')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Part 2: 全体ボトルネック集計 */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Part 2: 全体ボトルネック集計</h2>
        <p className="text-sm text-gray-600 mb-4">
          BU別ボトルネックをBottom-upで集計し、全社として最も多い課題タイプを特定
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 課題タイプ別件数（円グラフ） */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">課題タイプ別BU件数</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}件`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(overallBottlenecks.byType).map(([key, data]) => (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: BOTTLENECK_COLORS[key as keyof typeof BOTTLENECK_COLORS] }}
                  />
                  <span className="text-gray-600">{data.label}: {data.count}件</span>
                </div>
              ))}
            </div>
          </div>

          {/* 影響額（棒グラフ） */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">課題タイプ別影響額（百万円）</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={impactData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" fontSize={12} width={60} />
                <Tooltip formatter={(value) => [`¥${value}M`, '影響額']} />
                <Bar dataKey="impact" name="影響額">
                  {impactData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 結論カード */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Bottleneck */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔴</span>
              <h3 className="text-lg font-bold text-red-700">最大のボトルネック</h3>
            </div>
            <p className="text-xl font-bold text-red-800 mb-2">
              {overallBottlenecks.byType[overallBottlenecks.primary as keyof typeof overallBottlenecks.byType].label}
            </p>
            <p className="text-sm text-red-600">
              {overallBottlenecks.byType[overallBottlenecks.primary as keyof typeof overallBottlenecks.byType].description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {overallBottlenecks.byType[overallBottlenecks.primary as keyof typeof overallBottlenecks.byType].bus.map((bu) => (
                <span key={bu} className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium">
                  {bu}
                </span>
              ))}
            </div>
            <p className="mt-3 text-lg font-bold text-red-800">
              影響額: {formatCurrency(Math.abs(overallBottlenecks.byType[overallBottlenecks.primary as keyof typeof overallBottlenecks.byType].impact || 0) * 1000, 'million')}
            </p>
          </div>

          {/* Secondary Bottleneck */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🟠</span>
              <h3 className="text-lg font-bold text-orange-700">次点のボトルネック</h3>
            </div>
            <p className="text-xl font-bold text-orange-800 mb-2">
              {overallBottlenecks.byType[overallBottlenecks.secondary as keyof typeof overallBottlenecks.byType].label}
            </p>
            <p className="text-sm text-orange-600">
              {overallBottlenecks.byType[overallBottlenecks.secondary as keyof typeof overallBottlenecks.byType].description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {overallBottlenecks.byType[overallBottlenecks.secondary as keyof typeof overallBottlenecks.byType].bus.map((bu) => (
                <span key={bu} className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs font-medium">
                  {bu}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 結論テキスト */}
        <div className="mt-6 bg-gray-900 text-white rounded-xl p-6">
          <h3 className="text-lg font-bold mb-2">📊 診断結論</h3>
          <p className="text-gray-300">{overallBottlenecks.conclusion}</p>
        </div>
      </section>

      {/* Part 3: 改善アクション */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Part 3: 改善アクション</h2>
        <p className="text-sm text-gray-600 mb-4">
          ボトルネック解消に向けた優先度付きアクションプラン
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Impact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {actionItems.map((item) => {
                const levelColors = {
                  critical: 'bg-red-50',
                  high: 'bg-orange-50',
                  medium: 'bg-yellow-50',
                };
                const iconColors = {
                  critical: '🔴',
                  high: '🟠',
                  medium: '🟡',
                };
                return (
                  <tr key={item.priority} className={levelColors[item.level as keyof typeof levelColors] || ''}>
                    <td className="px-4 py-3 whitespace-nowrap font-bold">
                      {iconColors[item.level as keyof typeof iconColors]} #{item.priority}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.action}</td>
                    <td className="px-4 py-3 text-gray-600">{item.target}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.currentState}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">{item.expectedImpact}</td>
                    <td className="px-4 py-3 text-gray-600">{item.timeline}</td>
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
