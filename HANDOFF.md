# HANDOFF - セッション引き継ぎ

## 現在の状態

### 完了したタスク
- [x] コンセプト学習資料をAPフォルダに移動（docs/concept/）
- [x] marketing-onboarding WebアプリをAP/webappに移動
- [x] Vercelに本番デプロイ
- [x] **MASCODEメディアプラン分析・表作成**
- [x] **UGCネーミング7条件を全5事例に追加**
- [x] **用語統一（UGCネーミング→コンセプト）**
- [x] **評価項目を14項目（マスト7+任意7）に統合**
- [x] **webappシンプル化（2セクション構成に）**
- [x] **Vercel本番デプロイ（シンプル化版）**
- [x] **事例を10個追加（計15事例に拡張）**
- [x] **ネーミング案を14項目評価指標に則って改善（全15事例）**
- [x] **ナビゲーション修正（古いリンク削除）**
- [x] **Vercelデプロイ問題の調査・解決**
- [x] **新しいGitHubリポジトリ作成（Hantaku705/ap-concept-learning）**
- [x] **CLI直接デプロイに変更（GitHub連携解除）**
- [x] **APフォルダ構造を整理（プロジェクト別に分離）**
- [x] **Phone Farm 脅威インテリジェンスレポート作成**
- [x] **Phone Farm WebアプリをNext.jsで作成（Vercelデプロイ）**
- [x] **レポートをライトテーマに変更（視認性改善）**
- [x] **各セクションに目的・補足説明を追加**
- [x] **セットアップガイドページ作成（/setup-guide）**
- [x] **Dr.Melaxin マーケティング提案書PDFを分析**
- [x] **Dr.Melaxin proposal.md 作成（提案書サマリー）**
- [x] **Dr.Melaxin GTM CSVを分析・proposal.mdに追記**
- [x] **Dr.Melaxin Webapp作成（9セクション、グラフ4種）**
- [x] **Dr.Melaxin 競合リサーチページ追加（/research）**
- [x] **Dr.Melaxin $10M USD予算提案書作成**（budget-proposal-10m.md, 704行）
- [x] **memo.md（社内メモ）の知見を反映**
- [x] **research.md をロジカルに整理（6セクション構成）**
- [x] **Dr.Melaxin 年間メディアプラン作成**（media-plan-annual.md）
- [x] **Dr.Melaxin 3月メガ割詳細プラン作成**（media-plan-march.md）
- [x] **Dr.Melaxin 6月メガ割詳細プラン作成**（media-plan-june.md）
- [x] **Dr.Melaxin 戦略資料作成**（strategy.md、OGSM形式）
- [x] **Dr.Melaxin proposal/フォルダに提案資料を統合**
- [x] **Dr.Melaxin 広告配信戦略（運用型/獲得型）を追加**
- [x] **Dr.Melaxin 提案書とスライドの比較分析**
- [x] **Dr.Melaxin 製品ラインナップ詳細を追加**（Serum/Mask/Toner/Eye Phalt/美顔器）
- [x] **Dr.Melaxin マーケティング予算構成を整理**（棚取り費用を除外）
- [x] **Dr.Melaxin 四半期別プランにReach数を追加**（q1-q4.md）
- [x] **Dr.Melaxin X TopView削除→運用型広告に変更**
- [x] **Dr.Melaxin Reach計算ロジック・媒体別単価・KOL規模をCLAUDE.mdに追記**
- [x] **Dr.Melaxin 根拠ファイル（reason files）を6ファイル作成**
- [x] **Dr.Melaxin annual-matrix.md 作成**（年間マトリックス形式）
- [x] **Dr.Melaxin q1-q4 matrix ファイル作成**（四半期別マトリックス形式）

### 作業中のタスク
- [ ] **MASCODEアイライナー コンセプト作成**（検討中）

