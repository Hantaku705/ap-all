import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface GapData {
  cep_id: number;
  cep_name: string;
  description: string;
  total_mentions: number;
  brand_count: number;
  gap_score: number; // 0-100 (高いほど空白度が高い)
  gap_type: "white_space" | "underserved" | "competitive";
  opportunity_brands: string[];
  reason: string;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // ブランドマスタを取得
    const { data: brands, error: brandError } = await supabase
      .from("brands")
      .select("id, name")
      .order("id");

    if (brandError) {
      throw brandError;
    }

    const allBrandNames = (brands || []).map((b) => b.name);

    // CEPマスタを取得
    const { data: ceps, error: cepError } = await supabase
      .from("ceps")
      .select("id, cep_name, description")
      .order("id");

    if (cepError) {
      throw cepError;
    }

    // 直近12週間のSNS投稿を取得
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const { data: posts, error: postsError } = await supabase
      .from("sns_posts")
      .select("cep_id, brand_mentions")
      .not("cep_id", "is", null)
      .gte("published", twelveWeeksAgo.toISOString());

    if (postsError) {
      throw postsError;
    }

    // CEP別・ブランド別に集計
    const cepBrandCounts = new Map<number, Map<string, number>>();
    const cepTotalCounts = new Map<number, number>();

    for (const post of posts || []) {
      if (!post.cep_id) continue;

      cepTotalCounts.set(post.cep_id, (cepTotalCounts.get(post.cep_id) || 0) + 1);

      if (!post.brand_mentions) continue;

      if (!cepBrandCounts.has(post.cep_id)) {
        cepBrandCounts.set(post.cep_id, new Map());
      }

      const brandMap = cepBrandCounts.get(post.cep_id)!;
      const mentionedBrands = post.brand_mentions.split(",").map((b: string) => b.trim());

      for (const brand of mentionedBrands) {
        if (brand) {
          brandMap.set(brand, (brandMap.get(brand) || 0) + 1);
        }
      }
    }

    // 全CEPの平均言及数を計算
    const totalPosts = Array.from(cepTotalCounts.values()).reduce((a, b) => a + b, 0);
    const avgMentions = totalPosts / (ceps?.length || 1);

    // レスポンス構築
    const result: GapData[] = (ceps || []).map((cep) => {
      const brandMap = cepBrandCounts.get(cep.id) || new Map();
      const totalMentions = cepTotalCounts.get(cep.id) || 0;
      const activeBrands = Array.from(brandMap.keys());
      const brandCount = activeBrands.length;

      // 参入していないブランドを特定
      const missingBrands = allBrandNames.filter((name) => !activeBrands.includes(name));

      // 空白度スコア計算
      // - ブランド参入率が低いほど高い
      // - 言及数が少ないほど高い（ただし0は除外）
      const brandCoverage = brandCount / allBrandNames.length;
      const mentionRatio = avgMentions > 0 ? totalMentions / avgMentions : 0;

      let gapScore = 0;
      let gapType: "white_space" | "underserved" | "competitive" = "competitive";
      let reason = "";

      if (brandCount === 0 || totalMentions < 10) {
        gapScore = 90;
        gapType = "white_space";
        reason = "ほぼ未開拓の領域";
      } else if (brandCoverage < 0.3) {
        gapScore = 70 + (1 - brandCoverage) * 20;
        gapType = "white_space";
        reason = `${brandCount}ブランドのみ参入`;
      } else if (brandCoverage < 0.6 || mentionRatio < 0.5) {
        gapScore = 40 + (1 - brandCoverage) * 30;
        gapType = "underserved";
        reason = "参入余地あり";
      } else {
        gapScore = Math.max(0, 40 - brandCoverage * 40);
        gapType = "competitive";
        reason = "競争が激しい";
      }

      return {
        cep_id: cep.id,
        cep_name: cep.cep_name,
        description: cep.description || "",
        total_mentions: totalMentions,
        brand_count: brandCount,
        gap_score: Math.round(gapScore),
        gap_type: gapType,
        opportunity_brands: missingBrands.slice(0, 5),
        reason,
      };
    });

    // 空白度スコア降順でソート
    result.sort((a, b) => b.gap_score - a.gap_score);

    return NextResponse.json({
      data: result,
      summary: {
        white_space_count: result.filter((r) => r.gap_type === "white_space").length,
        underserved_count: result.filter((r) => r.gap_type === "underserved").length,
        competitive_count: result.filter((r) => r.gap_type === "competitive").length,
      },
    });
  } catch (error) {
    console.error("Error fetching CEP gaps:", error);
    return NextResponse.json(
      { error: "Failed to fetch CEP gaps data" },
      { status: 500 }
    );
  }
}
