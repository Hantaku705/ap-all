# DynamicBranding - プロジェクト設定

味の素グループの「点→線→面」ブランディングを実現するためのフレームワーク。

---

## 1. プロジェクト概要

### ビジョン
> 「商品単位の施策」から「生活文脈単位の施策」へ転換する

### 「点→線→面」とは

| 段階 | 意味 | 例 |
|------|------|-----|
| **点** | 個別商品・個別施策 | ほんだしのCM |
| **線** | 文脈でつながった商品群 | 「忙しい平日夜」に刺さる複数商品 |
| **面** | ブランド全体の世界観 | 味の素＝生活を支える存在 |

### 目標
- SNS口コミ・検索KWから**生活文脈（CEP）**を抽出
- CEPと商品の関係性を可視化
- 「線」を見つけ、「面」への展開を設計

---

## 2. コア概念

### CEP（Category Entry Point）

**定義**: 生活者が「何かを使おう」と思う瞬間・文脈

**粒度基準**: 細かい（具体的な生活シーン）

```
例：
- 粗い：「平日の夕食」 ← 使わない
- 中間：「忙しい平日の夜」 ← 使わない
- 細かい：「19時帰宅、子ども空腹、30分で作りたい」 ← 採用
```

### データソース

| ソース | 内容 |
|--------|------|
| SNS口コミ | Twitter, Instagram等の投稿 |
| 検索KW | Google検索クエリ |
| 手動アップロード | CSV/Excelでインポート |

---

## 3. データフォーマット

### UGCデータ（CSV）

```csv
id,source,text,product_mention,date
1,twitter,"ほんだし使ったら味が決まった！",ほんだし,2024-01-15
2,search,"味の素 体に悪い",,2024-01-15
3,instagram,"クックドゥで時短できた",クックドゥ,2024-01-16
```

### CEPマスタ（CSV）

```csv
id,name,category,primary_emotion,secondary_emotion
1,"19時帰宅、子ども空腹、30分で作りたい",平日夕食,焦り,不安
2,"料理失敗したくない、でも時間ない",料理不安,不安,プレッシャー
3,"自分のための適当ごはん",一人飯,手抜き願望,罪悪感
```

---

## 4. 分析ワークフロー

```
1. /analyze-ugc     → UGCデータの基礎分析
2. /extract-cep     → CEP抽出・分類
3. /map-cep-product → CEP×商品マトリクス作成
4. /generate-insight → インサイト生成
5. /propose-strategy → 施策提案
6. /export-report   → レポート出力
```

---

## 5. 用語集

| 用語 | 定義 |
|------|------|
| **CEP** | Category Entry Point。生活者が商品カテゴリを想起する瞬間・文脈 |
| **UGC** | User Generated Content。SNS投稿などユーザー発信コンテンツ |
| **点** | 単一商品・単発施策 |
| **線** | 同じCEPで繋がる複数商品 |
| **面** | ブランド全体として構築される世界観 |
| **感情スコア** | positive / neutral / negative の3値分類 |

---

## 6. Skill一覧

| Skill | 用途 |
|-------|------|
| `/analyze-ugc` | UGCデータの傾向分析 |
| `/extract-cep` | UGCからCEP抽出 |
| `/extract-brand-cep` | **SNSデータからブランド別CEP定量抽出（NEW）** |
| `/map-cep-product` | CEP×商品マッピング |
| `/generate-insight` | インサイト生成 |
| `/propose-strategy` | 施策提案 |
| `/export-report` | レポート出力 |
| `/claudemd` | **CLAUDE.md自動生成・更新（NEW）** |
| `/brushup-report` | **低品質レポートセクション検出・UGCベースのLLM再生成（NEW）** |

---

## 7. Subagent一覧

| Agent | 役割 |
|-------|------|
| `ugc-analyzer` | UGCデータの基礎分析 |
| `cep-mapper` | CEP抽出・商品マッピング |
| `insight-generator` | 戦略インサイト導出 |

---

## 8. 運用ルール

- データは `data/` ディレクトリに格納
- 分析結果は `output/` に出力
- セッション引き継ぎは `HANDOFF.md` を使用
- 永続的な知見はこのファイルに追記

---

## 9. ダッシュボード（dashboard/）

### 技術スタック

- Next.js 16 (App Router)
- TypeScript 5.9
- Tailwind CSS 4
- Recharts 3.6
- Supabase (PostgreSQL)

### 主要ファイル

