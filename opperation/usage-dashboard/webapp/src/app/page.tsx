'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { fetchUsageSummary, fetchDailyTotals, UsageSummary, DailyTotal } from '@/lib/supabase'
import { StatCards } from '@/components/StatCards'
import { UsageChart } from '@/components/UsageChart'
import { UserRanking } from '@/components/UserRanking'

export default function Dashboard() {
  const [summary, setSummary] = useState<UsageSummary[]>([])
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [summaryData, dailyData] = await Promise.all([
        fetchUsageSummary(),
        fetchDailyTotals(30)
      ])
      setSummary(summaryData)
      setDailyTotals(dailyData)
      setLoading(false)
    }

    loadData()

    // 5分ごとに更新
    const interval = setInterval(loadData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const totalMinutes = summary.reduce((sum, u) => sum + u.total_minutes, 0)
  const totalSessions = summary.reduce((sum, u) => sum + u.total_sessions, 0)
  const activeUsers = summary.length

  const today = new Date().toISOString().split('T')[0]
  const todayData = dailyTotals.find(d => d.date === today)
  const todayMinutes = todayData?.total_minutes || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Claude Code Usage Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                社内Claude Code使用状況モニタリング
              </p>
            </div>
            <div className="text-sm text-gray-400">
              {loading ? '読み込み中...' : `最終更新: ${new Date().toLocaleTimeString('ja-JP')}`}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="space-y-6">
            <StatCards
              totalMinutes={totalMinutes}
              totalSessions={totalSessions}
              activeUsers={activeUsers}
              todayMinutes={todayMinutes}
              totalDays={dailyTotals.length}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UsageChart data={dailyTotals} />
              <UserRanking data={summary} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">セットアップガイド</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600">
                  使用時間を追跡するには、各PCで以下のコマンドを実行してください：
                </p>
                <div className="bg-gray-900 text-gray-100 rounded p-4 my-4 font-mono text-sm overflow-x-auto">
                  <p className="text-green-400"># 使用時間を確認</p>
                  <p>/usage</p>
                  <br />
                  <p className="text-green-400"># ダッシュボードに同期</p>
                  <p>/usage sync</p>
                </div>
                <p className="text-gray-600">
                  環境変数 <code>SUPABASE_URL</code> と <code>SUPABASE_KEY</code> が設定されている必要があります。
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            Claude Code Usage Tracking System
          </p>
        </div>
      </footer>
    </div>
  )
}
