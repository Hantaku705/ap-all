# data/ - データ格納フォルダ

分析に使用する生データを格納するフォルダ。

---

## フォルダ構成

```
data/
├── CLAUDE.md       # このファイル
├── sns/            # SNSツール出力CSV
│   └── export_*.csv
└── trends/         # Google Trends出力CSV
    └── google-trends-data.csv
```

---

## サブフォルダ

| フォルダ | 内容 | ソース |
|---------|------|--------|
| `sns/` | SNS口コミデータ | AnyMind等のSNS監視ツール |
| `trends/` | 検索トレンドデータ | Google Trends |

---

## ファイル命名規則

### sns/

```
export_[ツール名]_[ブランド名]_[ID].csv
```

例: `export_AnyMindGroup_味の素_9N8JZWIR.csv`

### trends/

```
[データ種別]-data.csv
```

例: `google-trends-data.csv`

---

## 注意事項

- CSVファイルは `.gitignore` で除外推奨（サイズが大きい）
- 機密データは含めない
- 分析結果は `research/analysis/` に出力

---

## 更新履歴

- 2026-01-16: フォルダ構造を整理
