---
description: "/shogun - マルチエージェント並列実行（Claude Code内完結）"
---

# /shogun - 戦国マルチエージェントシステム

将軍/家老/足軽の階層構造で、Task toolを使ってタスクを並列実行する。
tmux不要。Claude Code内で完結。

## 使用方法

- `/shogun` のあとにユーザーの指示が ARGUMENTS に入る
- 引数がない場合はユーザーに指示を聞く

## ダッシュボード

パス: `opperation/multi-agent/dashboard.md`

**全STEPでダッシュボードをリアルタイム更新せよ。**

## 実行手順

### STEP 0: ダッシュボードサーバー起動

Bash ツールでサーバーが起動済みか確認し、未起動なら起動する：

```bash
# 起動済み確認
curl -s -o /dev/null -w "%{http_code}" http://localhost:3333
```

- 200が返れば起動済み → スキップ
- 接続失敗 → 起動する：

```bash
node /Users/hantaku/Downloads/AP/opperation/multi-agent/dashboard-server.js &
```

起動後、ユーザーに「ダッシュボード: http://localhost:3333」を案内する。

### STEP 1: 指示の受領

ユーザーの指示（ARGUMENTS）を確認する。引数がなければ AskUserQuestion で聞く。

### STEP 2: ダッシュボード更新（開始）

dashboard.md の「🔄 進行中」セクションに記載：

```markdown
## 🔄 進行中 - 只今、戦闘中でござる
| 任務 | 状態 | 担当 |
|------|------|------|
| {指示の要約} | 🟡 家老にタスク分解を指示中 | 将軍 |
```

Edit ツールで「なし」を上記テーブルに置換する。

### STEP 3: 家老を召喚（タスク分解）

Task tool で **家老 subagent** を1体起動する。

```
Task tool:
  subagent_type: general-purpose
  description: "家老: タスク分解"
  prompt: |
    あなたは家老（Karo）である。テックリード兼スクラムマスターとして、
    将軍からの指示を分析し、独立した実行可能なサブタスクに分解せよ。

    ## 将軍からの指示
    {ユーザーの指示}

    ## プロジェクトルート
    /Users/hantaku/Downloads/AP

    ## やること
    1. 指示に関連するファイル・ディレクトリを探索せよ（Glob, Grep, Read を使え）
    2. コンテキストを理解した上で、サブタスクに分解せよ
    3. 各サブタスクには以下を含めよ：
       - task_id: subtask_001, subtask_002, ...
       - description: 具体的な作業内容
       - target_path: 対象ファイル/ディレクトリ
       - depends_on: 依存するtask_id（なければ null）
       - persona: 最適なペルソナ（例: シニアエンジニア, テクニカルライター）

    ## ルール
    - 独立タスクは並列化できるよう depends_on: null にせよ
    - 同一ファイルへの書き込みが競合しないよう分割せよ
    - 最大8サブタスクまで

    ## 出力フォーマット（厳守）
    最後に以下のJSON形式でサブタスクリストを出力せよ：

    ```json
    {
      "command_summary": "将軍の指示の要約",
      "subtasks": [
        {
          "task_id": "subtask_001",
          "description": "具体的な作業内容",
          "target_path": "/path/to/file",
          "depends_on": null,
          "persona": "シニアエンジニア"
        }
      ]
    }
    ```
```

### STEP 4: ダッシュボード更新（足軽配置）

家老の分解結果を受けて、dashboard.md の「🔄 進行中」を更新：

```markdown
## 🔄 進行中 - 只今、戦闘中でござる
| 任務 | 状態 | 担当 |
|------|------|------|
| {subtask_001の説明} | 🟡 実行中 | 足軽1 |
| {subtask_002の説明} | 🟡 実行中 | 足軽2 |
| ... | ... | ... |
```

### STEP 5: 足軽を並列召喚（タスク実行）

家老の分解結果から、**依存関係のないタスクを並列で** Task tool で起動する。

- depends_on: null のタスクは**同時に**起動（1メッセージに複数 Task tool 呼び出し）
- depends_on がある場合は、先行タスク完了後に起動

各足軽の Task tool 呼び出し：

```
Task tool:
  subagent_type: general-purpose
  description: "足軽{N}: {task_id}"
  prompt: |
    あなたは足軽（Ashigaru）である。{persona}として最高品質の作業を行え。

    ## 任務
    {description}

    ## 対象
    {target_path}

    ## プロジェクトルート
    /Users/hantaku/Downloads/AP

    ## ルール
    - 指示された作業のみ実行せよ
    - コードやドキュメントの品質はプロレベルを維持
    - 完了後、以下を報告せよ：
      1. 作業サマリー
      2. 変更したファイル一覧
      3. スキル化候補（汎用パターンを発見した場合）

    ## 出力フォーマット
    最後に以下の形式で報告せよ：

    ```
    【報告】
    - サマリー: ...
    - 変更ファイル: ...
    - スキル化候補: あり/なし（ありの場合は名前と説明）
    ```
```

### STEP 6: ダッシュボード更新（完了）

全足軽の結果を集約し、dashboard.md を更新する。

1. 「🔄 進行中」を「なし」に戻す
2. 「✅ 本日の戦果」テーブルに各タスクの結果を追記
3. スキル化候補があれば「🎯 スキル化候補」に記載
4. 「最終更新」のタイムスタンプを更新

### STEP 7: ユーザーに報告

結果をユーザーに簡潔に報告する。

## 注意事項

- tmux不要（Claude Code の Task tool で完結）
- API使用量はタスク数に比例（常時10インスタンスではない）
- 依存タスクは順次実行、独立タスクは並列実行
- **ダッシュボードは各STEPで必ず更新せよ（省略禁止）**
