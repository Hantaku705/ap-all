import Link from 'next/link'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { ExitAmountChart } from '@/components/charts/ExitAmountChart'
import { OpportunityMatrix } from '@/components/charts/OpportunityMatrix'
import { StatCard } from '@/components/cards/StatCard'
import { ExitCard } from '@/components/cards/ExitCard'
import { exits, getTotalExitValue, getAverageExitValue, getJapanStatusCounts } from '@/data/exits-data'

export default function DashboardPage() {
  const totalValue = getTotalExitValue()
  const avgValue = getAverageExitValue()
  const japanCounts = getJapanStatusCounts()
  const latestExits = exits.sort((a, b) => b.exitYear - a.exitYear).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">US B2B SaaS EXIT Dashboard</h1>
            <nav className="flex gap-4">
              <Link href="/" className="text-blue-600 font-medium">Dashboard</Link>
              <Link href="/exits" className="text-gray-600 hover:text-gray-900">事例一覧</Link>
              <Link href="/opportunities" className="text-gray-600 hover:text-gray-900">機会分析</Link>
              <Link href="/sources" className="text-gray-600 hover:text-gray-900">情報収集</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="総EXIT事例" value={`${exits.length}件`} color="blue" />
          <StatCard
            title="総EXIT金額"
            value={`$${(totalValue / 1000000000).toFixed(1)}B`}
            subtitle="約1兆6000億円"
            color="green"
          />
          <StatCard
            title="平均EXIT金額"
            value={`$${(avgValue / 1000000).toFixed(0)}M`}
            color="amber"
          />
          <StatCard
            title="日本類似なし"
            value={`${japanCounts.none || 0}件`}
            subtitle="高機会領域"
            color="purple"
          />
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-bold mb-4">カテゴリ別分布</h2>
            <CategoryPieChart />
          </div>
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-bold mb-4">EXIT金額 Top10</h2>
            <ExitAmountChart />
          </div>
        </div>

        {/* Opportunity Matrix */}
        <div className="bg-white rounded-lg border p-4 mb-8">
          <h2 className="font-bold mb-2">日本参入機会マトリクス</h2>
          <p className="text-sm text-gray-500 mb-4">
            X軸: 参入難易度 / Y軸: 日本市場機会（類似サービスの有無）/ 円の大きさ: EXIT金額
          </p>
          <OpportunityMatrix />
        </div>

        {/* Latest Exits */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">最新EXIT事例</h2>
            <Link href="/exits" className="text-blue-600 text-sm hover:underline">
              すべて見る →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestExits.map((exit) => (
              <ExitCard key={exit.id} exit={exit} />
            ))}
          </div>
        </div>

        {/* High Opportunity Section */}
        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-6">
          <h2 className="font-bold text-emerald-800 mb-4">日本参入 高機会領域</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exits
              .filter((e) => e.japanStatus === 'none')
              .slice(0, 6)
              .map((exit) => (
                <Link
                  key={exit.id}
                  href={`/exits/${exit.id}`}
                  className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold">{exit.company}</h3>
                  <p className="text-sm text-gray-600 mt-1">{exit.description.slice(0, 50)}...</p>
                  <p className="text-emerald-600 text-sm mt-2">{exit.exitAmount}</p>
                </Link>
              ))}
          </div>
        </div>
      </main>

      <footer className="border-t mt-8 py-6 text-center text-sm text-gray-500">
        <p>Data source: TechCrunch, Salesforce News, HubSpot IR, etc. (2023-2025)</p>
      </footer>
    </div>
  )
}
