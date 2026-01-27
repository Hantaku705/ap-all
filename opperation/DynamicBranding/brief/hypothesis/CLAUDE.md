# hypothesis.md - 仮説と検証結果

Issue 1/2 に対する仮説とデータ検証結果。

---

## 概要

- **作成日**: 2026-01-16
- **作成方法**: issue.mdをベースにClaudeが作成、Google Trends/SNSデータで検証
- **データソース**: Google Trends（262週）、SNS口コミ（50,000件）

---

## 内容

### 仮説カテゴリ

| カテゴリ | 例 |
|---------|-----|
| H1: 正の相関仮説 | ほんだし×クックドゥ、味の素ハブ仮説 |
| H2: カニバリ仮説 | 丸鶏がら vs 香味ペースト |
| H3: ネガティブ波及仮説 | MSG批判の波及リスク |

### 検証結果サマリ

- H1-1: ほんだし×クックドゥ → **棄却**（r = -0.11）
- H1-4: 味の素ハブ → **部分的支持**
- **意外な発見**: ほんだし×コンソメが最強相関（r = 0.38）

---

## 関連ファイル

- `../issue/issue.md` - Issue定義
- `../../research/analysis/hypothesis-validation/hypothesis-validation.md` - 詳細検証
- `../../output/total/report_detail/report_detail.md` - 統合レポート

---

## 更新履歴

- 2026-01-16: 初版作成
- 2026-01-16: Google Trends検証結果追記
- 2026-01-16: SNS分析結果で全面改訂
