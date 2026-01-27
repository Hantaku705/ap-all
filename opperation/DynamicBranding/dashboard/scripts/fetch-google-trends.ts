/**
 * Google Trends データ自動取得スクリプト
 *
 * Playwrightを使用してGoogle Trendsからデータをダウンロードし、
 * ブリッジキーワードでスコアを統一してCSVにマージします。
 *
 * 使用方法:
 *   cd dashboard
 *   npx tsx scripts/fetch-google-trends.ts
 */

import { chromium, Page, Browser, BrowserContext } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

// ========================================
// 設定
// ========================================

const CONFIG = {
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

  // 期間設定（過去5年）
  startDate: '2021-01-01',
  endDate: new Date().toISOString().split('T')[0], // 今日
  geo: 'JP',
  language: 'ja',

  // 出力設定
  outputDir: path.join(__dirname, '../../data/trends'),
  tempDir: path.join(__dirname, '../../data/trends/temp'),
  outputFile: 'google-trends-data.csv',

  // レート制限対策
  delayBetweenGroups: 30000, // 30秒
  delayBetweenRetries: 60000, // 1分
  maxRetries: 3,

  // タイムアウト
  navigationTimeout: 60000,
  downloadTimeout: 60000,
}

// ========================================
// URL生成
// ========================================

function buildTrendsUrl(keywords: string[]): string {
  const dateRange = `${CONFIG.startDate} ${CONFIG.endDate}`
  const params = new URLSearchParams({
    date: dateRange,
    geo: CONFIG.geo,
    hl: CONFIG.language,
    q: keywords.join(','),
  })
  return `https://trends.google.com/trends/explore?${params.toString()}`
}

// ========================================
// ユーティリティ
// ========================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ========================================
// CAPTCHA検出
// ========================================

async function checkForCaptcha(page: Page): Promise<boolean> {
  const captchaSelectors = [
    'iframe[src*="recaptcha"]',
    '#captcha',
    '.g-recaptcha',
    '[data-callback="onCaptchaSuccess"]',
  ]

  for (const selector of captchaSelectors) {
    const element = await page.$(selector)
    if (element) {
      return true
    }
  }
  return false
}

// ========================================
// ダウンロードボタン検索
// ========================================

async function findDownloadButton(page: Page): Promise<string | null> {
  // Google Trendsのダウンロードボタンセレクタ候補
  const selectors = [
    // Interest over time チャートのダウンロードメニュー
    '.widget-actions-item.export',
    'button[aria-label*="CSV"]',
    'button[aria-label*="csv"]',
    'button[aria-label*="Download"]',
    'button[aria-label*="download"]',
    '[data-tooltip*="CSV"]',
    // 汎用
    '.fe-atoms-generic-icon-button',
    'button:has-text("download")',
  ]

  for (const selector of selectors) {
    try {
      const element = await page.$(selector)
      if (element) {
        const isVisible = await element.isVisible()
        if (isVisible) {
          return selector
        }
      }
    } catch {
      continue
    }
  }
  return null
}

// ========================================
// グループデータのダウンロード
// ========================================

