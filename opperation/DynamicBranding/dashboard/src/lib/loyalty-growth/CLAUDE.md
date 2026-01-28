# loyalty-growth/

## 概要

ロイヤリティ成長戦略のLLM動的生成モジュール。SNS投稿データからデータドリブンな戦略提案を自動生成。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `types.ts` | 型定義（RPC戻り値、LLM入出力、APIレスポンス） |
| `data-fetcher.ts` | Supabase RPC呼び出し（5種の集計関数） |
| `metrics-calculator.ts` | 生データからメトリクス算出（トレンド傾き、転換率推定等） |
| `llm-generator.ts` | LLMプロンプト構築・Gemini/OpenAI呼び出し |
| `cache.ts` | キャッシュ操作（24時間TTL、入力ハッシュ検証） |
| `index.ts` | バレルエクスポート |

## データフロー

```
sns_posts (50,000件)
    ↓
Supabase RPC (5種の集計関数)
    ↓
data-fetcher.ts
    ↓
metrics-calculator.ts (メトリクス算出)
    ↓
llm-generator.ts (Gemini 2.0 Flash)
    ↓
cache.ts (24時間キャッシュ)
    ↓
API Response
```

## RPC関数（024_loyalty_growth_rpc.sql）

| 関数名 | 説明 |
|--------|------|
| `get_corporate_loyalty_distribution()` | ロイヤリティ分布（positive/neutral/negative） |
| `get_topic_engagement_by_loyalty()` | トピック×エンゲージメント（ロイヤリティ層別） |
| `get_weekly_loyalty_trends()` | 週次トレンド（直近24週） |
| `get_representative_posts(limit)` | 代表投稿（各層上位N件） |
| `get_topic_loyalty_correlation()` | トピック×ロイヤリティ相関 |

## 算出メトリクス

| メトリクス | 説明 |
|-----------|------|
| `trendDirection` | トレンド方向（improving/stable/declining） |
| `trendSlope` | 高/中/低ロイヤリティの週次傾き（%/週） |
| `avgEngagementByLevel` | 各レベルの平均エンゲージメント |
| `topPerformingTopics` | 高パフォーマンストピック（上位5件） |
| `estimatedConversionRates` | 推定転換率（低→中、中→高） |

## LLM出力構造

| コンポーネント | 説明 |
|--------------|------|
| `conversionFunnels` | 転換ファネル（低→中、中→高、高→中） |
| `behavioralPatterns` | 行動パターン（各レベルの特性） |
| `growthTargets` | 成長目標（現状+目標+タイムライン） |
| `recommendations` | 戦略提案（3-5件、代表投稿引用付き） |

## キャッシュ戦略

- **TTL**: 24時間
- **検証**: 入力データのハッシュ値で変化を検出
- **無効化**: 入力データ変化時に自動無効化
- **フォールバック**: LLM失敗時は静的JSON（`corp-1-growth.json`）

## 関連ファイル

- `../../app/api/corporate/[corpId]/loyalty-growth/route.ts` - APIエンドポイント
- `../../components/loyalty-growth/` - 表示コンポーネント（6種）
- `../../data/corporate-loyalty/corp-1-growth.json` - フォールバック静的データ
- `../../../supabase/migrations/023_loyalty_growth_cache.sql` - キャッシュテーブル
- `../../../supabase/migrations/024_loyalty_growth_rpc.sql` - RPC関数

## 使用方法

```typescript
import {
  fetchAllLoyaltyGrowthData,
  transformToLLMInput,
  generateInputHash,
  generateLoyaltyGrowthStrategy,
  getCachedLoyaltyGrowth,
  saveLoyaltyGrowthCache,
} from "@/lib/loyalty-growth";

// 1. データ取得
const rawData = await fetchAllLoyaltyGrowthData();

// 2. メトリクス算出
const input = transformToLLMInput(rawData);
const inputHash = generateInputHash(input);

// 3. キャッシュ確認
const cached = await getCachedLoyaltyGrowth(corpId, inputHash);
if (cached) return cached;

// 4. LLM生成
const { output, model } = await generateLoyaltyGrowthStrategy(input);

// 5. キャッシュ保存
await saveLoyaltyGrowthCache(corpId, output, model, inputHash);
```

## 注意事項

- Gemini優先、OpenAIフォールバック
- 入力データ変化時はキャッシュが自動無効化される
- LLM失敗時は静的JSONで応答（`isFallback: true`フラグ付き）

## 更新履歴

- 2026-01-29: 初版作成（LLM動的生成モジュール）
