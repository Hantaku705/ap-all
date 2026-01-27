# supabase/

## 概要

Supabaseデータベース設定・マイグレーション管理ディレクトリ。

## ディレクトリ構成

| ディレクトリ | 説明 |
|-------------|------|
| `migrations/` | SQLマイグレーションファイル |

## 関連ディレクトリ

- `../` - dashboard/ルート
- `../scripts/` - データ投入スクリプト

## 注意事項

- スキーマ変更時は新規マイグレーションファイルを追加（番号連番）
- Supabase SQL Editorで直接実行するか、`scripts/apply-migration.ts` を使用
- RLS（Row Level Security）ポリシーはサービスロール用を含めること
