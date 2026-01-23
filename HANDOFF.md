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
| NADESHIKO | 45-51回目 | 売上管理Webapp、Excel→CSV変換、KSF分析、アルゴリズム解説、全期間データ統合、Webapp改善、再生数シート変換 | 13件 |

詳細は [HANDOFF_ARCHIVE.md](./HANDOFF_ARCHIVE.md) を参照。

### 直近の完了タスク
- [x] **Phone Farmプロジェクト理解＆住所検索スキル作成（セッション52）**
  - phonefarmプロジェクトの構成・内容理解
  - Some3C 10ポートボックスの電圧（日本は110V）・追加必要ハードウェア回答
  - AnyMind Japan住所検索→英語配送フォーム形式に変換
  - `/address-lookup` スキル作成（`_claude-code/commands/address-lookup.md`）
- [x] **再生数シートExcel→CSV変換（セッション51）**
  - `NADESHIKO 分析.xlsx` → 月別CSV（6ファイル、4,110行）
  - 変換スクリプト: `scripts/xlsx_to_csv_views.py`
- [x] **NADESHIKO Webapp改善（セッション50）**
  - Performance年/四半期フィルター追加
  - AIチャット機能追加（OpenAI GPT-4o-mini）
  - キーボード操作改善（Enter送信、Shift+Enter改行）
  - Settingsタブ削除（3タブ構成に変更）
  - 編集モードトグル削除（ヘッダー簡略化）
- [x] **NADESHIKO全期間データ統合**（2023年11月〜2026年4月、1,102件）
  - CSVフォーマット4種類対応（旧/新/9月/10月）
  - 月表示を「年/月」形式に変更（例: 25年1月）
  - 変換スクリプト作成: `scripts/csv_to_deals_all.py`
- [x] **「何ゲーか」分析スキル作成**（`_claude-code/skills/what-game.md`）
- [x] **NADESHIKO KSF分析作成**（`NADESHIKO/issue/ksf.md`）
- [x] **TikTokアルゴリズム解説作成**（`NADESHIKO/algorithm/algorithm.md`）
- [x] **Excel→CSV変換完了**（利益管理シート 28シート変換）
- [x] **NADESHIKO売上管理Webapp作成**（Vercel: https://nadeshiko-sales.vercel.app）

### 作業中のタスク
- [ ] **The Room FX 提案書 Google Docs書き込み**（5〜11章 + Appendix 残り）
- [ ] **MASCODEアイライナー コンセプト作成**（検討中）
- [ ] **「なまえデザイン」書籍まとめ Phase 3**（各章詳細追加予定）

## 次のアクション
1. **NADESHIKOアルゴリズム実践**（ksf.md、algorithm.md参照）
2. **The Room FX 提案書レビュー＆プレゼン資料化**（2月1週目締切）
3. N organic Webappの確認（Vercel本番: https://webapp-five-bay.vercel.app）

## 未解決の問題
- **データ同期**: `concept-learning/docs/concept-data.json` と `concept-learning/webapp/src/data/concept-data.json` は手動同期が必要（Turbopackがシンボリックリンク非対応のため）

## 未コミット変更
```
 M CLAUDE.md
 M HANDOFF.md
 M NADESHIKO/CLAUDE.md
 M NADESHIKO/algorithm/CLAUDE.md
 M NADESHIKO/algorithm/algorithm.md
 M NADESHIKO/webapp/CLAUDE.md
 M NADESHIKO/webapp/package*.json
 M NADESHIKO/webapp/src/app/page.tsx
 M NADESHIKO/webapp/src/components/*
 M NADESHIKO/webapp/src/data/*
 M NADESHIKO/webapp/src/lib/*
?? NADESHIKO/data/再生数シート/（6ファイル）
?? NADESHIKO/data/過去再生数シート/
?? NADESHIKO/scripts/*.py
?? NADESHIKO/webapp/src/app/api/
?? NADESHIKO/webapp/src/components/chat/
?? NADESHIKO/webapp/src/components/performance/TrendChart.tsx
?? _claude-code/commands/address-lookup.md
```

## 最新コミット
```
648d08b feat(nadeshiko): add KSF analysis, TikTok algorithm guide, and what-game skill
```

## セッション履歴（直近10回分）

### 2026-01-23 (52)
- **Phone Farmプロジェクト理解**
  - ユーザー依頼: `projects/phonefarm/` を理解して
  - 内容: TikTok等のPhone Farm不正業者の脅威インテリジェンスレポート
  - Webapp: https://phonefarm-threat-intel.vercel.app
  - 構成: レポートページ（9セクション）+ セットアップガイド（30日プラン）
- **Some3C製品の電圧回答**
  - ユーザー依頼: 10ポートボックスの電圧どっちがいい？
  - 回答: **110V ±15%**（日本の100Vに対応）
  - 220V版は欧州・中国・韓国向け
- **追加必要ハードウェア回答**
  - ユーザー依頼: スマホあるならこれだけでいい？
  - 回答: 追加でUSBケーブル（30cm×10本、約¥1,300）が必要
  - SMS認証・プロキシは用途次第
