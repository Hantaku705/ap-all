/**
 * Tiny Startups - Puppeteer Scraping
 * https://www.tinystartups.com/
 *
 * スタートアップ事例からデータを取得
 */

import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface StartupIdea {
  id: string
  source: 'tiny-startups'
  name: string
  description: string
  url: string
  metrics?: {
    founder?: string
  }
  category?: string
  tags?: string[]
  japanExists: boolean
  fetchedAt: string
}

async function fetchTinyStartups(): Promise<StartupIdea[]> {
  console.log('Launching Puppeteer for Tiny Startups...')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    console.log('Navigating to Tiny Startups...')
    await page.goto('https://www.tinystartups.com/', {
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
      path: resolve(__dirname, '../data/tiny-startups-debug.png'),
      fullPage: true,
    })
    console.log('Screenshot saved to data/tiny-startups-debug.png')

    // スタートアップカードを探す
    const products = await page.evaluate(() => {
      const items: {
        name: string
        description: string
        url: string
        founder?: string
      }[] = []

      // カードやリストアイテムを探す
      const cards = document.querySelectorAll(
        'article, .card, [class*="startup"], [class*="project"], a[href*="/startup"]'
      )

      cards.forEach((card) => {
        const title = card.querySelector('h1, h2, h3, h4, .title')?.textContent?.trim()
        const description = card.querySelector('p, .description')?.textContent?.trim()
        const link = card.querySelector('a') || card
        const href = link instanceof HTMLAnchorElement ? link.href : ''
        const founder = card.querySelector('[class*="founder"], [class*="author"]')?.textContent?.trim()

        if (title && title.length > 2) {
          items.push({
            name: title,
            description: description || '',
            url: href,
            founder,
          })
        }
      })

      return items
    })

    console.log(`Found ${products.length} startups`)

    const ideas: StartupIdea[] = products.slice(0, 50).map((product, index) => ({
      id: `tiny-startups-${Date.now()}-${index}`,
      source: 'tiny-startups' as const,
      name: product.name,
      description: product.description,
      url: product.url.startsWith('http')
        ? product.url
        : `https://www.tinystartups.com${product.url}`,
      metrics: {
        founder: product.founder,
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
    const ideas = await fetchTinyStartups()

    if (ideas.length === 0) {
      console.log('No startups found. Check debug screenshot.')
      return
    }

    // JSONファイルに保存
    const outputPath = resolve(__dirname, '../data/tiny-startups.json')
    writeFileSync(outputPath, JSON.stringify(ideas, null, 2))
    console.log(`Saved to ${outputPath}`)

    // サマリー表示
    console.log('\n--- Top 10 Startups ---')
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
