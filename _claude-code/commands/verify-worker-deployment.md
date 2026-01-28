---
description: "/verify-worker-deployment - ワーカーデプロイの検証"
---

# /verify-worker-deployment - ワーカーデプロイ検証

BullMQワーカーのローカル・本番環境でのデプロイを検証します。

## 実行手順

### Phase 1: ローカル環境確認

1. **環境変数チェック**
   ```bash
   # 必要な環境変数が設定されているか確認
   grep -E "REDIS_URL|SUPABASE" .env.local
   ```

2. **ワーカーコード確認**
   - `scripts/start-worker.ts` または該当ワーカーファイルを読み込み
   - キュー名、ジョブ処理ロジックを確認

3. **ローカルワーカー起動テスト**
   ```bash
   npm run worker
   # または
   npx dotenv -e .env.local -- npx tsx scripts/start-worker.ts
   ```

4. **Redis接続確認**
   - ワーカーログで「Connected to Redis」を確認
   - エラーがあれば報告

### Phase 2: キュー動作確認

1. **キュー一覧確認**
   - `src/lib/queue/client.ts` からキュー名を確認
   - 各キューの設定（retry, backoff等）を確認

2. **テストジョブ投入**（オプション）
   - 開発環境でサンプルジョブを投入
   - 処理完了を確認

### Phase 3: 本番環境確認（Render/Railway等）

1. **デプロイ設定確認**
   - `render.yaml` または `railway.toml` を確認
   - ビルドコマンド、起動コマンドを確認

2. **環境変数確認**
   ```
   必須環境変数:
   - REDIS_URL
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - [サービス固有のAPI KEY]
   ```

3. **本番ワーカーログ確認**
   - Render/Railway ダッシュボードでログを確認
   - エラーがないことを確認

### Phase 4: 統合テスト

1. **本番でジョブ投入テスト**
   - UIからジョブをトリガー（例: 動画生成ボタン）
   - ワーカーがジョブを処理することを確認

2. **結果確認**
   - DBに結果が保存されているか確認
   - Storageにファイルがアップロードされているか確認

## 出力フォーマット

```
## ワーカーデプロイ検証結果

### ローカル環境
- 環境変数: [OK/NG]
- ワーカー起動: [OK/NG]
- Redis接続: [OK/NG]

### キュー設定
- キュー数: [X]
- キュー一覧: [リスト]

### 本番環境
- デプロイ設定: [OK/NG]
- 環境変数: [OK/NG]
- ワーカーログ: [OK/NG]

### 統合テスト
- ジョブ投入: [OK/NG]
- 処理完了: [OK/NG]
- 結果保存: [OK/NG]

### 問題点
- [問題があれば記載]

### 推奨アクション
- [次のステップ]
```

## 注意事項

- 本番環境での破壊的操作は行わない
- テストジョブは開発環境でのみ実行
- APIキーなどの機密情報はログに出力しない
