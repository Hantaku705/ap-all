'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { OpportunityMatrix } from '@/components/charts/OpportunityMatrix'
import {
  exits,
  categoryLabels,
  japanStatusLabels,
  entryDifficultyLabels,
  statusLabels,
  type Category,
  type JapanStatus,
  type EntryDifficulty,
  type CompanyStatus,
  type ExitCase,
} from '@/data/exits-data'

// 機会スコア計算（0-100）
function calculateOpportunityScore(exit: ExitCase): number {
  let score = 0

  // 日本市場機会（40点満点）
  if (exit.japanStatus === 'none') score += 40
  else if (exit.japanStatus === 'small') score += 20
  // competitive は 0点

  // 参入難易度（30点満点）
  if (exit.entryDifficulty === 'low') score += 30
  else if (exit.entryDifficulty === 'medium') score += 15
  // high は 0点

  // 金額/評価額（30点満点）
  const amount = exit.status === 'exit'
    ? exit.exitAmountNum
    : (exit.valuation ? parseFloat(exit.valuation.replace(/[$B+]/g, '')) * 1000000000 : 0)

  if (amount >= 1000000000) score += 30      // $1B+
  else if (amount >= 500000000) score += 20  // $500M+
  else if (amount >= 100000000) score += 10  // $100M+

  return score
}

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

