import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface TrendPoint {
  week: string;
  [cepName: string]: string | number;
}

interface CEPGrowth {
  id: number;
  name: string;
  currentWeekCount: number;
  prevWeekCount: number;
  growthRate: number;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // 期間パラメータ（デフォルト52週）
    const weeksParam = searchParams.get("weeks");
    const weeks = weeksParam ? parseInt(weeksParam, 10) : 52;
    const validWeeks = [12, 26, 52].includes(weeks) ? weeks : 52;

    // CEPマスタを取得
    const { data: ceps, error: cepError } = await supabase
      .from("ceps")
      .select("id, cep_name")
      .order("id");

    if (cepError) {
      throw cepError;
    }

    // 指定週数分のSNS投稿を取得
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - validWeeks * 7);

    // ページネーションで全件取得
    const PAGE_SIZE = 1000;
    let offset = 0;
    let hasMore = true;
    const allPosts: { cep_id: number; published: string }[] = [];

    while (hasMore) {
      const { data: posts, error: postsError } = await supabase
        .from("sns_posts")
        .select("cep_id, published")
        .not("cep_id", "is", null)
        .gte("published", startDate.toISOString())
        .order("published", { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);

      if (postsError) {
        throw postsError;
      }

      if (posts && posts.length > 0) {
        allPosts.push(...posts);
        offset += PAGE_SIZE;
      }
      hasMore = posts !== null && posts.length === PAGE_SIZE;
    }

    // 週別・CEP別に集計
    const weekCepCounts = new Map<string, Map<number, number>>();

    for (const post of allPosts) {
      if (!post.cep_id || !post.published) continue;

      const date = new Date(post.published);
      const weekStart = getWeekStart(date);
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weekCepCounts.has(weekKey)) {
        weekCepCounts.set(weekKey, new Map());
      }

      const cepMap = weekCepCounts.get(weekKey)!;
      cepMap.set(post.cep_id, (cepMap.get(post.cep_id) || 0) + 1);
    }

    // CEP ID → 名前のマップ
    const cepNameMap = new Map<number, string>();
    for (const cep of ceps || []) {
      cepNameMap.set(cep.id, cep.cep_name);
    }

    // 週をソートしてトレンドデータを構築
    const weekKeys = Array.from(weekCepCounts.keys()).sort();
    const trendData: TrendPoint[] = weekKeys.map((week) => {
      const cepMap = weekCepCounts.get(week)!;
      const point: TrendPoint = { week };

      for (const cep of ceps || []) {
        point[cep.cep_name] = cepMap.get(cep.id) || 0;
      }

      return point;
    });

    // CEP一覧（チャート用）
    const cepList = (ceps || []).map((cep) => ({
      id: cep.id,
      name: cep.cep_name,
    }));

    // 成長率を計算（直近2週間 vs その前2週間）
    // ただし、最新週が不完全（前週の50%未満）な場合は除外
    const getWeekTotal = (week: string) => {
      const cepMap = weekCepCounts.get(week);
      if (!cepMap) return 0;
      let total = 0;
      for (const count of cepMap.values()) {
        total += count;
      }
      return total;
    };

    let weeksToUse = weekKeys;
    if (weekKeys.length >= 2) {
      const lastWeekTotal = getWeekTotal(weekKeys[weekKeys.length - 1]);
      const prevWeekTotal = getWeekTotal(weekKeys[weekKeys.length - 2]);
      // 最新週が前週の50%未満なら不完全と判断して除外
      if (prevWeekTotal > 0 && lastWeekTotal < prevWeekTotal * 0.5) {
        weeksToUse = weekKeys.slice(0, -1);
      }
    }

    const recentWeeks = weeksToUse.slice(-2);
    const prevWeeks = weeksToUse.slice(-4, -2);

    const cepGrowth: CEPGrowth[] = (ceps || []).map((cep) => {
      const currentCount = recentWeeks.reduce((sum, week) => {
        const cepMap = weekCepCounts.get(week);
        return sum + (cepMap?.get(cep.id) || 0);
      }, 0);

      const prevCount = prevWeeks.reduce((sum, week) => {
        const cepMap = weekCepCounts.get(week);
        return sum + (cepMap?.get(cep.id) || 0);
      }, 0);

      let growthRate = 0;
      if (prevCount > 0) {
        growthRate = ((currentCount - prevCount) / prevCount) * 100;
      } else if (currentCount > 0) {
        growthRate = 100;
      }

      return {
        id: cep.id,
        name: cep.cep_name,
        currentWeekCount: currentCount,
        prevWeekCount: prevCount,
        growthRate: Math.round(growthRate * 10) / 10,
      };
    });

    // 成長率でソート
    const growing = [...cepGrowth]
      .filter((c) => c.growthRate > 0)
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 3);

    const declining = [...cepGrowth]
      .filter((c) => c.growthRate < 0)
      .sort((a, b) => a.growthRate - b.growthRate)
      .slice(0, 3);

    return NextResponse.json({
      data: trendData,
      ceps: cepList,
      growth: cepGrowth,
      summary: {
        growing,
        declining,
      },
      period: {
        weeks: validWeeks,
        start: startDate.toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Error fetching CEP trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch CEP trends data" },
      { status: 500 }
    );
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
