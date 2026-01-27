#!/usr/bin/env python3
"""
SNSデータ加工スクリプト

content有りの行を抽出し、派生カラムを追加、ソース別に分割して出力。
"""

import pandas as pd
import re
import json
from pathlib import Path

# パス設定
BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "data" / "sns"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
BY_SOURCE_DIR = DATA_DIR / "by_source"

# ブランド検出パターン
BRAND_PATTERNS = {
    "味の素": r"味の素|AJINOMOTO|アジノモト",
    "ほんだし": r"ほんだし|本だし|ホンダシ",
    "クックドゥ": r"クックドゥ|Cook\s*Do|CookDo|cookdo",
    "コンソメ": r"コンソメ|consomme",
    "丸鶏がらスープ": r"丸鶏がら|まるどりがら|鶏がらスープ",
    "香味ペースト": r"香味ペースト|こうみペースト",
    "ピュアセレクト": r"ピュアセレクト|Pure\s*Select|pureselect",
    "アジシオ": r"アジシオ|あじしお|味塩",
    "鍋キューブ": r"鍋キューブ|なべキューブ",
}

# ネガティブKWパターン（MSG批判関連）
NEGATIVE_PATTERNS = [
    r"体に悪い",
    r"身体に悪い",
    r"健康に悪い",
    r"MSG",
    r"グルタミン酸",
    r"化学調味料",
    r"人工調味料",
    r"添加物",
    r"不健康",
    r"危険",
]


def detect_brands(text: str) -> list[str]:
    """テキストから言及されているブランドを検出"""
    if not isinstance(text, str) or not text:
        return []

    detected = []
    for brand, pattern in BRAND_PATTERNS.items():
        if re.search(pattern, text, re.IGNORECASE):
            detected.append(brand)
    return detected


def has_negative_keywords(text: str) -> bool:
    """ネガティブKWが含まれているかチェック"""
    if not isinstance(text, str) or not text:
        return False

    combined_pattern = "|".join(NEGATIVE_PATTERNS)
    return bool(re.search(combined_pattern, text, re.IGNORECASE))


def categorize_source(source_type: str) -> str:
    """source_typeを簡略化したカテゴリに変換"""
    if not isinstance(source_type, str):
        return "other"

    source_lower = source_type.lower()
    if "twitter" in source_lower or "socialmedia" in source_lower:
        return "twitter"
    elif "news" in source_lower:
        return "news"
    elif "blog" in source_lower:
        return "blog"
    elif "messageboard" in source_lower or "forum" in source_lower:
        return "messageboard"
    else:
        return "other"


