# Claude Code 設定リファレンス

グローバル設定（`~/.claude/`）の全体像。すべてのプロジェクトで自動的に利用可能。

---

## 設定概要

| カテゴリ | 数 | 場所 | 説明 |
|---------|-----|------|------|
| **Agents** | 18個 | `~/.claude/agents/` | 専門タスク用AIエージェント |
| **Commands** | 30個 | `~/.claude/commands/` | スラッシュコマンド（`/xxx`） |
| **Rules** | 8個 | `~/.claude/rules/` | 常時適用ガイドライン |
| **Skills** | 7個 | `~/.claude/skills/` | 詳細ワークフロー・パターン集 |

---

## 1. Agents（18個）

### 開発・品質管理

| Agent | 説明 | ツール | モデル |
|-------|------|--------|--------|
| **tdd-guide** | TDD専門家。テスト駆動開発（Red-Green-Refactor）を強制。80%+カバレッジ保証。 | Read, Write, Edit, Bash, Grep | opus |
| **code-reviewer** | シニアコードレビュアー。変更後にプロアクティブに品質・セキュリティレビュー。 | Read, Grep, Glob, Bash | opus |
| **e2e-runner** | Playwright E2Eテスト専門家。テスト生成・実行・フレーキーテスト管理。 | Read, Write, Edit, Bash, Grep, Glob | opus |
| **build-validator** | ビルド・型・リント・テスト検証の統合検証。 | Bash | inherit |
| **build-error-resolver** | ビルド・TypeScriptエラー解決専門家。最小限の修正でビルドを通す。 | Read, Write, Edit, Bash, Grep, Glob | opus |

### アーキテクチャ・設計

| Agent | 説明 | ツール | モデル |
|-------|------|--------|--------|
| **planner** | 複雑な機能・リファクタリングの計画専門家。 | Read, Grep, Glob | opus |
| **architect** | システム設計・スケーラビリティ・技術決定の専門家。 | Read, Grep, Glob | opus |
| **code-architect** | 設計レビュー・アーキテクチャ分析・リファクタリング計画。 | Read, Grep, Glob | inherit |
| **code-simplifier** | コード簡潔化・リファクタリング実行。 | Read, Edit | inherit |
| **refactor-cleaner** | デッドコード削除・重複排除の専門家。 | Read, Write, Edit, Bash, Grep, Glob | opus |

### セキュリティ・パフォーマンス

| Agent | 説明 | ツール | モデル |
|-------|------|--------|--------|
| **security-checker** | OWASP Top 10・セキュリティ脆弱性検出。 | Read, Grep | inherit |
| **security-reviewer** | セキュリティ脆弱性検出・修正専門家。機密データ処理時にプロアクティブに使用。 | Read, Write, Edit, Bash, Grep, Glob | opus |
| **performance-profiler** | パフォーマンス分析・ボトルネック検出・最適化提案。 | Read, Bash, Glob | inherit |
| **ux-analyzer** | UX/アクセシビリティ評価。WCAG 2.1 AA準拠チェック。 | Read, Glob | inherit |

### ドキュメント・その他

| Agent | 説明 | ツール | モデル |
|-------|------|--------|--------|
| **doc-updater** | ドキュメント・コードマップ更新専門家。 | Read, Write, Edit, Bash, Grep, Glob | opus |
| **feature-completeness-checker** | 機能完成度検証。要件充足・エッジケース・エラーハンドリング確認。 | Read, Grep | opus |
| **secretary-assistant** | タスク分析・レポート生成。秘書システムサポート。 | Read, Grep, Glob | haiku |
| **video-pipeline-analyzer** | Remotion動画生成パイプライン分析・最適化。 | Read, Bash | inherit |

---

## 2. Commands（30個）

### セッション管理

