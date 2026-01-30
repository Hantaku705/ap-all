import { chromium, Page } from "playwright";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = "https://anybrand-platform.vercel.app";
const SCREENSHOTS_DIR = path.join(__dirname, "../webapp/docs/anybrand/screenshots");

// 全ページ（AnyBrandは認証不要でアクセス可能）
const pages = [
  // 公開ページ
  { url: "/", name: "01-landing" },
  { url: "/login", name: "02-login" },
  { url: "/register", name: "03-register" },
  { url: "/terms", name: "04-terms" },
  { url: "/privacy", name: "05-privacy" },
  // 認証後ページ（モックデータ使用）
  { url: "/dashboard", name: "06-dashboard" },
  { url: "/products", name: "07-products" },
  // 商品詳細は撮影時に動的に取得
  { url: "/orders", name: "09-orders" },
  { url: "/commissions", name: "10-commissions" },
  { url: "/profile", name: "11-profile" },
  { url: "/settings", name: "12-settings" },
  { url: "/guide", name: "13-guide" },
];

async function captureScreenshot(page: Page, url: string, name: string) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  console.log(`📸 撮影中: ${name} (${fullUrl})`);

  try {
    await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000); // 追加の読み込み待機

    const filepath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`   ✅ 保存: ${filepath}`);
    return true;
  } catch (error) {
    console.error(`   ❌ エラー: ${error}`);
    return false;
  }
}

async function captureModal(
  page: Page,
  pageUrl: string,
  selector: string,
  name: string,
  waitTime = 1000
) {
  const fullUrl = `${BASE_URL}${pageUrl}`;
  console.log(`📸 モーダル撮影中: ${name}`);

  try {
    await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1000);

    // ボタンをクリックしてモーダルを開く
    const button = await page.$(selector);
    if (button) {
      await button.click();
      await page.waitForTimeout(waitTime);

      const filepath = path.join(SCREENSHOTS_DIR, `${name}.png`);
      await page.screenshot({ path: filepath, fullPage: false });
      console.log(`   ✅ 保存: ${filepath}`);
      return true;
    } else {
      console.log(`   ⚠️ ボタンが見つかりません: ${selector}`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ エラー: ${error}`);
    return false;
  }
}

async function captureAll() {
  console.log("=== AnyBrand スクリーンショット撮影 ===\n");
  console.log(`対象URL: ${BASE_URL}\n`);

  // ディレクトリ作成
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  let successCount = 0;
  let failCount = 0;

  // 全ページ撮影
  console.log("--- ページ撮影 ---");
  for (const p of pages) {
    const success = await captureScreenshot(page, p.url, p.name);
    if (success) successCount++;
    else failCount++;

    // 商品一覧ページの後に商品詳細を撮影
    if (p.name === "07-products" && success) {
      // 商品一覧ページのスクリーンショットを保存してから商品詳細へ
      await page.waitForTimeout(1000);
      // 最初の商品カードをクリック
      const productCard = await page.$('a[href^="/products/"]');
      if (productCard) {
        const href = await productCard.getAttribute("href");
        if (href) {
          const detailSuccess = await captureScreenshot(
            page,
            href,
            "08-product-detail"
          );
          if (detailSuccess) successCount++;
          else failCount++;
        }
      }
    }
  }

  // モーダル撮影
  console.log("\n--- モーダル撮影 ---");

  // AddAffiliateModal（商品一覧から）
  await page.goto(`${BASE_URL}/products`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const addButton = await page.$('button:has-text("追加")');
  if (addButton) {
    await addButton.click();
    await page.waitForTimeout(1000);
    const filepath = path.join(SCREENSHOTS_DIR, "14-add-modal.png");
    await page.screenshot({ path: filepath, fullPage: false });
    console.log(`   ✅ 保存: ${filepath}`);
    successCount++;
  } else {
    console.log("   ⚠️ 追加ボタンが見つかりません");
    failCount++;
  }

  // GetSampleModal（商品一覧から）
  await page.goto(`${BASE_URL}/products`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const sampleButton = await page.$('button:has-text("サンプル")');
  if (sampleButton) {
    await sampleButton.click();
    await page.waitForTimeout(1000);
    const filepath = path.join(SCREENSHOTS_DIR, "15-sample-modal.png");
    await page.screenshot({ path: filepath, fullPage: false });
    console.log(`   ✅ 保存: ${filepath}`);
    successCount++;
  } else {
    console.log("   ⚠️ サンプルボタンが見つかりません");
    failCount++;
  }

  // RequestPayoutModal（コミッションページから）
  await page.goto(`${BASE_URL}/commissions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const payoutButton = await page.$('button:has-text("振込申請")');
  if (payoutButton) {
    await payoutButton.click();
    await page.waitForTimeout(1000);
    const filepath = path.join(SCREENSHOTS_DIR, "16-payout-modal.png");
    await page.screenshot({ path: filepath, fullPage: false });
    console.log(`   ✅ 保存: ${filepath}`);
    successCount++;
  } else {
    console.log("   ⚠️ 振込申請ボタンが見つかりません");
    failCount++;
  }

  await browser.close();

  console.log("\n=== 完了 ===");
  console.log(`成功: ${successCount}, 失敗: ${failCount}`);
  console.log(`保存先: ${SCREENSHOTS_DIR}`);
}

// メイン実行
captureAll().catch(console.error);
