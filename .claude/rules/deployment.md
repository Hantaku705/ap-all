# Deployment Rules

## Vercel

### プロジェクト分離（必須）

- **各webappには固有のVercelプロジェクトIDを割り当てる**
- 複数webappで同じプロジェクトIDを共有しない
- `.vercel/project.json`の`projectId`が他プロジェクトと重複していないか確認

### 分離が必要な場合

```bash
# 1. 既存のVercel設定を削除
rm -rf .vercel

# 2. 新規プロジェクトとしてリンク
vercel link --project [プロジェクト名]

# 3. 本番デプロイ
vercel --prod --yes
```

### よくある問題

| 症状 | 原因 | 解決 |
|------|------|------|
| 別のwebappが上書きされた | 同じプロジェクトIDを共有 | 上記手順で分離 |
| `vercel --yes`で既存プロジェクトにリンクされた | 同名プロジェクトが存在 | `vercel link --project [新名]`で明示指定 |

## 環境変数

- 機密情報（APIキー等）は`.env.local`に記載し、gitignore対象
- Vercel環境変数は`vercel env add`で設定
- 設定後は`vercel env ls`で確認