## 次のアクション
1. **Dr.Melaxin 提案資料の社内レビュー**（strategy.md + q1-q4.md）
2. クライアントとの認識合わせ（GMV目標 73.6億円 vs 120億円の位置づけ）
3. 3月メガ割に向けた準備開始（TikTok制作発注、RT部隊業者との調整）
4. 6月ジョングク契約交渉の進捗確認
5. MASCODEアイライナーのコンセプト案を最終決定

## 未解決の問題
- **データ同期**: `concept-learning/docs/concept-data.json` と `concept-learning/webapp/src/data/concept-data.json` は手動同期が必要（Turbopackがシンボリックリンク非対応のため）

## 未コミット変更
```
 M dr.melaxin/proposal/CLAUDE.md
 M dr.melaxin/proposal/annual.md
 M dr.melaxin/proposal/q1.md
 M dr.melaxin/proposal/q2.md
 M dr.melaxin/proposal/q3.md
 M dr.melaxin/proposal/q4.md
?? dr.melaxin/proposal/annual-matrix.md
?? dr.melaxin/proposal/q1-matrix.md
?? dr.melaxin/proposal/q2-matrix.md
?? dr.melaxin/proposal/q3-matrix.md
?? dr.melaxin/proposal/q4-matrix.md
```

## 最新コミット
```
1efe842 docs(dr.melaxin): add reason files for proposal documents
```

## セッション履歴

### 2026-01-21 (17)
- **Dr.Melaxin annual-matrix.md 作成**（年間マトリックス形式）
  - SNS別詳細表（施策×SNS行、月列）
  - 予算のみ表 / リーチのみ表（M=百万円/UU表記）
  - SNS別 / 月別 / 施策別サマリー
  - ASCII視覚化（バーチャート）
  - KPIサマリー、Reach計算ロジック
- **Dr.Melaxin q1-q4 matrix ファイル作成**（四半期別マトリックス形式）
  - `q1-matrix.md`: 2-3月、3.8億円、Reach 1.2億UU
  - `q2-matrix.md`: 4-6月、3.6億円+別枠2.5-3.3億円、Reach 2.2億UU
  - `q3-matrix.md`: 7-9月、4.0億円、Reach 1.5億UU
  - `q4-matrix.md`: 10-12月、4.4億円、Reach 1.7億UU
- **各ファイルの更新**
  - `q1.md`, `q2.md`, `q3.md`, `q4.md`: 関連ドキュメントにマトリックスファイルへのリンク追加
  - `proposal/CLAUDE.md`: ファイル一覧と更新履歴を更新

### 2026-01-21 (16)
- **Dr.Melaxin 根拠ファイル（reason files）を6ファイル作成**
  - `strategy_reason.md`: OGSM設定根拠、ROAS 466%算出、勝ちパターン導出、CSF選定理由
  - `annual_reason.md`: 年間15.8億円の配分根拠、媒体別投資計算、Reach計算ロジック
  - `q1_reason.md`: 3月メガ割戦略、TikTok 1,300本算出、RT部隊0.7億円設計、GMV 5-7億円根拠
  - `q2_reason.md`: ジョングク起用根拠、別枠2.5-3.3億円内訳、Plan B設計、GMV 10億円算出
  - `q3_reason.md`: Drug Store 9月参入理由、TTS強化（7-8月）根拠、オン×オフ連携設計
  - `q4_reason.md`: BestCosme獲得戦略、BF全チャネル連動、年間73.6億円達成検証
- **proposal/CLAUDE.md を更新**
  - 根拠ファイル一覧を追加
  - 使い方・用途を記載
- **根拠ファイルの内容構成**
  - 市場データからの根拠: 競合売上データ、成功パターン、ベンチマーク数値
  - 計算根拠: 予算配分計算式、GMV目標の算出、Reach計算ロジック
  - リスク分析と対策: 発生確率×影響度、具体的な対策

