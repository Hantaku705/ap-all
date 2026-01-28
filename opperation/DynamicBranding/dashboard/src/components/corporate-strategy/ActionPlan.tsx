"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Flag, Rocket } from "lucide-react";
import type { StrategyActionPlan } from "@/types/corporate.types";

interface ActionPlanProps {
  actionPlan: StrategyActionPlan;
}

interface TimelineItem {
  label: string;
  icon: React.ElementType;
  items: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export function ActionPlan({ actionPlan }: ActionPlanProps) {
  const timelineItems: TimelineItem[] = [
    {
      label: "短期（1ヶ月）",
      icon: Clock,
      items: actionPlan.shortTerm,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
    },
    {
      label: "中期（3ヶ月）",
      icon: Calendar,
      items: actionPlan.midTerm,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
    },
    {
      label: "長期（1年）",
      icon: Rocket,
      items: actionPlan.longTerm,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
    },
  ];

  const hasAnyActions = actionPlan.shortTerm.length > 0 || actionPlan.midTerm.length > 0 || actionPlan.longTerm.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Flag className="h-4 w-4 text-purple-500" />
          アクションプラン
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          短期・中期・長期の具体的なアクション
        </p>
      </CardHeader>
      <CardContent>
        {!hasAnyActions ? (
          <p className="text-sm text-muted-foreground">アクションプランはありません</p>
        ) : (
          <>
            {/* タイムラインビジュアル */}
            <div className="relative mb-6">
              <div className="flex items-center justify-between">
                {timelineItems.map((item, idx) => {
                  const Icon = item.icon;
                  const hasItems = item.items.length > 0;
                  return (
                    <div key={item.label} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          hasItems
                            ? `${item.bgColor} ${item.borderColor}`
                            : "bg-gray-100 border-gray-200"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${hasItems ? item.color : "text-gray-400"}`}
                        />
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          hasItems ? item.color : "text-gray-400"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.items.length}件
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* 接続線 */}
              <div className="absolute top-5 left-[16.67%] right-[16.67%] h-0.5 bg-gray-200 -z-10" />
            </div>

            {/* アクションリスト */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {timelineItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`p-4 rounded-lg border-2 ${item.bgColor} ${item.borderColor}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`h-4 w-4 ${item.color}`} />
                      <span className={`text-sm font-semibold ${item.color}`}>
                        {item.label}
                      </span>
                    </div>

                    {item.items.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        アクションなし
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {item.items.map((action, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span
                              className={`w-5 h-5 flex-shrink-0 rounded-full ${item.bgColor} border ${item.borderColor} flex items-center justify-center text-xs font-medium ${item.color}`}
                            >
                              {idx + 1}
                            </span>
                            <span className="text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
