# scripts/ - 分析スクリプト

データ分析用のスクリプトを格納するフォルダ。

---

## ファイル一覧

| ファイル | 説明 | 作成方法 |
|---------|------|----------|
| `google_trends_analysis.py` | Google Trends分析 | Claude が作成 |

---

## google_trends_analysis.py

### 機能

- Google Trends CSVデータの読み込み
- ブランド間の相関係数計算
- 季節性分析（月別平均・標準偏差）
- 結果をMarkdown形式で出力

### 使用方法

```bash
python google_trends_analysis.py
```

### 入力

- `../../data/trends/google-trends-data.csv`

### 出力

- `../analysis/correlation-matrix.md`
- `../analysis/seasonality-analysis.md`

---

## 新規スクリプト追加時

1. このフォルダに `.py` または `.js` ファイルを追加
2. この CLAUDE.md にファイル説明を追記
3. 入出力パスを明記

---

## 更新履歴

- 2026-01-16: 初版作成
