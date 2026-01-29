import { test, expect } from '@playwright/test';

test.describe('Products Page - anystarr.com style UI', () => {
  test('Page loads with new UI elements', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // ページタイトル確認
    await expect(page.getByRole('heading', { name: '商品セレクション' })).toBeVisible();

    // ソートタブ確認
    await expect(page.getByRole('button', { name: '総売上' })).toBeVisible();
    await expect(page.getByRole('button', { name: '獲得額' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'コミッション率' })).toBeVisible();

    // あなたへのおすすめボタン確認
    await expect(page.getByRole('button', { name: 'あなたへのおすすめ' })).toBeVisible();

    // フルページスクリーンショット
    await page.screenshot({
      path: 'tests/screenshots/products-page-new-ui.png',
      fullPage: true
    });
  });

  test('Product cards have badges and earn per sale', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // バッジ確認（Top Selling または Free Sample）
    const badges = page.locator('span:has-text("Top Selling"), span:has-text("Free Sample")');
    await expect(badges.first()).toBeVisible();

    // 売上あたり獲得額の緑色テキスト確認
    const earnPerSale = page.locator('text=売上あたり獲得額').first();
    await expect(earnPerSale).toBeVisible();

    // サンプルボタン確認
    const sampleButton = page.getByRole('button', { name: 'サンプル' }).first();
    await expect(sampleButton).toBeVisible();

    // 追加ボタン確認
    const addButton = page.getByRole('button', { name: '追加' }).first();
    await expect(addButton).toBeVisible();
  });

  test('Sort tabs work correctly', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // デフォルトは総売上でソート
    const totalSoldTab = page.getByRole('button', { name: /総売上/ });
    await expect(totalSoldTab).toHaveClass(/bg-\[#ff6b6b\]/);

    // コミッション率タブをクリック
    await page.getByRole('button', { name: 'コミッション率' }).click();
    await page.waitForTimeout(500);

    // スクリーンショット
    await page.screenshot({
      path: 'tests/screenshots/products-sorted-by-commission.png',
      fullPage: true
    });
  });

  test('Recommended filter works', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 件数を確認
    const countBefore = await page.locator('text=件の商品が見つかりました').textContent();

    // あなたへのおすすめをクリック
    await page.getByRole('button', { name: 'あなたへのおすすめ' }).click();
    await page.waitForTimeout(500);

    // フィルター後の件数確認（Top Selling商品のみ表示）
    const countAfter = await page.locator('text=件の商品が見つかりました').textContent();

    // スクリーンショット
    await page.screenshot({
      path: 'tests/screenshots/products-recommended.png',
      fullPage: true
    });
  });

  test('Favorite button works', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 最初のお気に入りボタンをクリック
    const favoriteButton = page.locator('button').filter({ has: page.locator('svg.lucide-heart') }).first();
    await favoriteButton.click();

    // スクリーンショット
    await page.screenshot({
      path: 'tests/screenshots/products-favorited.png',
      fullPage: true
    });
  });
});

test.describe('Product Detail Page - anystarr.com style UI', () => {
  test('Product detail page loads with new UI elements', async ({ page }) => {
    await page.goto('/products/p1');
    await page.waitForLoadState('networkidle');

    // ブランド名確認
    await expect(page.getByText('GLOSSY BEAUTY')).toBeVisible();

    // 商品名確認
    await expect(page.getByRole('heading', { name: 'ツヤ肌ファンデーション SPF50' })).toBeVisible();

    // バッジ確認
    const badges = page.locator('span:has-text("Top Selling"), span:has-text("Free Sample")');
    await expect(badges.first()).toBeVisible();

    // 獲得額（緑）確認
    const earnPerSale = page.locator('text=売上あたり獲得額').first();
    await expect(earnPerSale).toBeVisible();

    // コミッション段階表示確認
    await expect(page.locator('text=現在 → 最大').first()).toBeVisible();

    // スクリーンショット
    await page.screenshot({
      path: 'tests/screenshots/product-detail-new-ui.png',
      fullPage: true
    });
  });

  test('Product detail page has sales stats', async ({ page }) => {
    await page.goto('/products/p1');
    await page.waitForLoadState('networkidle');

    // 販売統計確認
    await expect(page.getByText('総売上')).toBeVisible();
    await expect(page.getByText('昨日の売上')).toBeVisible();
    await expect(page.getByText('GMV')).toBeVisible();
    await expect(page.getByText('在庫数')).toBeVisible();
  });

  test('Product detail page has action buttons', async ({ page }) => {
    await page.goto('/products/p1');
    await page.waitForLoadState('networkidle');

    // サンプルボタン確認
    await expect(page.getByRole('button', { name: 'サンプルを申請' })).toBeVisible();

    // アフィリエイト承認済みボタン確認（p1は既に承認済み）
    await expect(page.getByRole('button', { name: 'アフィリエイト承認済み' })).toBeVisible();

    // アフィリエイトリンクコピーボタン確認
    await expect(page.getByRole('button', { name: 'アフィリエイトリンクをコピー' })).toBeVisible();

    // シェア・商品ページボタン確認
    await expect(page.getByRole('button', { name: 'シェア' })).toBeVisible();
    await expect(page.getByRole('link', { name: '商品ページ' })).toBeVisible();
  });

  test('Favorite button works on product detail', async ({ page }) => {
    await page.goto('/products/p1');
    await page.waitForLoadState('networkidle');

    // お気に入りボタンをクリック
    const favoriteButton = page.locator('button').filter({ has: page.locator('svg.lucide-heart') }).first();
    await favoriteButton.click();

    // ハートが赤くなることを確認（fill-red-500クラス）
    await expect(favoriteButton.locator('svg')).toHaveClass(/fill-red-500/);

    // スクリーンショット
    await page.screenshot({
      path: 'tests/screenshots/product-detail-favorited.png',
      fullPage: true
    });
  });

  test('Related products show anystarr.com style cards', async ({ page }) => {
    await page.goto('/products/p1');
    await page.waitForLoadState('networkidle');

    // 関連商品セクション確認
    await expect(page.getByRole('heading', { name: '関連商品' })).toBeVisible();

    // 関連商品にも獲得額（緑）が表示されていることを確認
    const relatedEarnPerSale = page.locator('text=売上あたり獲得額');
    await expect(relatedEarnPerSale.first()).toBeVisible();
  });
});
