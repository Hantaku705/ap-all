# TikTokCAP - TikTok Shop Affiliate プラットフォーム

## 概要

TikTok Shop Partner Centerのアフィリエイト案件管理ツール + AnyBrand Webapp を統合したプロジェクト。

| 項目 | 値 |
|------|-----|
| Webapp URL | https://anybrand-platform.vercel.app |
| スプレッドシート | https://docs.google.com/spreadsheets/d/1OnWqFD7Q9FfQaJ6-0pTI_DMXDdg12HDFiJboFYKjxzw |
| 技術スタック | Node.js + TypeScript + Playwright + Next.js 16 + Remotion |

---

## フォルダ構成

```
TikTokCAP/
├── CLAUDE.md           # このファイル
├── HANDOFF.md          # セッション引き継ぎ
├── .env, .env.example
├── data/
│   ├── products.json        # スプレッドシート同期データ（299件）
│   ├── images_by_row/       # xlsx抽出画像（142件）
│   └── image-mapping.json   # 行番号→画像マッピング
├── scraper/            # Playwright スクレイパー
│   └── src/
├── scripts/
│   ├── sync-spreadsheet.ts       # MCP→JSON変換
│   ├── convert-to-anybrand.ts    # AnyBrand形式変換
│   ├── screenshot-anystarr.ts    # anystarr.com スクリーンショット撮影
│   ├── screenshot-anybrand.ts    # AnyBrand スクリーンショット撮影
│   ├── extract-images.ts         # xlsx→画像抽出
│   ├── gas.js                    # GAS: Drive画像→G列URL書き込み
│   └── upload-images.ts          # imgBBアップロード（未使用）
├── source/             # 元CSVファイル
├── docs/               # 設計ドキュメント
│   ├── CLAUDE.md           # docsフォルダの説明
│   └── anystarr.md         # anystarr.com完全サイト構造マップ（1,223行）
└── webapp/docs/        # スクリーンショット・ドキュメント
    ├── anystarr/           # anystarr.com参考資料（15枚）
    └── anybrand/           # AnyBrandスクリーンショット（16枚）
└── webapp/             # AnyBrand Next.js Webapp
    ├── src/
    │   ├── app/        # App Router
    │   ├── components/
    │   ├── data/       # products-data.ts (299件)
    │   └── remotion/   # Remotion動画生成
    ├── out/            # Remotion出力
    └── package.json
```

---

## 1. スプレッドシート同期

### コマンド

```bash
/sync-tiktokcap
```

### 手動実行

```bash
cd scripts
npx tsx sync-spreadsheet.ts <MCPファイルパス>
```

### 同期データ

| 項目 | 値 |
|------|-----|
| 総商品数 | 299件 |
| ブランド数 | 47社 |
| カテゴリ | 12種類 |

---

## 2. スクレイピング

### セットアップ

```bash
cd scraper
npm install
npx playwright install chromium
```

### コマンド

| コマンド | 説明 |
|----------|------|
| `npm run login` | ログインしてCookie保存 |
| `npm run scrape` | 商品データ取得 |

---

## 3. AnyBrand Webapp

### ページ構成

| パス | 内容 |
|------|------|
| `/` | 商品グリッド（anystarr.com風、プロモバナー、ソートタブ、5列グリッド） |
| `/login` | ログイン |
| `/register` | 新規登録（3ステップ） |
| `/dashboard` | ダッシュボード（統計・グラフ・通知） |
| `/products` | 商品カタログ（検索・フィルター） |
| `/products/[id]` | 商品詳細（申請機能） |
| `/orders` | 注文履歴 |
| `/commissions` | コミッション管理 |
| `/settings` | 設定 |
| `/guide` | ガイド・ヘルプ |
| `/profile` | マイプロフィール（TikTok連携） |

### 開発コマンド

```bash
cd webapp

# 開発サーバー
npm run dev

# ビルド
npm run build

# 本番デプロイ
vercel --prod --yes

# Remotion Studio
npm run remotion

# Remotion動画生成
npm run remotion:render      # ProductVideo
npm run remotion:demo        # TikTokDemoVideo
```

### データ同期

```bash
# 1. スプレッドシート同期
/sync-tiktokcap

# 2. AnyBrand形式に変換
cd scripts
npx tsx convert-to-anybrand.ts

# 3. デプロイ
cd webapp
vercel --prod --yes
```

