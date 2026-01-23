'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { AccountViewSummary } from '@/lib/view-calculations';
import { formatNumber } from '@/lib/formatters';

interface AccountPieChartProps {
  data: AccountViewSummary[];
}

// アカウント用のカラーパレット
const COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
  '#6366F1', // indigo
  '#6B7280', // gray (その他用)
];

export default function AccountPieChart({ data }: AccountPieChartProps) {
  const chartData = data.map((d) => ({
    name: d.accountName,
    value: d.totalViews,
    postCount: d.postCount,
    percentage: d.percentage,
  }));

  const renderCustomLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
    name?: string;
  }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) return null;
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">アカウント別</h3>
      <div className="flex flex-col">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatNumber(value as number)}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* 詳細テーブル */}
        <div className="mt-2 max-h-48 overflow-y-auto">
          <table className="text-sm w-full">
            <tbody>
              {data.map((account, index) => (
                <tr key={account.accountName} className="border-b">
                  <td className="py-1 pr-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                    <span className="truncate">{account.accountName}</span>
                  </td>
                  <td className="py-1 text-right font-semibold whitespace-nowrap">
                    {formatNumber(account.totalViews)}
                  </td>
                  <td className="py-1 pl-2 text-gray-500 whitespace-nowrap">
                    ({account.postCount})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
