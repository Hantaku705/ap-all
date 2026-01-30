import Link from 'next/link'
import { OpportunityMatrix } from '@/components/charts/OpportunityMatrix'
import { exits, categoryLabels, japanStatusLabels, entryDifficultyLabels, type Category } from '@/data/exits-data'

// Group exits by category for analysis
const categoryAnalysis = (Object.keys(categoryLabels) as Category[]).map((category) => {
  const categoryExits = exits.filter((e) => e.category === category)
  const highOpportunity = categoryExits.filter((e) => e.japanStatus === 'none')
  const avgExitAmount = categoryExits.reduce((sum, e) => sum + e.exitAmountNum, 0) / categoryExits.length

  return {
    category,
    label: categoryLabels[category],
    total: categoryExits.length,
    highOpportunity: highOpportunity.length,
    avgExitAmount,
    topCompanies: highOpportunity.slice(0, 3),
  }
})

// High opportunity exits (none in Japan)
const highOpportunityExits = exits
  .filter((e) => e.japanStatus === 'none')
  .sort((a, b) => b.exitAmountNum - a.exitAmountNum)

// Japan comparison data
const japanComparisons = [
  {
    usCompany: 'Airbase',
    japanCompetitors: ['楽楽精算', 'Concur', 'マネーフォワード経費'],
    gap: '統合型支出管理が弱い。経費精算・請求書・カードの一元管理に機会。',
  },
  {
    usCompany: 'SmartHR系',
    japanCompetitors: ['SmartHR', 'freee人事労務', 'カオナビ'],
    gap: 'AI駆動の人材開発・キャリア進行が未実装。Sana/Zavvy的な機能に機会。',
  },
  {
    usCompany: 'Lattice',
    japanCompetitors: ['カオナビ', 'HRMOS'],
    gap: 'OKR・1on1・360度評価の統合が弱い。パフォーマンス管理統合に機会。',
  },
  {
    usCompany: 'Gong',
    japanCompetitors: 'なし',
    gap: '営業会話分析AIは日本に存在しない。レベニューインテリジェンス領域は完全ブルーオーシャン。',
  },
  {
    usCompany: 'mParticle',
    japanCompetitors: '海外CDP（Segment等）',
    gap: '日本発CDPがない。マーテック成熟度の低さから先行者利益獲得可能。',
  },
]

export default function OpportunitiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">US B2B SaaS EXIT Dashboard</h1>
            <nav className="flex gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/exits" className="text-gray-600 hover:text-gray-900">事例一覧</Link>
              <Link href="/opportunities" className="text-blue-600 font-medium">機会分析</Link>
              <Link href="/sources" className="text-gray-600 hover:text-gray-900">情報収集</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">日本参入機会分析</h2>

        {/* Opportunity Matrix */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h3 className="font-bold text-lg mb-2">優先度マトリクス</h3>
          <p className="text-sm text-gray-500 mb-4">
            右上エリア（類似なし × 参入難易度低〜中）が最も有望な領域
          </p>
          <OpportunityMatrix />
        </div>

        {/* Category Analysis */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">カテゴリ別分析</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryAnalysis.map(({ category, label, total, highOpportunity, avgExitAmount, topCompanies }) => (
              <div key={category} className="border rounded-lg p-4">
                <h4 className="font-bold text-blue-600">{label}</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-gray-500">事例数:</span> {total}件</p>
                  <p><span className="text-gray-500">高機会:</span> <span className="text-emerald-600 font-medium">{highOpportunity}件</span></p>
                  <p><span className="text-gray-500">平均EXIT:</span> ${(avgExitAmount / 1000000).toFixed(0)}M</p>
                </div>
                {topCompanies.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-1">注目企業:</p>
                    <div className="flex flex-wrap gap-1">
                      {topCompanies.map((c) => (
                        <Link
                          key={c.id}
                          href={`/exits/${c.id}`}
                          className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded hover:bg-emerald-100"
                        >
                          {c.company}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* High Opportunity Ranking */}
        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-6 mb-8">
          <h3 className="font-bold text-lg text-emerald-800 mb-4">高機会ランキング（日本類似なし）</h3>
          <div className="space-y-3">
            {highOpportunityExits.slice(0, 10).map((exit, index) => (
              <Link
                key={exit.id}
                href={`/exits/${exit.id}`}
                className="flex items-center gap-4 bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <span className="text-2xl font-bold text-emerald-600 w-8">{index + 1}</span>
                <div className="flex-1">
                  <h4 className="font-bold">{exit.company}</h4>
                  <p className="text-sm text-gray-600">{exit.description.slice(0, 60)}...</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{exit.exitAmount}</p>
                  <p className={`text-sm ${
                    exit.entryDifficulty === 'low' ? 'text-emerald-600' :
                    exit.entryDifficulty === 'medium' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    難易度: {entryDifficultyLabels[exit.entryDifficulty]}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Japan Comparison Table */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">日本競合との比較</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium">US事例</th>
                  <th className="text-left p-3 font-medium">日本競合</th>
                  <th className="text-left p-3 font-medium">ギャップ・機会</th>
                </tr>
              </thead>
              <tbody>
                {japanComparisons.map((comp, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3 font-medium">{comp.usCompany}</td>
                    <td className="p-3 text-gray-600">
                      {Array.isArray(comp.japanCompetitors) ? comp.japanCompetitors.join(', ') : comp.japanCompetitors}
                    </td>
                    <td className="p-3 text-gray-700">{comp.gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="font-bold text-lg text-blue-800 mb-4">推奨アクション</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-blue-700 mb-2">即座に参入検討すべき領域</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">●</span>
                  <span><strong>ナレッジ管理AI</strong> - Zoomin/Guru型。日本企業の社内知識検索は未解決課題。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">●</span>
                  <span><strong>コンプライアンス自動化</strong> - Drata型。中小企業のISMS取得を10倍簡単に。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">●</span>
                  <span><strong>インバウンドリード管理</strong> - Chili Piper型。営業の属人化を解消。</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-blue-700 mb-2">中長期で注視すべき領域</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">●</span>
                  <span><strong>Agentic AIマーケティング</strong> - Qualified型。技術成熟待ち、但し先行投資価値あり。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">●</span>
                  <span><strong>レベニューインテリジェンス</strong> - Gong型。日本語音声認識精度向上待ち。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">●</span>
                  <span><strong>CDP</strong> - mParticle型。マーテック成熟度の向上と共に需要拡大。</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
