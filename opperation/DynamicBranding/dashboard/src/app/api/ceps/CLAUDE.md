# ceps/

## 概要

CEP（Category Entry Point）分析API Routes。生活文脈とブランドの関係を提供。

## ファイル一覧

| ファイル | エンドポイント | 説明 |
|---------|---------------|------|
| `route.ts` | `GET /api/ceps` | CEP一覧 |
| `brands/route.ts` | `GET /api/ceps/brands` | ブランド別CEPスコア |
| `portfolio/route.ts` | `GET /api/ceps/portfolio` | 4象限ポートフォリオ用データ |

## データソース

- `ceps` テーブル - CEPマスタ（12種類）
- `brand_ceps` テーブル - ブランド別CEPスコア

## 4象限ポートフォリオ

```
          高頻度
             │
   成熟CEP   │   成長CEP
   (左上)    │   (右上)
─────────────┼─────────────
   衰退CEP   │   新興CEP
   (左下)    │   (右下)
             │
          低頻度
```

## 関連ディレクトリ

- `../` - api/ルート
- `../../../../.claude/commands/extract-cep.md` - CEP抽出スキル

## 注意事項

- CEP定義は `/CLAUDE.md` のCEP粒度基準に従う
- スコアは0-100の範囲で正規化
