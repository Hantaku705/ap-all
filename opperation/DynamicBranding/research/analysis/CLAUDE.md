# analysis/ - 分析結果

Google Trends データ等を分析した結果を格納するフォルダ。

---

## サブフォルダ一覧

| フォルダ | 説明 |
|---------|------|
| `correlation-matrix/` | 相関マトリクス |
| `seasonality-analysis/` | 季節性分析 |
| `hypothesis-validation/` | 仮説検証結果 |
| `issue3/` | Issue 3: SNS→検索の相関分析 |

---

## 分析手法

### correlation-matrix/（相関マトリクス）

- **データ**: Google Trends（過去5年）
- **手法**: ピアソン相関係数
- **出力**: ブランドペアの相関係数マトリクス

### seasonality-analysis/（季節性分析）

- **データ**: Google Trends（過去5年）
- **手法**: 月別平均値・標準偏差
- **出力**: 各ブランドのピーク月・ボトム月

### hypothesis-validation/（仮説検証結果）

- **入力**: brief/hypothesis/hypothesis.md の仮説
- **検証**: correlation-matrix.md の相関係数と照合
- **出力**: 仮説の支持/棄却

---

## 分析フロー

```
1. Google Trends からCSVエクスポート
2. scripts/ のPythonスクリプトで分析
3. correlation-matrix/ / seasonality-analysis/ に出力
4. hypothesis-validation/ で仮説を検証
5. brief/hypothesis/hypothesis.md に結果を追記
```

---

## 更新履歴

- 2026-01-16: 初版作成
- 2026-01-16: research/ 直下から analysis/ に移動
- 2026-01-16: フォルダ構造に移行
