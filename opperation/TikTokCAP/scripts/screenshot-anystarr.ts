import { chromium, Browser, Page } from "playwright";
import * as fs from "fs";
import * as path from "path";

const COOKIES_PATH = path.join(__dirname, "anystarr-cookies.json");
const SCREENSHOTS_DIR = path.join(
  __dirname,
  "../webapp/docs/screenshots/anystarr"
);

// 公開ページ（ログイン不要）
const publicPages = [
  { url: "https://anystarr.com/", name: "01-landing" },
  { url: "https://anystarr.com/login", name: "02-login" },
  { url: "https://anystarr.com/register", name: "03-register" },
  { url: "https://anystarr.com/helpCenter", name: "04-help-center" },
  { url: "https://anystarr.com/helpCenter?key=1.1", name: "05-help-welcome" },
  { url: "https://anystarr.com/helpCenter?key=2.1", name: "06-help-guide" },
  { url: "https://anystarr.com/helpCenter?key=3.1", name: "07-help-account" },
  {
    url: "https://anystarr.com/Terms_and_Conditions_anyStarr.html",
    name: "08-terms",
  },
  { url: "https://anystarr.com/privacy_policy.html", name: "09-privacy" },
];

// 認証後ページ（ログイン必要）
const authPages = [
  { url: "https://app.anystarr.com/en/dashboard", name: "10-dashboard" },
  { url: "https://app.anystarr.com/en/products", name: "11-products" },
  // 商品詳細は撮影時に動的に取得
  { url: "https://app.anystarr.com/en/samples", name: "13-samples" },
  { url: "https://app.anystarr.com/en/orders", name: "14-orders" },
  { url: "https://app.anystarr.com/en/commissions", name: "15-commissions" },
  { url: "https://app.anystarr.com/en/profile", name: "16-profile" },
  { url: "https://app.anystarr.com/en/settings", name: "17-settings" },
];

async function login() {
  console.log("=== 手動ログインモード ===");
  console.log("ブラウザが開きます。anystarr.comにログインしてください。");
  console.log("ログイン完了後、ターミナルでEnterを押してください。\n");

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  await page.goto("https://anystarr.com/login");

  // ユーザーがログインするまで待機
  await new Promise<void>((resolve) => {
    process.stdin.once("data", () => resolve());
  });

  // Cookieを保存
  const cookies = await context.cookies();
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
  console.log(`\n✅ Cookieを保存しました: ${COOKIES_PATH}`);

  await browser.close();
}

async function captureScreenshot(page: Page, url: string, name: string) {
  console.log(`📸 撮影中: ${name} (${url})`);

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
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

async function captureAll() {
  console.log("=== スクリーンショット撮影モード ===\n");

  // ディレクトリ作成
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  // Cookieがあれば読み込み
  if (fs.existsSync(COOKIES_PATH)) {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, "utf-8"));
    await context.addCookies(cookies);
    console.log("✅ Cookie読み込み完了\n");
  } else {
    console.log("⚠️ Cookieファイルがありません。公開ページのみ撮影します。\n");
  }

  const page = await context.newPage();
  let successCount = 0;
  let failCount = 0;

  // 公開ページ撮影
  console.log("--- 公開ページ ---");
  for (const p of publicPages) {
    const success = await captureScreenshot(page, p.url, p.name);
    if (success) successCount++;
    else failCount++;
  }

  // 認証後ページ撮影（Cookieがある場合のみ）
  if (fs.existsSync(COOKIES_PATH)) {
    console.log("\n--- 認証後ページ ---");

    for (const p of authPages) {
      const success = await captureScreenshot(page, p.url, p.name);
      if (success) successCount++;
      else failCount++;

      // 商品一覧ページの後に商品詳細を撮影
      if (p.name === "11-products") {
        // 商品一覧から最初の商品リンクを取得
        const productLink = await page.$("a[href*='/products/']");
        if (productLink) {
          const href = await productLink.getAttribute("href");
          if (href) {
            const productUrl = href.startsWith("http")
              ? href
              : `https://app.anystarr.com${href}`;
            const success = await captureScreenshot(
              page,
              productUrl,
              "12-product-detail"
            );
            if (success) successCount++;
            else failCount++;
          }
        }
      }
    }
  }

  await browser.close();

  console.log("\n=== 完了 ===");
  console.log(`成功: ${successCount}, 失敗: ${failCount}`);
  console.log(`保存先: ${SCREENSHOTS_DIR}`);
}

// メイン
const args = process.argv.slice(2);

if (args.includes("--login")) {
  login().catch(console.error);
} else if (args.includes("--capture")) {
  captureAll().catch(console.error);
} else {
  console.log("使用方法:");
  console.log("  npx tsx screenshot-anystarr.ts --login   # 手動ログイン");
  console.log("  npx tsx screenshot-anystarr.ts --capture # スクリーンショット撮影");
}
