// 取得したデータを読み込む
import ycData from './sources/yc.json'
import techcrunchData from './sources/techcrunch.json'
import indieHackersData from './sources/indie-hackers.json'

export type SourceType = 'yc' | 'techcrunch' | 'indie-hackers' | 'product-hunt'

export interface StartupIdea {
  id: string
  source: SourceType
  name: string
  description: string
  url: string
  metrics?: {
    revenue?: string
    votes?: number
    funding?: string
    teamSize?: number
    batch?: string
    publishedAt?: string
    category?: string
    commentsCount?: number
    featuredAt?: string
  }
  category?: string
  tags?: string[]
  japanExists: boolean
  fetchedAt: string
}

export interface SourceInfo {
  id: SourceType
  name: string
  nameJa: string
  description: string
  url: string
  method: 'api' | 'rss' | 'scraping'
  icon: string
}

export const sources: SourceInfo[] = [
  {
    id: 'yc',
    name: 'Y Combinator',
    nameJa: 'Yコンビネーター',
    description: 'シリコンバレー最大のスタートアップアクセラレーター。Airbnb、Stripe、Dropboxなどを輩出。',
    url: 'https://www.ycombinator.com/companies',
    method: 'api',
    icon: '🚀',
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    nameJa: 'テッククランチ',
    description: 'スタートアップ・テクノロジーニュースの最大手メディア。資金調達情報が充実。',
    url: 'https://techcrunch.com/',
    method: 'rss',
    icon: '📰',
  },
  {
    id: 'indie-hackers',
    name: 'Indie Hackers',
    nameJa: 'インディーハッカーズ',
    description: '個人開発者・スモールビジネスのコミュニティ。収益公開文化が特徴。',
    url: 'https://www.indiehackers.com/',
    method: 'scraping',
    icon: '💻',
  },
  {
    id: 'product-hunt',
    name: 'Product Hunt',
    nameJa: 'プロダクトハント',
    description: '新しいプロダクトの発見プラットフォーム。毎日のランキングで話題のサービスがわかる。',
    url: 'https://www.producthunt.com/',
    method: 'api',
    icon: '🔥',
  },
]

// JSONデータを型変換
const typedYcData = ycData as unknown as StartupIdea[]
const typedTechcrunchData = techcrunchData as unknown as StartupIdea[]
const typedIndieHackersData = indieHackersData as unknown as StartupIdea[]

// 全アイデアを統合
export const ideas: StartupIdea[] = [
  ...typedYcData,
  ...typedTechcrunchData,
  ...typedIndieHackersData,
]

// ソース別のアイデア数を取得
export function getIdeasBySource(): Record<SourceType, number> {
  return ideas.reduce(
    (acc, idea) => {
      acc[idea.source] = (acc[idea.source] || 0) + 1
      return acc
    },
    {} as Record<SourceType, number>
  )
}

// ソースIDからソース情報を取得
export function getSourceInfo(sourceId: SourceType): SourceInfo | undefined {
  return sources.find((s) => s.id === sourceId)
}

// 最新のアイデアを取得
export function getLatestIdeas(limit = 20): StartupIdea[] {
  return [...ideas]
    .sort((a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime())
    .slice(0, limit)
}

// ソースでフィルター
export function getIdeasBySourceFilter(sourceId: SourceType): StartupIdea[] {
  return ideas.filter((idea) => idea.source === sourceId)
}