### 2026-01-20 (15)
- **Dr.Melaxin 四半期別プランにReach数を追加**（q1-q4.md）
  - 各プランにReachサマリーセクション追加
  - TikTok / X RT部隊 / X運用型 / IG KOL / YT KOL / TTS GMV MAX のReach算出
  - 年間Reach: 約6.6億UU（実質1,500-2,000万UU）
- **X TopView削除→運用型広告に変更**（ユーザーFB）
  - X TopViewは使用しない（CPMが高い）
  - X運用型広告（CPM ¥300）で運用
- **Reach計算ロジックをCLAUDE.mdに追記**
  - 媒体別単価: TikTok制作¥10,000/本、GMV MAX CPM ¥1,000、X RT部隊 imp単価¥1、X運用型 CPM ¥300
  - KOL規模: IG Aクラス10-30万、Bクラス5-10万、YTメガ系20-30万登録
  - RT部隊: 10-20アカウント × 10万フォロワー、100万imp/投稿
  - Reach計算式: TikTok（再生数×UU率70%）、X RT部隊（予算÷¥1÷freq4）、X運用型（予算÷CPM¥300×1,000÷freq3）等
- **重要な決定事項**（ユーザーFB）
  - TikTok GMV MAX CPM: ¥1,000（ROAS 200%）
  - X運用型広告 CPM: ¥300
  - X RT部隊 imp単価: ¥1
  - IG視聴率: 10%、YT視聴率: 40%
  - TTS GMV MAX freq: 5

### 2026-01-20 (14)
- **Dr.Melaxin 戦略資料作成**（strategy.md、OGSM形式）
  - エグゼクティブサマリー（OGSM 1ページ）
  - 市場環境と機会（競合分析含む）
  - Objective/Goals/Strategy/Measures
  - 実行体制とNext Steps
- **Dr.Melaxin proposal/フォルダに提案資料を統合**
  - strategy.md（戦略資料）+ annual/march/june.md（メディアプラン）
  - media-plan/フォルダから移動・統合
- **広告配信戦略（運用型/獲得型）を追加**
  - 年間広告予算 4.0億円（運用型2.5億 + 獲得型1.5億）
  - チャネル別戦略（TikTok Spark Ads、IG Reels、X プロモ、Meta リタゲ）
  - 時期別配分（通常期: 認知重視、メガ割: 刈り取り重視）
- **提案書とスライドの比較分析**
  - GMV目標の不一致（スライド120億 vs 提案書73.6億）→ $10M版として明記
  - 製品詳細の不足 → Serum/Mask/Toner/Eye Phalt/美顔器を追加
  - TTS戦略の詳細 → 人軸（美容液）vs 商品軸（アイケア）追記
  - チャネル別ROASの問題 → 誤解を招くため削除、全体ROAS 466%のみ記載
- **マーケティング予算構成を整理**
  - マス施策 5.0億（Ambassador、Top KOL、TikTok UGC、Meta Ads）
  - EC施策 5.3億（Qoo10、TTS、Amazon、楽天）
  - オフラインマーケ 5.5億（OOH/アドトラック、POP UP、イベント）
  - 棚取り費用（Drug Store/Variety Store）は営業予算として除外
- **重要な決定事項**
  - GMV目標: 73.6億円のまま（$10M版）、フル版（120億）は別途協議
  - 製品名: Serum/Mask/Toner/Eye Phalt/美顔器で確定
  - チャネル別ROASは算出しない（認知施策が全チャネルに寄与するため）

### 2026-01-20 (13)
- **Dr.Melaxin 年間メディアプラン作成**（media-plan-annual.md）
  - 月別予算配分（15.8億円）
  - 媒体別年間戦略（TikTok/X/IG/YT）
  - 四半期別KPI設定
  - リスク管理・検証サイクル
- **Dr.Melaxin 3月メガ割詳細プラン作成**（media-plan-march.md）
  - 週別タイムライン（2/15〜3/20）
  - TikTok大量生成（1,000本）
  - RT部隊全力稼働（トレンド入り5回目標）
  - KOL Pick配信スケジュール（Aクラス2人契約済み）
  - YTメガ系KOL Pick（大型YouTuber3配信）
  - 目標: GMV 5-7億円、Qoo10 Top10
