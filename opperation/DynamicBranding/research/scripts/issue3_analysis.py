#!/usr/bin/env python3
"""
Issue 3 分析: SNSと指名検索数の相関
- SNS言及数↑ → 指名検索↑ の因果関係を検証
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from scipy import stats
import json
import os

# パス設定
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SNS_PATH = os.path.join(BASE_DIR, 'data/sns/processed/with_brands.csv')
TRENDS_PATH = os.path.join(BASE_DIR, 'data/trends/google-trends-data.csv')
OUTPUT_DIR = os.path.join(BASE_DIR, 'research/analysis/issue3')

# ブランドリスト
BRANDS = ['ほんだし', 'クックドゥ', '味の素', '丸鶏がらスープ', '香味ペースト', 'コンソメ', 'ピュアセレクト', 'アジシオ']

def parse_date(date_str):
    """DD/MM/YY HH:MM:SS形式の日付をパース"""
    try:
        # YY/MM/DD HH:MM:SS形式を試す
        dt = datetime.strptime(date_str, '%y/%m/%d %H:%M:%S')
        return dt
    except:
        try:
            # DD/MM/YY HH:MM:SS形式を試す
            dt = datetime.strptime(date_str, '%d/%m/%y %H:%M:%S')
            return dt
        except:
            return None

def get_week_start(dt):
    """日曜日を週の開始日として取得"""
    if dt is None:
        return None
    # 日曜日 = 6
    days_since_sunday = (dt.weekday() + 1) % 7
    return (dt - timedelta(days=days_since_sunday)).date()

def load_sns_data():
    """SNSデータを読み込み、週次に集計"""
    print("Loading SNS data...")
    df = pd.read_csv(SNS_PATH)

    # 日付パース
    df['parsed_date'] = df['published'].apply(parse_date)
    df = df.dropna(subset=['parsed_date'])

    # 週の開始日を計算
    df['week_start'] = df['parsed_date'].apply(get_week_start)

    # ブランドごとの週次集計
    weekly_data = []

    for brand in BRANDS:
        # ブランド言及を含む行を抽出
        brand_df = df[df['brand_mentions'].fillna('').str.contains(brand, na=False)]

        # 週ごとに集計
        for week, group in brand_df.groupby('week_start'):
            mention_count = len(group)
            negative_count = group['has_negative_kw'].sum()
            positive_count = mention_count - negative_count

            weekly_data.append({
                'week_start': week,
                'brand': brand,
                'mention_count': mention_count,
                'positive_count': positive_count,
                'negative_count': negative_count
            })

    weekly_df = pd.DataFrame(weekly_data)
    weekly_df['week_start'] = pd.to_datetime(weekly_df['week_start'])

    print(f"  SNS weekly data: {len(weekly_df)} rows, {weekly_df['week_start'].nunique()} weeks")

    return weekly_df

def load_trends_data():
    """Google Trendsデータを読み込み"""
    print("Loading Google Trends data...")
    df = pd.read_csv(TRENDS_PATH)
    df['date'] = pd.to_datetime(df['date'])

    # 2025年3月〜10月に絞る
    df = df[(df['date'] >= '2025-03-01') & (df['date'] <= '2025-10-31')]

    print(f"  Trends data: {len(df)} weeks ({df['date'].min()} to {df['date'].max()})")

    return df

def merge_data(sns_weekly, trends):
    """SNSとTrendsデータをマージ"""
    print("Merging data...")

    merged_data = []

    for brand in BRANDS:
        # SNSデータ（ブランド別）
        sns_brand = sns_weekly[sns_weekly['brand'] == brand].copy()
        sns_brand = sns_brand.set_index('week_start')

        # Trendsデータ（ブランド別）
        trends_brand = trends[['date', brand]].copy()
        trends_brand = trends_brand.rename(columns={brand: 'search_score'})
        trends_brand = trends_brand.set_index('date')

        # 週単位でマージ
        for idx in trends_brand.index:
            search_score = trends_brand.loc[idx, 'search_score']

            # SNSデータを探す（同じ週または近い週）
            week_key = idx
            if week_key in sns_brand.index:
                row = sns_brand.loc[week_key]
                merged_data.append({
                    'week_start': idx,
                    'brand': brand,
                    'mention_count': row['mention_count'],
                    'positive_count': row['positive_count'],
                    'negative_count': row['negative_count'],
                    'search_score': search_score
                })
            else:
                # SNSデータがない週は0として扱う
                merged_data.append({
                    'week_start': idx,
                    'brand': brand,
                    'mention_count': 0,
                    'positive_count': 0,
                    'negative_count': 0,
                    'search_score': search_score
                })

    merged_df = pd.DataFrame(merged_data)
    print(f"  Merged data: {len(merged_df)} rows")

    return merged_df

def calculate_correlation(merged_df):
    """同時相関を計算"""
    print("\nCalculating simultaneous correlation...")

    results = []

    for brand in BRANDS:
        brand_df = merged_df[merged_df['brand'] == brand]

        if len(brand_df) < 5:
            continue

        mentions = brand_df['mention_count'].values
        search = brand_df['search_score'].values

        # 定数チェック（分散が0だと相関計算不可）
        if np.std(mentions) == 0 or np.std(search) == 0:
            print(f"  {brand}: skipped (constant data)")
            continue

        # 言及数 vs 検索スコア
        corr, p_value = stats.pearsonr(mentions, search)

        results.append({
            'brand': brand,
            'correlation': round(corr, 3),
            'p_value': round(p_value, 4),
            'n_weeks': len(brand_df),
            'significant': p_value < 0.05
        })

        print(f"  {brand}: r={corr:.3f}, p={p_value:.4f}, n={len(brand_df)}")

    return pd.DataFrame(results)

def calculate_lagged_correlation(merged_df, max_lag=4):
    """ラグ付き相関を計算（SNS→検索の因果を検証）"""
    print("\nCalculating lagged correlation (SNS leads Search)...")

    results = []

    for brand in BRANDS:
        brand_df = merged_df[merged_df['brand'] == brand].sort_values('week_start')

        if len(brand_df) < 10:
            continue

        mentions = brand_df['mention_count'].values
        search = brand_df['search_score'].values

        # 定数チェック
        if np.std(mentions) == 0 or np.std(search) == 0:
            continue

        for lag in range(max_lag + 1):
            try:
                if lag == 0:
                    m, s = mentions, search
                else:
                    m, s = mentions[:-lag], search[lag:]

                if len(m) < 5 or np.std(m) == 0 or np.std(s) == 0:
                    continue

                corr, p_value = stats.pearsonr(m, s)

                if np.isnan(corr):
                    continue

                results.append({
                    'brand': brand,
                    'lag_weeks': lag,
                    'correlation': round(corr, 3),
                    'p_value': round(p_value, 4),
                    'significant': p_value < 0.05
                })
            except Exception:
                continue

    lag_df = pd.DataFrame(results)

    # ブランドごとに最良のラグを表示
    print("\n  Best lag per brand (highest |correlation|):")
    for brand in BRANDS:
        brand_lags = lag_df[lag_df['brand'] == brand]
        if len(brand_lags) > 0 and brand_lags['correlation'].notna().any():
            valid = brand_lags[brand_lags['correlation'].notna()]
            if len(valid) > 0:
                best = valid.loc[valid['correlation'].abs().idxmax()]
                print(f"    {brand}: lag={best['lag_weeks']}週, r={best['correlation']:.3f}, p={best['p_value']:.4f}")

    return lag_df

def granger_causality_simple(merged_df):
    """簡易グレンジャー因果性検定（回帰ベース）"""
    print("\nSimple Granger-like causality test...")

    results = []

    for brand in BRANDS:
        brand_df = merged_df[merged_df['brand'] == brand].sort_values('week_start')

        if len(brand_df) < 10:
            continue

        mentions = brand_df['mention_count'].values
        search = brand_df['search_score'].values

        # モデル1: Search(t) ~ Search(t-1)
        # モデル2: Search(t) ~ Search(t-1) + SNS(t-1)

        search_lag = search[:-1]
        sns_lag = mentions[:-1]
        search_current = search[1:]

        # モデル1の残差
        slope1, intercept1, r1, _, _ = stats.linregress(search_lag, search_current)
        pred1 = intercept1 + slope1 * search_lag
        residuals1 = search_current - pred1
        ss_res1 = np.sum(residuals1 ** 2)

        # モデル2（SNSを追加）- 簡易的に重回帰
        X = np.column_stack([search_lag, sns_lag])
        X_with_const = np.column_stack([np.ones(len(X)), X])
        try:
            beta = np.linalg.lstsq(X_with_const, search_current, rcond=None)[0]
            pred2 = X_with_const @ beta
            residuals2 = search_current - pred2
            ss_res2 = np.sum(residuals2 ** 2)

            # F検定（簡易版）
            df1 = 1  # 追加した変数の数
            df2 = len(search_current) - 3  # n - k

            if ss_res2 > 0 and df2 > 0:
                f_stat = ((ss_res1 - ss_res2) / df1) / (ss_res2 / df2)
                p_value = 1 - stats.f.cdf(f_stat, df1, df2)
            else:
                f_stat = 0
                p_value = 1

            # SNSの係数
            sns_coefficient = beta[2]

            results.append({
                'brand': brand,
                'f_statistic': round(f_stat, 3),
                'p_value': round(p_value, 4),
                'sns_coefficient': round(sns_coefficient, 4),
                'sns_causes_search': p_value < 0.05
            })

            status = "YES" if p_value < 0.05 else "NO"
            print(f"  {brand}: F={f_stat:.3f}, p={p_value:.4f}, SNS→Search: {status}")

        except Exception as e:
            print(f"  {brand}: Error - {e}")

    return pd.DataFrame(results)

def save_results(sns_weekly, trends, merged_df, corr_df, lag_df, granger_df):
    """結果を保存"""
    print("\nSaving results...")

    # CSV保存
    sns_weekly.to_csv(os.path.join(OUTPUT_DIR, 'sns_weekly.csv'), index=False)
    trends.to_csv(os.path.join(OUTPUT_DIR, 'trends_weekly.csv'), index=False)
    merged_df.to_csv(os.path.join(OUTPUT_DIR, 'merged_data.csv'), index=False)
    corr_df.to_csv(os.path.join(OUTPUT_DIR, 'correlation_results.csv'), index=False)
    lag_df.to_csv(os.path.join(OUTPUT_DIR, 'lagged_correlation.csv'), index=False)
    granger_df.to_csv(os.path.join(OUTPUT_DIR, 'granger_results.csv'), index=False)

    print(f"  Saved to {OUTPUT_DIR}")

def generate_report(corr_df, lag_df, granger_df, merged_df):
    """分析レポートを生成"""

    # 全体の統計
    total_mentions = merged_df['mention_count'].sum()
    weeks_count = merged_df['week_start'].nunique()

    # 最も相関が高いブランド
    best_corr = corr_df.loc[corr_df['correlation'].abs().idxmax()]

    # 因果性が確認されたブランド
    causal_brands = granger_df[granger_df['sns_causes_search'] == True]['brand'].tolist()

    report = f"""# Issue 3 分析レポート: SNSと指名検索数の相関

