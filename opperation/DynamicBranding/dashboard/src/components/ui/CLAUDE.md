# ui/

## 概要

shadcn/ui汎用コンポーネント。ダッシュボード全体で使用する基本UI部品。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `card.tsx` | カードコンポーネント（Card, CardHeader, CardTitle, CardContent等） |
| `badge.tsx` | バッジコンポーネント（ラベル表示用） |
| `tabs.tsx` | タブコンポーネント（Tabs, TabsList, TabsTrigger, TabsContent） |

## 使用例

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
```

## スタイリング

- Tailwind CSSベース
- `class-variance-authority` でバリアント管理
- `cn()` ユーティリティでクラス結合

## 関連ディレクトリ

- `../` - components/ルート
- `../../lib/utils/cn.ts` - クラス結合ユーティリティ

## 注意事項

- shadcn/ui公式のコンポーネントをベースにカスタマイズ
- 新規コンポーネント追加は `npx shadcn@latest add <component>` で可能
