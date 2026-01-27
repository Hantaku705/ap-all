import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import type { IssueReport, IssueSection } from "@/types/data.types";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }

  return createClient(supabaseUrl, supabaseKey);
}

function getOpenAIClient() {
  const openaiKey = process.env.OPENAI_API_KEY_BCM || process.env.OPENAI_API_KEY;
  return openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
}

const VALID_ISSUES = ["portfolio", "growth", "risk", "ugc"] as const;
type IssueId = (typeof VALID_ISSUES)[number];

const ISSUE_TITLES: Record<IssueId, string> = {
  portfolio: "ポートフォリオ戦略分析",
  growth: "成長機会分析",
  risk: "リスク管理分析",
  ugc: "UGC活用分析",
};

const BRANDS = [
  "ほんだし",
  "クックドゥ",
  "味の素",
  "丸鶏がらスープ",
  "香味ペースト",
  "コンソメ",
  "ピュアセレクト",
  "アジシオ",
];

// LLMプロンプト：戦略示唆生成
const STRATEGY_SYSTEM_PROMPT = `あなたは調味料ブランドポートフォリオの戦略コンサルタントです。
与えられた分析データに基づいて、経営層向けの戦略示唆を生成してください。

## 出力形式
JSON形式で出力してください。説明文は不要です。
{
  "findings": ["発見1", "発見2", "発見3"],
  "recommendations": ["提言1", "提言2", "提言3"],
  "keyInsight": "最も重要なインサイト（1文）"
}

## ガイドライン
- 発見：データから読み取れる重要な事実
- 提言：具体的なアクション（20文字以内）
- keyInsight：経営判断に直結する最重要メッセージ`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientType = any;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ issueId: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { issueId } = await params;

    if (!VALID_ISSUES.includes(issueId as IssueId)) {
      return NextResponse.json({ error: "Invalid issue ID" }, { status: 404 });
    }

    const issue = issueId as IssueId;

    // Issue別の分析を実行
    let sections: IssueSection[] = [];

    switch (issue) {
      case "portfolio":
        sections = await analyzePortfolio(supabase);
        break;
      case "growth":
        sections = await analyzeGrowth(supabase);
        break;
      case "risk":
        sections = await analyzeRisk(supabase);
        break;
      case "ugc":
        sections = await analyzeUGC(supabase);
        break;
    }

    // LLMで戦略示唆を生成
    const strategy = await generateStrategyInsights(issue, sections);

    // Markdownレポートを生成
    const markdown = generateMarkdown(issue, sections, strategy);

    const response: IssueReport = {
      issueId: issue,
      title: ISSUE_TITLES[issue],
      generatedAt: new Date().toISOString(),
      sections,
      strategy,
      markdown,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to generate issue report:", error);
    return NextResponse.json(
      { error: "Failed to generate issue report" },
      { status: 500 }
    );
  }
}

