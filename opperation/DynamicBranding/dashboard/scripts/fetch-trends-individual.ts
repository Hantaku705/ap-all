/**
 * Google Trends データ取得スクリプト (個別検索版)
 *
 * 各ブランドを個別に検索し、独立した0-100スコアを取得します。
 * これにより、低ボリュームブランドでも有意な変動が見えるようになります。
 *
 * 使用方法:
 *   cd dashboard
 *   npx tsx scripts/fetch-trends-individual.ts
 *
 * 注意: 8回のAPIコールが必要です（月100回の無料枠内）
 */

import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

// ========================================
// 設定
// ========================================

const CONFIG = {
  apiKey: process.env.SERPAPI_KEY || '',

  // 8ブランド（個別検索）
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

  // 期間設定
  date: 'today 5-y', // 過去5年
  geo: 'JP',

  // 出力設定
  outputDir: path.join(__dirname, '../../data/trends'),
  tempDir: path.join(__dirname, '../../data/trends/temp'),
  outputFile: 'google-trends-data.csv',

  // レート制限対策
  delayBetweenRequests: 3000, // 3秒
}

// ========================================
// SerpAPI リクエスト
// ========================================

interface SerpAPITimelineData {
  date: string
  values: { query: string; value: string; extracted_value: number }[]
}

interface SerpAPIResponse {
  interest_over_time?: {
    timeline_data?: SerpAPITimelineData[]
  }
  error?: string
}

async function fetchSingleBrandData(brand: string): Promise<SerpAPIResponse> {
  const params = new URLSearchParams({
    engine: 'google_trends',
    q: brand,
    data_type: 'TIMESERIES',
    date: CONFIG.date,
    geo: CONFIG.geo,
    api_key: CONFIG.apiKey,
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
// データ変換
// ========================================

interface BrandTimeline {
  brand: string
  data: Map<string, number> // date -> value
}

function parseTimelineData(response: SerpAPIResponse, brand: string): BrandTimeline {
  const data = new Map<string, number>()

  if (!response.interest_over_time?.timeline_data) {
    return { brand, data }
  }

  for (const item of response.interest_over_time.timeline_data) {
    const date = convertDateFormat(item.date)
    const value = item.values[0]?.extracted_value ?? 0
    data.set(date, value)
  }

  return { brand, data }
}

// ========================================
// 日付変換（週次フォーマット）
// ========================================

function convertDateFormat(dateStr: string): string {
  // すでにISO形式の場合
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }

  // "Jan 10 – 16, 2021" 形式の場合
  const match = dateStr.match(/(\w+)\s+(\d+).*?(\d{4})/)
  if (match) {
    const months: Record<string, string> = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04',
      May: '05', Jun: '06', Jul: '07', Aug: '08',
      Sep: '09', Oct: '10', Nov: '11', Dec: '12',
    }
    const month = months[match[1]] || '01'
    const day = match[2].padStart(2, '0')
    const year = match[3]
    return `${year}-${month}-${day}`
  }

  return dateStr
}

// ========================================
// データマージ
// ========================================

interface TrendRow {
  date: string
  [brand: string]: string | number
}

function mergeAllBrands(timelines: BrandTimeline[]): TrendRow[] {
  // すべての日付を収集
  const allDates = new Set<string>()
  for (const timeline of timelines) {
    for (const date of timeline.data.keys()) {
      allDates.add(date)
    }
  }

  // 日付でソート
  const sortedDates = Array.from(allDates).sort()

  // マージ
  return sortedDates.map((date) => {
    const row: TrendRow = { date }
    for (const timeline of timelines) {
      row[timeline.brand] = timeline.data.get(date) ?? 0
    }
    return row
  })
}

// ========================================
// CSV出力
// ========================================

function saveMergedCSV(data: TrendRow[], outputPath: string): void {
  const header = ['date', ...CONFIG.brands].join(',')
  const rows = data.map((row) => {
    const values = [row.date, ...CONFIG.brands.map((b) => row[b] ?? 0)]
    return values.join(',')
  })

  const csv = [header, ...rows].join('\n')
  fs.writeFileSync(outputPath, csv, 'utf-8')
  console.log(`\nCSV saved: ${outputPath}`)
  console.log(`  Total rows: ${data.length}`)
}

// ========================================
// メイン処理
// ========================================

async function main(): Promise<void> {
  console.log('========================================')
  console.log('Google Trends - Individual Brand Fetch')
  console.log('========================================')

  if (!CONFIG.apiKey) {
    throw new Error('SERPAPI_KEY is not set in environment variables')
  }

  console.log(`Date range: ${CONFIG.date}`)
  console.log(`Region: ${CONFIG.geo}`)
  console.log(`Brands: ${CONFIG.brands.length}`)
  console.log(`API calls needed: ${CONFIG.brands.length}`)

  // ディレクトリ作成
  fs.mkdirSync(CONFIG.tempDir, { recursive: true })
  fs.mkdirSync(CONFIG.outputDir, { recursive: true })

  const timelines: BrandTimeline[] = []

  // 各ブランドのデータを個別取得
  for (let i = 0; i < CONFIG.brands.length; i++) {
    const brand = CONFIG.brands[i]
    console.log(`\n[${i + 1}/${CONFIG.brands.length}] ${brand}`)

    try {
      const response = await fetchSingleBrandData(brand)

      if (response.error) {
        console.error(`  Error: ${response.error}`)
        continue
      }

      const timeline = parseTimelineData(response, brand)
      console.log(`  Retrieved ${timeline.data.size} data points`)

      // 統計情報
      const values = Array.from(timeline.data.values())
      const min = Math.min(...values)
      const max = Math.max(...values)
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      console.log(`  Range: ${min}-${max}, Avg: ${avg.toFixed(1)}`)

      // 一時ファイルに保存（デバッグ用）
      const tempPath = path.join(CONFIG.tempDir, `${brand}_individual.json`)
      fs.writeFileSync(tempPath, JSON.stringify(response, null, 2))

      timelines.push(timeline)

      // レート制限対策
      if (i < CONFIG.brands.length - 1) {
        console.log(`  Waiting ${CONFIG.delayBetweenRequests / 1000}s...`)
        await new Promise((resolve) => setTimeout(resolve, CONFIG.delayBetweenRequests))
      }
    } catch (error) {
      console.error(`  Failed: ${error}`)
    }
  }

  // データマージ
  console.log('\n========================================')
  console.log('Merging all brands')
  console.log('========================================')

  const mergedData = mergeAllBrands(timelines)
  const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile)
  saveMergedCSV(mergedData, outputPath)

  // 最終統計
  console.log('\n========================================')
  console.log('Final Data Summary')
  console.log('========================================')
  for (const brand of CONFIG.brands) {
    const values = mergedData.map((r) => Number(r[brand]) || 0)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const status = max > 10 ? '✓' : '△'
    console.log(`  ${status} ${brand}: min=${min}, max=${max}, avg=${avg.toFixed(1)}`)
  }

  console.log('\n========================================')
  console.log('Done!')
  console.log('========================================')
}

// 実行
main().catch((error) => {
  console.error('Error:', error.message)
  process.exit(1)
})
