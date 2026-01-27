# AP - 社内プロジェクト管理リポジトリ

社内の様々なプロジェクトを管理するリポジトリ。

---

## フォルダ構成

```
AP/
├── projects/               # 全プロジェクト
│   ├── concept-learning/   # コンセプト学習
│   ├── dr.melaxin/         # Dr.Melaxin
│   ├── mascode/            # MASCODE
│   ├── norganic/           # N organic X戦略
│   ├── phonefarm/          # Phone Farm
│   ├── Refa/               # ReFa プロモーション変遷分析
│   ├── the-room-fx/        # ANA THE Room FX
│   └── workflow/           # プロジェクトワークフローガイド
│
├── _agents/                # Claude Agent SDK
│   ├── src/                # SDKソースコード
│   ├── prompts/            # システムプロンプト
│   └── CLAUDE.md           # Agent SDK設定
│
├── _claude-code/           # Claude Code設定リファレンス
│   ├── agents/             # Subagent定義
│   ├── commands/           # Skillコマンド定義
│   ├── rules/              # ルール定義
│   ├── skills/             # Skill定義
│   ├── hooks/              # Hook定義
│   ├── mcp-configs/        # MCP設定
│   └── examples/           # 設定例
│
├── _archive/               # アーカイブ
│
├── opperation/             # 運用・学習資料
│   ├── CLAUDECODE/          # Claude Code オンボーディングWebapp
│   ├── multi-agent/         # マルチエージェントシステム（YAML拡張、Skills自動生成）
│   ├── なまえデザイン_フォルダ/  # 「なまえ」デザイン書籍まとめ
│   ├── サブスク/            # サブスク確認ツール（Gmail API連携）
│   └── clawdbot/           # Clawdbot AIアシスタント設定ガイド
│
├── NADESHIKO/              # 美容系SNSメディア事業
│   ├── code/               # GASインサイト自動取得スクリプト
│   ├── data/               # 利益管理シート（CSV、33件）
│   ├── issue/              # 週次ミーティングノート
│   ├── scripts/            # CSV→TypeScript変換スクリプト
│   └── webapp/             # Next.js Webアプリ（1,102件データ）
│
├── CLAUDE.md               # このファイル
├── HANDOFF.md              # セッション引き継ぎ
└── README.md               # リポジトリ概要
```

---

## プロジェクト固有ルール

### スキル・ナレッジの保存先

このプロジェクトで「skillsに入れて」「スキルとして保存して」と指示された場合：

| 指示 | 保存先 |
|------|--------|
| スキル追加 | `AP/_claude-code/skills/` |
| コマンド追加 | `AP/_claude-code/commands/` |
| ルール追加 | `AP/_claude-code/rules/` |

**グローバル（`~/.claude/`）ではなく、APプロジェクト内に保存する。**

### 既存スキル一覧

| スキル | 用途 |
|--------|------|
| `concept-design.md` | コンセプト設計原則・チェックリスト |
| `what-game.md` | 「何ゲーか」分析フレームワーク（市場構造の本質特定） |
| `project-workflow.md` | プロジェクト型タスクの5段階ワークフロー（与件→Webapp） |
| `coding-standards.md` | コーディング標準 |
| `webapp-data-pattern.md` | Webappデータパターン |
| `backend-patterns.md` | バックエンドパターン |
| `frontend-patterns.md` | フロントエンドパターン |

### 既存コマンド一覧

| コマンド | 用途 |
|---------|------|
| `/address-lookup` | 企業サイトから住所を取得し配送フォーム形式（英語）に変換 |
| `/build-fix` | ビルドエラーの自動修正 |
| `/code-review` | コードレビュー実行 |
| `/e2e` | E2Eテスト生成・実行（Playwright） |
| `/plan` | 実装計画作成 |
| `/tdd` | TDDワークフロー |

---

## プロジェクト別詳細

### concept-learning（コンセプト学習）

マーケティングコンセプト学習のWebアプリと資料。

**本番URL**: https://webapp-five-bay.vercel.app

**技術スタック**:
- Next.js 16.1.3 (App Router)
- React 19
- TypeScript
- Tailwind CSS

