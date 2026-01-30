# Playwright認証付きスクレイピング構築パターン

認証が必要なサイトをPlaywrightでスクレイピングする際の構築パターン。

---

## いつ使うか

- ログインが必要なサイトからデータを取得したい
- Cookie/セッション管理が必要
- 2FA、CAPTCHA等で自動ログインが困難

---

## ディレクトリ構成テンプレート

```
[project]/
├── CLAUDE.md                    # セレクタ記録、トラブルシューティング
├── .env.example                 # 環境変数テンプレート
├── .gitignore                   # cookies/, .env, node_modules/
│
└── scraper/
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts             # CLIエントリー（login/scrapeコマンド）
    │   ├── config.ts            # 環境変数・設定管理
    │   │
    │   ├── playwright/
    │   │   ├── browser.ts       # ブラウザ起動、Cookie保存/読み込み
    │   │   ├── login.ts         # ログイン処理（手動対応）
    │   │   └── [target].ts      # スクレイピング対象ページ
    │   │
    │   └── types/
    │       └── [data].ts        # 取得データの型定義
    │
    └── data/                    # 出力（gitignore）
        ├── cookies/             # Cookie保存
        ├── [output]/            # 取得データ（JSON/CSV）
        └── logs/                # スクリーンショット、デバッグHTML
```

---

## 実装チェックリスト

### 1. プロジェクト初期化

- [ ] `package.json` 作成（playwright, dotenv, tsx）
- [ ] `tsconfig.json` 作成（ESM対応）
- [ ] `.env.example` 作成（認証情報テンプレート）
- [ ] `.gitignore` 作成（cookies/, .env, node_modules/）
- [ ] `CLAUDE.md` 作成（セレクタ記録用）

### 2. Playwright基盤

- [ ] `browser.ts` - ブラウザ起動、Cookie保存/読み込み
  - `storageState` でCookie永続化
  - `headless: false` で手動ログイン対応
- [ ] `login.ts` - ログイン処理
  - 手動ログインモード実装（waitForURL）
  - ログイン完了の自動検出

### 3. スクレイピング対象

- [ ] `[target].ts` - 対象ページのスクレイピング
  - ページネーション対応
  - エラーハンドリング
  - JSON/CSV出力

### 4. CLI

- [ ] `index.ts` - コマンドライン実行
  - `npm run login` - ログイン（Cookie保存）
  - `npm run scrape` - スクレイピング実行

---

## 手動ログインモードの実装パターン

```typescript
// login.ts
export async function login(): Promise<Page> {
  const page = await newPage()

  // 対象ページに直接アクセス
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' })

  // ログインページにリダイレクトされたかチェック
  if (page.url().includes('login')) {
    console.log('Manual login required...')
    console.log('Please login in the browser.')

    // ログイン完了を自動検出（対象ページに到達するまで待機）
    await page.waitForURL('**/target-path/**', { timeout: 300000 })
  }

  // Cookie保存
  await saveCookies()
  return page
}
```

---

## Cookie管理パターン

```typescript
// browser.ts
const COOKIE_PATH = './data/cookies/auth.json'

// Cookie読み込み
if (existsSync(COOKIE_PATH)) {
  context = await browser.newContext({
    storageState: COOKIE_PATH
  })
}

// Cookie保存
await context.storageState({ path: COOKIE_PATH })
```

---

## package.json スクリプト

```json
{
  "type": "module",
  "scripts": {
    "login": "tsx src/index.ts login",
    "scrape": "tsx src/index.ts scrape"
  },
  "dependencies": {
    "playwright": "^1.40.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.6.0"
  }
}
```

---

## トラブルシューティング

| 問題 | 原因 | 対策 |
|------|------|------|
| Cookieが効かない | セッション期限切れ | Cookieファイル削除→再ログイン |
| ログイン検出されない | URLパターン不一致 | waitForURLのパターン確認 |
| 要素が見つからない | UI変更 | CLAUDE.mdのセレクタ記録を更新 |
| タイムアウト | ページ読み込み遅い | timeout値を増やす |

---

## CLAUDE.md セレクタ記録テンプレート

```markdown
## セレクタ記録

UI変更時はここを更新。

| 要素 | セレクタ |
|------|---------|
| ログインフォーム | `input[type="email"]` |
| パスワード | `input[type="password"]` |
| 商品行 | `table tbody tr` |
| 次へボタン | `button:has-text("Next")` |
```

---

## 注意事項

1. **手動ログイン前提**: 2FA/CAPTCHA対応のため、初回は必ず手動ログイン
2. **headless: false**: 手動ログイン時はブラウザ表示必須
3. **Cookie期限**: 定期的に再ログインが必要（サイトによる）
4. **セレクタ変更リスク**: UI変更時はCLAUDE.mdに記録して対応
