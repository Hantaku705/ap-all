"use client"

import { useState } from "react"
import CategoryTabs from "@/components/CategoryTabs"
import PositioningMap from "@/components/PositioningMap"
import TaglineTable from "@/components/TaglineTable"
import { categories, defaultCategory } from "@/config/categories"
import { categoryData } from "@/data"

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory)

  const config = categories[selectedCategory]
  const data = categoryData[selectedCategory]

  return (
    <main className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          タグラインポジショニングマップ
        </h1>

        <div className="mb-8">
          <CategoryTabs selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {config.label} ポジショニングマップ
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({data.length}ブランド)
            </span>
          </h2>
          <div className="bg-gray-50 rounded-xl p-4 md:p-6">
            <PositioningMap data={data} config={config} />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {config.label} タグライン一覧
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <TaglineTable data={data} config={config} />
          </div>
        </section>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
          © 2026 AnyMind Group
        </footer>
      </div>
    </main>
  )
}
