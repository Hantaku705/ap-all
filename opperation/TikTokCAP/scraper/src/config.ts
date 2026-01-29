import { config as dotenvConfig } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// .env を読み込み（scraper/../.env）
dotenvConfig({ path: resolve(__dirname, '../../.env') })

export const config = {
  // Partner Center ログイン
  partnerCenter: {
    email: process.env.PARTNER_CENTER_EMAIL || '',
    password: process.env.PARTNER_CENTER_PASSWORD || '',
    baseUrl: 'https://partner.tiktokshop.com',
    productPoolUrl: 'https://partner.tiktokshop.com/affiliate-product-management/affiliate-product-pool?market=20',
  },

  // TikTok Shop API（Phase 2）
  api: {
    clientKey: process.env.TIKTOK_CLIENT_KEY || '',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
  },

  // Playwright
  playwright: {
    headless: process.env.HEADLESS === 'true',
    slowMo: 100, // ミリ秒
  },

  // パス
  paths: {
    cookies: resolve(__dirname, '../data/cookies'),
    products: resolve(__dirname, '../data/products'),
    logs: resolve(__dirname, '../data/logs'),
    cookieFile: resolve(__dirname, '../data/cookies/auth.json'),
  },
}

export function validateConfig(): void {
  const required = [
    ['PARTNER_CENTER_EMAIL', config.partnerCenter.email],
    ['PARTNER_CENTER_PASSWORD', config.partnerCenter.password],
  ]

  const missing = required.filter(([, value]) => !value)
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.map(([name]) => name).join(', ')}\n` +
      `Please copy .env.example to .env and fill in the values.`
    )
  }
}
