import Link from 'next/link'
import { getAllDefinitions, getAllExamples, getAllCategories, getCategoryColorClass } from '@/lib/concept'

export default function Home() {
  const definitions = getAllDefinitions()
  const examples = getAllExamples()
  const categories = getAllCategories()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          コンセプト学習
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
          良いコンセプトの作り方を学ぶ
        </p>
        <p className="text-sm text-gray-500 max-w-xl mx-auto">
          「事例 ⇔ 抽象化」を双方向に行き来しながら、良いコンセプトの作り方を習得する
        </p>
      </div>

      {/* 3つのセクションへのリンク */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <Link
          href="/concept/definition"
          className="group block p-8 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-400 transition-all"
        >
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📖</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">コンセプトの定義</h2>
          <p className="text-sm text-gray-600 mb-4">
            コンセプトとは何か、2つの定義と公式を学ぶ
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• リフレーミング公式（4要素）</li>
            <li>• いい商品コンセプトの5条件</li>
          </ul>
          <div className="mt-6 text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
            詳しく見る →
          </div>
        </Link>

        <Link
          href="/concept/good-concept"
          className="group block p-8 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-400 transition-all"
        >
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">✨</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">良いコンセプトとは</h2>
          <p className="text-sm text-gray-600 mb-4">
            UGCで使われるネーミングの条件と評価基準
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• ネーミングの7条件</li>
            <li>• 評価の7基準</li>
          </ul>
          <div className="mt-6 text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
            詳しく見る →
          </div>
        </Link>

        <Link
          href="/concept/examples"
          className="group block p-8 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-400 transition-all"
        >
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📚</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">事例で学ぶ</h2>
          <p className="text-sm text-gray-600 mb-4">
            {examples.length}つの成功事例を分析して学ぶ
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• コンセプト分析</li>
            <li>• なぜ良いコンセプトか</li>
            <li>• 5条件での評価</li>
          </ul>
          <div className="mt-6 text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
            詳しく見る →
          </div>
        </Link>
      </div>

      {/* 定義の概要 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">2つの定義</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> 良いコンセプトの定義は複数あり、それぞれの視点から商品コンセプトを評価することが重要。
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {definitions.map((def) => (
            <div key={def.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{def.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{def.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                  使いどころ: {def.usage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 事例プレビュー */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">事例</h2>
          <Link href="/concept/examples" className="text-blue-600 text-sm hover:underline">
            すべて見る →
          </Link>
        </div>

        {/* カテゴリ表示 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(categories).map(([key, category]) => {
            const count = examples.filter(e => e.category === key).length
            if (count === 0) return null
            return (
              <span
                key={key}
                className={`text-xs px-3 py-1 rounded-full ${getCategoryColorClass(category.color)}`}
              >
                {category.name} ({count})
              </span>
            )
          })}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examples.map((example) => {
            const category = categories[example.category]
            return (
              <Link
                key={example.slug}
                href={`/concept/examples/${example.slug}`}
                className="group block bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  {category && (
                    <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColorClass(category.color)}`}>
                      {category.name}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  「{example.title}」
                </h3>
                <p className="text-xs text-gray-500 mb-2">{example.brand}</p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {example.concept.insight}
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
