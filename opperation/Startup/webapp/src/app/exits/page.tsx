'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ExitCard } from '@/components/cards/ExitCard'
import {
  exits,
  categoryLabels,
  japanStatusLabels,
  entryDifficultyLabels,
  statusLabels,
  sourceLabels,
  type Category,
  type JapanStatus,
  type EntryDifficulty,
  type CompanyStatus,
  type DataSource,
} from '@/data/exits-data'

type SortKey = 'exitAmountNum' | 'exitYear' | 'company'
type SortOrder = 'asc' | 'desc'

// 複数選択フィルターコンポーネント
function MultiSelectFilter<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: Record<T, string>
  selected: T[]
  onChange: (values: T[]) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleValue = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const displayText = selected.length === 0
    ? 'すべて'
    : selected.length === 1
    ? options[selected[0]]
    : `${selected.length}件選択中`

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border rounded-lg text-sm text-left bg-white flex justify-between items-center"
      >
        <span className={selected.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
          {displayText}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b">
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-blue-600 hover:underline"
            >
              クリア
            </button>
          </div>
          {(Object.entries(options) as [T, string][]).map(([key, optionLabel]) => (
            <label
              key={key}
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(key)}
                onChange={() => toggleValue(key)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{optionLabel}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ExitsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilters, setCategoryFilters] = useState<Category[]>([])
  const [japanStatusFilters, setJapanStatusFilters] = useState<JapanStatus[]>([])
  const [difficultyFilters, setDifficultyFilters] = useState<EntryDifficulty[]>([])
  const [statusFilters, setStatusFilters] = useState<CompanyStatus[]>([])
  const [sourceFilters, setSourceFilters] = useState<DataSource[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('exitAmountNum')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table')

  const hasActiveFilters = categoryFilters.length > 0 ||
    japanStatusFilters.length > 0 ||
    difficultyFilters.length > 0 ||
    statusFilters.length > 0 ||
    sourceFilters.length > 0 ||
    search.length > 0

  const clearAllFilters = () => {
    setSearch('')
    setCategoryFilters([])
    setJapanStatusFilters([])
    setDifficultyFilters([])
    setStatusFilters([])
    setSourceFilters([])
  }

  const filteredExits = useMemo(() => {
    return exits
      .filter((e) => {
        if (search && !e.company.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) {
          return false
        }
        if (categoryFilters.length > 0 && !categoryFilters.includes(e.category)) return false
        if (japanStatusFilters.length > 0 && !japanStatusFilters.includes(e.japanStatus)) return false
        if (difficultyFilters.length > 0 && !difficultyFilters.includes(e.entryDifficulty)) return false
        if (statusFilters.length > 0 && !statusFilters.includes(e.status)) return false
        if (sourceFilters.length > 0 && e.source && !sourceFilters.includes(e.source)) return false
        return true
      })
      .sort((a, b) => {
        if (sortKey === 'exitAmountNum') {
          const aVal = a.status === 'exit' ? a.exitAmountNum :
            (a.valuation ? parseFloat(a.valuation.replace(/[$B+]/g, '')) * 1000000000 : 0)
          const bVal = b.status === 'exit' ? b.exitAmountNum :
            (b.valuation ? parseFloat(b.valuation.replace(/[$B+]/g, '')) * 1000000000 : 0)
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        }
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }
        return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
      })
  }, [search, categoryFilters, japanStatusFilters, difficultyFilters, statusFilters, sourceFilters, sortKey, sortOrder])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">US B2B SaaS Dashboard</h1>
            <nav className="flex gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/exits" className="text-blue-600 font-medium">ケーススタディ</Link>
              <Link href="/opportunities" className="text-gray-600 hover:text-gray-900">機会分析</Link>
              <Link href="/sources" className="text-gray-600 hover:text-gray-900">情報収集</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">B2B SaaS ケーススタディ一覧</h2>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="grid md:grid-cols-7 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">検索</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="会社名・事業内容"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <MultiSelectFilter
              label="ステータス"
              options={statusLabels}
              selected={statusFilters}
              onChange={setStatusFilters}
            />
            <MultiSelectFilter
              label="ソース"
              options={sourceLabels}
              selected={sourceFilters}
              onChange={setSourceFilters}
            />
            <MultiSelectFilter
              label="カテゴリ"
              options={categoryLabels}
              selected={categoryFilters}
              onChange={setCategoryFilters}
            />
            <MultiSelectFilter
              label="日本類似"
              options={japanStatusLabels}
              selected={japanStatusFilters}
              onChange={setJapanStatusFilters}
            />
            <MultiSelectFilter
              label="参入難易度"
              options={entryDifficultyLabels}
              selected={difficultyFilters}
              onChange={setDifficultyFilters}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">並び替え</label>
              <select
                value={`${sortKey}-${sortOrder}`}
                onChange={(e) => {
                  const [key, order] = e.target.value.split('-') as [SortKey, SortOrder]
                  setSortKey(key)
                  setSortOrder(order)
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="exitAmountNum-desc">金額/評価額（高い順）</option>
                <option value="exitAmountNum-asc">金額/評価額（低い順）</option>
                <option value="exitYear-desc">年（新しい順）</option>
                <option value="exitYear-asc">年（古い順）</option>
                <option value="company-asc">会社名（A-Z）</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">{filteredExits.length}件のケーススタディ</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:underline"
                >
                  フィルターをクリア
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-1 text-sm rounded ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                カード
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-sm rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                テーブル
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {viewMode === 'card' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExits.map((exit) => (
              <ExitCard key={exit.id} exit={exit} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium">会社名</th>
                  <th className="text-center p-3 font-medium">ステータス</th>
                  <th className="text-left p-3 font-medium">コアバリュー</th>
                  <th className="text-left p-3 font-medium">カテゴリ</th>
                  <th className="text-right p-3 font-medium">金額/評価額</th>
                  <th className="text-left p-3 font-medium">買収先/ラウンド</th>
                  <th className="text-center p-3 font-medium">日本類似</th>
                  <th className="text-center p-3 font-medium">難易度</th>
                </tr>
              </thead>
              <tbody>
                {filteredExits.map((exit) => (
                  <tr key={exit.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <Link href={`/exits/${exit.id}`} className="text-blue-600 hover:underline font-medium">
                        {exit.company}
                      </Link>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        exit.status === 'exit' ? 'bg-gray-100 text-gray-800' :
                        exit.status === 'growing' ? 'bg-blue-100 text-blue-800' :
                        exit.status === 'discovery' ? 'bg-teal-100 text-teal-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {statusLabels[exit.status]}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 text-sm">{exit.coreValue}</td>
                    <td className="p-3 text-gray-600">{categoryLabels[exit.category]}</td>
                    <td className="p-3 text-right font-medium">
                      {exit.status === 'exit' ? exit.exitAmount : exit.valuation || '-'}
                    </td>
                    <td className="p-3 text-gray-600">
                      {exit.status === 'exit' ? exit.acquirer : exit.fundingRound || '-'}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        exit.japanStatus === 'none' ? 'bg-emerald-100 text-emerald-800' :
                        exit.japanStatus === 'small' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {japanStatusLabels[exit.japanStatus]}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={
                        exit.entryDifficulty === 'low' ? 'text-emerald-600' :
                        exit.entryDifficulty === 'medium' ? 'text-amber-600' :
                        'text-red-600'
                      }>
                        {entryDifficultyLabels[exit.entryDifficulty]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
