# CLAUDECODE - Claude Code オンボーディング

Claude Code導入・説明会用のWebアプリケーション。

## サイト情報

| 項目 | 値 |
|------|-----|
| 本番URL | https://claude-code-onboarding-ten.vercel.app |
| 技術スタック | Next.js 16 + React 19 + Tailwind CSS |
| 対象者 | 完全初心者（CLI/ターミナル未経験者向け） |

## レベル構成（3段階）

レベルカード3枚で切替。各レベルの先頭に「ミッション」タブ（Progate風Step-by-Step形式）。

| レベル | タブ数 | 内容 |
|--------|--------|------|
| 🌱 初心者 | 3 | ミッション + Getting Started + Starter Kit |
| 🌿 中級者 | 6 | ミッション + Features + Examples + Architecture + Compare + Skills |
| 🌳 上級者 | 3 | ミッション + Build + Tips |

## ページ構成（12タブ）

| タブ | 内容 | 用途 | レベル |
|------|------|------|--------|
| ミッション | Step-by-Stepミッション（アコーディオン展開） | **ゴール管理** | 全レベル |
| Getting Started | インストール〜基本操作〜Starter Kit | **説明会メイン**（約27分） | 🌱 |
| Starter Kit | 1コマンドでプロ環境構築 | 初期セットアップ | 🌱 |
| Features | Skills/Commands/Agents/Rules一覧 | リファレンス | 🌿 |
| Examples | よくあるプロンプト例（コピーボタン付き） | 実践用 | 🌿 |
| Architecture | Claude Code全体像（7要素の定義・役割） | 概念理解 | 🌿 |
| Compare | Agent SDK vs Everything Claude Code vs Starter Kit | 比較・選択 | 🌿 |
| Skills | おすすめカスタムスキル8個（コピー可能） | 実戦導入 | 🌿 |
| Build | Vercel/Supabase/API Keys/Hooks導入ガイド | 実践構築 | 🌳 |
| Tips | 上級機能（CLAUDE.md、Subagent、Hooks） | 慣れてきたら | 🌳 |

## 収録コンテンツ

| カテゴリ | 件数 |
|---------|------|
| Getting Started ステップ | 9件 |
| **用語説明（Glossary）** | **7件**（初心者向け） |
| **ペルソナ＆ゴール** | **3レベル分** |
| Skills | 9件 |
| Commands | 10件 |
| Agents | 9件 |
| Rules | 8件 |
| プロンプト例 | 15件 |
| Architecture要素 | 7件 |
| おすすめカスタムスキル | 8件 |
| Starter Kit | 12コマンド + 8エージェント + 6ルール + 1ドキュメント |
| 上級Tips | 9件 |

## 用語説明（初心者向け）

Getting Startedタブの冒頭に折りたたみ式で表示。

| 用語 | 説明 | 例え |
|------|------|------|
| エディター | コードを書くためのアプリ | メモ帳の超高機能版 |
| Cursor | AI機能付きエディター | VS Code + AI相棒 |
| Claude Code | ターミナルで動くAI | ChatGPTのターミナル版 |
| ターミナル | 文字だけで操作する画面 | 黒い画面 |
| CLI | ターミナルで使うツール | 打って操作 |
| Homebrew | Macのアプリ管理ツール | App Storeのターミナル版 |
| npm | Node.jsパッケージ管理 | JavaScriptの部品屋さん |

## ペルソナ＆ゴール

レベル選択時にヘッダー下バナーで表示。

| レベル | ペルソナ | ゴール | 目安時間 |
|--------|---------|--------|----------|
| 🌱 初心者 | ターミナル初心者（非エンジニア） | 中級者へ（インストール、基本操作、Plan Mode） | 約1-2時間 |
| 🌿 中級者 | 効率化を目指す人（1-2年経験） | 上級者へ（CLAUDE.md、Subagent、チーム展開） | 約1-2週間 |
| 🌳 上級者 | ワークフロー職人（3年以上） | マスター（独自Skill/Agent/Hooks/MCP） | 継続的 |

## おすすめカスタムスキル（Skillsタブ）

