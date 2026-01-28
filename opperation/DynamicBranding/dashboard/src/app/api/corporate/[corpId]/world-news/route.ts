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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const category = searchParams.get("category");
    const sentiment = searchParams.get("sentiment");
    const sourceType = searchParams.get("source_type");
    const companyRelevance = searchParams.get("company_relevance");
    const isImportant = searchParams.get("is_important");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const search = searchParams.get("search");

    const supabase = await createClient();

    // クエリ構築
    let query = supabase
      .from("corporate_world_news")
      .select("*", { count: "exact" })
      .eq("corp_id", corporateId)
      .order("published_at", { ascending: false });

    // フィルター適用
    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    if (sentiment && sentiment !== "all") {
      query = query.eq("sentiment", sentiment);
    }
    if (sourceType && sourceType !== "all") {
      query = query.eq("source_type", sourceType);
    }
    if (companyRelevance && companyRelevance !== "all") {
      query = query.eq("company_relevance_type", companyRelevance);
    }
    if (isImportant === "true") {
      query = query.eq("is_important", true);
    }
    if (startDate) {
      query = query.gte("published_at", startDate);
    }
    if (endDate) {
      query = query.lte("published_at", endDate);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // ページネーション
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: news, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        news: news || [],
        total: count || 0,
        page,
        limit,
        filters: {
          category: category || undefined,
          sentiment: sentiment || undefined,
          source_type: sourceType || undefined,
          company_relevance: companyRelevance || undefined,
          is_important: isImportant === "true" ? true : undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch world news:", error);
    return NextResponse.json(
      { error: "Failed to fetch world news" },
      { status: 500 }
    );
  }
}

// 手動インポート（POST）
export async function POST(
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
    const {
      url,
      title,
      content,
      source_name,
      source_type = "manual",
      published_at,
    } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 重複チェック
    const { data: existing } = await supabase
      .from("corporate_world_news")
      .select("id")
      .eq("corp_id", corporateId)
      .eq("url", url)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "URL already exists", existing_id: existing.id },
        { status: 409 }
      );
    }

    // 新規登録
    const { data: inserted, error } = await supabase
      .from("corporate_world_news")
      .insert({
        corp_id: corporateId,
        url,
        title: title || url,
        content: content || null,
        source_name: source_name || new URL(url).hostname,
        source_type,
        published_at: published_at || new Date().toISOString(),
        is_important: false,
      } as never)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      news: inserted,
    });
  } catch (error) {
    console.error("Failed to import news:", error);
    return NextResponse.json(
      { error: "Failed to import news" },
      { status: 500 }
    );
  }
}
