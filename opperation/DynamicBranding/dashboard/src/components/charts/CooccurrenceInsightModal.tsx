"use client";

import { X, MessageSquare, TrendingUp, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RepresentativePost {
  id: string;
  content: string;
  sentiment: string | null;
  dish: string | null;
  scene: string | null;
}

interface CooccurrencePair {
  brand1: string;
  brand2: string;
  count: number;
  representativePosts: RepresentativePost[];
  patterns: {
    dishes: string[];
    scenes: string[];
    sentiments: Record<string, number>;
  };
  insight: string;
}

interface CooccurrenceInsightModalProps {
  pair: CooccurrencePair | null;
  onClose: () => void;
}

const SENTIMENT_LABELS: Record<string, string> = {
  positive: "ポジティブ",
  neutral: "ニュートラル",
  negative: "ネガティブ",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "bg-green-100 text-green-800",
  neutral: "bg-gray-100 text-gray-800",
  negative: "bg-red-100 text-red-800",
};

export function CooccurrenceInsightModal({
  pair,
  onClose,
}: CooccurrenceInsightModalProps) {
  if (!pair) return null;

  const totalSentiments =
    (pair.patterns.sentiments.positive || 0) +
    (pair.patterns.sentiments.neutral || 0) +
    (pair.patterns.sentiments.negative || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold">
              {pair.brand1} × {pair.brand2}
            </h2>
            <p className="text-sm text-muted-foreground">
              同時言及 {pair.count.toLocaleString()} 件
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Insight */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">インサイト</h3>
                  <p className="text-sm text-blue-900">{pair.insight}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dishes */}
            {pair.patterns.dishes.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span>🍳</span>よく出る料理
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pair.patterns.dishes.map((dish) => (
                      <span
                        key={dish}
                        className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm"
                      >
                        {dish}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scenes */}
            {pair.patterns.scenes.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span>🕐</span>よく出るシーン
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pair.patterns.scenes.map((scene) => (
                      <span
                        key={scene}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm"
                      >
                        {scene}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sentiment Distribution */}
          {totalSentiments > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  センチメント分布
                </h3>
                <div className="flex gap-4">
                  {Object.entries(pair.patterns.sentiments).map(
                    ([sentiment, count]) => (
                      <div key={sentiment} className="text-center">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${SENTIMENT_COLORS[sentiment] || "bg-gray-100"}`}
                        >
                          {SENTIMENT_LABELS[sentiment] || sentiment}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {count}件 ({Math.round((count / totalSentiments) * 100)}%)
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Representative Posts */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              代表的な投稿
            </h3>
            <div className="space-y-3">
              {pair.representativePosts.map((post) => (
                <Card key={post.id} className="bg-gray-50">
                  <CardContent className="p-3">
                    <p className="text-sm">{post.content}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {post.sentiment && (
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${SENTIMENT_COLORS[post.sentiment] || "bg-gray-100"}`}
                        >
                          {SENTIMENT_LABELS[post.sentiment] || post.sentiment}
                        </span>
                      )}
                      {post.dish && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">
                          {post.dish}
                        </span>
                      )}
                      {post.scene && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                          {post.scene}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
