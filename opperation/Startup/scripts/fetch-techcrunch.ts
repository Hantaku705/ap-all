/**
 * TechCrunch - RSS Feed
 * スタートアップ・資金調達関連の記事を取得
 */

import Parser from 'rss-parser'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface StartupIdea {
  id: string
  source: 'techcrunch'
  name: string
  description: string
  url: string
  metrics?: {
    publishedAt?: string
    category?: string
  }
  category?: string
  tags?: string[]
  japanExists: boolean
  fetchedAt: string
}

const RSS_FEEDS = [
  {
    url: 'https://techcrunch.com/category/startups/feed/',
    category: 'startups',
  },
  {
    url: 'https://techcrunch.com/category/venture/feed/',
    category: 'venture',
  },
]

async function fetchTechCrunch(): Promise<StartupIdea[]> {
  console.log('Fetching TechCrunch RSS feeds...')

  const parser = new Parser()
  const allItems: StartupIdea[] = []

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`  Fetching ${feed.category}...`)
      const result = await parser.parseURL(feed.url)

      const items = result.items.map((item, index) => ({
        id: `techcrunch-${feed.category}-${Date.now()}-${index}`,
        source: 'techcrunch' as const,
        name: item.title || 'Untitled',
        description: item.contentSnippet?.slice(0, 300) || item.content?.slice(0, 300) || '',
        url: item.link || '',
        metrics: {
          publishedAt: item.pubDate,
          category: feed.category,
        },
        category: feed.category,
        tags: item.categories || [],
        japanExists: false,
        fetchedAt: new Date().toISOString(),
      }))

      allItems.push(...items)
      console.log(`    ${items.length} articles`)
    } catch (err) {
      console.error(`  Failed to fetch ${feed.category}:`, err)
    }
  }

  // 重複を除去（同じURLは1つに）
  const uniqueItems = allItems.filter(
    (item, index, self) => self.findIndex((t) => t.url === item.url) === index
  )

  console.log(`Total: ${uniqueItems.length} unique articles`)
  return uniqueItems
}

async function main() {
  try {
    const ideas = await fetchTechCrunch()

    // JSONファイルに保存
    const outputPath = resolve(__dirname, '../data/techcrunch.json')
    writeFileSync(outputPath, JSON.stringify(ideas, null, 2))
    console.log(`Saved to ${outputPath}`)

    // サマリー表示
    console.log('\n--- Latest 10 Articles ---')
    ideas.slice(0, 10).forEach((idea, i) => {
      console.log(`${i + 1}. [${idea.category}] ${idea.name}`)
      console.log(`   ${idea.description?.slice(0, 80)}...`)
    })
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
