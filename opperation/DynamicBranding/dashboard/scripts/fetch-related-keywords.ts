/**
 * 関連キーワード取得スクリプト (SerpAPI版)
 *
 * SerpAPIを使用してGoogle Trendsから関連キーワードを取得し、
 * Supabaseに投入します。
 *
 * 使用方法:
 *   cd dashboard
 *   npx tsx scripts/fetch-related-keywords.ts
 *
 * オプション:
 *   --dry-run  APIを呼ばず、モックデータで動作確認
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// .env.local を読み込み
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// ========================================
// 設定
// ========================================

const CONFIG = {
  serpApiKey: process.env.SERPAPI_KEY || '',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // ブランド一覧
  brands: [
    'ほんだし',
    'クックドゥ',
    '味の素',
    '丸鶏がらスープ',
    '香味ペースト',
    'コンソメ',
    'ピュアセレクト',
    'アジシオ',
  ],

  // SerpAPI設定
  date: 'today 12-m', // 過去12ヶ月
  geo: 'JP',
  hl: 'ja',

  // レート制限対策
  delayBetweenRequests: 2000, // 2秒
}

// ========================================
// 型定義
// ========================================

interface RelatedQuery {
  query: string
  value: string
  extracted_value: number | null
  link?: string
}

interface SerpAPIRelatedQueriesResponse {
  related_queries?: {
    rising?: RelatedQuery[]
    top?: RelatedQuery[]
  }
  error?: string
}

interface BrandKeyword {
  brand_id: number
  keyword: string
  query_type: 'rising' | 'top'
  value: string
  extracted_value: number | null
  rank: number
  fetch_date: string
}

// ========================================
// SerpAPI リクエスト
// ========================================

async function fetchRelatedQueries(brand: string): Promise<SerpAPIRelatedQueriesResponse> {
  const params = new URLSearchParams({
    engine: 'google_trends',
    q: brand,
    data_type: 'RELATED_QUERIES',
    date: CONFIG.date,
    geo: CONFIG.geo,
    hl: CONFIG.hl,
    api_key: CONFIG.serpApiKey,
  })

  const url = `https://serpapi.com/search?${params.toString()}`
  console.log(`  Fetching: ${brand}`)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// ========================================
// モックデータ（dry-run用）
// ========================================

function generateMockData(brand: string): SerpAPIRelatedQueriesResponse {
  const risingKeywords = [
    `${brand} レシピ`,
    `${brand} 味噌汁`,
    `${brand} 使い方`,
    `${brand} 代用`,
    `${brand} 料理`,
    `${brand} 簡単`,
    `${brand} おすすめ`,
    `${brand} 人気`,
    `${brand} アレンジ`,
    `${brand} 時短`,
  ]

  const topKeywords = [
    `${brand}`,
    'だし',
    '調味料',
    'レシピ',
    '味噌汁',
    '和食',
    '簡単料理',
    '時短レシピ',
    '一人暮らし 料理',
    '晩ごはん',
  ]

  return {
    related_queries: {
      rising: risingKeywords.map((query, i) => ({
        query,
        value: i === 0 ? 'Breakout' : `+${(10 - i) * 50}%`,
        extracted_value: i === 0 ? null : (10 - i) * 50,
      })),
      top: topKeywords.map((query, i) => ({
        query,
        value: String(100 - i * 10),
        extracted_value: 100 - i * 10,
      })),
    },
  }
}

// ========================================
// データ変換
// ========================================

function parseRelatedQueries(
  brandId: number,
  response: SerpAPIRelatedQueriesResponse,
  fetchDate: string
): BrandKeyword[] {
  const keywords: BrandKeyword[] = []

  // Rising queries
  if (response.related_queries?.rising) {
    response.related_queries.rising.forEach((q, index) => {
      keywords.push({
        brand_id: brandId,
        keyword: q.query,
        query_type: 'rising',
        value: q.value,
        extracted_value: q.extracted_value,
        rank: index + 1,
        fetch_date: fetchDate,
      })
    })
  }

  // Top queries
  if (response.related_queries?.top) {
    response.related_queries.top.forEach((q, index) => {
      keywords.push({
        brand_id: brandId,
        keyword: q.query,
        query_type: 'top',
        value: q.value,
        extracted_value: q.extracted_value,
        rank: index + 1,
        fetch_date: fetchDate,
      })
    })
  }

  return keywords
}

// ========================================
// 共起計算
// ========================================

function calculateCooccurrences(
  allKeywords: BrandKeyword[],
  analysisDate: string
): { keyword: string; brand_ids: number[]; brand_count: number; total_score: number; analysis_date: string }[] {
  // キーワードごとにブランドをグループ化
  const keywordBrands = new Map<string, Set<number>>()
  const keywordScores = new Map<string, number>()

  allKeywords.forEach((kw) => {
    if (!keywordBrands.has(kw.keyword)) {
      keywordBrands.set(kw.keyword, new Set())
      keywordScores.set(kw.keyword, 0)
    }
    keywordBrands.get(kw.keyword)!.add(kw.brand_id)
    keywordScores.set(kw.keyword, keywordScores.get(kw.keyword)! + (kw.extracted_value || 0))
  })

  // 2ブランド以上で出現するキーワードのみ抽出
  return Array.from(keywordBrands.entries())
    .filter(([_, brands]) => brands.size >= 2)
    .map(([keyword, brands]) => ({
      keyword,
      brand_ids: Array.from(brands).sort((a, b) => a - b),
      brand_count: brands.size,
      total_score: keywordScores.get(keyword) || 0,
      analysis_date: analysisDate,
    }))
}

// ========================================
// Supabase投入
// ========================================

async function insertToSupabase(keywords: BrandKeyword[], cooccurrences: ReturnType<typeof calculateCooccurrences>) {
  const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceKey)

  // 既存データ削除（同日のデータがあれば上書き）
  const fetchDate = keywords[0]?.fetch_date
  if (fetchDate) {
    await supabase.from('related_keywords').delete().eq('fetch_date', fetchDate)
    await supabase.from('keyword_cooccurrences').delete().eq('analysis_date', fetchDate)
  }

  // キーワード投入
  const { error: kwError } = await supabase.from('related_keywords').insert(keywords as never)
  if (kwError) {
    throw new Error(`Failed to insert keywords: ${kwError.message}`)
  }
  console.log(`  Inserted ${keywords.length} keywords`)

  // 共起データ投入
  if (cooccurrences.length > 0) {
    const { error: coError } = await supabase.from('keyword_cooccurrences').insert(cooccurrences as never)
    if (coError) {
      throw new Error(`Failed to insert cooccurrences: ${coError.message}`)
    }
    console.log(`  Inserted ${cooccurrences.length} cooccurrences`)
  }
}

// ========================================
// メイン処理
// ========================================

async function main(): Promise<void> {
  const isDryRun = process.argv.includes('--dry-run')

  console.log('========================================')
  console.log('Related Keywords Fetcher (SerpAPI)')
  console.log('========================================')
  console.log(`Mode: ${isDryRun ? 'DRY RUN (mock data)' : 'LIVE (API calls)'}`)

  if (!isDryRun && !CONFIG.serpApiKey) {
    throw new Error('SERPAPI_KEY is not set in environment variables')
  }

  if (!CONFIG.supabaseUrl || !CONFIG.supabaseServiceKey) {
    throw new Error('Supabase credentials are not set')
  }

  // Supabaseからブランド情報を取得
  const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceKey)
  const { data: brands, error: brandError } = await supabase
    .from('brands')
    .select('id, name')
    .order('id')

  if (brandError || !brands) {
    throw new Error(`Failed to fetch brands: ${brandError?.message}`)
  }

  console.log(`\nBrands: ${brands.map((b) => b.name).join(', ')}`)

  const fetchDate = new Date().toISOString().split('T')[0]
  const allKeywords: BrandKeyword[] = []

  // 各ブランドの関連キーワードを取得
  for (let i = 0; i < brands.length; i++) {
    const brand = brands[i]
    console.log(`\n[${i + 1}/${brands.length}] Processing ${brand.name}`)

    let response: SerpAPIRelatedQueriesResponse

    if (isDryRun) {
      response = generateMockData(brand.name)
    } else {
      response = await fetchRelatedQueries(brand.name)

      if (response.error) {
        console.error(`  Error: ${response.error}`)
        continue
      }

      // レート制限対策
      if (i < brands.length - 1) {
        console.log(`  Waiting ${CONFIG.delayBetweenRequests / 1000}s...`)
        await new Promise((resolve) => setTimeout(resolve, CONFIG.delayBetweenRequests))
      }
    }

    const keywords = parseRelatedQueries(brand.id, response, fetchDate)
    allKeywords.push(...keywords)

    console.log(`  Rising: ${response.related_queries?.rising?.length || 0}`)
    console.log(`  Top: ${response.related_queries?.top?.length || 0}`)
  }

  // 共起計算
  console.log('\n========================================')
  console.log('Calculating cooccurrences')
  console.log('========================================')

  const cooccurrences = calculateCooccurrences(allKeywords, fetchDate)
  console.log(`Found ${cooccurrences.length} keywords appearing in 2+ brands`)

  // Supabase投入
  console.log('\n========================================')
  console.log('Inserting to Supabase')
  console.log('========================================')

  await insertToSupabase(allKeywords, cooccurrences)

  // 統計情報
  console.log('\n========================================')
  console.log('Summary')
  console.log('========================================')
  console.log(`Total keywords: ${allKeywords.length}`)
  console.log(`  Rising: ${allKeywords.filter((k) => k.query_type === 'rising').length}`)
  console.log(`  Top: ${allKeywords.filter((k) => k.query_type === 'top').length}`)
  console.log(`Cooccurrences: ${cooccurrences.length}`)
  console.log(`Fetch date: ${fetchDate}`)

  console.log('\n========================================')
  console.log('Done!')
  console.log('========================================')
}

// 実行
main().catch((error) => {
  console.error('Error:', error.message)
  process.exit(1)
})
