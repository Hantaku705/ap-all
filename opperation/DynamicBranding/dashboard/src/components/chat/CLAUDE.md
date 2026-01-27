# chat/

## 概要

AIチャットコンポーネント。Claude APIを使用した対話型分析。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `ChatWidget.tsx` | チャットウィジェット（サイドバー表示） |

## 機能

- メッセージ入力
- AI応答表示（ストリーミング）
- Markdown対応
- 会話履歴

## 関連ディレクトリ

- `../` - components/ルート
- `../../app/api/chat/` - Chat API（Claude）

## 注意事項

- APIキーは環境変数で管理（ANTHROPIC_API_KEY）
- ストリーミング応答のエラーハンドリングに注意
