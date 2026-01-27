# correlation-matrix.md - ブランド間相関マトリクス

8ブランド間のピアソン相関係数を算出。

---

## 概要

- **作成日**: 2026-01-16
- **作成方法**: Google Trends週次データからPythonで算出
- **データソース**: Google Trends（262週分）

---

## 内容

### 主要な発見

| ペア | 相関係数 | 解釈 |
|------|---------|------|
| ほんだし×コンソメ | r = 0.38 | **最強の正の相関**（だし連合） |
| 味の素×アジシオ | r = 0.35 | うま味連合 |
| ほんだし×クックドゥ | r = -0.11 | 負の相関（和食vs中華） |
| 香味ペースト×味の素 | r = -0.17 | 独自ポジション |

### マトリクス形式

8×8の相関マトリクス（全64ペア）

---

## 関連ファイル

- `../seasonality-analysis/seasonality-analysis.md` - 季節性分析
- `../hypothesis-validation/hypothesis-validation.md` - 仮説検証
- `../../../data/trends/google-trends-data.csv` - 元データ

---

## 更新履歴

- 2026-01-16: 初版作成
