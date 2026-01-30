---
description: "/sync-tiktokcap - TikTokCAP スプレッドシート同期"
---

# TikTokCAP スプレッドシート同期

Google スプレッドシートから TAP案件管理データを同期し、ローカルJSONに保存する。

## 実行手順

### 1. スプレッドシート読み取り

Google Docs MCP でデータ取得:

```
SpreadsheetID: 1OnWqFD7Q9FfQaJ6-0pTI_DMXDdg12HDFiJboFYKjxzw
シート: ALL
範囲: A3:AF303（ヘッダー + データ 300行）
```

使用ツール: `mcp__google-docs-mcp__readSpreadsheet`

### 2. データ変換

ヘッダー行（Row 3）をキーとして、各行をオブジェクトに変換:

```typescript
interface TAPProduct {
  no: string
  priority: string        // 優先度: 高/中/低
  brand: string
  product: string
  category: string        // カテゴリ
  grossTarget: string     // GROSS Target
  netTapRate: string      // NET TAP利率
  capRate: string         // CAP利率
  tapLink: string         // TAPリンク（クリエイター展開用）
  capLink: string         // CAPリンク
  productUrl: string      // 商品URL
  shopCode: string        // ショップコード
  campaignUrl: string     // キャンペーンURL
  bd: string              // BD担当
  price: string           // Price
  kolCheck: string        // KOL確認
  draftCheck: string      // 下書き確認
  period: string          // 期間
  sample: string          // サンプル
}
```

### 3. JSON保存

出力先: `opperation/TikTokCAP/data/products.json`

```json
{
  "syncedAt": "2026-01-29T12:00:00Z",
  "source": "https://docs.google.com/spreadsheets/d/1OnWqFD7Q9FfQaJ6-0pTI_DMXDdg12HDFiJboFYKjxzw",
  "totalCount": 300,
  "products": [...]
}
```

### 4. サマリー報告

同期完了後、以下を報告:

| 項目 | 内容 |
|------|------|
| 同期日時 | YYYY-MM-DD HH:MM |
| 総商品数 | N件 |
| ブランド数 | N社 |
| カテゴリ分布 | コスメ: X件、ガジェット: Y件、... |
| 優先度分布 | 高: X件、中: Y件、低: Z件 |

## カラムマッピング

| 列 | カラム名 | JSONキー |
|----|---------|----------|
| A | リストアップ対応者 | assignee |
| B | No | no |
| C | 優先度 | priority |
| D | Brand | brand |
| E | Product | product |
| F | image | image |
| G | カテゴリ | category |
| L | Open | open |
| M | GROSS Target | grossTarget |
| N | NET TAP利率 | netTapRate |
| O | CAP利率 | capRate |
| P | TAPリンク | tapLink |
| Q | CAPリンク | capLink |
| R | 商品URL | productUrl |
| S | ショップコード | shopCode |
| T | キャンペーンURL | campaignUrl |
| U | BD | bd |
| V | Category | categoryEn |
| W | Price | price |
| X | KOL確認 | kolCheck |
| Y | 下書き確認 | draftCheck |
| Z | 期間 | period |
| AA | サンプル | sample |