- **Dr.Melaxin 6月メガ割詳細プラン作成**（media-plan-june.md）
  - ジョングク起用計画（別枠2.5-3.3億円）
  - オフラインイベント（ポップアップストア、来場1万人）
  - Plan B（他K-POP: SEVENTEEN等）
  - 目標: GMV 10億円、Qoo10 Top5
- **重要決定事項**
  - 3月Ambassador: 起用しない（6月に集中）
  - 6月ジョングク: 別予算確保（$10M枠外）
  - TikTok制作: Jipanglobal（1本1万円 or 再生保証）
  - RT部隊: 業者確定済み（顔面工事ちゃん系）
  - YT戦略: 検証系ミドルではなくメガ系KOL Pickに集中

### 2026-01-20 (12)
- **research.md をロジカルに整理**
  - 散乱していた競合リサーチ情報を6セクション構成でリライト
  - 構成:
    1. 市場概況（Tier別売上・購買傾向）
    2. 成功パターン（通常期・メガ割の共通戦略）
    3. 競合ブランド別分析（Dalba/Medicube/LAKA/その他）
    4. マーケティング手法詳細（ホワイト/グレー施策）
    5. JT代理店情報（参考）
    6. Dr.Melaxinへの示唆
  - 重複情報を統合（Dalbaが3箇所→1箇所に）
  - 表形式で売上規模・施策・ROI評価を整理
  - 全てのリンクを保持
- **元データを保存**
  - `research-raw.md` として元の生データを保存

### 2026-01-20 (11)
- **budget-proposal-10m.md にmemo.mdの知見を反映**
  - @cosme/LIPS戦略セクション追加（美容感度高い層向け）
  - 6月Big KOL検討（ジョングク級）をAmbassador欄に追記
  - 付録に追加:
    - Qoo10 1億プラン媒体配分（IG 60% / TT 20% / X 20%）
    - 具体的施策アイデア（毎日ライブ配信、TT大量動画、X TopView等）
    - フェーズ別予算配分（Phase1→Phase2→Phase3）
  - 月別スケジュール6月に「Big KOL検討★」追記
  - ファイルサイズ: 620行 → 704行（+84行）

### 2026-01-20 (10)
- **Dr.Melaxin Webapp作成**
  - Next.js 16.1.4 + Recharts でマーケティング提案書を可視化
  - 9セクション構成（概要〜KOL戦略）
  - グラフ4種: 累計売上（LineChart）、投資内訳（PieChart）、チャネル別（BarChart）、四半期別（ComposedChart）
  - Vercelデプロイ: https://dr-melaxin-proposal.vercel.app
- **競合リサーチページ追加（/research）**
  - research.mdの内容を別ページとして追加
  - 6セクション構成:
    1. 市場概況（ブランドTier別売上、購買傾向）
    2. 成功パターン（通常期・メガ割の勝ちパターン）
    3. 競合分析（Dalba、Medicube、LAKA詳細）
    4. マーケティング手法（ホワイト/グレー施策、RT部隊）
    5. JT代理店情報（LAKA/朝鮮美人の課題感）
    6. Dr.Melaxinへの示唆（Top Tier共通点、必要アクション）
  - ナビゲーションに「提案書」「リサーチ」切り替えボタン追加
  - Vercelデプロイ完了

### 2026-01-20 (9)
- **budget-proposal-10m.md ブラッシュアップ**
  - research.md（競合リサーチ）の知見を反映
  - 新セクション追加:
    - 競合分析（Dalba, Medicube, LAKA詳細）
    - Qoo10勝ちパターン（「通常期で話題→メガ割で刈り取り」）
    - X話題形成戦略（ホワイト/グレー施策）
    - Dr.Melaxin固有の課題と対策
  - チャネル戦略強化:
    - Qoo10: 7,000円着地、KOL Pick戦略、競合ベンチマーク追加
    - TikTok Shop: Qoo10連動戦略追加
  - 目次更新（8→12セクション）
  - 約200行追加（424行→620行超）

