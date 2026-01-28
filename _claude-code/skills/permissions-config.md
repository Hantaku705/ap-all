# Claude Code 権限設定リファレンス

`~/.claude/settings.json`の`permissions.allow`で、ツール実行時の確認プロンプトを自動許可する設定。

---

## 基本構文

```json
{
  "permissions": {
    "allow": [
      "ToolName",
      "ToolName(pattern)"
    ]
  }
}
```

---

## 利用可能なツール名

| ツール | 説明 | 構文例 |
|--------|------|--------|
| `WebFetch` | URLフェッチ | `WebFetch`, `WebFetch(domain:github.com)` |
| `Bash` | コマンド実行 | `Bash`, `Bash(npm:*)`, `Bash(git status)` |
| `Edit` | ファイル編集 | `Edit`, `Edit(~/.claude/**)` |
| `Write` | ファイル作成 | `Write`, `Write(/path/**)` |
| `Read` | ファイル読み取り | `Read`, `Read(/path/**)` |

---

## パターン指定

### ドメイン指定（WebFetch）
```json
"WebFetch(domain:github.com)"
"WebFetch(domain:*.example.com)"
```

### コマンド指定（Bash）
```json
"Bash(npm:*)"       // npm で始まるコマンド
"Bash(git status)"  // 特定コマンドのみ
"Bash"              // 全コマンド（括弧なし）
```

**注意**: `Bash(*)` は無効。全許可は `Bash`（括弧なし）を使う。

### パス指定（Edit/Write/Read）
```json
"Edit(~/.claude/**)"           // ~/.claude/ 配下全て
"Write(/Users/name/projects/**)"
```

---

## 推奨設定

### 開発者向け（全許可）
```json
{
  "permissions": {
    "allow": [
      "WebFetch",
      "Bash",
      "Edit",
      "Write"
    ]
  }
}
```

### 慎重派（限定許可）
```json
{
  "permissions": {
    "allow": [
      "WebFetch(domain:github.com)",
      "WebFetch(domain:api.github.com)",
      "Bash(git:*)",
      "Bash(npm:*)",
      "Edit(~/.claude/**)"
    ]
  }
}
```

---

## 設定ファイルの場所

| スコープ | ファイル | 優先度 |
|---------|---------|--------|
| ユーザー全体 | `~/.claude/settings.json` | 低 |
| プロジェクト | `.claude/settings.json` | 中 |
| ローカル | `.claude/settings.local.json` | 高 |

---

## 確認コマンド

```bash
# Claude Code内で現在の権限を確認
/permissions
```

---

## よくあるエラー

| エラー | 原因 | 修正 |
|--------|------|------|
| `Bash(*)` が無効 | 全許可は括弧不要 | `Bash` に変更 |
| パス指定が効かない | `**` パターン確認 | `Edit(~/.claude/**)` |
| 設定が反映されない | Claude Code再起動が必要 | セッション再起動 |
