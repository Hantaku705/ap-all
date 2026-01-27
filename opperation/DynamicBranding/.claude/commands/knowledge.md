---
description: "/knowledge - ナレッジベース管理"
---

# /knowledge - ナレッジベース管理

## 使い方

```
/knowledge                    # ナレッジ一覧
/knowledge add learning       # 学びを記録
/knowledge add decision       # 決定を記録 (ADR)
/knowledge add memo           # メモを記録
/knowledge search "keyword"   # 検索
/knowledge tag "tagname"      # タグで検索
/knowledge recent [N]         # 最近のエントリ
```

---

## 実行手順

### 引数なし（一覧表示）

1. `~/.claude/secretary/KNOWLEDGE.md` を読み込む
2. Recent Entries（最新10件）を表示
3. タグクラウドを表示

### add learning

**対話で確認:**
- **Topic**: トピック名（必須）
- **Summary**: 1行サマリー（必須）
- **Tags**: タグ（カンマ区切り）

**実行手順:**
1. ファイル名を生成: `YYYYMMDD-[topic-slug].md`
2. `~/.claude/secretary/notes/learnings/` に作成:

```markdown
---
title: [Topic]
created: YYYY-MM-DD
tags: [tag1, tag2]
---

## Problem

[何が問題だったか - 対話で確認]

## Solution

[どう解決したか - 対話で確認]

## Example

```
[コード例があれば]
```

## References

- [参考URL]
```

3. `KNOWLEDGE.md` の Recent Entries と Learnings テーブルを更新
4. Tag Cloud を更新

### add decision (ADR)

**対話で確認:**
- **Title**: 決定のタイトル（必須）
- **Context**: 背景（必須）
- **Options**: 検討したオプション（任意）
- **Decision**: 決定内容（必須）
- **Consequences**: 結果・影響（任意）

**実行手順:**
1. ファイル名を生成: `YYYYMMDD-[title-slug].md`
2. `~/.claude/secretary/notes/decisions/` に作成:

```markdown
---
title: [Title]
created: YYYY-MM-DD
status: Active
---

# ADR: [Title]

## Context

[背景]

## Options Considered

1. **Option A**: [説明]
2. **Option B**: [説明]

## Decision

[決定内容と理由]

## Consequences

- [結果・影響]
```

3. `KNOWLEDGE.md` の Recent Entries と Decisions テーブルを更新

### add memo

**対話で確認:**
- **Topic**: トピック（必須）
- **Tags**: タグ（任意）
- **Content**: 内容（必須）

**実行手順:**
1. ファイル名を生成: `YYYYMMDD-[topic-slug].md`
2. `~/.claude/secretary/notes/memos/` に作成
3. `KNOWLEDGE.md` の Recent Entries と Memos テーブルを更新

### search "keyword"

```bash
rg "[keyword]" ~/.claude/secretary/notes/ -l --ignore-case
```

結果をフォーマットして表示。該当ファイルのサマリーも表示。

### tag "tagname"

```bash
rg "tags:.*[tagname]" ~/.claude/secretary/notes/ -l --ignore-case
```

結果をフォーマットして表示。

### recent [N]

1. `KNOWLEDGE.md` の Recent Entries を読み込む
2. 最新 N 件を表示（default: 5）
