# research/ - リサーチ関連

SNSデータ取得・分析に関するドキュメントとスクリプト。

---

## フォルダ構成

```
research/
├── CLAUDE.md              # このファイル（リサーチ全体の説明）
├── query/                 # SNSクエリ関連
│   ├── CLAUDE.md          # query/ の説明
│   └── query/             # コピペ用クエリ集
│       ├── query.md
│       └── CLAUDE.md
├── keywords/              # キーワード設計
│   ├── CLAUDE.md          # keywords/ の説明
│   └── sns-keywords/      # KW設計書
│       ├── sns-keywords.md
│       └── CLAUDE.md
├── analysis/              # 分析結果
│   ├── CLAUDE.md          # analysis/ の説明
│   ├── correlation-matrix/
│   │   ├── correlation-matrix.md
│   │   └── CLAUDE.md
│   ├── seasonality-analysis/
│   │   ├── seasonality-analysis.md
│   │   └── CLAUDE.md
│   └── hypothesis-validation/
│       ├── hypothesis-validation.md
│       └── CLAUDE.md
└── scripts/               # 分析スクリプト
```

---

## サブフォルダの役割

| フォルダ | 役割 | 主要サブフォルダ |
|---------|------|-----------------|
| `query/` | SNSツールに投入するクエリ | `query/query/` |
| `keywords/` | キーワード設計・戦略 | `sns-keywords/` |
| `analysis/` | 分析結果の出力 | 相関・季節性・仮説検証 |
| `scripts/` | 分析用スクリプト | Python/Node.js |

---

## ワークフロー

```
1. keywords/sns-keywords/sns-keywords.md でKW戦略を設計
2. query/query/query.md でクエリを作成・最適化
3. SNSツールでデータ取得（CSV出力）
4. scripts/ でデータ分析
5. analysis/ に結果を出力
```

---

## 更新履歴

- 2026-01-16: フォルダ構造を整理
- 2026-01-16: SNSクエリの最適化（3回の反復改善）
- 2026-01-16: 各ファイルをサブフォルダ化
