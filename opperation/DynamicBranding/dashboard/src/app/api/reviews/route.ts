import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { SNSPost, BrandImpact } from "@/types/data.types";

export interface ReviewsResponse {
  data: SNSPost[];
  total: number;
  page: number;
  limit: number;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const brand = searchParams.get("brand") || "";
    const sentiment = searchParams.get("sentiment") || "all";
    const isUnexpected = searchParams.get("is_unexpected") || "all";
    const minEngagement = parseInt(searchParams.get("min_engagement") || "0", 10);

    // 1. impact_level = 'high' の投稿IDを取得
    let impactQuery = supabase
      .from("post_brand_impacts")
      .select("post_id, brand_id, brands(name, color)")
      .eq("impact_level", "high");

    // ブランド指定がある場合
    if (brand) {
      const { data: brandData } = await supabase
        .from("brands")
        .select("id")
        .eq("name", brand)
        .single();

      if (brandData) {
        impactQuery = impactQuery.eq("brand_id", brandData.id);
      }
    }

    const { data: impactData, error: impactError } = await impactQuery;

    if (impactError) {
      console.error("Impact query error:", impactError.message);
      return NextResponse.json(
        { error: "Failed to fetch impact data" },
        { status: 500 }
      );
    }

    // 対象の投稿IDを抽出
    const postIds = [...new Set((impactData || []).map((d) => d.post_id))];

    if (postIds.length === 0) {
      return NextResponse.json({
        data: [],
        total: 0,
        page,
        limit,
      });
    }

    // 2. sns_postsからフィルタリングして取得
    let query = supabase
      .from("sns_posts")
      .select("*, ceps(id, cep_name, description)", { count: "exact" })
      .in("id", postIds)
      .order("engagement_total", { ascending: false });

    // センチメントフィルター
    if (sentiment && sentiment !== "all") {
      query = query.eq("sentiment", sentiment);
    }

    // 王道/意外フィルター
    if (isUnexpected === "true") {
      query = query.eq("is_unexpected", true);
    } else if (isUnexpected === "false") {
      query = query.eq("is_unexpected", false);
    }

    // バズ投稿フィルター（最小エンゲージメント）
    if (minEngagement > 0) {
      query = query.gte("engagement_total", minEngagement);
    }

    // ページネーション
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error("SNS query error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    // 3. ブランド影響度データをマップ
    const impactMap = new Map<number, BrandImpact[]>();
    for (const impact of impactData || []) {
      const postId = impact.post_id;
      if (!impactMap.has(postId)) {
        impactMap.set(postId, []);
      }
      const brandInfo = impact.brands as unknown as { name: string; color: string } | null;
      impactMap.get(postId)!.push({
        brand_id: impact.brand_id,
        brand_name: brandInfo?.name || "",
        brand_color: brandInfo?.color || "",
        impact_level: "high",
        confidence_score: 1,
      });
    }

    // 4. レスポンス形式に変換
    const posts: SNSPost[] = (data || []).map((row) => ({
      url: row.url,
      published: row.published,
      title: row.title || "",
      content: row.content || "",
      lang: row.lang || "ja",
      source_type: row.source_type || "",
      extra_author_attributes_name: row.author_name,
      brand_mentions: row.brand_mentions || "",
      brand_count: row.brand_count || 0,
      is_multi_brand: row.is_multi_brand || false,
      content_length: row.content_length || 0,
      has_negative_kw: row.has_negative_kw || false,
      source_category: row.source_category || "other",
      sentiment: row.sentiment || null,
      cep_id: row.cep_id || null,
      cep: row.ceps || null,
      // UGCラベリング用カラム
      time_slot: row.time_slot || null,
      day_type: row.day_type || null,
      intent: row.intent || null,
      life_stage: row.life_stage || null,
      cooking_skill: row.cooking_skill || null,
      emotion: row.emotion || null,
      with_whom: row.with_whom || null,
      when_detail: row.when_detail || null,
      why_motivation: row.why_motivation || null,
      paired_keywords: row.paired_keywords || null,
      cep_category: row.cep_category || null,
      // W's詳細カラム
      dish_category: row.dish_category || null,
      dish_name: row.dish_name || null,
      meal_occasion: row.meal_occasion || null,
      cooking_for: row.cooking_for || null,
      motivation_category: row.motivation_category || null,
      // 投稿者情報
      author_name: row.author_name || null,
      // エンゲージメント
      likes_count: row.likes_count || 0,
      retweets_count: row.retweets_count || 0,
      comments_count: row.comments_count || 0,
      engagement_total: row.engagement_total || 0,
      impressions: row.impressions || 0,
      followers: row.followers || 0,
      // ブランド影響度
      brand_impacts: impactMap.get(row.id) || undefined,
      // 口コミ分類
      is_unexpected: row.is_unexpected ?? null,
    }));

    const response: ReviewsResponse = {
      data: posts,
      total: count || 0,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
