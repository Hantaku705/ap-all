# Startup - US B2B SaaS ケーススタディダッシュボード

米国B2B SaaSスタートアップ（EXIT済・成長中・IPO予定）を一覧化し、日本での事業機会を探索するWebappダッシュボード。

---

## 本番URL

https://us-saas-exit-dashboard.vercel.app

---

## 概要

| 項目 | 値 |
|------|-----|
| データ件数 | 211件（手動登録56件 + 発見155件） |
| ステータス | EXIT済21件、成長中30件、IPO予定5件、発見155件 |
| 対象規模 | $40M〜$70B（評価額含む） |
| 対象期間 | 2023-2025年 |
| カテゴリ | HR、マーケティング、FinOps、ナレッジ、オペレーション、開発ツール、AI/LLM、セキュリティ |
| ソース | Y Combinator、TechCrunch、Indie Hackers、手動登録 |

---

## 技術スタック

- Next.js 16.1.6 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Recharts（可視化）

---

## ページ構成

| パス | 内容 |
|-----|------|
| `/` | ダッシュボード（サマリー、カテゴリ別円グラフ、EXIT金額Top10、機会マトリクス） |
| `/exits` | 事例一覧（フィルター、ソート、検索、カード/テーブル切替） |
| `/exits/[id]` | 事例詳細（EXIT情報、日本市場分析、関連事例） |
| `/opportunities` | 機会分析（フィルター、機会スコア、成長中企業、カテゴリ別EXIT分析、推奨アクション） |
| `/sources` | 情報収集（海外スタートアップ情報ソース、アイデア一覧、フィルター・検索） |

---

## データ構造

```typescript
type CompanyStatus = 'exit' | 'growing' | 'ipo_planned' | 'discovery'
type DataSource = 'yc' | 'techcrunch' | 'indie-hackers' | 'product-hunt' | 'manual'

interface ExitCase {
  id: string
  company: string
  coreValue: string  // ビジネスモデル要約（10-20文字）
  description: string
  category: 'hr' | 'marketing' | 'finops' | 'knowledge' | 'operations' | 'devtools' | 'ai' | 'security'
  exitAmount: string
  exitAmountNum: number
  acquirer: string
  exitYear: number
  japanStatus: 'none' | 'small' | 'competitive'
  entryDifficulty: 'low' | 'medium' | 'high'
  opportunity: string
  sourceUrl?: string
  status: CompanyStatus
  valuation?: string
  fundingRound?: string
  source?: DataSource  // データの出所
}
```

---

## 主要ファイル

| ファイル | 用途 |
|---------|------|
| `webapp/src/data/exits-data.ts` | 統合データ（56件手動 + 155件自動変換 = 211件） |
| `webapp/src/data/sources-data.ts` | 情報収集ソース型定義・データ集約・ExitCase変換関数 |
| `webapp/src/data/sources/*.json` | 取得したスタートアップアイデアデータ |
| `webapp/src/app/page.tsx` | ダッシュボード |
| `webapp/src/data/translated-corevalues.json` | Discovery 155件のcoreValue日本語翻訳 |
| `webapp/src/app/exits/page.tsx` | 事例一覧（複数選択フィルター5種、ソート3種） |
| `webapp/src/app/exits/[id]/page.tsx` | 事例詳細 |
| `webapp/src/app/opportunities/page.tsx` | 機会分析 |
| `webapp/src/app/sources/page.tsx` | 情報収集（ソースフィルター・検索） |
| `webapp/src/components/charts/` | グラフコンポーネント |
| `scripts/fetch-*.ts` | データ取得スクリプト |

---

## 開発コマンド

```bash
cd opperation/Startup/webapp
npm run dev
```

---

## デプロイ

```bash
cd opperation/Startup/webapp
vercel --prod --yes
```

---

## 情報収集機能

海外スタートアップ情報サイトから自動でデータ取得し、タイムマシン経営のアイデア探索を支援。

### 対応ソース

| ソース | 方法 | データ件数 | 状態 |
|--------|------|-----------|------|
| Y Combinator | 非公式API (yc-oss) | 100件 | ✅ |
| TechCrunch | RSS | 37件 | ✅ |
| Indie Hackers | Puppeteer | 18件 | ✅ |
| Product Hunt | GraphQL API | - | ⏳トークン必要 |

### スクリプト実行

