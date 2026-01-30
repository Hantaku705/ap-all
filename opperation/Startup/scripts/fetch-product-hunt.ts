/**
 * Product Hunt - GraphQL API
 * https://api.producthunt.com/v2/docs
 *
 * 要: アクセストークン（環境変数 PRODUCT_HUNT_TOKEN）
 * 取得方法: https://www.producthunt.com/v2/oauth/applications
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface StartupIdea {
  id: string
  source: 'product-hunt'
  name: string
  description: string
  url: string
  metrics?: {
    votes?: number
    commentsCount?: number
    featuredAt?: string
  }
  category?: string
  tags?: string[]
  japanExists: boolean
  fetchedAt: string
}

interface PHPost {
  id: string
  name: string
  tagline: string
  url: string
  votesCount: number
  commentsCount: number
  featuredAt: string
  topics: { edges: { node: { name: string } }[] }
}

interface PHResponse {
  data: {
    posts: {
      edges: { node: PHPost }[]
    }
  }
}

const GRAPHQL_ENDPOINT = 'https://api.producthunt.com/v2/api/graphql'

const QUERY = `
  query {
    posts(first: 50, order: VOTES) {
      edges {
        node {
          id
          name
          tagline
          url
          votesCount
          commentsCount
          featuredAt
          topics(first: 5) {
            edges {
              node {
                name
              }
            }
          }
        }
      }
    }
  }
`

async function fetchProductHunt(): Promise<StartupIdea[]> {
  const token = process.env.PRODUCT_HUNT_TOKEN

  if (!token) {
    console.error('Error: PRODUCT_HUNT_TOKEN not set')
    console.log('')
    console.log('To get a token:')
    console.log('1. Go to https://www.producthunt.com/v2/oauth/applications')
    console.log('2. Create a new application')
    console.log('3. Generate Developer Token')
    console.log('4. Run: PRODUCT_HUNT_TOKEN=your_token npx tsx fetch-product-hunt.ts')
    console.log('')
    console.log('Skipping Product Hunt...')
    return []
  }

  console.log('Fetching Product Hunt posts...')

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: QUERY }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error: ${res.status} - ${text}`)
  }

  const json = (await res.json()) as PHResponse

  const posts = json.data.posts.edges.map((edge) => edge.node)

  const ideas: StartupIdea[] = posts.map((post) => ({
    id: `product-hunt-${post.id}`,
    source: 'product-hunt' as const,
    name: post.name,
    description: post.tagline,
    url: post.url,
    metrics: {
      votes: post.votesCount,
      commentsCount: post.commentsCount,
      featuredAt: post.featuredAt,
    },
    category: post.topics.edges[0]?.node.name || undefined,
    tags: post.topics.edges.map((e) => e.node.name),
    japanExists: false,
    fetchedAt: new Date().toISOString(),
  }))

  console.log(`Total: ${ideas.length} products fetched`)
  return ideas
}

async function main() {
  try {
    const ideas = await fetchProductHunt()

    if (ideas.length === 0) {
      return
    }

    // JSONファイルに保存
    const outputPath = resolve(__dirname, '../data/product-hunt.json')
    writeFileSync(outputPath, JSON.stringify(ideas, null, 2))
    console.log(`Saved to ${outputPath}`)

    // サマリー表示
    console.log('\n--- Top 10 Products ---')
    ideas.slice(0, 10).forEach((idea, i) => {
      console.log(`${i + 1}. ${idea.name} (${idea.metrics?.votes} votes)`)
      console.log(`   ${idea.description}`)
    })
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
