# migrations/

## 概要

Supabase PostgreSQLのスキーマ進化を管理するマイグレーションファイル。

## ファイル一覧

| ファイル | 説明 | 主要テーブル |
|---------|------|-------------|
| `001_initial_schema.sql` | 初期スキーマ（Google Trends） | brands, weekly_trends, correlations, seasonality, insights |
| `002_sns_schema.sql` | SNS分析スキーマ | sns_mentions, sns_cooccurrences, sns_sentiments |
| `003_cep_schema.sql` | CEP分析スキーマ | ceps, brand_ceps, cep_contexts |
| `004_sns_posts_schema.sql` | SNS投稿生データスキーマ | sns_posts |
| `005_keywords_schema.sql` | 関連KWスキーマ | related_keywords, keyword_cooccurrences, keyword_cep_mappings |
| `006_sns_analysis.sql` | センチメント・CEP分析拡張 | sns_posts拡張（sentiment, cep_id等） |
| `007_ugc_labels.sql` | UGCラベリング拡張 | sns_posts拡張（11種ラベル、ENUM型6種） |
| `008_cep_detail.sql` | W's詳細化 | sns_posts拡張（dish_category, meal_occasion等5カラム） |
| `009_dpt_cache.sql` | DPTキャッシュ | brand_dpt_cache（24時間TTL） |
| `020_corporate_world_news.sql` | 世の中分析 | corporate_world_news, corporate_news_categories, corporate_news_fetch_log |

## スキーマ進化

```
001: Google Trends基盤
 ↓
002: SNS言及数・共起・センチメント
 ↓
003: CEP（Category Entry Point）分析
 ↓
004: SNS投稿生データ
 ↓
005: 関連キーワード・サンキー
 ↓
006: LLM分析結果格納
 ↓
007: マルチプロバイダーラベリング拡張
 ↓
008: W's詳細化（料理/シーン/対象/動機）
 ↓
009: DPTキャッシュ（24時間TTL）
 ↓
020: 世の中分析（コーポレートニュース）
```

## 適用方法

```bash
# Supabase SQL Editorで実行
# または
npx tsx scripts/apply-migration.ts 007
```

## 関連ディレクトリ

- `../` - supabase/ルート
- `../../scripts/` - seed/apply スクリプト

## 注意事項

- ファイル番号は連番で管理（001, 002, ...）
- 既存テーブルの変更は `ALTER TABLE` を使用
- RLSポリシーは `DROP IF EXISTS` → `CREATE` パターンで上書き
