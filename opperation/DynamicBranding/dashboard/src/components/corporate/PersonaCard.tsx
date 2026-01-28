"use client";

import { ExternalLink } from "lucide-react";
import { LoyaltyPersona } from "@/types/corporate.types";

interface PersonaCardProps {
  persona: LoyaltyPersona;
  levelColor: string;
}

export function PersonaCard({ persona, levelColor }: PersonaCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* ヘッダー: 名前 + 年代 + 割合 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👤</span>
          <div>
            <h4 className="font-bold text-gray-900">{persona.personaName}</h4>
            <p className="text-sm text-gray-500">
              {persona.ageRange}・{persona.lifeStage}
            </p>
          </div>
        </div>
        <div
          className="text-sm font-bold px-2 py-1 rounded"
          style={{ backgroundColor: `${levelColor}20`, color: levelColor }}
        >
          {persona.percentage}%
        </div>
      </div>

      {/* 関心事 */}
      <div className="mb-3">
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
          <span>💡</span>
          <span className="font-medium">関心事</span>
        </div>
        <p className="text-sm text-gray-700">
          {persona.interests.join(" / ")}
        </p>
      </div>

      {/* 動機 */}
      <div className="mb-3">
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
          <span>🎯</span>
          <span className="font-medium">動機</span>
        </div>
        <p className="text-sm text-gray-700">
          {persona.motivations.join(" / ")}
        </p>
      </div>

      {/* 声のトーン */}
      <div className="mb-3">
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
          <span>🗣️</span>
          <span className="font-medium">声のトーン</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {persona.voiceTone.map((tone, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${levelColor}15`, color: levelColor }}
            >
              {tone}
            </span>
          ))}
        </div>
      </div>

      {/* 代表的な引用 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-start gap-2">
          <span className="text-gray-400">💬</span>
          {persona.representativeQuoteUrl ? (
            <a
              href={persona.representativeQuoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 italic leading-relaxed hover:underline group"
            >
              &ldquo;{persona.representativeQuote}&rdquo;
              <ExternalLink className="inline-block h-3 w-3 ml-1 opacity-60 group-hover:opacity-100" />
            </a>
          ) : (
            <p className="text-sm text-gray-600 italic leading-relaxed">
              &ldquo;{persona.representativeQuote}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
