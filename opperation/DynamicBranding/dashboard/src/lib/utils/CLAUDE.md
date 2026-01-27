# utils/

## 概要

共通ユーティリティ関数。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `cn.ts` | CSSクラス結合ユーティリティ（clsx + tailwind-merge） |
| `colors.ts` | ブランドカラー定義 |

## cn()

```typescript
import { cn } from "@/lib/utils/cn"

// 使用例
<div className={cn("base-class", conditional && "conditional-class")} />
```

## colors.ts

```typescript
export const BRAND_COLORS = {
  ほんだし: "#E53935",
  アジシオ: "#1E88E5",
  クックドゥ: "#43A047",
  // ...
}
```

## 関連ディレクトリ

- `../` - lib/ルート
- `../../components/` - コンポーネント（utils使用元）

## 注意事項

- 新規ブランド追加時は `colors.ts` を更新
- `cn()` はTailwind CSSの衝突を自動解決
