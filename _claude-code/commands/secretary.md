---
description: "/secretary - Personal Secretary System"
---

# /secretary - Personal Secretary System

統合されたパーソナル秘書システムへのエントリポイント。

## 使い方

```
/secretary              # ダッシュボード表示
/secretary inbox "text" # Quick capture
/secretary daily        # Today's focus
/secretary weekly       # Weekly review
/secretary process      # Process inbox
```

---

## 実行手順

### 引数なし（ダッシュボード）

1. `~/.claude/secretary/TASKS.md` を読み込む
2. `~/.claude/secretary/PROJECTS.md` を読み込む
3. `~/.claude/secretary/INBOX.md` を読み込む
4. 以下のダッシュボードを表示:

```
## Secretary Dashboard - YYYY-MM-DD

### Today's Focus (P1 & Due Today)
1. [ ] Task 1 (project)
2. [ ] Task 2 (project)

### Active Projects
- project1: description
- project2: description

### Waiting For
- Item waiting on X

### Inbox: N items unprocessed

---
Commands: /tasks, /projects, /knowledge
```

### inbox "text"

1. 現在時刻を取得
2. `~/.claude/secretary/INBOX.md` の "## Unprocessed" セクションに追記:
   ```
   - YYYY-MM-DD HH:MM: [text]
   ```
3. 「Captured to inbox」と報告

### daily

1. `TASKS.md` から P1 タスクと本日期限のタスクを抽出
2. `PROJECTS.md` からアクティブプロジェクトを取得
3. 今日のフォーカスリストを生成
4. `TASKS.md` の "## Today's Focus" セクションを更新

### weekly

1. 今週完了したタスクをまとめる
2. 来週のタスクをリストアップ
3. プロジェクト進捗を確認
4. 週次レビューレポートを出力
5. 完了タスクを `archive/tasks/YYYY-MM/` に移動

### process

1. `INBOX.md` の Unprocessed を読み込む
2. 各項目について対話で分類を確認:
   - **task**: `TASKS.md` に追加（優先度・締切を確認）
   - **knowledge**: `notes/` に作成
   - **discard**: 削除
3. 処理済み項目をクリア
4. 処理結果を報告
