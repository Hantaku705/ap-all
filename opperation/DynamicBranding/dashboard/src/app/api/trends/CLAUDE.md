# trends/

## 概要

トレンド分析API Route。Google Trends週次データを提供。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `route.ts` | GET /api/trends - 週次トレンドデータ取得 |

## エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/trends` | 262週分の週次検索スコア |

## レスポンス形式

```typescript
interface TrendData {
  week: string; // ISO 8601形式
  brand: string;
  score: number; // 0-100
}
```

## データソース

- `weekly_trends` テーブル（Supabase）
- 元データ: Google Trends API（5年分）

## 関連ディレクトリ

- `../` - api/ルート
- `../../../../components/charts/TrendLineChart.tsx` - 可視化コンポーネント

## 注意事項

- スコアは相対値（最大週を100として正規化）
- 低ボリュームブランド（丸鶏がらスープ等）はスコアが低い傾向
