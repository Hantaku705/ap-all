import Link from 'next/link'
import { type ExitCase, categoryLabels, japanStatusLabels, entryDifficultyLabels, statusLabels } from '@/data/exits-data'

interface ExitCardProps {
  exit: ExitCase
}

const japanStatusColors = {
  none: 'bg-emerald-100 text-emerald-800',
  small: 'bg-amber-100 text-amber-800',
  competitive: 'bg-red-100 text-red-800',
}

const difficultyColors = {
  low: 'text-emerald-600',
  medium: 'text-amber-600',
  high: 'text-red-600',
}

const statusColors = {
  exit: 'bg-gray-100 text-gray-800',
  growing: 'bg-blue-100 text-blue-800',
  ipo_planned: 'bg-purple-100 text-purple-800',
  discovery: 'bg-teal-100 text-teal-800',
}

export function ExitCard({ exit }: ExitCardProps) {
  const displayAmount = exit.status === 'exit' ? exit.exitAmount : exit.valuation || '-'
  const displayTarget = exit.status === 'exit' ? exit.acquirer : exit.fundingRound || '-'

  return (
    <Link href={`/exits/${exit.id}`} className="block">
      <div className="rounded-lg border p-4 hover:shadow-md transition-shadow bg-white">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{exit.company}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ${statusColors[exit.status]}`}>
                {statusLabels[exit.status]}
              </span>
            </div>
          </div>
          <span className="text-lg font-semibold text-blue-600 ml-2">{displayAmount}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{exit.description}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded">{categoryLabels[exit.category]}</span>
          <span className={`text-xs px-2 py-1 rounded ${japanStatusColors[exit.japanStatus]}`}>
            {japanStatusLabels[exit.japanStatus]}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            {exit.status === 'exit' ? `→ ${displayTarget}` : displayTarget}
          </span>
          <span className={difficultyColors[exit.entryDifficulty]}>
            難易度: {entryDifficultyLabels[exit.entryDifficulty]}
          </span>
        </div>
      </div>
    </Link>
  )
}