**ページ構成**:
| パス | 内容 |
|-----|------|
| `/` | トップページ |
| `/concept` | コンセプト学習トップ（2セクション） |
| `/concept/textbook` | コンセプトの教科書（全6章） |
| `/concept/examples` | 事例一覧（15件） |
| `/concept/examples/[slug]` | 事例詳細（14項目評価） |

**Key Files**:
| ファイル | 用途 |
|---------|------|
| `projects/concept-learning/webapp/src/data/concept-data.json` | コンセプトデータ（※手動同期） |
| `projects/concept-learning/docs/concept-data.json` | マスターデータ（こちらを編集） |

**開発コマンド**:
```bash
cd projects/concept-learning/webapp
npm run dev
```

**デプロイ**:
```bash
cd projects/concept-learning/webapp
vercel --prod --yes
```

---

### mascode（MASCODEプロジェクト）

MASCODE BEAUTYのプロモーション提案・メディアプラン。

**ファイル**:
| ファイル | 内容 |
|---------|------|
| `projects/mascode/proposal.pdf` | 2026SS-AWプロモーション提案 |
| `projects/mascode/media-plan/` | メディアプラン資料 |

---

### phonefarm（Phone Farmプロジェクト）

TikTok等のPhone Farm不正業者の脅威インテリジェンスレポート。

**本番URL**: https://phonefarm-threat-intel.vercel.app

**技術スタック**:
- Next.js 15.5.9 (App Router)
- React 19
- TypeScript
- Tailwind CSS

**ページ構成**:
| パス | 内容 |
|-----|------|
| `/` | 脅威インテリジェンスレポート |
| `/setup-guide` | 初心者向け0→1セットアップガイド |

**Key Files**:
| ファイル | 用途 |
|---------|------|
| `projects/phonefarm/webapp/src/data/report-data.ts` | レポートデータ（ハードウェア、ソフトウェア、検出戦略等） |
| `projects/phonefarm/webapp/src/data/setup-guide-data.ts` | セットアップガイドデータ（買い物リスト、手順等） |
| `projects/phonefarm/webapp/src/app/page.tsx` | レポートページ |
| `projects/phonefarm/webapp/src/app/setup-guide/page.tsx` | セットアップガイドページ |

**開発コマンド**:
```bash
cd projects/phonefarm/webapp
npm run dev
```

**デプロイ**:
```bash
cd projects/phonefarm/webapp
vercel --prod --yes
```

---

### dr.melaxin（Dr.Melaxinプロジェクト）

BRAND501 Corp.のスキンケアブランド「Dr.Melaxin」の日本市場マーケティング提案。

**本番URL**: https://dr-melaxin-proposal.vercel.app

**目標**: 日本市場でGMV 120億円をASAPで達成

**技術スタック**:
- Next.js 16.1.4 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Recharts（グラフ可視化）

**ページ構成**:
| パス | 内容 |
|-----|------|
| `/` | 提案書（9セクション、グラフ4種） |
| `/research` | 競合リサーチ（6セクション） |

**提案書セクション**（9セクション）:
| # | セクション | 内容 |
|---|-----------|------|
| 1 | 概要 | 基本情報、目標GMV |
| 2 | 戦略方針 | Plan A vs Plan B比較 |
| 3 | 財務計画 | 投資38億円、ROAS 316%、累計売上グラフ |
| 4 | 投資内訳 | Outbound Mass / EC / Offline、円グラフ |
| 5 | チャネル戦略 | Qoo10、TikTok Shop、チャネル別棒グラフ |
| 6 | GTMロードマップ | 四半期別投資/売上比較グラフ |
| 7 | 競合分析 | Anua、medicube比較 |
| 8 | プロモーション戦略 | オンライン/オフライン施策 |
| 9 | KOL・TikTok Shop | KOL Pick戦略、事例 |

**リサーチセクション**（6セクション）:
| # | セクション | 内容 |
|---|-----------|------|
| 1 | 市場概況 | ブランドTier別売上、購買傾向 |
| 2 | 成功パターン | 通常期・メガ割の勝ちパターン |
| 3 | 競合分析（詳細） | Dalba、Medicube、LAKA |
| 4 | マーケティング手法 | ホワイト/グレー施策、RT部隊 |
| 5 | JT代理店情報 | LAKA/朝鮮美人の課題感 |
| 6 | Dr.Melaxinへの示唆 | Top Tier共通点、必要アクション |