export default function OpportunitiesPage() {
  // フィルター状態
  const [categoryFilters, setCategoryFilters] = useState<Category[]>([])
  const [japanStatusFilters, setJapanStatusFilters] = useState<JapanStatus[]>([])
  const [difficultyFilters, setDifficultyFilters] = useState<EntryDifficulty[]>([])
  const [statusFilters, setStatusFilters] = useState<CompanyStatus[]>([])

  const hasActiveFilters = categoryFilters.length > 0 ||
    japanStatusFilters.length > 0 ||
    difficultyFilters.length > 0 ||
    statusFilters.length > 0

  const clearAllFilters = () => {
    setCategoryFilters([])
    setJapanStatusFilters([])
    setDifficultyFilters([])
    setStatusFilters([])
  }

  // フィルター適用後のデータ
  const filteredExits = useMemo(() => {
    return exits.filter((e) => {
      if (categoryFilters.length > 0 && !categoryFilters.includes(e.category)) return false
      if (japanStatusFilters.length > 0 && !japanStatusFilters.includes(e.japanStatus)) return false
      if (difficultyFilters.length > 0 && !difficultyFilters.includes(e.entryDifficulty)) return false
      if (statusFilters.length > 0 && !statusFilters.includes(e.status)) return false
      return true
    })
  }, [categoryFilters, japanStatusFilters, difficultyFilters, statusFilters])

  // スコア付きデータ
  const scoredExits = useMemo(() => {
    return filteredExits.map(e => ({
      ...e,
      score: calculateOpportunityScore(e),
    })).sort((a, b) => b.score - a.score)
  }, [filteredExits])

  // カテゴリ別分析（フィルター適用後）
  const categoryAnalysis = useMemo(() => {
    return (Object.keys(categoryLabels) as Category[]).map((category) => {
      const categoryExits = filteredExits.filter((e) => e.category === category)
      const highOpportunity = categoryExits.filter((e) => e.japanStatus === 'none')
      const growingCount = categoryExits.filter((e) => e.status !== 'exit').length
      const discoveryCount = categoryExits.filter((e) => e.status === 'discovery').length
      const avgExitAmount = categoryExits.length > 0
        ? categoryExits.reduce((sum, e) => sum + e.exitAmountNum, 0) / categoryExits.length
        : 0
      const avgScore = categoryExits.length > 0
        ? categoryExits.reduce((sum, e) => sum + calculateOpportunityScore(e), 0) / categoryExits.length
        : 0
      const maxValuation = categoryExits
        .filter(e => e.valuation)
        .sort((a, b) => {
          const aVal = parseFloat((a.valuation || '0').replace(/[$B+]/g, ''))
          const bVal = parseFloat((b.valuation || '0').replace(/[$B+]/g, ''))
          return bVal - aVal
        })[0]

      return {
        category,
        label: categoryLabels[category],
        total: categoryExits.length,
        highOpportunity: highOpportunity.length,
        growingCount,
        discoveryCount,
        avgExitAmount,
        avgScore,
        maxValuation,
        topCompanies: highOpportunity.slice(0, 3),
      }
    }).filter(c => c.total > 0)
  }, [filteredExits])

  // 高機会ランキング（スコア順）
  const highOpportunityExits = useMemo(() => {
    return scoredExits.filter((e) => e.japanStatus === 'none' || e.japanStatus === 'small')
  }, [scoredExits])

  // 成長中企業（評価額$1B以上）
  const growingCompanies = useMemo(() => {
    return filteredExits
      .filter(e => e.status !== 'exit' && e.valuation)
      .map(e => ({
        ...e,
        valuationNum: parseFloat((e.valuation || '0').replace(/[$B+]/g, '')),
      }))
      .filter(e => e.valuationNum >= 1)
      .sort((a, b) => b.valuationNum - a.valuationNum)
  }, [filteredExits])

  // 推奨アクション（データ駆動）
  const immediateOpportunities = useMemo(() => {
    return scoredExits
      .filter(e => e.score >= 70 && e.entryDifficulty !== 'high')
      .slice(0, 5)
  }, [scoredExits])

  const mediumTermOpportunities = useMemo(() => {
    return scoredExits
      .filter(e => e.score >= 50 && e.entryDifficulty === 'high')
      .slice(0, 5)
  }, [scoredExits])

  // カテゴリ別EXIT分析（中央値・平均値・EXIT率）
  const categoryExitAnalysis = useMemo(() => {
    // 中央値計算用関数
    const median = (arr: number[]) => {
      if (arr.length === 0) return 0
      const sorted = [...arr].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
    }

    return (Object.keys(categoryLabels) as Category[]).map((category) => {
      const categoryExits = exits.filter((e) => e.category === category)
      const exitedCompanies = categoryExits.filter((e) => e.status === 'exit')
      const exitAmounts = exitedCompanies.map(e => e.exitAmountNum).filter(n => n > 0)

      const totalCount = categoryExits.length
      const exitCount = exitedCompanies.length
      const exitRate = totalCount > 0 ? (exitCount / totalCount) * 100 : 0
      const avgExitAmount = exitAmounts.length > 0
        ? exitAmounts.reduce((sum, n) => sum + n, 0) / exitAmounts.length
        : 0
      const medianExitAmount = median(exitAmounts)
      const maxExitAmount = exitAmounts.length > 0 ? Math.max(...exitAmounts) : 0
      const topExitCompany = exitedCompanies.sort((a, b) => b.exitAmountNum - a.exitAmountNum)[0]

      return {
        category,
        label: categoryLabels[category],
        totalCount,
        exitCount,
        exitRate,
        avgExitAmount,
        medianExitAmount,
        maxExitAmount,
        topExitCompany,
      }
    })
    .filter(c => c.totalCount > 0)
    .sort((a, b) => b.exitRate - a.exitRate) // EXIT率でソート
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">US B2B SaaS Dashboard</h1>
            <nav className="flex gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/exits" className="text-gray-600 hover:text-gray-900">ケーススタディ</Link>
              <Link href="/opportunities" className="text-blue-600 font-medium">機会分析</Link>
              <Link href="/sources" className="text-gray-600 hover:text-gray-900">情報収集</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">日本参入機会分析</h2>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6 sticky top-[73px] z-10">
          <div className="grid md:grid-cols-5 gap-4">
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
            <MultiSelectFilter
              label="ステータス"
              options={statusLabels}
              selected={statusFilters}
              onChange={setStatusFilters}
            />
            <div className="flex flex-col justify-end">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{filteredExits.length}件表示</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    クリア
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Opportunity Matrix */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h3 className="font-bold text-lg mb-2">優先度マトリクス</h3>
          <p className="text-sm text-gray-500 mb-4">
            右上エリア（類似なし × 参入難易度低〜中）が最も有望な領域 | クリックで詳細へ
          </p>
          <OpportunityMatrix data={filteredExits} />
        </div>

        {/* Category EXIT Analysis */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 p-6 mb-8">
          <h3 className="font-bold text-lg text-orange-800 mb-2">カテゴリ別EXIT分析</h3>
          <p className="text-sm text-gray-600 mb-4">
            どのカテゴリがEXITしやすいか？EXIT率・金額の中央値/平均値で比較
          </p>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-xs text-gray-500">最もEXIT率が高い</p>
              <p className="font-bold text-lg text-orange-600">{categoryExitAnalysis[0]?.label || '-'}</p>
              <p className="text-sm text-gray-600">{categoryExitAnalysis[0]?.exitRate.toFixed(0)}%</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-xs text-gray-500">平均EXIT金額が最大</p>
              {(() => {
                const maxAvg = [...categoryExitAnalysis].sort((a, b) => b.avgExitAmount - a.avgExitAmount)[0]
                return (
                  <>
                    <p className="font-bold text-lg text-orange-600">{maxAvg?.label || '-'}</p>
                    <p className="text-sm text-gray-600">${(maxAvg?.avgExitAmount / 1000000).toFixed(0)}M</p>
                  </>
                )
              })()}
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-xs text-gray-500">中央値EXIT金額が最大</p>
              {(() => {
                const maxMedian = [...categoryExitAnalysis].sort((a, b) => b.medianExitAmount - a.medianExitAmount)[0]
                return (
                  <>
                    <p className="font-bold text-lg text-orange-600">{maxMedian?.label || '-'}</p>
                    <p className="text-sm text-gray-600">${(maxMedian?.medianExitAmount / 1000000).toFixed(0)}M</p>
                  </>
                )
              })()}
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-xs text-gray-500">EXIT件数が最多</p>
              {(() => {
                const maxCount = [...categoryExitAnalysis].sort((a, b) => b.exitCount - a.exitCount)[0]
                return (
                  <>
                    <p className="font-bold text-lg text-orange-600">{maxCount?.label || '-'}</p>
                    <p className="text-sm text-gray-600">{maxCount?.exitCount}件</p>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Detail Table */}
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-orange-100">
                <tr>
                  <th className="text-left p-3 font-medium">カテゴリ</th>
                  <th className="text-center p-3 font-medium">事例数</th>
                  <th className="text-center p-3 font-medium">EXIT数</th>
                  <th className="text-center p-3 font-medium">EXIT率</th>
                  <th className="text-right p-3 font-medium">平均EXIT金額</th>
                  <th className="text-right p-3 font-medium">中央値EXIT金額</th>
                  <th className="text-left p-3 font-medium">最大EXIT</th>
                </tr>
              </thead>
              <tbody>
                {categoryExitAnalysis.map((cat, index) => (
                  <tr key={cat.category} className={`border-t ${index === 0 ? 'bg-orange-50' : ''}`}>
                    <td className="p-3 font-medium">
                      {index === 0 && <span className="text-orange-500 mr-1">🏆</span>}
                      {cat.label}
                    </td>
                    <td className="p-3 text-center text-gray-600">{cat.totalCount}件</td>
                    <td className="p-3 text-center text-gray-600">{cat.exitCount}件</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        cat.exitRate >= 50 ? 'bg-emerald-100 text-emerald-800' :
                        cat.exitRate >= 30 ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {cat.exitRate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {cat.avgExitAmount > 0 ? `$${(cat.avgExitAmount / 1000000).toFixed(0)}M` : '-'}
                    </td>
                    <td className="p-3 text-right font-medium text-orange-600">
                      {cat.medianExitAmount > 0 ? `$${(cat.medianExitAmount / 1000000).toFixed(0)}M` : '-'}
                    </td>
                    <td className="p-3">
                      {cat.topExitCompany ? (
                        <Link
                          href={`/exits/${cat.topExitCompany.id}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          {cat.topExitCompany.company} ({cat.topExitCompany.exitAmount})
                        </Link>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bar Chart Visualization */}
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">EXIT率比較（高い順）</p>
            <div className="space-y-2">
              {categoryExitAnalysis.map((cat, index) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="w-32 text-sm truncate">{cat.label}</span>
                  <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-orange-500' :
                        cat.exitRate >= 50 ? 'bg-emerald-500' :
                        cat.exitRate >= 30 ? 'bg-amber-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${cat.exitRate}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm text-right font-medium">{cat.exitRate.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growing Companies Section */}
        {growingCompanies.length > 0 && (
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-6 mb-8">
            <h3 className="font-bold text-lg text-purple-800 mb-4">
              成長中企業の機会（評価額$1B以上）
            </h3>
            <div className="space-y-3">
              {growingCompanies.slice(0, 8).map((company) => (
                <Link
                  key={company.id}
                  href={`/exits/${company.id}`}
                  className="flex items-center gap-4 bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{company.company}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        company.status === 'growing' ? 'bg-blue-100 text-blue-800' :
                        company.status === 'ipo_planned' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {statusLabels[company.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{company.coreValue}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{company.valuation}</p>
                    <p className={`text-xs ${
                      company.japanStatus === 'none' ? 'text-emerald-600' :
                      company.japanStatus === 'small' ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      日本: {japanStatusLabels[company.japanStatus]}
                    </p>
                  </div>
                  {/* Valuation Bar */}
                  <div className="w-32 hidden md:block">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          company.japanStatus === 'none' ? 'bg-emerald-500' :
                          company.japanStatus === 'small' ? 'bg-amber-500' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${Math.min((company.valuationNum / 70) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-1">
                      ${company.valuationNum}B
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category Analysis */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">カテゴリ別分析</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryAnalysis.map(({
              category,
              label,
              total,
              highOpportunity,
              growingCount,
              discoveryCount,
              avgScore,
              maxValuation,
              topCompanies
            }) => (
              <div key={category} className="border rounded-lg p-4">
                <h4 className="font-bold text-blue-600">{label}</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-gray-500">事例数:</span> {total}件</p>
                  <p><span className="text-gray-500">高機会:</span> <span className="text-emerald-600 font-medium">{highOpportunity}件</span></p>
                  <p><span className="text-gray-500">成長中/IPO予定:</span> {growingCount}件</p>
                  <p><span className="text-gray-500">発見:</span> {discoveryCount}件</p>
                  <p>
                    <span className="text-gray-500">平均スコア:</span>{' '}
                    <span className={`font-medium ${
                      avgScore >= 70 ? 'text-emerald-600' :
                      avgScore >= 50 ? 'text-amber-600' :
                      'text-gray-600'
                    }`}>
                      {avgScore.toFixed(0)}点
                    </span>
                  </p>
                  {maxValuation && (
                    <p><span className="text-gray-500">最高評価額:</span> {maxValuation.company} ({maxValuation.valuation})</p>
                  )}
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
          <h3 className="font-bold text-lg text-emerald-800 mb-4">
            高機会ランキング（スコア順）
          </h3>
          <div className="space-y-3">
            {highOpportunityExits.slice(0, 10).map((exit, index) => (
              <Link
                key={exit.id}
                href={`/exits/${exit.id}`}
                className="flex items-center gap-4 bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <span className="text-2xl font-bold text-emerald-600 w-8">{index + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold">{exit.company}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      exit.status === 'exit' ? 'bg-gray-100 text-gray-800' :
                      exit.status === 'growing' ? 'bg-blue-100 text-blue-800' :
                      exit.status === 'discovery' ? 'bg-teal-100 text-teal-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {statusLabels[exit.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{exit.coreValue}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">
                    {exit.status === 'exit' ? exit.exitAmount : exit.valuation || '-'}
                  </p>
                  <p className={`text-sm ${
                    exit.entryDifficulty === 'low' ? 'text-emerald-600' :
                    exit.entryDifficulty === 'medium' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    難易度: {entryDifficultyLabels[exit.entryDifficulty]}
                  </p>
                </div>
                {/* Score Badge */}
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  exit.score >= 80 ? 'bg-emerald-500 text-white' :
                  exit.score >= 60 ? 'bg-emerald-400 text-white' :
                  exit.score >= 40 ? 'bg-amber-400 text-white' :
                  'bg-gray-300 text-gray-700'
                }`}>
                  {exit.score}点
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recommendations (Data-driven) */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="font-bold text-lg text-blue-800 mb-4">推奨アクション</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-blue-700 mb-2">
                即座に参入検討すべき領域（スコア70+、難易度低〜中）
              </h4>
              {immediateOpportunities.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {immediateOpportunities.map((exit) => (
                    <li key={exit.id} className="flex items-start gap-2">
                      <span className="text-emerald-500">●</span>
                      <span>
                        <Link href={`/exits/${exit.id}`} className="font-medium hover:underline">
                          {exit.company}
                        </Link>
                        {' - '}{exit.coreValue}
                        <span className="text-gray-500 ml-1">({exit.score}点)</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">フィルター条件に該当する企業がありません</p>
              )}
            </div>
            <div>
              <h4 className="font-bold text-blue-700 mb-2">
                中長期で注視すべき領域（スコア50+、難易度高）
              </h4>
              {mediumTermOpportunities.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {mediumTermOpportunities.map((exit) => (
                    <li key={exit.id} className="flex items-start gap-2">
                      <span className="text-amber-500">●</span>
                      <span>
                        <Link href={`/exits/${exit.id}`} className="font-medium hover:underline">
                          {exit.company}
                        </Link>
                        {' - '}{exit.coreValue}
                        <span className="text-gray-500 ml-1">({exit.score}点)</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">フィルター条件に該当する企業がありません</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
