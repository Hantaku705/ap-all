# clustering/

## 概要

k-meansクラスタリングによるペルソナ分析機能。SNS投稿を属性ベースでクラスタリングし、統計的に信頼性のあるペルソナを生成する。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `feature-encoder.ts` | カテゴリ属性→数値ベクトル変換（one-hot encoding） |
| `kmeans.ts` | ml-kmeansラッパー、クラスター生成・統計計算 |
| `quality-metrics.ts` | シルエットスコア・品質メトリクス計算 |
| `index.ts` | バレルエクスポート |

## アーキテクチャ

```
SNS投稿 (sns_posts)
    ↓
feature-encoder.ts: 6属性 → 38次元one-hotベクトル
    ↓
kmeans.ts: ml-kmeans実行（K=3〜5）
    ↓
quality-metrics.ts: シルエットスコア・unknown率計算
    ↓
/api/personas/route.ts: LLMでペルソナ名・説明生成
```

## エンコード属性

| 属性 | カテゴリ数 | 説明 |
|------|----------|------|
| `life_stage` | 6 | single, couple, child_raising, empty_nest, senior, unknown |
| `cooking_skill` | 4 | beginner, intermediate, advanced, unknown |
| `motivation_category` | 8 | time_saving, health, taste, variety, budget, convenience, entertainment, unknown |
| `meal_occasion` | 7 | weeknight, weekend, special, lunch, breakfast, snack, unknown |
| `cooking_for` | 5 | self, family, kids, guests, unknown |
| `emotion` | 8 | stress, satisfaction, anxiety, joy, neutral, frustration, excitement, unknown |

## 品質メトリクス

| メトリクス | 範囲 | 意味 |
|-----------|------|------|
| `silhouetteScore` | -1〜1 | クラスター分離度（高いほど良い） |
| `unknownRates` | 0-100% | 各属性のunknown率 |
| `dataCompleteness` | 0-100% | データ完全性 |
| `overallConfidence` | 0-100% | 総合信頼度 |

## 使用例

```typescript
import { runKMeans, calculateQualityMetrics } from "@/lib/clustering";

const posts = await fetchPosts();
const clusteringResult = await runKMeans(posts, { minK: 3, maxK: 5 });
const quality = calculateQualityMetrics(posts, clusteringResult);
```

## 関連ファイル

- `../../app/api/personas/route.ts` - ペルソナ生成API（クラスタリング使用元）
- `../../components/charts/PersonaQualityIndicator.tsx` - 品質表示UI
- `../../types/persona.types.ts` - ClusteringQuality型定義

## 注意事項

- `ml-kmeans`ライブラリはESM named export（`import { kmeans } from "ml-kmeans"`）
- クラスタリング失敗時はレガシー方式にフォールバック
- 最低30件の投稿がないとクラスタリングできない
