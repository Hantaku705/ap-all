#!/usr/bin/env python3
"""
CSV → TypeScript deals-data.ts 変換スクリプト（全期間対応版）

対応フォーマット:
- 旧フォーマット（2023年11月〜2025年10月）: Month, アカウント名, 案件名, 取引先...
- 新フォーマット（【締め済】【FIX】【進行中】）: 担当者, クライアント, 案件名...
"""

import csv
import os
import re
from datetime import datetime
from pathlib import Path


def parse_month_from_filename(filename: str) -> str:
    """ファイル名から月を抽出（YYYY-MM形式）

    ファイル名例: 利益管理シート_NADESIKO_2024年10月期 - 2023年11月.csv
    → 最後の「YYYY年MM月」を抽出（「2024年10月期」ではなく「2023年11月」）
    """
    # 「 - 」以降の部分から月を抽出
    if ' - ' in filename:
        suffix = filename.split(' - ')[-1]
        match = re.search(r'(\d{4})年(\d{1,2})月', suffix)
        if match:
            year = match.group(1)
            month = match.group(2).zfill(2)
            return f"{year}-{month}"

    # フォールバック: 最後にマッチしたパターンを使用
    matches = re.findall(r'(\d{4})年(\d{1,2})月', filename)
    if matches:
        year, month = matches[-1]
        return f"{year}-{month.zfill(2)}"
    return ""


def parse_legacy_month(month_value: str) -> str:
    """旧フォーマットのMonth値をYYYY-MM形式に変換
    例: 2410.0 → 2024-10, 2311 → 2023-11
    """
    if not month_value:
        return ""

    # 数値として処理
    try:
        month_num = int(float(month_value))
    except ValueError:
        return ""

    month_str = str(month_num)

    if len(month_str) == 4:
        # 2410 → 2024-10
        year_short = month_str[:2]
        month = month_str[2:]
        year = f"20{year_short}"
        return f"{year}-{month.zfill(2)}"
    elif len(month_str) == 3:
        # 241 → 2024-01
        year_short = month_str[:2]
        month = month_str[2:]
        year = f"20{year_short}"
        return f"{year}-0{month}"

    return ""


def parse_currency(value: str) -> int:
    """金額文字列を整数に変換"""
    if not value:
        return 0
    # カンマ、円、¥ を除去
    cleaned = re.sub(r'[,円¥\s]', '', str(value))
    try:
        return int(float(cleaned))
    except ValueError:
        return 0


def detect_format(headers: list) -> str:
    """ヘッダーからフォーマットを判定"""
    header_str = ','.join(headers)

    # 新フォーマット（【締め済】【FIX】【進行中】）
    if '担当者' in header_str and 'クライアント' in header_str and '区分' in header_str:
        return 'new'
    # 10月フォーマット（請求書, 区分, アカウント名, 請求項目...）
    elif '区分' in header_str and '請求項目' in header_str:
        return 'october'
    # 9月フォーマット（アカウント名, 案件名, 取引先, 摘要, 単価...）
    elif 'アカウント名' in header_str and '案件名' in header_str and '取引先' in header_str and 'month' not in header_str.lower():
        return 'september'
    # 旧フォーマット（Month, アカウント名...）
    elif 'month' in header_str.lower() and 'アカウント名' in header_str:
        return 'legacy'
    else:
        return 'unknown'


def find_header_row(rows: list) -> tuple[int, list]:
    """ヘッダー行を探す"""
    for i, row in enumerate(rows):
        row_str = ','.join(str(cell) for cell in row)
        row_str_lower = row_str.lower()
        # 新フォーマット（【締め済】【FIX】【進行中】）
        if '担当者' in row_str and 'クライアント' in row_str:
            return i, row
        # 10月フォーマット（請求書, 区分, アカウント名, 請求項目...）
        if '区分' in row_str and '請求項目' in row_str:
            return i, row
        # 9月フォーマット（アカウント名, 案件名, 取引先, 摘要, 単価...）
        if 'アカウント名' in row_str and '案件名' in row_str and '取引先' in row_str and 'month' not in row_str_lower:
            return i, row
        # 旧フォーマット（Month, アカウント名...）
        if 'month' in row_str_lower and 'アカウント名' in row_str:
            return i, row
    return -1, []


