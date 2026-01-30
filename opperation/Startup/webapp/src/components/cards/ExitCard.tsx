import Link from 'next/link'
import { type ExitCase, categoryLabels, japanStatusLabels, entryDifficultyLabels } from '@/data/exits-data'

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

export function ExitCard({ exit }: ExitCardProps) {
  return (
    <Link href={`/exits/${exit.id}`} className="block">
      <div className="rounded-lg border p-4 hover:shadow-md transition-shadow bg-white">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{exit.company}</h3>
          <span className="text-lg font-semibold text-blue-600">{exit.exitAmount}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{exit.description}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded">{categoryLabels[exit.category]}</span>
          <span className={`text-xs px-2 py-1 rounded ${japanStatusColors[exit.japanStatus]}`}>
            {japanStatusLabels[exit.japanStatus]}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">→ {exit.acquirer}</span>
          <span className={difficultyColors[exit.entryDifficulty]}>
            難易度: {entryDifficultyLabels[exit.entryDifficulty]}
          </span>
        </div>
      </div>
    </Link>
  )
}
