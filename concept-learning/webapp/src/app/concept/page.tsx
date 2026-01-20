import Link from 'next/link'
import { getAllExamples } from '@/lib/concept'

export default function ConceptPage() {
  const examples = getAllExamples()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          コンセプト学習
        </h1>
        <p className="text-lg text-gray-600">
          良いコンセプトの作り方を学ぶ
        </p>
      </div>

      {/* 2つのセクション */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/concept/textbook"
          className="block p-8 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="text-4xl mb-4">📖</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">コンセプトとは</h2>
          <p className="text-sm text-gray-600 mb-4">
            コンセプトの公式、良いコンセプトの条件、評価項目を学ぶ
          </p>
          <div className="text-blue-600 text-sm font-medium">
            教科書を読む →
          </div>
        </Link>

        <Link
          href="/concept/examples"
          className="block p-8 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">事例</h2>
          <p className="text-sm text-gray-600 mb-4">
            {examples.length}つの成功事例を分析して学ぶ
          </p>
          <div className="text-blue-600 text-sm font-medium">
            事例を見る →
          </div>
        </Link>
      </div>
    </div>
  )
}
