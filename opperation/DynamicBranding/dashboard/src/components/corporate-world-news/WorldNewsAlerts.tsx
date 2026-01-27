"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, ExternalLink, Clock } from "lucide-react";
import {
  WorldNewsAlert,
  WorldNewsAlertsResponse,
  WORLD_NEWS_CATEGORY_COLORS,
  WORLD_NEWS_CATEGORY_LABELS,
  WORLD_NEWS_SENTIMENT_COLORS,
} from "@/types/corporate.types";

interface WorldNewsAlertsProps {
  corpId: number;
  limit?: number;
}

export function WorldNewsAlerts({ corpId, limit = 5 }: WorldNewsAlertsProps) {
  const [data, setData] = useState<WorldNewsAlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/corporate/${corpId}/world-news/alerts?limit=${limit}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [corpId, limit]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold">重要アラート</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!data || data.alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold">重要アラート</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          重要なニュースはありません
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold">重要アラート</h3>
        </div>
        <span className="text-sm text-gray-500">{data.total}件</span>
      </div>

      <div className="space-y-3">
        {data.alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: WorldNewsAlert }) {
  const categoryColor = WORLD_NEWS_CATEGORY_COLORS[alert.category || "other"];
  const categoryLabel = WORLD_NEWS_CATEGORY_LABELS[alert.category || "other"];
  const sentimentColor = alert.sentiment
    ? WORLD_NEWS_SENTIMENT_COLORS[alert.sentiment]
    : "#6b7280";

  const publishedDate = alert.published_at
    ? new Date(alert.published_at).toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="border-l-4 border-red-400 pl-3 py-2 bg-red-50/50 rounded-r">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {alert.category && (
              <span
                className="text-xs px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: categoryColor }}
              >
                {categoryLabel}
              </span>
            )}
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: sentimentColor }}
            />
          </div>
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
            {alert.title}
          </h4>
          {alert.summary && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
              {alert.summary}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {publishedDate}
            </span>
            <span>{alert.source_name}</span>
          </div>
        </div>
        <a
          href={alert.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-1 text-blue-600 hover:bg-blue-50 rounded"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
