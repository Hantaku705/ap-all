# Claude Code Usage Sync Kit

Claude Codeの使用時間を追跡し、チームダッシュボードに同期するためのキット。

## セットアップ（1コマンド）

```bash
bash setup.sh
```

これで完了です。

## 使い方

### 使用時間を確認

```
/usage
```

出力例：
```
📊 Claude Code 使用時間レポート
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ユーザー: yourname@Your-MacBook-Pro

📅 今日: 2時間34分（3セッション）
📆 今週: 12時間45分（18セッション）
📅 今月: 45時間12分（72セッション）
📈 累計: 234時間56分（412セッション）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ダッシュボードに同期

```
/usage sync
```

## ダッシュボード

**https://claude-code-usage.vercel.app**

全員の使用状況をリアルタイムで確認できます。

## 計算ロジック

- 入力間隔が30分未満 → 活動時間としてカウント
- 入力間隔が30分以上 → 非活動時間として除外

実際にClaudeと対話している時間のみを計測します。

## ファイル構成

```
usage-sync-kit/
├── README.md         # このファイル
├── setup.sh          # セットアップスクリプト
├── scripts/
│   ├── usage-parser.mjs   # 使用時間解析
│   └── usage-sync.mjs     # Supabase同期
└── commands/
    └── usage.md      # /usage コマンド定義
```

## トラブルシューティング

### `/usage` が動かない

```bash
# Node.jsがインストールされているか確認
node --version

# スクリプトが存在するか確認
ls ~/.claude/scripts/
```

### 同期エラーが出る

```bash
# 環境変数が設定されているか確認
echo $SUPABASE_URL
echo $SUPABASE_KEY

# 設定されていない場合、ターミナルを再起動するか：
source ~/.zshrc
```
