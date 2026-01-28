---
description: "/reco - UX中毒性最優先の並列分析・全自動修正（10 subagent）"
---

# /reco - レコメンド実行（UX中毒性版 v3）

10個のsubagentで現状を並列分析し、**ユーザーが18時間使い続けたくなるアプリ**を目指して最適なタスクを判断・全自動修正します。

## ミッション準拠

このスキルはCLAUDE.mdのミッションに基づいて動作します：
- **最優先**: UX中毒性 - ユーザーがもっと使いたくなるか？
- **次点**: 操作の快感 - クリック・操作が気持ち良いか？
- **重要**: フィードバック - 結果が即座に分かるか？
- **基本**: シンプルさ - 迷わず直感的に使えるか？

## 実行手順

### Phase 0: セッション復元

**最初に `/resume` を実行**して、前回のセッション状態を読み込みます。

```
/resume を実行
    ↓
HANDOFF.md から以下を取得:
- 前回の完了タスク
- 作業中のタスク
- 次のアクション
- 未解決の問題
    ↓
コンテキストを把握した状態で Phase 1 へ
```

これにより、前回のセッションからシームレスに作業を継続できます。

### Phase 1: 並列分析

以下の**10個のsubagent**を**並列で起動**してください（1つのメッセージで複数のTaskツールを呼び出す）:

#### Subagent 1: code-analyzer
```
subagent_type: general-purpose
model: haiku
prompt: |
  未コミット変更を分析してください。

  1. `git status --short` を実行
  2. `git diff --stat` を実行
  3. 変更ファイルの内容を確認（主要なものだけ）
  4. 作業状態を判定:
     - "complete": 機能が完成している（ビルド可能、テスト追加済み等）
     - "in_progress": 作業途中（TODO残り、未完成のコード等）
     - "none": 変更なし

  以下の形式で報告:
  ---
  ## code-analyzer 結果
  - 未コミット変更: [件数] ファイル
  - 状態: [complete/in_progress/none]
  - 概要: [変更内容の1行サマリ]
  - 主な変更ファイル: [リスト]
  ---
```

#### Subagent 2: build-checker
```
subagent_type: general-purpose
model: haiku
prompt: |
  ビルドとTypeScript型チェックを実行してください。

  1. `npm run build` を実行（2分タイムアウト）
  2. エラーがあれば内容を分析
  3. エラーの修正難易度を判定（easy/medium/hard）

  以下の形式で報告:
  ---
  ## build-checker 結果
  - ビルド: [success/fail]
  - エラー数: [件数]
  - エラー内容: [主なエラー（あれば）]
  - 修正難易度: [easy/medium/hard/N/A]
  ---
```

#### Subagent 3: state-analyzer
```
subagent_type: general-purpose
model: haiku
prompt: |
  プロジェクトの状態ファイルを分析してください。

  1. HANDOFF.md を読み込み（存在する場合）
  2. CLAUDE.md を読み込み（ミッション・意思決定原則を確認）
  3. 以下を抽出:
     - 作業中のタスク
     - 次のアクション（優先順位付き）
     - 未解決の問題
     - ミッション: 「ユーザーが18時間使い続けたくなるアプリ」

  以下の形式で報告:
  ---
  ## state-analyzer 結果
  - ミッション: [CLAUDE.mdから抽出]
  - 作業中タスク: [リスト or なし]
  - 次のアクション:
    1. [最優先]
    2. [次点]
  - 未解決の問題: [リスト or なし]
  ---
```

#### Subagent 4: test-runner
```
subagent_type: general-purpose
model: haiku
prompt: |
  テストを実行してください。

  1. package.json の scripts を確認
  2. テストコマンドがあれば実行（npm test, npx playwright test 等）
  3. テストがなければ「テストなし」と報告

  以下の形式で報告:
  ---
  ## test-runner 結果
  - テスト: [success/fail/なし]
  - 失敗数: [件数]
  - 失敗テスト: [リスト（あれば）]
  ---
```

