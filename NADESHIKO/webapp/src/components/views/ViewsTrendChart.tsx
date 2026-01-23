'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { MonthlyViewSummary } from '@/lib/view-calculations';

interface ViewsTrendChartProps {
  data: MonthlyViewSummary[];
  chartType?: 'line' | 'bar';
}

export default function ViewsTrendChart({
  data,
  chartType = 'line',
}: ViewsTrendChartProps) {
  const chartData = data.map((d) => ({
    month: d.month.slice(2).replace('-', '/'),
    totalViews: d.totalViews,
    avgViews: Math.round(d.avgViews),
    postCount: d.postCount,
  }));

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const formatTooltip = (value: number | string | undefined, name: string | undefined) => {
    if (value === undefined || typeof value === 'string') return ['', name || ''];
    const formatted = new Intl.NumberFormat('ja-JP').format(value);
    const labels: Record<string, string> = {
      totalViews: '総再生数',
      avgViews: '平均再生数',
      postCount: '投稿数',
    };
    return [formatted, labels[name || ''] || name || ''];
  };

  if (chartType === 'bar') {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">月別再生数推移</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
            <Tooltip formatter={formatTooltip} />
            <Legend />
            <Bar
              dataKey="totalViews"
              name="総再生数"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">月別再生数推移</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="left"
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={formatTooltip} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="totalViews"
            name="総再生数"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="postCount"
            name="投稿数"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
