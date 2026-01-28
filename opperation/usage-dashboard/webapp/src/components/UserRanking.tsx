'use client'

import { UsageSummary } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'

type Props = {
  data: UsageSummary[]
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}分`
  }
  return `${hours}時間${mins}分`
}

function formatTokens(tokens: number): string {
  if (!tokens) return '-'
  if (tokens >= 1_000_000_000) {
    return `${(tokens / 1_000_000_000).toFixed(1)}B`
  } else if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`
  } else if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`
  }
  return tokens.toString()
}

export function UserRanking({ data }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">ユーザー別累計ランキング</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">#</th>
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">ユーザー</th>
              <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">使用時間</th>
              <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">トークン</th>
              <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">セッション</th>
              <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">最終アクティブ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user, index) => (
              <tr key={user.user_id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-3">
                  <span className={`
                    inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium
                    ${index === 0 ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${index === 1 ? 'bg-gray-100 text-gray-800' : ''}
                    ${index === 2 ? 'bg-orange-100 text-orange-800' : ''}
                    ${index > 2 ? 'text-gray-500' : ''}
                  `}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-500">{user.hostname}</div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-sm">
                  {formatDuration(user.total_minutes)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-sm text-amber-600">
                  {formatTokens(user.total_tokens)}
                </td>
                <td className="py-3 px-3 text-right text-sm text-gray-600">
                  {user.total_sessions}回
                </td>
                <td className="py-3 px-3 text-right text-sm text-gray-500">
                  {user.last_active_date
                    ? format(parseISO(user.last_active_date), 'M/d')
                    : '-'}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
