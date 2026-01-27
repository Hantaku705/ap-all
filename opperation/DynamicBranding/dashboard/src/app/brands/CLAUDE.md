# brands/

## 概要

ブランド詳細ページ。動的ルートでブランド別の詳細レポートを表示。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `[brandName]/page.tsx` | ブランド詳細ページ（8セクション構成） |

## ページ構成

1. BrandHeader - KPIサマリー
2. BrandTrendSection - トレンド推移
3. BrandUserSection - ユーザー理解（4チャート）
4. BrandCEPSection - CEP分析
5. BrandRelationSection - 関連性分析
6. BrandPostsSection - 生投稿サンプル
7. BrandStrategySection - 戦略示唆
8. BrandDPTSection - DPT分析

## URLパターン

- `/brands/ほんだし`
- `/brands/クックドゥ`
- `/brands/味の素`
- （他5ブランド）

## 関連ディレクトリ

- `../` - app/ルート
- `../../components/brand-detail/` - セクションコンポーネント

## 注意事項

- `generateStaticParams`で8ブランドを事前生成
- 日本語ブランド名はURLエンコード不要（Next.jsが自動処理）
- 現在はAnalyticsセクション経由での利用を推奨
