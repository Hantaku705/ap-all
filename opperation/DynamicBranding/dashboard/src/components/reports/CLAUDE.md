# reports/

## 概要

レポート管理コンポーネント。レポートの作成・編集・表示を提供。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `ReportsView.tsx` | レポート管理UI（一覧・編集・プレビュー） |

## 機能

- レポート一覧表示
- 新規作成
- Markdownエディタ
- プレビュー（react-markdown）
- 削除

## 関連ディレクトリ

- `../` - components/ルート
- `../../app/api/reports/` - レポートAPI

## 注意事項

- レポートはMarkdown形式で保存
- `/export-report` スキルで自動生成可能
