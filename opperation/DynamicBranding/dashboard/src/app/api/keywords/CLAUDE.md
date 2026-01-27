# keywords/

## 概要

関連キーワード分析API Routes。SerpAPIで取得したキーワードを提供。

## ファイル一覧

| ファイル | エンドポイント | 説明 |
|---------|---------------|------|
| `route.ts` | `GET /api/keywords` | 関連KW一覧 |
| `cooccurrences/route.ts` | `GET /api/keywords/cooccurrences` | KW共起マトリクス |
| `sankey/route.ts` | `GET /api/keywords/sankey` | ブランド→KW→CEPサンキー用データ |

## データソース

- `related_keywords` テーブル - 関連KWマスタ
- `keyword_cooccurrences` テーブル - KW共起カウント
- `keyword_cep_mappings` テーブル - KW→CEPマッピング

## サンキーダイアグラム

```
ブランド → 関連キーワード → CEP

例:
ほんだし → 味噌汁 → 「朝の時短調理」
ほんだし → 和食   → 「本格的な味を出したい」
```

## 関連ディレクトリ

- `../` - api/ルート
- `../../../../scripts/fetch-related-keywords.ts` - KW取得スクリプト

## 注意事項

- SerpAPIの利用制限に注意（クレジット消費）
- KW→CEPマッピングは手動またはAI推論で設定
