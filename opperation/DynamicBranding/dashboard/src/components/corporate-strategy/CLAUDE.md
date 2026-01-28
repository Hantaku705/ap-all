# corporate-strategy/

## 概要

戦略提案タブ用コンポーネント。4タブ（UGC/株価/ファン/世の中）のデータを統合し、LLM生成の戦略提案を表示。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `StrategySummary.tsx` | 4タブの要約サマリーカード |
| `ChallengeOpportunity.tsx` | 課題/機会セクション（2カラム） |
| `StrategyRecommendations.tsx` | 戦略提案カード（優先度付き、展開可能） |
| `ActionPlan.tsx` | アクションプランタイムライン（短期/中期/長期） |
| `index.ts` | バレルエクスポート |

## データソース

| コンポーネント | API |
|--------------|-----|
| 全コンポーネント | `/api/corporate/[corpId]/strategy` |

## 型定義

`@/types/corporate.types.ts`:
- `StrategyInput` - 入力データ（4タブの集約）
- `StrategyOutput` - 戦略出力（strengths, challenges, opportunities, recommendations, actionPlan）
- `StrategyResponse` - APIレスポンス全体

## 関連ディレクトリ

- `../corporate/` - 他のコーポレートコンポーネント
- `../../app/corporate/` - コーポレートダッシュボードページ
- `../../app/api/corporate/[corpId]/strategy/` - Strategy API Route

## 注意事項

- すべてのコンポーネントに `"use client"` ディレクティブが必要
- 親コンポーネントでデータfetchを行い、propsとして各コンポーネントに渡す
- キャッシュ24時間TTL（API側で管理）

## 更新履歴

- 2026-01-28: 初版作成
