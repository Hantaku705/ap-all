# TikTokCAP - TikTok Shop Affiliate案件管理ツール

## 概要

TikTok Shop Partner Centerのアフィリエイト案件管理ツール。スプレッドシート同期機能とスクレイピング機能を提供。

| 項目 | 値 |
|------|-----|
| スプレッドシート | https://docs.google.com/spreadsheets/d/1OnWqFD7Q9FfQaJ6-0pTI_DMXDdg12HDFiJboFYKjxzw |
| 対象URL | https://partner.tiktokshop.com/affiliate-product-management/affiliate-product-pool?market=20 |
| 技術スタック | Node.js + TypeScript + Playwright + Google Docs MCP |

---

## スプレッドシート同期（推奨）

### コマンド

Claude Code上で `/sync-tiktokcap` を実行すると、スプレッドシートからデータを同期。

### 手動実行

1. Google Docs MCP でスプレッドシート読み取り
2. 出力ファイルパスを取得
3. 変換スクリプト実行:
   ```bash
   cd scripts
   npx tsx sync-spreadsheet.ts <出力ファイルパス>
   ```
4. `data/products.json` に同期データが出力

### 同期データ

| 項目 | 値 |
|------|-----|
| 総商品数 | 299件 |
| ブランド数 | 47社 |
| カテゴリ | 12種類 |

---

## スクレイピング

### セットアップ

```bash
cd scraper
npm install
npx playwright install chromium
cp ../.env.example ../.env
# .env にログイン情報を設定
```

### コマンド

| コマンド | 説明 |
|----------|------|
| `npm run login` | ログインしてCookie保存 |
| `npm run scrape` | 商品データ取得 |

---

## フォルダ構成

```
TikTokCAP/
├── CLAUDE.md
├── .env.example
├── .gitignore
├── data/
│   └── products.json         # スプレッドシート同期データ（299件）
├── scripts/
│   ├── sync-spreadsheet.ts   # MCP出力→JSON変換スクリプト
│   └── convert-to-anybrand.ts # AnyBrand形式変換スクリプト
├── scraper/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts          # CLIエントリー
│   │   ├── config.ts         # 設定管理
│   │   ├── playwright/       # Playwrightスクレイパー
│   │   ├── api/              # 公式API（Phase 2）
│   │   └── types/            # 型定義
│   └── data/                 # スクレイピング出力（gitignore）
├── source/
│   └── *.csv                 # 元CSVファイル
└── docs/
```

---

## セレクタ記録

UI変更時はここに記録して更新。

| 要素 | セレクタ |
|------|---------|
| ログインメール入力 | `input[name="email"]` または `#email` |
| ログインパスワード入力 | `input[name="password"]` または `#password` |
| ログインボタン | `button[type="submit"]` |
| 商品テーブル | `.product-table` または `table` |
| 商品行 | `tr.product-row` または `tbody tr` |
| ページネーション次へ | `.pagination-next` または `button:has-text("Next")` |

※実際のセレクタはログイン後に確認・更新

---

## 取得データ形式

```typescript
interface Product {
  id: string
  name: string
  image: string
  price: number
  commission: number      // コミッション率（%）
  commissionAmount: number // コミッション金額
  category: string
  seller: string
  stock: number
  sales: number          // 販売数
  url: string
}
```

---

## トラブルシューティング

### Cookie期限切れ

```bash
rm -rf scraper/data/cookies/*
npm run login
```

### セレクタ変更

1. `npm run login` でブラウザ起動
2. DevToolsでセレクタ確認
3. このCLAUDE.mdのセレクタ記録を更新
4. `src/playwright/*.ts` を修正

---

## AnyBrand連携

TikTokCAPの商品データをAnyBrand Webappに連携。

### 変換コマンド

```bash
cd scripts
npx tsx convert-to-anybrand.ts
```

### 出力先

`projects/anybrand/webapp/src/data/products-data.ts`（299件）

### カテゴリマッピング

| TikTokCAP | AnyBrand |
|-----------|----------|
| コスメ/スキンケア | 美容・コスメ |
| 食品/スナック/インナーケア/健康 | 食品・健康 |
| ガジェット | 家電・ガジェット |
| アパレル/アクセサリー | ファッション |
| 日用品 | ホーム・インテリア |
| おもちゃ/不明 | その他 |

---

## 更新履歴

- 2026-01-29: AnyBrand連携スクリプト追加（`convert-to-anybrand.ts`、299件変換、カテゴリ12→6統合）
- 2026-01-29: スプレッドシート同期機能追加（`/sync-tiktokcap`、`scripts/sync-spreadsheet.ts`、299件同期成功）
- 2026-01-29: Phase 1 スクレイピングツール作成（Playwright + TypeScript）
