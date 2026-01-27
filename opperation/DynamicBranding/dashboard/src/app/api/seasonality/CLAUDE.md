# seasonality/

## 概要

季節性分析API Route。月別の検索トレンドパターンを提供。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `route.ts` | GET /api/seasonality - 月別平均スコア取得 |

## エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/seasonality` | 8ブランド×12ヶ月の季節性データ |

## レスポンス形式

```typescript
interface Seasonality {
  brand: string;
  month: number; // 1-12
  avg_score: number;
}
```

## データソース

- `seasonality` テーブル（Supabase）
- 元データ: Google Trends 5年分の月別平均

## 関連ディレクトリ

- `../` - api/ルート
- `../../../../components/charts/SeasonalityChart.tsx` - 可視化コンポーネント

## 注意事項

- 「ほんだし」「コンソメ」は冬場（11-12月）にピーク
- 「クックドゥ」は通年安定
