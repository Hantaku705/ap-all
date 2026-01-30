'use client';

import Tabs from '../components/Tabs';
import {
  annualSummary,
  quarterlyPerformance,
  opBreakdown,
  monthlyPerHead,
  perHeadByUnit,
  negativeFactorAnalysis,
  monthlyGpAchievement,
  gpAchievementSummary,
  businessUnitsExtended,
} from '../data/report-data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  ReferenceLine,
} from 'recharts';

// Format helpers
const formatYoY = (value: number | null) => {
  if (value === null) return 'NA';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(1)}%`;
};

const formatNumber = (value: number) => value.toLocaleString();

// Section 1: Annual Performance (slide-04)
function AnnualPerformanceSection() {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <p className="text-sm text-blue-600">2025 Annual Performance</p>
        <h2 className="text-lg font-semibold text-gray-800">累計業績振り返りサマリー (Jan - Dec)</h2>
      </div>
      <div className="p-6">
        {/* Annual KPIs */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-600 mb-4 bg-gray-800 text-white px-4 py-2 rounded inline-block">
            2025年 累計 (Jan - Dec)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-600 text-center bg-yellow-100 py-1 rounded mb-2">売上収益</div>
              <div className="text-3xl font-bold text-center">247<span className="text-lg">億円</span></div>
              <div className="text-center text-red-500 font-medium mt-2">YoY +19%</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-600 text-center bg-yellow-100 py-1 rounded mb-2">売上総利益</div>
              <div className="text-3xl font-bold text-center">112<span className="text-lg">億円</span> <span className="text-sm text-gray-500">粗利率 (45.4%)</span></div>
              <div className="text-center text-red-500 font-medium mt-2">YoY +24%</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-600 text-center bg-yellow-100 py-1 rounded mb-2">営業利益</div>
              <div className="text-3xl font-bold text-center">15.8<span className="text-lg">億円</span> <span className="text-sm text-gray-500">営業利益率 (6.4%)</span></div>
              <div className="text-center text-red-500 font-medium mt-2">YoY +6%</div>
            </div>
          </div>
        </div>

        {/* Quarterly YoY */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-4 bg-gray-800 text-white px-4 py-2 rounded inline-block">
            2025年 四半期別
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {quarterlyPerformance.map((q) => (
              <div key={q.quarter} className="border rounded-lg p-4">
                <div className="text-xl font-bold text-center mb-3 border-b pb-2">{q.quarter}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Revenue</span>
                    <span className={`font-medium ${q.revenueYoY >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      YoY {formatYoY(q.revenueYoY)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Profit</span>
                    <span className={`font-medium ${q.gpYoY >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      YoY {formatYoY(q.gpYoY)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating Profit</span>
                    <span className={`font-medium ${q.opYoY >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      YoY {q.opYoY < 0 ? '△' : ''}{Math.abs(q.opYoY * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Section 2: OP Breakdown (slide-05)
function OpBreakdownSection() {
  const chartData = opBreakdown.items.map(item => ({
    name: item.name,
    y2024: item.y2024,
    y2025: item.y2025,
    yoy: item.yoy,
  }));

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <p className="text-sm text-blue-600">2025 Annual Performance</p>
        <h2 className="text-lg font-semibold text-gray-800">営業利益内訳サマリー (Jan - Dec)</h2>
      </div>
      <div className="p-6">
        <div className="bg-gray-100 text-center py-2 mb-4 text-sm font-medium">売上高〜営業利益の状況</div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-center font-medium mb-2">2024 (Jan - Dec) 実績</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 25000]} tickFormatter={(v) => formatNumber(v)} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value) => [`${formatNumber(value as number)}`, '']} />
                <Bar dataKey="y2024" fill="#3B82F6" name="2024" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-center font-medium mb-2 text-red-500">2025 (Jan - Dec) 実績</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 25000]} tickFormatter={(v) => formatNumber(v)} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value) => [`${formatNumber(value as number)}`, '']} />
                <Bar dataKey="y2025" fill="#3B82F6" name="2025" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* YoY Table */}
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">項目</th>
                <th className="p-2 text-right">2024</th>
                <th className="p-2 text-right">2025</th>
                <th className="p-2 text-right">前年同期増減率</th>
              </tr>
            </thead>
            <tbody>
              {opBreakdown.items.map((item) => (
                <tr key={item.name} className="border-b">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2 text-right">{formatNumber(item.y2024)}</td>
                  <td className="p-2 text-right">{formatNumber(item.y2025)}</td>
                  <td className={`p-2 text-right font-medium ${item.yoy >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                    {formatYoY(item.yoy)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// Section 3: GP Per Head (slide-06)
function GpPerHeadSection() {
  const chartData = monthlyPerHead.gp;
  const summary = monthlyPerHead.summary.gp;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <p className="text-sm text-blue-600">2025 Annual Performance</p>
        <h2 className="text-lg font-semibold text-gray-800">一人当たり粗利サマリー (Jan - Dec)</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Chart */}
          <div className="col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 3000]} />
                <Tooltip formatter={(value) => [`${formatNumber(value as number)}千円`, '']} />
                <Legend />
                <Line type="monotone" dataKey="y2024" stroke="#3B82F6" strokeWidth={2} name="2024" dot={{ fill: '#3B82F6' }} />
                <Line type="monotone" dataKey="y2025" stroke="#EF4444" strokeWidth={2} name="2025" dot={{ fill: '#EF4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Cards */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-red-300 rounded-lg p-4">
              <h4 className="text-sm font-medium text-center mb-3">一人当たり粗利</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>2024 累計 実績</span>
                  <span className="font-bold">{formatNumber(summary.y2024)} 千円</span>
                </div>
                <div className="flex justify-between">
                  <span>2025 累計 実績</span>
                  <span className="font-bold">{formatNumber(summary.y2025)} 千円</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>YoY %</span>
                  <span className="font-bold text-red-500">{formatYoY(summary.yoy)}</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-center mb-3 bg-gray-800 text-white py-1 rounded">一人当たり粗利目標との差額</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>2025 累計 実績</span>
                  <span className="font-bold">{formatNumber(summary.y2025)} 千円</span>
                </div>
                <div className="flex justify-between">
                  <span>2025 累計 目標</span>
                  <span className="font-bold">{formatNumber(summary.target)} 千円</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>目標値</span>
                  <span className="font-bold text-blue-500">{(summary.achievement * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section 4: OP Per Head (slide-07)
function OpPerHeadSection() {
  const chartData = monthlyPerHead.op;
  const summary = monthlyPerHead.summary.op;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <p className="text-sm text-blue-600">2025 Annual Performance</p>
        <h2 className="text-lg font-semibold text-gray-800">一人当たり営業利益サマリー (Jan - Dec)</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Chart */}
          <div className="col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[-250, 1000]} />
                <Tooltip formatter={(value) => [`${formatNumber(value as number)}千円`, '']} />
                <Legend />
                <ReferenceLine y={0} stroke="#666" />
                <Line type="monotone" dataKey="y2024" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" name="2024" dot={{ fill: '#3B82F6' }} />
                <Line type="monotone" dataKey="y2025" stroke="#EF4444" strokeWidth={2} name="2025" dot={{ fill: '#EF4444' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Cards */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-red-300 rounded-lg p-4">
              <h4 className="text-sm font-medium text-center mb-3">一人当たり営業利益</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>2024 累計 実績</span>
                  <span className="font-bold">{formatNumber(summary.y2024)} 千円</span>
                </div>
                <div className="flex justify-between">
                  <span>2025 累計 実績</span>
                  <span className="font-bold">{formatNumber(summary.y2025)} 千円</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>YoY %</span>
                  <span className="font-bold text-blue-500">△{Math.abs(summary.yoy * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-center mb-3 bg-gray-800 text-white py-1 rounded">一人当たり粗利目標との差額</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>2025 累計 実績</span>
                  <span className="font-bold">{formatNumber(summary.y2025)} 千円</span>
                </div>
                <div className="flex justify-between">
                  <span>2025 累計 目標</span>
                  <span className="font-bold">{formatNumber(summary.target)} 千円</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>目標値</span>
                  <span className="font-bold text-blue-500">{(summary.achievement * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section 5: Per Head by Unit (slide-08)
function PerHeadByUnitSection() {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <p className="text-sm text-blue-600">2025 Annual Performance</p>
        <h2 className="text-lg font-semibold text-gray-800">各部署の一人当たり粗利・営業利益サマリー (Jan - Dec)</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-8">
          {/* GP Per Head Table */}
          <div>
            <h4 className="text-center font-medium mb-3 border-b-2 border-blue-500 pb-2">一人当たり粗利 (Jan - Dec)</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">(千円)</th>
                  <th className="p-2 text-right">24年</th>
                  <th className="p-2 text-right">25年</th>
                  <th className="p-2 text-right">成長率</th>
                </tr>
              </thead>
              <tbody>
                {perHeadByUnit.map((unit) => (
                  <tr key={unit.name} className={`border-b ${unit.name === 'ALL' ? 'bg-gray-800 text-white font-bold' : ''}`}>
                    <td className="p-2">{unit.name}</td>
                    <td className="p-2 text-right">{unit.gpPerHead24 !== null ? formatNumber(unit.gpPerHead24) : 'NA'}</td>
                    <td className="p-2 text-right">{formatNumber(unit.gpPerHead25)}</td>
                    <td className={`p-2 text-right font-medium ${
                      unit.gpGrowth === null ? '' :
                      unit.gpGrowth >= 0 ? 'text-red-500' : 'text-blue-500'
                    }`}>
                      {unit.gpGrowth !== null ? (unit.gpGrowth < 0 ? '△' : '+') + Math.abs(unit.gpGrowth * 100).toFixed(1) + '%' : 'NA'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* OP Per Head Table */}
          <div>
            <h4 className="text-center font-medium mb-3 border-b-2 border-blue-500 pb-2">一人当たり営業利益 (Jan - Dec)</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">(千円)</th>
                  <th className="p-2 text-right">24年</th>
                  <th className="p-2 text-right">25年</th>
                  <th className="p-2 text-right">成長率</th>
                </tr>
              </thead>
              <tbody>
                {perHeadByUnit.map((unit) => (
                  <tr key={unit.name} className={`border-b ${unit.name === 'ALL' ? 'bg-gray-800 text-white font-bold' : ''}`}>
                    <td className="p-2">{unit.name}</td>
                    <td className="p-2 text-right">
                      {unit.opPerHead24 !== null ? (
                        unit.opPerHead24 < 0 ? `△${formatNumber(Math.abs(unit.opPerHead24))}` : formatNumber(unit.opPerHead24)
                      ) : 'NA'}
                    </td>
                    <td className={`p-2 text-right ${unit.opPerHead25 < 0 ? 'text-red-500' : ''}`}>
                      {unit.opPerHead25 < 0 ? `△${formatNumber(Math.abs(unit.opPerHead25))}` : formatNumber(unit.opPerHead25)}
                    </td>
                    <td className={`p-2 text-right font-medium ${
                      unit.opGrowth === null ? '' :
                      unit.opGrowth >= 0 ? 'text-red-500' : 'text-blue-500'
                    }`}>
                      {unit.opGrowth !== null ? (unit.opGrowth < 0 ? '△' : '+') + Math.abs(unit.opGrowth * 100).toFixed(1) + '%' : 'NA'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section 6: Negative Factor Analysis (slide-09)
function NegativeFactorSection() {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <p className="text-sm text-blue-600">2025 Annual Performance</p>
        <h2 className="text-lg font-semibold text-gray-800">各部署の一人当たり粗利・営業利益の成長率マイナス要因分析</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* GP Table */}
          <div>
            <h4 className="text-center font-medium mb-3 border-b-2 border-blue-500 pb-2">一人当たり粗利 (Jan - Dec)</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">(千円)</th>
                  <th className="p-2 text-right">24年</th>
                  <th className="p-2 text-right">25年</th>
                  <th className="p-2 text-right">成長率</th>
                </tr>
              </thead>
              <tbody>
                {negativeFactorAnalysis.filter(u => u.gpGrowth !== null && u.gpGrowth < 0).map((unit) => (
                  <tr key={unit.unit} className="border-b">
                    <td className="p-2 font-medium">{unit.unit}</td>
                    <td className="p-2 text-right">{unit.gpPerHead24 !== null ? formatNumber(unit.gpPerHead24) : 'NA'}</td>
                    <td className="p-2 text-right">{unit.gpPerHead25 !== null ? formatNumber(unit.gpPerHead25) : 'NA'}</td>
                    <td className="p-2 text-right font-medium text-blue-500">
                      △{Math.abs(unit.gpGrowth! * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* OP Table */}
          <div>
            <h4 className="text-center font-medium mb-3 border-b-2 border-blue-500 pb-2">一人当たり営業利益 (Jan - Dec)</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">(千円)</th>
                  <th className="p-2 text-right">24年</th>
                  <th className="p-2 text-right">25年</th>
                  <th className="p-2 text-right">成長率</th>
                </tr>
              </thead>
              <tbody>
                {negativeFactorAnalysis.filter(u => u.opGrowth !== null && u.opGrowth < 0).map((unit) => (
                  <tr key={unit.unit} className="border-b">
                    <td className="p-2 font-medium">{unit.unit}</td>
                    <td className="p-2 text-right">
                      {unit.opPerHead24 !== null ? (
                        unit.opPerHead24 < 0 ? `△${formatNumber(Math.abs(unit.opPerHead24))}` : formatNumber(unit.opPerHead24)
                      ) : 'NA'}
                    </td>
                    <td className={`p-2 text-right ${unit.opPerHead25 < 0 ? 'text-red-500' : ''}`}>
                      {unit.opPerHead25 < 0 ? `△${formatNumber(Math.abs(unit.opPerHead25))}` : formatNumber(unit.opPerHead25)}
                    </td>
                    <td className="p-2 text-right font-medium text-blue-500">
                      △{Math.abs(unit.opGrowth! * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section 7: GP Achievement (slide-10)
function GpAchievementSection() {
  const chartData = monthlyGpAchievement.map(item => ({
    ...item,
    actualK: item.actual / 1000,
    targetK: item.target / 1000,
    ratePercent: item.rate * 100,
  }));

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <p className="text-sm text-blue-600">2025 Annual Performance</p>
        <h2 className="text-lg font-semibold text-gray-800">粗利達成率サマリー (Jan - Dec)</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-4 gap-6">
          {/* Chart */}
          <div className="col-span-3">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" domain={[0, 1500]} tickFormatter={(v) => `¥${v.toLocaleString()}`} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 125]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === '達成率') return [`${(value as number).toFixed(0)}%`, name];
                    return [`¥${(value as number).toLocaleString()}K`, name];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="actualK" fill="#6B7280" name="Actual" />
                <Line yAxisId="left" type="step" dataKey="targetK" stroke="#3B82F6" strokeWidth={2} name="Target" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="ratePercent" stroke="#EF4444" strokeWidth={2} name="達成率" dot={{ fill: '#EF4444' }} />
                <ReferenceLine yAxisId="right" y={100} stroke="#666" strokeDasharray="3 3" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Cards */}
          <div className="space-y-4">
            <h4 className="font-medium text-center border-b-2 pb-2">2025 累計(Jan - Dec)</h4>

            <div className="bg-gray-700 text-white rounded-lg p-4 text-center">
              <div className="text-xs mb-1">目標</div>
              <div className="text-2xl font-bold">¥{gpAchievementSummary.target.toLocaleString()}<span className="text-sm">百万円</span></div>
            </div>

            <div className="bg-gray-700 text-white rounded-lg p-4 text-center">
              <div className="text-xs mb-1">実績</div>
              <div className="text-2xl font-bold">¥{gpAchievementSummary.actual.toLocaleString()}<span className="text-sm">百万円</span></div>
            </div>

            <div className="bg-gradient-to-r from-red-400 to-red-300 text-white rounded-lg p-4 text-center">
              <div className="text-xs mb-1">達成率</div>
              <div className="text-3xl font-bold">{(gpAchievementSummary.rate * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section 8: Unit Performance (slide-11)
function UnitPerformanceSection() {
  // Calculate ALL row
  const allData = {
    name: 'ALL',
    revenue: businessUnitsExtended.reduce((sum, u) => sum + u.revenue, 0),
    gp: businessUnitsExtended.reduce((sum, u) => sum + u.gp, 0),
    gpGrowth: 0.238,
    gpAchieve: 0.96,
    op: businessUnitsExtended.reduce((sum, u) => sum + u.op, 0),
    opGrowth: 0.062,
    opAchieve: 0.75,
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <p className="text-sm text-blue-600">2025 Annual Performance</p>
        <h2 className="text-lg font-semibold text-gray-800">25年 各部署の業績パフォーマンス</h2>
      </div>
      <div className="p-6">
        <div className="bg-gray-100 text-center py-2 mb-4 text-sm font-medium">25年 (実績)</div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">(千円)</th>
              <th className="p-2 text-right">売上高</th>
              <th className="p-2 text-right">粗利</th>
              <th className="p-2 text-right">粗利成長率</th>
              <th className="p-2 text-right">粗利達成率</th>
              <th className="p-2 text-right">営業利益</th>
              <th className="p-2 text-right">営業利益成長率</th>
              <th className="p-2 text-right">営業利益達成率</th>
            </tr>
          </thead>
          <tbody>
            {/* ALL Row */}
            <tr className="bg-gray-800 text-white font-bold">
              <td className="p-2">{allData.name}</td>
              <td className="p-2 text-right">{formatNumber(allData.revenue)}</td>
              <td className="p-2 text-right">{formatNumber(allData.gp)}</td>
              <td className="p-2 text-right text-red-300">+{(allData.gpGrowth * 100).toFixed(1)}%</td>
              <td className="p-2 text-right">{(allData.gpAchieve * 100).toFixed(0)}%</td>
              <td className="p-2 text-right">{formatNumber(allData.op)}</td>
              <td className="p-2 text-right text-red-300">+{(allData.opGrowth * 100).toFixed(1)}%</td>
              <td className="p-2 text-right">{(allData.opAchieve * 100).toFixed(0)}%</td>
            </tr>
            {/* Unit Rows */}
            {businessUnitsExtended.map((unit) => (
              <tr key={unit.name} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{unit.name}</td>
                <td className="p-2 text-right">{formatNumber(unit.revenue)}</td>
                <td className="p-2 text-right">{formatNumber(unit.gp)}</td>
                <td className={`p-2 text-right font-medium ${
                  unit.gpGrowth === null ? '' :
                  unit.gpGrowth >= 0 ? 'text-red-500' : 'text-blue-500'
                }`}>
                  {unit.gpGrowth !== null ? (unit.gpGrowth < 0 ? '△' : '+') + Math.abs(unit.gpGrowth * 100).toFixed(1) + '%' : ''}
                </td>
                <td className="p-2 text-right">{(unit.gpAchieve * 100).toFixed(0)}%</td>
                <td className={`p-2 text-right ${unit.op < 0 ? 'text-red-500' : ''}`}>
                  {unit.op < 0 ? `(${formatNumber(Math.abs(unit.op))})` : formatNumber(unit.op)}
                </td>
                <td className={`p-2 text-right font-medium ${
                  unit.opGrowth === null ? '' :
                  unit.opGrowth >= 0 ? 'text-red-500' : 'text-blue-500'
                }`}>
                  {unit.opGrowth !== null ? (unit.opGrowth < 0 ? '△' : '+') + Math.abs(unit.opGrowth * 100).toFixed(1) + '%' : ''}
                </td>
                <td className={`p-2 text-right ${unit.opAchieve < 0 ? 'text-red-500' : ''}`}>
                  {unit.opAchieve < 0 ? `${(unit.opAchieve * 100).toFixed(0)}%` : `${(unit.opAchieve * 100).toFixed(0)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function SlidesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          AnyMind Japan Monthly Report
        </h1>
        <p className="text-gray-500 mb-6">2025 Annual Performance サマリー</p>

        <Tabs />

        <div className="space-y-8">
          <AnnualPerformanceSection />
          <OpBreakdownSection />
          <GpPerHeadSection />
          <OpPerHeadSection />
          <PerHeadByUnitSection />
          <NegativeFactorSection />
          <GpAchievementSection />
          <UnitPerformanceSection />
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>© 2025 AnyMind Japan. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