**フォルダ構成**:
```
projects/dr.melaxin/
├── CLAUDE.md               # プロジェクト概要
├── docs/                   # 戦略ドキュメント
│   ├── budget-proposal-10m.md  # メイン資料（$10M予算提案書、704行）
│   ├── proposal.md         # 提案書サマリー（332行）
│   ├── research.md         # 競合リサーチ（6セクション）
│   ├── brief.md            # 案件ブリーフ
│   └── memo.md             # 社内ミーティングメモ
├── media-plan/             # メディアプラン
│   ├── annual.md           # 年間計画
│   ├── march.md            # 3月メガ割（GMV 5-7億円）
│   └── june.md             # 6月メガ割（GMV 10億円、ジョングク）
├── source/                 # 元ファイル・データ
│   ├── proposal.pdf        # 元PDF（65ページ）
│   ├── proposal.pptx       # PowerPoint
│   ├── gtm-original.csv    # 元GTM
│   ├── gtm-10m.csv         # $10M版GTM
│   └── slides/             # PDF画像（65枚）
└── webapp/                 # Next.js提案書可視化アプリ
```

**Key Files**:
| ファイル | 用途 |
|---------|------|
| `projects/dr.melaxin/docs/budget-proposal-10m.md` | **メイン資料**（$10M予算提案書、704行） |
| `projects/dr.melaxin/docs/research.md` | 競合リサーチ（整理済み、6セクション） |
| `projects/dr.melaxin/media-plan/annual.md` | 年間メディアプラン |
| `projects/dr.melaxin/media-plan/march.md` | 3月メガ割詳細プラン |
| `projects/dr.melaxin/media-plan/june.md` | 6月メガ割詳細プラン |
| `projects/dr.melaxin/webapp/src/data/proposal-data.ts` | 提案書データ（構造化） |

**開発コマンド**:
```bash
cd projects/dr.melaxin/webapp
npm run dev
```

**デプロイ**:
```bash
cd projects/dr.melaxin/webapp
vercel --prod --yes
```

**提案概要（元提案 38億円）**:
| 項目 | 値 |
|------|-----|
| マーケティング投資 | 38億円 |
| 売上目標 | 120億円 |
| ROAS | 316% |
| 主力チャネル | Qoo10（売上の55%） |
| 主力製品 | Serum（美容液） |

**$10M予算提案（15.8億円）**:
| 項目 | 値 |
|------|-----|
| マーケティング投資 | $10M USD（約15.8億円） |
| 売上目標 | 約45-50億円 |
| ROAS | 289%（Scenario 2） |
| 3シナリオ | パフォーマンス重視 / バランス型 / ハイブリッド |
| 推奨 | Scenario 2（バランス型）- Ambassador 3億円 + パフォーマンス |

**戦略**: Plan B（Vertical Launch）- 初期から積極投資で美容液市場を攻める

**勝ちパターン**: 「通常期で話題を作り、メガ割で刈り取る」

---

### the-room-fx（ANA ビジネスクラス）

ANA新ビジネスクラス「THE Room FX」のグローバル広告配信プロジェクト。

**案件概要**:
| 項目 | 内容 |
|------|------|
| クライアント | ANA（全日空） |
| 代理店 | AnyMind |
| プロダクト | THE Room FX（B787-9 新ビジネスクラス） |
| 予算 | 4,000万円（3月度）、年間3億円規模 |
| 競合 | アイレップ（2社コンペ） |

**スケジュール**:
| 日付 | 内容 |
|------|------|
| 2026年2月5日 | メディアプラン締切 |
| 2026年3月2日 | ティーザー配信開始 |
| 2026年3月9日 | 本プロモーション開始 |

**ターゲット**: 北米（70%）、欧州（30%）、Z/Y世代、訪日検討層