| コマンド | 説明 |
|---------|------|
| `/handoff` | セッション終了時の状態書き出し（HANDOFF.md） |
| `/resume` | セッション再開時の状態読み込み |
| `/memory save` | 現在の対話を記憶として保存 |
| `/memory list` | 記憶一覧を表示 |
| `/memory recall [kw]` | キーワードで記憶を呼び出し |
| `/memory delete` | 記憶を削除 |

### Git・コミット

| コマンド | 説明 |
|---------|------|
| `/quick-commit` | 高速コミット（conventional commits形式） |
| `/commit-push-pr` | status→diff→add→commit→push→PR作成 |
| `/review-changes` | 未コミット変更のレビュー・改善提案 |

### 品質管理・テスト

| コマンド | 説明 |
|---------|------|
| `/tdd` | TDD（テスト駆動開発）ワークフロー |
| `/code-review` | コードレビュー実行（品質・セキュリティ） |
| `/e2e` | E2Eテスト生成・実行（Playwright） |
| `/test-and-fix` | テスト実行→失敗分析→修正→再テスト |
| `/test-coverage` | テストカバレッジ分析・改善 |

### 計画・分析

| コマンド | 説明 |
|---------|------|
| `/plan` | 要件再確認→リスク評価→実装計画作成 |
| `/first-principles` | 問題の根本分析（第一原理思考） |
| `/reco` | UX中毒性最優先の10並列分析・全自動修正 |

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
| `/update-brain` | グローバルCLAUDE.md更新 |
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

## 3. Rules（8個）

`~/.claude/rules/` に配置。常時適用されるガイドライン。

| ルール | 内容 |
|--------|------|
| **security.md** | セキュリティチェックリスト（ハードコード禁止、SQLi/XSS対策、入力検証） |
| **coding-style.md** | コーディングスタイル（イミュータブル必須、ファイル800行以下、関数50行以下） |
| **testing.md** | テスト基準（80%+カバレッジ、TDDワークフロー、Unit/Integration/E2E） |
| **git-workflow.md** | Git運用（conventional commits、PRワークフロー） |
| **agents.md** | エージェント使用ルール（即時使用、並列実行、マルチ視点分析） |
| **performance.md** | パフォーマンス基準（モデル選択、コンテキスト管理） |
| **patterns.md** | デザインパターン・アーキテクチャパターン |
| **hooks.md** | Hooks設定ドキュメント |

### 主要ルール詳細

#### セキュリティ（security.md）

```
必須チェック:
- [ ] ハードコードされた秘密情報がない
- [ ] SQLインジェクション対策済み
- [ ] XSS対策済み
- [ ] CSRF対策済み
- [ ] 入力バリデーション実装済み
```

#### コーディングスタイル（coding-style.md）

```
サイズ制限:
- 関数: 50行以下
- ファイル: 800行以下
- ネスト: 4段以下

禁止事項:
- console.log の本番残存
- any 型の乱用
- マジックナンバー
```

#### テスト（testing.md）

```
カバレッジ: 80%以上必須

TDDワークフロー:
RED → GREEN → REFACTOR → REPEAT
```

---

## 4. Skills（7個）

`~/.claude/skills/` に配置。詳細なワークフロー定義・パターン集。

