# Claude Code Usage Dashboard

社内のClaude Code使用時間を追跡・可視化するシステム。

## 概要

| コンポーネント | 説明 |
|---------------|------|
| `/usage` コマンド | 各PCでローカルの使用時間を表示 |
| `/usage sync` コマンド | 使用時間をSupabaseに同期 |
| Dashboard Webapp | 全員の使用状況をリアルタイムで可視化 |

## セットアップ

### 1. Supabaseプロジェクト作成

1. https://supabase.com/dashboard で新規プロジェクト作成（名前: `claude-code-usage`）
2. SQL Editorで `supabase/migration.sql` を実行
3. Project Settings > API から以下を取得：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`（同期用）
   - `SUPABASE_ANON_KEY`（ダッシュボード用）

### 2. 各PCの環境変数設定

`~/.zshrc` または `~/.bashrc` に追加：

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-service-role-key"
```

設定後：
```bash
source ~/.zshrc
```

### 3. /usage スクリプトをグローバルに配置

```bash
# スクリプトをホームディレクトリにコピー
cp AP/.claude/scripts/usage-parser.mjs ~/.claude/scripts/
cp AP/.claude/scripts/usage-sync.mjs ~/.claude/scripts/
```

### 4. ダッシュボードのデプロイ

```bash
cd webapp

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集してSupabase設定を追加

# Vercelにデプロイ
vercel --yes
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://your-project.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "your-anon-key"
vercel --prod --yes
```

## 使い方

### 使用時間を確認（各PC）

```
/usage
```

出力例：
```
📊 Claude Code 使用時間レポート
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ユーザー: hantaku@Hantakus-MacBook-Pro

📅 今日: 2時間34分（3セッション）
📆 今週: 12時間45分（18セッション）
📅 今月: 45時間12分（72セッション）
📈 累計: 234時間56分（412セッション）

最終セッション: 2026-01-28 10:23
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ダッシュボードに同期（各PC）

```
/usage sync
```

## 使用時間の計算ロジック

- **入力間隔が30分未満**: 活動時間としてカウント
- **入力間隔が30分以上**: 非活動時間として除外

実際にClaudeと対話している時間のみを計測します。

## ユーザー識別

自動的に `username@hostname` 形式で識別されます。

例: `hantaku@Hantakus-MacBook-Pro`

## ファイル構成

```
usage-dashboard/
├── README.md                 # このファイル
├── supabase/
│   └── migration.sql         # テーブル作成SQL
└── webapp/                   # Next.js ダッシュボード
    ├── src/
    │   ├── app/page.tsx      # ダッシュボードページ
    │   ├── components/       # UIコンポーネント
    │   └── lib/supabase.ts   # Supabaseクライアント
    └── .env.example          # 環境変数サンプル

# 関連スクリプト（AP/.claude/scripts/）
├── usage-parser.mjs          # /usage コマンド用解析スクリプト
└── usage-sync.mjs            # /usage sync コマンド用同期スクリプト
```

## 技術スタック

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- Recharts（グラフ）
- Supabase（データベース）
