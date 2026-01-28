#!/bin/bash
# 🏯 multi-agent-shogun macOS起動スクリプト
# macOS Startup Script for Multi-Agent Orchestration System
#
# 使用方法:
#   ./start_macos.sh           # 全エージェント起動（通常）
#   ./start_macos.sh -s        # セットアップのみ（Claude起動なし）
#   ./start_macos.sh -h        # ヘルプ表示

set -e

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 言語設定を読み取り（デフォルト: ja）
LANG_SETTING="ja"
if [ -f "./config/settings.yaml" ]; then
    LANG_SETTING=$(grep "^language:" ./config/settings.yaml 2>/dev/null | awk '{print $2}' || echo "ja")
fi

# 色付きログ関数（戦国風）
log_info() {
    echo -e "\033[1;33m【報】\033[0m $1"
}

log_success() {
    echo -e "\033[1;32m【成】\033[0m $1"
}

log_war() {
    echo -e "\033[1;31m【戦】\033[0m $1"
}

# ═══════════════════════════════════════════════════════════════════════════════
# オプション解析
# ═══════════════════════════════════════════════════════════════════════════════
SETUP_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--setup-only)
            SETUP_ONLY=true
            shift
            ;;
        -h|--help)
            echo ""
            echo "🏯 multi-agent-shogun macOS起動スクリプト"
            echo ""
            echo "使用方法: ./start_macos.sh [オプション]"
            echo ""
            echo "オプション:"
            echo "  -s, --setup-only  tmuxセッションのセットアップのみ（Claude起動なし）"
            echo "  -h, --help        このヘルプを表示"
            echo ""
            echo "例:"
            echo "  ./start_macos.sh      # 全エージェント起動（通常の出陣）"
            echo "  ./start_macos.sh -s   # セットアップのみ（手動でClaude起動）"
            echo ""
            echo "アタッチ方法:"
            echo "  tmux attach-session -t shogun      # 将軍の本陣"
            echo "  tmux attach-session -t multiagent  # 家老・足軽の陣"
            echo ""
            exit 0
            ;;
        *)
            echo "不明なオプション: $1"
            echo "./start_macos.sh -h でヘルプを表示"
            exit 1
            ;;
    esac
done

# ═══════════════════════════════════════════════════════════════════════════════
# 出陣バナー表示
# ═══════════════════════════════════════════════════════════════════════════════
show_battle_cry() {
    clear

    echo ""
    echo -e "\033[1;31m╔══════════════════════════════════════════════════════════════════════════════════╗\033[0m"
    echo -e "\033[1;31m║\033[0m \033[1;33m███████╗██╗  ██╗██╗   ██╗████████╗███████╗██╗   ██╗     ██╗██╗███╗   ██╗\033[0m \033[1;31m║\033[0m"
    echo -e "\033[1;31m║\033[0m \033[1;33m██╔════╝██║  ██║██║   ██║╚══██╔══╝██╔════╝██║   ██║     ██║██║████╗  ██║\033[0m \033[1;31m║\033[0m"
    echo -e "\033[1;31m║\033[0m \033[1;33m███████╗███████║██║   ██║   ██║   ███████╗██║   ██║     ██║██║██╔██╗ ██║\033[0m \033[1;31m║\033[0m"
    echo -e "\033[1;31m║\033[0m \033[1;33m╚════██║██╔══██║██║   ██║   ██║   ╚════██║██║   ██║██   ██║██║██║╚██╗██║\033[0m \033[1;31m║\033[0m"
    echo -e "\033[1;31m║\033[0m \033[1;33m███████║██║  ██║╚██████╔╝   ██║   ███████║╚██████╔╝╚█████╔╝██║██║ ╚████║\033[0m \033[1;31m║\033[0m"
    echo -e "\033[1;31m║\033[0m \033[1;33m╚══════╝╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝ ╚═════╝  ╚════╝ ╚═╝╚═╝  ╚═══╝\033[0m \033[1;31m║\033[0m"
    echo -e "\033[1;31m╠══════════════════════════════════════════════════════════════════════════════════╣\033[0m"
    echo -e "\033[1;31m║\033[0m       \033[1;37m出陣じゃーーー！！！\033[0m    \033[1;36m⚔\033[0m    \033[1;35m天下布武！\033[0m                          \033[1;31m║\033[0m"
    echo -e "\033[1;31m╚══════════════════════════════════════════════════════════════════════════════════╝\033[0m"
    echo ""

    # 足軽隊列
    echo -e "\033[1;34m  ╔═════════════════════════════════════════════════════════════════════════════╗\033[0m"
    echo -e "\033[1;34m  ║\033[0m                    \033[1;37m【 足 軽 隊 列 ・ 八 名 配 備 】\033[0m                      \033[1;34m║\033[0m"
    echo -e "\033[1;34m  ╚═════════════════════════════════════════════════════════════════════════════╝\033[0m"

    cat << 'ASHIGARU_EOF'

       /\      /\      /\      /\      /\      /\      /\      /\
      /||\    /||\    /||\    /||\    /||\    /||\    /||\    /||\
     /_||\   /_||\   /_||\   /_||\   /_||\   /_||\   /_||\   /_||\
       ||      ||      ||      ||      ||      ||      ||      ||
      /||\    /||\    /||\    /||\    /||\    /||\    /||\    /||\
      /  \    /  \    /  \    /  \    /  \    /  \    /  \    /  \
     [足1]   [足2]   [足3]   [足4]   [足5]   [足6]   [足7]   [足8]

ASHIGARU_EOF

    echo -e "                    \033[1;36m「「「 はっ！！ 出陣いたす！！ 」」」\033[0m"
    echo ""

    echo -e "\033[1;33m  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\033[0m"
    echo -e "\033[1;33m  ┃\033[0m  \033[1;37m🏯 multi-agent-shogun\033[0m  〜 \033[1;36m戦国マルチエージェント統率システム\033[0m 〜           \033[1;33m┃\033[0m"
    echo -e "\033[1;33m  ┃\033[0m                                                                           \033[1;33m┃\033[0m"
    echo -e "\033[1;33m  ┃\033[0m    \033[1;35m将軍\033[0m: プロジェクト統括    \033[1;31m家老\033[0m: タスク管理    \033[1;34m足軽\033[0m: 実働部隊×8      \033[1;33m┃\033[0m"
    echo -e "\033[1;33m  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\033[0m"
    echo ""
}

