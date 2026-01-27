# DynamicBranding Claude Code 設定

プロジェクト内蔵のClaude Code設定。Agents, Commands, Rules, Skillsをすべて含む。

---

## 1. 設定概要

| カテゴリ | 数 | 場所 | 説明 |
|---------|-----|------|------|
| **Agents** | 18個 | `agents/` | 専門タスク用AIエージェント |
| **Commands** | 30個 | `commands/` | スラッシュコマンド（`/xxx`） |
| **Rules** | 8個 | `rules/` | 常時適用ガイドライン |
| **Skills** | 9個 | `skills/` | 詳細ワークフロー・パターン集 |

---

## 2. Agents（18個）

### 開発・品質管理

| Agent | 説明 | モデル |
|-------|------|--------|
| **tdd-guide** | TDD専門家（Red-Green-Refactor）80%+カバレッジ保証 | opus |
| **code-reviewer** | シニアコードレビュアー（品質・セキュリティ） | opus |
| **e2e-runner** | Playwright E2Eテスト専門家 | opus |
| **build-validator** | ビルド・型・リント・テスト検証 | inherit |
| **build-error-resolver** | ビルドエラー解決専門家 | opus |

### アーキテクチャ・設計

| Agent | 説明 | モデル |
|-------|------|--------|
| **planner** | 複雑な機能・リファクタリングの計画 | opus |
| **architect** | システム設計・スケーラビリティ・技術決定 | opus |
| **code-architect** | 設計レビュー・アーキテクチャ分析 | inherit |
| **code-simplifier** | コード簡潔化・リファクタリング | inherit |
| **refactor-cleaner** | デッドコード削除・重複排除 | opus |

### セキュリティ・パフォーマンス

| Agent | 説明 | モデル |
|-------|------|--------|
| **security-checker** | OWASP Top 10・脆弱性検出 | inherit |
| **security-reviewer** | セキュリティ脆弱性検出・修正 | opus |
| **performance-profiler** | パフォーマンス分析・最適化 | inherit |
| **ux-analyzer** | UX/アクセシビリティ評価 | inherit |

### ドキュメント・その他

| Agent | 説明 | モデル |
|-------|------|--------|
| **doc-updater** | ドキュメント・コードマップ更新 | opus |
| **feature-completeness-checker** | 機能完成度検証 | opus |
| **secretary-assistant** | タスク分析・レポート生成 | haiku |
| **video-pipeline-analyzer** | Remotion動画パイプライン分析 | inherit |

---

## 3. Commands（30個）

### セッション管理

| コマンド | 説明 |
|---------|------|
| `/handoff` | セッション終了時の状態書き出し |
| `/resume` | セッション再開時の状態読み込み |
| `/memory` | 記憶管理（save/list/recall/delete） |

### Git・コミット

| コマンド | 説明 |
|---------|------|
| `/quick-commit` | 高速コミット（conventional commits） |
| `/commit-push-pr` | status→diff→add→commit→push→PR作成 |
| `/review-changes` | 未コミット変更のレビュー |

### 品質管理・テスト

| コマンド | 説明 |
|---------|------|
| `/tdd` | TDD（テスト駆動開発）ワークフロー |
| `/code-review` | コードレビュー（品質・セキュリティ） |
| `/e2e` | E2Eテスト生成・実行（Playwright） |
| `/test-and-fix` | テスト実行→修正→再テスト |
| `/test-coverage` | テストカバレッジ分析 |

### 計画・分析

| コマンド | 説明 |
|---------|------|
| `/plan` | 要件再確認→リスク評価→実装計画 |
| `/first-principles` | 問題の根本分析（第一原理思考） |
| `/reco` | UX中毒性最優先の並列分析・自動修正 |

### デプロイ・検証

| コマンド | 説明 |
|---------|------|
| `/deploy-verify` | 本番デプロイ統合検証 |
| `/confirm` | 本番環境の動作確認（Playwright E2E） |
| `/validate-api-integration` | API統合の検証 |
| `/verify-worker-deployment` | ワーカーデプロイの検証 |

### リファクタリング・修正

| コマンド | 説明 |
|---------|------|
| `/build-fix` | ビルドエラー解決・自動修正 |
| `/refactor-clean` | デッドコード削除・リファクタリング |
| `/error` | 全ページのエラー検出・自動修正 |

### ドキュメント

| コマンド | 説明 |
|---------|------|
| `/update-brain` | CLAUDE.md更新 |
| `/update-codemaps` | アーキテクチャコードマップ生成・更新 |
| `/update-docs` | コードベースからドキュメント更新 |

### 秘書システム

| コマンド | 説明 |
|---------|------|
| `/secretary` | ダッシュボード表示 |
| `/tasks` | タスク管理（add/done/list） |
| `/projects` | プロジェクト管理 |
| `/knowledge` | ナレッジベース管理 |

### その他

| コマンド | 説明 |
|---------|------|
| `/api-debug` | API統合デバッグ自動化 |
| `/db-migrate` | DBマイグレーション自動化 |

---

## 4. Rules（8個）

常時適用されるガイドライン。

| ルール | 内容 |
|--------|------|
| **security.md** | ハードコード禁止、SQLi/XSS対策、入力検証 |
| **coding-style.md** | 関数50行以下、ファイル800行以下、ネスト4段以下 |
| **testing.md** | 80%+カバレッジ、TDDワークフロー |
| **git-workflow.md** | conventional commits、PRワークフロー |
| **agents.md** | エージェント使用ルール、並列実行 |
| **performance.md** | モデル選択、コンテキスト管理 |
| **patterns.md** | デザインパターン・アーキテクチャパターン |
| **hooks.md** | Hooks設定ドキュメント |

