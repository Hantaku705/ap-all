"use client"

import { useState, useMemo } from "react"
import type { TaglineData, CategoryConfig } from "@/data/types"

type SortKey = "brand" | "maker" | "priceCategory" | "price" | "tagline" | "xAxis" | "yAxis" | "taglineFC" | "catchcopyFC"
type SortDir = "asc" | "desc"

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`inline-block ml-1 ${active ? "text-gray-900" : "text-gray-300"}`}>
      {active ? (dir === "asc" ? "▲" : "▼") : "▲"}
    </span>
  )
}

interface TaglineTableProps {
  data: TaglineData[]
  config: CategoryConfig
}

export default function TaglineTable({ data, config }: TaglineTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState<string>("all")
  const [axisFilters, setAxisFilters] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const categoryOrder = Object.fromEntries(config.priceCategories.map((pc, i) => [pc.key, i]))
  const categoryLabel = (key: string) => config.priceCategories.find((pc) => pc.key === key)?.label.split(" ")[0] || key
  const categoryColor = (key: string) => config.priceCategories.find((pc) => pc.key === key)?.color || "#999"

  const xLabel = (x: number) => {
    const xFilters = config.xAxisFilters
    return xFilters.find((f) => f.condition(x))?.label || ""
  }
  const yLabel = (y: number) => {
    const yFilters = config.yAxisFilters
    return yFilters.find((f) => f.condition(y))?.label || ""
  }

  const toggleAxisFilter = (f: string) => {
    setAxisFilters((prev) => {
      const next = new Set(prev)
      if (next.has(f)) { next.delete(f) } else { next.add(f) }
      return next
    })
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir(key === "xAxis" || key === "yAxis" ? "desc" : "asc")
    }
  }

  const filtered = useMemo(() => {
    let result = data
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((d) => d.brand.toLowerCase().includes(q))
    }
    if (priceFilter !== "all") {
      result = result.filter((d) => d.priceCategory === priceFilter)
    }
    if (axisFilters.size > 0) {
      result = result.filter((d) => {
        for (const filterKey of axisFilters) {
          const xFilter = config.xAxisFilters.find((f) => f.key === filterKey)
          if (xFilter && !xFilter.condition(d.x)) return false
          const yFilter = config.yAxisFilters.find((f) => f.key === filterKey)
          if (yFilter && !yFilter.condition(d.y)) return false
        }
        return true
      })
    }
    return result
  }, [data, searchQuery, priceFilter, axisFilters, config])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "brand": cmp = a.brand.localeCompare(b.brand, "ja"); break
        case "maker": cmp = a.maker.localeCompare(b.maker, "ja"); break
        case "priceCategory": cmp = (categoryOrder[a.priceCategory] ?? 0) - (categoryOrder[b.priceCategory] ?? 0); break
        case "price": cmp = a.price - b.price; break
        case "tagline": cmp = a.tagline.localeCompare(b.tagline, "ja"); break
        case "xAxis": cmp = a.x - b.x; break
        case "yAxis": cmp = a.y - b.y; break
        case "taglineFC": cmp = (a.taglineFC ? 1 : 0) - (b.taglineFC ? 1 : 0); break
        case "catchcopyFC": cmp = ((a.catchcopyFC ?? false) ? 1 : 0) - ((b.catchcopyFC ?? false) ? 1 : 0); break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir, categoryOrder])

  const priceFilters = [
    { label: "すべて", value: "all" },
    ...config.priceCategories.map((pc) => ({ label: pc.label.split(" ")[0], value: pc.key })),
  ]

  const axisOptions = [
    ...config.xAxisFilters.map((f) => ({ label: f.label, value: f.key })),
    ...config.yAxisFilters.map((f) => ({ label: f.label, value: f.key })),
  ]

  const thClass = "py-2 px-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700 transition-colors"

  return (
    <div>
      <div className="mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ブランド名で検索..."
          className="w-full max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
        />
      </div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {priceFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setPriceFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              priceFilter === f.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {axisOptions.map((f) => (
          <button
            key={f.value}
            onClick={() => toggleAxisFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              axisFilters.has(f.value)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-2">{sorted.length}件</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className={`text-left ${thClass}`} onClick={() => handleSort("brand")}>
                ブランド<SortIcon active={sortKey === "brand"} dir={sortDir} />
              </th>
              <th className={`text-left ${thClass}`} onClick={() => handleSort("maker")}>
                メーカー<SortIcon active={sortKey === "maker"} dir={sortDir} />
              </th>
              <th className={`text-left ${thClass}`} onClick={() => handleSort("priceCategory")}>
                価格帯<SortIcon active={sortKey === "priceCategory"} dir={sortDir} />
              </th>
              <th className={`text-right ${thClass}`} onClick={() => handleSort("price")}>
                価格<SortIcon active={sortKey === "price"} dir={sortDir} />
              </th>
              <th className="text-left py-2 px-3 font-medium text-gray-500">キャッチコピー</th>
              <th className={`text-left ${thClass}`} onClick={() => handleSort("tagline")}>
                タグライン<SortIcon active={sortKey === "tagline"} dir={sortDir} />
              </th>
              <th className={`text-center ${thClass}`} onClick={() => handleSort("xAxis")}>
                訴求軸<SortIcon active={sortKey === "xAxis"} dir={sortDir} />
              </th>
              <th className={`text-center ${thClass}`} onClick={() => handleSort("yAxis")}>
                世界観<SortIcon active={sortKey === "yAxis"} dir={sortDir} />
              </th>
              <th className={`text-center ${thClass}`} onClick={() => handleSort("catchcopyFC")}>
                CC<SortIcon active={sortKey === "catchcopyFC"} dir={sortDir} />
              </th>
              <th className={`text-center ${thClass}`} onClick={() => handleSort("taglineFC")}>
                TL<SortIcon active={sortKey === "taglineFC"} dir={sortDir} />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, idx) => (
              <tr key={`${d.brand}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50">
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
                      backgroundColor: `${categoryColor(d.priceCategory)}15`,
                      color: categoryColor(d.priceCategory),
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: categoryColor(d.priceCategory) }}
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
                  <span className="text-xs text-gray-500 whitespace-nowrap">{xLabel(d.x)} ({d.x > 0 ? `+${d.x}` : d.x})</span>
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="text-xs text-gray-500 whitespace-nowrap">{yLabel(d.y)} ({d.y > 0 ? `+${d.y}` : d.y})</span>
                </td>
                <td className="py-2 px-3 text-center">
                  {d.catchcopy ? (
                    d.catchcopyFC ? (
                      d.catchcopySourceUrl ? (
                        <a href={d.catchcopySourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs hover:bg-green-200 transition-colors" title="キャッチコピーFC済み">&#10003;</a>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs" title="キャッチコピーFC済み">&#10003;</span>
                      )
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-500 text-xs" title="未検証">?</span>
                    )
                  ) : (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-300 text-xs" title="キャッチコピーなし">-</span>
                  )}
                </td>
                <td className="py-2 px-3 text-center">
                  {d.taglineFC ? (
                    d.taglineSourceUrl ? (
                      <a href={d.taglineSourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs hover:bg-green-200 transition-colors" title="タグラインFC済み">&#10003;</a>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs" title="タグラインFC済み">&#10003;</span>
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
