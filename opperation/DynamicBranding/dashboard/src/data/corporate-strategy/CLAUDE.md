# corporate-strategy/ - コーポレート戦略提案データ

## 概要

コーポレート分析ダッシュボードの戦略提案タブで使用する静的データ。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `corp-1.json` | 味の素株式会社（corpId=1）の戦略提案データ |

## データ構造

```typescript
{
  input: {
    ugc: { totalPosts, positiveRate, topTopics, recentSpikes, sentimentTrend },
    stockCorrelation: { coefficient, optimalLag, significance },
    loyalty: { high, medium, low, trend },
    worldNews: { topCategories, emergingTrends, competitorMoves }
  },
  strategy: {
    strengths: string[],
    challenges: Challenge[],
    opportunities: Opportunity[],
    recommendations: Recommendation[],
    actionPlan: { shortTerm, midTerm, longTerm }
  },
  generatedAt: string,
  model: "static"
}
```

## 使用箇所

| API | パス |
|-----|------|
| Strategy API | `/api/corporate/[corpId]/strategy/route.ts` |

## 更新方法

1. JSONファイルを編集
2. git push
3. Vercel自動デプロイで反映

## 更新履歴

- 2026-01-28: 初版作成（LLM動的生成→静的ファイル化）
