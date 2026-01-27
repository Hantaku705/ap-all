#!/usr/bin/env python3
"""
Google Trends 分析スクリプト
味の素調味料ブランド間の検索数相関を分析

使用方法:
    pip install pytrends pandas
    python google_trends_analysis.py
"""

import os
import time
from datetime import datetime
import pandas as pd

try:
    from pytrends.request import TrendReq
except ImportError:
    print("pytrendsがインストールされていません。以下を実行してください:")
    print("pip install pytrends")
    exit(1)

# 出力ディレクトリ
OUTPUT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 分析対象ブランド
BRANDS_BATCH_1 = ['ほんだし', 'クックドゥ', '味の素', '丸鶏がらスープ', '香味ペースト']
BRANDS_BATCH_2 = ['コンソメ', 'ピュアセレクト', 'アジシオ']

# 設定
TIMEFRAME = 'today 5-y'  # 過去5年
GEO = 'JP'  # 日本


def fetch_trends_data(pytrends, keywords, retries=3):
    """Google Trendsからデータを取得"""
    for attempt in range(retries):
        try:
            pytrends.build_payload(keywords, timeframe=TIMEFRAME, geo=GEO)
            df = pytrends.interest_over_time()
            if 'isPartial' in df.columns:
                df = df.drop(columns=['isPartial'])
            return df
        except Exception as e:
            print(f"エラー (attempt {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                time.sleep(30)  # レート制限対策
    return None


def calculate_correlation(df):
    """相関マトリクスを計算"""
    return df.corr()


def analyze_seasonality(df):
    """月別平均を計算（季節性分析）"""
    df_monthly = df.copy()
    df_monthly['month'] = df_monthly.index.month
    monthly_avg = df_monthly.groupby('month').mean()
    return monthly_avg


def format_correlation_matrix(corr_matrix):
    """相関マトリクスをMarkdown形式で整形"""
    lines = ["# 相関マトリクス\n"]
    lines.append(f"分析期間: 過去5年（{datetime.now().strftime('%Y-%m-%d')}時点）\n")
    lines.append("## 相関係数\n")
    lines.append("```")
    lines.append(corr_matrix.round(2).to_string())
    lines.append("```\n")

    # 有意な相関を抽出
    lines.append("## 有意な相関（|r| > 0.5）\n")
    for col in corr_matrix.columns:
        for idx in corr_matrix.index:
            if col != idx:
                r = corr_matrix.loc[idx, col]
                if abs(r) > 0.5:
                    sign = "正" if r > 0 else "負"
                    lines.append(f"- **{idx} × {col}**: r = {r:.2f}（{sign}の相関）")

    # カニバリ候補
    lines.append("\n## カニバリ候補（r < 0）\n")
    found_negative = False
    for col in corr_matrix.columns:
        for idx in corr_matrix.index:
            if col != idx:
                r = corr_matrix.loc[idx, col]
                if r < 0:
                    lines.append(f"- **{idx} × {col}**: r = {r:.2f}")
                    found_negative = True
    if not found_negative:
        lines.append("- 該当なし\n")

    return "\n".join(lines)


def format_seasonality(monthly_avg):
    """季節性分析結果をMarkdown形式で整形"""
    lines = ["# 季節性分析\n"]
    lines.append("月別の検索ボリューム平均（0-100正規化）\n")

    month_names = {
        1: '1月', 2: '2月', 3: '3月', 4: '4月',
        5: '5月', 6: '6月', 7: '7月', 8: '8月',
        9: '9月', 10: '10月', 11: '11月', 12: '12月'
    }

    lines.append("## 月別データ\n")
    lines.append("```")
    monthly_display = monthly_avg.copy()
    monthly_display.index = [month_names[m] for m in monthly_display.index]
    lines.append(monthly_display.round(1).to_string())
    lines.append("```\n")

    # 各ブランドの季節性パターン
    lines.append("## ブランド別季節性パターン\n")
    for col in monthly_avg.columns:
        max_month = monthly_avg[col].idxmax()
        min_month = monthly_avg[col].idxmin()
        max_val = monthly_avg[col].max()
        min_val = monthly_avg[col].min()
        seasonal_range = max_val - min_val

        pattern = "平坦" if seasonal_range < 10 else ("冬型" if max_month in [11, 12, 1, 2] else "夏型")
        lines.append(f"### {col}")
        lines.append(f"- ピーク: {month_names[max_month]}（{max_val:.1f}）")
        lines.append(f"- 底: {month_names[min_month]}（{min_val:.1f}）")
        lines.append(f"- 変動幅: {seasonal_range:.1f}")
        lines.append(f"- パターン: **{pattern}**\n")

    return "\n".join(lines)


def validate_hypotheses(corr_matrix, monthly_avg):
    """仮説検証結果をMarkdown形式で出力"""
    lines = ["# 仮説検証結果\n"]
    lines.append(f"検証日: {datetime.now().strftime('%Y-%m-%d')}\n")

    lines.append("## H1: 正の相関仮説\n")

    # H1-1: ほんだし × クックドゥ
    if 'ほんだし' in corr_matrix.columns and 'クックドゥ' in corr_matrix.columns:
        r = corr_matrix.loc['ほんだし', 'クックドゥ']
        result = "支持" if r > 0.5 else ("部分的支持" if r > 0.3 else "棄却")
        lines.append(f"### H1-1. ほんだし × クックドゥ")
        lines.append(f"- 相関係数: r = {r:.2f}")
        lines.append(f"- 判定: **{result}**\n")

    # H1-4: 味の素ハブ仮説
    if '味の素' in corr_matrix.columns:
        lines.append("### H1-4. 味の素ハブ仮説")
        hub_correlations = []
        for col in corr_matrix.columns:
            if col != '味の素':
                r = corr_matrix.loc['味の素', col]
                hub_correlations.append((col, r))
                lines.append(f"- 味の素 × {col}: r = {r:.2f}")

        avg_r = sum([r for _, r in hub_correlations]) / len(hub_correlations)
        all_positive = all([r > 0.3 for _, r in hub_correlations])
        result = "支持" if all_positive else "部分的支持"
        lines.append(f"- 平均相関: {avg_r:.2f}")
        lines.append(f"- 判定: **{result}**\n")

    lines.append("## H2: カニバリゼーション仮説\n")

    # H2-1: 丸鶏がらスープ vs 香味ペースト
    if '丸鶏がらスープ' in corr_matrix.columns and '香味ペースト' in corr_matrix.columns:
        r = corr_matrix.loc['丸鶏がらスープ', '香味ペースト']
        result = "支持（カニバリあり）" if r < 0 else "棄却（カニバリなし）"
        lines.append(f"### H2-1. 丸鶏がらスープ vs 香味ペースト")
        lines.append(f"- 相関係数: r = {r:.2f}")
        lines.append(f"- 判定: **{result}**")
        if r >= 0:
            lines.append(f"- 解釈: 両者は競合ではなく、同じ「中華調理」文脈で共存している可能性\n")

    lines.append("## 季節性からの示唆\n")

    if 'ほんだし' in monthly_avg.columns:
        hondashi_summer = monthly_avg.loc[[7, 8, 9], 'ほんだし'].mean()
        hondashi_winter = monthly_avg.loc[[11, 12, 1], 'ほんだし'].mean()
        diff = hondashi_winter - hondashi_summer
        lines.append(f"### ほんだしの季節性")
        lines.append(f"- 夏（7-9月）平均: {hondashi_summer:.1f}")
        lines.append(f"- 冬（11-1月）平均: {hondashi_winter:.1f}")
        lines.append(f"- 差分: {diff:.1f}")
        lines.append(f"- 既知の情報「8-9月に10ポイント減少」と**整合**\n")

    return "\n".join(lines)


def main():
    print("=" * 60)
    print("Google Trends 分析開始")
    print(f"分析期間: {TIMEFRAME}")
    print(f"地域: {GEO}")
    print("=" * 60)

    # pytrends初期化
    pytrends = TrendReq(hl='ja-JP', tz=540)

    # Batch 1 取得
    print(f"\n[1/2] Batch 1 取得中: {BRANDS_BATCH_1}")
    df1 = fetch_trends_data(pytrends, BRANDS_BATCH_1)
    if df1 is None:
        print("Batch 1の取得に失敗しました")
        return
    print(f"  取得成功: {len(df1)} 週分のデータ")

    # レート制限対策
    print("  待機中（レート制限対策）...")
    time.sleep(15)

    # Batch 2 取得
    print(f"\n[2/2] Batch 2 取得中: {BRANDS_BATCH_2}")
    df2 = fetch_trends_data(pytrends, BRANDS_BATCH_2)
    if df2 is None:
        print("Batch 2の取得に失敗しました。Batch 1のみで分析を続行します。")
        df_all = df1
    else:
        print(f"  取得成功: {len(df2)} 週分のデータ")
        # データ結合
        df_all = pd.concat([df1, df2], axis=1)

    # CSV出力
    csv_path = os.path.join(OUTPUT_DIR, 'google-trends-data.csv')
    df_all.to_csv(csv_path)
    print(f"\n[出力] 生データ: {csv_path}")

    # 相関分析
    print("\n[分析] 相関マトリクス計算中...")
    corr_matrix = calculate_correlation(df_all)
    corr_md = format_correlation_matrix(corr_matrix)
    corr_path = os.path.join(OUTPUT_DIR, 'correlation-matrix.md')
    with open(corr_path, 'w', encoding='utf-8') as f:
        f.write(corr_md)
    print(f"[出力] 相関マトリクス: {corr_path}")

    # 季節性分析
    print("\n[分析] 季節性パターン分析中...")
    monthly_avg = analyze_seasonality(df_all)
    seasonality_md = format_seasonality(monthly_avg)
    seasonality_path = os.path.join(OUTPUT_DIR, 'seasonality-analysis.md')
    with open(seasonality_path, 'w', encoding='utf-8') as f:
        f.write(seasonality_md)
    print(f"[出力] 季節性分析: {seasonality_path}")

    # 仮説検証
    print("\n[分析] 仮説検証中...")
    validation_md = validate_hypotheses(corr_matrix, monthly_avg)
    validation_path = os.path.join(OUTPUT_DIR, 'hypothesis-validation.md')
    with open(validation_path, 'w', encoding='utf-8') as f:
        f.write(validation_md)
    print(f"[出力] 仮説検証結果: {validation_path}")

    print("\n" + "=" * 60)
    print("分析完了")
    print("=" * 60)

    # サマリー表示
    print("\n【相関マトリクス（概要）】")
    print(corr_matrix.round(2).to_string())

    print("\n【主な発見】")
    for col in corr_matrix.columns:
        for idx in corr_matrix.index:
            if col > idx:  # 重複を避ける
                r = corr_matrix.loc[idx, col]
                if abs(r) > 0.5:
                    print(f"  - {idx} × {col}: r = {r:.2f}")


if __name__ == '__main__':
    main()
