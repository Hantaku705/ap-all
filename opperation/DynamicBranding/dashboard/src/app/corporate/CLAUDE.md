# corporate/

## 概要

コーポレート分析ダッシュボードページ。味の素株式会社の企業レベル分析を提供。

## ディレクトリ構成

| パス | 説明 |
|------|------|
| `[corpId]/page.tsx` | コーポレートダッシュボードページ（動的ルート） |

## ルート

| URL | 説明 |
|-----|------|
| `/corporate/1` | 味の素株式会社（corpId=1） |

## タブ構成

| タブ | コンポーネント | 説明 |
|-----|--------------|------|
| UGC分析 | `CorporateOverview`, `CorporateTopicChart` 等 | コーポレート投稿分析 |
| 株価×UGC | `StockUGCChart` | 株価とUGCの相関分析 |
| ファン資産 | `CorporateLoyaltySection` | ロイヤリティ分布 |
| 世の中分析 | `WorldNewsSection` | NewsAPI連携ニュース分析 |
| 戦略提案 | `LoyaltyGrowthTargets` 等 | ロイヤリティ成長戦略 |
| ロイヤリティ低分析 | `NegativeAnalysisSection` | **ネガティブ投稿分析（時系列・カテゴリ・深刻度）（NEW）** |

## 関連ディレクトリ

- `../../components/corporate/` - コーポレートコンポーネント
- `../../components/corporate-analytics/` - UGC分析コンポーネント
- `../../components/corporate-world-news/` - 世の中分析コンポーネント
- `../../types/corporate.types.ts` - 型定義
- `../api/corporate/` - コーポレートAPI Routes

## 注意事項

- `"use client"` ディレクティブが必要
- `corpId`はURL paramsから取得し、数値にパース
- 無効なcorpIdはエラー表示

## 更新履歴

- 2026-01-29: ロイヤリティ低分析タブ追加（6つ目のタブ、NegativeAnalysisSection）
- 2026-01-23: 初版作成