# バナー表示実行
show_battle_cry

echo -e "  \033[1;33m天下布武！陣立てを開始いたす\033[0m (Setting up the battlefield)"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1: 既存セッションクリーンアップ
# ═══════════════════════════════════════════════════════════════════════════════
log_info "🧹 既存の陣を撤収中..."
tmux kill-session -t multiagent 2>/dev/null && log_info "  └─ multiagent陣、撤収完了" || log_info "  └─ multiagent陣は存在せず"
tmux kill-session -t shogun 2>/dev/null && log_info "  └─ shogun本陣、撤収完了" || log_info "  └─ shogun本陣は存在せず"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2: 報告ファイルリセット
# ═══════════════════════════════════════════════════════════════════════════════
log_info "📜 前回の軍議記録を破棄中..."

# 足軽用タスクファイル作成
for i in {1..8}; do
    cat > ./queue/tasks/ashigaru${i}.yaml << EOF
# 足軽${i}専用タスクファイル
task:
  task_id: null
  parent_cmd: null
  description: null
  target_path: null
  status: idle
  timestamp: ""
EOF
done

# 足軽用レポートファイル作成
for i in {1..8}; do
    cat > ./queue/reports/ashigaru${i}_report.yaml << EOF
worker_id: ashigaru${i}
task_id: null
timestamp: ""
status: idle
result: null
EOF
done

# キューファイルリセット
cat > ./queue/shogun_to_karo.yaml << 'EOF'
queue: []
EOF

cat > ./queue/karo_to_ashigaru.yaml << 'EOF'
assignments:
  ashigaru1:
    task_id: null
    description: null
    target_path: null
    status: idle
  ashigaru2:
    task_id: null
    description: null
    target_path: null
    status: idle
  ashigaru3:
    task_id: null
    description: null
    target_path: null
    status: idle
  ashigaru4:
    task_id: null
    description: null
    target_path: null
    status: idle
  ashigaru5:
    task_id: null
    description: null
    target_path: null
    status: idle
  ashigaru6:
    task_id: null
    description: null
    target_path: null
    status: idle
  ashigaru7:
    task_id: null
    description: null
    target_path: null
    status: idle
  ashigaru8:
    task_id: null
    description: null
    target_path: null
    status: idle
EOF

log_success "✅ 陣払い完了"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3: ダッシュボード初期化
# ═══════════════════════════════════════════════════════════════════════════════
log_info "📊 戦況報告板を初期化中..."
TIMESTAMP=$(date "+%Y-%m-%d %H:%M")

cat > ./dashboard.md << EOF
# 📊 戦況報告
最終更新: ${TIMESTAMP}

## 🚨 要対応 - 殿のご判断をお待ちしております
なし

## 🔄 進行中 - 只今、戦闘中でござる
なし

## ✅ 本日の戦果
| 時刻 | 戦場 | 任務 | 結果 |
|------|------|------|------|

## 🎯 スキル化候補 - 承認待ち
なし