#### Subagent 5: tools-analyzer
```
subagent_type: general-purpose
model: haiku
prompt: |
  既存のskill/subagentを分析し、改善点や新規作成の必要性を判定してください。

  1. 以下のディレクトリを確認:
     - ~/.claude/commands/*.md (ユーザーレベルskill)
     - .claude/commands/*.md (プロジェクトレベルskill)
     - ~/.claude/agents/*.md (ユーザーレベルsubagent)
     - .claude/agents/*.md (プロジェクトレベルsubagent)

  2. HANDOFF.md のセッション履歴を確認し、繰り返しパターンを検出

  3. 以下の基準で改善提案を生成:
     - 繰り返しパターン（3回以上）→ 新規skill提案
     - 複雑な分析タスク頻出 → 新規subagent提案

  4. 優先度を判定: high/medium/low/none

  以下の形式で報告:
  ---
  ## tools-analyzer 結果
  - 既存skill数: [X]
  - 既存subagent数: [X]
  - 改善提案: [リスト]
  - 優先度: [high/medium/low/none]
  ---
```

#### Subagent 6: engagement-analyzer (NEW - 最重要)
```
subagent_type: general-purpose
model: haiku
prompt: |
  **中毒性・エンゲージメント**を分析してください。
  目標: ユーザーが18時間使い続けたくなるアプリを作る

  1. コンポーネントをスキャン:
     - src/components/**/*.tsx
     - src/app/**/*.tsx

  2. 以下の**中毒性要素**を検出:
     【欠如している要素】
     - ローディング体験: スケルトン/スピナーなし → 待ち時間の退屈感
     - マイクロインタラクション: ホバー/クリックアニメーションなし
     - 成功体験の演出: 完了時のアニメーション/通知なし
     - 継続トリガー: 次のアクション提案なし
     - ゲーミフィケーション: 進捗表示/達成感なし
     - 視覚的報酬: 色変化/アイコン変化なし

  3. 中毒性スコアを判定:
     - HIGH: 中毒要素が充実（80%以上実装）
     - MEDIUM: 部分的に実装（40-79%）
     - LOW: ほぼ未実装（0-39%）→ 最優先で改善

  以下の形式で報告:
  ---
  ## engagement-analyzer 結果
  - 中毒性スコア: [HIGH/MEDIUM/LOW]
  - 実装済み要素: [リスト]
  - 欠如要素:
    - [ファイル:行] [要素タイプ] - [改善提案]
  - 最優先改善: [1つ選択]
  ---
```

#### Subagent 7: ux-analyzer (強化版)
```
subagent_type: general-purpose
model: haiku
prompt: |
  **操作の快感・即時フィードバック**を分析してください。
  目標: クリック・操作が気持ち良いUI

  1. コンポーネントをスキャン:
     - src/components/**/*.tsx
     - src/app/**/*.tsx

  2. 以下の**快感要素**を検出:
     【操作の快感】
     - ボタンサイズ: 44px未満のタップターゲット
     - ホバーエフェクト: hover:なしのインタラクティブ要素
     - クリックフィードバック: active:なしのボタン
     - トランジション: transition-なしの状態変化

     【即時フィードバック】
     - 楽観的UI: mutationで即座に反映されない
     - ローディング状態: isLoading未使用のasync操作
     - エラー表示: try-catchなし/エラー非表示
     - 成功通知: toast/通知なしの操作完了

     【シンプルさ】
     - 複雑なフォーム: 5項目以上の入力フォーム
     - 深いナビゲーション: 3クリック以上必要な操作
     - 非機能的UI: onClick={() => {}} 空ハンドラー

  3. 優先度判定: CRITICAL/HIGH/MEDIUM/LOW

  以下の形式で報告:
  ---
  ## ux-analyzer 結果
  - 検出問題数: [X]
  - 優先度分布: CRITICAL [X] / HIGH [X] / MEDIUM [X] / LOW [X]
  - 問題リスト:
    - [ファイル:行] [カテゴリ] [優先度] - [説明]
  - 推奨修正順序:
    1. [最優先の問題と修正方法]
  ---
```

