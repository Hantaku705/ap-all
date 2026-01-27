# trends/ - Google Trendsデータ

Google Trendsから出力されたCSVデータを格納。

---

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `google-trends-data.csv` | ブランド別検索トレンド（過去5年） |

---

## データソース

- **ツール**: Google Trends
- **期間**: 過去5年
- **地域**: 日本

---

## 対象ブランド

1. ほんだし
2. クックドゥ
3. 味の素
4. 丸鶏がらスープ
5. 香味ペースト
6. コンソメ
7. ピュアセレクト
8. アジシオ

---

## 分析スクリプト

- `research/scripts/google_trends_analysis.py`

## 出力先

- `research/analysis/correlation-matrix.md`
- `research/analysis/seasonality-analysis.md`

---

## 更新履歴

- 2026-01-16: research/ から移動


