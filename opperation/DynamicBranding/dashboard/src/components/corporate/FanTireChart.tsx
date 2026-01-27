"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FanAssetsResponse, TireRing } from "@/types/corporate.types";
import { Circle, AlertCircle, Users } from "lucide-react";

interface FanTireChartProps {
  corporateId: number;
}

interface ExtendedTireRing extends TireRing {
  innerR: number;
  outerR: number;
  index: number;
}

export function FanTireChart({ corporateId }: FanTireChartProps) {
  const [data, setData] = useState<FanAssetsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRing, setHoveredRing] = useState<ExtendedTireRing | null>(null);

  useEffect(() => {
    async function fetchFans() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/corporate/${corporateId}/fans`);
        if (!res.ok) throw new Error("Failed to fetch fan data");
        const json: FanAssetsResponse = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching fan assets:", err);
        setError("ファンデータの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchFans();
  }, [corporateId]);

  // SVG設定
  const svgSize = 400;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const maxRadius = 180;
  const brandRadius = 35;

  // リングを計算
  const rings = useMemo(() => {
    if (!data?.tire_data) return [];

    return data.tire_data.map((ring, index) => {
      const innerR = brandRadius + ring.innerRadius * (maxRadius - brandRadius);
      const outerR = brandRadius + ring.outerRadius * (maxRadius - brandRadius);

      return {
        ...ring,
        innerR,
        outerR,
        index,
      };
    });
  }, [data]);

  // パーセンテージ計算
  const totalUsers = data?.total_fans || 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ファン資産（タイヤ型）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[450px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ファン資産（タイヤ型）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[450px] flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-600">{error || "データがありません"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // リング用のSVG円弧パス生成
  function createRingPath(
    cx: number,
    cy: number,
    innerR: number,
    outerR: number
  ): string {
    // 完全な円環を描画
    return `
      M ${cx - outerR} ${cy}
      A ${outerR} ${outerR} 0 1 1 ${cx + outerR} ${cy}
      A ${outerR} ${outerR} 0 1 1 ${cx - outerR} ${cy}
      M ${cx - innerR} ${cy}
      A ${innerR} ${innerR} 0 1 0 ${cx + innerR} ${cy}
      A ${innerR} ${innerR} 0 1 0 ${cx - innerR} ${cy}
    `;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Circle className="h-5 w-5" />
            ファン資産（タイヤ型）
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">総ファン数</p>
              <p className="text-lg font-bold">{data.total_fans.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          内側＝コアファン（親密）、外側＝ライトファン、リング幅＝人数
        </p>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* タイヤ可視化 */}
          <div className="flex-1 flex justify-center">
            <svg
              width={svgSize}
              height={svgSize}
              viewBox={`0 0 ${svgSize} ${svgSize}`}
            >
              {/* リング（外側から内側へ描画） */}
              {[...rings].reverse().map((ring) => (
                <path
                  key={ring.index}
                  d={createRingPath(centerX, centerY, ring.innerR, ring.outerR)}
                  fill={ring.color}
                  fillOpacity={
                    hoveredRing && hoveredRing.index !== ring.index ? 0.3 : 0.8
                  }
                  stroke={ring.color}
                  strokeWidth={1}
                  fillRule="evenodd"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredRing(ring)}
                  onMouseLeave={() => setHoveredRing(null)}
                />
              ))}

              {/* 中心（ブランド） */}
              <circle
                cx={centerX}
                cy={centerY}
                r={brandRadius}
                fill="url(#tireGradient)"
                stroke="#1e40af"
                strokeWidth={3}
              />
              <text
                x={centerX}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-bold fill-white"
              >
                Brand
              </text>

              {/* リングラベル */}
              {rings.map((ring) => {
                const labelR = (ring.innerR + ring.outerR) / 2;
                const percentage = totalUsers > 0
                  ? ((ring.userCount / totalUsers) * 100).toFixed(1)
                  : "0";
                return (
                  <g key={`label-${ring.index}`}>
                    <text
                      x={centerX + labelR}
                      y={centerY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[9px] font-medium fill-white pointer-events-none"
                      style={{
                        textShadow: "0 0 3px rgba(0,0,0,0.5)",
                      }}
                    >
                      {percentage}%
                    </text>
                  </g>
                );
              })}

              {/* グラデーション定義 */}
              <defs>
                <radialGradient id="tireGradient">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1e40af" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* 詳細パネル */}
          <div className="lg:w-72 space-y-4">
            {/* ホバー詳細 */}
            {hoveredRing ? (
              <div
                className="p-4 rounded-lg border-2"
                style={{ borderColor: hoveredRing.color }}
              >
                <h4
                  className="font-medium mb-3"
                  style={{ color: hoveredRing.color }}
                >
                  {hoveredRing.name}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">ユーザー数</span>
                    <span className="font-mono font-bold text-lg">
                      {hoveredRing.userCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">シェア</span>
                    <span className="font-mono">
                      {totalUsers > 0
                        ? ((hoveredRing.userCount / totalUsers) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">構成比</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            totalUsers > 0
                              ? (hoveredRing.userCount / totalUsers) * 100
                              : 0
                          }%`,
                          backgroundColor: hoveredRing.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg border bg-gray-50 text-center text-sm text-muted-foreground">
                リングにホバーして詳細を表示
              </div>
            )}

            {/* セグメント一覧 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                セグメント構成
              </h4>
              {data.tire_data.map((ring, i) => {
                const percentage =
                  totalUsers > 0
                    ? ((ring.userCount / totalUsers) * 100).toFixed(1)
                    : "0";
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                    onMouseEnter={() => setHoveredRing(rings[i])}
                    onMouseLeave={() => setHoveredRing(null)}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ring.color }}
                    />
                    <span className="flex-1 text-sm">{ring.name}</span>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">
                        {ring.userCount.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 読み方ガイド */}
            <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-800">
              <p className="font-medium mb-1">読み方</p>
              <ul className="space-y-1">
                <li>• <strong>内側リング</strong>＝コアファン（親密）</li>
                <li>• <strong>外側リング</strong>＝ライトファン</li>
                <li>• <strong>リング幅</strong>＝そのセグメントの人数</li>
                <li>• 理想は内側リングが太い状態</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
