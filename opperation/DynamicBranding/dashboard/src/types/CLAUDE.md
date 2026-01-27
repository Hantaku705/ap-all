# types/

## 概要

TypeScript型定義ディレクトリ。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `data.types.ts` | アプリケーション固有のデータ型 |
| `database.types.ts` | Supabase自動生成型（supabase gen types） |

## data.types.ts

```typescript
// トレンドデータ
interface TrendData {
  date: string
  [brand: string]: number | string
}

// SNS投稿
interface SNSPost {
  id: string
  source: string
  content: string
  brand_mentions: string[]
  sentiment?: 'positive' | 'neutral' | 'negative'
  // ...11種ラベル
}

// CEP
interface CEP {
  id: string
  name: string
  category: string
  primary_emotion: string
}
```

## database.types.ts

Supabase CLIで自動生成:

```bash
supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
```

## 関連ディレクトリ

- `../` - src/ルート
- `../lib/supabase/` - Supabase型使用元

## 注意事項

- `database.types.ts` は手動編集しない（自動生成で上書き）
- スキーマ変更後は再生成が必要
