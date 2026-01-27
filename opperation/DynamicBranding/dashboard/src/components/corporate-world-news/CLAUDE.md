# corporate-world-news/

## 概要

コーポレート分析ダッシュボードの「世の中分析」タブ用コンポーネント群。
第三者からのニュース・レポート・SNS言及を表示・分析する。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `index.ts` | バレルエクスポート |
| `WorldNewsSection.tsx` | メインセクション（4つのサブタブを管理） |
| `WorldNewsTimeline.tsx` | タイムライン表示（ページネーション付き） |
| `WorldNewsCategorySummary.tsx` | カテゴリ別集計（PieChart + BarChart） |
| `WorldNewsSentimentChart.tsx` | センチメント分布チャート |
| `WorldNewsAlerts.tsx` | 重要アラート一覧 |
| `WorldNewsCard.tsx` | 個別ニュースカード |
| `WorldNewsFilters.tsx` | フィルターUI（カテゴリ・センチメント・検索） |
| `WorldNewsImportModal.tsx` | 手動インポートモーダル |
| `WorldNewsSkeleton.tsx` | ローディングスケルトン |

## サブタブ構成

| タブ | コンポーネント | 説明 |
|-----|---------------|------|
| タイムライン | `WorldNewsTimeline` | ニュース一覧（フィルター付き） |
| カテゴリ | `WorldNewsCategorySummary` | カテゴリ別集計 |
| センチメント | `WorldNewsSentimentChart` | 感情分析結果 |
| アラート | `WorldNewsAlerts` | 重要ニュース |

## 使用API

| エンドポイント | 用途 |
|---------------|------|
| `GET /api/corporate/[corpId]/world-news` | ニュース一覧取得 |
| `GET /api/corporate/[corpId]/world-news/summary` | 集計データ取得 |
| `GET /api/corporate/[corpId]/world-news/alerts` | アラート取得 |
| `POST /api/corporate/[corpId]/world-news` | 手動インポート |

## DBテーブル

| テーブル | 説明 |
|---------|------|
| `corporate_world_news` | ニュース記事本体 |
| `corporate_news_categories` | カテゴリマスタ |
| `corporate_news_fetch_log` | 取得ログ |

## カテゴリ一覧

| カテゴリ | ラベル | 色 |
|---------|--------|-----|
| `ir_finance` | IR・財務 | #3B82F6 |
| `product_service` | 製品・サービス | #10B981 |
| `esg_sustainability` | ESG・サステナ | #8B5CF6 |
| `management` | 経営・人事 | #F59E0B |
| `industry` | 業界動向 | #EC4899 |
| `reputation` | 評判・評価 | #06B6D4 |
| `other` | その他 | #6B7280 |

## 使用例

```tsx
import { WorldNewsSection } from "@/components/corporate-world-news";

// コーポレートダッシュボードページ内
<WorldNewsSection corpId={1} />
```

## 関連ディレクトリ

- `../` - components/ルート
- `../../app/corporate/[corpId]/page.tsx` - 使用元ページ
- `../../app/api/corporate/[corpId]/world-news/` - API Routes

## 注意事項

- すべてのコンポーネントは `"use client"` ディレクティブが必要
- Recharts（PieChart, BarChart, AreaChart）を使用
- lucide-reactアイコンを使用
