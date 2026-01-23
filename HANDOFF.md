# HANDOFF - セッション引き継ぎ

## 現在の状態

### 完了したタスク（サマリー）
| フェーズ | 期間 | 主要タスク | 件数 |
|---------|------|-----------|------|
| 初期設計 | 1-10回目 | コンセプト学習Webapp、MASCODE分析、Phone Farm | 15件 |
| Dr.Melaxin | 11-27回目 | 提案書、Webapp、$10M版、タブUI、マトリックス | 30件 |
| The Room FX | 28-36回目 | 提案書11ファイル、Webapp、整合性修正 | 18件 |
| N organic | 37-41回目 | X戦略、Webapp、コンセプト設計スキル | 8件 |
| なまえデザイン | 42-44回目 | 書籍まとめ Phase 1-2 | 3件 |
| NADESHIKO | 45-48回目 | 売上管理Webapp、Excel→CSV変換、KSF分析、アルゴリズム解説 | 6件 |

詳細は [HANDOFF_ARCHIVE.md](./HANDOFF_ARCHIVE.md) を参照。

### 直近の完了タスク
- [x] **「何ゲーか」分析スキル作成**（`_claude-code/skills/what-game.md`）
  - 4 Phases: ゲーム特定 → 勝者発見 → 勝因分析 → 再現手順
  - 3層モデル: 表層（What）→ 構造（Why）→ 本質（How）
- [x] **NADESHIKO KSF分析作成**（`NADESHIKO/issue/ksf.md`）
  - 勝者リスト5名、ゲーム構造6種類、勝ちパターン5つ
  - 再生数の3変数: アカウント質/投稿質/投稿数
- [x] **TikTokアルゴリズム解説作成**（`NADESHIKO/algorithm/algorithm.md`）
  - FYP配信の仕組み、移動平均の法則、アカウント質スコア
  - TTS低品質動画排除、5^6理論、デバイス・ネットワーク影響
- [x] **Excel→CSV変換完了**（利益管理シート 28シート変換）
- [x] **NADESHIKO売上管理Webapp作成**（Vercel: https://nadeshiko-sales.vercel.app）

### 作業中のタスク
- [ ] **The Room FX 提案書 Google Docs書き込み**（5〜11章 + Appendix 残り）
- [ ] **MASCODEアイライナー コンセプト作成**（検討中）
- [ ] **「なまえデザイン」書籍まとめ Phase 3**（各章詳細追加予定）

## 次のアクション
1. **NADESHIKOアルゴリズム実践**（ksf.md、algorithm.md参照）
2. **NADESHIKO CSVデータ活用**（33件のCSVをWebappに統合可能）
3. **The Room FX 提案書レビュー＆プレゼン資料化**（2月1週目締切）
4. N organic Webappの確認（Vercel本番: https://webapp-five-bay.vercel.app）

## 未解決の問題
- **データ同期**: `concept-learning/docs/concept-data.json` と `concept-learning/webapp/src/data/concept-data.json` は手動同期が必要（Turbopackがシンボリックリンク非対応のため）

## 未コミット変更
```
 M CLAUDE.md
 M HANDOFF.md
 M _claude-code/skills/concept-design.md
 M opperation/なまえデザイン_フォルダ/なまえデザイン.md
?? HANDOFF_ARCHIVE.md
?? NADESHIKO/
?? _claude-code/skills/CLAUDE.md
?? _claude-code/skills/what-game.md
?? opperation/CLAUDE.md
?? opperation/なまえデザイン_フォルダ/CLAUDE.md
```

## 最新コミット
```
802baeb refactor: reorganize folder structure with projects/ consolidation
```

## セッション履歴（直近10回分）

### 2026-01-23 (48)
- **「何ゲーか」分析スキル作成**
  - ユーザー依頼: 再生数/売上の本質（何ゲーか）を分析するフレームワークをスキル化
  - 作成ファイル: `_claude-code/skills/what-game.md`
  - 内容:
    - 4 Phases: ゲーム特定 → 勝者発見 → 勝因分析 → 再現手順
    - 3層モデル: 表層（What）→ 構造（Why）→ 本質（How）
    - NADESHIKO適用例（6ゲーム構造、5勝者、5勝ちパターン）
- **NADESHIKO KSF（本質分析）作成**
  - 作成ファイル: `NADESHIKO/issue/ksf.md`
  - 内容:
    - 勝者リスト: luana.beauty、Gracemode、KITEN、大西さん、Senjin Holdings
    - ゲーム構造6種類: 再生数ゲー、TTSゲー、売上ゲー、広告配信ゲー、ライブコマースゲー、大量動画ゲー
    - 再生数の3変数: アカウント質△、投稿質△、投稿数⚪︎
    - 再現手順付き勝ちパターン5つ
- **TikTokアルゴリズム解説作成**
  - 作成ファイル: `NADESHIKO/algorithm/algorithm.md`
  - 内容:
    - FYP配信の仕組み（4段階配信）
    - 重要指標（視聴完了率が最重要）
    - 移動平均の法則（過去7-14本が影響）
    - アカウント質スコア（最初の2週間でターゲット動画視聴）
    - TTS低品質動画排除（顔出し/静止画/AI読み/非ネイティブ）
    - 5^6理論（素材組み合わせで通過率60%）
    - デバイス・ネットワーク影響（1スマホ1アカウント、WiFiバン連鎖）
- **CLAUDE.md更新**
  - `NADESHIKO/CLAUDE.md`: フォルダ構成にalgorithm/、issue/ksf.md追加
  - `NADESHIKO/issue/CLAUDE.md`: ksf.md追加
  - `AP/CLAUDE.md`: what-game.md追加
  - `_claude-code/skills/CLAUDE.md`: what-game.md追加

