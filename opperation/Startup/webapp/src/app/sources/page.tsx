'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ideas,
  sources,
  getIdeasBySource,
  type SourceType,
  type StartupIdea,
} from '@/data/sources-data'

function SourceCard({
  source,
  count,
  isActive,
  onClick,
}: {
  source: (typeof sources)[0]
  count: number
  isActive: boolean
  onClick: () => void
}) {
  const methodColors = {
    api: 'bg-green-100 text-green-700',
    rss: 'bg-blue-100 text-blue-700',
    scraping: 'bg-amber-100 text-amber-700',
  }

  return (
    <button
      onClick={onClick}
      className={`text-left w-full p-4 rounded-lg border transition-all ${
        isActive ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{source.icon}</span>
          <div>
            <h3 className="font-bold">{source.name}</h3>
            <p className="text-xs text-gray-500">{source.nameJa}</p>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-xs ${methodColors[source.method]}`}
        >
          {source.method.toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{source.description}</p>
      <div className="flex items-center justify-between mt-3 text-sm">
        <span className="text-blue-600 font-medium">{count}件</span>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600"
          onClick={(e) => e.stopPropagation()}
        >
          サイトを開く →
        </a>
      </div>
    </button>
  )
}

function IdeaCard({ idea }: { idea: StartupIdea }) {
  const source = sources.find((s) => s.id === idea.source)

  return (
    <a
      href={idea.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-900 line-clamp-1">{idea.name}</h3>
        <span className="text-lg flex-shrink-0">{source?.icon || '📦'}</span>
      </div>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
        {idea.description || 'No description'}
      </p>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <span className="bg-gray-100 px-2 py-0.5 rounded">{source?.name}</span>
        {idea.metrics?.batch && (
          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
            {idea.metrics.batch}
          </span>
        )}
        {idea.metrics?.votes && (
          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
            {idea.metrics.votes} votes
          </span>
        )}
        {idea.category && (
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            {idea.category}
          </span>
        )}
      </div>
    </a>
  )
}

export default function SourcesPage() {
  const [selectedSource, setSelectedSource] = useState<SourceType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const ideasBySource = getIdeasBySource()

  // フィルター適用
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSource = selectedSource === 'all' || idea.source === selectedSource
    const matchesSearch =
      !searchQuery ||
      idea.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSource && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">US B2B SaaS EXIT Dashboard</h1>
            <nav className="flex gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/exits" className="text-gray-600 hover:text-gray-900">
                事例一覧
              </Link>
              <Link href="/opportunities" className="text-gray-600 hover:text-gray-900">
                機会分析
              </Link>
              <Link href="/sources" className="text-blue-600 font-medium">
                情報収集
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">情報収集ソース</h2>
          <p className="text-gray-600">
            タイムマシン経営のアイデア探索に使える海外スタートアップ情報ソース
          </p>
        </div>

        {/* Source Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setSelectedSource('all')}
            className={`p-4 rounded-lg border text-left transition-all ${
              selectedSource === 'all'
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-bold">すべて</h3>
                <p className="text-xs text-gray-500">All Sources</p>
              </div>
            </div>
            <p className="text-blue-600 font-medium mt-3">{ideas.length}件</p>
          </button>

          {sources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              count={ideasBySource[source.id] || 0}
              isActive={selectedSource === source.id}
              onClick={() => setSelectedSource(source.id)}
            />
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="キーワードで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredIdeas.length}件のアイデア
            {selectedSource !== 'all' && ` (${sources.find((s) => s.id === selectedSource)?.name})`}
          </p>
        </div>

        {/* Ideas Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.slice(0, 50).map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>

        {filteredIdeas.length > 50 && (
          <p className="text-center text-gray-500 mt-6">
            他 {filteredIdeas.length - 50} 件のアイデア...
          </p>
        )}
      </main>

      <footer className="border-t mt-8 py-6 text-center text-sm text-gray-500">
        <p>
          データ取得: Y Combinator API, TechCrunch RSS, Indie Hackers スクレイピング
        </p>
      </footer>
    </div>
  )
}
