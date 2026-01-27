# dashboard/

## 概要

Next.js 16ベースのダッシュボードアプリケーション。味の素ブランドのGoogle Trends、SNS分析、CEP分析を可視化。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS 4 |
| **可視化** | Recharts 3.6 |
| **Database** | Supabase (PostgreSQL) |
| **AI** | OpenAI, Gemini, Claude (マルチプロバイダー) |
| **テスト** | Playwright E2E |

## ディレクトリ構成

| ディレクトリ | 説明 |
|-------------|------|
| `src/` | ソースコード |
| `scripts/` | データ管理・分析スクリプト |
| `supabase/` | DBマイグレーション |
| `data/` | 出力データ |
| `tests/` | E2Eテスト |

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `package.json` | 依存関係・npm scripts |
| `next.config.ts` | Next.js設定 |
| `tsconfig.json` | TypeScript設定 |
| `tailwind.config.ts` | Tailwind CSS設定 |
| `postcss.config.mjs` | PostCSS設定 |
| `.env.local` | 環境変数（gitignore） |
| `.env.local.example` | 環境変数テンプレート |

## npm scripts

```bash
npm run dev           # 開発サーバー起動
npm run build         # プロダクションビルド
npm run start         # プロダクション起動
npm run lint          # ESLint実行
npm run fetch-trends  # Google Trends取得
```

## セットアップ

```bash
# 1. 依存関係インストール
npm install

# 2. 環境変数設定
cp .env.local.example .env.local
# → SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY を設定

# 3. 開発サーバー起動
npm run dev
```

## 関連ディレクトリ

- `../` - プロジェクトルート
- `../data/` - データソース
- `../research/` - 分析結果

## 注意事項

- `.env.local` は機密情報を含むためgitignore対象
- Supabaseスキーマ変更時は `supabase/migrations/` に新規マイグレーションを追加
- AIプロバイダーAPIキーは環境変数で管理
