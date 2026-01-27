"use client";

import { useState, useMemo } from "react";
import { Persona } from "@/types/persona.types";
import { BRAND_COLORS } from "@/lib/utils/colors";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

// 9ゾーン「界隈」設定（3×3グリッド）
const ZONE_CONFIG = [
  { id: "quick-gourmet", name: "時短グルメ界隈", x1: -2.5, x2: -0.67, y1: 0.67, y2: 2.5 },
  { id: "committed", name: "こだわり派界隈", x1: -0.67, x2: 0.67, y1: 0.67, y2: 2.5 },
  { id: "authentic", name: "本格派界隈", x1: 0.67, x2: 2.5, y1: 0.67, y2: 2.5 },
  { id: "everyday", name: "普段使い界隈", x1: -2.5, x2: -0.67, y1: -0.67, y2: 0.67 },
  { id: "versatile", name: "万能派界隈", x1: -0.67, x2: 0.67, y1: -0.67, y2: 0.67 },
  { id: "enthusiast", name: "料理好き界隈", x1: 0.67, x2: 2.5, y1: -0.67, y2: 0.67 },
  { id: "quick-routine", name: "時短ルーティン界隈", x1: -2.5, x2: -0.67, y1: -2.5, y2: -0.67 },
  { id: "standard", name: "定番派界隈", x1: -0.67, x2: 0.67, y1: -2.5, y2: -0.67 },
  { id: "careful-daily", name: "丁寧な日常界隈", x1: 0.67, x2: 2.5, y1: -2.5, y2: -0.67 },
];

// 座標からゾーン名を取得
function getZoneName(x: number, y: number): string {
  for (const zone of ZONE_CONFIG) {
    if (x >= zone.x1 && x < zone.x2 && y >= zone.y1 && y < zone.y2) {
      return zone.name;
    }
  }
  // 境界値の場合は最も近いゾーンを判定
  for (const zone of ZONE_CONFIG) {
    if (x >= zone.x1 && x <= zone.x2 && y >= zone.y1 && y <= zone.y2) {
      return zone.name;
    }
  }
  return "不明";
}

type SortKey = "brand" | "name" | "zone" | "positionX" | "positionY" | "postCount" | "share" | "skill" | "motivation";
type SortDirection = "asc" | "desc" | null;

interface PersonaTableProps {
  personas: Persona[];
  onSelectPersona: (persona: Persona) => void;
}

export function PersonaTable({ personas, onSelectPersona }: PersonaTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // テーブル行データの作成
  const tableData = useMemo(() => {
    return personas.map((p) => ({
      persona: p,
      brand: p.brand,
      name: p.name,
      zone: getZoneName(p.position.x, p.position.y),
      positionX: p.position.x,
      positionY: p.position.y,
      postCount: p.metrics.post_count,
      share: p.metrics.share_percentage,
      skill: p.attributes.cooking_skill,
      motivation: p.attributes.primary_motivation,
    }));
  }, [personas]);

  // ソート処理
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return tableData;

    return [...tableData].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      // null/undefined の場合は最後に
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // 数値比較
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      // 文字列比較
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr, "ja")
        : bStr.localeCompare(aStr, "ja");
    });
  }, [tableData, sortKey, sortDirection]);

  // ソートトグル
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // ソートアイコン
  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ChevronsUpDown className="h-3 w-3 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3 text-primary" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary" />
    );
  };

  // ヘッダーセル
  const HeaderCell = ({
    label,
    sortKey: key,
    className = "",
  }: {
    label: string;
    sortKey: SortKey;
    className?: string;
  }) => (
    <th
      className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none ${className}`}
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon columnKey={key} />
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <HeaderCell label="ブランド" sortKey="brand" />
            <HeaderCell label="ペルソナ名" sortKey="name" className="min-w-[150px]" />
            <HeaderCell label="界隈" sortKey="zone" className="min-w-[140px]" />
            <HeaderCell label="位置X" sortKey="positionX" />
            <HeaderCell label="位置Y" sortKey="positionY" />
            <HeaderCell label="投稿数" sortKey="postCount" />
            <HeaderCell label="シェア" sortKey="share" />
            <HeaderCell label="スキル" sortKey="skill" />
            <HeaderCell label="動機" sortKey="motivation" className="min-w-[120px]" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, idx) => (
            <tr
              key={`${row.brand}-${row.persona.id}-${idx}`}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelectPersona(row.persona)}
            >
              {/* ブランド */}
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: BRAND_COLORS[row.brand] || "#666" }}
                  />
                  <span className="text-sm font-medium">{row.brand}</span>
                </div>
              </td>

              {/* ペルソナ名 */}
              <td className="px-3 py-2">
                <span className="text-sm font-medium text-gray-900">{row.name}</span>
              </td>

              {/* 界隈 */}
              <td className="px-3 py-2 whitespace-nowrap">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {row.zone}
                </span>
              </td>

              {/* 位置X */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 text-right">
                {row.positionX.toFixed(2)}
              </td>

              {/* 位置Y */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 text-right">
                {row.positionY.toFixed(2)}
              </td>

              {/* 投稿数 */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 text-right">
                {row.postCount.toLocaleString()}
              </td>

              {/* シェア */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 text-right">
                {row.share.toFixed(1)}%
              </td>

              {/* スキル */}
              <td className="px-3 py-2 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    row.skill === "上級"
                      ? "bg-green-100 text-green-800"
                      : row.skill === "中級"
                      ? "bg-blue-100 text-blue-800"
                      : row.skill === "初級"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {row.skill || "不明"}
                </span>
              </td>

              {/* 動機 */}
              <td className="px-3 py-2 whitespace-nowrap">
                <span className="text-sm text-gray-600 truncate max-w-[120px] block">
                  {row.motivation || "不明"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* データなし */}
      {sortedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          該当するペルソナがありません
        </div>
      )}

      {/* フッター */}
      <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
        <span>全 {sortedData.length} 件</span>
        <span>行をクリックで詳細表示</span>
      </div>
    </div>
  );
}
