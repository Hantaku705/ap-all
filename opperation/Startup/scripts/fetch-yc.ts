/**
 * Y Combinator - 非公式API
 * https://github.com/yc-oss/api
 * 毎日更新される信頼性の高いAPI
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface YCCompany {
  id: number
  name: string
  slug: string
  former_names: string[]
  small_logo_thumb_url: string
  website: string
  all_locations: string
  long_description: string
  one_liner: string
  team_size: number
  industry: string
  subindustry: string
  launched_at: number
  tags: string[]
  tags_highlighted: string[]
  top_company: boolean
  isHiring: boolean
  nonprofit: boolean
  batch: string
  status: string
  industries: string[]
  regions: string[]
  stage: string
  app_video_public: boolean
  demo_day_video_public: boolean
  app_answers: null
  question_answers: boolean
  url: string
  api: string
}

interface StartupIdea {
  id: string
  source: 'yc'
  name: string
  description: string
  url: string
  metrics?: {
    funding?: string
    teamSize?: number
    batch?: string
  }
  category?: string
  tags?: string[]
  japanExists: boolean
  fetchedAt: string
}

async function fetchYCCompanies(): Promise<StartupIdea[]> {
  console.log('Fetching Y Combinator companies...')

  // 全企業リストを取得
  const allUrl = 'https://yc-oss.github.io/api/companies/all.json'
  const res = await fetch(allUrl)
  const allCompanies = await res.json() as YCCompany[]

  console.log(`Total companies in API: ${allCompanies.length}`)

  // 最新100社に絞る（launched_atでソート）
  const sortedCompanies = allCompanies
    .filter((c) => c.launched_at)
    .sort((a, b) => b.launched_at - a.launched_at)
    .slice(0, 100)

  console.log(`Filtered to latest 100 companies`)

  // StartupIdea形式に変換
  const ideas: StartupIdea[] = sortedCompanies.map((company) => ({
    id: `yc-${company.id}`,
    source: 'yc' as const,
    name: company.name,
    description: company.one_liner || company.long_description?.slice(0, 200) || '',
    url: company.website || `https://www.ycombinator.com/companies/${company.slug}`,
    metrics: {
      teamSize: company.team_size,
      batch: company.batch,
    },
    category: company.industry || company.subindustry,
    tags: company.tags,
    japanExists: false, // 手動で判定
    fetchedAt: new Date().toISOString(),
  }))

  console.log(`Total: ${ideas.length} companies fetched`)
  return ideas
}

async function main() {
  try {
    const ideas = await fetchYCCompanies()

    // JSONファイルに保存
    const outputPath = resolve(__dirname, '../data/yc.json')
    writeFileSync(outputPath, JSON.stringify(ideas, null, 2))
    console.log(`Saved to ${outputPath}`)

    // サマリー表示
    console.log('\n--- Top 10 Companies ---')
    ideas.slice(0, 10).forEach((idea, i) => {
      console.log(`${i + 1}. ${idea.name} (${idea.metrics?.batch})`)
      console.log(`   ${idea.description}`)
    })
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
