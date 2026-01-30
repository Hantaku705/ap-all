/**
 * Boring Cash Cow - Puppeteer Scraping
 * https://boringcashcow.com/
 *
 * 退屈だけど儲かるビジネス事例を取得
 */

import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface StartupIdea {
  id: string
  source: 'boring-cashcow'
  name: string
  description: string
  url: string
  metrics?: {
    category?: string
  }
  category?: string
  tags?: string[]
  japanExists: boolean
  fetchedAt: string
}

async function fetchBoringCashCow(): Promise<StartupIdea[]> {
  console.log('Launching Puppeteer for Boring Cash Cow...')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    console.log('Navigating to Boring Cash Cow...')
    await page.goto('https://boringcashcow.com/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    })

    // ページが読み込まれるまで待機
    await new Promise((r) => setTimeout(r, 3000))

    // スクロールしてコンテンツを読み込む
    await page.evaluate(async () => {
      for (let i = 0; i < 5; i++) {
        window.scrollBy(0, 800)
        await new Promise((r) => setTimeout(r, 500))
      }
    })

    // デバッグ: スクリーンショット保存
    await page.screenshot({
      path: resolve(__dirname, '../data/boring-cashcow-debug.png'),
      fullPage: true,
    })
    console.log('Screenshot saved to data/boring-cashcow-debug.png')

    // ビジネスカードを探す
    const products = await page.evaluate(() => {
      const items: {
        name: string
        description: string
        url: string
        category?: string
      }[] = []

      // カードやリストアイテムを探す
      const cards = document.querySelectorAll(
        'article, .card, [class*="business"], [class*="case"], a[href*="/business/"]'
      )

      cards.forEach((card) => {
        const title = card.querySelector('h1, h2, h3, h4, .title, .name')?.textContent?.trim()
        const description = card.querySelector('p, .description, .summary')?.textContent?.trim()
        const link = card.querySelector('a') || card
        const href = link instanceof HTMLAnchorElement ? link.href : ''
        const category = card.querySelector('[class*="category"], [class*="tag"]')?.textContent?.trim()

        if (title && title.length > 2 && title.length < 100) {
          items.push({
            name: title,
            description: description || '',
            url: href,
            category,
          })
        }
      })

      return items
    })

    console.log(`Found ${products.length} businesses`)

    const ideas: StartupIdea[] = products.slice(0, 50).map((product, index) => ({
      id: `boring-cashcow-${Date.now()}-${index}`,
      source: 'boring-cashcow' as const,
      name: product.name,
      description: product.description,
      url: product.url.startsWith('http')
        ? product.url
        : `https://boringcashcow.com${product.url}`,
      metrics: {
        category: product.category,
      },
      category: product.category,
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
    const ideas = await fetchBoringCashCow()

    if (ideas.length === 0) {
      console.log('No businesses found. Check debug screenshot.')
      return
    }

    // JSONファイルに保存
    const outputPath = resolve(__dirname, '../data/boring-cashcow.json')
    writeFileSync(outputPath, JSON.stringify(ideas, null, 2))
    console.log(`Saved to ${outputPath}`)

    // サマリー表示
    console.log('\n--- Top 10 Businesses ---')
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
