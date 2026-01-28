# シャンプータグライン - プロジェクト設定

## プロジェクト概要

シャンプー関連SNS投稿のソーシャルリスニング分析プロジェクト。Meltwaterから取得した10,000件のSNSデータを分析し、Webappで可視化する。

---

## データソース

| 項目 | 値 |
|------|-----|
| ツール | Meltwater（AnyTag Trend） |
| データ件数 | 10,000件 |
| ファイルサイズ | 23MB |
| 主なプラットフォーム | Instagram, Twitter/X, YouTube等 |
| 地域 | 主に日本 |
| カラム数 | 100+ |

---

## 技術スタック

- Next.js 16.1.5 (App Router)
- React 19
- TypeScript
- Tailwind CSS

---

## フォルダ構成

```
projects/シャンプータグライン/
├── CLAUDE.md               # このファイル
├── docs/
│   └── brief.md            # データ概要・分析方針
├── source/
│   └── export_...csv       # Meltwater生データ（10,000件）
└── webapp/                 # Next.js Webアプリ
    └── src/
        ├── app/
        └── data/           # 構造化データ（未作成）
```

---

## 現在のステージ

**Stage 1: INPUT CAPTURE** - 完了

| ステージ | 状態 |
|---------|------|
| Stage 1: Input Capture | 完了（CSV取得済み） |
| Stage 2: Strategic Document Synthesis | 未着手 |
| Stage 3: Data Structuring | 未着手 |
| Stage 4: UI Component Mapping | 未着手 |
| Stage 5: Webapp Deployment | 未着手 |

---

## 開発コマンド

```bash
cd projects/シャンプータグライン/webapp
npm run dev
```

## デプロイ

```bash
cd projects/シャンプータグライン/webapp
vercel --prod --yes
```

---

## Webapp概要

| 項目 | 値 |
|------|-----|
| 本番URL | https://webapp-five-bay.vercel.app |
| ブランド数 | 86（プチプラ19 / ドラコス27 / 美容専売品40） |
| 可視化 | ポジショニングマップ（散布図）+ テーブル一覧 |
| 軸 | X: 機能訴求↔感性訴求 / Y: 日常↔特別感 |

## Key Files

| ファイル | 用途 |
|---------|------|
| `docs/brief.md` | データ概要・カラム説明・分析方針 |
| `source/export_...csv` | Meltwater生データ（10,000件） |
| `webapp/src/data/tagline-data.ts` | 86ブランドのタグライン・ポジショニングデータ |
| `webapp/src/components/PositioningMap.tsx` | 散布図コンポーネント |
| `webapp/src/components/TaglineTable.tsx` | テーブルコンポーネント |

## 更新履歴

- 2026-01-28: 全86ブランド ファクトチェック完了（84/86確認済み）、sourceUrl追加、タグライン13件修正、FCリンク化
- 2026-01-28: Meltwater CSV分析→17ブランド追加（69→86）
- 2026-01-28: 4象限分類表示、キャッチコピー追加、ファクトチェック、URL追加
- 2026-01-28: PR TIMESデータ追加（35→62ブランド）
- 2026-01-28: ポジショニングマップWebapp作成・デプロイ