async function downloadGroupData(
  page: Page,
  group: { name: string; keywords: string[] },
  attempt: number = 1
): Promise<string> {
  const url = buildTrendsUrl(group.keywords)
  console.log(`\n[${group.name}] URL: ${url}`)
  console.log(`[${group.name}] Attempt ${attempt}/${CONFIG.maxRetries}`)

  // ページ遷移
  await page.goto(url, {
    waitUntil: 'networkidle',
    timeout: CONFIG.navigationTimeout,
  })

  // 追加の待機（動的コンテンツ読み込み）
  await sleep(5000)

  // CAPTCHA検出
  if (await checkForCaptcha(page)) {
    console.log(`[${group.name}] CAPTCHA detected! Please solve it manually.`)
    console.log('[${group.name}] Waiting up to 5 minutes...')
    // CAPTCHAが消えるまで待機
    await page.waitForFunction(
      () => !document.querySelector('iframe[src*="recaptcha"]'),
      { timeout: 300000 }
    )
    console.log(`[${group.name}] CAPTCHA resolved, continuing...`)
  }

  // Interest over time チャートが表示されるまで待機
  try {
    // 複数のセレクタを試す
    await Promise.race([
      page.waitForSelector('.fe-line-chart', { timeout: CONFIG.navigationTimeout }),
      page.waitForSelector('[class*="interest-over-time"]', { timeout: CONFIG.navigationTimeout }),
      page.waitForSelector('.trends-chart', { timeout: CONFIG.navigationTimeout }),
      page.waitForSelector('svg', { timeout: CONFIG.navigationTimeout }),
    ])
    console.log(`[${group.name}] Chart loaded`)
  } catch {
    console.log(`[${group.name}] Chart not found, taking screenshot for debug...`)
    try {
      await page.screenshot({
        path: path.join(CONFIG.tempDir, `${group.name}_debug.png`),
        fullPage: true,
      })
      // ページのHTMLも保存
      const html = await page.content()
      fs.writeFileSync(path.join(CONFIG.tempDir, `${group.name}_debug.html`), html)
      console.log(`[${group.name}] Debug files saved`)
    } catch (e) {
      console.log(`[${group.name}] Could not save debug files: ${e}`)
    }
    throw new Error('Chart element not found')
  }

  // ダウンロードボタンを探す
  // まず、チャートヘッダーのメニューボタンをクリック
  const menuButton = await page.$('.fe-line-chart-header .widget-actions-item, .fe-atoms-generic-icon-button')
  if (menuButton) {
    await menuButton.click()
    await sleep(1000)
  }

  // CSVダウンロードを開始
  const downloadPath = path.join(CONFIG.tempDir, `${group.name}.csv`)

  // ダウンロードイベントをリッスン
  const downloadPromise = page.waitForEvent('download', {
    timeout: CONFIG.downloadTimeout,
  })

  // ダウンロードボタンをクリック
  const downloadSelector = await findDownloadButton(page)
  if (downloadSelector) {
    console.log(`[${group.name}] Found download button: ${downloadSelector}`)
    await page.click(downloadSelector)
  } else {
    // 代替: キーボードショートカットやJavaScript実行を試す
    console.log(`[${group.name}] Download button not found, trying alternative method...`)

    // Google Trendsの「経時的なインタレスト」セクションを探してCSVリンクをクリック
    const csvLinks = await page.$$('a[href*="csv"], button:has-text("CSV")')
    if (csvLinks.length > 0) {
      await csvLinks[0].click()
    } else {
      throw new Error('Download button not found')
    }
  }

  // ダウンロード完了を待機
  const download = await downloadPromise
  await download.saveAs(downloadPath)

  console.log(`[${group.name}] Downloaded: ${downloadPath}`)
  return downloadPath
}

// ========================================
// リトライ付きダウンロード
// ========================================

async function downloadWithRetry(
  page: Page,
  group: { name: string; keywords: string[] }
): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      return await downloadGroupData(page, group, attempt)
    } catch (error) {
      lastError = error as Error
      console.error(`[${group.name}] Attempt ${attempt} failed: ${lastError.message}`)

      if (attempt < CONFIG.maxRetries) {
        const delay = CONFIG.delayBetweenRetries + randomDelay(0, 10000)
        console.log(`[${group.name}] Waiting ${Math.round(delay / 1000)}s before retry...`)
        await sleep(delay)
      }
    }
  }

  throw lastError
}

// ========================================
// CSV解析
// ========================================

interface TrendRow {
  date: string
  [brand: string]: string | number
}

