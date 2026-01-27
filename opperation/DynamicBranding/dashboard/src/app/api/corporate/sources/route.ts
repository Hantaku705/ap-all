import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // コーポレート投稿のソース情報を取得
    const { data: posts, error } = await supabase
      .from("sns_posts")
      .select("source_category, sentiment, engagement_total")
      .eq("is_corporate", true);

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ソース別に集計
    const sourceData: Record<string, {
      count: number;
      positive: number;
      neutral: number;
      negative: number;
      engagement: number;
    }> = {};

    for (const post of posts || []) {
      const source = post.source_category || "unknown";

      if (!sourceData[source]) {
        sourceData[source] = {
          count: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          engagement: 0,
        };
      }

      sourceData[source].count++;
      sourceData[source].engagement += post.engagement_total || 0;

      const sentiment = post.sentiment || "neutral";
      sourceData[source][sentiment as "positive" | "neutral" | "negative"]++;
    }

    // ソース名のラベル
    const sourceLabels: Record<string, string> = {
      twitter: "Twitter/X",
      instagram: "Instagram",
      news: "ニュース",
      blog: "ブログ",
      unknown: "その他",
    };

    // 配列形式に変換
    const sources = Object.entries(sourceData)
      .map(([source, data]) => ({
        source,
        label: sourceLabels[source] || source,
        count: data.count,
        positive: data.positive,
        neutral: data.neutral,
        negative: data.negative,
        engagement: data.engagement,
        avgEngagement: data.count > 0 ? data.engagement / data.count : 0,
        positiveRate: data.count > 0 ? (data.positive / data.count) * 100 : 0,
        percentage: posts?.length ? (data.count / posts.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      sources,
      total: posts?.length || 0,
    });
  } catch (error) {
    console.error("Failed to fetch corporate sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
