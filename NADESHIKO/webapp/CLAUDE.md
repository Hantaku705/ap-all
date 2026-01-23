# NADESHIKO/webapp - 売上管理ダッシュボード

NADESHIKO事業の売上・粗利・パフォーマンスを管理・可視化するNext.js Webアプリ。

---

## 概要

| 項目 | 値 |
|------|-----|
| 本番URL | https://nadeshiko-sales.vercel.app |
| 技術スタック | Next.js 16.1.4 + React 19 + Recharts + Tailwind CSS |

---

## 3タブ構成

| タブ | 内容 | 主要機能 |
|-----|------|---------|
| Dashboard | KPIサマリー | 売上/粗利/達成率、月次推移グラフ、AJP/RCP比率 |
| Deals | 案件一覧 | テーブル表示、フィルター |
| Performance | パフォーマンス分析 | 担当者別/アカウント別/クライアント別ランキング、年/四半期フィルター、時系列グラフ |

---

## AIチャット機能

| 項目 | 値 |
|------|-----|
| LLM | OpenAI GPT-4o-mini |
| API | /api/chat/route.ts |
| UI | ChatWidget（右下フローティング） |
| キー操作 | Enter=送信、Shift+Enter=改行 |

---

## データ構造

### 粗利計算ロジック

| 区分 | 計算式 | 粗利率 |
|------|--------|-------|
| AJP（自社） | 粗利 = 売上 | 100% |
| RCP（外部） | 粗利 = 売上 - 支払費用60% | 約40% |

---

## フォルダ構成

```
webapp/
├── src/
│   ├── app/
│   │   ├── page.tsx            # メインページ（3タブ）
│   │   ├── layout.tsx          # EditProvider
│   │   └── api/chat/route.ts   # OpenAI APIエンドポイント
│   ├── components/
│   │   ├── layout/             # Header, TabNavigation
│   │   ├── dashboard/          # KPICards, Charts
│   │   ├── deals/              # DealsContent
│   │   ├── performance/        # PerformanceContent, TrendChart
│   │   └── chat/               # ChatWidget
│   ├── contexts/
│   │   └── EditContext.tsx     # 状態管理
│   ├── data/
│   │   ├── deals-data.ts       # 案件データ（CSVから変換）
│   │   ├── targets-data.ts     # 月別目標
│   │   └── constants.ts        # 定数
│   ├── lib/
│   │   ├── calculations.ts     # 粗利計算、集計、時系列
│   │   └── formatters.ts       # 金額フォーマット
│   └── types/
│       └── deal.ts             # 型定義
└── package.json
```

---

## 開発コマンド

```bash
npm run dev    # 開発サーバー起動
npm run build  # ビルド
```

## デプロイ

```bash
vercel --prod --yes
```

---

## 環境変数

| 変数名 | 用途 |
|--------|------|
| OPENAI_API_KEY | OpenAI API認証 |

---

## 更新履歴

- 2026-01-23: AIチャット機能追加、年/四半期フィルター、Settingsタブ削除、編集モード削除
- 2026-01-23: 初版作成（4タブWebapp、Vercelデプロイ）