| スキル | 内容 |
|--------|------|
| **backend-patterns.md** | バックエンドアーキテクチャ、API設計、DB最適化 |
| **frontend-patterns.md** | フロントエンド開発パターン（React、Next.js、状態管理） |
| **coding-standards.md** | TypeScript/JavaScript/React/Node.js の統一コーディング規約 |
| **clickhouse-io.md** | ClickHouseデータベース連携・クエリ最適化 |
| **project-guidelines-example.md** | プロジェクト固有ガイドライン例 |
| **security-review/** | セキュリティレビュー詳細手順（ディレクトリ） |
| **tdd-workflow/** | TDDワークフロー詳細手順（ディレクトリ） |

---

## 5. 推奨ワークフロー

### 新機能開発

```
1. /plan          → 計画作成（planner エージェント）
2. /tdd           → テスト駆動開発（tdd-guide エージェント）
3. /code-review   → コードレビュー（code-reviewer エージェント）
4. /quick-commit  → コミット
5. /deploy-verify → デプロイ検証
```

### バグ修正

```
1. /tdd           → バグを再現するテストを先に書く
2. 修正実装
3. /test-and-fix  → テスト実行・確認
4. /code-review   → レビュー
5. /quick-commit  → コミット
```

### セキュリティ監査

```
1. security-checker エージェント → 脆弱性スキャン
2. security-reviewer エージェント → 詳細レビュー
3. 修正実装
4. /code-review → 再確認
```

### セッション管理

```
開始時: /resume     → 前回の状態を復元
終了時: /handoff    → 状態を保存（HANDOFF.md）
```

---

## 6. プロジェクト固有設定

### DynamicBranding/.claude/

| ディレクトリ | 内容 |
|-------------|------|
| `agents/` | UGC分析・CEPマッピング・インサイト生成エージェント |
| `commands/` | 分析ワークフロー用コマンド（8個） |
| `prompt/` | CEP抽出用プロンプトテンプレート |

### プロジェクト固有コマンド

| コマンド | 説明 |
|---------|------|
| `/analyze-ugc` | UGCデータの傾向分析 |
| `/extract-cep` | UGCからCEP抽出 |
| `/extract-brand-cep` | SNSデータからブランド別CEP定量抽出 |
| `/map-cep-product` | CEP×商品マッピング |
| `/generate-insight` | インサイト生成 |
| `/propose-strategy` | 施策提案 |
| `/export-report` | レポート出力 |
| `/claudemd` | CLAUDE.md自動生成・更新 |

---

## 7. 設定ファイル構造

```
~/.claude/
├── CLAUDE.md                 # グローバル共通設定
├── settings.json             # Hooks設定
├── agents/                   # Agents（18ファイル）
│   ├── tdd-guide.md
│   ├── code-reviewer.md
│   ├── e2e-runner.md
│   ├── planner.md
│   ├── architect.md
│   ├── security-reviewer.md
│   └── ...
├── commands/                 # Commands（30ファイル）
│   ├── tdd.md
│   ├── code-review.md
│   ├── e2e.md
│   ├── handoff.md
│   ├── resume.md
│   └── ...
├── rules/                    # Rules（8ファイル）
│   ├── security.md
│   ├── coding-style.md
│   ├── testing.md
│   └── ...
├── skills/                   # Skills（7ファイル/ディレクトリ）
│   ├── backend-patterns.md
│   ├── frontend-patterns.md
│   ├── tdd-workflow/
│   └── ...
└── secretary/                # 秘書システムデータ
    ├── TASKS.md
    ├── PROJECTS.md
    └── KNOWLEDGE.md
```

---

## 8. モデル選択ガイド

| モデル | 用途 | 例 |
|--------|------|-----|
| **opus** | 複雑な推論・重要タスク | planner, code-reviewer, security-reviewer |
| **haiku** | 軽量・高頻度タスク | secretary-assistant |
| **inherit** | 親設定を継承 | build-validator, code-simplifier |

---

## 9. Hooks設定

`~/.claude/settings.json` で定義。

### 有効なHooks

| イベント | 条件 | 動作 |
|---------|------|------|
| PostToolUse (Edit) | .ts/.tsx/.js/.jsx 編集後 | console.log検出警告 |
| PreToolUse (Bash) | git push 実行前 | レビュー確認警告 |

---

## 10. クイックリファレンス

### よく使うコマンド

```bash
/tdd              # テスト駆動開発
/code-review      # コードレビュー
/quick-commit     # 高速コミット
/handoff          # セッション終了
/resume           # セッション再開
```

### よく使うエージェント

```
tdd-guide         # TDD専門家
code-reviewer     # コードレビュアー
planner           # 計画作成
security-checker  # セキュリティチェック
```

---

*最終更新: 2026-01-19*
