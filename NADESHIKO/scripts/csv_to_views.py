#!/usr/bin/env python3
"""
再生数シートCSV → JSON + TypeScript変換スクリプト

22個のCSVファイル（6,304行）をJSONに変換し、TypeScriptラッパーを生成する。
3タイプのCSV構造に対応:
- タイプA (2024年4月〜9月): 相対日付、sns/担当者空
- タイプB (2024年10月〜2025年7月): ISO日付、sns/担当者空
- タイプC (2025年8月〜2026年1月): ISO日付、sns/担当者あり
"""

import csv
import json
import re
import uuid
from pathlib import Path
from datetime import datetime

CSV_DIR = Path(__file__).parent.parent / 'data/再生数シート'
OUTPUT_JSON = Path(__file__).parent.parent / 'webapp/src/data/views-data.json'
OUTPUT_TS = Path(__file__).parent.parent / 'webapp/src/data/views-data.ts'

# ヘッダーのスペース正規化マップ
HEADER_NORMALIZE = {
    '平均 視聴時間': '平均視聴時間',
    '視聴 維持率': '視聴維持率',
    '新規 フォロー': '新規フォロー',
}

# カラム名→英語キーのマッピング
COLUMN_MAP = {
    '投稿日': 'postDate',
    'アカウント名': 'accountName',
    'PR/通常': 'prType',
    'sns': 'platform',
    '担当者': 'manager',
    'タイトル': 'title',
    'URL': 'url',
    '種別': 'category',
    '更新日': 'updatedAt',
    '動画尺': 'duration',
    '再生数': 'views',
    'いいね': 'likes',
    'コメント': 'comments',
    '共有': 'shares',
    '保存': 'saves',
    'いいね率': 'likeRate',
    'コメント率': 'commentRate',
    '共有率': 'shareRate',
    '保存率': 'saveRate',
    '平均視聴時間': 'avgWatchTime',
    '視聴維持率': 'retentionRate',
    '1秒継続率': 'retention1s',
    '3秒継続率': 'retention3s',
    '6秒継続率': 'retention6s',
    'フル視聴率': 'fullViewRate',
    '新規フォロー': 'newFollows',
    'フォロー率': 'followRate',
    'おすすめ率': 'recommendRate',
}


def normalize_header(header: str) -> str:
    """ヘッダーのスペースを正規化"""
    return HEADER_NORMALIZE.get(header, header)


def parse_date(date_str: str, filename: str) -> str:
    """日付を ISO 形式に変換"""
    if not date_str or date_str.strip() == '':
        return ''

    date_str = date_str.strip()

    # タイプB/C: ISO形式 (例: "2024-10-01 00:00:00")
    if re.match(r'^\d{4}-\d{2}-\d{2}', date_str):
        return date_str[:10]

    # タイプA: 相対日付 (例: "04/12(金)", "4/12(金)", "4/12【金】")
    match = re.match(r'^(\d{1,2})/(\d{1,2})[\(【]([月火水木金土日])[\)】]$', date_str)
    if match:
        month = int(match.group(1))
        day = int(match.group(2))
        # ファイル名から年月を取得 (例: "2024年4月.csv")
        year_match = re.search(r'(\d{4})年(\d{1,2})月', filename)
        if year_match:
            year = int(year_match.group(1))
            return f'{year}-{month:02d}-{day:02d}'

    return ''


def parse_number(value: str) -> float | None:
    """数値をパース"""
    if not value or value.strip() == '':
        return None
    try:
        return float(value.replace(',', ''))
    except ValueError:
        return None


def normalize_platform(platform: str) -> str:
    """SNSプラットフォームを正規化"""
    if not platform or platform.strip() == '':
        return 'TikTok'  # デフォルト

    p = platform.strip().lower()
    if 'tiktok' in p or 'tk' in p:
        return 'TikTok'
    elif 'instagram' in p or 'ig' in p:
        return 'IG'
    elif 'youtube' in p or 'yt' in p:
        return 'YT'
    elif 'x' in p or 'twitter' in p:
        return 'X'
    else:
        return platform.strip()


def normalize_pr_type(pr_type: str) -> str:
    """PR/通常を正規化"""
    if not pr_type or pr_type.strip() == '':
        return '通常'

    p = pr_type.strip().upper()
    if 'PR' in p:
        return 'PR'
    return '通常'