## 🛠️ 生成されたスキル
なし

## ⏸️ 待機中
なし

## ❓ 伺い事項
なし
EOF

log_success "  └─ ダッシュボード初期化完了 (言語: $LANG_SETTING)"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4: multiagentセッション作成（9ペイン：karo + ashigaru1-8）
# ═══════════════════════════════════════════════════════════════════════════════
log_war "⚔️ 家老・足軽の陣を構築中（9名配備）..."

# 最初のペイン作成
tmux new-session -d -s multiagent -n "agents"

# 3x3グリッド作成（合計9ペイン）
# 最初に3列に分割
tmux split-window -h -t "multiagent:0"
tmux split-window -h -t "multiagent:0"

# 各列を3行に分割
tmux select-pane -t "multiagent:0.0"
tmux split-window -v
tmux split-window -v

tmux select-pane -t "multiagent:0.3"
tmux split-window -v
tmux split-window -v

tmux select-pane -t "multiagent:0.6"
tmux split-window -v
tmux split-window -v

# ペインタイトル設定（0: karo, 1-8: ashigaru1-8）
PANE_TITLES=("karo" "ashigaru1" "ashigaru2" "ashigaru3" "ashigaru4" "ashigaru5" "ashigaru6" "ashigaru7" "ashigaru8")
PANE_COLORS=("1;31" "1;34" "1;34" "1;34" "1;34" "1;34" "1;34" "1;34" "1;34")  # karo: 赤, ashigaru: 青

for i in {0..8}; do
    tmux select-pane -t "multiagent:0.$i" -T "${PANE_TITLES[$i]}"
    tmux send-keys -t "multiagent:0.$i" "cd $(pwd) && export PS1='(\[\033[${PANE_COLORS[$i]}m\]${PANE_TITLES[$i]}\[\033[0m\]) \[\033[1;32m\]\w\[\033[0m\]\$ ' && clear" Enter
done

log_success "  └─ 家老・足軽の陣、構築完了"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5: shogunセッション作成（1ペイン）
# ═══════════════════════════════════════════════════════════════════════════════
log_war "👑 将軍の本陣を構築中..."
tmux new-session -d -s shogun
tmux send-keys -t shogun "cd $(pwd) && export PS1='(\[\033[1;35m\]将軍\[\033[0m\]) \[\033[1;32m\]\w\[\033[0m\]\$ ' && clear" Enter

