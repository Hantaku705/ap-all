import { Page } from 'playwright'
import { config } from '../config.js'
import { newPage, saveCookies, closeBrowser } from './browser.js'

const PRODUCT_POOL_URL = 'https://partner.tiktokshop.com/affiliate-product-management/affiliate-product-pool?market=20'

/**
 * ログイン状態をチェック
 */
async function checkLoginStatus(page: Page): Promise<boolean> {
  const url = page.url()
  // ログインページにリダイレクトされていない = ログイン済み
  if (url.includes('login') || url.includes('signin') || url.includes('auth') || url.includes('sso')) {
    return false
  }
  // 商品プールページにいる = ログイン済み
  if (url.includes('affiliate-product-management') || url.includes('partner.tiktokshop.com')) {
    return true
  }
  return false
}

/**
 * Partner Centerにログイン（手動モード）
 */
export async function login(): Promise<Page> {
  console.log('Starting login process...')
  console.log('Opening product pool page...')

  const page = await newPage()

  // 商品プールページに直接アクセス
  await page.goto(PRODUCT_POOL_URL, { waitUntil: 'networkidle', timeout: 60000 })

  // 現在のURLを確認
  let url = page.url()
  console.log('Current URL:', url)

  // ログイン済みかチェック
  if (await checkLoginStatus(page)) {
    console.log('Already logged in!')
    await saveCookies()
    return page
  }

  // ログインが必要
  console.log('\n========================================')
  console.log('  MANUAL LOGIN REQUIRED')
  console.log('========================================')
  console.log('')
  console.log('ブラウザでログインしてください。')
  console.log('ログインが完了したら、Enterキーを押してください。')
  console.log('')
  console.log('※ 2FA、CAPTCHA、その他の認証も手動で完了してください。')
  console.log('========================================\n')

  // スクリーンショットを撮る
  await page.screenshot({ path: config.paths.logs + '/login-page.png' })
  console.log('Screenshot saved to logs/login-page.png')

  // ログイン完了を自動検出（商品プールページに到達するまで待機）
  console.log('Waiting for login to complete...')
  console.log('商品プールページに到達するまで待機します...\n')

  try {
    await page.waitForURL('**/affiliate-product-management/**', { timeout: 300000 }) // 5分待機
    console.log('\nLogin detected!')
  } catch {
    // タイムアウトの場合、手動でEnterキー入力を求める
    console.log('\nTimeout waiting for automatic detection.')
    console.log('ログインが完了したらEnterキーを押してください...')
    await new Promise<void>((resolve) => {
      process.stdin.resume()
      process.stdin.once('data', () => {
        process.stdin.pause()
        resolve()
      })
    })
  }

  // ログイン完了を確認
  url = page.url()
  console.log('Current URL after login:', url)

  if (await checkLoginStatus(page)) {
    // Cookieを保存
    await saveCookies()
    console.log('Login successful! Cookies saved.')
  } else {
    console.warn('Warning: May not be fully logged in. Current URL:', url)
    // それでもCookieを保存（部分的に有効な場合がある）
    await saveCookies()
  }

  return page
}

/**
 * ログインを実行してブラウザを閉じる
 */
export async function loginAndClose(): Promise<void> {
  try {
    await login()
    console.log('\nLogin completed successfully!')
    console.log('Cookies have been saved for future sessions.')
  } finally {
    await closeBrowser()
  }
}
