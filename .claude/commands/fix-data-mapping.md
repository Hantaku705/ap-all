---
description: "/fix-data-mapping - データ変換スクリプトのマッピング修正"
---

# /fix-data-mapping - データマッピング修正ワークフロー

スプレッドシート→JSON→TypeScript のデータ変換パイプラインでカラムマッピングを修正するワークフロー。

## 前提条件

- スプレッドシートと同期済みのJSONファイル
- 変換スクリプト（`convert-to-*.ts`）
- 出力先のTypeScriptファイル

## 実行手順

### 1. データフロー調査

```bash
# 同期スクリプトでマッピング確認
grep -n "HEADER_MAP\|columnMap" scripts/sync-*.ts

# 変換スクリプトで使用フィールド確認
grep -n "tap\.\|product\." scripts/convert-*.ts
```

### 2. 元データ確認

```bash
# JSONに正しいデータが入っているか確認
head -100 data/products.json | jq '.products[0]'
```

### 3. 変換スクリプト修正

対象ファイル内で、フィールドの参照を修正:

```typescript
// 修正前（例）
const value = item.oldField

// 修正後
const value = item.newField || item.oldField
```

### 4. 変換実行

```bash
cd scripts
npx tsx convert-to-[target].ts
```

### 5. 出力検証

```bash
# 生成ファイルの先頭を確認
head -50 ../webapp/src/data/[output].ts
```

### 6. ビルド＆デプロイ

```bash
cd ../webapp
npm run build && vercel --prod --yes
```

## 出力

- 修正された変換スクリプト
- 再生成されたTypeScriptデータファイル
- 本番デプロイ

## チェックリスト

- [ ] 元データ（JSON）に正しい値があるか
- [ ] マッピングが正しいフィールドを参照しているか
- [ ] フォールバック（`||`）で安全に処理しているか
- [ ] 出力データが期待通りか
- [ ] ビルドが成功するか

## 使用例

```
/fix-data-mapping
```

## 関連

- `/sync-tiktokcap` - スプレッドシート同期
- `scripts/convert-to-anybrand.ts` - AnyBrand変換スクリプト
