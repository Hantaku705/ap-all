# dpt/

## 概要

DPT（Dynamic Positioning Table）サマリーAPI Route。全ブランドのDPT生成状況を一覧で提供。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `route.ts` | GET /api/dpt - 全ブランドDPTサマリー取得 |

## エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/dpt` | 8ブランドのDPT生成状況一覧 |

## レスポンス形式

```typescript
interface DPTSummary {
  brandName: string;
  brandId: number;
  useCaseCount: number;
  postCount: number;
  topUseCase: string | null;
  generatedAt: string | null;
  isExpired: boolean;
  isGenerated: boolean;
}
```

## データソース

- `brand_dpt_cache` テーブル（キャッシュ、24時間TTL）
- `brands` テーブル（ブランドマスタ）

## 関連ディレクトリ

- `../` - api/ルート
- `../brands/[brandName]/dpt/` - 個別ブランドDPT生成API
- `../../../../components/charts/DPTSummaryTable.tsx` - 可視化コンポーネント

## 注意事項

- キャッシュが期限切れの場合は `isExpired: true`
- 未生成ブランドは `isGenerated: false`
