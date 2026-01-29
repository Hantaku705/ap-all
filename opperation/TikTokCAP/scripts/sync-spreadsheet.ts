/**
 * スプレッドシートデータをJSONに変換するスクリプト
 *
 * 使い方:
 * 1. Claude Code で mcp__google-docs-mcp__readSpreadsheet を実行
 * 2. 出力されたファイルパスをこのスクリプトに渡す
 * 3. products.json が生成される
 */

import * as fs from 'fs'
import * as path from 'path'

// ヘッダーマッピング
const HEADER_MAP: Record<string, string> = {
  'リストアップ\n対応者': 'assignee',
  'No': 'no',
  '優先度': 'priority',
  'Brand': 'brand',
  'Product': 'product',
  'image': 'image',
  'カテゴリ': 'category',
  'カテゴリ別\nGoogleフォーム': 'categoryFormUrl',
  'フォーム記載': 'formFilled',
  'フォームチェック備考': 'formNote',
  'ブランド別\nGoogleフォーム': 'brandFormUrl',
  'Open ': 'open',
  'GROSS\nTarget': 'grossTarget',
  'NET\nTAP利率': 'netTapRate',
  'CAP利率': 'capRate',
  'TAPリンク（クリエイター展開用）': 'tapLink',
  'CAPリンク（クリエイター展開用）': 'capLink',
  '商品URL': 'productUrl',
  'ショップコード': 'shopCode',
  'キャンペーンURL': 'campaignUrl',
  'BD': 'bd',
  'Category': 'categoryEn',
  'Price': 'price',
  'KOL確認': 'kolCheck',
  '下書き確認': 'draftCheck',
  '期間': 'period',
  'サンプル': 'sample',
}

interface TAPProduct {
  assignee: string
  no: string
  priority: string
  brand: string
  product: string
  image: string
  category: string
  open: string
  grossTarget: string
  netTapRate: string
  capRate: string
  tapLink: string
  capLink: string
  productUrl: string
  shopCode: string
  campaignUrl: string
  bd: string
  categoryEn: string
  price: string
  kolCheck: string
  draftCheck: string
  period: string
  sample: string
}

interface SyncResult {
  syncedAt: string
  source: string
  totalCount: number
  brands: Record<string, number>
  categories: Record<string, number>
  priorities: Record<string, number>
  products: TAPProduct[]
}

function parseSpreadsheetOutput(filePath: string): SyncResult {
  const content = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(content)

  // MCPの出力形式: [{ type: "text", text: "..." }]
  const textContent = data[0]?.text || ''

  // Row N: [...] 形式でパース
  const rows: string[][] = []
  const lines = textContent.split('\n')

  for (const line of lines) {
    const match = line.match(/^Row \d+: (\[.+\])$/)
    if (match) {
      try {
        const row = JSON.parse(match[1])
        rows.push(row)
      } catch {
        // パースエラーは無視
      }
    }
  }

  if (rows.length === 0) {
    throw new Error('No data rows found')
  }

  // ヘッダー行（最初の行）
  const headers = rows[0]
  const headerKeys = headers.map(h => HEADER_MAP[h] || h)

  // データ行を変換
  const products: TAPProduct[] = []
  const brands: Record<string, number> = {}
  const categories: Record<string, number> = {}
  const priorities: Record<string, number> = {}

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row[1]) continue // No が空なら skip

    const product: Record<string, string> = {}
    for (let j = 0; j < headerKeys.length; j++) {
      product[headerKeys[j]] = row[j] || ''
    }

    products.push(product as unknown as TAPProduct)

    // 集計
    const brand = product['brand'] || '不明'
    const category = product['category'] || '不明'
    const priority = product['priority'] || '不明'

    brands[brand] = (brands[brand] || 0) + 1
    categories[category] = (categories[category] || 0) + 1
    priorities[priority] = (priorities[priority] || 0) + 1
  }

  return {
    syncedAt: new Date().toISOString(),
    source: 'https://docs.google.com/spreadsheets/d/1OnWqFD7Q9FfQaJ6-0pTI_DMXDdg12HDFiJboFYKjxzw',
    totalCount: products.length,
    brands,
    categories,
    priorities,
    products,
  }
}

// メイン処理
const inputFile = process.argv[2]
if (!inputFile) {
  console.error('Usage: npx tsx sync-spreadsheet.ts <input-file>')
  process.exit(1)
}

const result = parseSpreadsheetOutput(inputFile)
const outputPath = path.join(__dirname, '../data/products.json')
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))

console.log(`
=== TikTokCAP スプレッドシート同期完了 ===

同期日時: ${result.syncedAt}
総商品数: ${result.totalCount}件

【ブランド別】
${Object.entries(result.brands)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([name, count]) => `  ${name}: ${count}件`)
  .join('\n')}

【カテゴリ別】
${Object.entries(result.categories)
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => `  ${name}: ${count}件`)
  .join('\n')}

【優先度別】
${Object.entries(result.priorities)
  .map(([name, count]) => `  ${name}: ${count}件`)
  .join('\n')}

出力: ${outputPath}
`)
