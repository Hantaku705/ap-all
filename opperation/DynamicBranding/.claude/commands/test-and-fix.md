---
description: "Run tests and fix any failures"
---

# /test-and-fix - テスト実行・失敗修正

テストを実行し、失敗があれば分析・修正・再テストを行います。

## 実行手順

### Phase 1: テスト環境検出

1. `package.json` の scripts セクションを確認
2. テストコマンドを特定:
   - `npm test` - 一般的なテスト
   - `npx playwright test` - Playwright E2E
   - `npx jest` - Jestユニットテスト
   - `npx vitest` - Vitestテスト
3. テスト設定ファイルを確認:
   - `playwright.config.ts`
   - `jest.config.js`
   - `vitest.config.ts`

### Phase 2: テスト実行

1. 検出したテストコマンドを実行
2. 結果を分類:
   - **All Pass**: Phase 5 へ（成功報告）
   - **Some Fail**: Phase 3 へ（失敗分析）
   - **Error**: Phase 3 へ（環境問題分析）

### Phase 3: 失敗分析

各失敗テストについて:

1. **エラータイプ判定**:
   | タイプ | 例 | 対応 |
   |--------|----|----|
   | 型エラー | `Type 'X' is not assignable to type 'Y'` | 型定義修正 |
   | ランタイムエラー | `Cannot read property 'X' of undefined` | null チェック追加 |
   | アサーション失敗 | `Expected X but received Y` | 実装またはテスト修正 |
   | タイムアウト | `Test timeout of 30000ms exceeded` | 待機処理追加 |
   | 環境問題 | `ECONNREFUSED`, `Module not found` | 環境設定修正 |

2. **該当ファイル特定**:
   - スタックトレースからファイルパス抽出
   - 該当コードを Read ツールで確認

3. **修正難易度判定**:
   - **easy**: 型キャスト、null チェック、import 修正
   - **medium**: ロジック修正、非同期処理修正
   - **hard**: 設計変更、外部依存問題

### Phase 4: 修正実行

1. **easy** レベル: 即座に Edit ツールで修正
2. **medium** レベル: 修正案を提示し、ユーザー確認後に実行
3. **hard** レベル: 問題を報告し、解決策を複数提案

修正パターン例:

```typescript
// 型エラー: as キャストで解決
const value = data as ExpectedType

// null チェック: オプショナルチェーン
const result = obj?.property ?? defaultValue

// 非同期問題: await 追加
await expect(element).toBeVisible()

// タイムアウト: waitFor 追加
await page.waitForSelector('.element', { timeout: 10000 })
```

### Phase 5: 再テスト・報告

1. 修正後にテストを再実行
2. 結果を報告:

```
## テスト結果

### 初回実行
- 合格: X / Y
- 失敗: Z 件

### 修正内容
1. [ファイル]: [修正内容]
2. [ファイル]: [修正内容]

### 最終結果
- 合格: Y / Y ✓
```

3. 全テスト合格まで Phase 3-5 を繰り返し

## プロジェクト固有の注意事項

### BuzzWriteYear プロジェクト

- **Playwright E2E**: `npx playwright test`
- **テストディレクトリ**: `tests/e2e/`
- **スクリーンショット**: `tests/screenshots/`
- **よくある問題**:
  - Supabase SSR 型推論 → `as never` アサーション
  - Recharts Tooltip → `value as number`
  - Zod v4 → `z.record(z.string(), z.unknown())`

### 環境依存テスト

- **Redis 必須**: `REDIS_URL` 環境変数
- **ローカルサーバー必須**: `npm run dev` が起動している必要あり
- **本番テスト**: `BASE_URL=https://... npx playwright test`

## 注意事項

- テスト修正は1件ずつ行い、都度再テストで確認
- 実装コードの修正 vs テストコードの修正を慎重に判断
- 破壊的変更（既存機能への影響）がある場合はユーザーに確認
- スクリーンショットの差分は視覚的に確認が必要な場合あり
