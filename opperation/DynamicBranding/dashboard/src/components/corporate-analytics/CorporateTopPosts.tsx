"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ThumbsUp, Repeat, Eye } from "lucide-react";

interface TopPost {
  rank: number;
  id: number;
  content: string;
  source: string;
  published: string;
  sentiment: string;
  sentimentLabel: string;
  topic: string;
  topicLabel: string;
  engagement: number;
  likes: number;
  retweets: number;
  impressions: number;
}

interface TopPostsResponse {
  posts: TopPost[];
  total: number;
}

const TOPIC_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "stock_ir", label: "株価・IR" },
  { value: "csr_sustainability", label: "CSR・サステナ" },
  { value: "employment", label: "採用・働き方" },
  { value: "company_news", label: "企業ニュース" },
  { value: "rnd", label: "研究開発" },
  { value: "management", label: "経営・理念" },
  { value: "other", label: "その他" },
];

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "bg-green-100 text-green-800",
  neutral: "bg-gray-100 text-gray-800",
  negative: "bg-red-100 text-red-800",
};

export function CorporateTopPosts() {
  const [data, setData] = useState<TopPostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", limit.toString());
        if (selectedTopic !== "all") {
          params.set("topic", selectedTopic);
        }
        const res = await fetch(`/api/corporate/top-posts?${params}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch top posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedTopic, limit]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.posts.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">高エンゲージメント投稿</h3>
        <div className="text-gray-500 text-center py-8">
          該当する投稿がありません
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">高エンゲージメント投稿</h3>
        <div className="flex gap-2">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            {TOPIC_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value={5}>5件</option>
            <option value={10}>10件</option>
            <option value={20}>20件</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.posts.map((post) => (
          <div
            key={post.id}
            className="border rounded-lg p-3 hover:bg-gray-50 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-600">
                    #{post.rank}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      SENTIMENT_COLORS[post.sentiment] || SENTIMENT_COLORS.neutral
                    }`}
                  >
                    {post.sentimentLabel}
                  </span>
                  {post.topicLabel && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {post.topicLabel}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {post.source} |{" "}
                    {post.published
                      ? new Date(post.published).toLocaleDateString("ja-JP")
                      : "日付不明"}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {post.content || "（コンテンツなし）"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-purple-600">
                  {post.engagement.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">エンゲージメント</div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {post.likes.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                {post.retweets.toLocaleString()}
              </span>
              {post.impressions > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.impressions.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