**分析日**: {datetime.now().strftime('%Y-%m-%d')}
**分析期間**: 2025年3月〜10月（{weeks_count}週間）
**SNS言及総数**: {total_mentions:,}件

---

## エグゼクティブサマリー

### Q3-1への回答

| 問い | 回答 |
|------|------|
| **SNS→検索の因果あり？** | {"あり" if len(causal_brands) > 0 else "弱い/なし"}（{len(causal_brands)}/{len(BRANDS)}ブランドで有意） |
| **最も相関が高いブランド** | {best_corr['brand']}（r={best_corr['correlation']:.3f}） |
| **因果性が確認されたブランド** | {', '.join(causal_brands) if causal_brands else 'なし'} |

---

## 1. 同時相関分析

SNS言及数と検索スコアの同週相関

| ブランド | 相関係数 (r) | p値 | 有意 |
|---------|------------|-----|------|
"""

    for _, row in corr_df.sort_values('correlation', ascending=False).iterrows():
        sig = "✓" if row['significant'] else "-"
        report += f"| {row['brand']} | {row['correlation']:.3f} | {row['p_value']:.4f} | {sig} |\n"

    report += """
**解釈**:
- r > 0.3: 中程度の正の相関（SNS言及が多い週は検索も多い）
- r > 0.5: 強い正の相関
- p < 0.05: 統計的に有意

