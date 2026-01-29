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
| `LoyaltySummaryReport.tsx` | ロイヤリティ別顧客インサイト（カルーセルUI+トピック分布、13ペルソナ対応） |
| `PersonaCard.tsx` | ペルソナカード（名前・年代・関心事・動機・声のトーン・代表的な引用） |
| `NegativeAnalysisSection.tsx` | **ネガティブ分析（時系列AreaChart、PieChart、深刻度テーブル、代表投稿）（NEW）** |
| `index.ts` | バレルエクスポート |

## データソース

| コンポーネント | API |
|--------------|-----|
| MVVSection | `/api/corporate/[corpId]/mvv` |
| StockUGCChart | `/api/corporate/[corpId]/stock`, `/api/corporate/[corpId]/stock/correlation` |
| CorporateLoyaltySection | `/api/corporate/[corpId]/fans` |
| LoyaltySummaryReport | `/api/corporate/[corpId]/loyalty-summary` |
| NegativeAnalysisSection | `/api/corporate/[corpId]/negative-analysis` |

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

- 2026-01-29: NegativeAnalysisSection追加（ネガティブ分析タブ、8カテゴリ分類、時系列AreaChart、深刻度テーブル）
- 2026-01-29: Brand Personality双極軸対応（personality_shadow追加、代替案4案カード表示、PersonalityAlternative型）
- 2026-01-29: ペルソナ拡充（8→13: 高5/中5/低3）、LoyaltySummaryReportカルーセルUI追加
- 2026-01-29: PersonaCard追加、LoyaltySummaryReportマルチペルソナ対応（8ペルソナ: 高3/中3/低2）
- 2026-01-28: LoyaltySummaryReport追加（ロイヤリティ別顧客インサイト）
- 2026-01-23: 初版作成
