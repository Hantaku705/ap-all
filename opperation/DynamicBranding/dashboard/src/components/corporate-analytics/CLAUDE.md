# corporate-analytics/

## 概要

コーポレートUGC分析コンポーネント。トレンド、トピック、センチメント、ソース分布を可視化。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `CorporateOverview.tsx` | KPI概要カード（投稿数、ポジティブ率、エンゲージメント等） |
| `CorporateTopicChart.tsx` | トピック分布円グラフ |
| `CorporateSentimentByTopic.tsx` | トピック別センチメント棒グラフ |
| `CorporateTrendsChart.tsx` | 時系列推移折れ線グラフ |
| `CorporateSourceChart.tsx` | ソース（Twitter/Instagram等）分布 |
| `CorporateTopPosts.tsx` | 高エンゲージメント投稿一覧 |
| `index.ts` | バレルエクスポート |

## データソース

| コンポーネント | API |
|--------------|-----|
| CorporateOverview | `/api/corporate/[corpId]/analytics/overview` |
| CorporateTopicChart | `/api/corporate/[corpId]/analytics/topics` |
| CorporateSentimentByTopic | `/api/corporate/[corpId]/analytics/sentiment-by-topic` |
| CorporateTrendsChart | `/api/corporate/[corpId]/analytics/trends` |
| CorporateSourceChart | `/api/corporate/[corpId]/analytics/sources` |
| CorporateTopPosts | `/api/corporate/[corpId]/analytics/top-posts` |

## 関連ディレクトリ

- `../` - components/ルート
- `../corporate/` - コーポレート基盤コンポーネント
- `../../app/corporate/[corpId]/page.tsx` - 使用ページ

## 注意事項

- すべてのコンポーネントに `"use client"` ディレクティブが必要
- Rechartsベースのグラフコンポーネント
- is_corporate=trueのSNS投稿のみを対象

## 更新履歴

- 2026-01-23: 初版作成
