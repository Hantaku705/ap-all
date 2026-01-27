"use client"

import { useState } from "react"
import {
  taglineData,
  priceCategoryColors,
  type ShampooTagline,
} from "@/data/tagline-data"

type PriceFilter = "all" | "petit" | "drugcos" | "salon"

const categoryLabel = (c: ShampooTagline["priceCategory"]) =>
  c === "petit" ? "プチプラ" : c === "drugcos" ? "ドラコス" : "美容専売品"

const quadrantLabel = (x: number, y: number) => {
  if (x < 0 && y > 0) return "機能×特別"
  if (x >= 0 && y > 0) return "感性×特別"
  if (x < 0 && y <= 0) return "機能×日常"
  return "感性×日常"
}

export default function TaglineTable() {
  const [filter, setFilter] = useState<PriceFilter>("all")

  const filtered = filter === "all" ? taglineData : taglineData.filter((d) => d.priceCategory === filter)

  const filters: { label: string; value: PriceFilter }[] = [
    { label: "すべて", value: "all" },
    { label: "プチプラ", value: "petit" },
    { label: "ドラコス", value: "drugcos" },
    { label: "美容専売品", value: "salon" },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-2">{filtered.length}件</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-medium text-gray-500">ブランド</th>
              <th className="text-left py-2 px-3 font-medium text-gray-500">メーカー</th>
              <th className="text-left py-2 px-3 font-medium text-gray-500">価格帯</th>
              <th className="text-right py-2 px-3 font-medium text-gray-500">価格</th>
              <th className="text-left py-2 px-3 font-medium text-gray-500">キャッチコピー</th>
              <th className="text-left py-2 px-3 font-medium text-gray-500">タグライン</th>
              <th className="text-center py-2 px-3 font-medium text-gray-500">象限</th>
              <th className="text-center py-2 px-3 font-medium text-gray-500">FC</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.brand} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-3 font-medium">
                  {d.url ? (
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                      {d.brand}
                    </a>
                  ) : d.brand}
                </td>
                <td className="py-2 px-3 text-gray-600">{d.maker}</td>
                <td className="py-2 px-3">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${priceCategoryColors[d.priceCategory]}15`,
                      color: priceCategoryColors[d.priceCategory],
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: priceCategoryColors[d.priceCategory] }}
                    />
                    {categoryLabel(d.priceCategory)}
                  </span>
                </td>
                <td className="py-2 px-3 text-right text-gray-600">
                  {d.price.toLocaleString()}円
                </td>
                <td className="py-2 px-3 text-gray-500 text-xs">
                  {d.catchcopy || <span className="text-gray-300">-</span>}
                </td>
                <td className="py-2 px-3 text-gray-800 italic">{d.tagline}</td>
                <td className="py-2 px-3 text-center">
                  <span className="text-xs text-gray-500 whitespace-nowrap">{quadrantLabel(d.x, d.y)}</span>
                </td>
                <td className="py-2 px-3 text-center">
                  {d.factChecked ? (
                    d.sourceUrl ? (
                      <a href={d.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs hover:bg-green-200 transition-colors" title="ファクトチェック済み（クリックでソースへ）">&#10003;</a>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs" title="ファクトチェック済み">&#10003;</span>
                    )
                  ) : (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs" title="未確認">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
