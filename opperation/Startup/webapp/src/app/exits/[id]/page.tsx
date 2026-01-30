import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exits, categoryLabels, japanStatusLabels, entryDifficultyLabels } from '@/data/exits-data'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return exits.map((exit) => ({
    id: exit.id,
  }))
}

export default async function ExitDetailPage({ params }: PageProps) {
  const { id } = await params
  const exit = exits.find((e) => e.id === id)

  if (!exit) {
    notFound()
  }

  const japanStatusColors = {
    none: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    small: 'bg-amber-100 text-amber-800 border-amber-200',
    competitive: 'bg-red-100 text-red-800 border-red-200',
  }

  const difficultyColors = {
    low: 'text-emerald-600',
    medium: 'text-amber-600',
    high: 'text-red-600',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">US B2B SaaS EXIT Dashboard</h1>
            <nav className="flex gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/exits" className="text-gray-600 hover:text-gray-900">事例一覧</Link>
              <Link href="/opportunities" className="text-gray-600 hover:text-gray-900">機会分析</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/exits" className="text-blue-600 text-sm hover:underline mb-4 inline-block">
          ← 事例一覧に戻る
        </Link>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold">{exit.company}</h2>
              <p className="text-gray-500 mt-1">{categoryLabels[exit.category]}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{exit.exitAmount}</p>
              <p className="text-sm text-gray-500">{exit.exitYear}年</p>
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-6">{exit.description}</p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-sm text-gray-500 mb-2">EXIT情報</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">買収先</span>
                  <span className="font-medium">{exit.acquirer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">EXIT金額</span>
                  <span className="font-medium">{exit.exitAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">EXIT年</span>
                  <span className="font-medium">{exit.exitYear}年</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-sm text-gray-500 mb-2">日本市場分析</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">類似サービス</span>
                  <span className={`px-2 py-1 rounded text-sm border ${japanStatusColors[exit.japanStatus]}`}>
                    {japanStatusLabels[exit.japanStatus]}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">参入難易度</span>
                  <span className={`font-medium ${difficultyColors[exit.entryDifficulty]}`}>
                    {entryDifficultyLabels[exit.entryDifficulty]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">日本参入機会</h3>
          <p className="text-gray-700 leading-relaxed">{exit.opportunity}</p>
        </div>

        {exit.sourceUrl && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-bold text-lg mb-4">参考リンク</h3>
            <a
              href={exit.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {exit.sourceUrl}
            </a>
          </div>
        )}

        {/* Related Exits */}
        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4">関連事例</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {exits
              .filter((e) => e.id !== exit.id && e.category === exit.category)
              .slice(0, 3)
              .map((related) => (
                <Link
                  key={related.id}
                  href={`/exits/${related.id}`}
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-bold">{related.company}</h4>
                  <p className="text-sm text-gray-600 mt-1">{related.exitAmount}</p>
                  <p className="text-xs text-gray-500 mt-2">→ {related.acquirer}</p>
                </Link>
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}
