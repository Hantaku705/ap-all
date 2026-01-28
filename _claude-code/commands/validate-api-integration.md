---
description: "/validate-api-integration - API統合の検証"
---

# /validate-api-integration - API統合検証

外部API（Kling, TikTok, HeyGen等）との統合を検証します。

## 実行手順

### Phase 1: エンドポイント確認

1. **APIルート確認**
   ```bash
   # APIエンドポイントの一覧を確認
   ls -la src/app/api/
   ```

2. **エンドポイント定義読み込み**
   - `src/app/api/[endpoint]/route.ts` を読み込み
   - リクエスト/レスポンス型を確認
   - エラーハンドリングを確認

3. **APIクライアント確認**
   - `src/lib/[service]/` のクライアントコードを確認
   - 認証方法、リクエスト形式を確認

### Phase 2: 型チェック

1. **リクエスト型確認**
   - 必須パラメータ
   - オプションパラメータ
   - 型定義（Zodスキーマ等）

2. **レスポンス型確認**
   - 成功時のレスポンス
   - エラー時のレスポンス
   - ステータスコード

3. **TypeScript型定義確認**
   - `src/types/` の関連型を確認
   - 型の整合性チェック

### Phase 3: ローカルテスト

1. **開発サーバー起動確認**
   ```bash
   npm run dev
   ```

2. **APIエンドポイントテスト**
   ```bash
   # curlまたはfetchでテスト
   curl -X POST http://localhost:3000/api/[endpoint] \
     -H "Content-Type: application/json" \
     -d '{"key": "value"}'
   ```

3. **レスポンス確認**
   - ステータスコード
   - レスポンスボディ
   - エラーメッセージ（エラー時）

### Phase 4: 外部API接続確認

1. **API認証確認**
   - APIキーが設定されているか
   - 認証ヘッダーが正しいか

2. **外部APIレスポンス確認**
   - レート制限の確認
   - エラーレスポンスの形式

3. **エラーハンドリング確認**
   - タイムアウト処理
   - リトライロジック
   - エラーログ出力

### Phase 5: データ保存確認

1. **DB保存確認**
   - Supabaseに正しく保存されるか
   - 型アサーションが正しいか

2. **キュー投入確認**（非同期処理の場合）
   - BullMQキューにジョブが追加されるか
   - ジョブデータが正しいか

3. **Storage保存確認**（ファイルアップロードの場合）
   - Supabase Storageにアップロードされるか
   - パスが正しいか

## 出力フォーマット

```
## API統合検証結果: [API名]

### エンドポイント
- パス: /api/[endpoint]
- メソッド: [GET/POST/PUT/DELETE]
- 認証: [必要/不要]

### 型定義
- リクエスト: [OK/NG]
- レスポンス: [OK/NG]
- Zodスキーマ: [あり/なし]

### ローカルテスト
- エンドポイント: [OK/NG]
- レスポンス形式: [OK/NG]
- エラーハンドリング: [OK/NG]

### 外部API接続
- 認証: [OK/NG]
- レスポンス: [OK/NG]
- レート制限: [確認済/未確認]

### データ保存
- DB保存: [OK/NG]
- キュー投入: [OK/NG/N/A]
- Storage: [OK/NG/N/A]

### 問題点
- [問題があれば記載]

### 推奨アクション
- [次のステップ]
```

## 対応API一覧

| API | エンドポイント | クライアント |
|-----|---------------|-------------|
| Kling AI | /api/videos/kling | src/lib/video/kling/ |
| TikTok | /api/tiktok/* | src/lib/tiktok/ |
| HeyGen | /api/videos/heygen | src/lib/video/heygen/ |
| Scraper | /api/scrape | src/lib/scraper/ |

## 注意事項

- 本番APIキーでの過度なテストは避ける（料金発生）
- レート制限に注意
- 機密情報はログに出力しない
