# AnyMind Monthly Report Dashboard

AnyMind Group Japan の月次レポートデータをWebダッシュボード化。

---

## サイト情報

| 項目 | 値 |
|------|-----|
| 本番URL | https://anymind-dashboard.vercel.app |
| 技術スタック | Next.js 16 + React 19 + TypeScript + Tailwind CSS + Recharts |
| データソース | Excel月次レポート（102シート） |

---

## ページ構成（4タブ）

| パス | 内容 |
|-----|------|
| `/` | Overview（Global/Japan KPI、YTD Summary、月次推移グラフ） |
| `/pl` | P/L Summary（売上・粗利・営利推移、マージン、Per Head、コスト内訳） |
| `/units` | Business Units（11事業部門予実比較、構成比円グラフ、ACM Rate・YoY） |
| `/budget` | Budget Progress（粗利・営利進捗率、ヒートマップテーブル） |

---

## フォルダ構成

```
projects/AnyMind/
├── CLAUDE.md                           # このファイル
├── 02_AJP_Monthly Report_2025_0130.xlsx # 元Excelファイル
├── csv/                                # CSV 102ファイル
│   ├── Group.csv
│   ├── BvA.csv
│   ├── Slide用.csv
│   ├── 予算進捗率.csv
│   └── ... (計102シート)
└── webapp/                             # Next.js Webアプリ
    ├── app/
    │   ├── page.tsx                    # Overview
    │   ├── pl/page.tsx                 # P/L Summary
    │   ├── units/page.tsx              # Business Units
    │   ├── budget/page.tsx             # Budget Progress
    │   ├── components/
    │   │   ├── KPICard.tsx             # KPIカードコンポーネント
    │   │   └── Tabs.tsx                # ナビゲーションタブ
    │   ├── data/
    │   │   └── report-data.ts          # 全データ（TypeScript）
    │   └── layout.tsx                  # 共通レイアウト
    └── package.json
```

---

## データ構造

### グループKPI（groupKPIs）

```typescript
{
  global: {
    revenue: { current: number, yoy: number },
    grossProfit: { current: number, yoy: number },
    operatingProfit: { current: number, yoy: number }
  },
  japan: {
    revenue: { current: number, yoy: number },
    grossProfit: { current: number, yoy: number },
    operatingProfit: { current: number, yoy: number },
    ytd: { revenue: number, grossProfit: number, operatingProfit: number }
  }
}
```

### 事業部門（businessUnits）

11事業部門のデータ:
- Marketing Partners
- Brand Commerce
- AnyTag
- AnyCreator
- AnyLogi
- AnyChat
- AnyX
- AnyFactory
- AnyDigital
- Pokemon-K/Tees
- Other

各事業部門: `{ name, budget, actual, acmRate, yoy }`

### 月別P/L（monthlyPL）

12ヶ月分のデータ:
- revenue, grossProfit, operatingProfit
- gpMargin, opMargin
- gpPerHead, opPerHead, headcount
- personnelCost, otherSGA, adminCost, engineerCost

### 予算進捗（budgetProgress）

```typescript
{
  grossProfit: [{ name, ytd, gap }],
  operatingProfit: [{ name, ytd, gap }]
}
```

---

## 開発コマンド

```bash
cd projects/AnyMind/webapp
npm run dev          # ローカル起動
npm run build        # ビルド
vercel --prod --yes  # 本番デプロイ
```

---

## よくある問題と解決策

### Recharts Tooltip formatter型エラー

```typescript
// NG
formatter={(value: number) => [...]}

// OK
formatter={(value) => [`${(value as number).toFixed(0)}`, '']}
```

### Pie chart label name undefined

```typescript
// NG
label={({ name, percent }) => `${name.substring(0, 8)}`}

// OK
label={({ name, percent }) => `${(name || '').substring(0, 8)}`}
```

---

## 更新履歴

- 2026-01-30: 初版作成（Excel 102シート→CSV変換、Webapp作成、Vercelデプロイ）
