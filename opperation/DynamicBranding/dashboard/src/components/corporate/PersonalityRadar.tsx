"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { PersonalityTraits } from "@/types/corporate.types";
import { PERSONALITY_TRAIT_LABELS } from "@/types/corporate.types";

interface PersonalityRadarProps {
  traits: PersonalityTraits;
  size?: "sm" | "md" | "lg";
}

export function PersonalityRadar({ traits, size = "md" }: PersonalityRadarProps) {
  // Recharts用のデータ形式に変換（双極軸ラベル）
  const data = Object.entries(traits).map(([key, value]) => {
    const labels = PERSONALITY_TRAIT_LABELS[key as keyof PersonalityTraits];
    return {
      trait: `${labels.left} ↔ ${labels.right}`,
      leftLabel: labels.left,
      rightLabel: labels.right,
      value,
      fullMark: 50,
    };
  });

  const heights = {
    sm: 200,
    md: 300,
    lg: 400,
  };

  return (
    <ResponsiveContainer width="100%" height={heights[size]}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid strokeDasharray="3 3" />
        <PolarAngleAxis
          dataKey="trait"
          tick={{ fontSize: size === "sm" ? 8 : 10 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[-50, 50]}
          tick={{ fontSize: 10 }}
          tickCount={5}
        />
        <Radar
          name="パーソナリティ"
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.5}
          strokeWidth={2}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0];
            const value = item.value as number;
            const formattedValue = value > 0 ? `+${value}` : `${value}`;
            return (
              <div className="bg-white border rounded-lg shadow-lg p-2 text-sm">
                <p className="font-medium text-xs">{item.payload.trait}</p>
                <p className="text-blue-600 font-mono text-lg">{formattedValue}</p>
                <p className="text-gray-500 text-xs">
                  {value < 0 ? item.payload.leftLabel : value > 0 ? item.payload.rightLabel : '中立'}寄り
                </p>
              </div>
            );
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
