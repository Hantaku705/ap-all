# output/ - 分析レポート出力フォルダ

3軸で整理された分析レポートを格納。

---

## フォルダ構成

```
output/
├── CLAUDE.md
├── by_issue/                    # Issue別分析（問いへの回答）
│   ├── CLAUDE.md
│   ├── issue1/                  # Issue 1: ブランド間双方向性
│   │   ├── report.md
│   │   └── CLAUDE.md
│   ├── issue2/                  # Issue 2: 全体最適のドライバー
│   │   ├── report.md
│   │   └── CLAUDE.md
│   └── issue3/                  # Issue 3: SNS→検索の相関
│       ├── report.md
│       └── CLAUDE.md
├── by_data/                     # Data別分析（基礎データ）
│   ├── CLAUDE.md
│   ├── googletrend/             # Google Trends 基礎分析
│   │   ├── report.md
│   │   └── CLAUDE.md
│   └── sns/                     # SNS 基礎分析
│       ├── report.md
│       └── CLAUDE.md
└── total/                       # 統合分析
    ├── CLAUDE.md
    ├── report_simple.md         # 簡易版（経営層向け）
    └── report_detail.md         # 詳細版（戦略立案者向け）
```

---

## 3軸の整理

| 軸 | フォルダ | 内容 | 主な読者 |
|---|---------|------|---------|
| **Issue別** | `by_issue/` | 問いへの回答 | 戦略立案者 |
| **Data別** | `by_data/` | 基礎データ分析 | 分析担当 |
| **統合** | `total/` | 全体統合・結論 | 経営層 |

---

## 各フォルダの詳細

### by_issue/（Issue別分析）

問い（Issue）ごとの回答レポート。

| フォルダ | Issue | 主要な回答 |
|---------|-------|-----------|
| `issue1/` | ブランド間双方向性 | だし連合、MSG波及、棲み分け |
| `issue2/` | 全体最適のドライバー | 味の素（条件付き）、だし訴求、守り×攻め二軸 |
| `issue3/` | SNS→検索の相関 | 同時相関あり、因果性は未検出 |

### by_data/（Data別分析）

データソースごとの基礎分析。Issue回答を含まない。

| フォルダ | データ | 主要な発見 |
|---------|--------|-----------|
| `googletrend/` | Google Trends（262週） | 相関マトリクス、季節性 |
| `sns/` | SNS（50,000件） | 言及数、共起、センチメント |

### total/（統合分析）

全Issue×全Dataを統合した最終レポート。

| ファイル | 対象読者 | 内容 |
|---------|---------|------|
| `report_simple.md` | 経営層 | 結論のみ（1ページ） |
| `report_detail.md` | 戦略立案者 | 詳細分析（フル） |

---

## レポート間の関係

```
by_data/（基礎データ）
├── googletrend/report.md → 相関・季節性の生データ
└── sns/report.md → 言及・共起・センチメントの生データ
        ↓
by_issue/（問いへの回答）
├── issue1/report.md → Q1-1〜Q1-3 に回答
├── issue2/report.md → Q2-1〜Q2-3 に回答
└── issue3/report.md → Q3-1 に回答
        ↓
total/（統合分析）
├── report_simple.md → 結論のみ
└── report_detail.md → 詳細分析
```

---

## 更新履歴

- 2026-01-16: 3軸（Issue/Data/Total）に再構成
- 2026-01-16: issue3/ 追加（SNS→検索の相関分析）
- 2026-01-16: フォルダ構成を3分割（total/sns/googletrend）
- 2026-01-16: 初版作成