def process_new_format(rows: list, header_idx: int, headers: list, month_from_file: str) -> list:
    """新フォーマットのCSVを処理"""
    deals = []

    # ヘッダーインデックスマッピング
    col_map = {h.strip(): i for i, h in enumerate(headers)}

    for row in rows[header_idx + 1:]:
        if len(row) < 5:
            continue

        # 空行スキップ
        client = row[col_map.get('クライアント', 1)].strip() if col_map.get('クライアント', 1) < len(row) else ''
        if not client:
            continue

        sales = parse_currency(row[col_map.get('売上', 7)] if col_map.get('売上', 7) < len(row) else '0')
        if sales == 0:
            continue

        deal = {
            'month': month_from_file,
            'manager': row[col_map.get('担当者', 0)].strip() if col_map.get('担当者', 0) < len(row) else '',
            'client': client,
            'projectName': row[col_map.get('案件名', 2)].strip() if col_map.get('案件名', 2) < len(row) else '',
            'accountName': row[col_map.get('アカウント名', 3)].strip() if col_map.get('アカウント名', 3) < len(row) else '',
            'category': row[col_map.get('区分', 4)].strip() if col_map.get('区分', 4) < len(row) else 'AJP',
            'taxType': row[col_map.get('税区分', 5)].strip() if col_map.get('税区分', 5) < len(row) else '課税',
            'description': row[col_map.get('摘要', 6)].strip() if col_map.get('摘要', 6) < len(row) else '',
            'sales': sales,
            'cost': parse_currency(row[col_map.get('費用', 8)] if col_map.get('費用', 8) < len(row) else '0'),
            'paymentCost60': parse_currency(row[col_map.get('支払費用60%', 9)] if col_map.get('支払費用60%', 9) < len(row) else '0'),
            'adCost': parse_currency(row[col_map.get('広告費', 10)] if col_map.get('広告費', 10) < len(row) else '0'),
            'grossProfit': parse_currency(row[col_map.get('粗利', 12)] if col_map.get('粗利', 12) < len(row) else '0'),
            'status': normalize_status(row[col_map.get('ステータス', 13)].strip() if col_map.get('ステータス', 13) < len(row) else '進行中'),
            'note': row[col_map.get('備考', 14)].strip() if col_map.get('備考', 14) < len(row) else '',
        }

        # 区分正規化
        if deal['category'] not in ['AJP', 'RCP']:
            deal['category'] = 'AJP'

        # 粗利計算（なければ）
        if deal['grossProfit'] == 0:
            if deal['category'] == 'AJP':
                deal['grossProfit'] = deal['sales']
            else:
                deal['grossProfit'] = deal['sales'] - deal['paymentCost60']

        deals.append(deal)

    return deals


def process_legacy_format(rows: list, header_idx: int, headers: list, month_from_file: str) -> list:
    """旧フォーマットのCSVを処理"""
    deals = []

    # ヘッダーインデックスマッピング
    col_map = {}
    for i, h in enumerate(headers):
        h_clean = h.strip().lower()
        if 'month' in h_clean:
            col_map['month'] = i
        elif 'アカウント名' in h_clean:
            col_map['accountName'] = i
        elif '案件名' in h_clean:
            col_map['projectName'] = i
        elif '取引先' in h_clean:
            col_map['client'] = i
        elif '摘要' in h_clean:
            col_map['description'] = i
        elif '単価' in h_clean:
            col_map['sales'] = i
        elif 'ステータス' in h_clean:
            col_map['status'] = i
        elif '備考' in h_clean:
            col_map['note'] = i

    for row in rows[header_idx + 1:]:
        if len(row) < 3:
            continue

        # 空行スキップ
        project_name = row[col_map.get('projectName', 2)].strip() if col_map.get('projectName', 2) < len(row) else ''
        if not project_name:
            continue

        sales = parse_currency(row[col_map.get('sales', 6)] if col_map.get('sales', 6) < len(row) else '0')
        if sales == 0:
            continue

        # 月を決定（ファイル名優先）
        month = month_from_file
        if col_map.get('month') is not None and col_map['month'] < len(row):
            legacy_month = parse_legacy_month(row[col_map['month']])
            if legacy_month:
                month = legacy_month

        raw_status = row[col_map.get('status', 7)].strip() if col_map.get('status', 7) < len(row) else '完了'

        deal = {
            'month': month,
            'manager': '',  # 旧フォーマットには担当者がない
            'client': row[col_map.get('client', 3)].strip() if col_map.get('client', 3) < len(row) else '',
            'projectName': project_name,
            'accountName': row[col_map.get('accountName', 1)].strip() if col_map.get('accountName', 1) < len(row) else '',
            'category': 'AJP',  # 旧フォーマットはAJP扱い
            'taxType': '課税',
            'description': row[col_map.get('description', 5)].strip() if col_map.get('description', 5) < len(row) else '',
            'sales': sales,
            'cost': 0,
            'paymentCost60': 0,
            'adCost': 0,
            'grossProfit': sales,  # AJPなので売上=粗利
            'status': normalize_status(raw_status),
            'note': row[col_map.get('note', 8)].strip() if col_map.get('note', 8) < len(row) else '',
        }

        deals.append(deal)

    return deals


