import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface SnsPost {
  id: number;
  content: string;
  published: string;
  url: string | null;
  likes_count: number | null;
  retweets_count: number | null;
  comments_count: number | null;
  engagement_total: number | null;
  cep_id: number | null;
}

interface CepRow {
  id: number;
  cep_name: string;
  category: string | null;
  description: string | null;
}

interface SamplePost {
  content: string;
  published: string;
  url: string | null;
  likesCount: number;
  retweetsCount: number;
  commentsCount: number;
  engagementTotal: number;
}

interface CepDiscoveryItem {
  cepId: number;
  cepName: string;
  cepCategory: string;
  mentionCount: number;
  avgEngagement: number;
  engagementRatio: number;
  samplePosts: SamplePost[];
  // 追加フィールド
  trend: "growing" | "stable" | "declining";
  vsAvgEngagement: number;
  consistencyScore: number;
  viralIndex: number;
  highlightReason: string;
}

interface CepDiscoveryResponse {
  mainstream: CepDiscoveryItem[];
  surprising: CepDiscoveryItem[];
  brand: string;
}

// 3ヶ月前の日付を取得
function getThreeMonthsAgo(): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  return date;
}

// 6ヶ月前の日付を取得
function getSixMonthsAgo(): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  return date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand");

    if (!brand) {
      return NextResponse.json(
        { error: "brand parameter is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // CEPマスタを取得
    const { data: cepsData, error: cepsError } = await supabase
      .from("ceps")
      .select("id, cep_name, category, description");

    if (cepsError) {
      console.error("Ceps fetch error:", cepsError.message);
      return NextResponse.json({ error: "Failed to fetch CEPs" }, { status: 500 });
    }

    const cepMap = new Map<number, CepRow>();
    cepsData?.forEach((cep) => {
      cepMap.set(cep.id, cep as CepRow);
    });

    // ブランドに言及している投稿を取得（CEPラベル付き）
    const { data: postsData, error: postsError } = await supabase
      .from("sns_posts")
      .select("id, content, published, url, likes_count, retweets_count, comments_count, engagement_total, cep_id")
      .ilike("brand_mentions", `%${brand}%`)
      .not("cep_id", "is", null)
      .order("engagement_total", { ascending: false, nullsFirst: false });

    if (postsError) {
      console.error("Posts fetch error:", postsError.message);
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }

    // CEP別に集計（時系列情報も含む）
    const threeMonthsAgo = getThreeMonthsAgo();
    const sixMonthsAgo = getSixMonthsAgo();

    const cepStats = new Map<number, {
      posts: SnsPost[];
      totalEngagement: number;
      recentPosts: SnsPost[]; // 直近3ヶ月
      monthlyPresence: Set<string>; // 出現月（一貫性計算用）
      maxEngagement: number; // 最大ENG（バイラル指数用）
    }>();

    (postsData as SnsPost[])?.forEach((post) => {
      if (!post.cep_id) return;

      const existing = cepStats.get(post.cep_id) || {
        posts: [],
        totalEngagement: 0,
        recentPosts: [],
        monthlyPresence: new Set<string>(),
        maxEngagement: 0,
      };

      existing.posts.push(post);
      existing.totalEngagement += post.engagement_total || 0;
      existing.maxEngagement = Math.max(existing.maxEngagement, post.engagement_total || 0);

      // 投稿日を解析
      const postDate = new Date(post.published);

      // 直近3ヶ月の投稿を収集
      if (postDate >= threeMonthsAgo) {
        existing.recentPosts.push(post);
      }

      // 過去6ヶ月の月別出現を記録
      if (postDate >= sixMonthsAgo) {
        const monthKey = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, "0")}`;
        existing.monthlyPresence.add(monthKey);
      }

      cepStats.set(post.cep_id, existing);
    });

    // 王道CEP: 総合スコア上位5件
    const mainstream: CepDiscoveryItem[] = [];
    // 意外なCEP: ポテンシャルスコア上位5件（言及数下位50%から）
    const surprising: CepDiscoveryItem[] = [];

    // 全体の平均ENGを計算
    let totalEngAll = 0;
    let totalPostsAll = 0;
    cepStats.forEach((stats) => {
      totalEngAll += stats.totalEngagement;
      totalPostsAll += stats.posts.length;
    });
    const globalAvgEngagement = totalPostsAll > 0 ? totalEngAll / totalPostsAll : 0;

    const allCepItems: Array<{
      cepId: number;
      mentionCount: number;
      avgEngagement: number;
      engagementRatio: number;
      posts: SnsPost[];
      // 追加メトリクス
      trend: "growing" | "stable" | "declining";
      vsAvgEngagement: number;
      consistencyScore: number;
      viralIndex: number;
      recentEngagement: number;
      compositeScore: number; // 王道CEP用総合スコア
      potentialScore: number; // 意外CEP用ポテンシャルスコア
    }> = [];

    cepStats.forEach((stats, cepId) => {
      const mentionCount = stats.posts.length;
      const avgEngagement = mentionCount > 0 ? stats.totalEngagement / mentionCount : 0;
      const engagementRatio = mentionCount > 0 ? avgEngagement : 0;

      // 一貫性スコア: 過去6ヶ月の出現月数 / 6 × 100（上限100）
      const consistencyScore = Math.min(100, (stats.monthlyPresence.size / 6) * 100);

      // 直近3ヶ月の平均ENG
      const recentTotalEng = stats.recentPosts.reduce((sum, p) => sum + (p.engagement_total || 0), 0);
      const recentEngagement = stats.recentPosts.length > 0 ? recentTotalEng / stats.recentPosts.length : 0;

      // トレンド判定
      let trend: "growing" | "stable" | "declining" = "stable";
      if (avgEngagement > 0 && recentEngagement > 0) {
        const ratio = recentEngagement / avgEngagement;
        if (ratio >= 1.5) trend = "growing";
        else if (ratio <= 0.7) trend = "declining";
      }

      // 平均比
      const vsAvgEngagement = globalAvgEngagement > 0 ? avgEngagement / globalAvgEngagement : 0;

      // バイラル指数: 最大ENG / 平均ENG
      const viralIndex = avgEngagement > 0 ? stats.maxEngagement / avgEngagement : 0;

      // 王道CEP用総合スコア: 言及数 × 0.5 + 平均ENG正規化 × 0.3 + 一貫性 × 0.2
      // 言及数とENGを0-100にスケール（後で正規化）
      const compositeScore = mentionCount * 0.5 + avgEngagement * 0.3 + consistencyScore * 0.2;

      // 意外CEP用ポテンシャルスコア: (直近ENG / 全体ENG) × バイラル指数
      const engRatio = avgEngagement > 0 ? recentEngagement / avgEngagement : 0;
      const potentialScore = engRatio * viralIndex;

      allCepItems.push({
        cepId,
        mentionCount,
        avgEngagement,
        engagementRatio,
        posts: stats.posts,
        trend,
        vsAvgEngagement,
        consistencyScore,
        viralIndex,
        recentEngagement,
        compositeScore,
        potentialScore,
      });
    });

    // 王道CEP: 総合スコア上位5件
    const mainstreamItems = [...allCepItems]
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 5);

    // ハイライト理由を生成
    function generateMainstreamReason(item: typeof allCepItems[0]): string {
      const reasons: string[] = [];
      if (item.mentionCount >= 10) reasons.push(`言及数${item.mentionCount}件`);
      if (item.vsAvgEngagement >= 1.5) reasons.push(`ENG平均の${item.vsAvgEngagement.toFixed(1)}倍`);
      if (item.consistencyScore >= 80) reasons.push("毎月安定して言及");
      if (reasons.length === 0) reasons.push(`言及数${item.mentionCount}件`);
      return reasons.join("、");
    }

    function generateSurprisingReason(item: typeof allCepItems[0]): string {
      const reasons: string[] = [];
      if (item.trend === "growing") reasons.push("直近3ヶ月で成長中");
      if (item.viralIndex >= 3) reasons.push(`バズ投稿あり（最大ENG ${Math.round(item.viralIndex)}倍）`);
      if (item.vsAvgEngagement >= 2) reasons.push(`平均の${item.vsAvgEngagement.toFixed(1)}倍のENG`);
      if (reasons.length === 0) reasons.push("高いエンゲージメント率");
      return reasons.join("、");
    }

    mainstreamItems.forEach((item) => {
      const cep = cepMap.get(item.cepId);
      if (!cep) return;

      mainstream.push({
        cepId: item.cepId,
        cepName: cep.cep_name,
        cepCategory: cep.category || "",
        mentionCount: item.mentionCount,
        avgEngagement: Math.round(item.avgEngagement * 10) / 10,
        engagementRatio: Math.round(item.engagementRatio * 100) / 100,
        samplePosts: item.posts.slice(0, 2).map((p) => ({
          content: p.content?.slice(0, 200) || "",
          published: p.published,
          url: p.url,
          likesCount: p.likes_count || 0,
          retweetsCount: p.retweets_count || 0,
          commentsCount: p.comments_count || 0,
          engagementTotal: p.engagement_total || 0,
        })),
        trend: item.trend,
        vsAvgEngagement: Math.round(item.vsAvgEngagement * 10) / 10,
        consistencyScore: Math.round(item.consistencyScore),
        viralIndex: Math.round(item.viralIndex * 10) / 10,
        highlightReason: generateMainstreamReason(item),
      });
    });

    // 意外なCEP: 言及数が下位50% かつ ポテンシャルスコア上位5件
    const sortedByMention = [...allCepItems].sort((a, b) => a.mentionCount - b.mentionCount);
    const medianIndex = Math.floor(sortedByMention.length / 2);
    const medianMention = sortedByMention[medianIndex]?.mentionCount || 0;

    const surprisingItems = allCepItems
      .filter((item) =>
        item.mentionCount <= medianMention &&
        item.mentionCount >= 3 // 最低3件以上
      )
      .sort((a, b) => b.potentialScore - a.potentialScore)
      .slice(0, 5);

    surprisingItems.forEach((item) => {
      const cep = cepMap.get(item.cepId);
      if (!cep) return;

      surprising.push({
        cepId: item.cepId,
        cepName: cep.cep_name,
        cepCategory: cep.category || "",
        mentionCount: item.mentionCount,
        avgEngagement: Math.round(item.avgEngagement * 10) / 10,
        engagementRatio: Math.round(item.engagementRatio * 100) / 100,
        samplePosts: item.posts.slice(0, 2).map((p) => ({
          content: p.content?.slice(0, 200) || "",
          published: p.published,
          url: p.url,
          likesCount: p.likes_count || 0,
          retweetsCount: p.retweets_count || 0,
          commentsCount: p.comments_count || 0,
          engagementTotal: p.engagement_total || 0,
        })),
        trend: item.trend,
        vsAvgEngagement: Math.round(item.vsAvgEngagement * 10) / 10,
        consistencyScore: Math.round(item.consistencyScore),
        viralIndex: Math.round(item.viralIndex * 10) / 10,
        highlightReason: generateSurprisingReason(item),
      });
    });

    const response: CepDiscoveryResponse = {
      mainstream,
      surprising,
      brand,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in CEP discovery:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
