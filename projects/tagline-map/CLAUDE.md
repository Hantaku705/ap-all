# tagline-map - タグラインポジショニングマップ（統合版）

美容ブランドのタグライン・ポジショニングマップWebapp。3カテゴリ統合版。

---

## 本番URL

**https://tagline-positioning-map.vercel.app**

---

## データ

| カテゴリ | ブランド数 |
|----------|----------|
| シャンプー | 86 |
| スキンケア | 42 |
| リップ | 42 |
| **合計** | **170** |

---

## 技術スタック

- Next.js 16.1.5 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Recharts (ScatterChart)

---

## 軸設計

### シャンプー
- X軸: 機能訴求（-5）↔ 感性訴求（+5）
- Y軸: ベーシック（-5）↔ プレミアム（+5）

### スキンケア
- X軸: 機能訴求（-5）↔ 感性訴求（+5）
- Y軸: シンプル（-5）↔ プレミアム（+5）

### リップ
- X軸: 色持ち・機能訴求（-5）↔ 発色・感性訴求（+5）
- Y軸: ナチュラル（-5）↔ 華やか（+5）

---

## フォルダ構成

```
projects/tagline-map/
├── CLAUDE.md               # このファイル
└── webapp/                 # Next.js Webアプリ
    ├── src/
    │   ├── app/            # App Router
    │   ├── components/     # PositioningMap, TaglineTable, CategoryTabs
    │   ├── config/         # categories.ts (軸設定)
    │   └── data/           # shampoo.ts, skincare.ts, lip.ts
    └── package.json
```

---

## 開発コマンド

```bash
cd projects/tagline-map/webapp
npm run dev
```

## デプロイ

```bash
cd projects/tagline-map/webapp
vercel --prod --yes
```

---

## 関連プロジェクト

| プロジェクト | URL | 状態 |
|-------------|-----|------|
| skincare-tagline-map | https://skincare-tagline-map.vercel.app | 旧・個別版 |
| lip-tagline-map | https://lip-tagline-map.vercel.app | 旧・個別版 |

---

## 更新履歴

- 2026-01-28: 統合版として新規Vercelプロジェクト作成（tagline-positioning-map）
- 2026-01-28: 3カテゴリ統合（シャンプー86 + スキンケア42 + リップ42 = 170ブランド）