def process_september_format(rows: list, header_idx: int, headers: list, month_from_file: str) -> list:
    """9月フォーマットのCSVを処理

    ヘッダー: アカウント名, 案件名, 取引先, 摘要, 単価, ステータス, 備考
    先頭列が担当者（AnyMind等）の場合あり
    """
    deals = []

    # ヘッダーインデックスマッピング
    col_map = {}
    for i, h in enumerate(headers):
        h_clean = h.strip()
        if 'アカウント名' in h_clean:
            col_map['accountName'] = i
        elif '案件名' in h_clean:
            col_map['projectName'] = i
        elif '取引先' in h_clean:
            col_map['client'] = i
        elif '摘要' in h_clean:
            col_map['description'] = i
        elif '単価' in h_clean:
            col_map['sales'] = i
        elif 'ステータス' in h_clean:
            col_map['status'] = i
        elif '備考' in h_clean:
            col_map['note'] = i

    for row in rows[header_idx + 1:]:
        if len(row) < 3:
            continue

        # 案件名チェック
        project_name = row[col_map.get('projectName', 1)].strip() if col_map.get('projectName', 1) < len(row) else ''
        if not project_name:
            continue

        sales = parse_currency(row[col_map.get('sales', 4)] if col_map.get('sales', 4) < len(row) else '0')
        if sales == 0:
            continue

        # 担当者判定（先頭列がAnyMindならAJP）
        first_col = row[0].strip() if len(row) > 0 else ''
        category = 'AJP' if 'AnyMind' in first_col or 'anymind' in first_col.lower() else 'AJP'

        raw_status = row[col_map.get('status', 5)].strip() if col_map.get('status', 5) < len(row) else '完了'

        deal = {
            'month': month_from_file,
            'manager': first_col if first_col and first_col != row[col_map.get('accountName', 0)] else '',
            'client': row[col_map.get('client', 2)].strip() if col_map.get('client', 2) < len(row) else '',
            'projectName': project_name,
            'accountName': row[col_map.get('accountName', 0)].strip() if col_map.get('accountName', 0) < len(row) else '',
            'category': category,
            'taxType': '課税',
            'description': row[col_map.get('description', 3)].strip() if col_map.get('description', 3) < len(row) else '',
            'sales': sales,
            'cost': 0,
            'paymentCost60': 0,
            'adCost': 0,
            'grossProfit': sales,  # AJPなので売上=粗利
            'status': normalize_status(raw_status),
            'note': row[col_map.get('note', 6)].strip() if col_map.get('note', 6) < len(row) else '',
        }

        deals.append(deal)

    return deals


def process_october_format(rows: list, header_idx: int, headers: list, month_from_file: str) -> list:
    """10月フォーマットのCSVを処理

    ヘッダー: 請求書, 区分, アカウント名, 請求項目, 取引先, 摘要, 単価, 税, ステータス, 備考
    """
    deals = []

    # ヘッダーインデックスマッピング
    col_map = {}
    for i, h in enumerate(headers):
        h_clean = h.strip()
        if '請求書' in h_clean:
            col_map['invoice'] = i
        elif '区分' in h_clean:
            col_map['category'] = i
        elif 'アカウント名' in h_clean:
            col_map['accountName'] = i
        elif '請求項目' in h_clean:
            col_map['projectName'] = i
        elif '取引先' in h_clean:
            col_map['client'] = i
        elif '摘要' in h_clean:
            col_map['description'] = i
        elif '単価' in h_clean:
            col_map['sales'] = i
        elif '税' in h_clean:
            col_map['tax'] = i
        elif 'ステータス' in h_clean:
            col_map['status'] = i
        elif '備考' in h_clean:
            col_map['note'] = i

    for row in rows[header_idx + 1:]:
        if len(row) < 5:
            continue

        # 請求項目（案件名）チェック
        project_name = row[col_map.get('projectName', 3)].strip() if col_map.get('projectName', 3) < len(row) else ''
        if not project_name:
            continue

        sales = parse_currency(row[col_map.get('sales', 6)] if col_map.get('sales', 6) < len(row) else '0')
        if sales == 0:
            continue

        # 区分判定
        category_raw = row[col_map.get('category', 1)].strip() if col_map.get('category', 1) < len(row) else ''
        if 'RCP' in category_raw.upper():
            category = 'RCP'
        else:
            category = 'AJP'

        # 税区分
        tax_raw = row[col_map.get('tax', 7)].strip() if col_map.get('tax', 7) < len(row) else ''
        tax_type = '非課税' if '非' in tax_raw else '課税'

        raw_status = row[col_map.get('status', 8)].strip() if col_map.get('status', 8) < len(row) else '完了'

        deal = {
            'month': month_from_file,
            'manager': '',  # 10月フォーマットには担当者列がない
            'client': row[col_map.get('client', 4)].strip() if col_map.get('client', 4) < len(row) else '',
            'projectName': project_name,
            'accountName': row[col_map.get('accountName', 2)].strip() if col_map.get('accountName', 2) < len(row) else '',
            'category': category,
            'taxType': tax_type,
            'description': row[col_map.get('description', 5)].strip() if col_map.get('description', 5) < len(row) else '',
            'sales': sales,
            'cost': 0,
            'paymentCost60': 0,
            'adCost': 0,
            'grossProfit': sales if category == 'AJP' else int(sales * 0.4),  # RCPは40%
            'status': normalize_status(raw_status),
            'note': row[col_map.get('note', 9)].strip() if col_map.get('note', 9) < len(row) else '',
        }

        deals.append(deal)

    return deals