**フォルダ構成**:
```
projects/the-room-fx/
├── CLAUDE.md               # プロジェクト概要
├── brief/                  # ブリーフ資料
│   ├── 全体.md             # ブリーフ全体像（整理済み）
│   └── *.pdf               # ANA公式ブリーフ
├── proposal/               # 提案書（11ファイル + appendix）
│   ├── 01_executive-summary.md    # エグゼクティブサマリー
│   ├── 02_our-understanding.md    # ブリーフ理解
│   ├── 03_market-insight.md       # 市場インサイト ★差別化の核心
│   ├── 04_target-strategy.md      # ターゲット戦略
│   ├── 05_media-strategy.md       # メディア戦略
│   ├── 06_budget-allocation.md    # 予算配分
│   ├── 07_creative-direction.md   # クリエイティブ方針
│   ├── 08_kpi-framework.md        # KPI設計
│   ├── 09_campaign-timeline.md    # スケジュール
│   ├── 10_operation.md            # 運用・最適化
│   ├── 11_why-anymind.md          # 差別化ポイント
│   └── appendix/                  # 付録
│       ├── media-plan-detail.md   # 詳細メディアプラン表
│       └── influencer-list.md     # インフルエンサーリスト
└── data/                   # SNS分析データ
    ├── processed/          # クリーンデータ（5,795件）
    ├── summary/            # サマリー（トライブ分布等）
    └── analysis/           # 分析結果（インサイトレポート）
```

**Key Files**:
| ファイル | 用途 |
|---------|------|
| `projects/the-room-fx/brief/全体.md` | ブリーフ全体像（整理済み） |
| `projects/the-room-fx/proposal/03_market-insight.md` | **市場インサイト**（差別化の核心、SNS分析5,795件） |
| `projects/the-room-fx/proposal/04_target-strategy.md` | **ターゲット戦略**（6セグメント×トライブ） |
| `projects/the-room-fx/proposal/05_media-strategy.md` | **メディア戦略**（PMP、ブランドセーフティ） |
| `projects/the-room-fx/proposal/11_why-anymind.md` | **差別化ポイント**（対アイレップ4本柱） |
| `projects/the-room-fx/data/analysis/tribe_insights.md` | SNSトライブ分析インサイト |

**差別化の4本柱**（対アイレップ）:
| ポイント | 内容 |
|---------|------|
| データドリブン | SNS分析5,795件、394名インフルエンサーリスト |
| PMP | Bloomberg、航空専門メディア等プレミアム媒体 |
| ブランドセーフティ | MFA回避、ホワイトリスト運用 |
| トライブベース | デモグラではなく行動・関心軸でターゲティング |

**SNS UGC分析**:
| 項目 | 値 |
|------|-----|
| データソース | Meltwater（SNSモニタリング） |
| 総投稿数 | 5,795件 |
| ターゲット地域投稿数 | 2,623件（US/UK/FR/DE/IT/CA） |
| 分析期間 | 2024年1月〜2026年1月 |

**トライブ優先度**:
| 優先度 | トライブ | 理由 |
|--------|---------|------|
| 1位 | Travel Enthusiast | 唯一ポジティブ（+0.54）、欧州で強い |
| 2位 | Tech/Digital | 最大ボリューム（922件）、拡散力高 |
| 3位 | Business Traveler | エンゲージメント最高、高購買力層 |

---

### Refa（ReFa プロモーション変遷分析）

MTG株式会社の美容ブランド「ReFa」のプロモーション変遷分析レポートをWebapp化。

**本番URL**: https://refa-report.vercel.app

**技術スタック**:
- Next.js 16.1.4 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Recharts（グラフ可視化）

**ページ構成**:
| パス | 内容 |
|-----|------|
| `/` | ダッシュボード（イノベーター理論曲線、売上推移、KPI、フェーズ概要、**今後の展望**） |
| `/phases` | 5フェーズ詳細（タブ切り替え、**ReFa GINZA**、**ブランド成長サイクル**） |
| `/products` | 製品ポートフォリオ分析 |
| `/channels` | チャネル戦略分析（イノベーター理論との対応、セグメント別分析） |

**主要な可視化**:
- **イノベーター理論曲線**: ReFaの「5年かけた戦略的忍耐」を釣り鐘型曲線で表現
- **売上推移グラフ**: 2019年の危機（-144億円）から2025年の過去最高（728億円）への復活
- **KPIカード**: 危機時と現在の比較（ReFa売上+435%等）
- **チャネル展開フロー**: 美容室限定→百貨店→ホテルBtoBtoC→家電量販店

