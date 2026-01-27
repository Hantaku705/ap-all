# data/

## 概要

生データAPI Routes。Google TrendsとSNS投稿の生データを提供。

## ファイル一覧

| ファイル | エンドポイント | 説明 |
|---------|---------------|------|
| `google-trends/route.ts` | `GET /api/data/google-trends` | Google Trends生データ |
| `sns/route.ts` | `GET /api/data/sns` | SNS投稿生データ（Supabase経由） |

## SNS投稿データ構造

```typescript
interface SNSPost {
  id: string
  source: string          // twitter, blog, news, etc.
  author_name: string
  content: string
  post_date: string
  brand_mentions: string[] // 言及ブランド
  sentiment?: string       // positive, neutral, negative
  cep_id?: string         // 関連CEP
  // 11種ラベル（LLM分析結果）
  label_product?: string
  label_emotion?: string
  label_purpose?: string
  // ...
}
```

## クエリパラメータ

| パラメータ | 説明 |
|-----------|------|
| `brand` | ブランドでフィルタ |
| `source` | ソースでフィルタ |
| `limit` | 取得件数制限 |
| `offset` | ページネーション |

## 関連ディレクトリ

- `../` - api/ルート
- `../../../../scripts/seed-sns-posts.ts` - SNSデータ投入

## 注意事項

- 大量データ取得時はページネーションを使用
- フィルタなしの全件取得は避ける