def process_csv(filepath: Path) -> list[dict]:
    """CSVファイルを処理"""
    records = []
    filename = filepath.name

    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        headers = [normalize_header(h.strip()) for h in next(reader)]

        # 空のヘッダーを除去
        headers = [h for h in headers if h]

        for row in reader:
            if not row or not row[0].strip():
                continue

            record = {}
            for i, header in enumerate(headers):
                if i < len(row):
                    eng_key = COLUMN_MAP.get(header)
                    if eng_key:
                        record[eng_key] = row[i].strip() if row[i] else ''

            # 日付パース
            if 'postDate' in record:
                record['postDate'] = parse_date(record['postDate'], filename)
                if record['postDate']:
                    record['month'] = record['postDate'][:7]
                else:
                    continue  # 日付なしはスキップ

            # プラットフォーム正規化
            record['platform'] = normalize_platform(record.get('platform', ''))

            # PR/通常正規化
            record['prType'] = normalize_pr_type(record.get('prType', ''))

            # 担当者デフォルト
            if not record.get('manager') or record['manager'].strip() == '':
                record['manager'] = '不明'

            # 数値フィールドをパース
            for field in ['duration', 'views', 'likes', 'comments', 'shares', 'saves',
                          'likeRate', 'commentRate', 'shareRate', 'saveRate',
                          'avgWatchTime', 'retentionRate', 'retention1s', 'retention3s',
                          'retention6s', 'fullViewRate', 'newFollows', 'followRate', 'recommendRate']:
                if field in record:
                    record[field] = parse_number(record[field])

            # ID生成
            record['id'] = str(uuid.uuid4())[:8]

            # views が 0 または None のレコードはスキップ
            if not record.get('views') or record['views'] == 0:
                continue

            # 必須フィールドのデフォルト値設定
            record.setdefault('title', '')
            record.setdefault('url', '')
            record.setdefault('category', '')
            record.setdefault('likes', 0)
            record.setdefault('comments', 0)
            record.setdefault('shares', 0)
            record.setdefault('saves', 0)

            records.append(record)

    return records


def generate_typescript_wrapper() -> str:
    """TypeScriptラッパーファイルを生成"""
    return '''// 自動生成ファイル - 手動編集禁止
import viewsJson from './views-data.json';

export interface ViewRecord {
  id: string;
  postDate: string;
  month: string;
  accountName: string;
  prType: string;
  platform: string;
  manager: string;
  title: string;
  url: string;
  category: string;
  duration: number | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  likeRate: number | null;
  commentRate: number | null;
  shareRate: number | null;
  saveRate: number | null;
  avgWatchTime: number | null;
  retentionRate: number | null;
  retention1s: number | null;
  retention3s: number | null;
  retention6s: number | null;
  fullViewRate: number | null;
  newFollows: number | null;
  followRate: number | null;
  recommendRate: number | null;
}

export const viewsData: ViewRecord[] = viewsJson as ViewRecord[];
'''


def main():
    print('再生数シートCSV → JSON + TypeScript変換')
    print(f'入力: {CSV_DIR}')
    print(f'出力: {OUTPUT_JSON}')
    print()

    all_records = []
    csv_files = sorted(CSV_DIR.glob('*.csv'))

    for filepath in csv_files:
        records = process_csv(filepath)
        all_records.extend(records)
        print(f'✓ {filepath.name}: {len(records)}件')

    # 日付順にソート
    all_records.sort(key=lambda r: (r.get('postDate', ''), r.get('accountName', '')))

    # 出力ディレクトリ作成
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)

    # JSONファイル書き込み
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(all_records, f, ensure_ascii=False, indent=None)

    # TypeScriptラッパー書き込み
    with open(OUTPUT_TS, 'w', encoding='utf-8') as f:
        f.write(generate_typescript_wrapper())

    print()
    print(f'完了: {len(all_records)}件')
    print(f'  → {OUTPUT_JSON.name}')
    print(f'  → {OUTPUT_TS.name}')

    # 統計表示
    platforms = {}
    managers = {}
    months = {}
    for r in all_records:
        platforms[r.get('platform', '不明')] = platforms.get(r.get('platform', '不明'), 0) + 1
        managers[r.get('manager', '不明')] = managers.get(r.get('manager', '不明'), 0) + 1
        months[r.get('month', '不明')] = months.get(r.get('month', '不明'), 0) + 1

    print()
    print('=== 統計 ===')
    print(f'プラットフォーム別: {dict(sorted(platforms.items()))}')
    print(f'担当者別: {dict(sorted(managers.items()))}')
    print(f'月別: {len(months)}ヶ月')


if __name__ == '__main__':
    main()
