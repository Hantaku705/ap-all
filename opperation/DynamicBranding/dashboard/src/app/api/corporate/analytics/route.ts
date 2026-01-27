import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const PAGE_SIZE = 1000;

export async function GET() {
  try {
    const supabase = await createClient();

    // ページネーションで全件取得
    const allPosts: { id: number; sentiment: string | null; published: string | null; engagement_total: number | null }[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("sns_posts")
        .select("id, sentiment, published, engagement_total")
        .eq("is_corporate", true)
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        console.error("Supabase error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (data && data.length > 0) {
        allPosts.push(...data);
        offset += PAGE_SIZE;
      }
      hasMore = data && data.length === PAGE_SIZE;
    }

    const posts = allPosts;

    const total = posts?.length || 0;

    // センチメント集計
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    let totalEngagement = 0;

    for (const post of posts || []) {
      if (post.sentiment && sentimentCounts[post.sentiment as keyof typeof sentimentCounts] !== undefined) {
        sentimentCounts[post.sentiment as keyof typeof sentimentCounts]++;
      }
      totalEngagement += post.engagement_total || 0;
    }

    // 週次変化を計算（直近1週間 vs その前の週）
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    let thisWeekCount = 0;
    let lastWeekCount = 0;

    for (const post of posts || []) {
      if (!post.published) continue;
      const publishedDate = new Date(post.published);
      if (publishedDate >= oneWeekAgo) {
        thisWeekCount++;
      } else if (publishedDate >= twoWeeksAgo && publishedDate < oneWeekAgo) {
        lastWeekCount++;
      }
    }

    const weeklyChange = lastWeekCount > 0
      ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100
      : 0;

    return NextResponse.json({
      total,
      sentimentCounts,
      positiveRate: total > 0 ? (sentimentCounts.positive / total) * 100 : 0,
      negativeRate: total > 0 ? (sentimentCounts.negative / total) * 100 : 0,
      neutralRate: total > 0 ? (sentimentCounts.neutral / total) * 100 : 0,
      weeklyChange,
      thisWeekCount,
      lastWeekCount,
      totalEngagement,
      avgEngagement: total > 0 ? totalEngagement / total : 0,
    });
  } catch (error) {
    console.error("Failed to fetch corporate analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