// ポートフォリオ戦略分析
async function analyzePortfolio(supabase: SupabaseClientType): Promise<IssueSection[]> {
  const sections: IssueSection[] = [];

  // ブランドマスタを取得（共起データ用）
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name");

  const brandMap = new Map<number, string>();
  brands?.forEach((b: { id: number; name: string }) => brandMap.set(b.id, b.name));

  // 1. カニバリ検証：相関が高いブランドペア
  // correlations APIと同じJOIN方式を使用
  const { data: correlations, error: corrError } = await supabase
    .from("correlations")
    .select(`
      coefficient,
      brand_a:brands!correlations_brand_a_id_fkey(name),
      brand_b:brands!correlations_brand_b_id_fkey(name)
    `)
    .gt("coefficient", 0.2)
    .lt("coefficient", 1)
    .order("coefficient", { ascending: false })
    .limit(10);

  if (corrError) {
    console.error("Correlation query error:", corrError);
  }

  const cannibalizationFindings: string[] = [];
  const cannibalizationTable: Array<Record<string, string | number>> = [];
  const seenCorrPairs = new Set<string>();

  if (correlations && correlations.length > 0) {
    correlations.forEach((row: { brand_a: { name: string } | null; brand_b: { name: string } | null; coefficient: number }) => {
      const brandA = row.brand_a?.name;
      const brandB = row.brand_b?.name;
      if (brandA && brandB && brandA !== brandB) {
        // 重複除去: A-BとB-Aは同じペアとして扱う
        const pairKey = [brandA, brandB].sort().join("-");
        if (seenCorrPairs.has(pairKey)) return;
        seenCorrPairs.add(pairKey);

        const coef = row.coefficient;
        cannibalizationTable.push({
          ブランドA: brandA,
          ブランドB: brandB,
          相関係数: coef.toFixed(2),
        });
        if (coef > 0.3) {
          cannibalizationFindings.push(`${brandA}と${brandB}は相関${coef.toFixed(2)}で連動傾向`);
        } else if (coef > 0.2) {
          cannibalizationFindings.push(`${brandA}と${brandB}は弱い相関（${coef.toFixed(2)}）`);
        }
      }
    });
  }

  if (cannibalizationFindings.length === 0) {
    cannibalizationFindings.push("明確なカニバリゼーションは検出されませんでした");
  }

  sections.push({
    title: "カニバリ検証",
    question: "ブランド間で顧客を奪い合っていないか？",
    findings: cannibalizationFindings,
    dataTable: cannibalizationTable.slice(0, 5),
  });

  // 2. 導線設計：共起が高いブランドペア
  const { data: cooccurrences } = await supabase
    .from("sns_cooccurrences")
    .select("brand_a_id, brand_b_id, cooccurrence_count")
    .gt("cooccurrence_count", 10)  // 閾値緩和: 50 → 10
    .order("cooccurrence_count", { ascending: false })
    .limit(10);

  const pathwayFindings: string[] = [];
  const pathwayTable: Array<Record<string, string | number>> = [];
  const seenCoocPairs = new Set<string>();

  if (cooccurrences && cooccurrences.length > 0) {
    cooccurrences.forEach((row: { brand_a_id: number; brand_b_id: number; cooccurrence_count: number }) => {
      const brandA = brandMap.get(row.brand_a_id);
      const brandB = brandMap.get(row.brand_b_id);
      if (brandA && brandB && brandA !== brandB) {
        // 重複除去: A-BとB-Aは同じペアとして扱う
        const pairKey = [brandA, brandB].sort().join("-");
        if (seenCoocPairs.has(pairKey)) return;
        seenCoocPairs.add(pairKey);

        pathwayTable.push({
          ブランドA: brandA,
          ブランドB: brandB,
          共起数: row.cooccurrence_count,
        });
        if (row.cooccurrence_count > 30) {
          pathwayFindings.push(`${brandA}→${brandB}の同時言及${row.cooccurrence_count}件（購買導線の可能性）`);
        } else if (row.cooccurrence_count > 15) {
          pathwayFindings.push(`${brandA}と${brandB}の共起${row.cooccurrence_count}件`);
        }
      }
    });
  }

  if (pathwayFindings.length === 0) {
    pathwayFindings.push("明確な購買導線パターンは検出されませんでした");
  }

  sections.push({
    title: "導線設計",
    question: "ほんだし→クックドゥ等の購買導線は存在するか？",
    findings: pathwayFindings,
    dataTable: pathwayTable.slice(0, 5),
  });

  // 3. 棲み分け：CEP重複度
  // potential_scoreは0-3のスケール、またはreach_score/frequency_scoreを使用
  const { data: brandCeps } = await supabase
    .from("brand_ceps")
    .select(`
      potential_score,
      reach_score,
      mention_count,
      brands(name),
      ceps(cep_name, category)
    `)
    .or("potential_score.gt.0.5,reach_score.gt.0.1,mention_count.gt.5");

  // CEP別にブランドを集計
  const cepBrandMap = new Map<string, Set<string>>();
  if (brandCeps) {
    brandCeps.forEach((row: { ceps: { cep_name: string }; brands: { name: string } }) => {
      const cepName = row.ceps?.cep_name;
      const brandName = row.brands?.name;
      if (cepName && brandName) {
        if (!cepBrandMap.has(cepName)) {
          cepBrandMap.set(cepName, new Set());
        }
        cepBrandMap.get(cepName)!.add(brandName);
      }
    });
  }

  const overlapFindings: string[] = [];
  const overlapTable: Array<Record<string, string | number>> = [];

  cepBrandMap.forEach((brands, cepName) => {
    if (brands.size >= 2) {
      const brandList = Array.from(brands).join("、");
      overlapTable.push({
        CEP: cepName,
        ブランド数: brands.size,
        ブランド: brandList,
      });
      if (brands.size >= 3) {
        overlapFindings.push(`「${cepName}」は${brands.size}ブランドが競合（${brandList}）`);
      }
    }
  });

  if (overlapFindings.length === 0) {
    overlapFindings.push("各ブランドのCEPは比較的明確に分かれています");
  }

  sections.push({
    title: "棲み分け",
    question: "各ブランドのCEP（使用文脈）は明確に分かれているか？",
    findings: overlapFindings,
    dataTable: overlapTable.slice(0, 5),
  });

  // 4. 季節性活用
  const { data: seasonality } = await supabase
    .from("seasonality")
    .select("brand_id, month, avg_score");

  const seasonalityFindings: string[] = [];
  const seasonalityTable: Array<Record<string, string | number>> = [];

  if (seasonality && seasonality.length > 0) {
    // ブランド別にピーク月と閑散期を計算
    const brandSeasonality = new Map<number, { peak: { month: number; score: number }; low: { month: number; score: number } }>();

    seasonality.forEach((row: { brand_id: number; month: number; avg_score: number }) => {
      const current = brandSeasonality.get(row.brand_id) || {
        peak: { month: 0, score: -Infinity },
        low: { month: 0, score: Infinity }
      };

      if (row.avg_score > current.peak.score) {
        current.peak = { month: row.month, score: row.avg_score };
      }
      if (row.avg_score < current.low.score) {
        current.low = { month: row.month, score: row.avg_score };
      }
      brandSeasonality.set(row.brand_id, current);
    });

    const monthNames = ["", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

    brandSeasonality.forEach((data, brandId) => {
      const brandName = brandMap.get(brandId);
      if (brandName && data.peak.score > 0) {
        const swing = Math.round(data.peak.score - data.low.score);
        seasonalityTable.push({
          ブランド: brandName,
          ピーク月: monthNames[data.peak.month],
          閑散期: monthNames[data.low.month],
          振れ幅: `${swing}pt`,
        });
        if (swing > 20) {
          seasonalityFindings.push(`${brandName}は${monthNames[data.peak.month]}がピーク（振れ幅${swing}pt）`);
        }
      }
    });
  }

  if (seasonalityFindings.length === 0) {
    seasonalityFindings.push("季節変動は比較的安定しています");
  }

  sections.push({
    title: "季節性活用",
    question: "季節ごとの需要パターンを活かせているか？",
    findings: seasonalityFindings.slice(0, 5),
    dataTable: seasonalityTable.slice(0, 5),
  });

  // 5. トレンド変化（直近12週 vs 前年同期）
  const now = new Date();
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const oneYearTwelveWeeksAgo = new Date(oneYearAgo.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

  const { data: recentTrends } = await supabase
    .from("weekly_trends")
    .select("brand_id, score")
    .gte("week_start", twelveWeeksAgo.toISOString().split("T")[0]);

  const { data: lastYearTrends } = await supabase
    .from("weekly_trends")
    .select("brand_id, score")
    .gte("week_start", oneYearTwelveWeeksAgo.toISOString().split("T")[0])
    .lte("week_start", oneYearAgo.toISOString().split("T")[0]);

  const trendFindings: string[] = [];
  const trendTable: Array<Record<string, string | number>> = [];

  if (recentTrends && lastYearTrends) {
    // ブランド別に平均を計算
    const recentAvg = new Map<number, number>();
    const lastYearAvg = new Map<number, number>();
    const recentCounts = new Map<number, number>();
    const lastYearCounts = new Map<number, number>();

    recentTrends.forEach((row: { brand_id: number; score: number }) => {
      recentAvg.set(row.brand_id, (recentAvg.get(row.brand_id) || 0) + row.score);
      recentCounts.set(row.brand_id, (recentCounts.get(row.brand_id) || 0) + 1);
    });

    lastYearTrends.forEach((row: { brand_id: number; score: number }) => {
      lastYearAvg.set(row.brand_id, (lastYearAvg.get(row.brand_id) || 0) + row.score);
      lastYearCounts.set(row.brand_id, (lastYearCounts.get(row.brand_id) || 0) + 1);
    });

    brandMap.forEach((brandName, brandId) => {
      const recent = (recentAvg.get(brandId) || 0) / (recentCounts.get(brandId) || 1);
      const lastYear = (lastYearAvg.get(brandId) || 0) / (lastYearCounts.get(brandId) || 1);

      if (lastYear > 0) {
        const changeRate = Math.round(((recent - lastYear) / lastYear) * 100);
        trendTable.push({
          ブランド: brandName,
          直近12週平均: Math.round(recent),
          前年同期: Math.round(lastYear),
          変化率: `${changeRate > 0 ? "+" : ""}${changeRate}%`,
        });

        if (changeRate > 10) {
          trendFindings.push(`${brandName}は前年比+${changeRate}%で成長中`);
        } else if (changeRate < -10) {
          trendFindings.push(`${brandName}は前年比${changeRate}%で減少傾向`);
        }
      }
    });
  }

  if (trendFindings.length === 0) {
    trendFindings.push("全体的に安定したトレンドです（前年比±10%以内）");
  }

  // 変化率でソート
  trendTable.sort((a, b) => {
    const aRate = parseInt(String(a.変化率).replace(/[^-\d]/g, "")) || 0;
    const bRate = parseInt(String(b.変化率).replace(/[^-\d]/g, "")) || 0;
    return bRate - aRate;
  });

  sections.push({
    title: "トレンド変化",
    question: "直近で伸びている/落ちているブランドは？",
    findings: trendFindings.slice(0, 5),
    dataTable: trendTable.slice(0, 5),
  });

  // 6. ユーザー感情
  const { data: sentiments } = await supabase
    .from("sns_sentiments")
    .select("brand_id, positive_count, neutral_count, negative_count");

  const sentimentFindings: string[] = [];
  const sentimentTable: Array<Record<string, string | number>> = [];

  if (sentiments && sentiments.length > 0) {
    sentiments.forEach((row: { brand_id: number; positive_count: number; neutral_count: number; negative_count: number }) => {
      const brandName = brandMap.get(row.brand_id);
      const total = row.positive_count + row.neutral_count + row.negative_count;
      if (brandName && total > 0) {
        const posRate = Math.round((row.positive_count / total) * 100);
        const neuRate = Math.round((row.neutral_count / total) * 100);
        const negRate = Math.round((row.negative_count / total) * 100);

        sentimentTable.push({
          ブランド: brandName,
          "Positive%": `${posRate}%`,
          "Neutral%": `${neuRate}%`,
          "Negative%": `${negRate}%`,
        });

        if (negRate > 10) {
          sentimentFindings.push(`${brandName}はネガティブ率${negRate}%で注意が必要`);
        } else if (posRate > 60) {
          sentimentFindings.push(`${brandName}はポジティブ率${posRate}%で好評価`);
        }
      }
    });
  }

  if (sentimentFindings.length === 0) {
    sentimentFindings.push("全体的にニュートラルな反応が多い傾向です");
  }

  // ネガティブ率でソート
  sentimentTable.sort((a, b) => {
    const aNeg = parseInt(String(a["Negative%"]).replace("%", "")) || 0;
    const bNeg = parseInt(String(b["Negative%"]).replace("%", "")) || 0;
    return bNeg - aNeg;
  });

  sections.push({
    title: "ユーザー感情",
    question: "ユーザーはブランドをどう感じているか？",
    findings: sentimentFindings.slice(0, 5),
    dataTable: sentimentTable.slice(0, 5),
  });

  // 7. 利用シーン（W's分析）
  const { data: scenes } = await supabase
    .from("sns_posts")
    .select("brand, dish_category, meal_occasion")
    .not("dish_category", "is", null)
    .not("brand", "is", null);

  const sceneFindings: string[] = [];
  const sceneTable: Array<Record<string, string | number>> = [];

  if (scenes && scenes.length > 0) {
    // ブランド別に料理カテゴリを集計
    const brandDishCount = new Map<string, Map<string, number>>();

    scenes.forEach((row: { brand: string; dish_category: string; meal_occasion: string }) => {
      if (!brandDishCount.has(row.brand)) {
        brandDishCount.set(row.brand, new Map());
      }
      const dishMap = brandDishCount.get(row.brand)!;
      dishMap.set(row.dish_category, (dishMap.get(row.dish_category) || 0) + 1);
    });

    brandDishCount.forEach((dishMap, brand) => {
      const total = Array.from(dishMap.values()).reduce((a, b) => a + b, 0);
      const sorted = Array.from(dishMap.entries()).sort((a, b) => b[1] - a[1]);

      if (sorted.length > 0 && total > 10) {
        const top1 = sorted[0];
        const top2 = sorted[1];
        const share = Math.round((top1[1] / total) * 100);

        sceneTable.push({
          ブランド: brand,
          "Top1シーン": top1[0],
          シェア: `${share}%`,
          "Top2シーン": top2 ? top2[0] : "-",
        });

        if (share > 40) {
          sceneFindings.push(`${brand}は「${top1[0]}」シーンが突出（${share}%）`);
        }
      }
    });
  }

  if (sceneFindings.length === 0) {
    sceneFindings.push("利用シーンは多様に分散しています");
  }

  sections.push({
    title: "利用シーン",
    question: "どんな場面で使われているか？",
    findings: sceneFindings.slice(0, 5),
    dataTable: sceneTable.slice(0, 5),
  });

  // 8. バズ要因
  const { data: buzzPosts } = await supabase
    .from("sns_posts")
    .select("cooking_for, dish_category, engagement_total, likes_count, retweets_count")
    .not("cooking_for", "is", null)
    .order("engagement_total", { ascending: false })
    .limit(500);

  const buzzFindings: string[] = [];
  const buzzTable: Array<Record<string, string | number>> = [];

  if (buzzPosts && buzzPosts.length > 0) {
    // cooking_for別にエンゲージメントを集計
    const cookingForStats = new Map<string, { total: number; count: number; likes: number; rts: number }>();

    buzzPosts.forEach((row: { cooking_for: string; engagement_total: number; likes_count: number; retweets_count: number }) => {
      const stats = cookingForStats.get(row.cooking_for) || { total: 0, count: 0, likes: 0, rts: 0 };
      stats.total += row.engagement_total || 0;
      stats.count += 1;
      stats.likes += row.likes_count || 0;
      stats.rts += row.retweets_count || 0;
      cookingForStats.set(row.cooking_for, stats);
    });

    const avgAll = buzzPosts.reduce((sum: number, p: { engagement_total: number }) => sum + (p.engagement_total || 0), 0) / buzzPosts.length;

    cookingForStats.forEach((stats, cookingFor) => {
      if (stats.count >= 10) {
        const avg = Math.round(stats.total / stats.count);
        const avgLikes = Math.round(stats.likes / stats.count);
        const avgRTs = Math.round(stats.rts / stats.count);
        const ratio = (avg / avgAll).toFixed(1);

        buzzTable.push({
          投稿タイプ: cookingFor,
          平均エンゲージメント: avg,
          平均いいね: avgLikes,
          平均RT: avgRTs,
          対平均比: `${ratio}x`,
        });

        if (avg > avgAll * 1.5) {
          buzzFindings.push(`「${cookingFor}」投稿はエンゲージメント${ratio}倍で好反応`);
        }
      }
    });
  }

  if (buzzFindings.length === 0) {
    buzzFindings.push("特定の投稿タイプに偏りなくエンゲージメントを得ています");
  }

  // 対平均比でソート
  buzzTable.sort((a, b) => {
    const aRatio = parseFloat(String(a.対平均比).replace("x", "")) || 0;
    const bRatio = parseFloat(String(b.対平均比).replace("x", "")) || 0;
    return bRatio - aRatio;
  });

  sections.push({
    title: "バズ要因",
    question: "どんな投稿がエンゲージメントを得ているか？",
    findings: buzzFindings.slice(0, 5),
    dataTable: buzzTable.slice(0, 5),
  });

  // 9. 検索意図
  const { data: keywords } = await supabase
    .from("related_keywords")
    .select("brand_id, keyword, search_volume")
    .order("search_volume", { ascending: false });

  const searchFindings: string[] = [];
  const searchTable: Array<Record<string, string | number>> = [];

  if (keywords && keywords.length > 0) {
    // ブランド別にTop3キーワードを取得
    const brandKeywords = new Map<number, Array<{ keyword: string; volume: number }>>();

    keywords.forEach((row: { brand_id: number; keyword: string; search_volume: number }) => {
      const kws = brandKeywords.get(row.brand_id) || [];
      if (kws.length < 3) {
        kws.push({ keyword: row.keyword, volume: row.search_volume });
        brandKeywords.set(row.brand_id, kws);
      }
    });

    brandKeywords.forEach((kws, brandId) => {
      const brandName = brandMap.get(brandId);
      if (brandName && kws.length > 0) {
        searchTable.push({
          ブランド: brandName,
          "関連KW Top1": kws[0]?.keyword || "-",
          Top2: kws[1]?.keyword || "-",
          Top3: kws[2]?.keyword || "-",
        });

        // ネガティブ系キーワードをチェック
        const negativeKWs = ["危険", "体に悪い", "害", "添加物"];
        kws.forEach((kw) => {
          if (negativeKWs.some((neg) => kw.keyword.includes(neg))) {
            searchFindings.push(`${brandName}は「${kw.keyword}」検索あり（不安系）`);
          }
        });
      }
    });
  }

  if (searchFindings.length === 0) {
    searchFindings.push("検索キーワードは主にレシピ・使い方系が中心です");
  }

  sections.push({
    title: "検索意図",
    question: "ユーザーは何を求めて検索しているか？",
    findings: searchFindings.slice(0, 5),
    dataTable: searchTable.slice(0, 5),
  });

  // 10. 空白機会（カバーブランド数が少ないCEP）
  const opportunityFindings: string[] = [];
  const opportunityTable: Array<Record<string, string | number>> = [];

  // cepBrandMapを再利用（棲み分け分析で作成済み）
  const opportunities: Array<{ cep: string; brandCount: number; brands: string; topBrand: string }> = [];

  cepBrandMap.forEach((brands, cepName) => {
    const brandList = Array.from(brands);
    if (brandList.length <= 2) {
      opportunities.push({
        cep: cepName,
        brandCount: brandList.length,
        brands: brandList.join("、"),
        topBrand: brandList[0] || "-",
      });
    }
  });

  // ブランド数が少ない順にソート
  opportunities.sort((a, b) => a.brandCount - b.brandCount);

  opportunities.forEach((opp) => {
    opportunityTable.push({
      CEP: opp.cep,
      ブランド数: opp.brandCount,
      現在のブランド: opp.brands,
    });

    if (opp.brandCount === 1) {
      opportunityFindings.push(`「${opp.cep}」は${opp.topBrand}のみが強い（独占機会）`);
    } else if (opp.brandCount === 0) {
      opportunityFindings.push(`「${opp.cep}」は全ブランド未開拓（新規機会）`);
    }
  });

  if (opportunityFindings.length === 0) {
    opportunityFindings.push("主要CEPは複数ブランドでカバーされています");
  }

  sections.push({
    title: "空白機会",
    question: "競合がカバーしていないCEPはあるか？",
    findings: opportunityFindings.slice(0, 5),
    dataTable: opportunityTable.slice(0, 5),
  });

  return sections;
}

// 成長機会分析
async function analyzeGrowth(supabase: SupabaseClientType): Promise<IssueSection[]> {
  const sections: IssueSection[] = [];

  // 1. 未開拓CEP
  const { data: brandCeps } = await supabase
    .from("brand_ceps")
    .select(`
      potential_score,
      brands(name),
      ceps(cep_name, category)
    `);

  const brandCepScores = new Map<string, Map<string, number>>();
  const allCeps = new Set<string>();

  if (brandCeps) {
    brandCeps.forEach((row: { ceps: { cep_name: string }; brands: { name: string }; potential_score: number }) => {
      const brandName = row.brands?.name;
      const cepName = row.ceps?.cep_name;
      if (brandName && cepName) {
        allCeps.add(cepName);
        if (!brandCepScores.has(brandName)) {
          brandCepScores.set(brandName, new Map());
        }
        brandCepScores.get(brandName)!.set(cepName, row.potential_score);
      }
    });
  }

  const untappedFindings: string[] = [];
  const untappedTable: Array<Record<string, string | number>> = [];

  BRANDS.forEach((brand) => {
    const brandScores = brandCepScores.get(brand);
    if (!brandScores) return;

    allCeps.forEach((cep) => {
      const myScore = brandScores.get(cep) || 0;
      // 他ブランドで高スコアなCEPを自分が取れていない場合
      let maxOtherScore = 0;
      let topBrand = "";
      brandCepScores.forEach((scores, otherBrand) => {
        if (otherBrand !== brand) {
          const score = scores.get(cep) || 0;
          if (score > maxOtherScore) {
            maxOtherScore = score;
            topBrand = otherBrand;
          }
        }
      });

      // potential_scoreは0-3のスケール
      if (myScore < 1.0 && maxOtherScore > 1.5) {
        untappedTable.push({
          ブランド: brand,
          未開拓CEP: cep,
          自社スコア: myScore?.toFixed(2) || "0",
          トップブランド: topBrand,
          トップスコア: maxOtherScore?.toFixed(2) || "0",
        });
      }
    });
  });

  untappedTable.sort((a, b) => (b["トップスコア"] as number) - (a["トップスコア"] as number));

  if (untappedTable.length > 0) {
    untappedTable.slice(0, 3).forEach((row) => {
      untappedFindings.push(
        `${row["ブランド"]}は「${row["未開拓CEP"]}」が未開拓（${row["トップブランド"]}は${row["トップスコア"]}点）`
      );
    });
  } else {
    untappedFindings.push("明確な未開拓CEPは検出されませんでした");
  }

  sections.push({
    title: "未開拓CEP",
    question: "各ブランドが取れていない生活文脈は何か？",
    findings: untappedFindings,
    dataTable: untappedTable.slice(0, 5),
  });

  // 2. 意外なCEP（CEP Discovery APIのデータを使用）
  const { data: snsPosts } = await supabase
    .from("sns_posts")
    .select("brand_mentions, cep_id, engagement_total, ceps(cep_name)")
    .not("cep_id", "is", null)
    .gt("engagement_total", 100)  // 閾値緩和: 500 → 100
    .limit(500);

  // 言及数少ないがエンゲージメント高いCEPを抽出
  const cepEngagement = new Map<string, { count: number; totalEng: number }>();
  if (snsPosts) {
    snsPosts.forEach((post: { ceps: { cep_name: string }; engagement_total: number }) => {
      const cepName = post.ceps?.cep_name;
      if (cepName) {
        const current = cepEngagement.get(cepName) || { count: 0, totalEng: 0 };
        current.count++;
        current.totalEng += post.engagement_total || 0;
        cepEngagement.set(cepName, current);
      }
    });
  }

  const surprisingFindings: string[] = [];
  const surprisingTable: Array<Record<string, string | number>> = [];

  cepEngagement.forEach((stats, cepName) => {
    const avgEng = stats.count > 0 ? stats.totalEng / stats.count : 0;
    // 閾値緩和: count < 20 && avgEng > 300 → count < 30 && avgEng > 150
    if (stats.count < 30 && avgEng > 150) {
      surprisingTable.push({
        CEP: cepName,
        言及数: stats.count,
        平均エンゲージメント: Math.round(avgEng),
      });
    }
  });

  surprisingTable.sort((a, b) => (b["平均エンゲージメント"] as number) - (a["平均エンゲージメント"] as number));

  if (surprisingTable.length > 0) {
    surprisingTable.slice(0, 3).forEach((row) => {
      surprisingFindings.push(
        `「${row["CEP"]}」は言及${row["言及数"]}件だが平均ENG${row["平均エンゲージメント"]}と高熱量`
      );
    });
  } else {
    surprisingFindings.push("明確な「意外なCEP」は検出されませんでした");
  }

  sections.push({
    title: "意外なCEP",
    question: "言及数は少ないが熱量が高い伸びしろ文脈は？",
    findings: surprisingFindings,
    dataTable: surprisingTable.slice(0, 5),
  });

  // 3. 季節性活用
  const { data: seasonality } = await supabase
    .from("seasonality")
    .select(`
      month,
      avg_score,
      brands(name)
    `)
    .order("avg_score", { ascending: false });

  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const seasonFindings: string[] = [];
  const seasonTable: Array<Record<string, string | number>> = [];

  // ブランド別ピーク月を算出
  const brandPeaks = new Map<string, { month: number; score: number }>();
  if (seasonality) {
    seasonality.forEach((row: { brands: { name: string }; month: number; avg_score: number }) => {
      const brandName = row.brands?.name;
      if (brandName) {
        const current = brandPeaks.get(brandName);
        if (!current || row.avg_score > current.score) {
          brandPeaks.set(brandName, { month: row.month, score: row.avg_score });
        }
      }
    });
  }

  brandPeaks.forEach((peak, brandName) => {
    seasonTable.push({
      ブランド: brandName,
      ピーク月: monthNames[peak.month - 1],
      スコア: peak.score.toFixed(1),
    });
    seasonFindings.push(`${brandName}は${monthNames[peak.month - 1]}がピーク（スコア${peak.score.toFixed(1)}）`);
  });

  sections.push({
    title: "季節性活用",
    question: "いつ、どのブランドを訴求すべきか？",
    findings: seasonFindings.slice(0, 5),
    dataTable: seasonTable,
  });

  return sections;
}

// リスク管理分析
async function analyzeRisk(supabase: SupabaseClientType): Promise<IssueSection[]> {
  const sections: IssueSection[] = [];

  // 1. ネガティブ要因
  const { data: sentiments } = await supabase
    .from("sns_sentiments")
    .select(`
      negative_count,
      negative_rate,
      brands(name)
    `)
    .order("negative_rate", { ascending: false });

  const negativeFindings: string[] = [];
  const negativeTable: Array<Record<string, string | number>> = [];

  if (sentiments) {
    sentiments.forEach((row: { brands: { name: string }; negative_rate: number; negative_count: number }) => {
      const brandName = row.brands?.name;
      if (brandName) {
        negativeTable.push({
          ブランド: brandName,
          ネガティブ率: `${row.negative_rate.toFixed(1)}%`,
          ネガティブ件数: row.negative_count,
        });
        if (row.negative_rate > 15) {
          negativeFindings.push(`${brandName}はネガティブ率${row.negative_rate.toFixed(1)}%と高め`);
        }
      }
    });
  }

  // ネガティブ投稿の内容分析
  const { data: negativePosts } = await supabase
    .from("sns_posts")
    .select("content, brand_mentions, cep_category")
    .eq("sentiment", "negative")
    .limit(100);

  const negativeKeywords: Record<string, number> = {};
  const negativePatterns = ["まずい", "高い", "体に悪い", "添加物", "塩分", "化学調味料"];

  if (negativePosts) {
    negativePosts.forEach((post: { content: string }) => {
      if (post.content) {
        negativePatterns.forEach((kw) => {
          if (post.content.includes(kw)) {
            negativeKeywords[kw] = (negativeKeywords[kw] || 0) + 1;
          }
        });
      }
    });
  }

  const sortedNegKw = Object.entries(negativeKeywords).sort((a, b) => b[1] - a[1]);
  if (sortedNegKw.length > 0) {
    negativeFindings.push(`ネガティブ投稿で多いキーワード：${sortedNegKw.slice(0, 3).map(([kw, cnt]) => `${kw}(${cnt}件)`).join("、")}`);
  }

  if (negativeFindings.length === 0) {
    negativeFindings.push("顕著なネガティブ要因は検出されませんでした");
  }

  sections.push({
    title: "ネガティブ要因",
    question: "「まずい」「高い」「体に悪い」の実態と改善可能性は？",
    findings: negativeFindings,
    dataTable: negativeTable.slice(0, 5),
  });

  // 2. 風評リスク
  const riskFindings: string[] = [];
  const riskTable: Array<Record<string, string | number>> = [];

  // 「体に悪い」「添加物」などを含む投稿を分析
  const { data: riskPosts } = await supabase
    .from("sns_posts")
    .select("content, brand_mentions, published")
    .or("content.ilike.%体に悪い%,content.ilike.%添加物%,content.ilike.%化学調味料%")
    .order("published", { ascending: false })
    .limit(50);

  // ブランド別にリスク投稿をカウント
  const brandRiskCount: Record<string, number> = {};
  if (riskPosts) {
    riskPosts.forEach((post: { brand_mentions: string }) => {
      BRANDS.forEach((brand) => {
        if (post.brand_mentions?.includes(brand)) {
          brandRiskCount[brand] = (brandRiskCount[brand] || 0) + 1;
        }
      });
    });
  }

  Object.entries(brandRiskCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([brand, count]) => {
      riskTable.push({
        ブランド: brand,
        風評リスク投稿数: count,
      });
      if (count >= 5) {
        riskFindings.push(`${brand}に関する風評リスク投稿が${count}件検出`);
      }
    });

  if (riskFindings.length === 0) {
    riskFindings.push("深刻な風評リスクは現時点で検出されていません");
  }

  sections.push({
    title: "風評リスク",
    question: "「味の素 体に悪い」検索の実態は？",
    findings: riskFindings,
    dataTable: riskTable.slice(0, 5),
  });

  return sections;
}

// UGC活用分析
async function analyzeUGC(supabase: SupabaseClientType): Promise<IssueSection[]> {
  const sections: IssueSection[] = [];

  // 1. バズの再現性：高エンゲージメント投稿の共通点
  const { data: viralPosts } = await supabase
    .from("sns_posts")
    .select("content, brand_mentions, dish_category, meal_occasion, cooking_for, engagement_total")
    .gt("engagement_total", 200)  // 閾値緩和: 1000 → 200
    .order("engagement_total", { ascending: false })
    .limit(100);

  const viralPatterns: Record<string, { count: number; avgEng: number }> = {};

  if (viralPosts) {
    viralPosts.forEach((post: { dish_category?: string; meal_occasion?: string; engagement_total: number }) => {
      const pattern = `${post.dish_category || "不明"}_${post.meal_occasion || "不明"}`;
      if (!viralPatterns[pattern]) {
        viralPatterns[pattern] = { count: 0, avgEng: 0 };
      }
      viralPatterns[pattern].count++;
      viralPatterns[pattern].avgEng += post.engagement_total;
    });
  }

  // 平均エンゲージメントを計算
  Object.keys(viralPatterns).forEach((key) => {
    viralPatterns[key].avgEng = viralPatterns[key].avgEng / viralPatterns[key].count;
  });

  const viralFindings: string[] = [];
  const viralTable: Array<Record<string, string | number>> = [];

  const sortedPatterns = Object.entries(viralPatterns)
    .sort((a, b) => b[1].avgEng - a[1].avgEng)
    .slice(0, 10);

  sortedPatterns.forEach(([pattern, stats]) => {
    const [dish, occasion] = pattern.split("_");
    viralTable.push({
      料理カテゴリ: dish,
      食事シーン: occasion,
      投稿数: stats.count,
      平均エンゲージメント: Math.round(stats.avgEng),
    });
    // 閾値緩和: count >= 3 && avgEng > 2000 → count >= 2 && avgEng > 300
    if (stats.count >= 2 && stats.avgEng > 300) {
      viralFindings.push(`「${dish}」×「${occasion}」は平均${Math.round(stats.avgEng)}ENGと高バズ`);
    }
  });

  if (viralFindings.length === 0) {
    viralFindings.push("明確なバズパターンは検出されませんでした");
  }

  sections.push({
    title: "バズの再現性",
    question: "高エンゲージメント投稿の共通点は？",
    findings: viralFindings,
    dataTable: viralTable.slice(0, 5),
  });

  // 2. レシピ拡散
  const { data: recipePosts } = await supabase
    .from("sns_posts")
    .select("content, brand_mentions, dish_category, dish_name, engagement_total")
    .eq("intent", "recipe_share")
    .order("engagement_total", { ascending: false })
    .limit(100);

  const recipePatterns: Record<string, { count: number; totalEng: number; dishes: Set<string> }> = {};

  if (recipePosts) {
    recipePosts.forEach((post: { brand_mentions?: string; dish_category?: string; dish_name?: string; engagement_total?: number }) => {
      const brand = BRANDS.find((b) => post.brand_mentions?.includes(b)) || "その他";
      if (!recipePatterns[brand]) {
        recipePatterns[brand] = { count: 0, totalEng: 0, dishes: new Set() };
      }
      recipePatterns[brand].count++;
      recipePatterns[brand].totalEng += post.engagement_total || 0;
      if (post.dish_name) {
        recipePatterns[brand].dishes.add(post.dish_name);
      }
    });
  }

  const recipeFindings: string[] = [];
  const recipeTable: Array<Record<string, string | number>> = [];

  Object.entries(recipePatterns)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .forEach(([brand, stats]) => {
      const avgEng = stats.count > 0 ? stats.totalEng / stats.count : 0;
      recipeTable.push({
        ブランド: brand,
        レシピ投稿数: stats.count,
        平均エンゲージメント: Math.round(avgEng),
        人気メニュー: Array.from(stats.dishes).slice(0, 3).join("、") || "-",
      });
      // 閾値緩和: count >= 10 → count >= 3
      if (stats.count >= 3) {
        recipeFindings.push(`${brand}はレシピ投稿${stats.count}件、平均${Math.round(avgEng)}ENG`);
      }
    });

  if (recipeFindings.length === 0) {
    recipeFindings.push("レシピ投稿のパターンは分析中です");
  }

  sections.push({
    title: "レシピ拡散",
    question: "どんなレシピがシェアされやすいか？",
    findings: recipeFindings,
    dataTable: recipeTable.slice(0, 5),
  });

  return sections;
}

// LLMで戦略示唆を生成
async function generateStrategyInsights(
  issueId: IssueId,
  sections: IssueSection[]
): Promise<{ findings: string[]; recommendations: string[]; keyInsight: string }> {
  const openai = getOpenAIClient();

  const defaultInsights = {
    findings: ["データに基づく分析完了", "複数のパターンを検出", "追加調査を推奨"],
    recommendations: ["定期的なモニタリング", "データ収集の継続", "仮説検証の実施"],
    keyInsight: `${ISSUE_TITLES[issueId]}に関する分析が完了しました`,
  };

  if (!openai) {
    return defaultInsights;
  }

  const userPrompt = `
Issue: ${ISSUE_TITLES[issueId]}

## 分析結果
${sections.map((s) => `
### ${s.title}
問い: ${s.question}
発見:
${s.findings.map((f) => `- ${f}`).join("\n")}
`).join("\n")}

上記データに基づき、経営層向けの戦略示唆を生成してください。`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: STRATEGY_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return defaultInsights;

    const result = JSON.parse(content);
    return {
      findings: result.findings || defaultInsights.findings,
      recommendations: result.recommendations || defaultInsights.recommendations,
      keyInsight: result.keyInsight || defaultInsights.keyInsight,
    };
  } catch (error) {
    console.error("LLM generation failed:", error);
    return defaultInsights;
  }
}

// Markdownレポートを生成
function generateMarkdown(
  issueId: IssueId,
  sections: IssueSection[],
  strategy: { findings: string[]; recommendations: string[]; keyInsight: string }
): string {
  const title = ISSUE_TITLES[issueId];

  let markdown = `# ${title}

**生成日時**: ${new Date().toLocaleString("ja-JP")}

---

## エグゼクティブサマリー

> ${strategy.keyInsight}

---

`;

  sections.forEach((section) => {
    markdown += `## ${section.title}

**問い**: ${section.question}

### 発見事項

${section.findings.map((f) => `- ${f}`).join("\n")}

`;

    if (section.dataTable && section.dataTable.length > 0) {
      const headers = Object.keys(section.dataTable[0]);
      markdown += `### データ

| ${headers.join(" | ")} |
|${headers.map(() => "---").join("|")}|
${section.dataTable.map((row) => `| ${headers.map((h) => row[h]).join(" | ")} |`).join("\n")}

`;
    }

    markdown += "---\n\n";
  });

  markdown += `## 戦略示唆

### 主な発見
${strategy.findings.map((f) => `- ${f}`).join("\n")}

### 提言
${strategy.recommendations.map((r) => `- ${r}`).join("\n")}

---

*このレポートはAIにより自動生成されました*
`;

  return markdown;
}
