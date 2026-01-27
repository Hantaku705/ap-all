---
description: "/shogun - 戦国マルチエージェント（tmux版、Claude Code内完結）"
---

# /shogun - 戦国マルチエージェントシステム

将軍/家老/足軽×8のtmuxマルチエージェントをClaude Code内から起動・指示する。
ユーザーはターミナルを一切触らない。

## 使用方法

- `/shogun タスク内容` → tmux起動 + 将軍にタスク送信
- `/shogun` → 引数なしの場合はユーザーに指示を聞く

## 実行手順

### STEP 1: 指示の受領

ARGUMENTS を確認する。引数がなければ AskUserQuestion で聞く。

### STEP 2: tmuxセッション確認

Bash ツールで以下を実行：

```bash
tmux list-sessions 2>/dev/null | grep -E "^(shogun|multiagent):"
```

- **両方存在する** → STEP 4へスキップ
- **存在しない or 片方だけ** → STEP 3へ

### STEP 3: tmuxセッション起動

Bash ツールで起動スクリプトを実行（タイムアウト120秒）：

```bash
cd /Users/hantaku/Downloads/AP/opperation/multi-agent && ./start_macos.sh
```

起動完了後、各ペインのClaude Code起動を確認：

```bash
tmux capture-pane -t shogun:0.0 -p 2>/dev/null | tail -3
```

「殿、何なりと」や「❯」が表示されていれば成功。
表示されていなければ30秒待って再確認。

### STEP 4: 将軍にタスクを送信

Bash ツールで send-keys を使用（**必ず2回に分けて送る**）：

```bash
tmux send-keys -t shogun "ここにタスク内容を入れる"
tmux send-keys -t shogun Enter
```

**重要**: メッセージとEnterは必ず別のsend-keysで送る（1回だとEnterが効かない）。

### STEP 5: ユーザーに報告

以下を報告する：

1. 「将軍にタスクを送信しました」
2. 観察方法：
   - `tmux attach-session -t shogun` で将軍の動きを見る
   - `tmux attach-session -t multiagent` で家老・足軽の動きを見る
3. `cat opperation/multi-agent/dashboard.md` でダッシュボード確認

### STEP 6: ダッシュボード監視（オプション）

ユーザーが「進捗は？」「状況は？」と聞いたら：

```bash
cat /Users/hantaku/Downloads/AP/opperation/multi-agent/dashboard.md
```

## 注意事項

- tmuxはバックグラウンドで動作（ユーザーはターミナル不要）
- 10 Claude Code インスタンスが起動する（将軍1 + 家老1 + 足軽8）
- 初回起動は約40秒かかる（Claude Code起動 + セキュリティ承認 + 指示書読み込み）
- 2回目以降はセッションが残っていればSTEP 4から即実行
- 終了：`tmux kill-session -t shogun && tmux kill-session -t multiagent`
