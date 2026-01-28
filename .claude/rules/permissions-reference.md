# Permissions Reference

Claude Code の権限設定リファレンス。

---

## 設定ファイルの場所

| ファイル | 用途 | 優先度 |
|----------|------|--------|
| `~/.claude/settings.json` | グローバル設定（全プロジェクト共通） | 低 |
| `.claude/settings.json` | プロジェクト設定（チーム共有） | 中 |
| `.claude/settings.local.json` | ローカル設定（個人用、gitignore推奨） | 高 |

**優先順位**: local > project > global

---

## 基本構文

```json
{
  "permissions": {
    "allow": [
      "ToolName",
      "ToolName(pattern)",
      "ToolName(parameter:value)"
    ]
  }
}
```

---

## ワイルドカード

| パターン | 意味 | 例 |
|----------|------|-----|
| `*` | 任意の文字列 | `Bash(git*:*)` → git で始まる全コマンド |
| `**` | 再帰的マッチ | `Read(~/.claude/**)` → サブディレクトリ含む |
| `:*` | 引数は何でもOK | `Bash(npm install:*)` |

---

## ツール別設定例

### Bash

```json
"Bash(git*:*)",           // git で始まる全コマンド
"Bash(npm install:*)",    // npm install のみ
"Bash(./scripts/*.sh:*)"  // scripts/ 内の sh ファイル
```

### Read/Edit/Write

```json
"Read(~/.claude/**)",     // ~/.claude/ 配下全て
"Edit(/path/to/file.ts)", // 特定ファイルのみ
"Write(/tmp/**)"          // /tmp/ 配下全て
```

### WebFetch

```json
"WebFetch",                           // 全ドメイン
"WebFetch(domain:github.com)",        // 特定ドメイン
"WebFetch(domain:*.vercel.app)"       // ワイルドカード（未検証）
```

### Skills

```json
"Skill(handoff)",
"Skill(quick-commit)"
```

### MCP Tools

```json
"mcp__server-name__tool-name"
```

---

## 現在の設定

### グローバル（~/.claude/settings.json）

| カテゴリ | パーミッション |
|----------|---------------|
| 基本ツール | WebFetch, Bash, Edit, Write, Read |
| Git/GitHub | `git*`, `gh*` |
| Node/NPM | `npm*`, `npx*`, `node*` |
| Python | `python*`, `pip*` |
| デプロイ | `vercel*`, `supabase*` |
| ユーティリティ | ls, find, grep, tree, cat, head, tail, etc. |
| Skills | handoff, quick-commit, commit-push-pr |
| MCP | google-docs-mcp (read, list, append, spreadsheet) |

### AP固有（AP/.claude/settings.local.json）

| カテゴリ | 件数 |
|----------|------|
| Vercel Webapps | 9 |
| リサーチドメイン | 14 |
| 美容ブランドサイト | 25 |
| プロジェクトスクリプト | 9 |
| **合計** | **57** |

---

## 追加方法

### 手動追加

1. 該当の settings.json を開く
2. `permissions.allow` 配列に追加
3. Claude Code を再起動

### セッション中に追加

1. 権限プロンプトで「Yes, allow during this session」を選択
2. 自動的に `.claude/settings.local.json` に追加される

---

## セキュリティ注意事項

- **APIキーをパーミッションに含めない**（`Bash(APIKEY=xxx ...)` は危険）
- **過度に広いワイルドカードに注意**（`Bash(*)` は全コマンド許可）
- **settings.local.json は gitignore 推奨**

---

## トラブルシューティング

### 権限が反映されない

1. JSON 構文エラーを確認（`cat settings.json | jq .`）
2. Claude Code を再起動
3. ファイルパスが正しいか確認

### ワイルドカードが効かない

- `Bash(git *:*)` ではなく `Bash(git*:*)` （スペースなし）
- パス指定は `**` を使用（`*` は1階層のみ）

---

## 自動追加履歴

`/auto-y` コマンドで自動追加された権限の履歴。

<!-- /auto-y で自動追記される -->
