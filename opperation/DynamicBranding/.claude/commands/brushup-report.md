---
description: "/brushup-report - 低品質レポートセクションを検出し、UGCエビデンスに基づいて改善"
---

# /brushup-report - レポート品質向上

全8ブランドのレポートを分析し、低品質セクションをSupabaseのUGCエビデンス（50,000件）に基づいて自動改善するコマンド。

## このコマンドでできること

1. **品質診断**: テンプレート文言、抽象的な推奨、高いunknown率を検出
2. **UGCエビデンス取得**: セクション別に最適なUGC投稿を取得
3. **LLM再生成**: UGCを根拠にfindings/insights/recommendationsを改善
4. **レポート更新**: JSON/Markdownを自動更新（バックアップ付き）

## 実行手順

### Phase 1: 品質診断（--dry-run）

まず問題を確認:

```bash
cd /Users/hantaku/Downloads/DynamicBranding/dashboard
npx tsx scripts/brushup-reports.ts --dry-run
```

出力例:
```
Processing: ほんだし
Quality issues detected: 12
  - HIGH: 3
  - MEDIUM: 7
  - LOW: 2

Detected issues:
  [HIGH] ユーザー像: unknown率が86%で閾値50%を超過
  [MEDIUM] 弱み/リスク: 推奨事項が短すぎる（8文字 < 15文字）
  ...
```

### Phase 2: 改善実行

問題を確認後、実行:

```bash
npx tsx scripts/brushup-reports.ts
```

### Phase 3: 結果確認

改善後のレポートを確認:

```bash
# JSON確認
cat output/reports/ほんだし/report.json | jq '.strategy.keyInsight'

# バックアップからの差分確認
diff output/reports/ほんだし/report.json output/reports/ほんだし/report.json.bak
```

## オプション一覧

| オプション | 説明 | 例 |
|-----------|------|-----|
| `--brand=xxx` | 単一ブランドのみ処理 | `--brand=ほんだし` |
| `--dry-run` | 診断のみ（変更なし） | - |
| `--verbose` | 詳細ログ出力 | - |
| `--min-severity=xxx` | 最小重要度（high/medium/low） | `--min-severity=high` |

## 品質検出ルール

### ルール1: テンプレート文言（HIGH）

| パターン | 理由 |
|---------|------|
| `分析完了` | 具体的な分析内容がない |
| `データなし` | データ取得に失敗 |
| `DPT分析データを生成中` | 生成処理が未完了 |
| `Analyticsタブで確認可能` | レポート内で完結していない |
| `〇〇が最も多く、△△が続きます` | 数値を並べただけ |

### ルール2: 抽象的な推奨事項（MEDIUM）

| パターン | 例 | 改善後 |
|---------|-----|--------|
| `.*訴求$` | "減塩訴求" | "減塩30%タイプを2026Q2発売。月額500万円でSNS広告展開" |
| `.*強化$` | "SNS強化" | "週3本のReels投稿、料理インフルエンサー3名とコラボ" |
| `<15文字` | "テスト実施" | 5W1H付きで再生成 |

### ルール3: unknown率高い（HIGH）

| セクション | 閾値 |
|-----------|------|
| ユーザー像 | unknown > 50% |
| W's詳細分析 | unknown > 50% |

## UGC取得戦略

セクション別に最適なフィルタリングを適用:

| セクション | フィルター | 件数 |
|-----------|-----------|------|
| ユーザー像 | `life_stage != 'unknown'` | 30 |
| CEP分析 | `cep_id IS NOT NULL` | 30 |
| 代表メニュー | `dish_category != 'unknown'` | 30 |
| W's詳細 | `meal_occasion IS NOT NULL` | 30 |
| 弱み/リスク | `sentiment = 'negative'` | 30 |
| コンテンツ | `engagement_total > 100` | 30 |

## 注意事項

1. **バックアップ**: 更新前に`.bak`ファイルを自動作成
2. **UGC不足**: 5件未満の場合はそのセクションをスキップ
3. **LLM必須**: `OPENAI_API_KEY`または`GEMINI_API_KEY`が必要
4. **実行時間**: 全8ブランドで約5-10分

## 関連コマンド

- `/generate-reports` - レポートの新規生成
- `/review-changes` - 変更内容のレビュー
- `/quick-commit` - 変更のコミット

## モジュール構成

```
dashboard/src/lib/report-quality/
├── index.ts          # エクスポート
├── detector.ts       # 品質検出ルール
├── ugc-fetcher.ts    # UGCエビデンス取得
└── regenerator.ts    # LLM再生成ロジック

dashboard/scripts/
└── brushup-reports.ts  # メイン実行スクリプト
```