```bash
cd opperation/Startup/scripts

# 全ソース一括取得
npm run fetch:all

# 個別取得
npm run fetch:yc
npm run fetch:techcrunch
npm run fetch:indie
npm run fetch:ph  # PRODUCT_HUNT_TOKEN環境変数必要
```

### データ更新フロー

1. `npm run fetch:all` でデータ取得
2. `webapp/src/data/sources/` にJSONが保存される
3. `vercel --prod` で再デプロイ

---

## 日本参入 高機会領域

| 領域 | 代表企業 | 理由 |
|------|---------|------|
| ナレッジ管理AI | Zoomin, Guru | 日本企業の社内知識検索は未解決課題 |
| コンプライアンス自動化 | Drata | 中小企業のISMS取得を10倍簡単に |
| Agentic AIマーケティング | Qualified | 自律的リードジェネレーション |
| AI学習プラットフォーム | Sana | パーソナライズ人材開発 |
| レベニューインテリジェンス | Gong | 営業会話分析AI |
| CDP | mParticle | マーテック成熟度の低さから先行者利益 |

---

## データソース

- TechCrunch
- Salesforce News
- HubSpot IR
- Workday Newsroom
- ADP Media Center
- etc.

---

## チャットボット機能

Anthropic Claude APIを使用した壁打ち用チャットボット。56件のケーススタディを文脈として提供し、日本市場参入機会について対話形式で議論可能。

### 技術構成

| 項目 | 値 |
|------|-----|
| LLM | Anthropic Claude (claude-sonnet-4-20250514) |
| API | Next.js App Router Edge Runtime |
| UI | フローティングウィジェット（右下固定） |
| ストリーミング | あり（ReadableStream） |
| Markdown | react-markdown でレンダリング |

### キーボード操作

| キー | 動作 |
|------|------|
| Enter | 送信 |
| Command + Enter | 改行 |

### 関連ファイル

| ファイル | 説明 |
|---------|------|
| `webapp/src/app/api/chat/route.ts` | Chat APIエンドポイント |
| `webapp/src/components/chat/ChatWidget.tsx` | フローティングチャットUI |
| `webapp/src/components/chat/ChatMessage.tsx` | メッセージ表示コンポーネント |

### サンプル質問

- 「HR領域で日本参入しやすい企業は？」
- 「$10B以上の評価額の企業は？」
- 「AI/LLMカテゴリの成長中企業を教えて」
- 「Ripplingのビジネスモデルは？」

---

## 機会分析ページ機能

### フィルター（4種）
- カテゴリ（8種）
- 日本類似（3種）
- 参入難易度（3種）
- ステータス（4種）

### 機会スコア（0-100点）
| 条件 | 点数 |
|------|------|
| 日本類似なし | +40 |
| 日本類似あるが小さい | +20 |
| 参入難易度 低 | +30 |
| 参入難易度 中 | +15 |
| 評価額 $1B+ | +30 |
| 評価額 $500M+ | +20 |
| 評価額 $100M+ | +10 |

### カテゴリ別EXIT分析
| 指標 | 説明 |
|------|------|
| EXIT率 | EXIT件数 / 全件数 |
| 平均EXIT金額 | 算術平均 |
| 中央値 | 中央値（外れ値の影響を排除） |
| 最高額 | カテゴリ内最大EXIT金額 |
| トップ企業 | 最高額でEXITした企業 |

---

## 更新履歴

- 2026-01-30: **機会分析ページ全面改善**（フィルター4種、機会スコア0-100点、成長中企業セクション、カテゴリ別EXIT分析、推奨アクション自動化）
- 2026-01-30: **チャットボットUX改善**（Enter送信/Cmd+Enter改行、react-markdownでMarkdownレンダリング）
- 2026-01-30: **チャットボット機能追加**（Anthropic Claude API、56件ケーススタディ文脈、ストリーミング応答、フローティングウィジェットUI）
- 2026-01-30: **UI改善**（coreValue日本語化155件、フィルター複数選択化5種、MultiSelectFilterコンポーネント追加）
- 2026-01-30: **データ統合**（/sourcesの155件を/exitsに統合、211件統一表示、ソースフィルター追加、「発見」ステータス追加）
- 2026-01-30: 情報収集機能追加（/sourcesページ、4ソース自動スクレイピング、155件データ）
- 2026-01-30: コアバリュー列追加（テーブルに21件のビジネスモデル要約）
- 2026-01-30: 初版作成（21件のEXIT事例、4ページ構成、Vercelデプロイ）