### 2026-01-20 (8)
- **Dr.Melaxin マーケティング提案書分析**
  - PDF（65ページ、19.8MB）を画像変換して読み取り
  - popplerをインストールしてPDF→PNG変換（150 DPI）
  - 提案書の内容を理解・サマリー作成
- **proposal.md 作成**（332行）
  - 基本情報（BRAND501 Corp.、GMV 120億円目標）
  - 戦略方針（Plan B: Vertical Launch推奨）
  - FY1財務計画（マーケ投資38億円、ROAS 316%）
  - 投資内訳（Outbound Mass / EC / Offline）
  - 販売チャネル戦略（Qoo10 → TikTok Shop → Amazon/楽天 → Offline）
  - GTMロードマップ
  - 競合分析（Anua, medicube, ナンバーズイン）
  - プロモーション戦略・KOL Pick戦略
- **GTM CSV分析・追記**
  - 月別イベントカレンダー（メガ割、BF、Best Cosme等）
  - チャネル別投資・売上・ROAS詳細
  - 四半期別投資配分（Q1投資先行→Q2以降回収）
  - 月別投資額・売上目標詳細
  - 累計売上推移（進捗率付き）

### 2026-01-20 (7)
- **Phone Farm 脅威インテリジェンスレポート作成**
  - TikTok不正業者（Phone Farm）の手法を分析
  - 初心者業者が使用するハードウェア・ソフトウェアを網羅
  - 検出戦略（ハードウェア/ソフトウェア/行動/ネットワーク）をまとめ
- **Next.js Webアプリ作成**
  - `phonefarm/webapp/` にNext.js 15アプリを構築
  - Vercelにデプロイ: https://phonefarm-threat-intel.vercel.app
- **視認性改善**
  - ダークテーマ → ライトテーマに変更
  - 各セクションに「目的」「ポイント」「補足説明」を追加
  - 検出戦略テーブルに「理由」列を追加
- **セットアップガイドページ作成** (`/setup-guide`)
  - 初心者向け0→1完全マニュアル
  - 2つの予算構成（最小: 5台3万円、スタンダード: 10台17万円）
  - 具体的な買い物リスト（商品名・価格・購入先URL）
  - 8フェーズ・29ステップのガイド
  - 各ステップにコマンド例・検出シグナル付き
  - トラブルシューティングセクション

### 2026-01-20 (6)
- APフォルダ構造を整理（プロジェクト別に分離）
  - `_claude-code/` 作成: agents, commands, rules, skills, hooks, mcp-configs, plugins, examples を移動
  - `concept-learning/` 作成: webapp, docs/concept, kwonlege を移動
  - `mascode/` 作成: PDF提案書、メディアプラン を移動
  - `_archive/` 作成: 用途不明ファイル（video-analysis-kit.md, account-analysis/, コンセプトmd）を退避
- 命名修正
  - `kwonlege/` → `concept-learning/knowledge/` （スペル修正）
  - `メディアプラン_MASCODE/` → `mascode/media-plan/` （英語化）
  - `【MASCODE BEAUTY】...pdf` → `mascode/proposal.pdf` （英語化）
- CLAUDE.md を新しい構造に合わせて更新

### 2026-01-20 (5)
- MASCODEアイライナー コンセプト作成（検討中）
  - PDF資料を分析（53ページのプロモーション提案書）
  - 商品情報: MASCODE スリークリキッドアイライナー THE BLACK
  - ターゲット: 30-40代働く女性
  - 消費者インサイト: 目元の疲れ、メイクが古い、失敗したくない
- コンセプト案を5つ作成・14項目評価
  1. 選べる3黒（サンクロ）
  2. 疲れ目、盛れる黒
  3. 大人の目力ライナー
  4. ひと描きで目力
  5. 黒、3段活用
