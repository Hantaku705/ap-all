'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { PlatformViewSummary } from '@/lib/view-calculations';
import { formatNumber } from '@/lib/formatters';

interface PlatformPieChartProps {
  data: PlatformViewSummary[];
}

const COLORS: Record<string, string> = {
  TikTok: '#000000',
  IG: '#E4405F',
  YT: '#FF0000',
  X: '#1DA1F2',
};

const DEFAULT_COLOR = '#6B7280';

export default function PlatformPieChart({ data }: PlatformPieChartProps) {
  const chartData = data.map((d) => ({
    name: d.platform,
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
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">プラットフォーム別</h3>
      <div className="flex flex-col md:flex-row items-center">
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
                  fill={COLORS[entry.name] || DEFAULT_COLOR}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* 詳細テーブル */}
        <div className="mt-4 md:mt-0 md:ml-4 w-full md:w-auto">
          <table className="text-sm">
            <tbody>
              {data.map((platform) => (
                <tr key={platform.platform} className="border-b">
                  <td className="py-1 pr-4">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: COLORS[platform.platform] || DEFAULT_COLOR,
                      }}
                    />
                    {platform.platform}
                  </td>
                  <td className="py-1 text-right font-semibold">
                    {formatNumber(platform.totalViews)}
                  </td>
                  <td className="py-1 pl-2 text-gray-500">
                    ({platform.postCount})
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
