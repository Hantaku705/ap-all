---
description: "/deploy-verify - 本番デプロイ統一検証"
---

# /deploy-verify - Deploy Verification

Vercel + Render（ワーカー）の統合デプロイ検証を行います。

## 実行手順

### Phase 1: 事前チェック

1. **Git状態確認**:
   ```bash
   git status --short
   git log -1 --oneline
   ```
   - 未コミット変更がある場合は警告
   - 最新コミットを確認

2. **ビルド確認**:
   ```bash
   npm run build
   ```
   - 失敗時は `/test-and-fix` を提案

3. **環境変数確認**:
   - `.env.local` の必須変数をチェック
   - Vercel環境変数との差分を確認（`vercel env ls`）

### Phase 2: Vercelデプロイ

1. **本番デプロイ実行**:
   ```bash
   vercel --prod --yes
   ```

2. **デプロイ完了待機**:
   - デプロイURLを取得
   - ビルドログを確認

3. **環境変数同期**（必要に応じて）:
   ```bash
   vercel env add VAR_NAME production <<< "value"
   ```

4. **デプロイ確認**:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://[project].vercel.app
   ```

### Phase 3: Renderワーカー検証

1. **ワーカー状態確認**:
   - Renderダッシュボードでサービス状態を確認
   - 最新デプロイ時刻を確認

2. **ログ確認**:
   - エラーログがないか確認
   - Redis接続成功を確認

3. **キュー動作確認**:
   - BullMQキューにテストジョブを投入（オプション）
   - 処理完了を確認

### Phase 4: 統合動作確認

1. **E2Eテスト実行**（本番URL）:
   ```bash
   BASE_URL=https://[project].vercel.app npx playwright test
   ```

2. **主要機能テスト**:
   | 機能 | テスト方法 |
   |------|-----------|
   | ページ読み込み | 各ページにアクセス |
   | 認証 | ログイン/ログアウト |
   | 動画生成 | Kling AIジョブ投入 |
   | データ保存 | Supabase CRUD |

3. **パフォーマンス確認**:
   - 初回読み込み時間
   - API応答時間

### Phase 5: 結果報告

```
## デプロイ検証結果

### Vercel
- URL: https://[project].vercel.app
- ステータス: [success/fail]
- ビルド時間: X秒
- 環境変数: Y個

### Renderワーカー
- サービス: [name]
- ステータス: [running/stopped]
- 最終デプロイ: [timestamp]

### E2Eテスト
- 合格: X / Y
- 失敗: [リスト]

### 総合結果
- [OK] 本番環境は正常に動作しています
- [NG] 以下の問題があります: [問題リスト]
```

### Phase 6: ロールバック準備（問題発生時）

1. **Vercelロールバック**:
   ```bash
   vercel rollback [deployment-url]
   ```

2. **Renderロールバック**:
   - ダッシュボードから前回デプロイを選択
   - 「Rollback」ボタンをクリック

## プロジェクト固有設定

### BuzzWriteYear

| 項目 | 値 |
|------|-----|
| Vercel URL | https://buzzwriteyear.vercel.app |
| Render サービス | kling-worker |
| Redis | Upstash (integral-shepherd-37224) |
| DB | Supabase (dziamclndwokodzcczpq) |

### 必須環境変数

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
REDIS_URL
KLING_API_KEY
GEMINI_API_KEY
```

## 注意事項

- 本番デプロイ前に必ずローカルビルドを確認
- 環境変数の追加・変更は慎重に（本番データに影響）
- ワーカーの再デプロイはキュー処理中のジョブに注意
- ロールバックは最終手段、原因特定を優先
