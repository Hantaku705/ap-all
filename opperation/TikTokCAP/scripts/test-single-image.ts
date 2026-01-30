/**
 * 1件の商品ページから画像URLを取得してセレクタをテスト
 */

import { chromium } from 'playwright'

const TEST_URL = 'https://shop.tiktok.com/view/product/1731788179736528602?region=JP&locale=ja'

async function main() {
  console.log('=== TikTok Shop 画像セレクタテスト ===\n')
  console.log(`URL: ${TEST_URL}\n`)

  const browser = await chromium.launch({
    headless: true, // ヘッドレスモード
  })

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })
  const page = await context.newPage()

  try {
    await page.goto(TEST_URL, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    console.log('Page loaded. Current URL:', page.url())

    // 3秒待機
    await page.waitForTimeout(3000)

    // スクリーンショットを保存
    await page.screenshot({ path: '../data/test-page.png', fullPage: true })
    console.log('Screenshot saved to ../data/test-page.png')

    // 全てのimgタグを取得
    const allImages = await page.$$eval('img', (imgs) =>
      imgs.map((img) => ({
        src: img.src,
        alt: img.alt,
        className: img.className,
        width: img.width,
        height: img.height,
      }))
    )

    console.log('\n=== 見つかった画像 ===')
    allImages.forEach((img, i) => {
      if (img.src && (img.width > 100 || img.height > 100)) {
        console.log(`\n[${i + 1}] ${img.src.substring(0, 100)}...`)
        console.log(`    class: ${img.className}`)
        console.log(`    size: ${img.width}x${img.height}`)
      }
    })

    // ibyteimgを含む画像を探す
    const productImages = allImages.filter(
      (img) =>
        img.src &&
        (img.src.includes('ibyteimg') || img.src.includes('tiktokcdn') || img.src.includes('bytedance'))
    )

    console.log('\n=== TikTok CDN画像 ===')
    productImages.forEach((img, i) => {
      console.log(`\n[${i + 1}] ${img.src}`)
      console.log(`    size: ${img.width}x${img.height}`)
    })

    // 商品画像らしきものを特定
    const mainImage = productImages.find((img) => img.width > 200 && img.height > 200)
    if (mainImage) {
      console.log('\n=== メイン商品画像候補 ===')
      console.log(mainImage.src)
    }

    console.log('\nテスト完了')
  } finally {
    await browser.close()
  }
}

main().catch(console.error)
