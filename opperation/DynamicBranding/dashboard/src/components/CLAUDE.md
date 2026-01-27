# components/

## 概要

Reactコンポーネントディレクトリ。可視化、データ表示、UI共通部品を管理。

## ディレクトリ構成

| ディレクトリ | 説明 |
|-------------|------|
| `charts/` | Recharts可視化コンポーネント（13種） |
| `data/` | データ表示コンポーネント |
| `insights/` | インサイトカードコンポーネント |
| `reports/` | レポート管理コンポーネント |
| `chat/` | AIチャットコンポーネント |
| `ui/` | shadcn/ui汎用コンポーネント |
| `corporate/` | コーポレート分析コンポーネント（7種） |
| `corporate-analytics/` | コーポレートUGC分析コンポーネント（7種） |
| `corporate-world-news/` | 世の中分析コンポーネント（9種） |
| `persona/` | ペルソナ分析タブコンポーネント（1種） |
| `strategy/` | 戦略分析コンポーネント（1種） |

## コンポーネント数

| カテゴリ | 数 |
|---------|-----|
| charts | 13 |
| data | 2 |
| insights | 2 |
| reports | 1 |
| chat | 1 |
| ui | 3 |
| corporate | 7 |
| corporate-analytics | 7 |
| corporate-world-news | 9 |
| persona | 1 |
| strategy | 1 |

## 関連ディレクトリ

- `../` - src/ルート
- `../app/page.tsx` - メインページ（コンポーネント使用元）

## 注意事項

- すべてのchartsコンポーネントは `"use client"` ディレクティブが必要
- 新規コンポーネント追加時は `page.tsx` のタブ構成も確認
