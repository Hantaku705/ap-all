import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // コーポレート投稿の日付とセンチメントを取得（ページネーションで全件取得）
    const PAGE_SIZE = 1000;
    let offset = 0;
    let allPosts: Array<{
      published: string;
      sentiment: string | null;
      corporate_topic: string | null;
      engagement_total: number | null;
    }> = [];

    while (true) {
      const { data: posts, error } = await supabase
        .from("sns_posts")
        .select("published, sentiment, corporate_topic, engagement_total")
        .eq("is_corporate", true)
        .order("published", { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        console.error("Supabase error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!posts || posts.length === 0) break;
      allPosts.push(...posts);
      offset += PAGE_SIZE;
      if (posts.length < PAGE_SIZE) break;
    }

    const posts = allPosts;

    // 週次で集計
    const weeklyData: Record<string, {
      count: number;
      positive: number;
      neutral: number;
      negative: number;
      engagement: number;
      topics: Record<string, number>;
    }> = {};

    for (const post of posts || []) {
      if (!post.published) continue;

      // 週の開始日を計算（月曜始まり）
      const date = new Date(post.published);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(date.setDate(diff));
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          count: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          engagement: 0,
          topics: {},
        };
      }

      weeklyData[weekKey].count++;
      weeklyData[weekKey].engagement += post.engagement_total || 0;

      const sentiment = post.sentiment || "neutral";
      weeklyData[weekKey][sentiment as "positive" | "neutral" | "negative"]++;

      if (post.corporate_topic) {
        weeklyData[weekKey].topics[post.corporate_topic] =
          (weeklyData[weekKey].topics[post.corporate_topic] || 0) + 1;
      }
    }

    // 配列形式に変換
    const trends = Object.entries(weeklyData)
      .map(([week, data]) => ({
        week,
        count: data.count,
        positive: data.positive,
        neutral: data.neutral,
        negative: data.negative,
        engagement: data.engagement,
        avgEngagement: data.count > 0 ? data.engagement / data.count : 0,
        positiveRate: data.count > 0 ? (data.positive / data.count) * 100 : 0,
        negativeRate: data.count > 0 ? (data.negative / data.count) * 100 : 0,
        topics: data.topics,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // 全期間を返す（株価と同期間表示のため）
    return NextResponse.json({
      trends,
      total: posts?.length || 0,
    });
  } catch (error) {
    console.error("Failed to fetch corporate trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