| ファイル | 用途 |
|---------|------|
| `src/app/page.tsx` | ダッシュボードトップ（3セクション: Data/Analytics/Reports） |
| `src/app/brands/[brandName]/page.tsx` | ブランド詳細レポートページ（非推奨:Analyticsから利用） |
| `src/components/brand-detail/*.tsx` | **ブランド詳細8セクション（DPT追加）** |
| `src/components/brand-detail/BrandDPTSection.tsx` | **DPT分析（Use Case×ポジショニング）（NEW）** |
| `src/components/charts/TrendLineChart.tsx` | 時系列グラフ（**Google Trends / SNS言及数 サブタブ切り替え**） |
| `src/components/charts/CorrelationHeatmap.tsx` | 8×8相関ヒートマップ |
| `src/components/charts/SeasonalityChart.tsx` | 月別棒グラフ |
| `src/components/charts/SeasonalityInsightSummary.tsx` | **季節性インサイト（LLM動的生成）（NEW）** |
| `src/components/charts/MentionShareChart.tsx` | SNS言及シェア棒グラフ |
| `src/components/charts/CooccurrenceHeatmap.tsx` | SNS共起マトリクス |
| `src/components/charts/SentimentChart.tsx` | センチメント分析棒グラフ |
| `src/components/charts/CEPHeatmap.tsx` | **CEP×ブランドマトリクス（NEW）** |
| `src/components/charts/CEPPortfolio.tsx` | **4象限ポートフォリオ（NEW）** |
| `src/components/charts/CEPRanking.tsx` | **ブランド別CEPランキング（NEW）** |
| `src/components/charts/KeywordWordCloud.tsx` | **関連KWワードクラウド（NEW）** |
| `src/components/charts/KeywordCooccurrenceMatrix.tsx` | **KW共起マトリクス（NEW）** |
| `src/components/charts/KeywordRanking.tsx` | **関連KWランキング（NEW）** |
| `src/components/charts/BrandKeywordCEPSankey.tsx` | **ブランド→KW→CEPサンキー（NEW）** |
| `src/components/insights/InsightList.tsx` | インサイトカード一覧 |
| `src/components/reports/ReportsView.tsx` | **レポート表示（ブランド別動的レポート対応）** |
| `supabase/migrations/001_initial_schema.sql` | DBスキーマ（Google Trends） |
| `supabase/migrations/002_sns_schema.sql` | DBスキーマ（SNS） |
| `supabase/migrations/003_cep_schema.sql` | **DBスキーマ（CEP）（NEW）** |
| `supabase/migrations/005_keywords_schema.sql` | **DBスキーマ（関連KW）（NEW）** |
| `scripts/seed-data.ts` | CSV→Supabase投入 |
| `scripts/seed-sns-data.ts` | SNSデータ→Supabase投入 |
| `scripts/seed-cep-data.ts` | CEPデータ→Supabase投入 |
| `scripts/seed-sns-posts.ts` | **SNS生データ→Supabase投入（NEW）** |
| `scripts/fetch-related-keywords.ts` | **SerpAPI関連KW取得（NEW）** |
| `scripts/label-ugc-parallel.ts` | **UGCラベリング（OpenAI 5並列）** |
| `scripts/label-ugc-posts.ts` | **UGCラベリング（Gemini版）** |
| `scripts/label-ugc-multi.ts` | **UGCラベリング（マルチプロバイダー5並列）** |
| `scripts/label-ugc-detail.ts` | **W's詳細ラベリング（料理・シーン・動機）（NEW）** |
| `scripts/brushup-reports.ts` | **レポート品質改善スクリプト（NEW）** |
| `src/lib/report-quality/` | **レポート品質検出・UGC取得・LLM再生成モジュール（NEW）** |
| `supabase/migrations/006_sns_analysis.sql` | **DBスキーマ（センチメント・CEP分析）** |
| `supabase/migrations/007_ugc_labels.sql` | **DBスキーマ（UGCラベリング拡張）** |
| `supabase/migrations/008_cep_detail.sql` | **DBスキーマ（W's詳細化）** |
| `supabase/migrations/009_dpt_cache.sql` | **DBスキーマ（DPTキャッシュ）（NEW）** |
| `src/components/charts/WsDetailChart.tsx` | **W's詳細分析（5タブ）（NEW）** |
| `src/components/charts/UGCLabelChart.tsx` | **UGCラベル分布チャート** |
| `src/components/charts/PersonaClusterChart.tsx` | **ペルソナ散布図（k-meansクラスタリング）** |
| `src/components/charts/PersonaDetailPanel.tsx` | **ペルソナ詳細パネル** |
| `src/components/charts/PersonaQualityIndicator.tsx` | **品質インジケータ（信頼度・シルエットスコア）（NEW）** |
| `src/lib/clustering/` | **k-meansクラスタリングライブラリ（NEW）** |
| `src/components/corporate-analytics/SpikeReport.tsx` | **スパイク要因レポート（統計検出+イベントDB）** |