| カテゴリ | スキル | 用途 |
|---------|--------|------|
| セッション | `/handoff` | セッション終了時の進捗保存 |
| セッション | `/resume` | セッション再開 |
| セッション | `/memory` | 記憶の保存・呼び出し |
| Git | `/quick-commit` | 高速コミット |
| 品質 | `/code-review` | コードレビュー |
| 品質 | `/tdd` | テスト駆動開発 |
| 開発 | `/build-fix` | ビルドエラー修正 |
| 開発 | `/plan` | 実装計画作成 |

## 開発コマンド

```bash
cd opperation/CLAUDECODE/webapp
npm run dev      # ローカル起動（http://localhost:3000）
npm run build    # ビルド
vercel --prod    # 本番デプロイ
```

## フォルダ構成

```
opperation/CLAUDECODE/
├── CLAUDE.md                    # このファイル
└── webapp/
    ├── app/
    │   ├── page.tsx             # メインページ（7タブ）
    │   ├── layout.tsx           # レイアウト
    │   └── data/
    │       └── onboarding-data.ts  # 全データ（型定義含む）
    ├── package.json
    └── tailwind.config.ts
```

## Architecture要素（Architectureタブ）

Claude Codeを構成する7要素の定義と役割を解説。

| 要素 | 定義 | 保存場所 |
|------|------|---------|
| Skills | ワークフロー定義 | `~/.claude/skills/` |
| Commands | 即時実行コマンド | `~/.claude/commands/` |
| Agents | Subagent定義 | `~/.claude/agents/` |
| Rules | 常時適用ルール | `~/.claude/rules/` |
| Hooks | 自動トリガー | `~/.claude/settings.json` |
| MCPs | 外部サービス連携 | `~/.claude.json` |
| CLAUDE.md | プロジェクト設定 | プロジェクトルート |

## Key Files

| ファイル | 用途 |
|---------|------|
| `webapp/app/page.tsx` | メインページ（7タブ、全コンポーネント） |
| `webapp/app/data/onboarding-data.ts` | 全データ（ステップ、機能、例、アーキテクチャ、スキル、Tips） |

## データ更新方法

`webapp/app/data/onboarding-data.ts` を編集:

- `gettingStartedSteps` - Getting Startedのステップ
- `features` - Skills/Commands/Agents/Rules
- `examples` - プロンプト例
- `architectureElements` - Architecture要素（7件）
- `recommendedSkills` - おすすめカスタムスキル
- `tips` - 上級Tips

## Starter Kit（GitHub）

社内メンバー向けClaude Code設定リポジトリ。

| 項目 | 値 |
|------|-----|
| GitHub | https://github.com/Hantaku705/claude-code-starter |
| インストール | `claude /install-github-plugin Hantaku705/claude-code-starter` |
| 含まれるもの | 12コマンド + 8エージェント + 6ルール + **1ドキュメント（Agent SDK）** |

## 更新履歴

- 2026-01-27: Progate風ミッション形式化（Step-by-Step展開、全10ミッション、ミッションタブ化、Buildタブ追加、Skills中級者移動、参考サイトリンク追加）
- 2026-01-27: 用語説明＆ペルソナ＆ゴール追加（Glossary 7件、3レベル分のペルソナ＆卒業条件、ヘッダー下バナー）
- 2026-01-27: Starter Kit に Claude Agent SDK Docs 追加（docs/agent-sdk.md、Stats 4列化、Docsセクション）
- 2026-01-27: Getting Startedステップ7修正（「便利機能」→「Starter Kit」、合計時間29分→27分）
- 2026-01-27: Compareタブ3項目比較化（Agent SDK vs Everything Claude Code vs Starter Kit）
- 2026-01-27: Starter Kitタブ追加（GitHub連携、1コマンドでプロ環境構築）
- 2026-01-27: Architectureタブ追加（Claude Code全体像、7要素の定義・役割・比較表・使い分けガイド）
- 2026-01-27: Skillsタブ追加（8個のおすすめカスタムスキル、コピー機能、導入ガイド）
- 2026-01-27: Compareタブ追加（Agent SDK vs Everything Claude Code）
- 2026-01-27: 初版作成（説明会向け、4タブ）
