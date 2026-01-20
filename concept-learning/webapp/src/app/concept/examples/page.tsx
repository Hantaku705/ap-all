import Link from 'next/link'
import { getAllExamples, getAllCategories, getCategoryColorClass } from '@/lib/concept'

export default function ExamplesPage() {
  const examples = getAllExamples()
  const categories = getAllCategories()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/concept" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
        ← コンセプト学習に戻る
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">コンセプト事例集</h1>
      <p className="text-gray-600 mb-8">
        成功した商品コンセプトを分析し、良いコンセプトの作り方を学ぶ
      </p>

      {/* カテゴリフィルター */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-sm text-gray-500 mr-2">カテゴリ:</span>
        {Object.entries(categories).map(([key, category]) => (
          <span
            key={key}
            className={`text-xs px-3 py-1 rounded-full ${getCategoryColorClass(category.color)}`}
          >
            {category.name}
          </span>
        ))}
      </div>

      {/* 事例一覧 */}
      <div className="space-y-6">
        {examples.map((example) => {
          const category = categories[example.category]
          return (
            <Link
              key={example.slug}
              href={`/concept/examples/${example.slug}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {category && (
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColorClass(category.color)}`}>
                        {category.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{example.brand}</span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    「{example.title}」
                  </h2>

                  <p className="text-sm text-gray-600 mb-4">
                    {example.concept.existing} → {example.concept.newPerspective}
                  </p>

                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500 mb-1">顧客インサイト</p>
                    <p className="text-sm text-gray-700">「{example.concept.insight}」</p>
                  </div>
                </div>

                <div className="text-blue-600 text-sm flex-shrink-0">
                  詳しく見る →
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* 事例追加について */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">事例を追加するには</h3>
        <p className="text-sm text-blue-800">
          新しい商品やサービスのコンセプトを分析して追加できます。
          コンセプト公式に沿って「既存の概念」「新しい視点」「顧客インサイト」「タグライン」を整理してください。
        </p>
      </div>
    </div>
  )
}
