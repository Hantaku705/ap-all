/**
 * Google Trends データ取得スクリプト (SerpAPI版)
 *
 * SerpAPIを使用してGoogle Trendsからデータを取得し、
 * ブリッジキーワードでスコアを統一してCSVにマージします。
 *
 * 使用方法:
 *   cd dashboard
 *   npx tsx scripts/fetch-trends-serpapi.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

// ========================================
// 設定
// ========================================

const CONFIG = {
  apiKey: process.env.SERPAPI_KEY || '',

  // ブランドグループ（ブリッジキーワード: ほんだし）
  groups: [
    {
      name: 'group1',
      keywords: ['コンソメ', '味の素', 'ほんだし', 'クックドゥ', '香味ペースト'],
    },
    {
      name: 'group2',
      keywords: ['ほんだし', '丸鶏がらスープ', 'ピュアセレクト', 'アジシオ'],
    },
  ],
  bridgeKeyword: 'ほんだし',

  // 期間設定
  date: 'today 5-y', // 過去5年
  geo: 'JP',

  // 出力設定
  outputDir: path.join(__dirname, '../../data/trends'),
  tempDir: path.join(__dirname, '../../data/trends/temp'),
  outputFile: 'google-trends-data.csv',

  // レート制限対策
  delayBetweenRequests: 2000, // 2秒
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

async function fetchTrendsData(keywords: string[]): Promise<SerpAPIResponse> {
  const params = new URLSearchParams({
    engine: 'google_trends',
    q: keywords.join(','),
    data_type: 'TIMESERIES',
    date: CONFIG.date,
    geo: CONFIG.geo,
    api_key: CONFIG.apiKey,
  })

  const url = `https://serpapi.com/search?${params.toString()}`
  console.log(`Fetching: ${keywords.join(', ')}`)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// ========================================
// データ変換
// ========================================

interface TrendRow {
  date: string
  [brand: string]: string | number
}

function parseTimelineData(data: SerpAPITimelineData[], keywords: string[]): TrendRow[] {
  return data.map((item) => {
    const row: TrendRow = { date: item.date }

    item.values.forEach((v) => {
      // クエリ名からブランド名を取得
      const brand = keywords.find((k) => v.query.includes(k)) || v.query
      row[brand] = v.extracted_value
    })

    return row
  })
}

// ========================================
// ブリッジ正規化
// ========================================

function normalizeWithBridge(
  group1Data: TrendRow[],
  group2Data: TrendRow[],
  bridgeKeyword: string
): TrendRow[] {
  // ブリッジキーワードの平均スコアを計算
  const bridge1Values = group1Data.map((row) => Number(row[bridgeKeyword]) || 0)
  const bridge2Values = group2Data.map((row) => Number(row[bridgeKeyword]) || 0)

  const bridge1Avg = bridge1Values.reduce((a, b) => a + b, 0) / bridge1Values.length
  const bridge2Avg = bridge2Values.reduce((a, b) => a + b, 0) / bridge2Values.length

  const scaleFactor = bridge2Avg === 0 ? 1 : bridge1Avg / bridge2Avg

  console.log(`\nBridge normalization:`)
  console.log(`  Group1 "${bridgeKeyword}" avg: ${bridge1Avg.toFixed(2)}`)
  console.log(`  Group2 "${bridgeKeyword}" avg: ${bridge2Avg.toFixed(2)}`)
  console.log(`  Scale factor: ${scaleFactor.toFixed(4)}`)

  // 日付でインデックスを作成
  const group2ByDate = new Map<string, TrendRow>()
  group2Data.forEach((row) => {
    group2ByDate.set(row.date, row)
  })

  // マージ
  return group1Data.map((row1) => {
    const row2 = group2ByDate.get(row1.date)
    const merged: TrendRow = { ...row1 }

    if (row2) {
      // Group2のブランド（ブリッジ以外）を正規化して追加
      for (const [key, value] of Object.entries(row2)) {
        if (key === 'date' || key === bridgeKeyword) continue
        merged[key] = Math.round(Number(value) * scaleFactor)
      }
    }

    return merged
  })
}

// ========================================
// 日付変換（週次フォーマット）
// ========================================

function convertDateFormat(dateStr: string): string {
  // SerpAPIの日付形式: "Jan 10 – 16, 2021" または "2021-01-10"

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
// CSV出力
// ========================================

function saveMergedCSV(data: TrendRow[], outputPath: string): void {
  // 列順序を既存フォーマットに合わせる
  const brands = [
    'ほんだし',
    'クックドゥ',
    '味の素',
    '丸鶏がらスープ',
    '香味ペースト',
    'コンソメ',
    'ピュアセレクト',
    'アジシオ',
  ]

  const header = ['date', ...brands].join(',')
  const rows = data.map((row) => {
    const date = convertDateFormat(row.date as string)
    const values = [date, ...brands.map((b) => row[b] ?? 0)]
    return values.join(',')
  })

  const csv = [header, ...rows].join('\n')
  fs.writeFileSync(outputPath, csv, 'utf-8')
  console.log(`\nMerged CSV saved: ${outputPath}`)
  console.log(`  Total rows: ${data.length}`)
}

// ========================================
// メイン処理
// ========================================

async function main(): Promise<void> {
  console.log('========================================')
  console.log('Google Trends Data Fetcher (SerpAPI)')
  console.log('========================================')

  if (!CONFIG.apiKey) {
    throw new Error('SERPAPI_KEY is not set in environment variables')
  }

  console.log(`Date range: ${CONFIG.date}`)
  console.log(`Region: ${CONFIG.geo}`)
  console.log(`Groups: ${CONFIG.groups.length}`)
  console.log(`Bridge keyword: ${CONFIG.bridgeKeyword}`)

  // ディレクトリ作成
  fs.mkdirSync(CONFIG.tempDir, { recursive: true })
  fs.mkdirSync(CONFIG.outputDir, { recursive: true })

  const groupData: TrendRow[][] = []

  // 各グループのデータを取得
  for (let i = 0; i < CONFIG.groups.length; i++) {
    const group = CONFIG.groups[i]
    console.log(`\n========================================`)
    console.log(`[${i + 1}/${CONFIG.groups.length}] Processing ${group.name}`)
    console.log(`Keywords: ${group.keywords.join(', ')}`)
    console.log(`========================================`)

    const response = await fetchTrendsData(group.keywords)

    if (response.error) {
      throw new Error(`SerpAPI error: ${response.error}`)
    }

    if (!response.interest_over_time?.timeline_data) {
      console.log('Response:', JSON.stringify(response, null, 2).slice(0, 500))
      throw new Error('No timeline data in response')
    }

    const data = parseTimelineData(
      response.interest_over_time.timeline_data,
      group.keywords
    )

    console.log(`  Retrieved ${data.length} data points`)

    // 一時ファイルに保存（デバッグ用）
    const tempPath = path.join(CONFIG.tempDir, `${group.name}_serpapi.json`)
    fs.writeFileSync(tempPath, JSON.stringify(response, null, 2))

    groupData.push(data)

    // レート制限対策
    if (i < CONFIG.groups.length - 1) {
      console.log(`\nWaiting ${CONFIG.delayBetweenRequests / 1000}s...`)
      await new Promise((resolve) => setTimeout(resolve, CONFIG.delayBetweenRequests))
    }
  }

  // CSVマージ
  console.log('\n========================================')
  console.log('Merging data')
  console.log('========================================')

  const mergedData = normalizeWithBridge(
    groupData[0],
    groupData[1],
    CONFIG.bridgeKeyword
  )

  const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile)
  saveMergedCSV(mergedData, outputPath)

  // 統計情報を表示
  console.log('\n========================================')
  console.log('Data Summary')
  console.log('========================================')
  const brands = ['ほんだし', 'クックドゥ', '味の素', '丸鶏がらスープ', '香味ペースト', 'コンソメ', 'ピュアセレクト', 'アジシオ']
  for (const brand of brands) {
    const values = mergedData.map((r) => Number(r[brand]) || 0)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    console.log(`  ${brand}: min=${min}, max=${max}, avg=${avg.toFixed(1)}`)
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