---

## 2. ラグ付き相関分析

SNS言及（過去）→ 検索（現在）の時間差相関

"""

    # ブランドごとに最良のラグを表示
    for brand in BRANDS:
        brand_lags = lag_df[lag_df['brand'] == brand]
        if len(brand_lags) > 0:
            report += f"\n### {brand}\n\n"
            report += "| ラグ（週） | 相関係数 | p値 | 有意 |\n"
            report += "|-----------|---------|-----|------|\n"
            for _, row in brand_lags.iterrows():
                sig = "✓" if row['significant'] else "-"
                report += f"| {row['lag_weeks']} | {row['correlation']:.3f} | {row['p_value']:.4f} | {sig} |\n"

    report += """
---

## 3. グレンジャー因果性検定（簡易版）

「過去のSNS言及が、現在の検索を予測するか」を検証

| ブランド | F統計量 | p値 | SNS→検索の因果 |
|---------|--------|-----|---------------|
"""

    for _, row in granger_df.sort_values('p_value').iterrows():
        cause = "✓ あり" if row['sns_causes_search'] else "- なし"
        report += f"| {row['brand']} | {row['f_statistic']:.3f} | {row['p_value']:.4f} | {cause} |\n"

    report += f"""
**解釈**:
- p < 0.05: SNS言及が検索を「グレンジャー因果」する（統計的に有意）
- 因果性あり = SNS投稿が検索行動に先行する傾向

