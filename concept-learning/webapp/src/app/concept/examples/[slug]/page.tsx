import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getExampleBySlug, getAllSlugs, getCategoryInfo, getCategoryColorClass, getMustCriteria, getOptionalCriteria, getMatchColorClass } from '@/lib/concept'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function ExampleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const example = getExampleBySlug(slug)

  if (!example) {
    notFound()
  }

  const category = getCategoryInfo(example.category)
  const mustCriteria = getMustCriteria()
  const optionalCriteria = getOptionalCriteria()

  const matchColors: Record<string, string> = {
    '○': 'bg-green-100 text-green-700',
    '△': 'bg-yellow-100 text-yellow-700',
    '×': 'bg-red-100 text-red-700'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/concept/examples" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
        ← 事例一覧に戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {category && (
            <span className={`text-sm px-3 py-1 rounded ${getCategoryColorClass(category.color)}`}>
              {category.name}
            </span>
          )}
          <span className="text-sm text-gray-500">{example.brand}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          「{example.title}」
        </h1>
        <p className="text-lg text-gray-600">
          {example.concept.tagline}
        </p>
      </div>

      {/* コンセプト分析 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔄</span> コンセプト分析
        </h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">既存の概念</p>
            <p className="text-gray-700 bg-gray-50 rounded p-3">
              {example.concept.existing}
            </p>
          </div>
          <div className="flex justify-center">
            <span className="text-2xl text-blue-500">↓</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">新しい視点</p>
            <p className="text-gray-700 bg-blue-50 rounded p-3 font-medium">
              {example.concept.newPerspective}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">顧客インサイト</p>
            <p className="text-gray-700 bg-yellow-50 rounded p-3">
              「{example.concept.insight}」
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">コンセプト</p>
            <p className="text-xl font-bold text-gray-900 bg-green-50 rounded p-4 text-center">
              「{example.concept.tagline}」
            </p>
          </div>
        </div>
      </section>

      {/* なぜ良いコンセプトか */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">✨</span> なぜ良いコンセプトか
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">リフレーミング</h3>
            <p className="text-sm text-gray-600">{example.whyGood.reframing}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">顧客インサイト</h3>
            <p className="text-sm text-gray-600">{example.whyGood.insight}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">シンプルで直感的</h3>
            <p className="text-sm text-gray-600">{example.whyGood.simple}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">行動を生み出す</h3>
            <p className="text-sm text-gray-600">{example.whyGood.action}</p>
          </div>
        </div>
      </section>

      {/* マスト評価（7項目） */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span> マスト評価（7項目）
        </h2>
        <p className="text-sm text-gray-500 mb-4">コンセプトの本質を評価する必須項目</p>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-blue-700 text-sm w-12">評価</th>
                <th className="text-left py-3 px-4 font-medium text-blue-700 text-sm w-1/3">項目</th>
                <th className="text-left py-3 px-4 font-medium text-blue-700 text-sm">この事例では</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mustCriteria.map((criterion) => {
                const evalItem = example.evaluation[String(criterion.id)]
                return (
                  <tr key={criterion.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${matchColors[evalItem?.match || '○']}`}>
                        {evalItem?.match || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mr-2">
                        {criterion.id}
                      </span>
                      {criterion.title}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{evalItem?.reason || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 任意評価（7項目） */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📱</span> 任意評価（7項目）
        </h2>
        <p className="text-sm text-gray-500 mb-4">SNS拡散・UGCを狙う場合の追加項目</p>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-purple-700 text-sm w-12">評価</th>
                <th className="text-left py-3 px-4 font-medium text-purple-700 text-sm w-1/3">項目</th>
                <th className="text-left py-3 px-4 font-medium text-purple-700 text-sm">この事例では</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {optionalCriteria.map((criterion) => {
                const evalItem = example.evaluation[String(criterion.id)]
                return (
                  <tr key={criterion.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${matchColors[evalItem?.match || '○']}`}>
                        {evalItem?.match || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mr-2">
                        {criterion.id}
                      </span>
                      {criterion.title}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{evalItem?.reason || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">○ = 当てはまる、△ = 一部当てはまる、× = 当てはまらない</p>
      </section>

      {/* ネーミング案 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span> ネーミング案
        </h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-4">このコンセプトから考えられる他のネーミング</p>
          <div className="flex flex-wrap gap-3">
            {example.namingIdeas.map((idea, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
              >
                {idea}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 学び */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📝</span> この事例からの学び
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <ul className="space-y-3">
            {example.learnings.map((learning, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-blue-500 font-bold">•</span>
                <span className="text-blue-900">{learning}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 公式に当てはめると */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📐</span> 公式に当てはめると
        </h2>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm">
          <p className="leading-relaxed">
            <span className="text-yellow-400">（{example.concept.existing.split('ための')[1] || example.concept.existing}）</span>を
            <span className="text-green-400">（{example.concept.newPerspective.split('、')[0]}）</span>の視点で捉え直し、
          </p>
          <p className="leading-relaxed mt-2">
            <span className="text-blue-400">（{example.concept.insight.split('。')[0]}）</span>というインサイトに応える、
          </p>
          <p className="leading-relaxed mt-2">
            <span className="text-pink-400 font-bold">「{example.concept.tagline}」</span>
          </p>
        </div>
      </section>
    </div>
  )
}
