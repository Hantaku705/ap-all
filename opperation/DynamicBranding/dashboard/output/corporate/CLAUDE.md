# corporate/

## 概要

コーポレート分析結果のJSONキャッシュ。株価、MVV、ファン資産データを保存。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `1-summary.json` | 企業サマリー（製品ブランド集計） |
| `1-stock.json` | 株価時系列データ（5年分） |
| `1-correlation.json` | 株価×UGC相関係数 |
| `1-mvv.json` | MVV/パーソナリティ（LLM生成） |
| `1-fans.json` | ファンセグメント分布 |
| `1-buzz-impact.json` | バズ影響投稿 |
| `1-personality-report.txt` | パーソナリティ分析レポート |

## 命名規則

`{corpId}-{dataType}.json`（現在は corpId=1 のみ）

## 関連ディレクトリ

- `../../src/app/api/corporate/` - コーポレートAPI
- `../../src/components/corporate/` - 表示コンポーネント

## 注意事項

- MVVは24時間TTLでキャッシュ
- 株価データはYahoo Finance APIから取得

## 更新履歴

- 2026-01-23: 初版作成