### API Routes

| エンドポイント | 内容 |
|---------------|------|
| `GET /api/trends` | 週次トレンドデータ（262週分） |
| `GET /api/correlations` | ブランド間相関マトリクス |
| `GET /api/seasonality` | 月別平均スコア |
| `GET /api/seasonality/insights` | **季節性インサイト（LLM動的生成）（NEW）** |
| `GET /api/insights` | 戦略インサイト |
| `GET /api/sns/mentions` | SNSブランド言及数・シェア |
| `GET /api/sns/cooccurrences` | SNS共起マトリクス（8×8） |
| `GET /api/sns/sentiments` | センチメント（ネガティブ率） |
| `GET /api/ceps` | **CEP一覧（NEW）** |
| `GET /api/ceps/brands` | **ブランド別CEPスコア（NEW）** |
| `GET /api/ceps/portfolio` | 4象限ポートフォリオ用 |
| `GET /api/sns/trends` | **週次SNS言及数トレンド（NEW）** |
| `GET /api/data/sns` | **SNS生データ（23列ラベル+フィルター対応）** |
| `GET /api/brands/[brandName]/dpt` | **DPT生成（Use Case抽出+LLMでPOP/POD生成）（NEW）** |
| `GET /api/keywords` | **関連KW一覧（NEW）** |
| `GET /api/keywords/cooccurrences` | **KW共起マトリクス（NEW）** |
| `GET /api/keywords/sankey` | **サンキー用データ（NEW）** |
| `GET /api/brands/[brandName]` | **ブランドサマリー（NEW）** |
| `GET /api/brands/[brandName]/relations` | **ブランド関連性データ（NEW）** |
| `GET /api/sns/labels?brand=xxx` | **ブランド別ラベル分布** |
| `GET /api/sns/ws-detail` | **W's詳細分布（料理/シーン/対象/動機）（NEW）** |
| `GET /api/reports/brands/[brandName]` | **ブランド別動的レポート（LLMインサイト付き）（NEW）** |
| `GET /api/personas` | **ペルソナ生成（k-meansクラスタリング+LLM）** |
| `GET /api/personas/all` | **全ブランドペルソナ一覧** |

### Supabase テーブル

| テーブル | 内容 | 件数 |
|---------|------|------|
| `brands` | ブランドマスタ | 8 |
| `weekly_trends` | 週次検索スコア | ~2,100 |
| `correlations` | ブランド間相関 | 64 |
| `seasonality` | 月別平均 | 96 |
| `insights` | 戦略インサイト | ~6 |
| `sns_mentions` | SNS言及数 | 8 |
| `sns_cooccurrences` | SNS共起 | 64 |
| `sns_sentiments` | センチメント | 8 |
| `ceps` | **CEPマスタ（NEW）** | ~12 |
| `brand_ceps` | **ブランド別CEPスコア（NEW）** | ~30 |
| `cep_contexts` | CEP詳細文脈 | - |
| `sns_posts` | **SNS生データ（23列: 基本+11種ラベル+W's詳細5種+追加6種）** | ~7,500 |
| `brand_dishes` | **ブランド別代表メニューマスタ（NEW）** | ~50 |
| `sns_weekly_trends` | **週次SNS言及数（NEW）** | ~500 |
| `related_keywords` | **関連KWマスタ（NEW）** | - |
| `keyword_cooccurrences` | **KW共起（NEW）** | - |
| `keyword_cep_mappings` | **KW→CEPマッピング（NEW）** | - |
| `brand_dpt_cache` | **DPTキャッシュ（24時間TTL）** | ~8 |
| `brand_persona_cache` | **ペルソナキャッシュ（品質メトリクス付き）** | ~8 |
| `seasonality_insights_cache` | **季節性インサイトキャッシュ（24時間TTL）（NEW）** | ~9 |

### セットアップ手順

