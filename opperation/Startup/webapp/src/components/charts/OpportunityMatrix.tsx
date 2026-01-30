'use client'

import { useRouter } from 'next/navigation'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell, ReferenceLine, Label } from 'recharts'
import { japanStatusLabels, entryDifficultyLabels, statusLabels, type JapanStatus, type EntryDifficulty, type ExitCase } from '@/data/exits-data'

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
  id: string
  x: number
  y: number
  z: number
  company: string
  coreValue: string
  japanStatus: JapanStatus
  entryDifficulty: EntryDifficulty
  status: string
  amount: string
}

interface OpportunityMatrixProps {
  data?: ExitCase[]
}

export function OpportunityMatrix({ data: externalData }: OpportunityMatrixProps) {
  const router = useRouter()

  // デフォルトでは空配列を使用（外部からデータが渡されない場合はexitsをインポート）
  const sourceData = externalData || []

  const data: DataPoint[] = sourceData.map((e) => ({
    id: e.id,
    x: difficultyToX[e.entryDifficulty],
    y: japanStatusToY[e.japanStatus],
    z: Math.max(
      e.status === 'exit'
        ? e.exitAmountNum / 100000000
        : (e.valuation ? parseFloat(e.valuation.replace(/[$B+]/g, '')) * 10 : 1),
      1
    ),
    company: e.company,
    coreValue: e.coreValue,
    japanStatus: e.japanStatus,
    entryDifficulty: e.entryDifficulty,
    status: statusLabels[e.status],
    amount: e.status === 'exit' ? e.exitAmount : e.valuation || '-',
  }))

  const handleClick = (point: DataPoint) => {
    router.push(`/exits/${point.id}`)
  }

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
          <ZAxis type="number" dataKey="z" range={[50, 300]} />
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null
              const d = payload[0].payload as DataPoint
              return (
                <div className="rounded bg-white p-3 shadow-lg border">
                  <p className="font-bold text-blue-600">{d.company}</p>
                  <p className="text-xs text-gray-500 mb-2">{d.coreValue}</p>
                  <p className="text-sm">ステータス: {d.status}</p>
                  <p className="text-sm">金額/評価額: {d.amount}</p>
                  <p className="text-sm">難易度: {entryDifficultyLabels[d.entryDifficulty]}</p>
                  <p className="text-sm">日本類似: {japanStatusLabels[d.japanStatus]}</p>
                  <p className="text-xs text-blue-500 mt-2">クリックで詳細へ</p>
                </div>
              )
            }}
          />
          <ReferenceLine x={2} stroke="#ccc" strokeDasharray="3 3" />
          <ReferenceLine y={2} stroke="#ccc" strokeDasharray="3 3" />
          {/* High opportunity zone highlight */}
          <ReferenceLine x={1.5} stroke="#10b981" strokeWidth={2} strokeOpacity={0.3} />
          <ReferenceLine y={2.5} stroke="#10b981" strokeWidth={2} strokeOpacity={0.3} />
          <Scatter
            name="Cases"
            data={data}
            onClick={(e) => {
              if (e && e.payload) {
                handleClick(e.payload as DataPoint)
              }
            }}
            style={{ cursor: 'pointer' }}
          >
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
      {sourceData.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-2">
          表示中: {sourceData.length}件 | 点をクリックすると詳細ページに移動します
        </p>
      )}
    </div>
  )
}