---

## 5. Skills（9個）

詳細ワークフロー定義・パターン集。

| スキル | 内容 |
|--------|------|
| **backend-patterns.md** | バックエンドアーキテクチャ、API設計、DB最適化 |
| **frontend-patterns.md** | React、Next.js、状態管理パターン |
| **coding-standards.md** | TypeScript/JavaScript/React/Node.js規約 |
| **clickhouse-io.md** | ClickHouseデータベース連携 |
| **project-guidelines-example.md** | プロジェクト固有ガイドライン例 |
| **cep-extraction.md** | **CEP抽出手法（W'sフレームワーク）** |
| **dpt-framework.md** | **DPTフレームワーク（Use Case×Positioning）** |
| **security-review/** | セキュリティレビュー詳細手順（ディレクトリ） |
| **tdd-workflow/** | TDD詳細手順（ディレクトリ） |

---

## 6. ディレクトリ構成

```
.claude/
├── CLAUDE.md                 # この設定ファイル
├── settings.local.json       # ローカル環境設定
├── agents/                   # 18ファイル
│   ├── architect.md
│   ├── build-error-resolver.md
│   ├── build-validator.md
│   ├── code-architect.md
│   ├── code-reviewer.md
│   ├── code-simplifier.md
│   ├── doc-updater.md
│   ├── e2e-runner.md
│   ├── feature-completeness-checker.md
│   ├── performance-profiler.md
│   ├── planner.md
│   ├── refactor-cleaner.md
│   ├── secretary-assistant.md
│   ├── security-checker.md
│   ├── security-reviewer.md
│   ├── tdd-guide.md
│   ├── ux-analyzer.md
│   └── video-pipeline-analyzer.md
├── commands/                 # 30ファイル
│   ├── api-debug.md
│   ├── build-fix.md
│   ├── code-review.md
│   ├── commit-push-pr.md
│   ├── confirm.md
│   ├── db-migrate.md
│   ├── deploy-verify.md
│   ├── e2e.md
│   ├── error.md
│   ├── first-principles.md
│   ├── handoff.md
│   ├── knowledge.md
│   ├── memory.md
│   ├── plan.md
│   ├── projects.md
│   ├── quick-commit.md
│   ├── reco.md
│   ├── refactor-clean.md
│   ├── resume.md
│   ├── review-changes.md
│   ├── secretary.md
│   ├── tasks.md
│   ├── tdd.md
│   ├── test-and-fix.md
│   ├── test-coverage.md
│   ├── update-brain.md
│   ├── update-codemaps.md
│   ├── update-docs.md
│   ├── validate-api-integration.md
│   └── verify-worker-deployment.md
├── rules/                    # 8ファイル
│   ├── agents.md
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── hooks.md
│   ├── patterns.md
│   ├── performance.md
│   ├── security.md
│   └── testing.md
└── skills/                   # 7ファイル + 2ディレクトリ
    ├── backend-patterns.md
    ├── cep-extraction.md     # CEP抽出手法（W'sフレームワーク）
    ├── clickhouse-io.md
    ├── coding-standards.md
    ├── dpt-framework.md      # DPTフレームワーク（Use Case×Positioning）
    ├── frontend-patterns.md
    ├── project-guidelines-example.md
    ├── security-review/
    │   └── SKILL.md
    └── tdd-workflow/
        └── SKILL.md
```

---

## 7. 推奨ワークフロー

### 新機能開発

```
1. /plan              → 計画作成（planner）
2. /tdd               → テスト駆動開発（tdd-guide）
3. /code-review       → コードレビュー（code-reviewer）
4. /quick-commit      → コミット
5. /deploy-verify     → デプロイ検証
```

### バグ修正

```
1. /tdd               → バグを再現するテストを先に書く
2. 修正実装
3. /test-and-fix      → テスト実行・確認
4. /code-review       → レビュー
5. /quick-commit      → コミット
```

### セキュリティ監査

```
1. security-checker   → 脆弱性スキャン
2. security-reviewer  → 詳細レビュー
3. 修正実装
4. /code-review       → 再確認
```

### セッション管理

```
開始時: /resume       → 前回の状態を復元
終了時: /handoff      → 状態を保存（HANDOFF.md）
```

---

## 8. クイックリファレンス

### よく使うコマンド

```bash
/tdd               # テスト駆動開発
/code-review       # コードレビュー
/e2e               # E2Eテスト
/quick-commit      # 高速コミット
/handoff           # セッション終了
/resume            # セッション再開
```

### よく使うAgent

```
tdd-guide          # TDD専門家
code-reviewer      # コードレビュアー
planner            # 計画作成
security-checker   # セキュリティチェック
```

---

## 9. 関連ドキュメント

| ドキュメント | 説明 |
|-------------|------|
| [`../CLAUDE.md`](../CLAUDE.md) | プロジェクト設定（ダッシュボード、DB、API等） |
| [`../docs/CLAUDE_CODE_CONFIG.md`](../docs/CLAUDE_CODE_CONFIG.md) | グローバル設定リファレンス |
| [`../HANDOFF.md`](../HANDOFF.md) | セッション引き継ぎ |

---

## 10. 注意事項

- Skill/Subagentの追加・変更時は `/CLAUDE.md` のSkill一覧も更新すること
- `settings.local.json` はgitignore対象

---

*最終更新: 2026-01-19*