**イノベーター理論 × ReFa戦略**:
| 普及層 | 時期 | チャネル |
|--------|------|---------|
| イノベーター | 2019年 | 美容室限定販売 |
| アーリーアダプター | 2020-21年 | 百貨店・EC |
| アーリーマジョリティ | 2022-23年 | ホテルBtoBtoC 2,600施設 |
| レイトマジョリティ | 2024年〜 | 家電量販店、マスCM ★現在地 |

**Key Files**:
| ファイル | 用途 |
|---------|------|
| `projects/Refa/report.md` | 元レポート（約600行） |
| `projects/Refa/webapp/data/report-data.ts` | 全データ（構造化、ReFa GINZA・成長サイクル含む） |
| `projects/Refa/webapp/components/charts/AdoptionCurve.tsx` | イノベーター理論曲線 |
| `projects/Refa/webapp/components/charts/SalesChart.tsx` | 売上推移グラフ |
| `projects/Refa/webapp/app/page.tsx` | ダッシュボード（今後の展望セクション含む） |
| `projects/Refa/webapp/app/phases/page.tsx` | 5フェーズ詳細（ReFa GINZA・成長サイクル含む） |

**開発コマンド**:
```bash
cd projects/Refa/webapp
npm run dev
```

**デプロイ**:
```bash
cd projects/Refa/webapp
vercel --prod --yes
```

---

### _claude-code（Claude Code設定）

Claude Codeの設定リファレンス実装。

**ディレクトリ**:
| フォルダ | 内容 |
|---------|------|
| `agents/` | Subagent定義 |
| `commands/` | Skillコマンド定義 |
| `rules/` | ルール定義 |
| `skills/` | Skill定義 |
| `hooks/` | Hook定義 |
| `mcp-configs/` | MCP設定 |
| `examples/` | 設定例（CLAUDE.md等） |

---

### NADESHIKO（美容系SNSメディア）

AnyMind Groupの美容系SNSメディア「NADESHIKO」の運用資料・分析データ・売上管理Webapp。

**売上管理Webapp**:
| 項目 | 値 |
|------|-----|
| 本番URL | https://nadeshiko-sales.vercel.app |
| 技術スタック | Next.js 16.1.4 + React 19 + Recharts + Tailwind CSS |
| タブ構成 | Dashboard / Deals / Performance / Views / Algorithm |
| データ期間 | 2023年11月〜2026年4月（30月分、1,102件） |

**事業概要**:
| 項目 | 内容 |
|------|------|
| 事業 | 美容系SNSメディア運営（TikTok/IG/YT/X） |
| ビジネスモデル | タイアップ投稿 + 広告配信 + 素材納品 |
| 月間目標 | 粗利 2,000〜5,000万円 |

**Key Files**:
| ファイル | 用途 |
|---------|------|
| `NADESHIKO/issue/issue.md` | 週次ミーティング記録（2025年9月〜2026年1月、約2,300行） |
| `NADESHIKO/issue/ksf.md` | KSF（本質分析）- 勝者リスト、ゲーム構造、再現手順 |
| `NADESHIKO/algorithm/algorithm.md` | TikTokアルゴリズム解説（FYP、移動平均、5^6理論等） |
| `NADESHIKO/data/利益管理シート/*.csv` | 月別利益管理シート（33件、2023年11月〜2026年4月） |
| `NADESHIKO/scripts/csv_to_deals_all.py` | CSV→TypeScript変換スクリプト（4フォーマット対応） |
| `NADESHIKO/webapp/` | 売上管理Webapp（Next.js） |

**主要課題（2026年1月時点）**:
- 再生数低迷（検索流入減少）
- インバウンド減少
- 組織問題（キーメンバー燃え尽き）

**開発コマンド**:
```bash
cd NADESHIKO/webapp
npm run dev
```

**デプロイ**:
```bash
cd NADESHIKO/webapp
vercel --prod --yes
```

---

## 更新履歴

