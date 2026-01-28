'use client'

type Props = {
  totalMinutes: number
  totalSessions: number
  activeUsers: number
  todayMinutes: number
  totalDays: number
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}分`
  }
  return `${hours}時間${mins}分`
}

export function StatCards({ totalMinutes, totalSessions, activeUsers, todayMinutes, totalDays }: Props) {
  const dailyAverage = totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0

  const stats = [
    {
      label: '累計使用時間',
      value: formatDuration(totalMinutes),
      subtext: `${totalSessions} セッション`,
      color: 'bg-blue-500'
    },
    {
      label: '今日の使用時間',
      value: formatDuration(todayMinutes),
      subtext: '全ユーザー合計',
      color: 'bg-green-500'
    },
    {
      label: '1日平均時間',
      value: formatDuration(dailyAverage),
      subtext: `${totalDays}日間の平均`,
      color: 'bg-cyan-500'
    },
    {
      label: 'アクティブユーザー',
      value: `${activeUsers}人`,
      subtext: '累計',
      color: 'bg-purple-500'
    },
    {
      label: '平均使用時間/人',
      value: activeUsers > 0 ? formatDuration(Math.round(totalMinutes / activeUsers)) : '0分',
      subtext: '累計',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${stat.color} mr-3`} />
            <span className="text-sm text-gray-500">{stat.label}</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">{stat.subtext}</div>
        </div>
      ))}
    </div>
  )
}