```bash
# 1. Supabase プロジェクト作成後
cp .env.local.example .env.local
# → URL, ANON_KEY, SERVICE_ROLE_KEY を設定

# 2. スキーマ適用（Supabase SQL Editor）
# → supabase/migrations/001_initial_schema.sql を実行

# 3. データ投入
npx tsx scripts/seed-data.ts

# 4. ローカル起動
npm run dev

# 5. Vercel デプロイ
vercel --yes
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel --prod --yes
```

---

## 10. 更新履歴

- 2026-01-16: 初版作成
- 2026-01-16: ダッシュボード（dashboard/）追加
- 2026-01-16: SNS分析タブ追加（言及シェア・共起・センチメント）
- 2026-01-16: **CEP分析タブ追加（4象限ポートフォリオ・ヒートマップ・ランキング）**
- 2026-01-16: `/extract-brand-cep` スキル追加（SNSデータからブランド別CEP抽出）
- 2026-01-17: **SNS生データ表示機能追加（sns_postsテーブル、8,517件）**
- 2026-01-17: **トレンド推移タブにSNS言及数サブタブ追加**
- 2026-01-17: **関連KWタブ追加（ワードクラウド・共起マトリクス・ランキング・サンキー）**
- 2026-01-17: **SNS投稿にセンチメント・CEPラベル追加（LLM分析）**
- 2026-01-17: **マルチプロバイダー並列処理追加（OpenAI/Gemini/Claude 4並列）**
- 2026-01-17: **UGCラベリングスキーマ拡張（11種ラベル、ENUM型6種、並列処理スクリプト）**
- 2026-01-18: **ブランド詳細レポートページ追加（/brands/[brandName]、7セクション構成）**
- 2026-01-18: **W's詳細ラベリング追加（008_cep_detail.sql、5カラム、7,494件処理）**
- 2026-01-18: **W's詳細分析チャート追加（WsDetailChart.tsx、5タブ構成）**
- 2026-01-18: **生データタブ分離（GT生データ/SNS生データ）+ 全11種ラベル表示**
- 2026-01-18: **ダッシュボードUI 3セクション化（Data/Analytics/Reports）**
- 2026-01-18: **Analyticsサブカテゴリ化（総合/ブランド別）**
- 2026-01-18: **DPT（Dynamic Positioning Table）セクション追加（Use Case×POP/POD、LLM動的生成）**
- 2026-01-18: **Reportsセクション大幅改善（ブランド別動的レポート、LLMインサイト、CEP/DPT/W's統合）**
- 2026-01-18: **`/claudemd`スキル追加（CLAUDE.md自動生成・更新）**
- 2026-01-18: **Analytics UI改修（サブカテゴリ削除、ブランドセレクタを最上部に移動）**
- 2026-01-18: **Vercel + GitHub連携トラブルシューティング追加（サブディレクトリ構成）**
- 2026-01-18: **Vercel/Supabase接続トラブルシューティング（Root Directory, 環境変数, URL変更）**
- 2026-01-19: **SNS生データビューに欠落6列追加（cooking_skill, with_whom, when_detail, why_motivation, paired_keywords, author_name）**
- 2026-01-19: **エンゲージメントデータ追加（likes_count, retweets_count, impressions, reach等6カラム、50,000件インポート）**
- 2026-01-19: **鍋キューブブランド追加（id=17、84件のSNS言及）**
- 2026-01-19: **SNS週次トレンドページネーション修正（132週→212週、20,563件→34,544件）**
- 2026-01-21: **`/brushup-report`スキル追加（低品質レポートセクション検出・UGC50,000件ベースのLLM再生成）**
- 2026-01-21: **report-qualityモジュール追加（detector.ts, ugc-fetcher.ts, regenerator.ts）**
- 2026-01-22: **W's分析独立タブ追加（Analytics 9タブ目）、ブランドフィルタ機能、API動的クエリ化**
- 2026-01-22: **季節性インサイトLLM動的生成（API + コンポーネント追加、ハードコード文言置換）**
- 2026-01-22: **W's分析静的データ化（レスポンス時間1.5-3秒→50ms、ブランド別JSONファイル生成）**
- 2026-01-22: **コーポレート分析ダッシュボード追加（MVV/パーソナリティ抽出、株価×UGC相関、ファン資産可視化）**
- 2026-01-22: **コーポレートロイヤリティ機能追加（ファン資産にロイヤリティ高/中/低分布 + 代表口コミ表示）**
- 2026-01-23: **世の中分析（World Analysis）機能追加（NewsAPI連携、LLM分析、7カテゴリ分類、18件テスト取得完了）**
- 2026-01-23: **株価影響投稿改善（全件表示+整合優先ソート、ツールチップに投稿詳細表示）**
- 2026-01-28: **スパイクレポート機能追加（SpikeReport.tsx、7/28リュウジ味噌汁炎上事件、統計的スパイク検出: 平均+2σ）**
- 2026-01-28: **Vercel新プロジェクト作成（ajinomoto-dashboard）**、本番URL: https://ajinomoto-dashboard.vercel.app
- 2026-01-28: **戦略タブ追加（5つ目のタブ）** - 4タブの分析結果を統合しLLM（Gemini 2.0 Flash）で戦略提案を自動生成。コンポーネント4種（StrategySummary, ChallengeOpportunity, StrategyRecommendations, ActionPlan）、キャッシュ24時間TTL
- 2026-01-28: **戦略タブ静的ファイル化** - LLM動的生成→静的JSONファイル（`src/data/corporate-strategy/corp-1.json`）に変更。APIルート554行→28行に簡素化。更新ボタン削除
- 2026-01-28: **ロイヤリティ別顧客インサイト機能追加** - 各ロイヤリティレベル（高/中/低）に対して顧客像・関心事・声のトーン・キーワード・トピック分布を表示。LLM（Gemini 2.0 Flash）でインサイト生成 + フォールバック対応 + 24時間キャッシュ
- 2026-01-29: **ロイヤリティ別顧客インサイト本番動作確認** - Playwright E2Eテストで「ファン資産」タブの動作検証、スクリーンショット確認完了
- 2026-01-29: **ロイヤリティ別顧客インサイト マルチペルソナ化** - 「1レベル1顧客像」から「1レベル2-3ペルソナ」に拡張。PersonaCard.tsx新規作成、LoyaltySummaryReport.tsxでグリッド表示、8ペルソナデータ（高3/中3/低2）追加
- 2026-01-29: **ペルソナ拡充＋カルーセルUI** - 8→13ペルソナ（高5/中5/低3）に拡充。analyze-tribes.tsでトライブ分析、LoyaltySummaryReportにカルーセルUI追加（左右ボタン+ドットインジケーター）
- 2026-01-29: **戦略提案タブ LLM動的生成基盤** - SNS50,000件ベースのLLM動的生成インフラ実装。loyalty-growthモジュール（data-fetcher/metrics-calculator/llm-generator/cache）、Gemini 2.0 Flash + OpenAI GPT-4o-miniフォールバック、24時間TTLキャッシュ、isFallbackバッジ表示
- 2026-01-29: **Brand Personality双極軸対応** - personality_shadow追加、代替案4案をカード形式で表示（食卓の頭脳派サポーター/研究熱心な料理の相棒/食の実験者/理系の料理好きおじさん）、PersonalityAlternative型追加
- 2026-01-29: **PersonalityTraits双極軸化** - 0-100スケール → -50〜+50双極軸に変更。MVVSection.tsxにAxisScoreItem追加（左右ラベル表示）、PersonalityRadar.tsx双極軸対応

