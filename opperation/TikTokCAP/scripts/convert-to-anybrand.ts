/**
 * TikTokCAP products.json → AnyBrand Product形式に変換
 *
 * 使い方:
 * npx tsx convert-to-anybrand.ts
 *
 * 出力: opperation/TikTokCAP/webapp/src/data/products-data.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// TikTokCAP の商品型
interface TAPProduct {
  no: string
  priority: string
  brand: string
  product: string
  image: string
  imageUrl?: string
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
  price: string
  kolCheck: string
  draftCheck: string
  period: string
  sample: string
}

interface SyncData {
  syncedAt: string
  source: string
  totalCount: number
  products: TAPProduct[]
}

// AnyBrand の商品型
type ProductBadge = "top-selling" | "free-sample" | "new" | "hot"

interface Product {
  id: string
  name: string
  description: string
  price: number
  commissionRate: number
  imageUrl: string
  category: string
  categoryId: string
  brandName: string
  stock: number
  avgViews: number
  avgOrders: number
  status: "active" | "inactive"
  createdAt: string
  priceMin?: number
  priceMax?: number
  maxCommissionRate?: number
  earnPerSale: number
  badges: ProductBadge[]
  hasSample: boolean
  isTopSelling: boolean
  rating: number
  totalSold: number
  soldYesterday: number
  gmv: number
  // 追加フィールド
  affiliateUrl?: string
  shopUrl?: string
  campaignPeriod?: string
}

// カテゴリマッピング
const CATEGORY_MAP: Record<string, { name: string; id: string; slug: string }> = {
  'コスメ': { name: '美容・コスメ', id: 'beauty', slug: 'beauty' },
  'スキンケア': { name: '美容・コスメ', id: 'beauty', slug: 'beauty' },
  'アパレル': { name: 'ファッション', id: 'fashion', slug: 'fashion' },
  'アクセサリー': { name: 'ファッション', id: 'fashion', slug: 'fashion' },
  'ガジェット': { name: '家電・ガジェット', id: 'electronics', slug: 'electronics' },
  '食品': { name: '食品・健康', id: 'food', slug: 'food' },
  'スナック': { name: '食品・健康', id: 'food', slug: 'food' },
  'インナーケア': { name: '食品・健康', id: 'food', slug: 'food' },
  '健康': { name: '食品・健康', id: 'food', slug: 'food' },
  '日用品': { name: 'ホーム・インテリア', id: 'home', slug: 'home' },
  'おもちゃ': { name: 'その他', id: 'others', slug: 'others' },
  '不明': { name: 'その他', id: 'others', slug: 'others' },
}

// 価格パース: "¥1,890" → 1890
function parsePrice(priceStr: string): number {
  if (!priceStr) return 0
  const cleaned = priceStr.replace(/[¥,\s]/g, '')
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? 0 : num
}

// コミッション率パース: "15%" → 15
function parseCommissionRate(rateStr: string): number {
  if (!rateStr) return 10
  const cleaned = rateStr.replace(/[%\s]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 10 : num
}

// Google Drive URLをCDN形式に変換
function convertDriveUrl(url: string): string {
  if (!url) return ''
  // https://drive.google.com/uc?id=FILE_ID → https://lh3.googleusercontent.com/d/FILE_ID
  const match = url.match(/drive\.google\.com\/uc\?id=([^&]+)/)
  if (match) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`
  }
  return url
}

// バッジ決定
function determineBadges(tap: TAPProduct): ProductBadge[] {
  const badges: ProductBadge[] = []

  if (tap.priority === '高') {
    badges.push('hot')
  }
  if (tap.sample?.includes('サンプル')) {
    badges.push('free-sample')
  }
  // 新規商品（noが大きい）
  const no = parseInt(tap.no, 10)
  if (!isNaN(no) && no >= 250) {
    badges.push('new')
  }

  return badges
}

function convertProduct(tap: TAPProduct): Product {
  const price = parsePrice(tap.price)
  // 現在のコミッション率 = M列（open）を優先
  const commissionRate = parseCommissionRate(tap.open || tap.capRate || tap.netTapRate)
  // 最大コミッション率 = N列（grossTarget）を優先
  const maxCommissionRate = parseCommissionRate(tap.grossTarget || tap.open || tap.capRate)
  const categoryInfo = CATEGORY_MAP[tap.category] || CATEGORY_MAP['不明']
  const earnPerSale = Math.round(price * (commissionRate / 100))

  return {
    id: tap.no || `tap-${Date.now()}`,
    name: tap.product || '商品名なし',
    description: '',
    price,
    commissionRate,
    imageUrl: convertDriveUrl(tap.imageUrl) || convertDriveUrl(tap.image) || `https://placehold.co/400x400/f3f4f6/6b7280?text=${encodeURIComponent(tap.brand || 'Product')}`,
    category: categoryInfo.name,
    categoryId: categoryInfo.id,
    brandName: tap.brand || '不明',
    stock: 100,
    avgViews: 0,
    avgOrders: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    priceMin: price,
    priceMax: price,
    maxCommissionRate,
    earnPerSale,
    badges: determineBadges(tap),
    hasSample: tap.sample?.includes('サンプル') || false,
    isTopSelling: tap.priority === '高',
    rating: 4.5,
    totalSold: 0,
    soldYesterday: 0,
    gmv: 0,
    affiliateUrl: tap.tapLink || tap.capLink || '',
    shopUrl: tap.productUrl || '',
    campaignPeriod: tap.period || '',
  }
}

// メイン処理
const inputPath = path.join(__dirname, '../data/products.json')
const outputPath = path.join(__dirname, '../webapp/src/data/products-data.ts')

const syncData: SyncData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
const products: Product[] = syncData.products.map(convertProduct)

// カテゴリ集計
const categoryCount: Record<string, number> = {}
products.forEach(p => {
  categoryCount[p.categoryId] = (categoryCount[p.categoryId] || 0) + 1
})

// TypeScriptファイル生成
const tsContent = `/**
 * TikTokCAP スプレッドシートから同期した商品データ
 *
 * 同期日時: ${syncData.syncedAt}
 * ソース: ${syncData.source}
 * 商品数: ${products.length}件
 *
 * 自動生成ファイル - 直接編集しないでください
 * 更新: cd opperation/TikTokCAP/scripts && npx tsx convert-to-anybrand.ts
 */

import type { Product } from '../types'

export const products: Product[] = ${JSON.stringify(products, null, 2)} as Product[]

// カテゴリ別商品数
export const productCountByCategory = ${JSON.stringify(categoryCount, null, 2)}
`

fs.writeFileSync(outputPath, tsContent)

console.log(`
=== AnyBrand 商品データ変換完了 ===

入力: ${inputPath}
出力: ${outputPath}

商品数: ${products.length}件

【カテゴリ別】
${Object.entries(categoryCount)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, count]) => `  ${cat}: ${count}件`)
  .join('\n')}

【ブランド数】
${new Set(products.map(p => p.brandName)).size}社
`)
