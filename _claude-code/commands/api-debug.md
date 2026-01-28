---
description: "/api-debug - API統合デバッグ自動化"
---

# /api-debug - API統合デバッグ自動化

外部API（Kling, TikTok, HeyGen, Gemini等）の統合時にレスポンス検証・デバッグを自動化します。

## 実行手順

### 1. 環境変数チェック

```bash
# .env.local または .env の確認
cat .env.local | grep -E "(API_KEY|CLIENT|SECRET|URL)" | sed 's/=.*/=***/'
```

必須環境変数:
| API | 環境変数 |
|-----|----------|
| Kling AI | `KLING_API_KEY` |
| TikTok | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` |
| HeyGen | `HEYGEN_API_KEY` |
| Gemini | `GEMINI_API_KEY` |
| Supabase | `SUPABASE_SERVICE_ROLE_KEY` |

### 2. APIエンドポイントテスト

#### Kling AI（PiAPI経由）
```bash
curl -X POST "https://api.piapi.ai/api/v1/task" \
  -H "X-API-Key: $KLING_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "kling", "task_type": "image2video", "input": {"image_url": "https://example.com/test.jpg", "prompt": "test"}}'
```

期待レスポンス:
```json
{
  "code": 200,
  "data": {
    "task_id": "xxx"
  }
}
```

#### TikTok OAuth
```bash
# OAuth URL生成確認
curl "http://localhost:3000/api/tiktok/auth"
```

#### HeyGen
```bash
curl -X GET "https://api.heygen.com/v2/avatars" \
  -H "X-Api-Key: $HEYGEN_API_KEY"
```

### 3. エラーレスポンス分析

よくあるエラーパターン:

| エラー | 原因 | 対処 |
|--------|------|------|
| 401 Unauthorized | APIキー無効/期限切れ | キー再発行・環境変数確認 |
| 403 Forbidden | 権限不足/プラン制限 | APIプラン確認 |
| 429 Too Many Requests | レート制限 | リトライロジック追加 |
| 500 Internal Server Error | API側の問題 | ステータスページ確認 |

### 4. 型定義との一致確認

```typescript
// src/lib/video/kling/types.ts を確認
// 実際のレスポンスと型定義を比較

// PiAPI形式の確認ポイント:
interface KlingTaskResponse {
  code: number;
  data: {
    task_id: string;
    status: string;
    output?: {
      video_url?: string;
    };
  };
}
```

### 5. ローカルテスト実行

```bash
# 開発サーバー起動
npm run dev

# 別ターミナルでAPIテスト
curl -X POST "http://localhost:3000/api/videos/kling" \
  -H "Content-Type: application/json" \
  -d '{"productId": "test-id", "templateId": "product-intro"}'
```

## API別デバッグガイド

### Kling AI（PiAPI）

**エンドポイント**: `https://api.piapi.ai/api/v1/task`

**注意点**:
- PiAPI形式は公式APIと異なる
- `task_id` でポーリングしてステータス確認
- `output.video_url` で動画URL取得

**デバッグ手順**:
1. タスク作成 → `task_id` 取得
2. ステータスポーリング（5秒間隔）
3. `completed` で動画URL取得

### TikTok Content Posting API

**OAuth フロー**:
1. `/api/tiktok/auth` → 認可URL生成
2. ユーザー認可 → callback
3. アクセストークン取得
4. 動画アップロード → 投稿

**注意点**:
- スコープ: `user.info.basic`, `video.upload`, `video.publish`
- リフレッシュトークンの有効期限管理

### HeyGen

**エンドポイント**: `https://api.heygen.com/v2/`

**デバッグ手順**:
1. アバター一覧取得 → 使用可能なアバター確認
2. 動画生成リクエスト
3. ステータスポーリング
4. 完了後に動画URL取得

## 修正提案テンプレート

問題を発見した場合、以下の形式で報告:

```
## API統合エラー報告

### API: [API名]
### エンドポイント: [URL]
### エラー内容: [エラーメッセージ]

### 原因分析
[根本原因の説明]

### 修正提案
1. [修正手順1]
2. [修正手順2]

### 影響範囲
- [影響を受けるファイル/機能]
```

## 注意事項

- APIキーは絶対にログ出力しない
- 本番環境のAPIは慎重にテスト（レート制限、課金）
- テスト用のモックデータを活用
- エラーハンドリングは必ず実装
