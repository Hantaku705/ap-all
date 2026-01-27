"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ThumbsUp, ThumbsDown, Minus, ExternalLink } from "lucide-react";

interface SNSPost {
  url: string;
  published: string;
  title: string;
  content: string;
  sentiment?: string | null;
  source_category?: string;
}

interface BrandPostsSectionProps {
  brandName: string;
}

const SENTIMENT_CONFIG: Record<
  string,
  { icon: typeof ThumbsUp; color: string; label: string }
> = {
  positive: { icon: ThumbsUp, color: "text-green-600", label: "ポジティブ" },
  neutral: { icon: Minus, color: "text-gray-500", label: "ニュートラル" },
  negative: { icon: ThumbsDown, color: "text-red-600", label: "ネガティブ" },
};

export function BrandPostsSection({ brandName }: BrandPostsSectionProps) {
  const [posts, setPosts] = useState<SNSPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/data/sns?brands=${encodeURIComponent(brandName)}&limit=50`
        );
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setPosts(json.data || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("投稿データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [brandName]);

  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-bold mb-4">生投稿サンプル</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="h-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-xl font-bold mb-4">生投稿サンプル</h2>
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-400" />
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // センチメント別に分類
  const positivePosts = posts.filter((p) => p.sentiment === "positive").slice(0, 3);
  const negativePosts = posts.filter((p) => p.sentiment === "negative").slice(0, 3);
  const neutralPosts = posts.filter((p) => p.sentiment === "neutral").slice(0, 3);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const renderPost = (post: SNSPost) => {
    const sentimentConfig = SENTIMENT_CONFIG[post.sentiment || "neutral"] || SENTIMENT_CONFIG.neutral;
    const SentimentIcon = sentimentConfig.icon;

    return (
      <Card key={post.url} className="hover:shadow-md transition-shadow">
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <SentimentIcon className={`h-4 w-4 ${sentimentConfig.color}`} />
              <span className={`text-xs ${sentimentConfig.color}`}>
                {sentimentConfig.label}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(post.published)}
            </span>
          </div>
          <p className="text-sm line-clamp-3 mb-2">
            {post.content || post.title || "（内容なし）"}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {post.source_category || "SNS"}
            </span>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              元投稿
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">生投稿サンプル</h2>
      <p className="text-muted-foreground mb-4">
        {brandName}に関する投稿から代表的なものを表示（全{posts.length}件から抽出）
      </p>

      <div className="space-y-6">
        {/* ポジティブ投稿 */}
        {positivePosts.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              ポジティブな投稿
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {positivePosts.map(renderPost)}
            </div>
          </div>
        )}

        {/* ネガティブ投稿 */}
        {negativePosts.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
              <ThumbsDown className="h-4 w-4" />
              ネガティブな投稿
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {negativePosts.map(renderPost)}
            </div>
          </div>
        )}

        {/* ニュートラル投稿 */}
        {neutralPosts.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
              <Minus className="h-4 w-4" />
              ニュートラルな投稿
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {neutralPosts.map(renderPost)}
            </div>
          </div>
        )}

        {posts.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              投稿データがありません
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
