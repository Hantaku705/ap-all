# AP - 社内プロジェクト管理リポジトリ

社内の様々なプロジェクトを管理するリポジトリ。

---

## フォルダ構成

```
AP/
├── _claude-code/           # Claude Code設定リファレンス
│   ├── agents/             # Subagent定義
│   ├── commands/           # Skillコマンド定義
│   ├── rules/              # ルール定義
│   ├── skills/             # Skill定義
│   ├── hooks/              # Hook定義
│   ├── mcp-configs/        # MCP設定
│   ├── plugins/            # プラグイン
│   └── examples/           # 設定例
│
├── concept-learning/       # コンセプト学習プロジェクト
│   ├── webapp/             # Next.js Webアプリ
│   ├── docs/               # 学習資料（Markdown）
│   └── knowledge/          # PDF資料
│
├── mascode/                # MASCODEプロジェクト
│   ├── proposal.pdf        # 提案資料
│   └── media-plan/         # メディアプラン
│
├── phonefarm/              # Phone Farmプロジェクト
│
├── _archive/               # アーカイブ（用途不明ファイル）
│
├── CLAUDE.md               # このファイル
├── HANDOFF.md              # セッション引き継ぎ
└── README.md               # リポジトリ概要
```

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
| `concept-learning/webapp/src/data/concept-data.json` | コンセプトデータ（※手動同期） |
| `concept-learning/docs/concept-data.json` | マスターデータ（こちらを編集） |

**開発コマンド**:
```bash
cd concept-learning/webapp
npm run dev
```

**デプロイ**:
```bash
cd concept-learning/webapp
vercel --prod --yes
```

---

### mascode（MASCODEプロジェクト）

MASCODE BEAUTYのプロモーション提案・メディアプラン。

**ファイル**:
| ファイル | 内容 |
|---------|------|
| `mascode/proposal.pdf` | 2026SS-AWプロモーション提案 |
| `mascode/media-plan/` | メディアプラン資料 |

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
| `phonefarm/webapp/src/data/report-data.ts` | レポートデータ（ハードウェア、ソフトウェア、検出戦略等） |
| `phonefarm/webapp/src/data/setup-guide-data.ts` | セットアップガイドデータ（買い物リスト、手順等） |
| `phonefarm/webapp/src/app/page.tsx` | レポートページ |
| `phonefarm/webapp/src/app/setup-guide/page.tsx` | セットアップガイドページ |

**開発コマンド**:
```bash
cd phonefarm/webapp
npm run dev
```

**デプロイ**:
```bash
cd phonefarm/webapp
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

## 更新履歴

- 2026-01-20: Phone Farm脅威インテリジェンスレポート・セットアップガイド作成
- 2026-01-20: フォルダ構造を整理（プロジェクト別に分離）
- 2026-01-20: GitHubリポジトリ移行（Hantaku705/ap-concept-learning）
- 2026-01-20: 事例15件に拡張、評価項目14項目に統合
- 2026-01-19: コンセプト学習Webアプリ追加
