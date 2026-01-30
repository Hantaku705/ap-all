'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ExitCard } from '@/components/cards/ExitCard'
import {
  exits,
  categoryLabels,
  japanStatusLabels,
  entryDifficultyLabels,
  type Category,
  type JapanStatus,
  type EntryDifficulty,
} from '@/data/exits-data'

type SortKey = 'exitAmountNum' | 'exitYear' | 'company'
type SortOrder = 'asc' | 'desc'

export default function ExitsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [japanStatusFilter, setJapanStatusFilter] = useState<JapanStatus | 'all'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<EntryDifficulty | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('exitAmountNum')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')

  const filteredExits = useMemo(() => {
    return exits
      .filter((e) => {
        if (search && !e.company.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) {
          return false
        }
        if (categoryFilter !== 'all' && e.category !== categoryFilter) return false
        if (japanStatusFilter !== 'all' && e.japanStatus !== japanStatusFilter) return false
        if (difficultyFilter !== 'all' && e.entryDifficulty !== difficultyFilter) return false
        return true
      })
      .sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }
        return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
      })
  }, [search, categoryFilter, japanStatusFilter, difficultyFilter, sortKey, sortOrder])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">US B2B SaaS EXIT Dashboard</h1>
            <nav className="flex gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/exits" className="text-blue-600 font-medium">事例一覧</Link>
              <Link href="/opportunities" className="text-gray-600 hover:text-gray-900">機会分析</Link>
              <Link href="/sources" className="text-gray-600 hover:text-gray-900">情報収集</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">EXIT事例一覧</h2>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="grid md:grid-cols-5 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">すべて</option>
                {(Object.entries(categoryLabels) as [Category, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日本類似</label>
              <select
                value={japanStatusFilter}
                onChange={(e) => setJapanStatusFilter(e.target.value as JapanStatus | 'all')}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">すべて</option>
                {(Object.entries(japanStatusLabels) as [JapanStatus, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">参入難易度</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as EntryDifficulty | 'all')}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">すべて</option>
                {(Object.entries(entryDifficultyLabels) as [EntryDifficulty, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
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
                <option value="exitAmountNum-desc">EXIT金額（高い順）</option>
                <option value="exitAmountNum-asc">EXIT金額（低い順）</option>
                <option value="exitYear-desc">年（新しい順）</option>
                <option value="exitYear-asc">年（古い順）</option>
                <option value="company-asc">会社名（A-Z）</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">{filteredExits.length}件の事例</p>
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
                  <th className="text-left p-3 font-medium">コアバリュー</th>
                  <th className="text-left p-3 font-medium">カテゴリ</th>
                  <th className="text-right p-3 font-medium">EXIT金額</th>
                  <th className="text-left p-3 font-medium">買収先</th>
                  <th className="text-center p-3 font-medium">年</th>
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
                    <td className="p-3 text-gray-600 text-sm">{exit.coreValue}</td>
                    <td className="p-3 text-gray-600">{categoryLabels[exit.category]}</td>
                    <td className="p-3 text-right font-medium">{exit.exitAmount}</td>
                    <td className="p-3 text-gray-600">{exit.acquirer}</td>
                    <td className="p-3 text-center">{exit.exitYear}</td>
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
