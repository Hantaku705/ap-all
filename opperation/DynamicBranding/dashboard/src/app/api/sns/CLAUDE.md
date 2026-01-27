# sns/

## 概要

SNS分析関連API Routes。言及数、共起、センチメント、トレンドを提供。

## ファイル一覧

| ファイル | エンドポイント | 説明 |
|---------|---------------|------|
| `mentions/route.ts` | `GET /api/sns/mentions` | ブランド別言及数・シェア |
| `cooccurrences/route.ts` | `GET /api/sns/cooccurrences` | ブランド間共起マトリクス（8×8） |
| `sentiments/route.ts` | `GET /api/sns/sentiments` | センチメント分析（ネガティブ率等） |
| `trends/route.ts` | `GET /api/sns/trends` | 週次SNS言及数トレンド |

## データソース

- `sns_mentions` テーブル - ブランド別言及数
- `sns_cooccurrences` テーブル - 共起カウント
- `sns_sentiments` テーブル - センチメント集計
- `sns_posts` テーブル - SNS投稿生データ

## 関連ディレクトリ

- `../` - api/ルート
- `../data/sns/` - SNS生データAPI

## 注意事項

- 集計済みデータは専用テーブルから取得（高速）
- リアルタイム集計が必要な場合は `sns_posts` を使用
