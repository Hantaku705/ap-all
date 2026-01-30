'use client'

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell, ReferenceLine, Label } from 'recharts'
import { exits, japanStatusLabels, entryDifficultyLabels, type JapanStatus, type EntryDifficulty } from '@/data/exits-data'

const difficultyToX: Record<EntryDifficulty, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

const japanStatusToY: Record<JapanStatus, number> = {
  competitive: 1,
  small: 2,
  none: 3,
}

const COLORS: Record<JapanStatus, string> = {
  none: '#10b981',
  small: '#f59e0b',
  competitive: '#ef4444',
}

interface DataPoint {
  x: number
  y: number
  z: number
  company: string
  japanStatus: JapanStatus
  entryDifficulty: EntryDifficulty
}

export function OpportunityMatrix() {
  const data: DataPoint[] = exits.map((e) => ({
    x: difficultyToX[e.entryDifficulty],
    y: japanStatusToY[e.japanStatus],
    z: e.exitAmountNum / 100000000,
    company: e.company,
    japanStatus: e.japanStatus,
    entryDifficulty: e.entryDifficulty,
  }))

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0.5, 3.5]}
            ticks={[1, 2, 3]}
            tickFormatter={(v) => ['', '低', '中', '高'][v]}
          >
            <Label value="参入難易度" offset={-10} position="insideBottom" />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            domain={[0.5, 3.5]}
            ticks={[1, 2, 3]}
            tickFormatter={(v) => ['', '競合多数', 'あるが小さい', '類似なし'][v]}
          >
            <Label value="日本市場機会" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
          </YAxis>
          <ZAxis type="number" dataKey="z" range={[100, 400]} />
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null
              const d = payload[0].payload as DataPoint
              return (
                <div className="rounded bg-white p-2 shadow-lg border">
                  <p className="font-bold">{d.company}</p>
                  <p className="text-sm">難易度: {entryDifficultyLabels[d.entryDifficulty]}</p>
                  <p className="text-sm">日本類似: {japanStatusLabels[d.japanStatus]}</p>
                </div>
              )
            }}
          />
          <ReferenceLine x={2} stroke="#ccc" strokeDasharray="3 3" />
          <ReferenceLine y={2} stroke="#ccc" strokeDasharray="3 3" />
          <Scatter name="EXIT Cases" data={data}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.japanStatus]} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2 text-sm">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          類似なし（高機会）
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          あるが小さい
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          競合多数
        </span>
      </div>
    </div>
  )
}
