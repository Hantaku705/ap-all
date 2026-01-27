---
description: "/error - 全ページのエラー検出・自動修正"
---

# /error - ページエラー検出・自動修正

アプリ内の全ページをスキャンしてエラーを検出し、自動修正します。

## 実行手順

### Phase 1: ビルドチェック

1. `npm run build` を実行
2. TypeScript型エラーを検出
3. エラーがあれば Phase 4 へ（即座に修正）
4. エラーなしなら Phase 2 へ

### Phase 2: ページスキャン（並列実行）

以下の3つのsubagentを**並列**で起動:

#### Subagent 1: 型・ランタイムエラー検出
```
subagent_type: general-purpose
model: haiku
prompt: |
  ページファイルの型・ランタイムエラーを検出してください。

  対象ディレクトリ:
  - src/app/(auth)/**/page.tsx
  - src/app/(dashboard)/**/page.tsx
  - src/app/(generate)/**/page.tsx

  検出パターン:
  1. null/undefinedアクセス（オプショナルチェーンなし）
     - `.property` で `?.` なしのチェーン
  2. 型の重複定義
     - 同じ型名が複数ファイルで定義
  3. 安全でないキャスト
     - `as any`, `as unknown` の乱用
  4. 未使用インポート
     - import後に使用されない変数

  報告形式:
  ---
  ## 型・ランタイムエラー
  | 優先度 | ファイル | 行 | 問題 |
  |--------|----------|-----|------|
  ---
```

#### Subagent 2: APIエラーハンドリング検出
```
subagent_type: general-purpose
model: haiku
prompt: |
  APIエラーハンドリングの問題を検出してください。

  対象: src/app/**/page.tsx

  検出パターン:
  1. try-catchなしのasync呼び出し
     - `mutateAsync()` エラーハンドリングなし
  2. エラー状態の未表示
     - `isError` 状態があるが表示なし
  3. ローディング状態の未表示
     - `isLoading` 状態があるが表示なし
  4. 楽観的UIの不整合
     - mutate後の状態更新なし

  報告形式:
  ---
  ## APIエラーハンドリング
  | 優先度 | ファイル | 行 | 問題 |
  |--------|----------|-----|------|
  ---
```

#### Subagent 3: 状態管理・未定義変数検出
```
subagent_type: general-purpose
model: haiku
prompt: |
  状態管理と未定義変数の問題を検出してください。

  対象: src/app/**/page.tsx

  検出パターン:
  1. 未定義の環境変数
     - `process.env.NEXT_PUBLIC_*` で未設定の可能性
  2. useEffect依存配列の問題
     - 関数/変数が依存配列に含まれていない
  3. 状態更新の無限ループ
     - useEffect内でstateを更新し、それが依存配列に入っている
  4. 未インポートのコンポーネント
     - JSXで使用されているがimportなし

  報告形式:
  ---
  ## 状態管理・未定義変数
  | 優先度 | ファイル | 行 | 問題 |
  |--------|----------|-----|------|
  ---
```

### Phase 3: エラー分類・優先順位付け

並列結果を統合し、以下の優先順位で分類:

| 優先度 | エラータイプ | 自動修正 |
|--------|-------------|----------|
| 🔴 1 | TypeScript型エラー（ビルド失敗） | Yes |
| 🔴 2 | null/undefinedアクセス | Yes |
| 🔴 3 | APIエラーハンドリング未実装 | Yes |
| 🟠 4 | 型の重複定義 | Yes |
| 🟠 5 | 未定義環境変数 | Prompt |
| 🟡 6 | 未使用インポート | Yes |
| 🟡 7 | useEffect依存配列 | Prompt |

### Phase 4: 自動修正

検出されたエラーを優先順位に従って修正:

#### 修正パターン

**null/undefinedアクセス**:
```typescript
// Before
const name = product.name.toLowerCase()

// After
const name = product?.name?.toLowerCase() ?? ''
```

**APIエラーハンドリング**:
```typescript
// Before
await deleteVideo.mutateAsync(id)

// After
try {
  await deleteVideo.mutateAsync(id)
  toast.success('削除しました')
} catch (error) {
  toast.error('削除に失敗しました')
}
```

**型の重複定義**:
```typescript
// Before: 2箇所で定義
// file1.ts: type CompositionId = 'A' | 'B'
// file2.ts: type CompositionId = 'A' | 'B'

// After: 1箇所で定義、他はimport
// types.ts: export type CompositionId = 'A' | 'B'
// file1.ts: import { CompositionId } from './types'
```

**未使用インポート削除**:
```typescript
// Before
import { useState, useEffect, useCallback } from 'react' // useCallbackは未使用

// After
import { useState, useEffect } from 'react'
```

### Phase 5: 検証

1. `npm run build` を再実行
2. 結果を報告:

```markdown
## エラー修正結果

### 検出されたエラー
| 優先度 | 件数 |
|--------|------|
| 🔴 高 | X 件 |
| 🟠 中 | Y 件 |
| 🟡 低 | Z 件 |

### 修正内容
- [x] [ファイル:行] [修正内容]
- [x] [ファイル:行] [修正内容]

### 検証結果
- ビルド: ✓ success
- 型チェック: ✓ pass
```

## 対象ページ一覧

```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── callback/page.tsx
├── (dashboard)/
│   ├── page.tsx           # ダッシュボード
│   ├── products/page.tsx  # 商品管理
│   ├── videos/page.tsx    # 動画一覧
│   ├── videos/[id]/page.tsx # 動画詳細
│   ├── templates/page.tsx # テンプレート
│   ├── settings/page.tsx  # 設定
│   └── analytics/page.tsx # 分析
└── (generate)/
    └── generate/page.tsx  # 動画生成
```

## BuzzWriteYear 既知のエラー

| 問題 | ファイル | 修正方法 |
|------|----------|----------|
| CompositionId型重複 | useGenerateVideo.ts, compositions/index.ts | 一元化 |
| deleteVideoエラーハンドリング未実装 | videos/[id]/page.tsx:79-81 | try-catch追加 |
| 未定義環境変数 | settings/page.tsx:29-30 | .env確認 |

## 注意事項

- 修正は1件ずつ行い、都度ビルドで確認
- 破壊的変更がある場合はユーザーに確認
- 環境変数の問題は `.env.local` の確認を促す
- 状態管理の問題は慎重に対応（無限ループリスク）