---

## 11. コーポレート分析（Corporate Analysis）

### 概要

製品ブランド分析（8ブランド、50,000 SNS投稿）を拡張し、コーポレートレベルの分析機能を提供。

### 新規DBテーブル（017_corporate_schema.sql, 022_corporate_strategy_cache.sql）

| テーブル | 用途 |
|---------|------|
| `corporate_brands` | コーポレートブランドマスタ（ticker: 2802.T） |
| `brand_hierarchy` | 製品ブランド→コーポレート階層 |
| `stock_prices` | 株価履歴（5年分、日次） |
| `corporate_mvv` | MVV/パーソナリティキャッシュ（LLM生成、7日TTL） |
| `fan_assets` | ファンセグメント（関係強度、距離） |
| `stock_ugc_correlations` | 株価×UGC相関係数（ラグ考慮） |
| `corporate_strategy_cache` | **戦略提案キャッシュ（LLM生成、24時間TTL）（NEW）** |

### 新規APIエンドポイント

| エンドポイント | 説明 |
|---------------|------|
| `GET /api/corporate/[corpId]` | サマリー（製品ブランド集計） |
| `GET /api/corporate/[corpId]/mvv` | MVV抽出（LLM: GPT-4o-mini） |
| `GET /api/corporate/[corpId]/stock` | 株価時系列 |
| `GET /api/corporate/[corpId]/stock/correlation` | 株価×UGC相関（ピアソン相関、ラグ-7〜+7日） |
| `GET /api/corporate/[corpId]/fans` | ファン資産（セグメント分類） |
| `GET /api/corporate/[corpId]/loyalty-summary` | **ロイヤリティ別顧客インサイト（LLM生成、24時間キャッシュ）（NEW）** |
| `GET /api/corporate/[corpId]/strategy` | **戦略提案（4タブ統合+LLM生成、24時間キャッシュ）** |

