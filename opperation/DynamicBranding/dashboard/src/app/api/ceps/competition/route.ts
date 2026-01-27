import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface CompetitionData {
  cep_id: number;
  cep_name: string;
  description: string;
  total_mentions: number;
  brand_count: number;
  hhi: number; // Herfindahl-Hirschman Index (0-10000)
  concentration: "low" | "medium" | "high";
  dominant_brand: string | null;
  dominant_share: number;
  brand_shares: { brand: string; mentions: number; share: number }[];
}

export async function GET() {
  try {
    const supabase = await createClient();

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

    for (const post of posts || []) {
      if (!post.cep_id || !post.brand_mentions) continue;

      if (!cepBrandCounts.has(post.cep_id)) {
        cepBrandCounts.set(post.cep_id, new Map());
      }

      const brandMap = cepBrandCounts.get(post.cep_id)!;
      const brands = post.brand_mentions.split(",").map((b: string) => b.trim());

      for (const brand of brands) {
        if (brand) {
          brandMap.set(brand, (brandMap.get(brand) || 0) + 1);
        }
      }
    }

    // レスポンス構築
    const result: CompetitionData[] = (ceps || []).map((cep) => {
      const brandMap = cepBrandCounts.get(cep.id) || new Map();
      const totalMentions = Array.from(brandMap.values()).reduce((a, b) => a + b, 0);
      const brandCount = brandMap.size;

      // ブランド別シェアを計算
      const brandShares = Array.from(brandMap.entries())
        .map(([brand, mentions]) => ({
          brand,
          mentions,
          share: totalMentions > 0 ? (mentions / totalMentions) * 100 : 0,
        }))
        .sort((a, b) => b.mentions - a.mentions);

      // HHI計算 (シェア^2の合計、0-10000)
      const hhi = brandShares.reduce((sum, b) => sum + Math.pow(b.share, 2), 0);

      // 集中度判定
      let concentration: "low" | "medium" | "high" = "low";
      if (hhi >= 2500) {
        concentration = "high";
      } else if (hhi >= 1500) {
        concentration = "medium";
      }

      // 最大シェアブランド
      const dominant = brandShares[0] || null;

      return {
        cep_id: cep.id,
        cep_name: cep.cep_name,
        description: cep.description || "",
        total_mentions: totalMentions,
        brand_count: brandCount,
        hhi: Math.round(hhi),
        concentration,
        dominant_brand: dominant?.brand || null,
        dominant_share: Math.round((dominant?.share || 0) * 10) / 10,
        brand_shares: brandShares.slice(0, 8).map((b) => ({
          ...b,
          share: Math.round(b.share * 10) / 10,
        })),
      };
    });

    // 言及数降順でソート
    result.sort((a, b) => b.total_mentions - a.total_mentions);

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    console.error("Error fetching CEP competition:", error);
    return NextResponse.json(
      { error: "Failed to fetch CEP competition data" },
      { status: 500 }
    );
  }
}
