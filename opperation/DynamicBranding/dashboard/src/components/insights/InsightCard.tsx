"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BRAND_COLORS, CONFIDENCE_COLORS } from "@/lib/utils/colors";
import {
  Link2,
  Calendar,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";

interface InsightCardProps {
  title: string;
  description: string;
  category: "correlation" | "seasonality" | "strategy" | "risk";
  confidence: "A" | "B" | "C";
  confidenceReason: string | null;
  relatedBrands: string[] | null;
  actionItems: string[] | null;
}

const CATEGORY_ICONS = {
  correlation: Link2,
  seasonality: Calendar,
  strategy: Lightbulb,
  risk: AlertTriangle,
};

const CATEGORY_LABELS = {
  correlation: "相関分析",
  seasonality: "季節性",
  strategy: "戦略",
  risk: "リスク",
};

// 納得性に基づく重要度スコア
const CONFIDENCE_SCORES: Record<string, number> = {
  A: 90,
  B: 70,
  C: 50,
};

export function InsightCard({
  title,
  description,
  category,
  confidence,
  confidenceReason,
  relatedBrands,
  actionItems,
}: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = CATEGORY_ICONS[category];
  const colors = CONFIDENCE_COLORS[confidence];
  const score = CONFIDENCE_SCORES[confidence] || 50;
  const isHighPriority = score >= 80;

  return (
    <Card className={`border-l-4 ${colors.border} ${isHighPriority ? "bg-amber-50/50 ring-1 ring-amber-200" : ""} transition-all duration-300 hover:shadow-md`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex gap-2 items-center">
            {isHighPriority && (
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            )}
            <Badge variant="outline" className="text-xs">
              {CATEGORY_LABELS[category]}
            </Badge>
            <Badge className={`${colors.bg} ${colors.text} border-0`}>
              納得性: {confidence}
            </Badge>
            <span className="text-xs text-muted-foreground">
              スコア {score}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>

        {relatedBrands && relatedBrands.length > 0 && (
          <div className="mb-4">
            <span className="text-sm font-medium">関連ブランド:</span>
            <div className="flex gap-1 mt-1 flex-wrap">
              {relatedBrands.map((brand) => (
                <Badge
                  key={brand}
                  className="text-white"
                  style={{ backgroundColor: BRAND_COLORS[brand] || "#666" }}
                >
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 py-1 px-2 -ml-2 rounded hover:bg-muted/50 active:scale-95"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              詳細を閉じる
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              詳細を表示
            </>
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-4 border-t pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {confidenceReason && (
              <div>
                <span className="text-sm font-medium">納得性の根拠:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {confidenceReason}
                </p>
              </div>
            )}

            {actionItems && actionItems.length > 0 && (
              <div>
                <span className="text-sm font-medium">推奨アクション:</span>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                  {actionItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
