"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp, TrendingDown, Minus, Sparkles, Heart, MessageCircle, Repeat2, Zap, ExternalLink } from "lucide-react";

interface SamplePost {
  content: string;
  published: string;
  url: string | null;
  likesCount: number;
  retweetsCount: number;
  commentsCount: number;
  engagementTotal: number;
}

interface CepDiscoveryItem {
  cepId: number;
  cepName: string;
  cepCategory: string;
  mentionCount: number;
  avgEngagement: number;
  engagementRatio: number;
  samplePosts: SamplePost[];
  // 追加フィールド
  trend: "growing" | "stable" | "declining";
  vsAvgEngagement: number;
  consistencyScore: number;
  viralIndex: number;
  highlightReason: string;
}

interface CepDiscoveryResponse {
  mainstream: CepDiscoveryItem[];
  surprising: CepDiscoveryItem[];
  brand: string;
}

interface CEPDiscoveryProps {
  brandName: string;
}

export function CEPDiscovery({ brandName }: CEPDiscoveryProps) {
  const [data, setData] = useState<CepDiscoveryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/ceps/discovery?brand=${encodeURIComponent(brandName)}`
        );
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching CEP discovery:", err);
        setError("CEPデータの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [brandName]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CEP発見: {brandName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CEP発見: {brandName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-red-600">{error || "データがありません"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasMainstream = data.mainstream.length > 0;
  const hasSurprising = data.surprising.length > 0;

  if (!hasMainstream && !hasSurprising) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CEP発見: {brandName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <p>CEPデータが見つかりませんでした</p>
            <p className="text-sm">SNS投稿にCEPラベルが付与されていることを確認してください</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          CEP発見: {brandName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          投稿ベースで分析した「王道CEP」と「意外なCEP」
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 王道CEP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">王道CEP TOP5</h3>
              <span className="text-xs text-muted-foreground ml-auto">総合スコア上位</span>
            </div>
            {data.mainstream.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">データなし</p>
            ) : (
              <div className="space-y-3">
                {data.mainstream.map((item, index) => (
                  <CepCard key={item.cepId} item={item} rank={index + 1} type="mainstream" />
                ))}
              </div>
            )}
          </div>

          {/* 意外なCEP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">意外なCEP TOP5</h3>
              <span className="text-xs text-muted-foreground ml-auto">伸びしろ大</span>
            </div>
            {data.surprising.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                意外なCEPが見つかりませんでした（ENGデータ投入後に表示されます）
              </p>
            ) : (
              <div className="space-y-3">
                {data.surprising.map((item, index) => (
                  <CepCard key={item.cepId} item={item} rank={index + 1} type="surprising" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 注釈 */}
        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>
            <strong>王道CEP</strong>: 言及数・エンゲージメント・一貫性の総合スコアで選定。安定して支持されている使い方。
          </p>
          <p>
            <strong>意外なCEP</strong>: 言及数は少ないが成長トレンドやバイラル指数が高い。今後伸びる可能性のある使い方。
          </p>
          <p className="text-muted-foreground/70">
            <span className="inline-block w-16">vs平均</span>: 全体平均との比較 /
            <span className="inline-block w-16 ml-2">バイラル</span>: 最大ENG÷平均ENG（爆発力）
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface CepCardProps {
  item: CepDiscoveryItem;
  rank: number;
  type: "mainstream" | "surprising";
}

function TrendBadge({ trend }: { trend: "growing" | "stable" | "declining" }) {
  if (trend === "growing") {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
        <TrendingUp className="h-3 w-3" />
        成長中
      </span>
    );
  }
  if (trend === "declining") {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs">
        <TrendingDown className="h-3 w-3" />
        衰退
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
      <Minus className="h-3 w-3" />
      安定
    </span>
  );
}

function CepCard({ item, rank, type }: CepCardProps) {
  const bgColor = type === "mainstream" ? "bg-blue-50" : "bg-amber-50";
  const rankBg = type === "mainstream" ? "bg-blue-500" : "bg-amber-500";
  const highlightColor = type === "mainstream" ? "text-blue-600" : "text-amber-600";

  return (
    <div className={`p-3 rounded-lg ${bgColor} hover:opacity-90 transition-opacity`}>
      {/* ヘッダー */}
      <div className="flex items-start gap-3">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm ${rankBg} flex-shrink-0`}
        >
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm leading-tight">{item.cepName}</p>
            <TrendBadge trend={item.trend} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.cepCategory}
          </p>
        </div>
      </div>

      {/* ハイライト理由 */}
      <div className={`mt-2 flex items-center gap-1 text-xs ${highlightColor}`}>
        <Zap className="h-3 w-3" />
        <span className="font-medium">{item.highlightReason}</span>
      </div>

      {/* 指標 */}
      <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
        <div className="text-center">
          <p className="font-mono font-bold">{item.mentionCount}</p>
          <p className="text-muted-foreground">言及数</p>
        </div>
        <div className="text-center">
          <p className="font-mono font-bold">{item.avgEngagement}</p>
          <p className="text-muted-foreground">平均ENG</p>
        </div>
        <div className="text-center">
          <p className={`font-mono font-bold ${item.vsAvgEngagement >= 1.5 ? "text-green-600" : ""}`}>
            {item.vsAvgEngagement >= 0.1 ? `${item.vsAvgEngagement.toFixed(1)}x` : "-"}
          </p>
          <p className="text-muted-foreground">vs平均</p>
        </div>
        <div className="text-center">
          <p className={`font-mono font-bold ${item.viralIndex >= 3 ? "text-orange-600" : ""}`}>
            {item.viralIndex >= 0.1 ? item.viralIndex.toFixed(1) : "-"}
          </p>
          <p className="text-muted-foreground">バイラル</p>
        </div>
      </div>

      {/* 投稿例 */}
      {item.samplePosts.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-200 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">投稿例</p>
          {item.samplePosts.map((post, idx) => (
            <div key={idx} className="bg-white rounded p-2 text-xs">
              <p className="line-clamp-2 text-gray-700">
                {post.content || "(内容なし)"}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {post.likesCount}
                </span>
                <span className="flex items-center gap-1">
                  <Repeat2 className="h-3 w-3" />
                  {post.retweetsCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {post.commentsCount}
                </span>
                <span className="ml-auto flex items-center gap-2">
                  {new Date(post.published).toLocaleDateString("ja-JP")}
                  {post.url && (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
