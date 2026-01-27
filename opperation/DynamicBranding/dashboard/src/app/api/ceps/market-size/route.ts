import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface MarketSizeData {
  cep_id: number;
  cep_name: string;
  description: string;
  total_mentions: number;
  prev_period_mentions: number;
  growth_rate: number;
  brand_count: number;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // 現在期間（直近4週間）と前期間（その前4週間）を計算
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - 28);
    const prevPeriodStart = new Date(currentPeriodStart);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - 28);

    // CEPマスタを取得
    const { data: ceps, error: cepError } = await supabase
      .from("ceps")
      .select("id, cep_name, description")
      .order("id");

    if (cepError) {
      throw cepError;
    }

    // 現在期間のCEP別言及数を取得
    const { data: currentMentions, error: currentError } = await supabase
      .from("sns_posts")
      .select("cep_id, brand_mentions")
      .not("cep_id", "is", null)
      .gte("published", currentPeriodStart.toISOString());

    if (currentError) {
      throw currentError;
    }

    // 前期間のCEP別言及数を取得
    const { data: prevMentions, error: prevError } = await supabase
      .from("sns_posts")
      .select("cep_id")
      .not("cep_id", "is", null)
      .gte("published", prevPeriodStart.toISOString())
      .lt("published", currentPeriodStart.toISOString());

    if (prevError) {
      throw prevError;
    }

    // 集計
    const currentCounts = new Map<number, { mentions: number; brands: Set<string> }>();
    const prevCounts = new Map<number, number>();

    for (const post of currentMentions || []) {
      if (!post.cep_id) continue;
      if (!currentCounts.has(post.cep_id)) {
        currentCounts.set(post.cep_id, { mentions: 0, brands: new Set() });
      }
      const entry = currentCounts.get(post.cep_id)!;
      entry.mentions++;
      if (post.brand_mentions) {
        const brands = post.brand_mentions.split(",").map((b: string) => b.trim());
        brands.forEach((brand: string) => entry.brands.add(brand));
      }
    }

    for (const post of prevMentions || []) {
      if (!post.cep_id) continue;
      prevCounts.set(post.cep_id, (prevCounts.get(post.cep_id) || 0) + 1);
    }

    // レスポンス構築
    const result: MarketSizeData[] = (ceps || []).map((cep) => {
      const current = currentCounts.get(cep.id);
      const totalMentions = current?.mentions || 0;
      const prevMentions = prevCounts.get(cep.id) || 0;
      const brandCount = current?.brands.size || 0;

      let growthRate = 0;
      if (prevMentions > 0) {
        growthRate = ((totalMentions - prevMentions) / prevMentions) * 100;
      } else if (totalMentions > 0) {
        growthRate = 100;
      }

      return {
        cep_id: cep.id,
        cep_name: cep.cep_name,
        description: cep.description || "",
        total_mentions: totalMentions,
        prev_period_mentions: prevMentions,
        growth_rate: Math.round(growthRate * 10) / 10,
        brand_count: brandCount,
      };
    });

    // 言及数降順でソート
    result.sort((a, b) => b.total_mentions - a.total_mentions);

    return NextResponse.json({
      data: result,
      period: {
        current: {
          start: currentPeriodStart.toISOString().split("T")[0],
          end: now.toISOString().split("T")[0],
        },
        previous: {
          start: prevPeriodStart.toISOString().split("T")[0],
          end: currentPeriodStart.toISOString().split("T")[0],
        },
      },
    });
  } catch (error) {
    console.error("Error fetching CEP market size:", error);
    return NextResponse.json(
      { error: "Failed to fetch CEP market size" },
      { status: 500 }
    );
  }
}
