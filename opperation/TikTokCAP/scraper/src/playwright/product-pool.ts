import { Page } from 'playwright'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { config } from '../config.js'
import { Product, ScrapeResult, PaginationInfo } from '../types/product.js'
import { login } from './login.js'
import { closeBrowser, saveCookies } from './browser.js'

/**
 * 商品プールページにアクセス
 */
async function navigateToProductPool(page: Page): Promise<void> {
  console.log('Navigating to product pool...')
  await page.goto(config.partnerCenter.productPoolUrl, { waitUntil: 'networkidle' })

  // ページが完全に読み込まれるまで待機
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(2000) // 動的コンテンツの読み込み待機

  console.log('Product pool page loaded:', page.url())

  // スクリーンショットを保存
  await page.screenshot({ path: config.paths.logs + '/product-pool.png', fullPage: true })
  console.log('Screenshot saved to logs/product-pool.png')
}

/**
 * ページネーション情報を取得
 */
async function getPaginationInfo(page: Page): Promise<PaginationInfo> {
  try {
    // ページネーション要素を探す（セレクタは実際のUIに合わせて調整）
    const paginationText = await page.$eval(
      '.pagination-info, .total-count, [class*="pagination"]',
      (el) => el.textContent || ''
    ).catch(() => '')

    // "1-20 of 100" のような形式をパース
    const match = paginationText.match(/(\d+)-(\d+)\s+of\s+(\d+)/i) ||
                  paginationText.match(/(\d+)\s*\/\s*(\d+)/)

    if (match) {
      const totalItems = parseInt(match[3] || match[2], 10)
      const itemsPerPage = 20 // デフォルト
      return {
        currentPage: 1,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        totalItems,
        hasNextPage: totalItems > itemsPerPage,
      }
    }

    // ページ番号ボタンから推測
    const pageButtons = await page.$$('[class*="page"], .pagination button, .pagination a')
    const pageNumbers = await Promise.all(
      pageButtons.map(async (btn) => {
        const text = await btn.textContent()
        return parseInt(text || '0', 10)
      })
    )
    const maxPage = Math.max(...pageNumbers.filter((n) => !isNaN(n)), 1)

    return {
      currentPage: 1,
      totalPages: maxPage,
      totalItems: 0,
      hasNextPage: maxPage > 1,
    }
  } catch (error) {
    console.warn('Could not determine pagination:', error)
    return {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
    }
  }
}

/**
 * 現在のページから商品データを抽出
 */
async function extractProducts(page: Page): Promise<Product[]> {
  const products: Product[] = []
  const scrapedAt = new Date().toISOString()

  try {
    // テーブル行または商品カードを取得（セレクタは実際のUIに合わせて調整）
    const productSelectors = [
      'table tbody tr',
      '.product-card',
      '.product-item',
      '[class*="product-row"]',
      '[class*="product-list"] > div',
    ]

    let productElements = null
    for (const selector of productSelectors) {
      productElements = await page.$$(selector)
      if (productElements.length > 0) {
        console.log(`Found ${productElements.length} products using selector: ${selector}`)
        break
      }
    }

    if (!productElements || productElements.length === 0) {
      console.warn('No product elements found. Taking debug screenshot...')
      await page.screenshot({ path: config.paths.logs + '/no-products-debug.png', fullPage: true })

      // ページのHTMLを保存してデバッグ
      const html = await page.content()
      writeFileSync(config.paths.logs + '/page-debug.html', html)
      console.log('Debug files saved to logs/')

      return products
    }

    for (let i = 0; i < productElements.length; i++) {
      try {
        const el = productElements[i]

        // 各フィールドを抽出（セレクタは実際のUIに合わせて調整）
        const getText = async (selectors: string[]): Promise<string> => {
          for (const sel of selectors) {
            try {
              const text = await el.$eval(sel, (e) => e.textContent?.trim() || '')
              if (text) return text
            } catch {
              // セレクタが見つからない場合は次を試す
            }
          }
          return ''
        }

        const getAttr = async (selectors: string[], attr: string): Promise<string> => {
          for (const sel of selectors) {
            try {
              const value = await el.$eval(sel, (e, a) => e.getAttribute(a) || '', attr)
              if (value) return value
            } catch {
              // セレクタが見つからない場合は次を試す
            }
          }
          return ''
        }

        // 商品データを抽出
        const name = await getText([
          '.product-name',
          '[class*="name"]',
          'td:nth-child(2)',
          'h3',
          'h4',
        ])

        const image = await getAttr(['img', '[class*="image"] img'], 'src')

        const priceText = await getText([
          '.price',
          '[class*="price"]',
          'td:nth-child(3)',
        ])
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0

        const commissionText = await getText([
          '.commission',
          '[class*="commission"]',
          'td:nth-child(4)',
        ])
        const commissionRate = parseFloat(commissionText.replace(/[^0-9.]/g, '')) || 0

        const category = await getText([
          '.category',
          '[class*="category"]',
          'td:nth-child(5)',
        ])

        const seller = await getText([
          '.seller',
          '[class*="seller"]',
          '[class*="shop"]',
          'td:nth-child(6)',
        ])

        const salesText = await getText([
          '.sales',
          '[class*="sales"]',
          '[class*="sold"]',
          'td:nth-child(7)',
        ])
        const sales = parseInt(salesText.replace(/[^0-9]/g, ''), 10) || 0

        const url = await getAttr(['a', '[class*="link"]'], 'href')

        // IDを生成（URLから抽出またはインデックス）
        const idMatch = url.match(/product\/(\d+)/) || url.match(/id=(\d+)/)
        const id = idMatch ? idMatch[1] : `product-${i + 1}`

        const product: Product = {
          id,
          name: name || `Product ${i + 1}`,
          image,
          price,
          currency: 'JPY',
          commissionRate,
          commissionAmount: price * (commissionRate / 100),
          category,
          seller,
          stock: 0, // 在庫情報がない場合
          sales,
          url: url.startsWith('http') ? url : `${config.partnerCenter.baseUrl}${url}`,
          scrapedAt,
        }

        products.push(product)
      } catch (error) {
        console.warn(`Error extracting product ${i + 1}:`, error)
      }
    }
  } catch (error) {
    console.error('Error extracting products:', error)
  }

  return products
}