---

## 4. 結論

### SNS→検索の因果関係

"""

    if len(causal_brands) > 0:
        report += f"""
**{len(causal_brands)}ブランドで因果性を確認**: {', '.join(causal_brands)}

これらのブランドでは、SNS言及の増加が検索行動の増加を予測する傾向があります。
"""
    else:
        report += """
**因果性は確認されず**

今回の分析期間・データでは、SNS言及→検索の明確な因果関係は検出されませんでした。

**考えられる理由**:
1. データ期間が短い（35週）
2. SNS言及数が少ないブランドがある
3. 検索と言及が同時に発生している（外部要因の影響）
"""

    report += f"""
---

## 5. 施策への示唆

| 発見 | 示唆 |
|------|------|
| 同時相関 | SNSと検索は連動する傾向（同じトレンドを反映） |
| ラグ相関 | ブランドによって最適なラグが異なる |
| 因果性 | {len(causal_brands)}ブランドでSNS→検索の因果あり |

---

## 参考資料

- `research/analysis/issue3/sns_weekly.csv` - SNS週次データ
- `research/analysis/issue3/trends_weekly.csv` - Google Trends週次データ
- `research/analysis/issue3/correlation_results.csv` - 相関分析結果
- `research/analysis/issue3/lagged_correlation.csv` - ラグ付き相関
- `research/analysis/issue3/granger_results.csv` - グレンジャー因果性検定

---

## 更新履歴

- {datetime.now().strftime('%Y-%m-%d')}: 初版作成
"""

    return report

def main():
    print("=" * 60)
    print("Issue 3 Analysis: SNS vs Search Correlation")
    print("=" * 60)

    # データ読み込み
    sns_weekly = load_sns_data()
    trends = load_trends_data()

    # データマージ
    merged_df = merge_data(sns_weekly, trends)

    # 相関分析
    corr_df = calculate_correlation(merged_df)

    # ラグ付き相関
    lag_df = calculate_lagged_correlation(merged_df)

    # グレンジャー因果性（簡易版）
    granger_df = granger_causality_simple(merged_df)

    # 結果保存
    save_results(sns_weekly, trends, merged_df, corr_df, lag_df, granger_df)

    # レポート生成
    report = generate_report(corr_df, lag_df, granger_df, merged_df)

    # レポート保存
    report_path = os.path.join(OUTPUT_DIR, 'correlation_results.md')
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"\nReport saved to: {report_path}")
    print("=" * 60)
    print("Analysis complete!")

if __name__ == '__main__':
    main()