### 2026-01-23 (47)
- **Excel→CSV変換**
  - ユーザー依頼: 利益管理シートExcelファイルからCSV変換
  - 入力: `/Users/hantaku/Downloads/AP/NADESHIKO/data/過去数字シート/利益管理シート_NADESIKO_2024年10月期.xlsx`
  - 出力: `/Users/hantaku/Downloads/AP/NADESHIKO/data/利益管理シート/`
- **Excelファイル構成**
  - 総シート数: 47シート（29MB）
  - 月別シート: 2023年11月〜2026年4月
  - その他: 売上推移、顧客マスタ、コスト管理、広告費等
- **変換結果**
  - 新規変換: 28シート
  - 既存スキップ: 5シート（【締め済】2025年11月、【FIX】2025年12月、【進行中】2026年1-3月）
  - 最終: 33件のCSVファイル
- **技術ノート**
  - openpyxl使用（`pip3 install --break-system-packages openpyxl`）
  - `data_only=True`で数式を計算結果として取得
  - フィルター: 「年」「月」含む & マスタ/一覧/管理/広告費/推移除外

### 2026-01-23 (46)
- **NADESHIKO売上管理Webapp作成**
  - ユーザー依頼: CSVデータからWebアプリ作成（データ編集機能付き）
  - 技術スタック: Next.js 16.1.4 + React 19 + Recharts + Tailwind CSS
- **4タブ構成**
  - Dashboard: KPIカード4枚（売上/粗利/達成率/案件数）、月次推移グラフ、AJP/RCP比率
  - Deals: 案件一覧テーブル（フィルター、編集・追加・削除機能）
  - Performance: 担当者別・アカウント別・クライアント別ランキング（横棒グラフ+テーブル）
  - Settings: 月別目標設定、CSVエクスポート
- **データ構造**
  - AJP（自社）: 粗利率100%
  - RCP（外部）: 粗利率約40%（売上 - 支払費用60%）
- **TypeScriptビルドエラー修正**（Recharts Tooltip formatter型）
- **Vercelデプロイ完了**
  - 本番URL: https://nadeshiko-sales.vercel.app
- **CLAUDE.md更新**
  - NADESHIKO/CLAUDE.md にWebアプリ情報追記

### 2026-01-23 (45)
- **NADESHIKOプロジェクト追加**
  - ユーザー依頼: `NADESHIKO/issue/issue.md`（約2,300行）の分析・理解
  - ファイル内容: 週次ミーティング記録（2025年9月〜2026年1月）
- **分析・サマリー化**
  - 事業概要: 美容系SNSメディア運営（TikTok/IG/YT/X）
  - ビジネスモデル: タイアップ投稿 + 広告配信（アンプリファイ）+ 素材納品
  - 月間目標: 粗利 2,000〜5,000万円
  - 主要課題: 再生数低迷、インバウンド減少、組織問題
  - 改善戦略: バズ企画、検索対策、アカウント質向上、投稿数増加
  - 収益施策: PKG、TikTok Shop、広告配信、大量動画生成
  - 競合: Gracemode、luana.beauty、KITEN、Senjin
- **CLAUDE.md作成**
  - `NADESHIKO/CLAUDE.md`: プロジェクト概要
  - `NADESHIKO/issue/CLAUDE.md`: issue/フォルダの説明
  - ルートCLAUDE.md: NADESHIKOセクション追加

### 2026-01-23 (44)
- **「なまえデザイン」書籍まとめ Phase 2 完了**
  - ネーミング/コピー作成プロンプトを最終版として強化
  - ファイル: `opperation/なまえデザイン_フォルダ/なまえデザイン.md`（206行→271行）
- **追加内容**
  - 「いい名前の定義」セクション新規追加
  - チェックリスト強化（必須5項目 + 推奨10項目）
  - 「名前を置く vs 掲げる」対比表追加

### 2026-01-23 (43)
- **/handoff スキル更新**
  - 変更内容: 「変更ファイルがあるフォルダには**必ず**CLAUDE.mdを配置する」原則を明記
  - 目的: `/handoff`実行時に編集した全フォルダにCLAUDE.mdが自動作成/更新されるようにする

### 2026-01-23 (42)
- **「なまえデザイン」書籍まとめ作成（Phase 1）**
  - 書籍: 「なまえ」デザイン（小薬元著、宣伝会議、279ページ）
  - 出力: `なまえデザイン.md`（194行）
  - 内容: 用語定義、コアコンセプト、目次構成、チェックリスト

### 2026-01-22 (41)
- **プロジェクト固有ルール追加**
  - AP/CLAUDE.md に「プロジェクト固有ルール」セクション追加
  - 保存先: `AP/_claude-code/skills/`（グローバルの`~/.claude/`ではない）

### 2026-01-22 (40)
- **N organic X戦略を2/11花粉飛散宣言軸に変更**
- **N organic コンセプト更新「帰ったら洗う、花粉オフ」**
- **コンセプト設計スキル作成**（`_claude-code/skills/concept-design.md`）

### 2026-01-22 (39)
- **N organic アクティベーションカレンダー作成**
- **CalendarContentタブ追加**（5タブ構成）
- **Vercelデプロイ完了**

### 2026-01-22 (38)
- **APフォルダ構造改善（Phase 2）完了**
- **CLAUDE.md 新規作成（3件）**

### 2026-01-22 (37)
- **N organic X戦略提案プロジェクト作成**
- **予算配分確定**（5,000万円）
- **Webapp作成・Vercelデプロイ**

---
過去のセッション履歴: [HANDOFF_ARCHIVE.md](./HANDOFF_ARCHIVE.md)