log_success "  └─ 将軍の本陣、構築完了"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6: Claude Code 起動（--setup-only でスキップ）
# ═══════════════════════════════════════════════════════════════════════════════
if [ "$SETUP_ONLY" = false ]; then
    log_war "👑 全軍に Claude Code を召喚中..."

    # 将軍
    tmux send-keys -t shogun "claude --dangerously-skip-permissions"
    tmux send-keys -t shogun Enter
    log_info "  └─ 将軍、召喚完了"

    # 少し待機（安定のため）
    sleep 1

    # 家老 + 足軽（9ペイン）
    for i in {0..8}; do
        tmux send-keys -t "multiagent:0.$i" "claude --dangerously-skip-permissions"
        tmux send-keys -t "multiagent:0.$i" Enter
    done
    log_info "  └─ 家老・足軽、召喚完了"

    log_success "✅ 全軍 Claude Code 起動完了"
    echo ""

    # ═══════════════════════════════════════════════════════════════════════════
    # STEP 6.1: セキュリティ警告の自動承認
    # ═══════════════════════════════════════════════════════════════════════════
    log_war "🔓 セキュリティ警告を自動承認中..."
    echo ""

    echo "  承認プロンプト表示を待機中（8秒）..."
    sleep 8

    # 将軍の承認（↓キーで「Yes, I accept」を選択 → Enter）
    tmux send-keys -t shogun Down
    sleep 0.5
    tmux send-keys -t shogun Enter
    log_info "  └─ 将軍、承認完了"

    sleep 2

    # 家老 + 足軽の承認
    for i in {0..8}; do
        tmux send-keys -t "multiagent:0.$i" Down
        sleep 0.3
        tmux send-keys -t "multiagent:0.$i" Enter
        sleep 0.5
    done
    log_info "  └─ 家老・足軽、承認完了"

    log_success "✅ 全軍承認完了"
    echo ""

    # ═══════════════════════════════════════════════════════════════════════════
    # STEP 6.5: 各エージェントに指示書を読み込ませる
    # ═══════════════════════════════════════════════════════════════════════════
    log_war "📜 各エージェントに指示書を読み込ませ中..."
    echo ""

    echo "  Claude Code の起動を待機中（15秒）..."
    sleep 15

    # 将軍に指示書を読み込ませる
    log_info "  └─ 将軍に指示書を伝達中..."
    tmux send-keys -t shogun "instructions/shogun.md を読んで役割を理解せよ。"
    sleep 0.5
    tmux send-keys -t shogun Enter

    # 家老に指示書を読み込ませる
    sleep 2
    log_info "  └─ 家老に指示書を伝達中..."
    tmux send-keys -t "multiagent:0.0" "instructions/karo.md を読んで役割を理解せよ。"
    sleep 0.5
    tmux send-keys -t "multiagent:0.0" Enter

    # 足軽に指示書を読み込ませる（1-8）
    sleep 2
    log_info "  └─ 足軽に指示書を伝達中..."
    for i in {1..8}; do
        tmux send-keys -t "multiagent:0.$i" "instructions/ashigaru.md を読んで役割を理解せよ。汝は足軽${i}号である。"
        sleep 0.3
        tmux send-keys -t "multiagent:0.$i" Enter
        sleep 0.5
    done

    log_success "✅ 全軍に指示書伝達完了"
    echo ""
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7: 環境確認・完了メッセージ
# ═══════════════════════════════════════════════════════════════════════════════
log_info "🔍 陣容を確認中..."
echo ""
echo "  ┌──────────────────────────────────────────────────────────┐"
echo "  │  📺 Tmux陣容 (Sessions)                                  │"
echo "  └──────────────────────────────────────────────────────────┘"
tmux list-sessions | sed 's/^/     /'
echo ""
echo "  ┌──────────────────────────────────────────────────────────┐"
echo "  │  📋 布陣図 (Formation)                                   │"
echo "  └──────────────────────────────────────────────────────────┘"
echo ""
echo "     【shogunセッション】将軍の本陣"
echo "     ┌─────────────────────────────┐"
echo "     │  Pane 0: 将軍 (SHOGUN)      │  ← 総大将・プロジェクト統括"
echo "     └─────────────────────────────┘"
echo ""
echo "     【multiagentセッション】家老・足軽の陣（3x3 = 9ペイン）"
echo "     ┌─────────┬─────────┬─────────┐"
echo "     │  karo   │ashigaru3│ashigaru6│"
echo "     │  (家老) │ (足軽3) │ (足軽6) │"
echo "     ├─────────┼─────────┼─────────┤"
echo "     │ashigaru1│ashigaru4│ashigaru7│"
echo "     │ (足軽1) │ (足軽4) │ (足軽7) │"
echo "     ├─────────┼─────────┼─────────┤"
echo "     │ashigaru2│ashigaru5│ashigaru8│"
echo "     │ (足軽2) │ (足軽5) │ (足軽8) │"
echo "     └─────────┴─────────┴─────────┘"
echo ""

echo ""
echo "  ╔══════════════════════════════════════════════════════════╗"
echo "  ║  🏯 出陣準備完了！天下布武！                              ║"
echo "  ╚══════════════════════════════════════════════════════════╝"
echo ""

if [ "$SETUP_ONLY" = true ]; then
    echo "  ⚠️  セットアップのみモード: Claude Codeは未起動です"
    echo ""
    echo "  手動でClaude Codeを起動するには:"
    echo "  ┌──────────────────────────────────────────────────────────┐"
    echo "  │  # 将軍を召喚                                            │"
    echo "  │  tmux send-keys -t shogun 'claude --dangerously-skip-permissions' Enter │"
    echo "  │                                                          │"
    echo "  │  # 家老・足軽を一斉召喚                                   │"
    echo "  │  for i in {0..8}; do \\                                   │"
    echo "  │    tmux send-keys -t multiagent:0.\$i \\                   │"
    echo "  │      'claude --dangerously-skip-permissions' Enter       │"
    echo "  │  done                                                    │"
    echo "  └──────────────────────────────────────────────────────────┘"
    echo ""
fi

echo "  次のステップ:"
echo "  ┌──────────────────────────────────────────────────────────┐"
echo "  │  将軍の本陣にアタッチして命令を開始:                      │"
echo "  │     tmux attach-session -t shogun                        │"
echo "  │                                                          │"
echo "  │  家老・足軽の陣を確認する:                                │"
echo "  │     tmux attach-session -t multiagent                    │"
echo "  │                                                          │"
echo "  │  ※ 各エージェントは指示書を読み込み済み。                 │"
echo "  │    すぐに命令を開始できます。                             │"
echo "  └──────────────────────────────────────────────────────────┘"
echo ""
echo "  ════════════════════════════════════════════════════════════"
echo "   天下布武！勝利を掴め！ (Tenka Fubu! Seize victory!)"
echo "  ════════════════════════════════════════════════════════════"
echo ""
