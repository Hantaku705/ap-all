# /memory - 記憶の管理

作業中の調査や文脈を記憶として保存・呼び出し・削除する。

## 使い方

```
/memory save       # 現在の対話を記憶として保存
/memory list       # 記憶一覧を表示
/memory recall     # キーワードで記憶を検索・呼び出し
/memory delete     # 記憶を削除
```

---

## /memory save

現在の対話内容を記憶として保存する。

### 実行手順

1. 現在の対話から記憶すべき内容を抽出
2. 短いsummary（1行、30文字以内）を生成
3. 関連するタグを2-3個生成
4. `.claude/memories/YYYYMMDD-HHMMSS-[トピック].md` に保存
5. 保存完了を報告

### ファイル形式

```markdown
---
summary: "[1行の要約]"
created: YYYY-MM-DD HH:MM
tags: [tag1, tag2, tag3]
---

## 背景

[なぜこれを記憶したか]

## 内容

[記憶すべき詳細内容]

## 関連ファイル

- [関連するファイルパス]
```

### ファイル名規則

- 形式: `YYYYMMDD-HHMMSS-[トピック].md`
- トピック: 英語のケバブケース（例: `api-rate-limit-issue`）

---

## /memory list

保存されている記憶の一覧を表示する。

### 実行手順

1. `.claude/memories/` ディレクトリの存在を確認
2. 以下のコマンドでsummary一覧を取得:
   ```bash
   rg "^summary:" .claude/memories/
   ```
3. ファイル名とsummaryを一覧表示

### 出力形式

```
## 記憶一覧

| 日時 | トピック | 要約 |
|------|----------|------|
| 2026-01-10 | api-rate-limit | TikTok APIの429エラー調査 |
| 2026-01-09 | supabase-migration | creatorsカラム追加 |
```

---

## /memory recall [キーワード]

キーワードに関連する記憶を検索して呼び出す。

### 実行手順

1. キーワードが指定されていない場合、何について思い出すか確認
2. summary一覧から関連するファイルを特定
3. 該当ファイルを読み込む
4. 内容を要約して回答

### 検索方法

```bash
# summaryで検索
rg "[キーワード]" .claude/memories/ -l

# タグで検索
rg "tags:.*[キーワード]" .claude/memories/ -l
```

---

## /memory delete

記憶を削除する。

### 実行手順

1. `/memory list` で一覧を表示
2. 削除対象を確認
3. 確認メッセージを出す
4. 承認後、ファイルを削除

---

## /handoff との連携

| 場面                       | 使うコマンド                   |
| -------------------------- | ------------------------------ |
| 細かい調査を一旦置いておく | `/memory save`                 |
| セッション終了時のまとめ   | `/handoff`                     |
| 重要な記憶の永続化         | `/handoff` で CLAUDE.md に反映 |

---

## 保存先

```
.claude/memories/
├── 20260110-143052-api-rate-limit-issue.md
├── 20260110-152030-tiktok-fetcher-bug.md
└── ...
```
