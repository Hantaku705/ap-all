# AnyBrand - TikTokクリエイター向けアフィリエイトプラットフォーム

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | AnyBrand |
| 本番URL | https://anybrand-platform.vercel.app |
| 参考サイト | https://www.anystarr.com/ |
| 技術スタック | Next.js 16 + Tailwind CSS + Recharts |
| 目的 | 日本市場向けTikTokアフィリエイトプラットフォーム |

---

## サービス概要

### ビジネスモデル

```
ブランド（商品提供）
    ↓
AnyBrand（マッチング・管理・決済）
    ↓
クリエイター（TikTokで紹介）
    ↓
消費者（購入）
    ↓
コミッション発生 → クリエイターへ支払い
```

### 3つの価値提案

1. **高いコミッション率** - 業界標準10-15%より高い報酬（20-30%）
2. **豊富な商品ラインアップ** - 500以上のブランド
3. **専門的サポート** - 専属アカウントマネージャー

---

## 実装済み機能

### ページ構成

| パス | 内容 | ステータス |
|------|------|----------|
| `/` | ランディングページ（6セクション） | ✅ 完了 |
| `/login` | ログイン | ✅ 完了 |
| `/register` | 新規登録（3ステップ） | ✅ 完了 |
| `/dashboard` | ダッシュボード（統計・グラフ・通知） | ✅ 完了 |
| `/products` | 商品カタログ（検索・フィルター） | ✅ 完了 |
| `/products/[id]` | 商品詳細（申請機能） | ✅ 完了 |
| `/orders` | 注文履歴（フィルター・検索・テーブル） | ✅ 完了 |
| `/commissions` | コミッション管理（KPI・グラフ・振込申請） | ✅ 完了 |
| `/settings` | 設定（プロフィール・銀行・通知） | ✅ 完了 |
| `/guide` | ガイド・ヘルプ（FAQ・始め方・コミッション説明） | ✅ 完了 |

### コンポーネント

```
src/
├── app/
│   ├── (auth)/           # 認証が必要なページ
│   │   ├── dashboard/    # ダッシュボード
│   │   ├── products/     # 商品カタログ・詳細
│   │   ├── orders/       # 注文履歴 ★Phase 2
│   │   ├── commissions/  # コミッション管理 ★Phase 2
│   │   ├── settings/     # 設定 ★Phase 2
│   │   └── guide/        # ガイド・ヘルプ ★Phase 2
│   ├── (public)/         # 公開ページ
│   │   ├── login/
│   │   └── register/
│   └── page.tsx          # ランディング
├── components/
│   ├── landing/          # ランディング用（6セクション）
│   └── layout/           # ヘッダー・フッター・サイドバー
├── data/
│   └── mock-data.ts      # モックデータ（全7種類）
└── types/
    └── index.ts          # 型定義
```

---

## 商品データ（TikTokCAPスプレッドシート連携）

| データ | 件数 | 内容 |
|--------|------|------|
| 商品 | 299件 | TikTokCAPスプレッドシートから同期（47ブランド） |
| カテゴリ | 6件 | 美容58/食品74/家電23/ファッション11/ホーム10/その他123 |
| 注文 | 5件 | ダッシュボード・注文履歴表示用 |
| 通知 | 4件 | ダッシュボード表示用 |
| 商品申請 | 4件 | ダッシュボード表示用 |
| コミッション支払い | 4件 | コミッションページ表示用 |
| FAQ | 8件 | ガイドページ表示用 |

### データ同期手順

```bash
# 1. TikTokCAPスプレッドシートを同期
/sync-tiktokcap

# 2. AnyBrand形式に変換
cd opperation/TikTokCAP/scripts
npx tsx convert-to-anybrand.ts

# 3. デプロイ
cd projects/anybrand/webapp
vercel --prod --yes
```

### 主要ファイル

| ファイル | 説明 |
|---------|------|
| `src/data/products-data.ts` | 商品データ299件（自動生成、直接編集不可） |
| `src/data/mock-data.ts` | その他モックデータ（カテゴリ、注文等） |
| `opperation/TikTokCAP/scripts/convert-to-anybrand.ts` | 変換スクリプト |

---

## 開発コマンド

```bash
cd projects/anybrand/webapp

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番デプロイ
vercel --prod --yes
```

---

## 完了フェーズ

### Phase 1 ✅
- [x] ランディングページ（6セクション）
- [x] ログイン・新規登録
- [x] ダッシュボード（統計・グラフ・通知）
- [x] 商品カタログ（検索・フィルター・詳細）

### Phase 2 ✅
- [x] 注文履歴ページ（フィルター・検索・テーブル）
- [x] コミッション管理ページ（KPI・グラフ・振込申請モーダル）
- [x] 設定ページ（3タブ: プロフィール・銀行口座・通知）
- [x] ガイド・ヘルプページ（カテゴリ・FAQ・始め方）

### UI/UX改善（anystarr.comスタイル） ✅
- [x] 商品一覧ページ（/products）anystarr.comスタイル化
  - 5列グリッド、バッジ（Top Selling/Free Sample/New/Hot）
  - 獲得額（緑色）、コミッション段階表示（現在→最大）
  - サンプル/追加2ボタン、横並びソートタブ7種
  - お気に入りハート、あなたへのおすすめフィルター
- [x] 商品詳細ページ（/products/[id]）anystarr.comスタイル化
  - バッジ、星評価、獲得額（緑色）、コミッション段階
  - 販売統計4種（総売上、昨日の売上、GMV、在庫数）
  - サンプル申請/アフィリエイト追加ボタン、関連商品
- [x] 型定義更新（Product型に新フィールド追加）
- [x] Playwrightテスト10件追加・全パス

---

## 次のステップ

### Phase 3 ✅
- [x] 実データ連携（TikTokCAPスプレッドシート299件）

### Phase 4（将来）
- [ ] Supabase認証連携
- [ ] サンプル管理機能
- [ ] 支払い機能（Stripe Connect）
- [ ] モバイル対応改善
- [ ] 商品画像をスプレッドシートから取得

---

## 更新履歴

- 2026-01-29: **Phase 3 実データ連携** - TikTokCAPスプレッドシート299件同期（`convert-to-anybrand.ts`作成、カテゴリ12→6統合、型定義に`affiliateUrl`/`shopUrl`追加）
- 2026-01-29: **anystarr.com UI/UX改善** - 商品一覧・詳細ページをanystarr.comスタイルに全面改修（バッジ、獲得額緑表示、コミッション段階、販売統計、Playwrightテスト10件）
- 2026-01-29: **ヘッダーナビゲーション改善** - ダッシュボード・商品リンク追加、「デモを見る」ボタン、ログインなしで内部ページ直接アクセス可能
- 2026-01-29: **Phase 2完了** - `/orders`, `/commissions`, `/settings`, `/guide` 実装、本番デプロイ
- 2026-01-29: Phase 1完了 - ランディング、認証、ダッシュボード、商品カタログ

---

## 参考リンク

- [anyStarr公式](https://anystarr.com/)
- [abComo（運営会社）](https://abcomo.com/)
- [TikTok Shop Affiliate](https://business.tiktokshop.com/us/affiliate)
