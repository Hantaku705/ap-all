// 取得したデータを読み込む
import ycData from './sources/yc.json'
import techcrunchData from './sources/techcrunch.json'
import indieHackersData from './sources/indie-hackers.json'
import translatedCoreValues from './translated-corevalues.json'
import type { ExitCase, Category, DataSource } from './exits-data'

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

// ============================================
// StartupIdea → ExitCase 変換
// ============================================

// カテゴリ自動分類（キーワードベース）
function classifyCategory(name: string, description: string): Category {
  const text = `${name} ${description}`.toLowerCase()

  // AI/LLM関連
  if (/\b(ai|ml|llm|gpt|machine learning|artificial intelligence|openai|chatgpt|generative)\b/.test(text)) {
    return 'ai'
  }
  // セキュリティ関連
  if (/\b(security|auth|privacy|compliance|encryption|identity|access control)\b/.test(text)) {
    return 'security'
  }
  // HR関連
  if (/\b(hr|hiring|recruit|employee|talent|workforce|payroll|onboarding|performance review)\b/.test(text)) {
    return 'hr'
  }
  // マーケティング関連
  if (/\b(marketing|ads|seo|growth|sales|crm|lead|conversion|advertising|campaign)\b/.test(text)) {
    return 'marketing'
  }
  // FinOps関連
  if (/\b(finance|payment|invoice|expense|billing|accounting|fintech|revenue|subscription)\b/.test(text)) {
    return 'finops'
  }
  // 開発ツール関連
  if (/\b(developer|api|code|deploy|devops|ci\/cd|testing|github|infrastructure|backend|frontend)\b/.test(text)) {
    return 'devtools'
  }
  // ナレッジ関連
  if (/\b(knowledge|docs|wiki|search|documentation|learning|education|content)\b/.test(text)) {
    return 'knowledge'
  }
  // デフォルト
  return 'operations'
}

// coreValue抽出（翻訳済みJSONから取得、なければ先頭30文字）
function extractCoreValue(id: string, description: string): string {
  // 翻訳済みJSONから取得
  const translated = (translatedCoreValues as Record<string, string>)[id]
  if (translated) return translated

  // フォールバック: 先頭30文字
  const cleaned = description.replace(/[\n\r]/g, ' ').trim()
  if (cleaned.length <= 30) return cleaned
  return cleaned.slice(0, 27) + '...'
}

// 金額パース
function parseAmount(metrics?: StartupIdea['metrics']): { amount: string; amountNum: number } {
  if (!metrics) return { amount: '-', amountNum: 0 }

  if (metrics.funding) {
    const funding = metrics.funding
    const match = funding.match(/\$?([\d.]+)\s*(M|B|K)?/i)
    if (match) {
      const value = parseFloat(match[1])
      const unit = (match[2] || '').toUpperCase()
      let num = value
      if (unit === 'B') num = value * 1000000000
      else if (unit === 'M') num = value * 1000000
      else if (unit === 'K') num = value * 1000
      return { amount: funding, amountNum: num }
    }
    return { amount: funding, amountNum: 0 }
  }

  if (metrics.revenue) {
    return { amount: `収益: ${metrics.revenue}`, amountNum: 0 }
  }

  return { amount: '-', amountNum: 0 }
}

// StartupIdea → ExitCase 変換
export function convertToExitCase(idea: StartupIdea): ExitCase {
  const { amount, amountNum } = parseAmount(idea.metrics)
  const sourceMap: Record<SourceType, DataSource> = {
    'yc': 'yc',
    'techcrunch': 'techcrunch',
    'indie-hackers': 'indie-hackers',
    'product-hunt': 'product-hunt',
  }

  return {
    id: idea.id,
    company: idea.name,
    coreValue: extractCoreValue(idea.id, idea.description),
    description: idea.description,
    category: classifyCategory(idea.name, idea.description),
    exitAmount: amount,
    exitAmountNum: amountNum,
    acquirer: '-',
    exitYear: new Date(idea.fetchedAt).getFullYear(),
    japanStatus: idea.japanExists ? 'small' : 'none',
    entryDifficulty: 'medium',
    opportunity: '',
    sourceUrl: idea.url,
    status: 'discovery',
    source: sourceMap[idea.source],
  }
}

// 全アイデアをExitCaseに変換
export const discoveryExits: ExitCase[] = ideas.map(convertToExitCase)
