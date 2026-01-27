# src/

## 概要

Next.js App Routerアプリケーションのソースコード。

## ディレクトリ構成

| ディレクトリ | 説明 |
|-------------|------|
| `app/` | App Router（ページ・API Routes） |
| `components/` | Reactコンポーネント |
| `lib/` | ユーティリティ・外部サービス接続 |
| `types/` | TypeScript型定義 |

## アーキテクチャ

```
src/
├── app/                  # Next.js App Router
│   ├── page.tsx         # トップページ（9タブUI）
│   ├── layout.tsx       # ルートレイアウト
│   └── api/             # API Routes
├── components/
│   ├── charts/          # Recharts可視化
│   ├── data/            # データ表示
│   ├── insights/        # インサイト
│   ├── reports/         # レポート
│   ├── chat/            # AIチャット
│   └── ui/              # shadcn/ui
├── lib/
│   ├── supabase/        # Supabase接続
│   └── utils/           # ユーティリティ
└── types/
    ├── data.types.ts    # データ型
    └── database.types.ts # Supabase自動生成型
```

## 関連ディレクトリ

- `../` - dashboard/ルート
- `../scripts/` - データ管理スクリプト

## 注意事項

- Server ComponentsとClient Componentsの使い分けに注意
- `"use client"` ディレクティブはRechartsなどクライアント側ライブラリ使用時に必要
