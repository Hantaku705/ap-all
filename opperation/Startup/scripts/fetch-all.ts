/**
 * 統合スクリプト - 全ソースからデータを取得
 *
 * 利用可能なソース:
 * - Y Combinator (非公式API) ✅
 * - TechCrunch (RSS) ✅
 * - Indie Hackers (Puppeteer) ✅
 * - Product Hunt (GraphQL API) - 要トークン
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface StartupIdea {
  id: string
  source: string
  name: string
  description: string
  url: string
  metrics?: Record<string, unknown>
  category?: string
  tags?: string[]
  japanExists: boolean
  fetchedAt: string
}

interface FetchResult {
  source: string
  success: boolean
  count: number
  error?: string
}

async function runScript(scriptName: string): Promise<FetchResult> {
  const source = scriptName.replace('fetch-', '').replace('.ts', '')
  console.log(`\n📥 Running ${scriptName}...`)

  try {
    execSync(`npx tsx ${scriptName}`, {
      cwd: __dirname,
      stdio: 'inherit',
      timeout: 120000,
    })

    // 結果ファイルを確認
    const dataPath = resolve(__dirname, `../data/${source}.json`)
    if (existsSync(dataPath)) {
      const data = JSON.parse(readFileSync(dataPath, 'utf-8'))
      return { source, success: true, count: data.length }
    }
    return { source, success: false, count: 0, error: 'No output file' }
  } catch (error) {
    return { source, success: false, count: 0, error: String(error) }
  }
}

async function mergeAllData(): Promise<StartupIdea[]> {
  const dataDir = resolve(__dirname, '../data')
  const files = ['yc.json', 'techcrunch.json', 'indie-hackers.json', 'product-hunt.json']

  const allIdeas: StartupIdea[] = []

  for (const file of files) {
    const filePath = resolve(dataDir, file)
    if (existsSync(filePath)) {
      try {
        const data = JSON.parse(readFileSync(filePath, 'utf-8'))
        allIdeas.push(...data)
        console.log(`  ✅ ${file}: ${data.length} items`)
      } catch (error) {
        console.log(`  ❌ ${file}: Parse error`)
      }
    } else {
      console.log(`  ⏭️ ${file}: Not found`)
    }
  }

  return allIdeas
}

async function main() {
  console.log('🚀 Starting data fetch from all sources...\n')

  const results: FetchResult[] = []

  // 各スクリプトを順番に実行
  const scripts = [
    'fetch-yc.ts',
    'fetch-techcrunch.ts',
    'fetch-indie-hackers.ts',
  ]

  // Product Hunt（トークンがあれば実行）
  if (process.env.PRODUCT_HUNT_TOKEN) {
    scripts.push('fetch-product-hunt.ts')
  } else {
    console.log('⏭️ Skipping Product Hunt (no token)')
  }

  for (const script of scripts) {
    const result = await runScript(script)
    results.push(result)
  }

  // 結果をマージ
  console.log('\n📊 Merging all data...')
  const allIdeas = await mergeAllData()

  // 統合JSONを保存
  const outputPath = resolve(__dirname, '../data/all-sources.json')
  writeFileSync(outputPath, JSON.stringify(allIdeas, null, 2))
  console.log(`\n💾 Saved to ${outputPath}`)

  // サマリー表示
  console.log('\n' + '='.repeat(50))
  console.log('📈 FETCH SUMMARY')
  console.log('='.repeat(50))

  results.forEach((r) => {
    const icon = r.success ? '✅' : '❌'
    console.log(`${icon} ${r.source}: ${r.count} items`)
  })

  console.log('-'.repeat(50))
  console.log(`📦 Total: ${allIdeas.length} ideas`)
  console.log('='.repeat(50))

  // ソース別内訳
  const bySource = allIdeas.reduce(
    (acc, idea) => {
      acc[idea.source] = (acc[idea.source] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  console.log('\n📊 By Source:')
  Object.entries(bySource)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      console.log(`   ${source}: ${count}`)
    })
}

main().catch(console.error)
