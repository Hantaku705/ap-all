# progress/

## 概要

バッチ処理の進捗追跡JSONファイル。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `corporate-tag-progress.json` | is_corporateタグ付け進捗 |
| `corporate-topic-progress.json` | corporate_topic分類進捗 |

## 用途

- バッチ処理の中断・再開に使用
- 処理済みIDを記録して重複処理を防止

## 関連スクリプト

- `../scripts/tag-corporate-posts.ts`
- `../scripts/classify-corporate-topics.ts`

## 注意事項

- 処理再開時は`lastProcessedId`から続行

## 更新履歴

- 2026-01-23: 初版作成
