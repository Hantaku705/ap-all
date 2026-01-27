import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // corporate_topicとsentimentの組み合わせを取得
    const { data: posts, error } = await supabase
      .from("sns_posts")
      .select("corporate_topic, sentiment")
      .eq("is_corporate", true)
      .not("corporate_topic", "is", null);

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // トピック×センチメントで集計
    const matrix: Record<string, Record<string, number>> = {};

    for (const post of posts || []) {
      const topic = post.corporate_topic || "other";
      const sentiment = post.sentiment || "neutral";

      if (!matrix[topic]) {
        matrix[topic] = { positive: 0, neutral: 0, negative: 0 };
      }
      matrix[topic][sentiment] = (matrix[topic][sentiment] || 0) + 1;
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

    // 積み上げ棒グラフ用の配列形式
    const data = Object.entries(matrix)
      .map(([topic, sentiments]) => {
        const total = sentiments.positive + sentiments.neutral + sentiments.negative;
        return {
          topic,
          label: topicLabels[topic] || topic,
          positive: sentiments.positive,
          neutral: sentiments.neutral,
          negative: sentiments.negative,
          total,
          positiveRate: total > 0 ? (sentiments.positive / total) * 100 : 0,
          negativeRate: total > 0 ? (sentiments.negative / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      data,
      total: posts?.length || 0,
    });
  } catch (error) {
    console.error("Failed to fetch sentiment by topic:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