### 新規コンポーネント（src/components/corporate/）

| コンポーネント | 説明 |
|--------------|------|
| `MVVSection.tsx` | Mission/Vision/Purpose/Values/Personality表示 |
| `PersonalityRadar.tsx` | 5軸パーソナリティレーダー（Recharts） |
| `StockUGCChart.tsx` | 株価×UGC 2軸時系列チャート |
| `FanUrchinChart.tsx` | ウニ型ファン可視化（SVG/React） |
| `FanTireChart.tsx` | タイヤ型ファン可視化（SVG/React） |
| `CorporateLoyaltySection.tsx` | コーポレートロイヤリティ分布（円グラフ+代表口コミ） |
| `LoyaltySummaryReport.tsx` | **ロイヤリティ別顧客インサイト（顧客像・関心事・トーン・KW・トピック分布）（NEW）** |

### 新規コンポーネント（src/components/corporate-strategy/）

| コンポーネント | 説明 |
|--------------|------|
| `StrategySummary.tsx` | 4タブの要約サマリーカード |
| `ChallengeOpportunity.tsx` | 課題/機会セクション（2カラム） |
| `StrategyRecommendations.tsx` | 戦略提案カード（優先度付き、展開可能） |
| `ActionPlan.tsx` | アクションプランタイムライン（短期/中期/長期） |

### 型定義（src/types/corporate.types.ts）

| 型 | 説明 |
|----|------|
| `PersonalityTraits` | 5軸（intellect/innovation/warmth/reliability/boldness）0-100 |
| `UrchinSpine` | ウニのトゲ（angle/thickness/length/color） |
| `TireRing` | タイヤのリング（innerRadius/outerRadius） |
| `FanSegmentType` | core_fan/loyal_fan/new_fan/casual_user/at_risk/detractor |
| `LoyaltyLevel` | **'high' \| 'medium' \| 'low'（NEW）** |
| `CorporateLoyalty` | **ロイヤリティ分布データ（total/levels/representative_posts）（NEW）** |
| `StrategyInput` | **戦略入力（UGC/株価/ファン/世の中の集約データ）（NEW）** |
| `StrategyOutput` | **戦略出力（strengths/challenges/opportunities/recommendations/actionPlan）（NEW）** |
| `StrategyResponse` | 戦略APIレスポンス全体（input/strategy/generatedAt/cached） |
| `TopicDistribution` | **トピック分布（topic/topicLabel/count/percentage/color）（NEW）** |
| `LoyaltySummaryInsight` | **ロイヤリティ別インサイト（顧客像/関心事/トーン/KW/トピック分布）（NEW）** |
| `LoyaltySummaryResponse` | **ロイヤリティサマリーAPIレスポンス（insights/generatedAt/cached）（NEW）** |

### コーポレートロイヤリティ

コーポレート投稿（is_corporate=true）のセンチメントに基づくロイヤリティ分類。

| ロイヤリティ | 条件 | 件数 | 割合 |
|------------|------|------|------|
| 高 | sentiment='positive' | 2,548件 | 27.0% |
| 中 | sentiment='neutral' | 6,503件 | 68.8% |
| 低 | sentiment='negative' | 395件 | 4.2% |

各ロイヤリティレベルに代表口コミ5件（いいね数上位）を表示。

### ファン可視化メタファー

| 可視化 | 説明 |
|--------|------|
| **ウニ（Sea Urchin）** | 中心=ブランド、トゲ=ファン関係、太いトゲ=強い関係、短いトゲ=親密 |
| **タイヤ（Tire）** | 内側リング=コアファン、外側=ライトファン、幅=ユーザー数 |

### アクセス

- `/corporate/1` - 味の素株式会社のコーポレートダッシュボード（5タブ: UGC分析/株価×UGC/ファン資産/世の中分析/戦略提案）
- メインページ「Corporate分析」ボタンからリンク
- **本番URL**: https://ajinomoto-dashboard.vercel.app/corporate/1

