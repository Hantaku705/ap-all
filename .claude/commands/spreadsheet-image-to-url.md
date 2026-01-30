---
description: "/spreadsheet-image-to-url - スプレッドシートの埋め込み画像をDrive URL化"
---

# /spreadsheet-image-to-url

Google スプレッドシートの「セル内画像」を抽出し、Google Drive URLに変換してスプレッドシートに書き込む。

## 前提条件

- rclone 設定済み（`rclone authorize drive` で認証）
- MCP `google-docs-mcp` 利用可能
- スプレッドシートへの編集権限

## 入力

| パラメータ | 説明 | 例 |
|-----------|------|-----|
| スプレッドシートID | 対象スプレッドシート | `1OnWqFD7...` |
| シート名 | 対象シート | `ALL` |
| 画像列 | 埋め込み画像がある列 | `F` |
| 出力列 | URLを書き込む列 | `G` |

## 実行手順

### 1. xlsxエクスポート

スプレッドシートを手動でxlsx形式でダウンロード:
- ファイル → ダウンロード → Microsoft Excel (.xlsx)

### 2. 画像抽出

xlsxはZIPファイル。解凍して画像を抽出:

```bash
unzip spreadsheet.xlsx -d extracted/
cp extracted/xl/media/* data/images/
```

### 3. 行番号マッピング

xl/drawings/drawing1.xmlを解析し、画像と行の対応を特定:

```bash
# row_XXX.png 形式でリネーム
# スクリプト: scripts/extract-images.ts
```

### 4. Google Driveアップロード

rcloneで一括アップロード:

```bash
rclone copy data/images/ gdrive:[フォルダ名]/
```

### 5. ファイルID取得

```bash
rclone lsf gdrive:[フォルダ名]/ --format "pi" > files.txt
```

### 6. スプレッドシート書き込み

MCP `writeSpreadsheet` でURL書き込み:

```
mcp__google-docs-mcp__writeSpreadsheet(
  spreadsheetId: "[ID]",
  range: "[シート]![出力列][開始行]:[出力列][終了行]",
  values: [[url1], [url2], ...]
)
```

URL形式: `https://drive.google.com/uc?id=[FILE_ID]`

## 注意事項

- **埋め込み画像はAPI取得不可**: Google Sheets APIは「セル内画像」を直接取得できない。xlsx経由が必須
- **rclone認証**: 初回は `rclone authorize drive` でブラウザ認証が必要
- **画像順序**: xlsxの画像順序は必ずしもスプレッドシートと一致しない。XMLマッピングで正確な行番号を特定

## 使用例

```
/spreadsheet-image-to-url
```

## 関連ファイル（TikTokCAP実装例）

| ファイル | 用途 |
|---------|------|
| `scripts/extract-images.ts` | xlsx画像抽出・行番号マッピング |
| `scripts/prepare-spreadsheet-update.ts` | Drive ID → URL配列変換 |
| `data/images_by_row/` | 抽出画像保存先 |