#### Subagent 8: security-checker
```
subagent_type: general-purpose
model: haiku
prompt: |
  セキュリティ脆弱性を分析してください。

  1. APIルートをスキャン: src/app/api/**/route.ts

  2. 以下のパターンを検出:
     - 認証チェック欠落（createClient() + getUser() なしのPOST/PUT/DELETE）
     - クライアント信頼問題（formDataからuserId取得）
     - 入力検証不足（z.unknown()の過度な使用）
     - SERVICE_ROLE直接使用で認証バイパス

  3. 重要度判定: CRITICAL/HIGH/MEDIUM/LOW

  以下の形式で報告:
  ---
  ## security-checker 結果
  - 脆弱性数: [X]
  - 重要度分布: CRITICAL [X] / HIGH [X] / MEDIUM [X] / LOW [X]
  - 脆弱性リスト:
    - [ファイル:行] [タイプ] [重要度] - [説明]
  ---
```

#### Subagent 9: performance-profiler
```
subagent_type: general-purpose
model: haiku
prompt: |
  パフォーマンス問題を分析してください。
  ※パフォーマンスは即時フィードバックに直結するため重要

  1. API関数をスキャン: src/lib/api/*.ts

  2. N+1クエリパターンを検出:
     - for/for...of 内の supabase.from().select()
     - map()/forEach() 内のDB呼び出し
     - ループ内await

  3. 各問題について:
     - 現在のクエリ数を推定
     - 最適化後のクエリ数を提案

  以下の形式で報告:
  ---
  ## performance-profiler 結果
  - N+1クエリ数: [X]
  - 問題リスト:
    - [ファイル:関数名] [現在: X queries] → [最適化後: Y queries]
  ---
```

#### Subagent 10: feature-completeness-checker
```
subagent_type: general-purpose
model: haiku
prompt: |
  未実装・半実装機能を分析してください。

  1. TODOコメントをスキャン:
     grep -rn "TODO\|FIXME\|HACK" src/

  2. UIプレースホルダーを検出:
     - "Coming Soon" テキスト
     - onClick={() => {}} 空ハンドラー
     - disabled + 実装なし

  3. 優先度判定: HIGH/MEDIUM/LOW

  以下の形式で報告:
  ---
  ## feature-completeness-checker 結果
  - TODO数: [X]
  - プレースホルダーUI数: [X]
  - 問題リスト:
    - [ファイル:行] [タイプ] [優先度] - [内容]
  ---
```

### Phase 2: 結果統合・タスク判定（UX中毒性優先）

並列結果を受け取ったら、以下の**15段階優先順位**でタスクを決定:

| 優先度 | 条件 | アクション | 自動修正 |
|--------|------|-----------|----------|
| 1 | build-checker: fail | ビルドエラーを修正 | Yes |
| 2 | test-runner: fail | テストを修正 | Yes |
| **3** | **engagement-analyzer: LOW** | **中毒性向上施策を実装** | **Yes** |
| **4** | **ux-analyzer: CRITICAL** | **操作の快感を改善** | **Yes** |
| 5 | security-checker: CRITICAL | セキュリティ脆弱性を修正 | Yes |
| 6 | code-analyzer: complete + 変更あり | コミットを提案（`/quick-commit`） | Prompt |
| **7** | **ux-analyzer: HIGH** | **UX問題を修正** | **Yes** |
| **8** | **engagement-analyzer: MEDIUM** | **中毒性要素を追加** | **Yes** |
| 9 | performance-profiler: N+1検出 | クエリを最適化（即時フィードバック向上） | Yes |
| 10 | code-analyzer: in_progress | 作業を継続 | Context |
| 11 | state-analyzer: 作業中タスクあり | そのタスクを継続 | Context |
| **12** | **ux-analyzer: MEDIUM** | **UX改善** | **Prompt** |
| 13 | feature-completeness: TODO (HIGH) | 未実装機能を実装 | Yes |
| 14 | tools-analyzer: high | skill/subagent作成・更新 | Yes |
| 15 | すべてOK | 改善提案を行う | Analysis |

