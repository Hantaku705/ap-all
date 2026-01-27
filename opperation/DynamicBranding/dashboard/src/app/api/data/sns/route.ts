import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { SNSDataResponse, SNSPost, BrandImpact } from "@/types/data.types";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const sources = searchParams.get("sources")?.split(",").filter(Boolean) || [];
    const brands = searchParams.get("brands")?.split(",").filter(Boolean) || [];
    const search = searchParams.get("search") || "";
    const sentiment = searchParams.get("sentiment") || "";
    const cepId = searchParams.get("cep_id") || "";
    // 追加フィルター
    const intent = searchParams.get("intent") || "";
    const emotion = searchParams.get("emotion") || "";
    const dishCategory = searchParams.get("dish_category") || "";
    const mealOccasion = searchParams.get("meal_occasion") || "";
    const cookingFor = searchParams.get("cooking_for") || "";
    const motivationCategory = searchParams.get("motivation_category") || "";
    const timeSlot = searchParams.get("time_slot") || "";
    const dayType = searchParams.get("day_type") || "";
    const lifeStage = searchParams.get("life_stage") || "";
    const cookingSkill = searchParams.get("cooking_skill") || "";
    const withWhom = searchParams.get("with_whom") || "";
    // キャンペーン投稿除外フラグ
    const excludeCampaign = searchParams.get("excludeCampaign") === "true";
    // ブランド影響度フィルター
    const impactLevel = searchParams.get("impact_level") || "";
    const impactBrand = searchParams.get("impact_brand") || ""; // 影響度フィルターと組み合わせるブランド
    // コーポレートタグフィルター
    const isCorporate = searchParams.get("is_corporate") || "";

    // クエリ構築（CEPテーブルをJOIN）
    let query = supabase
      .from("sns_posts")
      .select("*, ceps(id, cep_name, description)", { count: "exact" })
      .order("published", { ascending: false });

    // ソースフィルター
    if (sources.length > 0) {
      query = query.in("source_category", sources);
    }

    // ブランドフィルター（ILIKE で部分一致）
    if (brands.length > 0) {
      const brandConditions = brands
        .map((b) => `brand_mentions.ilike.%${b}%`)
        .join(",");
      query = query.or(brandConditions);
    }

    // キーワード検索
    if (search) {
      query = query.or(`content.ilike.%${search}%,title.ilike.%${search}%`);
    }

    // センチメントフィルター
    if (sentiment && sentiment !== "all") {
      query = query.eq("sentiment", sentiment);
    }

    // CEPフィルター
    if (cepId && cepId !== "all") {
      const cepIdNum = parseInt(cepId, 10);
      if (!isNaN(cepIdNum)) {
        query = query.eq("cep_id", cepIdNum);
      }
    }

    // 追加フィルター条件
    if (intent && intent !== "all") {
      query = query.eq("intent", intent);
    }
    if (emotion && emotion !== "all") {
      query = query.eq("emotion", emotion);
    }
    if (dishCategory && dishCategory !== "all") {
      query = query.eq("dish_category", dishCategory);
    }
    if (mealOccasion && mealOccasion !== "all") {
      query = query.eq("meal_occasion", mealOccasion);
    }
    if (cookingFor && cookingFor !== "all") {
      query = query.eq("cooking_for", cookingFor);
    }
    if (motivationCategory && motivationCategory !== "all") {
      query = query.eq("motivation_category", motivationCategory);
    }
    if (timeSlot && timeSlot !== "all") {
      query = query.eq("time_slot", timeSlot);
    }
    if (dayType && dayType !== "all") {
      query = query.eq("day_type", dayType);
    }
    if (lifeStage && lifeStage !== "all") {
      query = query.eq("life_stage", lifeStage);
    }
    if (cookingSkill && cookingSkill !== "all") {
      query = query.eq("cooking_skill", cookingSkill);
    }
    if (withWhom && withWhom !== "all") {
      query = query.eq("with_whom", withWhom);
    }

    // キャンペーン投稿除外（「私が作りたい料理は」パターン）
    if (excludeCampaign) {
      query = query.not("content", "ilike", "%私が作りたい料理は%");
    }

    // コーポレートタグフィルター
    if (isCorporate === "true") {
      query = query.eq("is_corporate", true);
    } else if (isCorporate === "false") {
      query = query.eq("is_corporate", false);
    }

    // ページネーション
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // 影響度フィルターがある場合、対象投稿IDを先に取得
    let filteredPostIds: number[] | null = null;
    if (impactLevel && impactLevel !== "all") {
      let impactQuery = supabase
        .from("post_brand_impacts")
        .select("post_id")
        .eq("impact_level", impactLevel);

      // ブランド指定がある場合、そのブランドの影響度でフィルター
      if (impactBrand || (brands.length === 1)) {
        const targetBrand = impactBrand || brands[0];
        const { data: brandData } = await supabase
          .from("brands")
          .select("id")
          .eq("name", targetBrand)
          .single();

        if (brandData) {
          impactQuery = impactQuery.eq("brand_id", brandData.id);
        }
      }

      const { data: impactData } = await impactQuery;
      if (impactData) {
        filteredPostIds = impactData.map((d) => d.post_id);
        if (filteredPostIds.length > 0) {
          query = query.in("id", filteredPostIds);
        } else {
          // マッチする投稿がない場合は空を返す
          return NextResponse.json({
            data: [],
            total: 0,
            page,
            limit,
          });
        }
      }
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }

    // 取得した投稿のIDリスト
    const postIds = (data || []).map((row) => row.id).filter(Boolean);

    // 影響度データを取得（投稿がある場合のみ）
    let impactMap: Map<number, BrandImpact[]> = new Map();
    if (postIds.length > 0) {
      const { data: impacts } = await supabase
        .from("post_brand_impacts")
        .select("post_id, brand_id, impact_level, confidence_score, analysis_reason, brands(name, color)")
        .in("post_id", postIds);

      if (impacts) {
        for (const impact of impacts) {
          const postId = impact.post_id;
          if (!impactMap.has(postId)) {
            impactMap.set(postId, []);
          }
          // Supabase joins return single object, not array
          const brand = impact.brands as unknown as { name: string; color: string } | null;
          impactMap.get(postId)!.push({
            brand_id: impact.brand_id,
            brand_name: brand?.name || "",
            brand_color: brand?.color || "",
            impact_level: impact.impact_level,
            confidence_score: impact.confidence_score || 0,
            analysis_reason: impact.analysis_reason || undefined,
          });
        }
      }
    }

    // レスポンス用にデータを変換
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
      // コーポレートタグ
      is_corporate: row.is_corporate ?? null,
      corporate_reason: row.corporate_reason || null,
      // エンゲージメント
      likes_count: row.likes_count || 0,
      retweets_count: row.retweets_count || 0,
      comments_count: row.comments_count || 0,
      engagement_total: row.engagement_total || 0,
      impressions: row.impressions || 0,
      followers: row.followers || 0,
      // ブランド影響度
      brand_impacts: impactMap.get(row.id) || undefined,
    }));

    const response: SNSDataResponse = {
      data: posts,
      total: count || 0,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch SNS data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
