'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { exits } from '@/data/exits-data'

const COLORS = {
  small: '#10b981',   // $100M以下
  medium: '#3b82f6',  // $100M-$500M
  large: '#f59e0b',   // $500M-$1B
  mega: '#ef4444',    // $1B+
}

function getAmountCategory(amount: number): keyof typeof COLORS {
  if (amount < 100000000) return 'small'
  if (amount < 500000000) return 'medium'
  if (amount < 1000000000) return 'large'
  return 'mega'
}

export function ExitAmountChart() {
  const data = exits
    .sort((a, b) => b.exitAmountNum - a.exitAmountNum)
    .slice(0, 10)
    .map((e) => ({
      name: e.company,
      amount: e.exitAmountNum / 1000000,
      category: getAmountCategory(e.exitAmountNum),
    }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(v) => `$${v}M`} />
          <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [`$${value as number}M`, 'EXIT金額']} />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.category]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