---

## 4. TikTokログイン連携

### 現在のステータス

| 環境 | Client Key | 状態 |
|------|------------|------|
| ローカル (localhost:3000) | Sandbox (`sb...`) | ✅ テスト可能 |
| 本番 (Vercel) | Production | ⏳ アプリ審査待ち |

### 環境変数

```bash
# webapp/.env.local（ローカル用 - Sandbox）
TIKTOK_CLIENT_KEY=sbawiwbkmavphg50ju
TIKTOK_CLIENT_SECRET=VLsLhZ8hOOVRoiW4Q1szeOEPGr3iIAYX
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

**重要**: TikTok Sandboxはlocalhostのみ対応。本番URLでは使用不可。

### TikTok Developer Portal設定

| 項目 | 状態 |
|------|------|
| App name | AnyBrand |
| URL検証 | ✅ 完了（/, /terms, /privacy） |
| Login Kit | ✅ 設定済み |
| Redirect URI | `http://localhost:3000/api/auth/callback/tiktok`（Sandbox）<br>`https://anybrand-platform.vercel.app/api/auth/callback/tiktok`（Production） |
| Scopes | `user.info.basic` |
| Production申請 | ⏳ 審査待ち |

### ローカルテスト手順

```bash
cd webapp
npm run dev
# http://localhost:3000/login を開く
# 「TikTokでログイン」をクリック
```

---

## 5. Remotion 動画生成

### コンポジション

| ID | 解像度 | 用途 |
|----|--------|------|
| `ProductVideo` | 1080x1920（縦） | 商品紹介動画（10秒） |
| `TikTokDemoVideo` | 1920x1080（横） | TikTok Developer Portal用デモ（40秒） |

### 出力ファイル

- `webapp/out/video.mp4` - ProductVideo
- `webapp/out/tiktok-demo.mp4` - TikTokDemoVideo（3.2MB）

---

## カテゴリマッピング

| TikTokCAP | AnyBrand |
|-----------|----------|
| コスメ/スキンケア | 美容・コスメ |
| 食品/スナック/インナーケア/健康 | 食品・健康 |
| ガジェット | 家電・ガジェット |
| アパレル/アクセサリー | ファッション |
| 日用品 | ホーム・インテリア |
| おもちゃ/不明 | その他 |

---

## 参考リンク

- [anyStarr公式](https://anystarr.com/)
- [TikTok Shop Affiliate](https://business.tiktokshop.com/us/affiliate)
- [Remotion公式](https://www.remotion.dev/)

---

## 更新履歴

- 2026-01-30: **anystarr.com UI/UX完全一致** - ランディング→商品グリッド化、サイドバー削除、TikTok Shopバナー、コミッション3段階カード、モーダルMethod 1/2形式
- 2026-01-30: **ドキュメント整備** - スクリーンショット31枚（anystarr 15枚 + AnyBrand 16枚）、Playwright自動撮影スクリプト2本
- 2026-01-29: **TikTok Developer Portal設定** - URL検証完了、Login Kit設定、Sandbox環境構築、Production審査待ち
- 2026-01-29: **F列画像→G列URL変換** - xlsx画像抽出（142件）、GASスクリプト作成、Driveアップロード待ち
- 2026-01-29: **フォルダ統合** - projects/anybrand をマージ、1フォルダ管理に移行
- 2026-01-29: **Remotion TikTokDemoVideo** - TikTok Developer Portal用デモ動画（40秒、8シーン、3.2MB）
- 2026-01-29: **Remotion統合** - ProductVideo（商品紹介10秒）、Studio/Player対応
- 2026-01-29: **QRコード実URL化** - AddAffiliateModalでproduct.affiliateUrl使用
- 2026-01-29: **TikTokログイン連携** - Auth.js v5、カスタムTikTok OAuthプロバイダー
- 2026-01-29: **Phase 3 実データ連携** - TikTokCAPスプレッドシート299件同期
- 2026-01-29: **anystarr.com UI/UX改善** - 商品一覧・詳細ページ全面改修
- 2026-01-29: AnyBrand連携スクリプト追加（`convert-to-anybrand.ts`）
- 2026-01-29: スプレッドシート同期機能追加（`/sync-tiktokcap`）
- 2026-01-29: Phase 1 スクレイピングツール作成
