# Startup - US B2B SaaS EXIT事例ダッシュボード

米国でM&AでEXITしたB2B SaaSスタートアップを一覧化し、日本での事業機会を探索するWebappダッシュボード。

---

## 本番URL

https://us-saas-exit-dashboard.vercel.app

---

## 概要

| 項目 | 値 |
|------|-----|
| データ件数 | 21件 |
| 対象規模 | $40M〜$4.1B |
| 対象期間 | 2023-2025年 |
| カテゴリ | HR、マーケティング、FinOps、ナレッジ、オペレーション |

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
| `/opportunities` | 機会分析（優先度マトリクス、カテゴリ別分析、日本競合比較） |

---

## データ構造

```typescript
interface ExitCase {
  id: string
  company: string
  coreValue: string  // ビジネスモデル要約（10-20文字）
  description: string
  category: 'hr' | 'marketing' | 'finops' | 'knowledge' | 'operations'
  exitAmount: string
  exitAmountNum: number
  acquirer: string
  exitYear: number
  japanStatus: 'none' | 'small' | 'competitive'
  entryDifficulty: 'low' | 'medium' | 'high'
  opportunity: string
  sourceUrl?: string
}
```

---

## 主要ファイル

| ファイル | 用途 |
|---------|------|
| `webapp/src/data/exits-data.ts` | 21件のEXIT事例データ |
| `webapp/src/app/page.tsx` | ダッシュボード |
| `webapp/src/app/exits/page.tsx` | 事例一覧（フィルター・ソート） |
| `webapp/src/app/exits/[id]/page.tsx` | 事例詳細 |
| `webapp/src/app/opportunities/page.tsx` | 機会分析 |
| `webapp/src/components/charts/` | グラフコンポーネント |

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

## 更新履歴

- 2026-01-30: コアバリュー列追加（テーブルに21件のビジネスモデル要約）
- 2026-01-30: 初版作成（21件のEXIT事例、4ページ構成、Vercelデプロイ）