- 現状方向性（勝ち確ブラック/浮かないブラック）を評価
- 「浮かず盛れる黒」の方向性で追加案を提案
  - さりげ盛り黒
  - しれっと盛り黒
  - ほど盛り黒
- 4案比較表を作成（次回最終決定予定）

### 2026-01-20 (4)
- Vercelデプロイ問題の調査・解決
  - 原因: ローカルコミットがリモートにプッシュされていなかった
  - 元リポジトリ（affaan-m/everything-claude-code）にプッシュ権限なし
- 新しいGitHubリポジトリ作成
  - https://github.com/Hantaku705/ap-concept-learning
- VercelのGitHub連携を解除
  - CLI直接デプロイに変更（`vercel --prod`）
- 本番デプロイ完了
  - 2セクション構成が正しく表示されることを確認
  - URL: https://webapp-five-bay.vercel.app

### 2026-01-20 (3)
- ナビゲーション修正
  - 古いリンク（/concept/definition, /concept/good-concept）を削除
  - 新しいリンク（/concept/textbook, /concept/examples）に更新
- Vercel本番デプロイ完了

### 2026-01-20 (2)
- 事例を10個追加（計15事例に拡張）
  - お、ねだん以上。（ニトリ）
  - コンビニコーヒー（セブンカフェ）
  - 飲む点滴（甘酒）
  - 1000円カット（QBハウス）
  - 大人のふりかけ（丸美屋）
  - 朝マック（マクドナルド）
  - 置くだけWi-Fi（SoftBank Air）
  - 落ちないリップ（リップモンスター）
  - 飲むスキンケア（ディフェンセラ）
  - ながら美顔器（ヤーマン）
- ネーミング案を14項目評価指標に則って改善
  - 悪い例（まつげ革命、プチプラ革命等）を排除
  - 良いパターンを適用: 行動+結果、既知概念+商品、時間+効果、機能+商品
  - 例: 「まつげ革命」→「ひと塗りエクステ」「つけま級マスカラ」
- Vercel本番デプロイ完了: https://webapp-five-bay.vercel.app

### 2026-01-20
- 用語統一: 「UGCネーミング」「タグライン」→「コンセプト」に統一
- 評価項目を14項目（マスト7+任意7）に統合
  - 23項目から重複を排除して14項目に
  - 全5事例を新フォーマットで再評価
  - ネーミング案を各事例に追加
- webappシンプル化
  - 3セクション（定義/良いコンセプト/事例）→ 2セクション（コンセプトとは/事例）に
  - `/concept/textbook` ページ新規作成（教科書全6章を表示）
  - `/concept/definition` と `/concept/good-concept` を削除
- Vercel本番デプロイ: https://webapp-five-bay.vercel.app

### 2026-01-19 (2)
- MASCODEメディアプラン（4,000万円）の詳細分析
  - Phase×施策×SNS別の予算・リーチ・投稿数表を作成
  - `メディアプラン_MASCODE/` フォルダにCSV・MD出力
- UGCネーミング7条件を全5事例に追加
  - `docs/concept/concept-data.json` に `ugcNamingEval` 追加
  - `webapp/src/lib/concept.ts` に型定義追加
  - `webapp/src/app/concept/examples/[slug]/page.tsx` にUIセクション追加
- Turbopackシンボリックリンク非対応を発見
  - 解決策: ファイルコピーで対応（手動同期必要）

### 2026-01-19
- YouTube動画（コンセプト学習）をGemini APIで分析
- コンセプト学習資料をMarkdownで作成（docs/concept/）
  - 01-definition.md（2つの定義）
  - 02-good-concept.md（7条件・7基準）
  - examples/（5つの事例）
- marketing-onboarding Next.jsアプリを作成
- WebアプリをAP/webappに移動
- Vercelに本番デプロイ: https://webapp-five-bay.vercel.app
