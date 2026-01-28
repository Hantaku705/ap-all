# api/

## 概要

Next.js API Routes。Supabaseからデータを取得しフロントエンドに提供。

## ディレクトリ構成

| ディレクトリ | 説明 |
|-------------|------|
| `sns/` | SNS分析API |
| `ceps/` | CEP分析API |
| `keywords/` | 関連KW分析API |
| `data/` | 生データAPI |
| `reports/` | レポート管理API |
| `corporate/` | コーポレート分析API |

## ファイル一覧

### ルート直下

| ファイル | エンドポイント | 説明 |
|---------|---------------|------|
| `trends/route.ts` | `GET /api/trends` | 週次Google Trendsデータ |
| `correlations/route.ts` | `GET /api/correlations` | ブランド間相関マトリクス |
| `seasonality/route.ts` | `GET /api/seasonality` | 月別平均スコア |
| `insights/route.ts` | `GET /api/insights` | 戦略インサイト |
| `chat/route.ts` | `POST /api/chat` | AIチャット（Claude） |

### sns/ - SNS分析API

| ファイル | エンドポイント | 説明 |
|---------|---------------|------|
| `sns/mentions/route.ts` | `GET /api/sns/mentions` | ブランド別言及数・シェア |
| `sns/cooccurrences/route.ts` | `GET /api/sns/cooccurrences` | ブランド間共起マトリクス |
| `sns/sentiments/route.ts` | `GET /api/sns/sentiments` | センチメント分析 |
| `sns/trends/route.ts` | `GET /api/sns/trends` | 週次SNS言及数トレンド |

### ceps/ - CEP分析API

| ファイル | エンドポイント | 説明 |
|---------|---------------|------|
| `ceps/route.ts` | `GET /api/ceps` | CEP一覧 |
| `ceps/brands/route.ts` | `GET /api/ceps/brands` | ブランド別CEPスコア |
| `ceps/portfolio/route.ts` | `GET /api/ceps/portfolio` | 4象限ポートフォリオ用データ |

### keywords/ - 関連KW分析API

| ファイル | エンドポイント | 説明 |
|---------|---------------|------|
| `keywords/route.ts` | `GET /api/keywords` | 関連KW一覧 |
| `keywords/cooccurrences/route.ts` | `GET /api/keywords/cooccurrences` | KW共起マトリクス |
| `keywords/sankey/route.ts` | `GET /api/keywords/sankey` | ブランド→KW→CEPサンキー用データ |

### data/ - 生データAPI

| ファイル | エンドポイント | 説明 |
|---------|---------------|------|
| `data/google-trends/route.ts` | `GET /api/data/google-trends` | Google Trends生データ |
| `data/sns/route.ts` | `GET /api/data/sns` | SNS投稿生データ |

### reports/ - レポート管理API

| ファイル | エンドポイント | 説明 |
|---------|---------------|------|
| `reports/route.ts` | `GET/POST /api/reports` | レポート一覧・作成 |
| `reports/[id]/route.ts` | `GET/PUT/DELETE /api/reports/:id` | レポート詳細・更新・削除 |

### corporate/ - コーポレート分析API

| ファイル | エンドポイント | 説明 |
|---------|---------------|------|
| `corporate/[corpId]/route.ts` | `GET /api/corporate/:id` | コーポレートサマリー |
| `corporate/[corpId]/mvv/route.ts` | `GET /api/corporate/:id/mvv` | MVV抽出（LLM生成） |
| `corporate/[corpId]/stock/route.ts` | `GET /api/corporate/:id/stock` | 株価時系列 |
| `corporate/[corpId]/fans/route.ts` | `GET /api/corporate/:id/fans` | ファン資産（ロイヤリティ分布） |
| `corporate/[corpId]/loyalty-summary/route.ts` | `GET /api/corporate/:id/loyalty-summary` | **ロイヤリティ別顧客インサイト（NEW）** |
| `corporate/[corpId]/strategy/route.ts` | `GET /api/corporate/:id/strategy` | 戦略提案 |
| `corporate/[corpId]/world-news/route.ts` | `GET /api/corporate/:id/world-news` | 世の中分析ニュース |

## API共通パターン

```typescript
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('table').select('*')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
```

## 関連ディレクトリ

- `../` - app/ルート
- `../../lib/supabase/` - Supabaseクライアント

## 注意事項

- Server Componentからの呼び出しには `createClient()` を使用
- エラーハンドリングは必ず行い、適切なHTTPステータスコードを返す
