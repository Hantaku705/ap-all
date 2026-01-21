# webapp/ - 提案書可視化アプリ

Dr.Melaxinマーケティング提案書（$10M版）を可視化するNext.jsアプリ。

---

## 基本情報

| 項目 | 値 |
|------|-----|
| 本番URL | https://dr-melaxin-proposal.vercel.app |
| フレームワーク | Next.js 16.1.4 (App Router) |
| UI | Tailwind CSS |
| グラフ | Recharts |

---

## 主要数値

| 項目 | 値 |
|------|-----|
| 年間投資 | 15.8億円 |
| 年間GMV | 73.6億円 |
| 年間ROAS | 466% |
| 年間Reach | 約6.6億UU |

---

## ページ構成

| パス | 内容 | 主要コンポーネント |
|-----|------|------------------|
| `/` | 提案書（4タブ構成） | ProposalTabs, StrategyContent, TacticsListContent, MediaPlanContent, ActivationCalendarContent |
| `/quarterly` | 四半期別プラン | QuarterlyTabs, ReachTrendChart |
| `/dashboard` | Reachダッシュボード | SnsPieChart, ReachEfficiencyChart, ReachTrendChart |
| `/matrix` | マトリックスビュー | FilterableMatrix |
| `/research` | 競合リサーチ | - |

### 提案書タブ構成（`/`）

| タブ | 内容 | 主要コンポーネント |
|-----|------|------------------|
| **Strategy** | OGSM戦略サマリー | StrategyContent |
| **Tactics** | 施策一覧マスター | TacticsListContent |
| **Media Plan** | メディアプラン | MediaPlanContent |
| **Calendar** | アクティベーションカレンダー | ActivationCalendarContent |

### 施策一覧（Tactics）

- **表示項目**: 施策名/SNS/目的/役割・狙い/優先度/年間予算/年間Reach/投稿数/フォロワー計/平均フォロワー
- **KPIカード**: 施策数/年間投資/年間Reach/高優先度施策/合計投稿数/合計フォロワー
- **フィルター**: SNS別、目的別
- **ソート**: 優先順位/予算/Reach
- **施策数**: 11施策（アンバサダー含む）

---

## コンポーネント

### タブ・ナビゲーション

| コンポーネント | 用途 | 使用ページ |
|--------------|------|-----------|
| `ProposalTabs` | 4タブ切り替え（Strategy/Tactics/Media Plan/Calendar） | `/` |
| `QuarterlyTabs` | Q1-Q4タブ切り替え | `/quarterly` |

### コンテンツ

| コンポーネント | 用途 | 使用ページ |
|--------------|------|-----------|
| `StrategyContent` | OGSM戦略サマリー | `/`（Strategyタブ） |
| `TacticsListContent` | 施策一覧テーブル（フィルター/ソート） | `/`（Tacticsタブ） |
| `MediaPlanContent` | メディアプラン | `/`（Media Planタブ） |
| `ActivationCalendarContent` | カレンダービュー（1スライド統合） | `/`（Calendarタブ） |
| `ReasonAccordion` | 根拠Q&A展開 | `/` |
| `TimelineChart` | 年間タイムライン | `/` |
| `FilterableMatrix` | フィルタ付きマトリックス（両方モードで予算/Reach統合表示） | `/matrix` |

### グラフ

| コンポーネント | 種類 | 用途 |
|--------------|------|------|
| `ReachTrendChart` | AreaChart | Reach推移（月別） |
| `SnsPieChart` | PieChart | SNS別投資/Reach |
| `ReachEfficiencyChart` | ComposedChart | 投資効率（Budget vs Reach） |
| `SalesChart` | LineChart | 累計売上推移 |
| `InvestmentPieChart` | PieChart | 投資内訳 |
| `ChannelBarChart` | BarChart | チャネル別売上 |
| `QuarterlyChart` | ComposedChart | 四半期別投資/売上 |

---

## データファイル

| ファイル | 内容 | 主要Export |
|---------|------|-----------|
| `strategy-data.ts` | OGSM戦略データ | `strategyMeta`, `ogsmSummary`, `highlights`, `csf`, `quarterRoadmap` |
| `tactics-data.ts` | 施策マスターデータ（11施策） | `tacticsMasterData`, `tacticsSummary`, `snsColors` |
| `quarterly-data.ts` | Q1-Q4詳細データ | `q1Data`〜`q4Data`, `quarterSummaries` |
| `matrix-data.ts` | マトリックス形式 | `annualBudgetMatrix`, `annualReachMatrix`, `purposeColors` |
| `reason-data.ts` | 根拠Q&Aデータ | `allReasonCategories` |
| `proposal-data.ts` | 提案書データ | `proposalData` |
| `research-data.ts` | 競合リサーチ | `researchData` |

---

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# デプロイ
vercel --prod --yes
```

---

## Key Files

| ファイル | 用途 |
|---------|------|
| `src/data/strategy-data.ts` | OGSM戦略データ |
| `src/data/quarterly-data.ts` | 四半期別データ |
| `src/data/matrix-data.ts` | マトリックスデータ |
| `src/data/reason-data.ts` | 根拠Q&Aデータ |
| `src/components/QuarterlyTabs.tsx` | 四半期タブUI |
| `src/components/FilterableMatrix.tsx` | マトリックステーブル |
| `src/components/TimelineChart.tsx` | タイムラインUI |
| `src/components/ReasonAccordion.tsx` | Q&Aアコーディオン |
| `src/components/ProposalTabs.tsx` | 4タブ切り替え |
| `src/components/TacticsListContent.tsx` | 施策一覧テーブル |
| `src/components/ActivationCalendarContent.tsx` | カレンダービュー |
| `src/data/tactics-data.ts` | 施策マスターデータ |

---

## 更新時の注意

- データ更新は `src/data/` のファイルを編集
- グラフ追加は `src/components/charts/` にコンポーネント作成
- **ビルド前に型チェック**: `npm run build` で確認
- 型エラーが出たら `quarterly-data.ts` の型定義を確認

### よくあるエラー

| エラー | 原因 | 対処 |
|--------|------|------|
| Property 'xxx' does not exist | データ型とコンポーネントの不一致 | 型定義を確認 |
| Recharts Tooltip formatter | valueの型がnumber以外 | `as number` でキャスト |
| getSnsColor return type | stringを期待 | style属性で直接使用 |

---

## 更新履歴

- 2026-01-21: FilterableMatrix「両方」モードで予算/Reachを1つの表に統合表示
- 2026-01-21: Media PlanにKPIカード追加（投稿数/フォロワー、4→6カード）
- 2026-01-21: Calendarにフォロワー表示追加、tactics-data連携強化
- 2026-01-21: matrix-dataにアンバサダー（グク）を追加（Budget/Reach両方）
- 2026-01-21: 年間ロードマップ追加（Q2=6月Ambassadorを年間最大ピークとして可視化）
- 2026-01-21: 施策一覧に投稿数・フォロワー数を追加（KPIカード6つに拡張）
- 2026-01-21: 4タブUI実装（Strategy/Tactics/Media Plan/Calendar）
- 2026-01-21: 施策一覧（Tactics）タブ追加（11施策、フィルター/ソート機能）
- 2026-01-21: アンバサダー起用（グク）を施策に追加
- 2026-01-21: アクティベーションカレンダー追加（1スライド統合ビュー）
- 2026-01-21: $10M版にフルアップデート（4ページ、7コンポーネント、4データファイル追加）
- 2026-01-20: 初期作成（38億円版、9セクション）
