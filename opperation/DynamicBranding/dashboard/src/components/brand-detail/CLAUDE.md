# brand-detail/

## 概要

ブランド詳細レポートページ用のセクションコンポーネント群。`/brands/[brandName]`ルートで使用。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `BrandHeader.tsx` | ヘッダー（KPI4種: 言及シェア、ポジティブ率、ネガティブ率、Top CEP） |
| `BrandTrendSection.tsx` | トレンド分析（TrendLineChart + SeasonalityChart） |
| `BrandUserSection.tsx` | ユーザー理解（センチメント/意図/感情/CEP分布 4チャート） |
| `BrandCEPSection.tsx` | CEP分析（CEPRanking + CEPPortfolio 4象限） |
| `BrandRelationSection.tsx` | 関連性分析（共起/相関/キーワード） |
| `BrandPostsSection.tsx` | 生投稿サンプル（センチメント別3件ずつ表示） |
| `BrandStrategySection.tsx` | 戦略示唆（強み/リスク/機会 各3点自動生成） |

## データソース

| セクション | API |
|-----------|-----|
| Header | `/api/brands/[brandName]` |
| Trend | `/api/trends`, `/api/sns/trends`, `/api/seasonality` |
| User | `/api/sns/labels?brand=xxx` |
| CEP | `/api/ceps/brands`, `/api/ceps/portfolio` |
| Relation | `/api/brands/[brandName]/relations` |
| Posts | `/api/data/sns?brands=xxx` |
| Strategy | 複合（summary + labels + relations） |

## 関連ディレクトリ

- `../charts/` - チャートコンポーネント（TrendLineChart等を再利用）
- `../../app/brands/[brandName]/` - ページコンポーネント

## 注意事項

- すべてのコンポーネントは `"use client"` ディレクティブが必要
- `brandName` propsは日本語（デコード済み）で受け取る
- 各セクションは独立してAPI呼び出しを行い、独自のローディング/エラー状態を管理
