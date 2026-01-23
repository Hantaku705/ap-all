#!/usr/bin/env python3
"""
CSV files to deals-data.ts converter
Converts NADESHIKO profit management CSVs to webapp Deal format
"""

import csv
import os
import re
import json
from datetime import datetime

CSV_DIR = '/Users/hantaku/Downloads/AP/NADESHIKO/data/利益管理シート'
OUTPUT_FILE = '/Users/hantaku/Downloads/AP/NADESHIKO/webapp/src/data/deals-data-generated.ts'

def parse_money(value):
    """Parse Japanese yen formatted value to integer"""
    if not value or value == '':
        return 0
    # Remove yen sign, commas, and spaces
    cleaned = str(value).replace('¥', '').replace(',', '').replace(' ', '').strip()
    if cleaned == '' or cleaned == '-':
        return 0
    try:
        return int(float(cleaned))
    except ValueError:
        return 0

def parse_month_from_filename(filename):
    """Extract month from filename like '2023年11月' or '【進行中】2026年1月'"""
    # The filename format is: 利益管理シート_NADESIKO_2024年10月期 - XXXX年YY月.csv
    # We need to extract the LAST year/month after the ' - '
    if ' - ' in filename:
        suffix = filename.split(' - ')[-1]  # Get the part after ' - '
        match = re.search(r'(\d{4})年(\d{1,2})月', suffix)
        if match:
            year = int(match.group(1))
            month = int(match.group(2))
            return f"{year}-{month:02d}"
    return None

def find_header_row(rows):
    """Find the row that contains column headers (new format only)"""
    for i, row in enumerate(rows):
        # Look for row that contains '担当者' and 'クライアント' and '売上' and '粗利'
        # This is the new format (2025年11月〜)
        row_str = ','.join(str(cell) for cell in row)
        if '担当者' in row_str and 'クライアント' in row_str and '売上' in row_str and '粗利' in row_str:
            return i
    return -1

def is_new_format_file(filename):
    """Check if file uses the new format (【締め済】、【FIX】、【進行中】 prefix)"""
    return any(prefix in filename for prefix in ['【締め済】', '【FIX】', '【進行中】'])

def parse_csv_file(filepath, month):
    """Parse a single CSV file and return list of deals"""
    deals = []

    with open(filepath, 'r', encoding='utf-8') as f:
        rows = list(csv.reader(f))

    header_idx = find_header_row(rows)
    if header_idx == -1:
        print(f"  Warning: No header found in {os.path.basename(filepath)}")
        return deals

    header = rows[header_idx]

    # Find column indices
    col_map = {}
    for i, col in enumerate(header):
        col_lower = str(col).strip().lower()
        if '担当者' in col:
            col_map['manager'] = i
        elif 'クライアント' in col:
            col_map['client'] = i
        elif '案件名' in col:
            col_map['projectName'] = i
        elif 'アカウント名' in col:
            col_map['accountName'] = i
        elif '区分' in col and 'tax' not in col_lower:
            col_map['category'] = i
        elif '税区分' in col:
            col_map['taxType'] = i
        elif '摘要' in col:
            col_map['description'] = i
        elif col == '売上':
            col_map['sales'] = i
        elif col == '費用':
            col_map['cost'] = i
        elif '支払費用60%' in col or '支払費用' in col:
            col_map['paymentCost60'] = i
        elif '広告費' in col and 'FIX' not in col:
            col_map['adCost'] = i
        elif '粗利' in col:
            col_map['grossProfit'] = i
        elif 'ステータス' in col:
            col_map['status'] = i
        elif '備考' in col:
            col_map['note'] = i

    # Process data rows
    deal_count = 0
    for row_idx in range(header_idx + 1, len(rows)):
        row = rows[row_idx]

        # Skip empty rows or summary rows
        if len(row) <= col_map.get('manager', 0):
            continue

        manager = row[col_map.get('manager', 0)].strip() if col_map.get('manager') is not None else ''
        client = row[col_map.get('client', 0)].strip() if col_map.get('client') is not None else ''

        # Skip if no manager and no client (likely empty row)
        if not manager and not client:
            continue

        # Skip summary rows (usually have totals)
        if manager == '' and client == '':
            continue

        sales = parse_money(row[col_map.get('sales', 0)] if col_map.get('sales') is not None else 0)

        # Skip rows with no sales (likely empty or summary)
        if sales == 0:
            continue

        deal_count += 1
        deal = {
            'id': f"deal-{month.replace('-', '')}-{deal_count:03d}",
            'month': month,
            'manager': manager,
            'client': client,
            'projectName': row[col_map.get('projectName', 0)].strip() if col_map.get('projectName') is not None and len(row) > col_map.get('projectName', 0) else '',
            'accountName': row[col_map.get('accountName', 0)].strip() if col_map.get('accountName') is not None and len(row) > col_map.get('accountName', 0) else '',
            'category': row[col_map.get('category', 0)].strip() if col_map.get('category') is not None and len(row) > col_map.get('category', 0) else 'AJP',
            'taxType': row[col_map.get('taxType', 0)].strip() if col_map.get('taxType') is not None and len(row) > col_map.get('taxType', 0) else '課税',
            'description': row[col_map.get('description', 0)].strip() if col_map.get('description') is not None and len(row) > col_map.get('description', 0) else '',
            'sales': sales,
            'cost': parse_money(row[col_map.get('cost', 0)] if col_map.get('cost') is not None and len(row) > col_map.get('cost', 0) else 0),
            'paymentCost60': parse_money(row[col_map.get('paymentCost60', 0)] if col_map.get('paymentCost60') is not None and len(row) > col_map.get('paymentCost60', 0) else 0),
            'adCost': parse_money(row[col_map.get('adCost', 0)] if col_map.get('adCost') is not None and len(row) > col_map.get('adCost', 0) else 0),
            'grossProfit': parse_money(row[col_map.get('grossProfit', 0)] if col_map.get('grossProfit') is not None and len(row) > col_map.get('grossProfit', 0) else 0),
            'status': row[col_map.get('status', 0)].strip() if col_map.get('status') is not None and len(row) > col_map.get('status', 0) else '進行中',
            'note': row[col_map.get('note', 0)].strip() if col_map.get('note') is not None and len(row) > col_map.get('note', 0) else '',
        }

        # Normalize category
        if deal['category'] not in ['AJP', 'RCP']:
            deal['category'] = 'AJP'

        # Normalize taxType
        if deal['taxType'] not in ['課税', '非課税']:
            deal['taxType'] = '課税'

        # Normalize status
        valid_statuses = ['進行中', '投稿完了', '請求済み', 'キャンセル', '請求書送付済']
        if deal['status'] not in valid_statuses:
            deal['status'] = '進行中'
        if deal['status'] == '請求書送付済':
            deal['status'] = '請求済み'

        deals.append(deal)

    return deals

