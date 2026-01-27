# chat/

## 概要

AIチャットAPI Route。Gemini APIを使用した対話型分析機能を提供。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `route.ts` | POST /api/chat - AIチャットエンドポイント |

## エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/chat` | メッセージ送信・AI応答取得 |

## リクエスト形式

```typescript
interface ChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}
```

## 使用モデル

- `gemini-2.0-flash` (Gemini API)

## 関連ディレクトリ

- `../` - api/ルート
- `../../../../components/chat/` - チャットUIコンポーネント

## 注意事項

- GEMINI_API_KEY環境変数が必要
- ストリーミング応答には対応していない（単発応答）
