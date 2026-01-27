# persona/

## 概要

ペルソナ分析タブコンポーネント。k-meansクラスタリングによるペルソナ可視化UI。

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `PersonaAnalysisTab.tsx` | ペルソナ分析タブ（PersonaClusterChartラッパー + 説明） |

## 使用コンポーネント

| 外部コンポーネント | パス |
|------------------|------|
| `PersonaClusterChart` | `../charts/PersonaClusterChart.tsx` |

## 関連ディレクトリ

- `../charts/` - PersonaClusterChart
- `../../lib/clustering/` - k-meansクラスタリングロジック
- `../../app/api/personas/` - ペルソナ生成API

## 注意事項

- `"use client"` ディレクティブが必要
- ペルソナは24時間キャッシュ（`brand_persona_cache`テーブル）
- 散布図の軸: 横=料理スキル、縦=こだわり度

## 更新履歴

- 2026-01-23: 初版作成