def generate_typescript(deals, months):
    """Generate TypeScript file content"""
    lines = [
        "import { Deal } from '@/types/deal';",
        "",
        "// Auto-generated from CSV files",
        f"// Generated at: {datetime.now().isoformat()}",
        f"// Total deals: {len(deals)}",
        f"// Months covered: {months[0]} to {months[-1]}",
        "",
        "export const dealsData: Deal[] = [",
    ]

    current_month = None
    for deal in deals:
        if deal['month'] != current_month:
            current_month = deal['month']
            year, month = current_month.split('-')
            lines.append(f"  // ========== {year}年{int(month)}月 ==========")

        # Format the deal object
        lines.append("  {")
        lines.append(f'    id: "{deal["id"]}",')
        lines.append(f'    month: "{deal["month"]}",')
        lines.append(f'    manager: "{deal["manager"]}",')
        lines.append(f'    client: "{escape_string(deal["client"])}",')
        lines.append(f'    projectName: "{escape_string(deal["projectName"])}",')
        lines.append(f'    accountName: "{escape_string(deal["accountName"])}",')
        lines.append(f'    category: "{deal["category"]}",')
        lines.append(f'    taxType: "{deal["taxType"]}",')
        lines.append(f'    description: "{escape_string(deal["description"])}",')
        lines.append(f'    sales: {deal["sales"]},')
        lines.append(f'    cost: {deal["cost"]},')
        lines.append(f'    paymentCost60: {deal["paymentCost60"]},')
        lines.append(f'    adCost: {deal["adCost"]},')
        lines.append(f'    grossProfit: {deal["grossProfit"]},')
        lines.append(f'    status: "{deal["status"]}",')
        lines.append(f'    note: "{escape_string(deal["note"])}",')
        lines.append(f'    createdAt: "{deal["month"]}-01T00:00:00Z",')
        lines.append(f'    updatedAt: "{deal["month"]}-01T00:00:00Z"')
        lines.append("  },")

    lines.append("];")
    lines.append("")

    return '\n'.join(lines)

def escape_string(s):
    """Escape string for TypeScript"""
    if not s:
        return ''
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '')

def main():
    print("=== CSV to Deals Data Converter ===\n")

    # Get all CSV files (only new format files with proper structure)
    csv_files = []
    for filename in os.listdir(CSV_DIR):
        if filename.endswith('.csv') and is_new_format_file(filename):
            filepath = os.path.join(CSV_DIR, filename)
            month = parse_month_from_filename(filename)
            if month:
                csv_files.append((filepath, filename, month))

    # Sort by month
    csv_files.sort(key=lambda x: x[2])

    print(f"Found {len(csv_files)} CSV files\n")

    # Process all files
    all_deals = []
    months = set()

    for filepath, filename, month in csv_files:
        print(f"Processing: {filename}")
        print(f"  Month: {month}")

        deals = parse_csv_file(filepath, month)
        print(f"  Deals found: {len(deals)}")

        all_deals.extend(deals)
        months.add(month)

    # Sort by month and then by id
    all_deals.sort(key=lambda x: (x['month'], x['id']))
    months = sorted(list(months))

    print(f"\n=== Summary ===")
    print(f"Total deals: {len(all_deals)}")
    print(f"Months covered: {months[0]} to {months[-1]}")

    # Generate TypeScript
    ts_content = generate_typescript(all_deals, months)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(ts_content)

    print(f"\nOutput written to: {OUTPUT_FILE}")

    # Also output months for constants.ts update
    print("\n=== Month options for constants.ts ===")
    for month in months:
        year, m = month.split('-')
        print(f"  {{ value: '{month}', label: '{year}年{int(m)}月' }},")

if __name__ == '__main__':
    main()
