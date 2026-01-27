# lib/

## 概要

ユーティリティ・外部サービス接続ライブラリ。

## ディレクトリ構成

| ディレクトリ | 説明 |
|-------------|------|
| `supabase/` | Supabase接続クライアント |
| `utils/` | ユーティリティ関数 |
| `clustering/` | k-meansクラスタリング（ペルソナ分析用） |
| `personality/` | ブランドパーソナリティ5軸スコア算出 |
| `report-quality/` | レポート品質検出・改善モジュール |

## 関連ディレクトリ

- `../` - src/ルート
- `../app/api/` - API Routes（lib使用元）
- `../components/` - コンポーネント（lib使用元）

## 注意事項

- Server/Client Componentで使用するクライアントを使い分ける
