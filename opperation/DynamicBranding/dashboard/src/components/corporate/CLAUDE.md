# corporate/

## 概要

コーポレート分析ダッシュボード用コンポーネント。MVV分析、株価×UGC相関、ファン資産可視化を提供。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `MVVSection.tsx` | Mission/Vision/Purpose/Values/Personality表示 |
| `PersonalityRadar.tsx` | 5軸パーソナリティレーダーチャート（Recharts） |
| `StockUGCChart.tsx` | 株価×UGC 2軸時系列チャート（バズ影響投稿マーカー付き） |
| `FanUrchinChart.tsx` | ウニ型ファン可視化（SVG/React） |
| `FanTireChart.tsx` | タイヤ型ファン可視化（SVG/React） |
| `CorporateLoyaltySection.tsx` | コーポレートロイヤリティ分布（円グラフ+代表口コミ） |
| `LoyaltySummaryReport.tsx` | ロイヤリティ別顧客インサイト（マルチペルソナ+トピック分布） |
| `PersonaCard.tsx` | **ペルソナカード（名前・年代・関心事・動機・声のトーン・代表的な引用）（NEW）** |
| `index.ts` | バレルエクスポート |

## データソース

| コンポーネント | API |
|--------------|-----|
| MVVSection | `/api/corporate/[corpId]/mvv` |
| StockUGCChart | `/api/corporate/[corpId]/stock`, `/api/corporate/[corpId]/stock/correlation` |
| CorporateLoyaltySection | `/api/corporate/[corpId]/fans` |
| LoyaltySummaryReport | `/api/corporate/[corpId]/loyalty-summary` |

## 関連ディレクトリ

- `../` - components/ルート
- `../../app/corporate/` - コーポレートダッシュボードページ
- `../../types/corporate.types.ts` - 型定義
- `../../lib/personality/` - パーソナリティスコア算出

## 注意事項

- すべてのコンポーネントに `"use client"` ディレクティブが必要
- `corporateId` propsは数値（パース済み）で受け取る
- ファン可視化（Urchin/Tire）はSVGベースのカスタム実装

## 更新履歴

- 2026-01-29: PersonaCard追加、LoyaltySummaryReportマルチペルソナ対応（8ペルソナ: 高3/中3/低2）
- 2026-01-28: LoyaltySummaryReport追加（ロイヤリティ別顧客インサイト）
- 2026-01-23: 初版作成