def process_csv_file(filepath: str) -> list:
    """CSVファイルを処理"""
    filename = os.path.basename(filepath)
    month_from_file = parse_month_from_filename(filename)

    if not month_from_file:
        print(f"  スキップ: 月を抽出できません - {filename}")
        return []

    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

    if len(rows) < 5:
        print(f"  スキップ: データが少なすぎます - {filename}")
        return []

    # ヘッダー行を探す
    header_idx, headers = find_header_row(rows)
    if header_idx < 0:
        print(f"  スキップ: ヘッダーが見つかりません - {filename}")
        return []

    # フォーマット判定
    fmt = detect_format(headers)

    if fmt == 'new':
        deals = process_new_format(rows, header_idx, headers, month_from_file)
        print(f"  新フォーマット: {filename} → {len(deals)}件")
    elif fmt == 'october':
        deals = process_october_format(rows, header_idx, headers, month_from_file)
        print(f"  10月フォーマット: {filename} → {len(deals)}件")
    elif fmt == 'september':
        deals = process_september_format(rows, header_idx, headers, month_from_file)
        print(f"  9月フォーマット: {filename} → {len(deals)}件")
    elif fmt == 'legacy':
        deals = process_legacy_format(rows, header_idx, headers, month_from_file)
        print(f"  旧フォーマット: {filename} → {len(deals)}件")
    else:
        print(f"  スキップ: 不明なフォーマット - {filename}")
        return []

    return deals


def normalize_status(status: str) -> str:
    """ステータスを正規化（DealStatus型に合わせる）"""
    status = status.strip()

    # 完了系
    if any(k in status for k in ['完了', '済', 'FIX', '確定', '送付']):
        return '請求済み'

    # キャンセル系
    if any(k in status for k in ['キャンセル', '中止', '取消']):
        return 'キャンセル'

    # 投稿完了系
    if any(k in status for k in ['投稿']):
        return '投稿完了'

    # それ以外は進行中
    return '進行中'


def escape_string(s: str) -> str:
    """TypeScript文字列用にエスケープ"""
    if not s:
        return ""
    # 改行・タブ・バックスラッシュ・ダブルクォートをエスケープ
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    s = s.replace('\n', ' ')
    s = s.replace('\r', '')
    s = s.replace('\t', ' ')
    return s


def generate_typescript(deals: list) -> str:
    """TypeScriptコードを生成"""
    ts_code = '''// 自動生成ファイル - 手動編集禁止
// 生成日時: ''' + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + '''
// 案件数: ''' + str(len(deals)) + '''

import { Deal } from "@/types/deal";

export const dealsData: Deal[] = [
'''

    for i, deal in enumerate(deals):
        ts_code += f'''  {{
    id: "{i + 1}",
    month: "{deal['month']}",
    manager: "{escape_string(deal['manager'])}",
    client: "{escape_string(deal['client'])}",
    projectName: "{escape_string(deal['projectName'])}",
    accountName: "{escape_string(deal['accountName'])}",
    category: "{deal['category']}",
    taxType: "{escape_string(deal['taxType'])}",
    description: "{escape_string(deal['description'])}",
    sales: {deal['sales']},
    cost: {deal['cost']},
    paymentCost60: {deal['paymentCost60']},
    adCost: {deal['adCost']},
    grossProfit: {deal['grossProfit']},
    status: "{escape_string(deal['status'])}",
    note: "{escape_string(deal['note'])}",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }},
'''

    ts_code += '];\n'
    return ts_code


