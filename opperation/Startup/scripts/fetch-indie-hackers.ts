/**
 * Indie Hackers - Puppeteer Scraping
 * https://www.indiehackers.com/products
 *
 * プロダクト一覧からデータを取得
 */

import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface StartupIdea {
  id: string
  source: 'indie-hackers'
  name: string
  description: string
  url: string
  metrics?: {
    revenue?: string
  }
  category?: string
  tags?: string[]
  japanExists: boolean
  fetchedAt: string
}

async function fetchIndieHackers(): Promise<StartupIdea[]> {
  console.log('Launching Puppeteer for Indie Hackers...')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    console.log('Navigating to Indie Hackers products page...')
    await page.goto('https://www.indiehackers.com/products', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    })

    // ページが完全に読み込まれるまで待機
    await page.waitForSelector('.products-list, .product-card, [data-test="product"]', {
      timeout: 30000,
    }).catch(() => {
      console.log('Selector not found, trying alternative approach...')
    })

    // スクロールしてコンテンツを読み込む
    await page.evaluate(async () => {
      for (let i = 0; i < 3; i++) {
        window.scrollBy(0, 1000)
        await new Promise((r) => setTimeout(r, 1000))
      }
    })

    // デバッグ: ページのスクリーンショットを保存
    await page.screenshot({
      path: resolve(__dirname, '../data/indie-hackers-debug.png'),
      fullPage: true,
    })
    console.log('Screenshot saved to data/indie-hackers-debug.png')

    // HTMLを取得してデバッグ
    const html = await page.content()
    writeFileSync(resolve(__dirname, '../data/indie-hackers-debug.html'), html)
    console.log('HTML saved to data/indie-hackers-debug.html')

    // プロダクトカードを探す
    const products = await page.evaluate(() => {
      const items: {
        name: string
        description: string
        url: string
        revenue?: string
      }[] = []

      // 複数のセレクタを試す
      const selectors = [
        '.products-list__item',
        '.product-card',
        '[class*="product"]',
        'a[href*="/product/"]',
      ]

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector)
        if (elements.length > 0) {
          console.log(`Found ${elements.length} elements with selector: ${selector}`)
          elements.forEach((el) => {
            const link = el.querySelector('a') || (el as HTMLAnchorElement)
            const name =
              el.querySelector('h2, h3, .name, [class*="name"]')?.textContent?.trim() ||
              el.textContent?.trim().slice(0, 50) ||
              ''
            const description =
              el.querySelector('p, .tagline, [class*="tagline"]')?.textContent?.trim() || ''
            const revenue =
              el.querySelector('[class*="revenue"], .mrr')?.textContent?.trim() || undefined

            if (name && link instanceof HTMLAnchorElement) {
              items.push({
                name,
                description,
                url: link.href,
                revenue,
              })
            }
          })
          if (items.length > 0) break
        }
      }

      return items
    })

    console.log(`Found ${products.length} products`)

    const ideas: StartupIdea[] = products.slice(0, 50).map((product, index) => ({
      id: `indie-hackers-${Date.now()}-${index}`,
      source: 'indie-hackers' as const,
      name: product.name,
      description: product.description,
      url: product.url.startsWith('http')
        ? product.url
        : `https://www.indiehackers.com${product.url}`,
      metrics: {
        revenue: product.revenue,
      },
      japanExists: false,
      fetchedAt: new Date().toISOString(),
    }))

    return ideas
  } finally {
    await browser.close()
  }
}

async function main() {
  try {
    const ideas = await fetchIndieHackers()

    if (ideas.length === 0) {
      console.log('No products found. Check debug files for details.')
      return
    }

    // JSONファイルに保存
    const outputPath = resolve(__dirname, '../data/indie-hackers.json')
    writeFileSync(outputPath, JSON.stringify(ideas, null, 2))
    console.log(`Saved to ${outputPath}`)

    // サマリー表示
    console.log('\n--- Top 10 Products ---')
    ideas.slice(0, 10).forEach((idea, i) => {
      console.log(`${i + 1}. ${idea.name}`)
      console.log(`   ${idea.description?.slice(0, 60)}...`)
    })
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
