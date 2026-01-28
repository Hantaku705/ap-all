'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DailyTotal } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'

type Props = {
  data: DailyTotal[]
}

export function UsageChart({ data }: Props) {
  const chartData = data.map(d => ({
    date: format(parseISO(d.date), 'M/d'),
    hours: Math.round(d.total_minutes / 60 * 10) / 10,
    sessions: d.total_sessions,
    users: d.active_users
  }))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">日別使用時間推移</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'hours') return [`${value}時間`, '使用時間']
              if (name === 'users') return [`${value}人`, 'アクティブユーザー']
              return [String(value), String(name)]
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="hours"
            stroke="#3B82F6"
            strokeWidth={2}
            name="使用時間(h)"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="users"
            stroke="#10B981"
            strokeWidth={2}
            name="アクティブユーザー"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
