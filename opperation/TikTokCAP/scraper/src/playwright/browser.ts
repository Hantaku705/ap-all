import { chromium, Browser, BrowserContext, Page } from 'playwright'
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { config } from '../config.js'

let browser: Browser | null = null
let context: BrowserContext | null = null

/**
 * ブラウザを起動
 */
export async function launchBrowser(): Promise<Browser> {
  if (browser) return browser

  console.log('Starting browser...')
  browser = await chromium.launch({
    headless: config.playwright.headless,
    slowMo: config.playwright.slowMo,
  })

  return browser
}

/**
 * Cookie付きのブラウザコンテキストを作成
 * 保存されたCookieがあれば読み込む
 */
export async function createContext(): Promise<BrowserContext> {
  if (context) return context

  const browserInstance = await launchBrowser()

  // Cookie保存先ディレクトリを確保
  const cookieDir = dirname(config.paths.cookieFile)
  if (!existsSync(cookieDir)) {
    mkdirSync(cookieDir, { recursive: true })
  }

  // 保存されたCookieがあれば読み込む
  if (existsSync(config.paths.cookieFile)) {
    console.log('Loading saved cookies...')
    context = await browserInstance.newContext({
      storageState: config.paths.cookieFile,
    })
  } else {
    console.log('No saved cookies found, starting fresh session')
    context = await browserInstance.newContext()
  }

  return context
}

/**
 * 新しいページを作成
 */
export async function newPage(): Promise<Page> {
  const ctx = await createContext()
  return ctx.newPage()
}

/**
 * 現在のCookieを保存
 */
export async function saveCookies(): Promise<void> {
  if (!context) {
    console.warn('No context to save cookies from')
    return
  }

  // Cookie保存先ディレクトリを確保
  const cookieDir = dirname(config.paths.cookieFile)
  if (!existsSync(cookieDir)) {
    mkdirSync(cookieDir, { recursive: true })
  }

  await context.storageState({ path: config.paths.cookieFile })
  console.log(`Cookies saved to ${config.paths.cookieFile}`)
}

/**
 * ログイン済みかチェック
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    const url = page.url()
    // ログインページにリダイレクトされていない = ログイン済み
    if (url.includes('login') || url.includes('signin') || url.includes('auth') || url.includes('sso')) {
      return false
    }
    // Partner Centerにいる = ログイン済み
    if (url.includes('partner.tiktokshop.com') && !url.includes('login')) {
      return true
    }
    return false
  } catch (error) {
    console.error('Error checking login status:', error)
    return false
  }
}

/**
 * ブラウザとコンテキストを閉じる
 */
export async function closeBrowser(): Promise<void> {
  if (context) {
    await context.close()
    context = null
  }
  if (browser) {
    await browser.close()
    browser = null
  }
  console.log('Browser closed')
}
