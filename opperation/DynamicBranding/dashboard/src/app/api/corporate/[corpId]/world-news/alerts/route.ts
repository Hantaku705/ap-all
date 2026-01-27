import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ corpId: string }> }
) {
  try {
    const { corpId } = await params;
    const corporateId = parseInt(corpId);

    if (isNaN(corporateId)) {
      return NextResponse.json(
        { error: "Invalid corporate ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const supabase = await createClient();

    // 重要ニュースを取得（is_important=true または relevance_score >= 0.8）
    const { data: alerts, error, count } = await supabase
      .from("corporate_world_news")
      .select("id, title, summary, url, source_name, category, sentiment, relevance_score, published_at", { count: "exact" })
      .eq("corp_id", corporateId)
      .or("is_important.eq.true,relevance_score.gte.0.8")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      alerts: alerts || [],
      total: count || 0,
    });
  } catch (error) {
    console.error("Failed to fetch world news alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

// アラートの重要度を更新（PATCH）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ corpId: string }> }
) {
  try {
    const { corpId } = await params;
    const corporateId = parseInt(corpId);

    if (isNaN(corporateId)) {
      return NextResponse.json(
        { error: "Invalid corporate ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { news_id, is_important } = body;

    if (!news_id) {
      return NextResponse.json(
        { error: "news_id is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from("corporate_world_news")
      .update({ is_important, updated_at: new Date().toISOString() } as never)
      .eq("id", news_id)
      .eq("corp_id", corporateId)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      news: updated,
    });
  } catch (error) {
    console.error("Failed to update alert:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}
