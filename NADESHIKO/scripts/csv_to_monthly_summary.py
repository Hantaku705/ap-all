#!/usr/bin/env python3
"""
CSV → TypeScript monthly-summary.ts 変換スクリプト

旧フォーマット（〜2025年9月）: CSVサマリー行から売上・粗利を取得
新フォーマット（2025年10月〜）: 案件データを集計
"""

import csv
import re
from datetime import datetime
from pathlib import Path


def parse_month_from_filename(filename: str) -> str:
    """ファイル名から月を抽出（YYYY-MM形式）"""
    if ' - ' in filename:
        suffix = filename.split(' - ')[-1]
        match = re.search(r'(\d{4})年(\d{1,2})月', suffix)
        if match:
            year = match.group(1)
            month = match.group(2).zfill(2)
            return f"{year}-{month}"

    matches = re.findall(r'(\d{4})年(\d{1,2})月', filename)
    if matches:
        year, month = matches[-1]
        return f"{year}-{month.zfill(2)}"
    return ""


def extract_version_number(filename: str) -> int:
    """ファイル名から (N) 形式のバージョン番号を抽出"""
    match = re.search(r'\((\d+)\)\.csv$', filename)
    if match:
        return int(match.group(1))
    return 0


def parse_currency(value) -> int:
    """金額を整数に変換"""
    if value is None:
        return 0
    cleaned = re.sub(r'[,円¥\s]', '', str(value))
    try:
        return int(float(cleaned))
    except ValueError:
        return 0


def detect_format(rows: list) -> str:
    """CSVフォーマットを判定"""
    for i, row in enumerate(rows[:15]):
        row_str = ','.join(str(cell) for cell in row)

        # 新フォーマット（2025年10月〜）: 担当者, クライアント, 区分
        if '担当者' in row_str and 'クライアント' in row_str and '区分' in row_str:
            return 'new'

        # 超旧フォーマット（2023年11月〜2024年7月）: 「全体売上」というテキスト
        if '全体売上' in row_str:
            return 'very_old'

    # 中間フォーマット（2024年8月〜2025年9月）: 「売上」と「粗利」のサマリー行
    for i, row in enumerate(rows[:10]):
        for j, cell in enumerate(row):
            if str(cell).strip() == '売上':
                return 'legacy'

    return 'unknown'


def extract_very_old_summary(rows: list) -> tuple[int, int]:
    """超旧フォーマット（2023年11月〜2024年7月）のサマリー行から売上を抽出"""
    sales = 0
    gross_profit = 0

    # 「全体売上」を含む行を探す
    for i, row in enumerate(rows[:10]):
        row_str = ','.join(str(cell) for cell in row)
        if '全体売上' in row_str:
            # 同じ行で数値を探す
            for cell in row:
                val = parse_currency(cell)
                if val > 1000000:  # 100万以上なら売上
                    sales = val
                    break
            break

    # 粗利は不明なので、売上の90%と仮定（または0）
    # 超旧フォーマットには粗利が記載されていないことが多い
    gross_profit = int(sales * 0.9) if sales > 0 else 0

    return sales, gross_profit


def extract_legacy_summary(rows: list) -> tuple[int, int]:
    """旧フォーマット（2024年8月〜2025年9月）のサマリー行から売上・粗利を抽出"""
    sales = 0
    gross_profit = 0

    # 行2付近から売上を探す
    for i, row in enumerate(rows[:5]):
        for j, cell in enumerate(row):
            if str(cell).strip() == '売上' and j + 1 < len(row):
                sales = parse_currency(row[j + 1])
                break
        if sales > 0:
            break

    # 「粗利」ラベルを探し、その下の行の同じ列から粗利を取得
    for i, row in enumerate(rows[:15]):
        for j, cell in enumerate(row):
            if str(cell).strip() == '粗利':
                # 次の行の同じ列から粗利を取得
                if i + 1 < len(rows) and j < len(rows[i + 1]):
                    gross_profit = parse_currency(rows[i + 1][j])
                break
        if gross_profit > 0:
            break

    return sales, gross_profit