---

## 13. トラブルシューティング

### Supabaseデフォルト行制限（1000行）

**症状**: `select()`で1000件しか取得できない、週次トレンドが途中で切れる

**原因**: Supabaseのデフォルト制限は1000行

**解決方法**:
```typescript
// ページネーションで全件取得
const PAGE_SIZE = 1000;
let offset = 0;
let hasMore = true;
const allData = [];

while (hasMore) {
  const { data } = await supabase
    .from("table")
    .select("*")
    .range(offset, offset + PAGE_SIZE - 1);

  if (data && data.length > 0) {
    allData.push(...data);
    offset += PAGE_SIZE;
  }
  hasMore = data && data.length === PAGE_SIZE;
}
```

**影響を受けたファイル**:
- `scripts/recalc-weekly-trends.ts` - 50,033件の投稿取得
- `src/app/api/sns/trends/route.ts` - 1,601件の週次トレンド取得

---

### Vercel Root Directory 二重パス問題

**症状**: 動的ルート（`/brands/[brandName]`）が本番で404になる

**原因**: Vercel Project SettingsのRoot Directoryが`dashboard/dashboard`と二重になっていた

**調査方法**:
```bash
# デプロイログ確認
vercel inspect <deployment-url> --logs

# ビルド出力確認（Routeセクション）
# ● /brands/[brandName] が表示されているか確認
```

**解決方法**:
1. 既存プロジェクトを削除: `vercel project rm <project-name>`
2. 正しいディレクトリから再リンク:
```bash
cd dashboard
vercel --yes  # Root Directory設定なしで自動検出
```

**予防策**:
- `vercel.json`をプロジェクトルートに置かない（UIとの競合を避ける）
- 新規プロジェクト作成時は必ずRoot Directoryを確認

---

### 環境変数の改行文字混入

**症状**: Supabase接続エラー「TypeError: fetch failed」

**原因**: 環境変数に`\n`（リテラル文字列）が混入

**調査方法**:
```bash
vercel env ls  # 変数一覧
# 値の確認はできないが、設定されているかは分かる
```

**解決方法**:
```bash
# 既存の環境変数を削除
vercel env rm VARIABLE_NAME production

# heredocで正しく追加（改行なし）
vercel env add VARIABLE_NAME production << 'EOF'
actual_value_here
EOF
```

**予防策**:
- 環境変数追加時は必ずheredoc形式を使用
- コピペ時に改行が入らないよう注意
- 設定後は必ずAPIエンドポイントで動作確認

---

### Supabaseプロジェクト変更

**症状**: 「fetch failed」または「relation does not exist」エラー

**原因**: Supabaseプロジェクトが一時停止/削除された、または新規プロジェクトに移行した

**調査方法**:
```bash
# .env.localのURLを確認
cat .env.local | grep SUPABASE_URL

# curlで直接確認
curl -s "https://<project-ref>.supabase.co/rest/v1/" \
  -H "apikey: <anon-key>" \
  -H "Authorization: Bearer <anon-key>"
```

**解決方法**:
1. Supabaseダッシュボードで新しいプロジェクトURLを確認
2. `.env.local`を更新
3. Vercel環境変数も更新:
```bash
vercel env rm NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production << 'EOF'
https://new-project-ref.supabase.co
EOF
# ANON_KEY, SERVICE_ROLE_KEYも同様に更新
```

**予防策**:
- Supabaseプロジェクトの稼働状態を定期確認
- 環境変数は`.env.local.example`にプレースホルダーを記載
- 重要なプロジェクトは無料枠での自動停止に注意

---

### generateStaticParams 二重エンコーディング

**症状**: 日本語パスの動的ルートが404になる（`/brands/ほんだし`）

**原因**: `generateStaticParams`で`encodeURIComponent`を使用すると、Next.jsが再度エンコードして二重エンコードになる

**問題のあるコード**:
```typescript
// NG: 二重エンコード
export async function generateStaticParams() {
  return VALID_BRANDS.map((brand) => ({
    brandName: encodeURIComponent(brand),  // ← 不要
  }));
}
```

**解決方法**:
```typescript
// OK: Next.jsが自動でエンコード
export async function generateStaticParams() {
  return VALID_BRANDS.map((brand) => ({
    brandName: brand,  // そのまま渡す
  }));
}
```

