# バックグラウンドタスク管理ルール

Bashコマンドをバックグラウンドで実行する際のベストプラクティス。

---

## 基本原則

1. **長時間タスクはバックグラウンドで実行** - 対話を継続できる
2. **必ず出力を確認** - 成功・失敗を把握する
3. **完了したら終了** - リソースを解放する

---

## 実行パターン

### バックグラウンド実行

```typescript
// run_in_background: true を使用
Bash({
  command: "npm run long-task",
  run_in_background: true,
  timeout: 300000  // 5分
})
```

### 出力確認

```typescript
// TaskOutput で結果を取得
TaskOutput({
  task_id: "task-id",
  block: false,  // ノンブロッキング
  timeout: 5000
})

// または Read で出力ファイルを確認
Read({ file_path: "/path/to/output.txt" })
```

### タスク終了

```typescript
// 完了後は必ず KillShell
KillShell({ shell_id: "task-id" })
```

---

## ユーザー入力待ちの場合

**問題**: バックグラウンドタスクがユーザー入力を待つと永久に待機

**対策**:
1. ユーザーにブラウザ等で操作を依頼
2. 操作完了をチャットで報告してもらう
3. 完了報告後に出力を確認
4. 必要に応じてKillShell

```
ユーザー: 「ログインしました」
↓
出力確認 → 成功なら次のステップ
         → 待機中ならKillShell後に再実行
```

---

## タイムアウト設定ガイド

| 操作 | 推奨タイムアウト |
|------|------------------|
| 通常コマンド | 120000ms (2分) |
| npm install | 120000ms (2分) |
| ビルド | 180000ms (3分) |
| 手動ログイン待ち | 300000ms (5分) |
| 大量データ処理 | 600000ms (10分) |

---

## 避けるべきパターン

### NG: 無限待機

```typescript
// ユーザー入力を待つタスクをバックグラウンドで放置
Bash({ command: "npm run login", run_in_background: true })
// ← 入力なしで永久に待機
```

### OK: 適切な管理

```typescript
// 1. バックグラウンドで開始
Bash({ command: "npm run login", run_in_background: true })

// 2. ユーザーに操作依頼
"ブラウザでログインしてください。完了したら教えてください。"

// 3. 完了報告後に確認
Read({ file_path: "/path/to/output.txt" })

// 4. 必要に応じて終了
KillShell({ shell_id: "task-id" })
```

---

## チェックリスト

バックグラウンドタスク実行時:

- [ ] `run_in_background: true` を設定
- [ ] 適切な `timeout` を設定
- [ ] タスクIDを記録
- [ ] 完了後に出力を確認
- [ ] 不要になったらKillShell
- [ ] ユーザー入力待ちの場合は明示的に依頼