function parseGoogleTrendsCSV(filePath: string): TrendRow[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  // Google TrendsのCSVは最初の数行がメタデータ
  // データ行は "2021-01-10,..." のような形式で始まる
  let dataStartIndex = lines.findIndex((line) =>
    /^\d{4}-\d{2}-\d{2}/.test(line.trim())
  )

  if (dataStartIndex === -1) {
    // 週次データの場合 "Week" ヘッダーがある
    dataStartIndex = lines.findIndex((line) => line.includes('Week'))
    if (dataStartIndex >= 0) {
      dataStartIndex++ // ヘッダー行をスキップ
    }
  }

  // ヘッダー行を取得（データ行の1行前）
  const headerLine = lines[dataStartIndex - 1] || lines[0]
  const headers = headerLine.split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''))

  // データ行を解析
  const dataLines = lines.slice(dataStartIndex).filter((line) => line.trim())
  const csvContent = [headerLine, ...dataLines].join('\n')

  try {
    return parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    })
  } catch {
    // フォールバック: 手動解析
    return dataLines.map((line) => {
      const values = line.split(',')
      const row: TrendRow = { date: values[0] }
      headers.slice(1).forEach((header, i) => {
        row[header] = parseInt(values[i + 1], 10) || 0
      })
      return row
    })
  }
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

  if (bridge2Avg === 0) {
    console.warn('Warning: Bridge keyword average in group2 is 0, using scale factor 1')
  }

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
    const values = [row.date, ...brands.map((b) => row[b] ?? 0)]
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
  console.log('Google Trends Data Fetcher (Playwright)')
  console.log('========================================')
  console.log(`Date range: ${CONFIG.startDate} to ${CONFIG.endDate}`)
  console.log(`Region: ${CONFIG.geo}`)
  console.log(`Groups: ${CONFIG.groups.length}`)
  console.log(`Bridge keyword: ${CONFIG.bridgeKeyword}`)

  // ディレクトリ作成
  fs.mkdirSync(CONFIG.tempDir, { recursive: true })
  fs.mkdirSync(CONFIG.outputDir, { recursive: true })

  // ブラウザ起動
  console.log('\nLaunching browser...')
  const browser = await chromium.launch({
    headless: true, // headlessモードで実行
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const context = await browser.newContext({
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    acceptDownloads: true,
    viewport: { width: 1280, height: 800 },
  })

  const page = await context.newPage()

  try {
    const downloadedFiles: string[] = []

    // 各グループのデータを取得
    for (let i = 0; i < CONFIG.groups.length; i++) {
      const group = CONFIG.groups[i]
      console.log(`\n========================================`)
      console.log(`[${i + 1}/${CONFIG.groups.length}] Processing ${group.name}`)
      console.log(`Keywords: ${group.keywords.join(', ')}`)
      console.log(`========================================`)

      const filePath = await downloadWithRetry(page, group)
      downloadedFiles.push(filePath)

      // レート制限対策
      if (i < CONFIG.groups.length - 1) {
        const delay = CONFIG.delayBetweenGroups + randomDelay(0, 5000)
        console.log(`\nWaiting ${Math.round(delay / 1000)}s before next group...`)
        await sleep(delay)
      }
    }

    // CSVマージ
    console.log('\n========================================')
    console.log('Merging CSV files')
    console.log('========================================')

    const group1Data = parseGoogleTrendsCSV(downloadedFiles[0])
    const group2Data = parseGoogleTrendsCSV(downloadedFiles[1])

    console.log(`Group1 rows: ${group1Data.length}`)
    console.log(`Group2 rows: ${group2Data.length}`)

    const mergedData = normalizeWithBridge(
      group1Data,
      group2Data,
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
  } catch (error) {
    console.error('\nFatal error:', error)
    // デバッグ用スクリーンショット
    await page.screenshot({
      path: path.join(CONFIG.tempDir, 'error_screenshot.png'),
      fullPage: true,
    })
    console.log('Screenshot saved to temp/error_screenshot.png')
    throw error
  } finally {
    await browser.close()
  }
}

// 実行
main().catch((error) => {
  console.error(error)
  process.exit(1)
})
