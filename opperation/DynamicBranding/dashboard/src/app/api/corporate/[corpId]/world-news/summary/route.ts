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

    const supabase = await createClient();

    // 全ニュース数
    const { count: totalNews } = await supabase
      .from("corporate_world_news")
      .select("*", { count: "exact", head: true })
      .eq("corp_id", corporateId);

    // 重要ニュース数
    const { count: importantCount } = await supabase
      .from("corporate_world_news")
      .select("*", { count: "exact", head: true })
      .eq("corp_id", corporateId)
      .eq("is_important", true);

    // カテゴリ別集計（company_relevance_typeも取得）
    const { data: categoryData } = await supabase
      .from("corporate_world_news")
      .select("category, sentiment, company_relevance_type")
      .eq("corp_id", corporateId);

    // カテゴリマスタ取得
    const { data: categories } = await supabase
      .from("corporate_news_categories")
      .select("*")
      .order("priority");

    // カテゴリ別集計を計算
    const categoryMap = new Map<string, { count: number; positive: number; neutral: number; negative: number }>();
    (categoryData || []).forEach((item) => {
      const cat = item.category || "other";
      const current = categoryMap.get(cat) || { count: 0, positive: 0, neutral: 0, negative: 0 };
      current.count++;
      if (item.sentiment === "positive") current.positive++;
      else if (item.sentiment === "neutral") current.neutral++;
      else if (item.sentiment === "negative") current.negative++;
      categoryMap.set(cat, current);
    });

    const byCategory = (categories || []).map((cat) => {
      const stats = categoryMap.get(cat.name) || { count: 0, positive: 0, neutral: 0, negative: 0 };
      return {
        category: cat.name,
        label: cat.label,
        color: cat.color,
        count: stats.count,
        percentage: totalNews ? Math.round((stats.count / (totalNews || 1)) * 1000) / 10 : 0,
        sentiment_breakdown: {
          positive: stats.positive,
          neutral: stats.neutral,
          negative: stats.negative,
        },
      };
    }).filter((c) => c.count > 0);

    // センチメント別集計
    const sentimentMap = new Map<string, number>();
    (categoryData || []).forEach((item) => {
      const sent = item.sentiment || "neutral";
      sentimentMap.set(sent, (sentimentMap.get(sent) || 0) + 1);
    });

    const bySentiment = ["positive", "neutral", "negative"].map((sentiment) => ({
      sentiment,
      count: sentimentMap.get(sentiment) || 0,
      percentage: totalNews ? Math.round(((sentimentMap.get(sentiment) || 0) / (totalNews || 1)) * 1000) / 10 : 0,
      avg_score: 0, // TODO: 平均スコア計算
    }));

    // ソースタイプ別集計
    const { data: sourceTypeData } = await supabase
      .from("corporate_world_news")
      .select("source_type")
      .eq("corp_id", corporateId);

    const sourceTypeMap = new Map<string, number>();
    (sourceTypeData || []).forEach((item) => {
      const st = item.source_type || "other";
      sourceTypeMap.set(st, (sourceTypeMap.get(st) || 0) + 1);
    });

    const bySourceType = Array.from(sourceTypeMap.entries()).map(([source_type, count]) => ({
      source_type,
      count,
    }));

    // 自社/競合/業界別集計
    const companyRelevanceMap = new Map<string, number>();
    (categoryData || []).forEach((item) => {
      const relevance = item.company_relevance_type || "unknown";
      companyRelevanceMap.set(relevance, (companyRelevanceMap.get(relevance) || 0) + 1);
    });

    const companyRelevanceLabels: Record<string, string> = {
      self: "自社",
      competitor: "競合",
      industry: "業界",
      unknown: "未分類",
    };

    const companyRelevanceColors: Record<string, string> = {
      self: "#3B82F6",
      competitor: "#EF4444",
      industry: "#F59E0B",
      unknown: "#9CA3AF",
    };

    const byCompanyRelevance = ["self", "competitor", "industry", "unknown"]
      .map((relevance) => {
        const count = companyRelevanceMap.get(relevance) || 0;
        return {
          relevance,
          label: companyRelevanceLabels[relevance],
          color: companyRelevanceColors[relevance],
          count,
          percentage: totalNews ? Math.round((count / (totalNews || 1)) * 1000) / 10 : 0,
        };
      })
      .filter((r) => r.count > 0);

    // 最終フェッチ日時
    const { data: lastFetch } = await supabase
      .from("corporate_news_fetch_log")
      .select("fetched_at")
      .eq("corp_id", corporateId)
      .eq("status", "success")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    // 日付範囲
    const { data: dateRange } = await supabase
      .from("corporate_world_news")
      .select("published_at")
      .eq("corp_id", corporateId)
      .order("published_at", { ascending: true })
      .limit(1);

    const { data: latestDate } = await supabase
      .from("corporate_world_news")
      .select("published_at")
      .eq("corp_id", corporateId)
      .order("published_at", { ascending: false })
      .limit(1);

    return NextResponse.json({
      total_news: totalNews || 0,
      by_category: byCategory,
      by_sentiment: bySentiment,
      by_source_type: bySourceType,
      by_company_relevance: byCompanyRelevance,
      important_count: importantCount || 0,
      last_fetched_at: lastFetch?.fetched_at || null,
      date_range: {
        earliest: dateRange?.[0]?.published_at || null,
        latest: latestDate?.[0]?.published_at || null,
      },
    });
  } catch (error) {
    console.error("Failed to fetch world news summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
