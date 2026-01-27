# insights/

## 概要

戦略インサイトAPI Route。分析結果に基づくインサイトを提供。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `route.ts` | GET /api/insights - インサイト一覧取得 |

## エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/insights` | 戦略インサイト一覧（納得性付き） |

## レスポンス形式

```typescript
interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'correlation' | 'seasonality' | 'strategy' | 'risk';
  confidence: 'A' | 'B' | 'C';
  confidence_reason: string;
  related_brands: string[];
  action_items: string[];
}
```

## データソース

- `insights` テーブル（Supabase）

## 関連ディレクトリ

- `../` - api/ルート
- `../../../../components/insights/` - インサイトUIコンポーネント

## 注意事項

- インサイトは手動入力またはAI生成
- 納得性（confidence）はA/B/Cの3段階
