# insights/

## 概要

インサイト表示コンポーネント。戦略インサイトをカード形式で表示。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `InsightList.tsx` | インサイトカード一覧 |
| `InsightCard.tsx` | インサイトカード個別 |

## インサイト構造

```typescript
interface Insight {
  id: string
  title: string
  description: string
  type: 'opportunity' | 'risk' | 'trend'
  priority: 'high' | 'medium' | 'low'
  brands: string[]
  ceps?: string[]
}
```

## 関連ディレクトリ

- `../` - components/ルート
- `../../app/api/insights/` - インサイトAPI
- `../../../../.claude/agents/insight-generator.md` - インサイト生成Agent

## 注意事項

- インサイトはAI生成または手動入力
- タイプ別にアイコン・色を変更
