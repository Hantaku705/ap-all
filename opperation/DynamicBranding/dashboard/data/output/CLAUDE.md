# output/ - 分析レポート出力フォルダ

各Issueの分析レポートを格納。

---

## フォルダ構成

```
output/
├── CLAUDE.md              # このファイル
├── total/                 # 統合レポート（SNS × Google Trends）【Issue 1/2】
│   ├── CLAUDE.md
│   ├── report_simple/     # 簡易版（経営層向け）
│   │   ├── report_simple.md
│   │   └── CLAUDE.md
│   └── report_detail/     # 詳細版（戦略立案者向け）
│       ├── report_detail.md
│       └── CLAUDE.md
├── sns/                   # SNS分析レポート
│   ├── CLAUDE.md
│   └── report/
│       ├── report.md
│       └── CLAUDE.md
├── googletrend/           # Google Trends分析レポート
│   ├── CLAUDE.md
│   └── report/
│       ├── report.md
│       └── CLAUDE.md
└── issue3/                # Issue 3: SNS→検索の相関分析
    ├── CLAUDE.md
    └── report/
        ├── report.md
        └── CLAUDE.md
```

---

## 各フォルダの用途

| フォルダ | 内容 | 主な読者 |
|---------|------|---------|
| `total/` | 両データソースの統合分析・納得性評価【Issue 1/2】 | 経営層・戦略立案者 |
| `sns/` | ブランド言及数・共起分析・センチメント | SNS担当・PR担当 |
| `googletrend/` | 相関マトリクス・季節性・時系列 | マーケティング・広告担当 |
| `issue3/` | SNS→検索の相関分析【Issue 3】 | マーケティング・SNS担当 |

---

## レポート間の関係

- `sns/` と `googletrend/` は独立して読める単体レポート
- `total/` は両方を統合し、納得性評価を付与した意思決定用レポート
- `issue3/` はSNS言及と検索の因果関係を検証した独立レポート

---

## 更新履歴

- 2026-01-16: issue3/ 追加（SNS→検索の相関分析）
- 2026-01-16: フォルダ構成を3分割（total/sns/googletrend）
- 2026-01-16: 初版作成（report.md）
- 2026-01-16: 各レポートをサブフォルダ化