### Phase 3: 出力と実行

以下の形式で結果を報告し、**自動でタスクを実行**:

```
## 並列分析結果（10 subagent）

| Agent | 結果 |
|-------|------|
| code-analyzer | [X] 変更、[status] |
| build-checker | [success/fail] |
| state-analyzer | ミッション確認、作業中 [X] |
| test-runner | [success/fail/なし] |
| tools-analyzer | 提案 [X]件 |
| **engagement-analyzer** | **中毒性: [HIGH/MEDIUM/LOW]** |
| **ux-analyzer** | **問題 [X]件（CRITICAL [X]）** |
| security-checker | 脆弱性 [X]件 |
| performance-profiler | N+1 [X]件 |
| feature-completeness | TODO [X]件 |

---

## ミッション: ユーザーが18時間使い続けたくなるアプリを作る

## 推奨タスク: [タスク名]

優先度: [1-15]
理由: [判定理由 - ミッションとの関連を明記]
自動修正: [Yes/Prompt/Context]

---

[タスク実行を開始]
```

### Phase 4: 自動修正フロー（UX中毒性優先）

検出された問題を優先順位に従って自動修正:

```
中毒性 LOW → マイクロインタラクション追加 → ビルド確認
    ↓
UX CRITICAL → 操作の快感改善 → ビルド確認
    ↓
Security CRITICAL → 即時修正 → ビルド確認
    ↓
UX HIGH → フィードバック改善 → ビルド確認
    ↓
中毒性 MEDIUM → ゲーミフィケーション追加 → ビルド確認
    ↓
Performance N+1 → クエリ最適化 → テスト実行
    ↓
結果報告 → 次のアクション提案
```

## 中毒性改善パターン

### マイクロインタラクション追加

```tsx
// Before: 静的なボタン
<Button onClick={handleClick}>保存</Button>

// After: 中毒性のあるボタン
<Button
  onClick={handleClick}
  className="transition-all duration-200 hover:scale-105 active:scale-95"
>
  {isLoading ? <Spinner /> : '保存'}
</Button>
```

### 成功体験の演出

```tsx
// Before: 無反応
await saveData()

// After: 達成感
await saveData()
confetti({ particleCount: 100, spread: 70 })
toast.success('保存しました！', { icon: '🎉' })
```

### 継続トリガー

```tsx
// Before: 完了して終わり
<div>保存しました</div>

// After: 次のアクションを提案
<div className="space-y-4">
  <div className="flex items-center gap-2">
    <CheckCircle className="text-green-500" />
    保存しました！
  </div>
  <div className="text-sm text-muted-foreground">
    次のステップ:
  </div>
  <Button variant="outline" onClick={goToNextStep}>
    動画を生成する →
  </Button>
</div>
```

### Phase 5: 自動セッション記録

タスク実行完了後、**自動で `/handoff` を実行**してセッションを記録します。

```
[Phase 4 完了]
    ↓
自動で /handoff を実行
    ↓
HANDOFF.md に以下を追記:
- 完了したタスク
- 検出された問題と対応
- 次のアクション提案
```

これにより、セッション終了時の手動 `/handoff` が不要になります。

## 注意事項

- 10 subagent並列実行で分析時間を短縮（15-30秒）
- **ミッション最優先**: 常に「18時間使い続けたくなるか？」を判断基準に
- 破壊的操作（git reset --hard, rm -rf等）は実行しない
- ユーザーの明示的な指示がない限り、本番環境への変更は行わない
- 自動修正後は必ずビルド・テストで検証
- skill/subagent作成時は既存の命名規則・スタイルに従う
- **実行完了後は自動で `/handoff` が実行される**（手動不要）
