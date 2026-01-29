import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  NegativeCategory,
  NegativeTrendPoint,
  CategorySeverity,
  NegativeAnalysisResponse,
  NEGATIVE_CATEGORY_KEYWORDS,
  NEGATIVE_CATEGORY_LABELS,
} from "@/types/corporate.types";

// カテゴリ分類関数
function classifyPost(text: string): NegativeCategory {
  const lowerText = text.toLowerCase();

  // 優先順位順にチェック
  const categoryOrder: NegativeCategory[] = [
    'scandal_reaction',
    'additive_concern',
    'stealth_marketing',
    'white_company_gap',
    'cost_performance',
    'quality_taste',
    'portfolio_confusion',
    'stock_criticism',
  ];

  for (const category of categoryOrder) {
    const keywords = NEGATIVE_CATEGORY_KEYWORDS[category];
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return 'uncategorized';
}

// 深刻度スコア計算
function calculateSeverityScore(
  posts: Array<{ likes_count: number | null; retweets_count: number | null }>
): number {
  if (posts.length === 0) return 0;

  const avgLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0) / posts.length;
  const avgRetweets = posts.reduce((sum, p) => sum + (p.retweets_count || 0), 0) / posts.length;
  const count = posts.length;

  // 正規化（0-100スケール）
  const likesScore = Math.min((avgLikes / 100) * 40, 40);
  const retweetsScore = Math.min((avgRetweets / 50) * 30, 30);
  const countScore = Math.min((count / 50) * 30, 30);

  return Math.round(likesScore + retweetsScore + countScore);
}

// トレンド方向判定（直近4週 vs 前4週）
function calculateTrend(
  weeklyData: Array<{ week: string; count: number }>
): 'increasing' | 'stable' | 'decreasing' {
  if (weeklyData.length < 8) return 'stable';

  const sortedData = [...weeklyData].sort((a, b) => a.week.localeCompare(b.week));
  const recent4 = sortedData.slice(-4);
  const prev4 = sortedData.slice(-8, -4);

  const recentAvg = recent4.reduce((sum, d) => sum + d.count, 0) / 4;
  const prevAvg = prev4.reduce((sum, d) => sum + d.count, 0) / 4;

  const changePercent = prevAvg > 0 ? ((recentAvg - prevAvg) / prevAvg) * 100 : 0;

  if (changePercent > 15) return 'increasing';
  if (changePercent < -15) return 'decreasing';
  return 'stable';
}

// 週の開始日を取得（月曜日）
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

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

    // ネガティブ投稿を取得
    const { data: posts, error } = await supabase
      .from("sns_posts")
      .select("id, text, published, likes_count, retweets_count")
      .eq("is_corporate", true)
      .eq("sentiment", "negative")
      .order("published", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch negative posts" },
        { status: 500 }
      );
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        timeSeries: [],
        categories: [],
        summary: {
          totalNegative: 0,
          categorizedCount: 0,
          uncategorizedCount: 0,
          overallTrend: 'stable',
          mostCriticalCategory: 'uncategorized',
        },
        generatedAt: new Date().toISOString(),
        cached: false,
      } as NegativeAnalysisResponse);
    }

    // 投稿をカテゴリ分類
    const classifiedPosts = posts.map(post => ({
      ...post,
      category: classifyPost(post.text || ''),
    }));

    // カテゴリ別集計
    const categoryMap = new Map<NegativeCategory, typeof classifiedPosts>();
    for (const post of classifiedPosts) {
      const existing = categoryMap.get(post.category) || [];
      existing.push(post);
      categoryMap.set(post.category, existing);
    }

    // 週次時系列データ作成
    const weeklyMap = new Map<string, Record<NegativeCategory, number>>();
    for (const post of classifiedPosts) {
      if (!post.published) continue;
      const weekStart = getWeekStart(new Date(post.published));

      if (!weeklyMap.has(weekStart)) {
        weeklyMap.set(weekStart, {
          additive_concern: 0,
          stealth_marketing: 0,
          scandal_reaction: 0,
          cost_performance: 0,
          white_company_gap: 0,
          quality_taste: 0,
          portfolio_confusion: 0,
          stock_criticism: 0,
          uncategorized: 0,
        });
      }

      const weekData = weeklyMap.get(weekStart)!;
      weekData[post.category]++;
    }

    // 時系列データを配列に変換
    const timeSeries: NegativeTrendPoint[] = Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, categories]) => ({
        week,
        total: Object.values(categories).reduce((sum, c) => sum + c, 0),
        categories,
      }));

    // カテゴリ別深刻度計算
    const allCategories: NegativeCategory[] = [
      'additive_concern',
      'stealth_marketing',
      'scandal_reaction',
      'cost_performance',
      'white_company_gap',
      'quality_taste',
      'portfolio_confusion',
      'stock_criticism',
      'uncategorized',
    ];

    const categories: CategorySeverity[] = allCategories.map(category => {
      const categoryPosts = categoryMap.get(category) || [];
      const count = categoryPosts.length;
      const avgLikes = count > 0
        ? categoryPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0) / count
        : 0;
      const avgRetweets = count > 0
        ? categoryPosts.reduce((sum, p) => sum + (p.retweets_count || 0), 0) / count
        : 0;

      // 週次データからトレンド計算
      const weeklyForCategory = timeSeries.map(t => ({
        week: t.week,
        count: t.categories[category],
      }));
      const trend = calculateTrend(weeklyForCategory);

      // 上位投稿
      const topPosts = categoryPosts
        .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
        .slice(0, 3)
        .map(p => ({
          id: p.id.toString(),
          text: p.text || '',
          likes: p.likes_count || 0,
          published: p.published || '',
        }));

      return {
        category,
        categoryLabel: NEGATIVE_CATEGORY_LABELS[category],
        count,
        avgLikes: Math.round(avgLikes),
        avgRetweets: Math.round(avgRetweets),
        severityScore: calculateSeverityScore(categoryPosts),
        trend,
        topPosts,
      };
    }).sort((a, b) => b.count - a.count);

    // サマリー計算
    const totalNegative = classifiedPosts.length;
    const uncategorizedCount = categoryMap.get('uncategorized')?.length || 0;
    const categorizedCount = totalNegative - uncategorizedCount;

    // 全体トレンド
    const overallWeekly = timeSeries.map(t => ({ week: t.week, count: t.total }));
    const overallTrend = calculateTrend(overallWeekly);

    // 最も深刻なカテゴリ（未分類を除く）
    const mostCritical = categories
      .filter(c => c.category !== 'uncategorized')
      .sort((a, b) => b.severityScore - a.severityScore)[0];

    const response: NegativeAnalysisResponse = {
      timeSeries,
      categories,
      summary: {
        totalNegative,
        categorizedCount,
        uncategorizedCount,
        overallTrend,
        mostCriticalCategory: mostCritical?.category || 'uncategorized',
      },
      generatedAt: new Date().toISOString(),
      cached: false,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Failed to analyze negative posts:", error);
    return NextResponse.json(
      { error: "Failed to analyze negative posts" },
      { status: 500 }
    );
  }
}
