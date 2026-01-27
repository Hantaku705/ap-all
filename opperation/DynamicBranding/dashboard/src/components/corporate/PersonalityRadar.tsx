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
  // Recharts用のデータ形式に変換
  const data = Object.entries(traits).map(([key, value]) => ({
    trait: PERSONALITY_TRAIT_LABELS[key as keyof PersonalityTraits],
    value,
    fullMark: 100,
  }));

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
          tick={{ fontSize: size === "sm" ? 10 : 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
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
            return (
              <div className="bg-white border rounded-lg shadow-lg p-2 text-sm">
                <p className="font-medium">{item.payload.trait}</p>
                <p className="text-blue-600 font-mono">{item.value}/100</p>
              </div>
            );
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
