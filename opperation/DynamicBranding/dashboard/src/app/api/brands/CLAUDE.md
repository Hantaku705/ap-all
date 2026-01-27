# brands/

## 概要

ブランド関連API Routes。ブランドサマリー、DPT、関連性データを提供。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `[brandName]/route.ts` | ブランドサマリー（言及シェア、ポジ率、Top CEP等） |
| `[brandName]/dpt/route.ts` | DPT生成（Use Case抽出+LLMでPOP/POD生成） |
| `[brandName]/relations/route.ts` | ブランド関連性（共起、相関、KW） |

## エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/brands/[brandName]` | ブランドサマリー取得 |
| GET | `/api/brands/[brandName]/dpt` | DPTデータ取得（キャッシュ24h） |
| GET | `/api/brands/[brandName]/relations` | 関連性データ取得 |

## 関連ディレクトリ

- `../` - api/ルート
- `../../../../components/brand-detail/` - ブランド詳細コンポーネント

## 注意事項

- ブランド名は日本語（ほんだし等）をURLエンコードして使用
- DPT APIはLLM呼び出しがあるため、レスポンスが遅い場合あり（キャッシュで軽減）
