# ポジショニングマップ Webapp パターン

任意のカテゴリの商品・ブランドを2軸でマッピングし、散布図＋テーブルで可視化するWebappの設計パターン。

---

## 1. 軸設計（最初に決める）

| 項目 | 内容 |
|------|------|
| X軸 | 左端（-5）と右端（+5）の意味を定義 |
| Y軸 | 下端（-5）と上端（+5）の意味を定義 |
| スコア範囲 | -5〜+5（整数） |
| カテゴリ | 3区分（価格帯）、各区分に色を割り当て |

### 軸設計の例

| カテゴリ | X軸（左→右） | Y軸（下→上） |
|---------|-------------|-------------|
| シャンプー | 機能訴求 → 感性訴求 | 日常 → 特別感 |
| スキンケア | 成分・機能訴求 → 体験・感性訴求 | ベーシック・日常ケア → ラグジュアリー・特別感 |
| リップ | 色持ち・機能訴求 → 発色・感性訴求 | ナチュラル・日常使い → 華やか・特別感 |
| 飲料 | 機能性 → 嗜好性 | 日常 → ハレの日 |
| アパレル | ベーシック → トレンド | カジュアル → フォーマル |

### スコアリング基準

```
-5〜-3: 強く左/下寄り
-2〜-1: やや左/下寄り
 0:     中立
+1〜+2: やや右/上寄り
+3〜+5: 強く右/上寄り
```

---

## 2. データ収集手順

### デフォルト: Web検索（PR TIMES優先）

優先度順:
1. **PR TIMES**: `site:prtimes.jp {カテゴリ名} {ブランド名}` でプレスリリースからタグライン・コンセプトを収集
2. **公式サイト**: 各ブランドの公式サイトからタグライン・コンセプトを取得
3. **@cosme等**: 口コミサイトのブランドページから補完

### 収集する情報

| フィールド | 必須 | 説明 |
|-----------|------|------|
| brand | ◎ | ブランド名 |
| maker | ◎ | メーカー名 |
| price | ◎ | 代表商品の価格（円） |
| priceCategory | ◎ | 価格帯区分（3区分） |
| tagline | ◎ | ブランドのタグライン/コンセプト |
| catchcopy | ○ | キャッチコピー（あれば） |
| url | ○ | 公式サイトURL |
| taglineFC | ◎ | ファクトチェック済みフラグ（初期値: false） |
| taglineSourceUrl | ○ | タグライン確認元URL |
| x | ◎ | X軸スコア（-5〜+5） |
| y | ◎ | Y軸スコア（-5〜+5） |

### 目標件数

30〜50ブランド、3価格帯にバランスよく配分。

### オプション: SNS口コミデータ

Meltwater等のソーシャルリスニングデータがある場合:
- CSV取得 → ブランド抽出 → タグライン補完
- `source/` フォルダにCSVを配置

### ファクトチェック

- タグラインは必ず公式サイト or PR TIMESで確認
- 確認済み: `taglineFC: true` + `taglineSourceUrl` を設定
- 未確認: `taglineFC: false`

---

## 3. データ構造

```typescript
// インターフェースはカテゴリに合わせてカスタマイズ
// 例: ShampooTagline, SkincareTagline, LipTagline
export interface {Category}Tagline {
  brand: string
  maker: string
  price: number
  priceCategory: string       // 3区分（例: "petit" | "middle" | "luxury"）
  catchcopy?: string
  tagline: string
  url?: string
  taglineFC: boolean
  taglineSourceUrl?: string
  catchcopyFC?: boolean
  catchcopySourceUrl?: string
  x: number                   // X軸スコア（-5〜+5）
  y: number                   // Y軸スコア（-5〜+5）
}

export const priceCategoryLabels: Record<string, string> = {
  // 例: petit: "プチプラ (~1,100円)"
}

export const priceCategoryColors: Record<string, string> = {
  // 例: petit: "#22c55e", middle: "#3b82f6", luxury: "#a855f7"
}
```

---

## 4. UIコンポーネント構成

### PositioningMap（散布図）
- **ライブラリ**: Recharts `ScatterChart`
- **ドメイン**: X/Y共に `-5.5〜5.5`
- **参照線**: X=0, Y=0 で4象限を表示
- **カテゴリ別**: 各カテゴリを異なる色の `Scatter` として描画
- **ツールチップ**: ホバーでアイテム詳細を表示
- **フィルター**: カテゴリ切り替え（全体/個別）

### DataTable（テーブル一覧）
- **検索**: ブランド名テキスト検索
- **フィルター**: カテゴリフィルター（排他）＋ 軸フィルター（複数選択）
- **ソート**: 全カラムソート可能
  - X軸・Y軸は**高い順（desc）がデフォルト**
  - その他は昇順がデフォルト
- **スコア表示**: ラベル＋数値を併記（例: `特別感 (+4)`）
- **件数表示**: フィルター後の件数を動的表示
- **FCステータス**: ✓（緑）/ ?（黄）/ -（グレー）のバッジ

---

## 5. 実装手順

1. **フォルダ作成**: `projects/{カテゴリ}タグライン/webapp/`
2. **軸設計**: X軸・Y軸の意味とスコアリング基準を決定
3. **データ収集**: PR TIMES・公式サイトからブランド・タグラインを収集（30〜50件）
4. **スコアリング**: 各ブランドにX/Yスコアを付与
5. **Webapp scaffold**: シャンプーWebappをベースにコピー＆カスタマイズ
   - `src/data/{category}-data.ts` — インターフェース＋データ＋ラベル＋色
   - `src/components/PositioningMap.tsx` — 軸ラベル変更
   - `src/components/TaglineTable.tsx` — 軸ラベル変更
   - `src/app/page.tsx` — タイトル・説明変更
6. **動作確認**: `npm run dev` で起動、散布図・テーブル表示確認

---

## 6. リファレンス実装

シャンプータグラインWebapp（最も完成度が高い）:
- `projects/シャンプータグライン/webapp/src/data/tagline-data.ts` — データ構造の参考
- `projects/シャンプータグライン/webapp/src/components/PositioningMap.tsx` — 散布図の参考
- `projects/シャンプータグライン/webapp/src/components/TaglineTable.tsx` — テーブルの参考
- `projects/シャンプータグライン/webapp/src/app/page.tsx` — ページ構成の参考
