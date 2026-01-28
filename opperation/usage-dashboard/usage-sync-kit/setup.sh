#!/bin/bash

# Claude Code Usage Sync Kit - セットアップスクリプト
# 使用方法: bash setup.sh

set -e

echo "🚀 Claude Code Usage Sync Kit セットアップ開始"
echo ""

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1. scriptsディレクトリ作成 & コピー
echo "📁 スクリプトをインストール中..."
mkdir -p ~/.claude/scripts
cp "$SCRIPT_DIR/scripts/usage-parser.mjs" ~/.claude/scripts/
cp "$SCRIPT_DIR/scripts/usage-sync.mjs" ~/.claude/scripts/
echo "   ✓ ~/.claude/scripts/ にコピーしました"

# 2. commandsディレクトリ作成 & コピー
echo "📁 コマンドをインストール中..."
mkdir -p ~/.claude/commands
cp "$SCRIPT_DIR/commands/usage.md" ~/.claude/commands/
echo "   ✓ ~/.claude/commands/ にコピーしました"

# 3. 環境変数を~/.zshrcに追加（重複チェック）
echo "🔧 環境変数を設定中..."
if grep -q "SUPABASE_URL.*vwhtiwbulrbwfhjychmo" ~/.zshrc 2>/dev/null; then
    echo "   ✓ 環境変数は既に設定されています"
else
    echo '' >> ~/.zshrc
    echo '# Claude Code Usage Tracking' >> ~/.zshrc
    echo 'export SUPABASE_URL="https://vwhtiwbulrbwfhjychmo.supabase.co"' >> ~/.zshrc
    echo 'export SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aHRpd2J1bHJid2ZoanljaG1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU3OTQ2NSwiZXhwIjoyMDg1MTU1NDY1fQ.-OnOZb6TjutBqVnMD4dRRBFESyN0O2jTwnpqxidI844"' >> ~/.zshrc
    echo "   ✓ ~/.zshrc に環境変数を追加しました"
fi

# 4. 環境変数を現在のシェルに読み込み
export SUPABASE_URL="https://vwhtiwbulrbwfhjychmo.supabase.co"
export SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aHRpd2J1bHJid2ZoanljaG1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU3OTQ2NSwiZXhwIjoyMDg1MTU1NDY1fQ.-OnOZb6TjutBqVnMD4dRRBFESyN0O2jTwnpqxidI844"

# 5. 動作確認
echo ""
echo "📊 使用時間を確認中..."
node ~/.claude/scripts/usage-parser.mjs

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ セットアップ完了！"
echo ""
echo "使い方:"
echo "  /usage       → 使用時間を確認"
echo "  /usage sync  → ダッシュボードに同期"
echo ""
echo "ダッシュボード: https://claude-code-usage.vercel.app"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
