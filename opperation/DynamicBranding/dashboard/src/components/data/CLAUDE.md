# data/

## 概要

データ表示コンポーネント。テーブル形式でデータを表示。

## ファイル一覧

| ファイル | 説明 | タブ |
|---------|------|------|
| `GoogleTrendsTable.tsx` | Google Trends生データテーブル | データ |
| `SNSDataView.tsx` | SNS投稿一覧ビュー（フィルタ・ページネーション付き） | データ |

## SNSDataView機能

- ブランドフィルタ
- ソースフィルタ（twitter, blog, news等）
- センチメントフィルタ
- ページネーション（仮想スクロール）
- 詳細展開

## 関連ディレクトリ

- `../` - components/ルート
- `../../app/api/data/` - データAPI

## 注意事項

- 大量データ表示時はパフォーマンスに注意
- `@tanstack/react-virtual` で仮想スクロール実装
