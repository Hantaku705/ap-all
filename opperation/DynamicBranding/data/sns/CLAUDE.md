# data/sns/ - SNS口コミデータ

SNS監視ツールから出力されたCSVデータを格納。加工済みデータも含む。

---

## フォルダ構成

```
sns/
├── CLAUDE.md
├── raw/                              # 元データ
│   └── export_...nTGpbik7.csv        # 50,000行（未加工）
├── processed/                        # 加工済みデータ
│   ├── full.csv                      # content有り全件（8,517行）
│   ├── with_brands.csv               # ブランド言及等の派生カラム付き
│   └── summary_stats.json            # 統計サマリー
├── by_source/                        # ソース別分割
│   ├── twitter.csv                   # 3,215行
│   ├── news.csv                      # 3,023行
│   ├── blog.csv                      # 1,244行
│   ├── messageboard.csv              # 1,031行
│   └── other.csv                     # 4行
└── archive/                          # 過去データ
    ├── export_...gZa328bG.csv
    └── export_...7vWuGBkF.csv
```

---

## データ概要

| 指標 | 値 |
|------|-----|
| 元データ総行数 | 50,000 |
| content有り | 8,517 (17.0%) |
| content欠損 | 41,483 (83.0%) |
| ブランド言及あり | 4,507 |
| 複数ブランド言及 | 1,179 |
| ネガティブKW含有 | 98 (1.15%) |

---

## ブランド別言及数

| ブランド | 言及数 |
|---------|--------|
| 味の素 | 3,740 |
| コンソメ | 1,048 |
| ほんだし | 279 |
| 丸鶏がらスープ | 254 |
| クックドゥ | 240 |
| アジシオ | 102 |
| 香味ペースト | 24 |
| 鍋キューブ | 16 |

---

## ソース別件数

| ソース | 件数 | 割合 |
|--------|------|------|
| Twitter | 3,215 | 37.7% |
| ニュース | 3,023 | 35.5% |
| ブログ | 1,244 | 14.6% |
| 掲示板 | 1,031 | 12.1% |
| その他 | 4 | 0.05% |

---

## 加工済みファイル詳細

### processed/full.csv

content有りの行のみ抽出。元カラムを保持。

| カラム | 説明 |
|--------|------|
| url | 投稿URL |
| published | 投稿日時 |
| title | 投稿タイトル |
| content | 投稿内容 |
| lang | 言語コード |
| source_type | ソース種別 |
| extra_author_attributes.name | 投稿者名 |

### processed/with_brands.csv

full.csv + 派生カラム

| カラム | 説明 |
|--------|------|
| brand_mentions | 言及ブランド（カンマ区切り） |
| brand_count | 言及ブランド数 |
| is_multi_brand | 複数ブランド言及フラグ |
| content_length | 本文文字数 |
| has_negative_kw | ネガティブKW含有フラグ |
| source_category | ソースカテゴリ（twitter/news/blog/messageboard） |

---

## 加工スクリプト

- **ファイル**: `research/scripts/process_sns_data.py`
- **実行方法**: `python3 research/scripts/process_sns_data.py`

---

## content欠損の原因

- Twitter API制限により、投稿本文が取得できなかった行
- URL情報のみが残っている状態
- 再取得不可（過去データのため）

---

## データソース

- **ツール**: AnyMind Group
- **クエリ**: `research/query/query.md`

---

## 更新履歴

- 2026-01-16: 加工パイプライン構築（raw/processed/by_source構成）
- 2026-01-16: archive/ フォルダを作成、旧データを移動
