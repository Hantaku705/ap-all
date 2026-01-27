# charts/

## 概要

Rechartsを使用した可視化コンポーネント。ダッシュボードの各タブで使用。

## ファイル一覧

### トレンド・時系列

| ファイル | 説明 | タブ |
|---------|------|------|
| `TrendLineChart.tsx` | 時系列折れ線グラフ（Google Trends / SNS言及数 切り替え） | トレンド推移 |

### 相関・季節性

| ファイル | 説明 | タブ |
|---------|------|------|
| `CorrelationHeatmap.tsx` | 8×8相関ヒートマップ | 相関分析 |
| `SeasonalityChart.tsx` | 月別棒グラフ | 季節性 |

### SNS分析

| ファイル | 説明 | タブ |
|---------|------|------|
| `MentionShareChart.tsx` | SNS言及シェア棒グラフ | SNS分析 |
| `CooccurrenceHeatmap.tsx` | SNS共起マトリクス | SNS分析 |
| `SentimentChart.tsx` | センチメント分析棒グラフ | SNS分析 |

### CEP分析

| ファイル | 説明 | タブ |
|---------|------|------|
| `CEPHeatmap.tsx` | CEP×ブランドマトリクス | CEP分析 |
| `CEPPortfolio.tsx` | 4象限ポートフォリオ | CEP分析 |
| `CEPRanking.tsx` | ブランド別CEPランキング | CEP分析 |

### 関連KW

| ファイル | 説明 | タブ |
|---------|------|------|
| `KeywordWordCloud.tsx` | 関連KWワードクラウド | 関連KW |
| `KeywordCooccurrenceMatrix.tsx` | KW共起マトリクス | 関連KW |
| `KeywordRanking.tsx` | 関連KWランキング | 関連KW |
| `BrandKeywordCEPSankey.tsx` | ブランド→KW→CEPサンキー | 関連KW |

### DPT・UGC詳細

| ファイル | 説明 | タブ |
|---------|------|------|
| `DPTSummaryTable.tsx` | DPTサマリーテーブル（全ブランド一覧） | Analytics |
| `UGCLabelChart.tsx` | UGCラベル分布チャート | SNS分析 |
| `WsDetailChart.tsx` | W's詳細分析（5タブ: 料理/シーン/対象/動機/クロス） | Analytics |

## 共通パターン

```typescript
"use client"

import { useEffect, useState } from "react"
import { ResponsiveContainer, ... } from "recharts"

export function ChartComponent() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch("/api/endpoint")
      .then(res => res.json())
      .then(setData)
  }, [])

  return (
    <ResponsiveContainer width="100%" height={400}>
      {/* Chart */}
    </ResponsiveContainer>
  )
}
```

## 関連ディレクトリ

- `../` - components/ルート
- `../../lib/utils/colors.ts` - ブランドカラー定義

## 注意事項

- 全コンポーネントに `"use client"` ディレクティブ必須
- カラーはブランドごとに統一（colors.ts参照）
- Recharts 3.6のAPI変更に注意（Tooltip formatter等）
