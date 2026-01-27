"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FanAssetsResponse, UrchinSpine } from "@/types/corporate.types";
import { Users, AlertCircle, Heart } from "lucide-react";

interface FanUrchinChartProps {
  corporateId: number;
}

interface ExtendedUrchinSpine extends UrchinSpine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  labelX: number;
  labelY: number;
  thickness: number;
  index: number;
}

export function FanUrchinChart({ corporateId }: FanUrchinChartProps) {
  const [data, setData] = useState<FanAssetsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSpine, setHoveredSpine] = useState<ExtendedUrchinSpine | null>(null);

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
  const brandRadius = 40;
  const maxSpineLength = 130;

  // ウニのトゲを計算
  const spines = useMemo(() => {
    if (!data?.urchin_data) return [];

    return data.urchin_data.map((spine, index) => {
      const angleRad = ((spine.angle - 90) * Math.PI) / 180;
      const spineLength = spine.length * maxSpineLength;
      const thickness = Math.max(2, spine.thickness * 15);

      // トゲの先端座標
      const endX = centerX + Math.cos(angleRad) * (brandRadius + spineLength);
      const endY = centerY + Math.sin(angleRad) * (brandRadius + spineLength);

      // トゲの付け根座標
      const startX = centerX + Math.cos(angleRad) * brandRadius;
      const startY = centerY + Math.sin(angleRad) * brandRadius;

      // ラベル位置（トゲの外側）
      const labelX = centerX + Math.cos(angleRad) * (brandRadius + spineLength + 20);
      const labelY = centerY + Math.sin(angleRad) * (brandRadius + spineLength + 20);

      return {
        ...spine,
        startX,
        startY,
        endX,
        endY,
        labelX,
        labelY,
        thickness,
        index,
      };
    });
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ファン資産（ウニ型）</CardTitle>
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
          <CardTitle>ファン資産（ウニ型）</CardTitle>
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            ファン資産（ウニ型）
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">総ファン数</p>
              <p className="text-lg font-bold">{data.total_fans.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">健全度</p>
              <div className="flex items-center gap-1">
                <Heart
                  className={`h-4 w-4 ${
                    data.health_score >= 70
                      ? "text-green-500"
                      : data.health_score >= 40
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                />
                <span className="text-lg font-bold">{data.health_score}%</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          トゲの太さ＝関係強度、トゲの長さ＝親密度（短いほど近い）
        </p>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ウニ可視化 */}
          <div className="flex-1 flex justify-center">
            <svg
              width={svgSize}
              height={svgSize}
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              className="overflow-visible"
            >
              {/* 背景の同心円ガイド */}
              {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <circle
                  key={i}
                  cx={centerX}
                  cy={centerY}
                  r={brandRadius + maxSpineLength * ratio}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              ))}

              {/* トゲ（ファンセグメント） */}
              {spines.map((spine) => (
                <g
                  key={spine.index}
                  onMouseEnter={() => setHoveredSpine(spine)}
                  onMouseLeave={() => setHoveredSpine(null)}
                  className="cursor-pointer transition-opacity"
                  style={{
                    opacity: hoveredSpine && hoveredSpine.index !== spine.index ? 0.4 : 1,
                  }}
                >
                  {/* トゲ本体 */}
                  <line
                    x1={spine.startX}
                    y1={spine.startY}
                    x2={spine.endX}
                    y2={spine.endY}
                    stroke={spine.color}
                    strokeWidth={spine.thickness}
                    strokeLinecap="round"
                  />

                  {/* トゲの先端マーカー */}
                  <circle
                    cx={spine.endX}
                    cy={spine.endY}
                    r={spine.thickness / 2 + 2}
                    fill={spine.color}
                  />

                  {/* ラベル */}
                  <text
                    x={spine.labelX}
                    y={spine.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[10px] fill-gray-600 pointer-events-none"
                  >
                    {spine.name}
                  </text>
                </g>
              ))}

              {/* 中心（ブランド） */}
              <circle
                cx={centerX}
                cy={centerY}
                r={brandRadius}
                fill="url(#brandGradient)"
                stroke="#3b82f6"
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

              {/* グラデーション定義 */}
              <defs>
                <radialGradient id="brandGradient">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* ホバー詳細 & 凡例 */}
          <div className="lg:w-64 space-y-4">
            {/* ホバー詳細 */}
            {hoveredSpine ? (
              <div
                className="p-4 rounded-lg border-2"
                style={{ borderColor: hoveredSpine.color }}
              >
                <h4
                  className="font-medium mb-2"
                  style={{ color: hoveredSpine.color }}
                >
                  {hoveredSpine.name}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ユーザー数</span>
                    <span className="font-mono">
                      {hoveredSpine.userCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">関係強度</span>
                    <span className="font-mono">
                      {(hoveredSpine.thickness / 15 * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">親密度</span>
                    <span className="font-mono">
                      {(hoveredSpine.length * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">平均感情</span>
                    <span
                      className={`font-mono ${
                        hoveredSpine.sentiment > 0
                          ? "text-green-600"
                          : hoveredSpine.sentiment < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {hoveredSpine.sentiment > 0 ? "+" : ""}
                      {hoveredSpine.sentiment.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg border bg-gray-50 text-center text-sm text-muted-foreground">
                トゲにホバーして詳細を表示
              </div>
            )}

            {/* 凡例 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                セグメント凡例
              </h4>
              {data.urchin_data.map((spine, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                  onMouseEnter={() => setHoveredSpine(spines[i])}
                  onMouseLeave={() => setHoveredSpine(null)}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: spine.color }}
                  />
                  <span className="flex-1">{spine.name}</span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {spine.userCount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* 読み方ガイド */}
            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
              <p className="font-medium mb-1">読み方</p>
              <ul className="space-y-1">
                <li>• <strong>太いトゲ</strong>＝強い関係</li>
                <li>• <strong>短いトゲ</strong>＝近い距離（親密）</li>
                <li>• 内側に近いほど熱心なファン</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
