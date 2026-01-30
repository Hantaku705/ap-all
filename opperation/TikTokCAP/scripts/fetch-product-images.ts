/**
 * TikTok Shop商品ページから画像URLを取得するスクリプト（並列処理版）
 *
 * 使い方:
 * npx tsx fetch-product-images.ts
 *
 * 出力: ../data/product-images.json
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

interface ProductImage {
  no: string
  product: string
  productUrl: string
  imageUrl: string
  error?: string
}

interface SyncData {
  syncedAt: string
  source: string
  totalCount: number
  products: Array<{
    no: string
    product: string
    productUrl: string
    [key: string]: string
  }>
}

interface OutputData {
  fetchedAt: string
  totalCount: number
  successCount: number
  failedCount: number
  images: ProductImage[]
}

// 設定
const CONFIG = {
  concurrency: 5, // 同時実行数
  timeout: 10000, // ページタイムアウト（ms）- 短めに
  delay: 300, // リクエスト間の遅延（ms）
  retries: 1, // リトライ回数
  saveInterval: 20, // 中間保存間隔
}

// 商品ページから画像URLを取得
async function fetchImageUrl(page: Page, productUrl: string): Promise<string> {
  try {
    await page.goto(productUrl, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.timeout,
    })

    // 画像が読み込まれるまで少し待機
    await page.waitForTimeout(1500)

    // TikTok CDN画像を探す
    const images = await page.$$eval('img', (imgs) =>
      imgs
        .filter((img) => {
          const src = img.src || ''
          return (
            (src.includes('ibyteimg') || src.includes('tiktokcdn') || src.includes('bytedance')) &&
            (img.width > 100 || img.height > 100)
          )
        })
        .map((img) => img.src)
    )

    if (images.length > 0) {
      // 最大サイズの画像を返す（通常メイン画像）
      return images[0].startsWith('//') ? `https:${images[0]}` : images[0]
    }

    return ''
  } catch (error) {
    return ''
  }
}

// 並列処理でバッチを実行
async function processBatch(
  browser: Browser,
  products: SyncData['products'],
  outputPath: string
): Promise<ProductImage[]> {
  const results: ProductImage[] = []
  const total = products.length

  // 同時実行用のワーカーを作成
  const workers: Promise<void>[] = []
  let currentIndex = 0
  const lock = { index: 0 }

  const worker = async (workerId: number) => {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })
    const page = await context.newPage()

    while (true) {
      // インデックスを取得
      const i = lock.index++
      if (i >= products.length) break

      const product = products[i]

      if (!product.productUrl) {
        results.push({
          no: product.no,
          product: product.product,
          productUrl: '',
          imageUrl: '',
          error: 'No product URL',
        })
        continue
      }

      console.log(`[${i + 1}/${total}] Worker${workerId}: ${product.product.substring(0, 30)}...`)

      let imageUrl = ''
      for (let retry = 0; retry <= CONFIG.retries; retry++) {
        imageUrl = await fetchImageUrl(page, product.productUrl)
        if (imageUrl) break
        if (retry < CONFIG.retries) {
          await page.waitForTimeout(500)
        }
      }

      results.push({
        no: product.no,
        product: product.product,
        productUrl: product.productUrl,
        imageUrl,
        error: imageUrl ? undefined : 'Image not found',
      })

      // 中間保存
      if (results.length % CONFIG.saveInterval === 0) {
        console.log(`Progress: ${results.length}/${total} (${Math.round((results.length / total) * 100)}%) - Saving...`)
        savePartialResults(results, outputPath)
      }

      await page.waitForTimeout(CONFIG.delay)
    }

    await context.close()
  }

  // ワーカーを起動
  for (let w = 0; w < CONFIG.concurrency; w++) {
    workers.push(worker(w + 1))
  }

  // 全ワーカーの完了を待つ
  await Promise.all(workers)

  return results
}

// 中間結果を保存
function savePartialResults(results: ProductImage[], outputPath: string) {
  const output: OutputData = {
    fetchedAt: new Date().toISOString(),
    totalCount: results.length,
    successCount: results.filter((r) => r.imageUrl).length,
    failedCount: results.filter((r) => !r.imageUrl).length,
    images: results,
  }
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
}

// メイン処理
async function main() {
  console.log('=== TikTok Shop 商品画像URL取得（並列処理版） ===\n')
  console.log(`同時実行数: ${CONFIG.concurrency}`)
  console.log(`タイムアウト: ${CONFIG.timeout}ms\n`)

  // products.json を読み込む
  const inputPath = path.join(__dirname, '../data/products.json')
  if (!fs.existsSync(inputPath)) {
    console.error('Error: products.json not found. Run /sync-tiktokcap first.')
    process.exit(1)
  }

  const syncData: SyncData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
  console.log(`Total products: ${syncData.products.length}`)

  // productUrl があるものだけフィルタ
  const productsWithUrl = syncData.products.filter((p) => p.productUrl)
  console.log(`Products with URL: ${productsWithUrl.length}\n`)

  const outputPath = path.join(__dirname, '../data/product-images.json')

  // ブラウザ起動
  const browser = await chromium.launch({
    headless: true,
  })

  try {
    const startTime = Date.now()

    // 並列処理で全商品を処理
    const results = await processBatch(browser, productsWithUrl, outputPath)

    const elapsed = Math.round((Date.now() - startTime) / 1000)

    // 最終結果を保存
    const output: OutputData = {
      fetchedAt: new Date().toISOString(),
      totalCount: results.length,
      successCount: results.filter((r) => r.imageUrl).length,
      failedCount: results.filter((r) => !r.imageUrl).length,
      images: results,
    }

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))

    console.log(`\n=== 完了 (${elapsed}秒) ===`)
    console.log(`成功: ${output.successCount}件`)
    console.log(`失敗: ${output.failedCount}件`)
    console.log(`出力: ${outputPath}`)

    // 失敗したものをサンプル表示
    const failed = results.filter((r) => !r.imageUrl)
    if (failed.length > 0 && failed.length <= 10) {
      console.log('\n失敗した商品:')
      failed.forEach((f) => console.log(`  - [${f.no}] ${f.product}`))
    } else if (failed.length > 10) {
      console.log(`\n失敗した商品: ${failed.length}件（詳細はJSONを確認）`)
    }
  } finally {
    await browser.close()
  }
}

main().catch(console.error)
