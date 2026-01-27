# supabase/

## 概要

Supabaseクライアント。Server ComponentsとClient Componentsで使い分け。

## ファイル一覧

| ファイル | 説明 | 使用箇所 |
|---------|------|---------|
| `client.ts` | ブラウザ用クライアント | Client Components |
| `server.ts` | サーバー用クライアント | Server Components, API Routes |

## 使い分け

```typescript
// Server Components / API Routes
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Components
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # サーバーのみ
```

## 関連ディレクトリ

- `../` - lib/ルート
- `../../app/api/` - API Routes

## 注意事項

- `SUPABASE_SERVICE_ROLE_KEY` はサーバー側でのみ使用（RLSバイパス）
- Client Componentsでは `ANON_KEY` のみ使用