def extract_new_format_summary(rows: list) -> tuple[int, int]:
    """新フォーマット（2025年10月〜）のサマリー行から売上・粗利を抽出

    新フォーマットCSV構造:
    行1: ...,目標,"¥25,281,250",...  ← 目標値（これは使わない）
    行3: ,売上,,粗利,                ← ラベル行
    行4: ,"¥13,950,000",,"¥12,960,000"  ← 実際の売上・粗利
    """
    sales = 0
    gross_profit = 0

    # パターン1: 「売上」と「粗利」が同じ行にある場合、次の行から値を取得
    for i, row in enumerate(rows[:10]):
        row_str = ','.join(str(cell) for cell in row)

        # 「売上」と「粗利」両方が含まれるラベル行を探す
        if '売上' in row_str and '粗利' in row_str:
            # 売上と粗利の列インデックスを取得
            sales_col = -1
            profit_col = -1
            for j, cell in enumerate(row):
                cell_str = str(cell).strip()
                if cell_str == '売上':
                    sales_col = j
                elif cell_str == '粗利':
                    profit_col = j

            # 次の行から値を取得
            if i + 1 < len(rows) and (sales_col >= 0 or profit_col >= 0):
                next_row = rows[i + 1]
                if sales_col >= 0 and sales_col < len(next_row):
                    sales = parse_currency(next_row[sales_col])
                if profit_col >= 0 and profit_col < len(next_row):
                    gross_profit = parse_currency(next_row[profit_col])
            break

    # パターン2: 売上のみの行がある場合
    if sales == 0:
        for i, row in enumerate(rows[:10]):
            row_str = ','.join(str(cell) for cell in row)
            # 「目標」を含む行はスキップ
            if '目標' in row_str:
                continue
            if '売上' in row_str and '粗利' not in row_str:
                # 次の行に金額がある可能性
                if i + 1 < len(rows):
                    for cell in rows[i + 1]:
                        val = parse_currency(cell)
                        if val > 1000000:
                            sales = val
                            break

    # パターン3: フォールバック - ¥金額を探す（目標行をスキップ）
    if sales == 0:
        for i, row in enumerate(rows[:10]):
            row_str = ','.join(str(cell) for cell in row)
            # 「目標」を含む行はスキップ
            if '目標' in row_str:
                continue

            for j, cell in enumerate(row[:5]):
                cell_str = str(cell).strip()
                if cell_str.startswith('¥') and ',' in cell_str:
                    val = parse_currency(cell_str)
                    if val > 1000000:
                        if sales == 0:
                            sales = val
                        elif gross_profit == 0:
                            gross_profit = val
                            break
            if sales > 0 and gross_profit > 0:
                break

    return sales, gross_profit


def process_csv_file(filepath: str) -> dict:
    """CSVファイルを処理してサマリーを抽出"""
    filename = Path(filepath).name
    month = parse_month_from_filename(filename)

    if not month:
        return None

    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

    if len(rows) < 5:
        return None

    format_type = detect_format(rows)

    if format_type == 'very_old':
        sales, gross_profit = extract_very_old_summary(rows)
    elif format_type == 'legacy':
        sales, gross_profit = extract_legacy_summary(rows)
    elif format_type == 'new':
        sales, gross_profit = extract_new_format_summary(rows)
    else:
        sales, gross_profit = 0, 0

    return {
        'month': month,
        'sales': sales,
        'grossProfit': gross_profit,
        'format': format_type,
        'filename': filename
    }


def generate_typescript(summaries: list) -> str:
    """TypeScriptコードを生成"""
    ts_code = '''// 自動生成ファイル - 手動編集禁止
// 生成日時: ''' + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + '''
// 月数: ''' + str(len(summaries)) + '''

export interface MonthlySummary {
  month: string;
  sales: number;
  grossProfit: number;
}

export const monthlySummaryData: MonthlySummary[] = [
'''

    for summary in summaries:
        ts_code += f'''  {{
    month: "{summary['month']}",
    sales: {summary['sales']},
    grossProfit: {summary['grossProfit']},
  }},
'''

    ts_code += '];\n'
    return ts_code


def main():
    csv_dir = Path('/Users/hantaku/Downloads/AP/NADESHIKO/data/利益管理シート')
    output_file = Path('/Users/hantaku/Downloads/AP/NADESHIKO/webapp/src/data/monthly-summary.ts')

    exclude_patterns = ['【旧】', '（編集）']
    priority_prefixes = ['【締め済】', '【FIX】', '【進行中】']

    # CSVファイル一覧
    csv_files = sorted(csv_dir.glob('*.csv'))

    print(f"CSVファイル数: {len(csv_files)}")
    print("-" * 60)

    # 月ごとに最新版を選択
    month_files = {}

    for csv_file in csv_files:
        filename = csv_file.name

        if any(p in filename for p in exclude_patterns):
            continue

        month = parse_month_from_filename(filename)
        if not month:
            continue

        version = extract_version_number(filename)
        has_priority = any(p in filename for p in priority_prefixes)

        # 優先プレフィックス付きを優先、同じなら番号が大きい方
        if month not in month_files:
            month_files[month] = (csv_file, has_priority, version)
        else:
            existing = month_files[month]
            # 優先プレフィックス付きが優先
            if has_priority and not existing[1]:
                month_files[month] = (csv_file, has_priority, version)
            elif has_priority == existing[1] and version > existing[2]:
                month_files[month] = (csv_file, has_priority, version)

    # サマリー抽出
    summaries = []
    for month in sorted(month_files.keys()):
        csv_file = month_files[month][0]
        summary = process_csv_file(str(csv_file))
        if summary:
            summaries.append(summary)
            print(f"{month}: 売上 ¥{summary['sales']:,}, 粗利 ¥{summary['grossProfit']:,} ({summary['format']}) - {summary['filename']}")

    print("-" * 60)

    # TypeScript生成
    ts_code = generate_typescript(summaries)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(ts_code)

    print(f"\n月数: {len(summaries)}")
    print(f"出力: {output_file}")


if __name__ == '__main__':
    main()
