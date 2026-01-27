# correlations/

## 概要

ブランド間相関分析API Route。Google Trendsデータに基づく相関係数を提供。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `route.ts` | GET /api/correlations - 相関マトリクス取得 |

## エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/correlations` | 8×8ブランド間相関マトリクス |

## レスポンス形式

```typescript
interface Correlation {
  brand_a: string;
  brand_b: string;
  coefficient: number; // -1.0 ~ 1.0
}
```

## データソース

- `correlations` テーブル（Supabase）
- 元データ: Google Trends 262週分

## 関連ディレクトリ

- `../` - api/ルート
- `../../../../components/charts/CorrelationHeatmap.tsx` - 可視化コンポーネント

## 注意事項

- 相関係数は事前計算済み（週次バッチ）
- 対角線は1.0（自己相関）
