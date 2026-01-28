---
description: "/db-migrate - DBマイグレーション自動化"
---

# /db-migrate - DBマイグレーション自動化

Supabaseデータベースのマイグレーション操作を自動化します。

## 実行手順

### 1. マイグレーションファイル検出

```bash
# マイグレーションファイル一覧
ls -la supabase/migrations/

# 統合マイグレーションファイル確認
cat supabase/combined_migration.sql | head -100
```

### 2. スキーマ差分分析

以下を確認:
- `supabase/migrations/` 内の個別マイグレーション
- `supabase/combined_migration.sql` の統合状態
- `src/types/database.ts` との型整合性

### 3. マイグレーション適用手順

#### ローカル開発（Supabase CLI）
```bash
# Supabase CLIでマイグレーション適用
supabase db push

# または個別実行
supabase db execute -f supabase/migrations/XXXXXX_name.sql
```

#### 本番環境（Supabase Dashboard）
1. https://supabase.com/dashboard にアクセス
2. プロジェクト選択 → SQL Editor
3. `supabase/combined_migration.sql` の内容をペースト
4. Run を実行

### 4. 検証チェックリスト

- [ ] テーブル作成: `CREATE TABLE IF NOT EXISTS` 使用
- [ ] ポリシー: `DROP POLICY IF EXISTS` → `CREATE POLICY`
- [ ] インデックス: `CREATE INDEX IF NOT EXISTS` 使用
- [ ] RLS有効化: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- [ ] 型定義更新: `src/types/database.ts` と同期

### 5. ロールバック手順

```sql
-- テーブル削除（注意: データ消失）
DROP TABLE IF EXISTS table_name CASCADE;

-- カラム削除
ALTER TABLE table_name DROP COLUMN IF EXISTS column_name;

-- ポリシー削除
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

## よくあるパターン

### 新規テーブル追加
```sql
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON new_table FOR SELECT
  USING (auth.uid() = user_id);
```

### カラム追加
```sql
ALTER TABLE existing_table
  ADD COLUMN IF NOT EXISTS new_column TEXT DEFAULT '';
```

### インデックス追加
```sql
CREATE INDEX IF NOT EXISTS idx_table_column
  ON table_name(column_name);
```

## 注意事項

- 本番環境での破壊的変更は必ずバックアップ後に実行
- `CASCADE` オプションは依存関係を確認してから使用
- RLSポリシーは`service_role`用と`authenticated`用を分離
- マイグレーション後は必ずアプリケーションの動作確認を実施
