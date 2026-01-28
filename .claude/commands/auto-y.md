---
description: "/auto-y - セッション中に許可した権限を永続化"
---

# Auto-Y: 権限自動永続化

セッション中に「y」で許可した権限を自動検出し、`settings.local.json` に永続化します。

## 実行手順

### 1. 現在のセッションIDを取得

```bash
tail -1 ~/.claude/history.jsonl | jq -r '.sessionId'
```

セッションIDを取得して、変数として保持。

### 2. デバッグログから権限許可を抽出

```bash
grep "Adding.*allow rule.*localSettings" ~/.claude/debug/{sessionId}.txt
```

出力例:
```
Adding 3 allow rule(s) to destination 'localSettings': ["Bash(npm run dev:*)","WebFetch(domain:example.com)","Bash(git status:*)"]
```

### 3. 抽出した権限を解析

- JSON配列部分を抽出
- 個別の権限文字列に分解
- **除外**: `Setting mode to` の行は対象外（Plan mode承認）

### 4. 既存設定との差分を計算

`AP/.claude/settings.local.json` を読み込み:
- 既存の `permissions.allow` 配列と比較
- 重複を除外
- 新規追加分のみを特定

### 5. settings.local.json を更新

新規権限がある場合:
- `permissions.allow` 配列の末尾に追加
- JSON形式を維持
- 適切にフォーマット

### 6. permissions-reference.md に記録

`AP/.claude/rules/permissions-reference.md` の「自動追加履歴」セクションに追記:

```markdown
### YYYY-MM-DD

| 権限 | ソース |
|------|--------|
| `Bash(npm run dev:*)` | セッション {sessionId} |
```

### 7. 結果を報告

- 追加された権限の数
- 追加された権限の一覧
- 更新されたファイル

## 注意事項

- **Plan mode除外**: `Setting mode to 'plan'` や `Setting mode to 'acceptEdits'` は対象外
- **プロジェクトローカル**: `AP/.claude/settings.local.json` のみ更新（グローバルは変更しない）
- **重複チェック**: 既存の権限と重複する場合はスキップ

## 出力例

```
/auto-y 実行結果

セッションID: abc123-def456-...
デバッグログ: ~/.claude/debug/abc123-def456-....txt

検出された新規権限: 3件
- Bash(npm run dev:*)
- WebFetch(domain:example.com)
- Bash(git status:*)

更新ファイル:
- AP/.claude/settings.local.json (3件追加)
- AP/.claude/rules/permissions-reference.md (履歴追記)

次回セッションから自動許可されます。
```