/**
 * 次のページへ移動
 */
async function goToNextPage(page: Page): Promise<boolean> {
  try {
    const nextButtonSelectors = [
      'button:has-text("Next")',
      'button:has-text(">")',
      '.pagination-next',
      '[class*="next"]',
      '.pagination button:last-child',
    ]

    for (const selector of nextButtonSelectors) {
      const nextButton = await page.$(selector)
      if (nextButton) {
        const isDisabled = await nextButton.getAttribute('disabled')
        if (!isDisabled) {
          await nextButton.click()
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(1000)
          return true
        }
      }
    }

    return false
  } catch (error) {
    console.warn('Error navigating to next page:', error)
    return false
  }
}

/**
 * 全ページをスクレイピング
 */
export async function scrapeProductPool(): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    products: [],
    totalPages: 0,
    totalProducts: 0,
    startedAt: new Date().toISOString(),
    finishedAt: '',
    errors: [],
  }

  try {
    // ログイン
    const page = await login()

    // 商品プールページへ
    await navigateToProductPool(page)

    // ページネーション情報を取得
    const pagination = await getPaginationInfo(page)
    result.totalPages = pagination.totalPages
    console.log(`Total pages: ${pagination.totalPages}`)

    // 各ページをスクレイピング
    let currentPage = 1
    let hasMore = true

    while (hasMore && currentPage <= pagination.totalPages) {
      console.log(`\nScraping page ${currentPage}/${pagination.totalPages}...`)

      const products = await extractProducts(page)
      result.products.push(...products)
      console.log(`Extracted ${products.length} products from page ${currentPage}`)

      // 次のページへ
      if (currentPage < pagination.totalPages) {
        hasMore = await goToNextPage(page)
        if (hasMore) {
          currentPage++
          await page.waitForTimeout(1000) // レート制限対策
        }
      } else {
        hasMore = false
      }
    }

    result.totalProducts = result.products.length
    console.log(`\nTotal products scraped: ${result.totalProducts}`)

    // Cookieを保存
    await saveCookies()

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Scraping error:', errorMessage)
    result.errors.push(errorMessage)
  } finally {
    result.finishedAt = new Date().toISOString()
    await closeBrowser()
  }

  return result
}

/**
 * 結果をファイルに保存
 */
export function saveResults(result: ScrapeResult): void {
  // 出力ディレクトリを確保
  if (!existsSync(config.paths.products)) {
    mkdirSync(config.paths.products, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  // JSON形式で保存
  const jsonPath = `${config.paths.products}/products-${timestamp}.json`
  writeFileSync(jsonPath, JSON.stringify(result, null, 2))
  console.log(`Results saved to ${jsonPath}`)

  // CSV形式でも保存
  if (result.products.length > 0) {
    const csvPath = `${config.paths.products}/products-${timestamp}.csv`
    const headers = Object.keys(result.products[0]).join(',')
    const rows = result.products.map((p) =>
      Object.values(p)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
    writeFileSync(csvPath, [headers, ...rows].join('\n'))
    console.log(`CSV saved to ${csvPath}`)
  }
}

/**
 * スクレイピングを実行して結果を保存
 */
export async function scrapeAndSave(): Promise<void> {
  console.log('Starting product pool scraping...\n')

  const result = await scrapeProductPool()

  if (result.products.length > 0) {
    saveResults(result)
  } else {
    console.warn('\nNo products found. Check the debug files in logs/')
  }

  if (result.errors.length > 0) {
    console.error('\nErrors occurred:')
    result.errors.forEach((e) => console.error(`  - ${e}`))
  }

  console.log('\nScraping completed!')
}
