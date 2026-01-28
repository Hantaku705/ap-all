"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Lightbulb, BarChart3, TrendingUp, Users, Globe } from "lucide-react";
import type { StrategyChallenge, StrategyOpportunity } from "@/types/corporate.types";

interface ChallengeOpportunityProps {
  challenges: StrategyChallenge[];
  opportunities: StrategyOpportunity[];
}

const SOURCE_ICONS: Record<string, React.ElementType> = {
  ugc: BarChart3,
  stock: TrendingUp,
  loyalty: Users,
  world: Globe,
};

const SOURCE_LABELS: Record<string, string> = {
  ugc: "UGC分析",
  stock: "株価相関",
  loyalty: "ファン資産",
  world: "世の中分析",
};

const SEVERITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  high: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  medium: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  low: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
};

const POTENTIAL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  high: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  medium: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  low: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
};

export function ChallengeOpportunity({ challenges, opportunities }: ChallengeOpportunityProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 課題セクション */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            課題
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            データから検出された注意点
          </p>
        </CardHeader>
        <CardContent>
          {challenges.length === 0 ? (
            <p className="text-sm text-muted-foreground">課題は検出されませんでした</p>
          ) : (
            <div className="space-y-3">
              {challenges.map((challenge, idx) => {
                const Icon = SOURCE_ICONS[challenge.source] || BarChart3;
                const colors = SEVERITY_COLORS[challenge.severity];
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded ${colors.bg}`}>
                        <Icon className={`h-4 w-4 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{challenge.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
                            {challenge.severity === "high" ? "重要度: 高" : challenge.severity === "medium" ? "重要度: 中" : "重要度: 低"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {SOURCE_LABELS[challenge.source]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 機会セクション */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-green-500" />
            機会
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            データから見つかった成長機会
          </p>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <p className="text-sm text-muted-foreground">機会は検出されませんでした</p>
          ) : (
            <div className="space-y-3">
              {opportunities.map((opportunity, idx) => {
                const Icon = SOURCE_ICONS[opportunity.source] || Globe;
                const colors = POTENTIAL_COLORS[opportunity.potential];
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded ${colors.bg}`}>
                        <Icon className={`h-4 w-4 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{opportunity.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
                            {opportunity.potential === "high" ? "ポテンシャル: 高" : opportunity.potential === "medium" ? "ポテンシャル: 中" : "ポテンシャル: 低"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {SOURCE_LABELS[opportunity.source]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
