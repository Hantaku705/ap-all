import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const PAGE_SIZE = 1000;

export async function GET() {
  try {
    const supabase = await createClient();

    // ページネーションで全件取得
    const allPosts: { corporate_topic: string }[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("sns_posts")
        .select("corporate_topic")
        .eq("is_corporate", true)
        .not("corporate_topic", "is", null)
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

    // トピック別に集計
    const topicCounts: Record<string, number> = {};
    for (const post of posts || []) {
      const topic = post.corporate_topic || "other";
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }

    // トピック名のラベル
    const topicLabels: Record<string, string> = {
      stock_ir: "株価・IR",
      csr_sustainability: "CSR・サステナビリティ",
      employment: "採用・働き方",
      company_news: "企業ニュース",
      rnd: "研究開発",
      management: "経営・理念",
      other: "その他",
    };

    // 配列形式で返す（チャート用）
    const topics = Object.entries(topicCounts)
      .map(([topic, count]) => ({
        topic,
        label: topicLabels[topic] || topic,
        count,
        percentage: posts?.length ? (count / posts.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      topics,
      total: posts?.length || 0,
    });
  } catch (error) {
    console.error("Failed to fetch corporate topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