def main():
    print("=" * 60)
    print("SNSデータ加工スクリプト")
    print("=" * 60)

    # 元データ読み込み
    raw_files = list(RAW_DIR.glob("*.csv"))
    if not raw_files:
        print("ERROR: raw/ フォルダにCSVファイルが見つかりません")
        return

    raw_file = raw_files[0]
    print(f"\n1. 元データ読み込み: {raw_file.name}")

    df = pd.read_csv(raw_file, encoding="utf-8")
    print(f"   総行数: {len(df):,}")

    # content有りでフィルタ
    print("\n2. content有りでフィルタリング")
    df_with_content = df[df["content"].notna() & (df["content"] != "")].copy()
    print(f"   content有り: {len(df_with_content):,} 行 ({len(df_with_content)/len(df)*100:.1f}%)")

    # 派生カラム追加
    print("\n3. 派生カラム追加")

    # ブランド検出
    df_with_content["brand_mentions"] = df_with_content["content"].apply(detect_brands)
    df_with_content["brand_count"] = df_with_content["brand_mentions"].apply(len)
    df_with_content["is_multi_brand"] = df_with_content["brand_count"] > 1

    # コンテンツ長
    df_with_content["content_length"] = df_with_content["content"].apply(
        lambda x: len(x) if isinstance(x, str) else 0
    )

    # ネガティブKW
    df_with_content["has_negative_kw"] = df_with_content["content"].apply(has_negative_keywords)

    # ソースカテゴリ
    df_with_content["source_category"] = df_with_content["source_type"].apply(categorize_source)

    # brand_mentionsをカンマ区切り文字列に変換（CSV出力用）
    df_with_content["brand_mentions_str"] = df_with_content["brand_mentions"].apply(
        lambda x: ",".join(x) if x else ""
    )

    print(f"   ブランド言及あり: {(df_with_content['brand_count'] > 0).sum():,} 行")
    print(f"   複数ブランド言及: {df_with_content['is_multi_brand'].sum():,} 行")
    print(f"   ネガティブKW含有: {df_with_content['has_negative_kw'].sum():,} 行")

    # processed/full.csv 出力
    print("\n4. processed/full.csv 出力")
    full_columns = ["url", "published", "title", "content", "lang", "source_type",
                    "extra_author_attributes.name"]
    df_full = df_with_content[full_columns].copy()
    df_full.to_csv(PROCESSED_DIR / "full.csv", index=False, encoding="utf-8")
    print(f"   出力: {len(df_full):,} 行")

    # processed/with_brands.csv 出力
    print("\n5. processed/with_brands.csv 出力")
    brands_columns = full_columns + ["brand_mentions_str", "brand_count", "is_multi_brand",
                                      "content_length", "has_negative_kw", "source_category"]
    df_brands = df_with_content[brands_columns].copy()
    df_brands = df_brands.rename(columns={"brand_mentions_str": "brand_mentions"})
    df_brands.to_csv(PROCESSED_DIR / "with_brands.csv", index=False, encoding="utf-8")
    print(f"   出力: {len(df_brands):,} 行")

    # ソース別分割
    print("\n6. ソース別分割 (by_source/)")
    source_counts = {}
    for source_cat in ["twitter", "news", "blog", "messageboard", "other"]:
        df_source = df_with_content[df_with_content["source_category"] == source_cat]
        if len(df_source) > 0:
            output_file = BY_SOURCE_DIR / f"{source_cat}.csv"
            df_source[brands_columns].rename(
                columns={"brand_mentions_str": "brand_mentions"}
            ).to_csv(output_file, index=False, encoding="utf-8")
            source_counts[source_cat] = len(df_source)
            print(f"   {source_cat}.csv: {len(df_source):,} 行")

    # 統計サマリー生成
    print("\n7. summary_stats.json 生成")

    # ブランド別言及数
    brand_mention_counts = {}
    for brand in BRAND_PATTERNS.keys():
        count = df_with_content["brand_mentions"].apply(lambda x: brand in x).sum()
        brand_mention_counts[brand] = int(count)

    stats = {
        "総行数_元データ": int(len(df)),
        "content有り": int(len(df_with_content)),
        "content欠損": int(len(df) - len(df_with_content)),
        "content有り率": round(len(df_with_content) / len(df) * 100, 2),
        "ブランド言及あり": int((df_with_content["brand_count"] > 0).sum()),
        "複数ブランド言及": int(df_with_content["is_multi_brand"].sum()),
        "ネガティブKW含有": int(df_with_content["has_negative_kw"].sum()),
        "ネガティブ率": round(df_with_content["has_negative_kw"].mean() * 100, 2),
        "平均コンテンツ長": round(df_with_content["content_length"].mean(), 1),
        "ソース別件数": source_counts,
        "ブランド別言及数": brand_mention_counts,
    }

    with open(PROCESSED_DIR / "summary_stats.json", "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

    print(f"   出力完了")

    # 完了サマリー
    print("\n" + "=" * 60)
    print("完了サマリー")
    print("=" * 60)
    print(f"元データ: {len(df):,} 行")
    print(f"加工後: {len(df_with_content):,} 行 ({len(df_with_content)/len(df)*100:.1f}%)")
    print(f"\n出力ファイル:")
    print(f"  - processed/full.csv ({len(df_full):,} 行)")
    print(f"  - processed/with_brands.csv ({len(df_brands):,} 行)")
    print(f"  - processed/summary_stats.json")
    for source, count in source_counts.items():
        print(f"  - by_source/{source}.csv ({count:,} 行)")

    print("\nブランド別言及数:")
    for brand, count in sorted(brand_mention_counts.items(), key=lambda x: -x[1]):
        print(f"  {brand}: {count:,}")


if __name__ == "__main__":
    main()
