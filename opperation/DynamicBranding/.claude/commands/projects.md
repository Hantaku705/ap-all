---
description: "/projects - プロジェクト管理"
---

# /projects - プロジェクト管理

## 使い方

```
/projects              # プロジェクト一覧
/projects add "name"   # プロジェクト追加
/projects open "name"  # プロジェクトを開く
/projects status "name" active|paused|archived
/projects update "name" # プロジェクト情報更新
```

---

## 実行手順

### 引数なし（一覧表示）

1. `~/.claude/secretary/PROJECTS.md` を読み込む
2. Active/Paused プロジェクトを表示
3. 各プロジェクトの最終作業日を表示
4. Statistics を更新

### add "name"

1. プロジェクト名を確認
2. 以下を対話で確認:
   - **Path**: ローカルパス（必須）
   - **Type**: Next.js, TypeScript, Python, etc.
   - **Git**: GitHub URL（任意）
   - **Deploy**: デプロイ先 URL（任意）
   - **Notes**: メモ（任意）
3. `PROJECTS.md` の "## Active Projects" に以下のフォーマットで追加:

```markdown
### [name]
- **Path**: `/path/to/project`
- **Type**: [type]
- **Status**: Active
- **Git**: [git url]
- **Deploy**: [deploy url]
- **Last worked**: YYYY-MM-DD
- **Notes**: [notes]
```

4. Quick Reference テーブルにも追加
5. Statistics を更新

### open "name"

1. `PROJECTS.md` からプロジェクトを検索
2. パスを取得
3. 以下を実行:
   - `cd [path]` でディレクトリ移動
   - プロジェクトの情報を表示
4. `HANDOFF.md` があれば `/resume` を提案

### status "name" active|paused|archived

1. プロジェクトを検索
2. ステータスを変更:
   - **active**: Active Projects セクションに移動
   - **paused**: Paused Projects セクションに移動、再開予定日を確認
   - **archived**: Archived Projects テーブルに移動、理由を確認
3. Statistics を更新

### update "name"

1. プロジェクトを検索
2. 現在の情報を表示
3. 対話で更新項目を選択:
   - Path / Type / Git / Deploy / Notes
4. 変更を適用
5. Last worked を更新

---

## プロジェクト検索

名前の部分一致で検索。複数マッチした場合は選択を促す。
