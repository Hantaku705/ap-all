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
} from 'recharts';
import { DailyViewSummary, DailyViewData } from '@/lib/view-calculations';

// カラーパレット（最大10色）
const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1',
];

interface DailyTrendChartSingleProps {
  mode: 'single';
  data: DailyViewSummary[];
  accountName: string;
}

interface DailyTrendChartMultiProps {
  mode: 'multi';
  data: DailyViewData[];
  accountNames: string[];
}

type DailyTrendChartProps = DailyTrendChartSingleProps | DailyTrendChartMultiProps;

export default function DailyTrendChart(props: DailyTrendChartProps) {
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const formatXAxis = (date: string) => {
    // "2026-01-15" -> "1/15"
    const parts = date.split('-');
    if (parts.length >= 3) {
      return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
    }
    return date;
  };

  const formatTooltip = (value: number | string | undefined, name: string | undefined) => {
    if (value === undefined || typeof value === 'string') return ['', name || ''];
    return [value.toLocaleString(), name || ''];
  };

  if (props.mode === 'single') {
    const chartData = props.data.map(d => ({
      date: d.date,
      再生数: d.totalViews,
      いいね: d.totalLikes,
      投稿数: d.postCount,
    }));

    return (
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">
          {props.accountName} - 日別再生数
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={(date) => String(date)}
              formatter={formatTooltip}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="再生数" stroke="#3B82F6" strokeWidth={2} dot={{ r: 2 }} />
            <Line yAxisId="left" type="monotone" dataKey="いいね" stroke="#10B981" strokeWidth={1.5} dot={{ r: 2 }} />
            <Line yAxisId="right" type="monotone" dataKey="投稿数" stroke="#6B7280" strokeWidth={1} dot={{ r: 2 }} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Multi-account mode
  const chartData = props.data.map(d => {
    const row: Record<string, number | string> = { date: d.date };
    for (const name of props.accountNames) {
      row[name] = (d[name] as number) || 0;
    }
    return row;
  });

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">
        アカウント比較 - 日別再生数
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
          <Tooltip
            labelFormatter={(date) => String(date)}
            formatter={formatTooltip}
          />
          <Legend />
          {props.accountNames.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
