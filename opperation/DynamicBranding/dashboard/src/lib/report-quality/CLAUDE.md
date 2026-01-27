# report-quality/

## 概要

レポート品質検出・改善モジュール。低品質セクションを検出し、UGCベースでLLM再生成する。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `detector.ts` | 品質問題検出（テンプレ文言、抽象表現、unknown率） |
| `ugc-fetcher.ts` | セクション別UGCエビデンス取得 |
| `regenerator.ts` | LLMによるセクション再生成 |
| `index.ts` | バレルエクスポート |

## 品質問題タイプ

| タイプ | 説明 | 重大度 |
|--------|------|--------|
| `template_phrase` | テンプレート定型文 | high |
| `too_abstract` | 抽象的すぎる表現 | medium |
| `high_unknown` | unknown率が高い | high |
| `missing_data` | データ欠損 | high |
| `generic_recommendation` | 汎用的な推奨 | medium |

## 関連ディレクトリ

- `../../app/api/reports/` - レポートAPI
- `../../../scripts/brushup-reports.ts` - バッチ改善スクリプト
- `../../../output/reports/` - レポートファイル

## 注意事項

- LLMプロバイダーはOpenAI/Gemini/Claude対応
- 再生成はUGC 50件をサンプリングして実行
- 重大度highの問題を優先して修正

## 更新履歴

- 2026-01-23: 初版作成
