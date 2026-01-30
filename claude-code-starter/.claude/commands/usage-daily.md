---
description: "/usage - Claude Code使用時間を表示（今日/週/月/累計）"
---

# /usage - Claude Code 使用時間レポート

Claude Codeの使用時間を表示します。

## サブコマンド

| コマンド | 説明 |
|----------|------|
| `/usage` | 使用時間レポートを表示 |
| `/usage sync` | Supabaseにデータを同期 |
| `/usage json` | JSON形式で出力 |

## 実行手順

### `/usage`（デフォルト）

1. 以下のスクリプトを実行して使用時間を表示:

```bash
node ~/.claude/scripts/usage-parser.mjs 2>/dev/null || node /Users/hantaku/Downloads/AP/.claude/scripts/usage-parser.mjs
```

### `/usage json`

1. JSON形式で出力:

```bash
node ~/.claude/scripts/usage-parser.mjs --json 2>/dev/null || node /Users/hantaku/Downloads/AP/.claude/scripts/usage-parser.mjs --json
```

### `/usage sync`

1. 同期用データを取得:

```bash
node ~/.claude/scripts/usage-parser.mjs --sync 2>/dev/null || node /Users/hantaku/Downloads/AP/.claude/scripts/usage-parser.mjs --sync
```

2. Supabaseに送信（環境変数が設定されている場合）:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`（Service Role Key）

## 計算ロジック

### 使用時間の定義

- **入力間隔が30分未満**: 活動時間としてカウント
- **入力間隔が30分以上**: 非活動時間として除外

### 例

```
入力1: 10:00 ─┐
              ├─ 5分（カウント）
入力2: 10:05 ─┘
              ├─ 45分（除外: 30分超）
入力3: 10:50 ─┐
              ├─ 10分（カウント）
入力4: 11:00 ─┘

→ 合計: 15分（5分 + 10分）
```

## ユーザー識別

自動的に `username@hostname` 形式で識別されます。

例: `hantaku@Hantakus-MacBook-Pro`

## データソース

`~/.claude/history.jsonl` を解析

## 出力例

```
📊 Claude Code 使用時間レポート
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ユーザー: hantaku@Hantakus-MacBook-Pro

📅 今日: 2時間34分（3セッション）
📆 今週: 12時間45分（18セッション）
📅 今月: 45時間12分（72セッション）
📈 累計: 234時間56分（412セッション）

最終セッション: 2026-01-28 10:23
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