- 2026-01-27: **nanobanana MCP設定**（Gemini 2.5 Flash画像生成、`claude mcp add nanobanana-mcp`）
- 2026-01-27: **tmux版multi-agent-shogunフル起動成功**（パス修正4ファイル、10インスタンス起動、`./start_macos.sh`）
- 2026-01-27: **/shogun Task tool化**（tmuxベース→Claude Code Task toolベースに移行、ターミナル操作不要、`/shogun タスク内容` で完結）
- 2026-01-27: **Multi-Agent System実装**（`opperation/multi-agent/`、Orchestrator/Coordinator/SubAgent×8、YAML拡張、Skills自動生成、Web UIダッシュボード、28ファイル）
- 2026-01-27: CLAUDECODE Webapp Progate風ミッション形式化（Step-by-Step展開、全10ミッション、ミッションタブ化、Buildタブ追加、Skills中級者移動、参考サイトリンク追加）
- 2026-01-27: CLAUDECODE Webapp Compareタブ3項目比較化（Agent SDK vs Everything Claude Code vs Starter Kit）
- 2026-01-27: **Claude Code Starter Kit GitHub作成**（https://github.com/Hantaku705/claude-code-starter、12コマンド+8エージェント+6ルール、1コマンドでプロ環境構築）
- 2026-01-27: CLAUDECODE Webapp Starter Kit タブ追加（8タブ構成、GitHubリポジトリ連携）
- 2026-01-27: CLAUDECODE Webapp Architecture タブ追加（Claude Code全体像、7要素の定義・役割・比較表・使い分けガイド）
- 2026-01-27: CLAUDECODE Webapp Skills タブ追加（8個のおすすめカスタムスキル、コピー機能、導入ガイド、https://claude-code-onboarding-ten.vercel.app）
- 2026-01-26: NADESHIKO MAトレンド一覧改善（全16アカウント一覧、「全員」行追加）+ PR/通常フィルター追加
- 2026-01-26: NADESHIKO webappフィルターヘッダー固定（Dashboard/Deals/Views、`sticky top-0 z-10`）
- 2026-01-26: projects/フォルダ構造整理（5プロジェクト、workflow.md標準テンプレート準拠、docs/ + source/ 分類）
- 2026-01-26: プロジェクトワークフローガイド作成（`projects/workflow.md`、5段階フロー、7プロジェクト分析）、`/project-workflow` スキル追加
- 2026-01-26: サブスク確認ツール解約方法動的取得機能追加（AI生成API、LocalStorageキャッシュ、取得ボタン、https://webapp-five-bay.vercel.app）
- 2026-01-26: ReFa決算資料PDF→画像化（23PDF→1,185枚）、report.mdブラッシュアップ（Phase 4-5年度別詳細、セグメント分析、ReFa GINZA、「再ブランディング」視点追加）
- 2026-01-26: ReFa Webapp report.md更新反映（ReFa GINZA、ブランド成長サイクル、今後の展望セクション追加）
- 2026-01-26: ReFaプロモーション変遷分析Webapp作成（イノベーター理論曲線、4ページ構成、https://refa-report.vercel.app）
- 2026-01-26: サブスク確認ツール機能改善（テーブルUI、PDF/メール確認、解約ガイドモーダル、Vercelデプロイ）
- 2026-01-26: NADESHIKO code.js理解＆ドキュメント化（GASインサイト自動取得スクリプト、`NADESHIKO/code/CLAUDE.md`作成）
- 2026-01-26: Clawdbot Slack全チャンネル対応、gog CLIインストール（Gmail/Calendar連携準備）
- 2026-01-26: Clawdbot APIキー問題修正（LaunchAgent plistに環境変数追加、トラブルシューティング追記）
- 2026-01-26: Clawdbot AIアシスタント設定ガイド追加（`opperation/clawdbot/`、Slack連携セットアップ完了）
- 2026-01-24: NADESHIKO MA動的切り替え（データ量に応じて短期/中期/長期MA自動選択）、デフォルト「全員」選択
- 2026-01-24: NADESHIKO 投稿数ベース期間フィルター追加（直近30/60/90/120投稿）、移動平均6種類に拡張
- 2026-01-23: サブスク確認ツール本番デプロイ（https://subscription-tracker-ten-iota.vercel.app）
- 2026-01-23: サブスク確認ツール作成（`opperation/サブスク/webapp/`、Gmail API連携、20+サービス自動検出、解約ガイド）
- 2026-01-23: NADESHIKO データテーブルにソート機能・バズ強調追加（13カラムソート、動画尺削除、通常&10万再生以上オレンジ）
- 2026-01-23: NADESHIKO 投稿別散布図+移動平均線に変更（1投稿1点、7投稿MA/14投稿MA、「全員」オプション）
- 2026-01-23: NADESHIKO Viewsタブに日別再生数トラッキング追加（期間選択、単一/比較モード、最大10アカウント）
- 2026-01-23: NADESHIKO Viewsタブにデータテーブル追加（14カラム、最新100件表示）
- 2026-01-23: NADESHIKO Algorithmタブ追加（TikTokアルゴリズム解説、13セクション、折りたたみUI）
- 2026-01-23: NADESHIKO Viewsタブ強化（期間複数選択、アカウント別円グラフ、全期間フィルター対応）
- 2026-01-23: `/address-lookup` コマンド追加、`_claude-code/commands/CLAUDE.md` 作成
- 2026-01-23: NADESHIKO全期間データ統合（2023年11月〜2026年4月、1,102件）、CSV変換スクリプト作成
- 2026-01-23: 「何ゲーか」分析スキル追加（`_claude-code/skills/what-game.md`）
- 2026-01-23: NADESHIKO KSF分析・アルゴリズム解説作成（`issue/ksf.md`、`algorithm/algorithm.md`）
- 2026-01-23: NADESHIKO売上管理Webapp作成・デプロイ（https://nadeshiko-sales.vercel.app）
- 2026-01-23: NADESHIKOプロジェクト追加（週次ミーティング記録の分析・サマリー化）
- 2026-01-23: 「なまえデザイン」書籍まとめ Phase 2（「いい名前の定義」セクション追加、チェックリスト強化）
- 2026-01-23: /handoff スキル更新（全フォルダにCLAUDE.md自動作成/更新）
- 2026-01-23: opperation/フォルダ追加（なまえデザイン書籍まとめ）
- 2026-01-23: _claude-code/skills/CLAUDE.md 作成
- 2026-01-22: コンセプト設計スキル追加（`_claude-code/skills/concept-design.md`）
- 2026-01-22: N organic コンセプト更新「帰ったら洗う、花粉オフ」、2/11花粉飛散宣言軸に戦略変更
- 2026-01-22: フォルダ構造整理（projects/に6プロジェクト統合、The Room FX → the-room-fx にリネーム）
- 2026-01-22: N organic X戦略提案プロジェクト追加（Webapp作成、Vercelデプロイ）
- 2026-01-21: The Room FX who.mdを04_target-strategy.mdに統合（Appendix追加、重複解消）
- 2026-01-21: The Room FX 提案書11ファイル+appendix作成（差別化4本柱：データドリブン/PMP/ブランドセーフティ/トライブベース）
- 2026-01-21: The Room FX who.md作成（ターゲット設定、6セグメント評価、ペルソナ2名、SNS分析Appendix）
- 2026-01-21: The Room FX SNSトライブ分析（Meltwater 5,795件、トライブ優先度決定）
- 2026-01-21: The Room FX プロジェクト追加（ANA ビジネスクラス広告配信）
- 2026-01-20: Dr.Melaxin フォルダ構造整理（docs/, media-plan/, source/に分離）
- 2026-01-20: Dr.Melaxin メディアプラン作成（年間/3月メガ割/6月メガ割）
- 2026-01-20: Dr.Melaxin $10M USD予算提案書作成（budget-proposal-10m.md, 704行）
- 2026-01-20: Dr.Melaxin 競合リサーチページ追加（/research、6セクション）
- 2026-01-20: Dr.Melaxin Webアプリ作成（9セクション、グラフ4種）
- 2026-01-20: Dr.Melaxin提案書分析・proposal.md作成（GTM詳細含む332行）
- 2026-01-20: Phone Farm脅威インテリジェンスレポート・セットアップガイド作成
- 2026-01-20: フォルダ構造を整理（プロジェクト別に分離）
- 2026-01-20: GitHubリポジトリ移行（Hantaku705/ap-concept-learning）
- 2026-01-20: 事例15件に拡張、評価項目14項目に統合
- 2026-01-19: コンセプト学習Webアプリ追加