def extract_version_number(filename: str) -> int:
    """ファイル名から (N) 形式のバージョン番号を抽出。なければ0を返す"""
    match = re.search(r'\((\d+)\)\.csv$', filename)
    if match:
        return int(match.group(1))
    return 0


def select_latest_version_files(csv_files: list, priority_prefixes: list, exclude_patterns: list) -> dict:
    """同じ月のファイルがある場合、最新版（番号最大）のみを選択"""
    # 月ごとにファイルをグループ化
    month_files = {}

    for csv_file in csv_files:
        filename = csv_file.name

        # 除外パターンチェック
        if any(p in filename for p in exclude_patterns):
            continue

        # 優先プレフィックスがあるファイルのみ
        has_priority = any(p in filename for p in priority_prefixes)
        if not has_priority:
            continue

        month = parse_month_from_filename(filename)
        if not month:
            continue

        version = extract_version_number(filename)

        # 同じ月のファイルがあれば、バージョン番号が大きい方を採用
        if month not in month_files:
            month_files[month] = (csv_file, version)
        else:
            existing_version = month_files[month][1]
            if version > existing_version:
                month_files[month] = (csv_file, version)

    return {month: file_info[0] for month, file_info in month_files.items()}


def main():
    csv_dir = Path('/Users/hantaku/Downloads/AP/NADESHIKO/data/利益管理シート')
    output_file = Path('/Users/hantaku/Downloads/AP/NADESHIKO/webapp/src/data/deals-data.ts')

    # 除外ファイルパターン
    exclude_patterns = ['【旧】', '（編集）']

    # 新フォーマット優先ファイル（これらがある場合、同月の旧フォーマットは使わない）
    priority_prefixes = ['【締め済】', '【FIX】', '【進行中】']

    all_deals = []
    processed_months = set()

    # CSVファイル一覧
    csv_files = sorted(csv_dir.glob('*.csv'))

    print(f"CSVファイル数: {len(csv_files)}")
    print("-" * 50)

    # 1. 新フォーマット（優先プレフィックス付き）から最新版のみ選択
    latest_files = select_latest_version_files(csv_files, priority_prefixes, exclude_patterns)

    print(f"新フォーマット最新版: {len(latest_files)}ファイル")
    for month, csv_file in sorted(latest_files.items()):
        print(f"  {month}: {csv_file.name}")
    print("-" * 50)

    # 2. 最新版のファイルを処理
    for month, csv_file in sorted(latest_files.items()):
        deals = process_csv_file(str(csv_file))
        all_deals.extend(deals)
        processed_months.add(month)
        print(f"    → 登録月: {month} ({len(deals)}件)")

    print("-" * 50)
    print(f"処理済み月: {sorted(processed_months)}")
    print("-" * 50)

    # 2. 残りのファイル（旧フォーマット）を処理
    for csv_file in csv_files:
        filename = csv_file.name

        # 除外パターンチェック
        if any(p in filename for p in exclude_patterns):
            continue

        # 優先プレフィックス付きはスキップ（既に処理済み）
        has_priority = any(p in filename for p in priority_prefixes)
        if has_priority:
            continue

        # 既に処理済みの月はスキップ
        month = parse_month_from_filename(filename)
        if month in processed_months:
            print(f"  スキップ（重複月）: {filename} ({month})")
            continue

        deals = process_csv_file(str(csv_file))
        all_deals.extend(deals)
        if month:
            processed_months.add(month)

    print("-" * 50)

    # 月順にソート
    all_deals.sort(key=lambda d: (d['month'], d['client'], d['projectName']))

    # TypeScript生成
    ts_code = generate_typescript(all_deals)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(ts_code)

    print(f"\n総案件数: {len(all_deals)}")
    print(f"対象月数: {len(processed_months)}")
    print(f"出力: {output_file}")

    # 月別集計
    print("\n月別案件数:")
    month_counts = {}
    for deal in all_deals:
        month_counts[deal['month']] = month_counts.get(deal['month'], 0) + 1
    for month in sorted(month_counts.keys()):
        print(f"  {month}: {month_counts[month]}件")


if __name__ == '__main__':
    main()