- **AnyMind Japan住所検索**
  - ユーザー依頼: AnyMind Japanの住所を教えて（配送フォーム用）
  - 回答: 〒106-6131 港区六本木6-10-1 六本木ヒルズ30F
  - 英語変換: Minato-ku, 6-10-1 Roppongi, Roppongi Hills 30F
- **`/address-lookup` スキル作成**
  - 会話からスキル生成（/create-skill実行）
  - 機能: 企業サイトから住所取得→英語配送フォーム形式に変換
  - 保存先: `_claude-code/commands/address-lookup.md`

### 2026-01-23 (51)
- **再生数シートExcel→CSV変換**
  - ユーザー依頼: `NADESHIKO 分析.xlsx` を理解してCSVに変換
  - 入力: `NADESHIKO/data/再生数シート/NADESHIKO 分析.xlsx`（35シート）
  - 対象: 月別シート6枚（1月, 12月, 11月, 10月, 9月, 8月）
  - 変換ロジック:
    - 1月シート: 行17からデータ開始（行1-16は集計サマリー）
    - 他: 行1からデータ開始
  - カラム（28列）: 投稿日, アカウント名, PR/通常, sns, 担当者, タイトル, URL, 種別, 更新日, 動画尺, 再生数, いいね, コメント, 共有, 保存, いいね率, コメント率, 共有率, 保存率, 平均視聴時間, 視聴維持率, 1秒継続率, 3秒継続率, 6秒継続率, フル視聴率, 新規フォロー, フォロー率, おすすめ率
- **出力**:
  | ファイル | 行数 |
  |---------|------|
  | 2026年1月.csv | 1,668 |
  | 2025年12月.csv | 664 |
  | 2025年11月.csv | 533 |
  | 2025年10月.csv | 582 |
  | 2025年9月.csv | 342 |
  | 2025年8月.csv | 321 |
  | **合計** | **4,110** |
- **変換スクリプト作成**: `NADESHIKO/scripts/xlsx_to_csv_views.py`

### 2026-01-23 (50)
- **NADESHIKO Webapp 5つの改善**
  1. **Performance年/四半期フィルター追加**
     - ユーザー依頼: 月単位だけでなく年/四半期でもフィルタリングしたい
     - FilterType: 'month' | 'year' | 'quarter'
     - 四半期定義: Q1(01-03), Q2(04-06), Q3(07-09), Q4(10-12)
     - effectiveStartMonth/effectiveEndMonth計算ロジック追加
  2. **AIチャット機能追加**
     - ユーザー依頼: LLMで受け答えできるチャットボット追加
     - OpenAI GPT-4o-mini使用（/api/chat/route.ts）
     - ChatWidget: 右下フローティングチャットUI
     - dealsContext: 売上データサマリーをAIに渡す
     - Vercel環境変数にOPENAI_API_KEY追加
  3. **キーボード操作改善**
     - ユーザー依頼: ChatGPT等と同じ仕様に（Enter送信、Shift+Enter改行）
     - input → textarea変更（複数行対応）
     - handleKeyDown更新（Shift+Enter改行許可）
  4. **Settingsタブ削除**
     - ユーザー依頼: 不要
     - TabNavigation.tsxからsettings削除
     - page.tsxからSettingsContent削除
     - 3タブ構成に変更（Dashboard/Deals/Performance）
  5. **編集モードトグル削除**
     - ユーザー依頼: 右上の編集モードは不要
     - Header.tsxからisEditMode/setEditMode/isDirty/isSaving/saveChanges削除
     - 保存ボタン/未保存警告/トグルボタン削除
     - DEVバッジのみ残置
- **Vercelデプロイ完了**（5回）
  - 本番URL: https://nadeshiko-sales.vercel.app

### 2026-01-23 (49)
- **NADESHIKO全期間データ統合**
  - ユーザー依頼:
    1. 売上管理ダッシュボードの月表示を「年/月」形式に変更
    2. 2023年11月からの全期間データを統合
    3. 2025年9月・10月のCSVフォーマット対応
  - 変換スクリプト作成: `scripts/csv_to_deals_all.py`
  - 対応フォーマット4種類:
    - 旧フォーマット（2023-11〜2025-08）: `Month, アカウント名, 案件名...`
    - 9月フォーマット: `アカウント名, 案件名, 取引先, 摘要, 単価...`
    - 10月フォーマット: `請求書, 区分, アカウント名, 請求項目...`
    - 新フォーマット（【締め済】【FIX】【進行中】）: `担当者, クライアント, 案件名...`
  - 結果:
    - 総案件数: 151件 → **1,102件**
    - 対象月数: 6月 → **30月**（全期間）
  - 修正したバグ:
    - ファイル名から月を抽出する際「2024年10月期」を誤検出
    - 備考欄の改行がTypeScriptを壊す問題
    - ステータス値の正規化（SNS事業部→進行中 等）
- **Webapp更新**
  - `formatters.ts`: 月表示を「1月」→「26年1月」形式に変更
  - `constants.ts`: monthOptionsを30月分に拡張
  - `DashboardContent.tsx`: テーブル表示を年/月形式に変更
- **Vercelデプロイ完了**
  - 本番URL: https://nadeshiko-sales.vercel.app

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
