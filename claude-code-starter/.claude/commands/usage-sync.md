---
description: "/usage-sync - Claude Code使用時間をSupabaseに同期"
---

# /usage-sync - Supabase同期

Claude Codeの使用時間データをSupabaseダッシュボードに同期します。

## 実行手順

1. 同期スクリプトを実行:

```bash
node ~/.claude/scripts/usage-sync.mjs 2>/dev/null || node /Users/hantaku/Downloads/AP/.claude/scripts/usage-sync.mjs
```

2. 同期完了後、ダッシュボードで確認:
   - https://webapp-five-bay.vercel.app

## 必要な環境変数

以下の環境変数が `~/.zshrc` または `~/.claude/.env` に設定されている必要があります:

- `SUPABASE_URL`: Supabaseプロジェクト URL
- `SUPABASE_KEY`: Supabase Service Role Key

## 同期されるデータ

| 項目 | 説明 |
|------|------|
| user_id | `username@hostname` |
| date | 日付 |
| minutes | 使用時間（分） |
| sessions | セッション数 |

## 関連コマンド

| コマンド | 説明 |
|----------|------|
| `/usage` | 使用時間レポートを表示（ローカル） |
| `/usage json` | JSON形式で出力 |
