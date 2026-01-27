# reports/

## 概要

レポート管理API Routes。分析レポートのCRUD操作を提供。

## ファイル一覧

| ファイル | エンドポイント | 説明 |
|---------|---------------|------|
| `route.ts` | `GET /api/reports` | レポート一覧取得 |
| `route.ts` | `POST /api/reports` | レポート作成 |
| `[id]/route.ts` | `GET /api/reports/:id` | レポート詳細取得 |
| `[id]/route.ts` | `PUT /api/reports/:id` | レポート更新 |
| `[id]/route.ts` | `DELETE /api/reports/:id` | レポート削除 |

## レポート構造

```typescript
interface Report {
  id: string
  title: string
  content: string       // Markdown形式
  type: string          // summary, detail, etc.
  created_at: string
  updated_at: string
}
```

## 関連ディレクトリ

- `../` - api/ルート
- `../../../components/reports/` - レポートUI

## 注意事項

- レポート内容はMarkdown形式で保存
- 自動生成レポートは `/export-report` スキルで作成