**予防策**:
- `generateStaticParams`では生の値を返す
- URL構築時のみ`encodeURIComponent`を使用
- ビルドログで生成されたパスを確認

---

### 本番環境の確認チェックリスト

デプロイ後に以下を確認:

```bash
# 1. 静的ページ
curl -s -o /dev/null -w "%{http_code}" "https://<domain>/"

# 2. 動的ルート（日本語）
curl -s -o /dev/null -w "%{http_code}" "https://<domain>/brands/%E3%81%BB%E3%82%93%E3%81%A0%E3%81%97"

# 3. APIエンドポイント
curl -s "https://<domain>/api/sns/mentions" | head -c 500

# 4. 認証が必要なAPI（SERVICE_ROLE_KEY使用）
curl -s "https://<domain>/api/brands/%E3%81%BB%E3%82%93%E3%81%A0%E3%81%97/dpt" | head -c 500
```

すべて200/正常なJSONが返ることを確認。

---

### Vercel + GitHub連携（サブディレクトリ構成）

**状況**: GitHubリポジトリのサブディレクトリにNext.jsアプリがある場合の連携

```
DynamicBranding/           ← GitHubリポジトリ
├── dashboard/             ← Next.jsアプリ（サブディレクトリ）
│   ├── src/
│   ├── package.json
│   └── .vercel/
├── CLAUDE.md
└── ...
```

**連携手順**:

1. **GitHub連携**
   - Vercel Project Settings > Git > 「Connect」
   - リポジトリを選択（プライベート/鍵マークでもOK）

2. **Root Directory設定（重要）**
   - Settings > General > Root Directory に `dashboard` を入力
   - **これを忘れるとビルドが即エラー（0ms終了）**

3. **再デプロイのトリガー**
   - 設定変更後は再デプロイが必要
   - 方法1: Vercel UI > Deployments > 「...」 > Redeploy
   - 方法2: 空コミットでプッシュ
     ```bash
     git commit --allow-empty -m "chore: trigger deployment"
     git push origin main
     ```

4. **Deployment Protection（401エラー時）**
   - 連携後にURLアクセスで401が返る場合
   - Settings > Deployment Protection で設定確認
   - 「Vercel Authentication」を無効化、または別のエイリアスURLを使用

**確認コマンド**:

```bash
# デプロイ一覧確認（dashboardディレクトリから実行）
cd dashboard && vercel ls

# デプロイ詳細確認
vercel inspect <deployment-url>

# プロジェクト一覧
vercel project ls

# GitHub連携確認（aliasにgit-mainが含まれていればOK）
# Aliases:
#   ╶ https://dashboard-git-main-xxx.vercel.app  ← これがあれば連携済み
```

**よくある問題**:

| 症状 | 原因 | 解決 |
|------|------|------|
| ビルド0ms終了 | Root Directory未設定 | `dashboard`を設定 |
| 401 Unauthorized | Deployment Protection | 設定で無効化 or 別URLを使用 |
| CLIからデプロイ失敗 | ローカル設定と競合 | `git push`で自動デプロイ推奨 |
| 「path does not exist」 | 二重パス（dashboard/dashboard） | プロジェクト再作成 |

**本番URL例**:
- Production: `https://ajinomoto-dashboard.vercel.app`
- Git連携: `https://dashboard-git-main-xxx.vercel.app`（自動生成）

---

## 14. グローバルClaude Code設定

グローバル設定（`~/.claude/`）の詳細は **[docs/CLAUDE_CODE_CONFIG.md](docs/CLAUDE_CODE_CONFIG.md)** を参照。

### 設定概要

| カテゴリ | 数 | 説明 |
|---------|-----|------|
| **Agents** | 18個 | 専門タスク用AIエージェント |
| **Commands** | 30個 | スラッシュコマンド（`/xxx`） |
| **Rules** | 8個 | 常時適用ガイドライン |
| **Skills** | 7個 | 詳細ワークフロー・パターン集 |

### 主要コマンド

| コマンド | 説明 |
|---------|------|
| `/tdd` | TDD（テスト駆動開発）ワークフロー |
| `/code-review` | コードレビュー実行 |
| `/e2e` | E2Eテスト生成・実行 |
| `/handoff` | セッション終了時の状態保存 |
| `/resume` | セッション再開 |
| `/quick-commit` | 高速コミット |

### 推奨ワークフロー

```
/plan → /tdd → /code-review → /quick-commit → /deploy-verify
```
