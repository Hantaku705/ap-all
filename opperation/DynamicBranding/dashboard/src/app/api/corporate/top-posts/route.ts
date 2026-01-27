import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const topic = searchParams.get("topic");

    const supabase = await createClient();

    // クエリ構築
    let query = supabase
      .from("sns_posts")
      .select("id, content, title, source_category, published, sentiment, corporate_topic, engagement_total, likes_count, retweets_count, impressions")
      .eq("is_corporate", true)
      .order("engagement_total", { ascending: false, nullsFirst: false })
      .limit(limit);

    // トピックフィルター
    if (topic && topic !== "all") {
      query = query.eq("corporate_topic", topic);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // トピック名のラベル
    const topicLabels: Record<string, string> = {
      stock_ir: "株価・IR",
      csr_sustainability: "CSR・サステナ",
      employment: "採用・働き方",
      company_news: "企業ニュース",
      rnd: "研究開発",
      management: "経営・理念",
      other: "その他",
    };

    // センチメントのラベル
    const sentimentLabels: Record<string, string> = {
      positive: "ポジティブ",
      neutral: "ニュートラル",
      negative: "ネガティブ",
    };

    // レスポンス整形
    const topPosts = (posts || []).map((post, index) => ({
      rank: index + 1,
      id: post.id,
      content: post.content?.slice(0, 200) || post.title?.slice(0, 200) || "",
      source: post.source_category,
      published: post.published,
      sentiment: post.sentiment,
      sentimentLabel: sentimentLabels[post.sentiment || "neutral"] || post.sentiment,
      topic: post.corporate_topic,
      topicLabel: topicLabels[post.corporate_topic || "other"] || post.corporate_topic,
      engagement: post.engagement_total || 0,
      likes: post.likes_count || 0,
      retweets: post.retweets_count || 0,
      impressions: post.impressions || 0,
    }));

    return NextResponse.json({
      posts: topPosts,
      total: topPosts.length,
    });
  } catch (error) {
    console.error("Failed to fetch top posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
