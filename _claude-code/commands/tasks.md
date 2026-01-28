---
description: "/tasks - タスク管理"
---

# /tasks - タスク管理

## 使い方

```
/tasks                    # タスク一覧表示
/tasks add "task" [opts]  # タスク追加
/tasks done N             # タスク完了
/tasks edit N             # タスク編集
/tasks move N P1|P2|P3    # 優先度変更
```

---

## 実行手順

### 引数なし（一覧表示）

1. `~/.claude/secretary/TASKS.md` を読み込む
2. Active Tasks セクションを優先度順に表示
3. 期限切れタスクを強調表示（**OVERDUE**）
4. Statistics を更新して表示

### add "task" [opts]

**オプション:**
- `-p P1|P2|P3` - 優先度 (default: P2)
- `-d YYYY-MM-DD` - 期限
- `-j project` - プロジェクト名

**実行手順:**
1. タスク情報を解析
2. タスク番号を自動採番（各優先度内で連番）
3. 該当優先度のテーブルに追加
4. Statistics を更新
5. 追加完了を報告

**例:**
```
/tasks add "Implement login" -p P1 -d 2026-01-20 -j myapp
```

### done N

1. タスク番号 N を特定（全優先度を横断検索）
2. タスクを "## Completed This Week" に移動（日付付き）
3. Active Tasks から削除
4. Statistics を更新
5. 完了を報告

### edit N

1. タスク番号 N を特定
2. 現在の内容を表示
3. 対話で編集項目を確認:
   - Task name
   - Project
   - Deadline
   - Notes
4. 変更を適用

### move N P1|P2|P3

1. タスク番号 N を特定
2. 現在の優先度から削除
3. 新しい優先度に追加（番号を再採番）
4. 移動完了を報告

---

## タスク番号の採番ルール

- P1: 1, 2, 3...
- P2: 1, 2, 3...
- P3: 1, 2, 3...

番号は各優先度内で独立。`/tasks done P1-2` のように指定も可。
