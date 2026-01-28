# usage-dashboard/ - Claude Code使用時間トラッキング

チーム全体のClaude Code使用状況を可視化するシステム。

## 本番URL

- **ダッシュボード**: https://webapp-five-bay.vercel.app
- **GitHub Starter Kit**: https://github.com/Hantaku705/claude-code-starter

## フォルダ構成

```
usage-dashboard/
├── CLAUDE.md               # このファイル
├── webapp/                 # Next.js ダッシュボードWebapp
│   ├── src/
│   │   ├── app/            # App Router (page.tsx)
│   │   ├── components/     # StatCards, UsageChart, UserRanking
│   │   └── lib/            # supabase.ts
│   └── package.json
├── supabase/
│   └── migration.sql       # DBスキーマ（usage_logs, views）
└── usage-sync-kit/         # 他メンバー配布用キット
    ├── README.md
    ├── setup.sh            # 1コマンドセットアップ
    ├── scripts/
    │   ├── usage-parser.mjs    # 使用時間解析
    │   └── usage-sync.mjs      # Supabase同期
    └── commands/
        └── usage.md        # /usage コマンド定義
```

## 技術スタック

| 項目 | 技術 |
|------|------|
| フロントエンド | Next.js 16.1.6, React 19, TypeScript, Tailwind CSS |
| グラフ | Recharts |
| データベース | Supabase (PostgreSQL) |
| ホスティング | Vercel |

## Supabaseプロジェクト

- **Project ID**: `vwhtiwbulrbwfhjychmo`
- **Project Name**: `claude-code-usage`

### テーブル: `usage_logs`

| カラム | 型 | 説明 |
|--------|-----|------|
| user_id | text | `username@hostname` |
| hostname | text | マシン名 |
| username | text | ユーザー名 |
| date | date | 日付 |
| minutes | integer | 使用時間（分） |
| sessions | integer | セッション数 |
| last_sync | timestamp | 最終同期日時 |

### ビュー

- `usage_summary`: ユーザー別累計（total_minutes, total_sessions, last_active）
- `usage_daily_total`: 日別全体集計（total_minutes, active_users）

## コマンド

| コマンド | 説明 |
|---------|------|
| `/usage` | 使用時間を表示（今日/週/月/累計） |
| `/usage sync` | Supabaseにデータを同期 |
| `/usage json` | JSON形式で出力 |

## 計算ロジック

- **活動時間**: 入力間隔が30分未満の場合のみカウント
- **非活動時間**: 30分以上の間隔は除外
- **ユーザー識別**: `${os.userInfo().username}@${os.hostname()}`

## セットアップ（他メンバー向け）

```bash
# usage-sync-kit/ を配布
bash setup.sh
```

これにより:
1. `~/.claude/scripts/` にスクリプトをコピー
2. `~/.claude/commands/` にコマンド定義をコピー
3. `~/.zshrc` に環境変数を追加

## 開発コマンド

```bash
cd webapp
npm run dev     # 開発サーバー
npm run build   # ビルド
vercel --prod   # デプロイ
```

## 更新履歴

- 2026-01-28: 初版作成（/usage, Supabase, Dashboard, 1日平均時間, GitHub Starter Kit更新）
