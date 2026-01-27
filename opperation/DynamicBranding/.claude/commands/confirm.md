---
description: "/confirm - 本番環境の動作確認（Playwright E2Eテスト）"
---

# /confirm - 本番環境確認スキル

アプリが本番環境で正しく動作しているかをPlaywrightで自動検証する。

## 実行手順

1. **本番URLの確認**
   - 環境変数 `BASE_URL` または `NEXT_PUBLIC_APP_URL` を確認
   - プロジェクトのCLAUDE.mdまたはHANDOFF.mdから本番URLを取得
   - VercelプレビューURL（`-xxx-projects.vercel.app`）は認証がかかるため避ける

2. **Playwrightテストの実行（本番環境）**
   ```bash
   BASE_URL=<本番URL> npx playwright test --reporter=list
   ```

   特定のテストのみ実行：
   ```bash
   BASE_URL=<本番URL> npx playwright test tests/e2e/<test-file>.spec.ts --reporter=list
   ```

3. **追加の手動確認**（テストでカバーできない項目）
   - 認証フローの確認（ログイン/ログアウト）
   - API接続状況の確認
   - 外部サービス連携の確認

4. **スクリーンショット取得**（必要に応じて）
   ```bash
   BASE_URL=<本番URL> npx playwright test --grep "screenshot" --reporter=list
   ```

5. **結果レポート**
   以下の形式で報告する：

   ```
   ## 本番環境確認結果

   **URL**: <テスト対象URL>
   **実行日時**: <日時>

   ### テスト結果
   - [ ] ホームページ読み込み
   - [ ] 主要ページのナビゲーション
   - [ ] 認証フロー（該当する場合）
   - [ ] API接続
   - [ ] レスポンシブ表示

   ### 問題点
   - （あれば記載）

   ### スクリーンショット
   - tests/screenshots/ に保存
   ```

## エラー時の対応

| エラー | 対応 |
|--------|------|
| タイムアウト | ネットワーク/デプロイ状況確認 |
| 要素未検出 | セレクタ変更確認、認証必要か確認 |
| 認証エラー | 認証設定・環境変数確認 |
| 接続拒否 | 本番URL・デプロイ状態確認 |

## 注意事項

- 本番環境への書き込み操作は行わない（読み取り専用テスト）
- 認証が必要なページはスキップまたは別途確認
- テスト失敗時はスクリーンショットが自動保存される
- プロジェクト固有のテストファイルは `tests/e2e/` を確認
