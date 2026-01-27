# dashboard/scripts/ - スクリプト集

データ取得・投入・分析用のTypeScriptスクリプト群。

---

## マルチプロバイダー並列処理

### label-ugc-multi.ts（推奨）

**目的**: 4つのLLMプロバイダーを並列化してUGCラベリングを高速処理

**実行コマンド**:
```bash
cd /Users/hantaku/Downloads/DynamicBranding/dashboard
npx tsx scripts/label-ugc-multi.ts
```

**オプション**:
```bash
# 件数制限（テスト用）
npx tsx scripts/label-ugc-multi.ts --limit 100

# ドライラン（DB更新なし）
npx tsx scripts/label-ugc-multi.ts --dry-run
```

**プロバイダー構成（5並列）**:

| プロバイダー | モデル | 平均処理時間 | 環境変数 |
|-------------|--------|-------------|----------|
| Gemini | gemini-2.0-flash | 10.6秒/バッチ（最速） | `GEMINI_API_KEY` |
| Claude-takumi | claude-3-haiku-20240307 | 15.8秒/バッチ | `ANTHROPIC_API_KEY_TAKUMI` |
| Claude-bcm | claude-3-haiku-20240307 | 20.6秒/バッチ | `ANTHROPIC_API_KEY_BCM` |
| OpenAI-takumi | gpt-4o-mini | 36.5秒/バッチ | `OPENAI_API_KEYS` |
| OpenAI-bcm | gpt-4o-mini | 36.5秒/バッチ（推定） | `OPENAI_API_KEY_BCM` |

**パフォーマンス**:

| 指標 | 値 |
|------|-----|
| スループット | ~3.3件/秒（推定） |
| バッチサイズ | 20件 |
| 1プロバイダー比 | **約2倍高速** |

**進捗管理**:
- 進捗ファイル: `.label-multi-progress.json`
- 中断しても自動的に続きから再開
- プロバイダー別統計を表示

**出力ラベル**:
- `sentiment`: positive / neutral / negative
- `cep_category`: 12種類のCEP（time_saving_weeknight等）
- `intent`: usage_report / recipe_share / question / complaint / purchase_consider / other

**スケーリング**:
- 10プロバイダーなら約2.5倍高速化の可能性
- 同一アカウントの複数キーは効果なし（レート制限共有）
- 独立したアカウントが必要

---

## その他のラベリングスクリプト

| スクリプト | 用途 | 備考 |
|-----------|------|------|
| `label-ugc-parallel.ts` | OpenAI 5キー並列版 | レート制限共有で効果薄い |
| `label-ugc-posts.ts` | Gemini単体版 | シンプルだが低速 |
| `label-ugc-detail.ts` | W's詳細ラベリング（料理/シーン/対象/動機） | 5カラム追加 |
| `label-orchestrator.ts` | ソース別オーケストレーター | 未使用 |
| `analyze-sns-posts.ts` | センチメント・CEP分析（旧版） | label-ugc-multi.tsに統合 |

---

## データ取得スクリプト

| スクリプト | 用途 | API |
|-----------|------|-----|
| `fetch-trends-serpapi.ts` | Google Trends取得 | SerpAPI |
| `fetch-trends-individual.ts` | 個別ブランドTrends取得 | SerpAPI |
| `fetch-google-trends.ts` | Playwright版Trends取得 | 直接スクレイピング（429エラー注意） |
| `fetch-related-keywords.ts` | 関連KW取得 | SerpAPI |

---

## データ投入スクリプト

| スクリプト | 用途 | 対象テーブル |
|-----------|------|-------------|
| `seed-data.ts` | 初期データ投入 | brands, weekly_trends, correlations, seasonality, insights |
| `seed-sns-data.ts` | SNS集計データ投入 | sns_mentions, sns_cooccurrences, sns_sentiments |
| `seed-sns-posts.ts` | SNS生データ投入 | sns_posts, sns_weekly_trends |
| `seed-cep-data.ts` | CEPデータ投入 | ceps, brand_ceps |

---

## DB管理スクリプト

| スクリプト | 用途 |
|-----------|------|
| `apply-migration.ts` | Supabase Management API経由でマイグレーション適用 |
| `apply-schema.ts` | スキーマ適用（旧版） |
| `exec-sql.ts` | 任意のSQL実行 |
| `check-ceps.ts` | CEPデータ確認 |
| `recalc-weekly-trends.ts` | 週次トレンド再計算 |
| `test-dpt.ts` | DPT生成APIテスト |

---

## 環境変数（.env.local）

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ACCESS_TOKEN=sbp_...

# LLM API（5並列処理用）
OPENAI_API_KEYS=sk-proj-...,sk-proj-...  # カンマ区切り（takumiアカウント）
OPENAI_API_KEY_BCM=sk-proj-...           # 別アカウント
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY_BCM=sk-ant-...
ANTHROPIC_API_KEY_TAKUMI=sk-ant-...

# SerpAPI
SERPAPI_KEY=...
```

---

## 更新履歴

- 2026-01-17: 初版作成（マルチプロバイダー並列処理ドキュメント）
