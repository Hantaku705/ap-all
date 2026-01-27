import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import type { IssueReport, IssueSection, SamplePost, PersonaSummary } from "@/types/data.types";

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

const VALID_BRANDS = [
  "ほんだし",
  "クックドゥ",
  "味の素",
  "丸鶏がらスープ",
  "香味ペースト",
  "コンソメ",
  "ピュアセレクト",
  "アジシオ",
];

const ALL_BRANDS = VALID_BRANDS;

// LLMプロンプト：戦略示唆生成
const STRATEGY_SYSTEM_PROMPT = `あなたは調味料ブランドの戦略コンサルタントです。
与えられた分析データに基づいて、ブランドマネージャー向けの**具体的で実行可能な**戦略示唆を生成してください。

## 出力形式
JSON形式で出力してください。説明文は不要です。
{
  "findings": ["発見1", "発見2", "発見3", "発見4", "発見5"],
  "recommendations": ["提言1", "提言2", "提言3"],
  "keyInsight": "最も重要なインサイト（1文）"
}

## 分析の重点ポイント
1. **ペルソナ（Who）**: k-meansクラスタリングで特定されたユーザー像を踏まえ、最優先ターゲットを明示
2. **DPT（What）**: Use Case×Positioning分析で発見されたPOD（独自価値）を施策に反映
3. **W's（When/Why/With）**: 食事シーン・動機・食事相手の組み合わせから具体的な訴求軸を提案
4. **競合関係**: 補完/競合ブランドとの関係性を考慮した差別化戦略

## ガイドライン
- 発見：データから読み取れる重要な事実（ペルソナ・DPT・W'sの具体的な数値を含む）
- 提言：**ターゲット×シーン×訴求**の形式で具体的なアクション（30文字以内）
  - 例：「子育て層×平日夕食×時短」「単身者×週末ランチ×本格派」
- keyInsight：ブランド戦略に直結する最重要メッセージ（ペルソナとPODを結びつける）

## 悪い例（避けるべき）
- 「認知度向上」「SNS強化」など抽象的な提言
- データに基づかない一般論

## 良い例
- 「忙しい子育て層（35%）に対し、平日夕食の時短価値を訴求」
- 「味の本格さ（POD）を活かし、週末の料理好き層にアプローチ」`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientType = any;

// ベースURL取得
function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// クロス分析の結果型
interface CrossAnalysisResult {
  personaCEP: Array<{ persona: string; cep: string; count: number; avgEng: number; score: number }>;
  personaDish: Array<{ persona: string; dish: string; count: number; avgEng: number; score: number }>;
  cepDish: Array<{ cep: string; dish: string; count: number; avgEng: number; score: number }>;
  topCombinations: Array<{ persona: string; cep: string; dish: string; count: number; avgEng: number; score: number }>;
}

// クロス分析関数（ペルソナ×CEP×料理）
async function analyzeCrossDimensions(
  supabase: SupabaseClientType,
  brandName: string
): Promise<CrossAnalysisResult> {
  const { data: posts } = await supabase
    .from("sns_posts")
    .select("life_stage, cooking_for, cep_name, dish_category, engagement_total, likes_count, retweets_count")
    .ilike("brand_mentions", `%${brandName}%`)
    .not("life_stage", "is", null)
    .limit(2000);

  const personaCEPMap = new Map<string, { count: number; totalEng: number }>();
  const personaDishMap = new Map<string, { count: number; totalEng: number }>();
  const cepDishMap = new Map<string, { count: number; totalEng: number }>();
  const combinationMap = new Map<string, { persona: string; cep: string; dish: string; count: number; totalEng: number }>();

  if (posts) {
    posts.forEach((p: { life_stage: string; cooking_for: string; cep_name: string; dish_category: string; engagement_total: number }) => {
      const persona = p.life_stage || p.cooking_for || "unknown";
      const cep = p.cep_name || "unknown";
      const dish = p.dish_category || "unknown";
      const eng = p.engagement_total || 0;

      // ペルソナ × CEP
      if (persona !== "unknown" && cep !== "unknown") {
        const key = `${persona}|${cep}`;
        const existing = personaCEPMap.get(key) || { count: 0, totalEng: 0 };
        personaCEPMap.set(key, { count: existing.count + 1, totalEng: existing.totalEng + eng });
      }

      // ペルソナ × 料理
      if (persona !== "unknown" && dish !== "unknown") {
        const key = `${persona}|${dish}`;
        const existing = personaDishMap.get(key) || { count: 0, totalEng: 0 };
        personaDishMap.set(key, { count: existing.count + 1, totalEng: existing.totalEng + eng });
      }

      // CEP × 料理
      if (cep !== "unknown" && dish !== "unknown") {
        const key = `${cep}|${dish}`;
        const existing = cepDishMap.get(key) || { count: 0, totalEng: 0 };
        cepDishMap.set(key, { count: existing.count + 1, totalEng: existing.totalEng + eng });
      }

      // 3軸組み合わせ
      if (persona !== "unknown" && cep !== "unknown" && dish !== "unknown") {
        const key = `${persona}|${cep}|${dish}`;
        const existing = combinationMap.get(key) || { persona, cep, dish, count: 0, totalEng: 0 };
        combinationMap.set(key, { ...existing, count: existing.count + 1, totalEng: existing.totalEng + eng });
      }
    });
  }

  // エンゲージメント加重スコアで変換・ソート
  const calcScore = (count: number, avgEng: number) => count * Math.log(avgEng + 1);

  const personaCEP = Array.from(personaCEPMap.entries())
    .map(([key, v]) => {
      const [persona, cep] = key.split("|");
      const avgEng = v.count > 0 ? v.totalEng / v.count : 0;
      return { persona, cep, count: v.count, avgEng: Math.round(avgEng), score: calcScore(v.count, avgEng) };
    })
    .filter(x => x.count >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const personaDish = Array.from(personaDishMap.entries())
    .map(([key, v]) => {
      const [persona, dish] = key.split("|");
      const avgEng = v.count > 0 ? v.totalEng / v.count : 0;
      return { persona, dish, count: v.count, avgEng: Math.round(avgEng), score: calcScore(v.count, avgEng) };
    })
    .filter(x => x.count >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const cepDish = Array.from(cepDishMap.entries())
    .map(([key, v]) => {
      const [cep, dish] = key.split("|");
      const avgEng = v.count > 0 ? v.totalEng / v.count : 0;
      return { cep, dish, count: v.count, avgEng: Math.round(avgEng), score: calcScore(v.count, avgEng) };
    })
    .filter(x => x.count >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const topCombinations = Array.from(combinationMap.values())
    .map(v => {
      const avgEng = v.count > 0 ? v.totalEng / v.count : 0;
      return { ...v, avgEng: Math.round(avgEng), score: calcScore(v.count, avgEng) };
    })
    .filter(x => x.count >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return { personaCEP, personaDish, cepDish, topCombinations };
}

// 投稿原文取得ヘルパー関数
async function fetchSamplePosts(
  supabase: SupabaseClientType,
  brandName: string,
  options: {
    sentiment?: "positive" | "neutral" | "negative";
    orderBy?: "engagement_total" | "published";
    limit?: number;
  } = {}
): Promise<SamplePost[]> {
  const { sentiment, orderBy = "engagement_total", limit = 5 } = options;

  let query = supabase
    .from("sns_posts")
    .select("content, sentiment, engagement_total, source_type, published, url")
    .ilike("brand_mentions", `%${brandName}%`)
    .not("content", "is", null);

  if (sentiment) {
    query = query.eq("sentiment", sentiment);
  }

  query = query.order(orderBy, { ascending: false }).limit(limit);

  const { data: posts } = await query;

  if (!posts) return [];

  return posts.map((p: {
    content: string;
    sentiment: string;
    engagement_total: number;
    source_type: string;
    published: string;
    url: string;
  }) => ({
    content: p.content?.slice(0, 200) + (p.content?.length > 200 ? "..." : ""),
    sentiment: p.sentiment as "positive" | "neutral" | "negative",
    engagement: p.engagement_total || 0,
    source: p.source_type || "unknown",
    date: p.published ? new Date(p.published).toLocaleDateString("ja-JP") : undefined,
    url: p.url,
  }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandName: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { brandName } = await params;
    const decodedBrand = decodeURIComponent(brandName);

    if (!VALID_BRANDS.includes(decodedBrand)) {
      return NextResponse.json({ error: "Invalid brand name" }, { status: 404 });
    }

    // ブランドIDを取得
    const { data: brandData } = await supabase
      .from("brands")
      .select("id, name")
      .eq("name", decodedBrand)
      .single();

    if (!brandData) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const brandId = brandData.id;

    // 全ブランドマップを取得（比較用）
    const { data: allBrands } = await supabase
      .from("brands")
      .select("id, name");

    const brandMap = new Map<number, string>();
    allBrands?.forEach((b: { id: number; name: string }) => brandMap.set(b.id, b.name));

    // 11問の分析を実行
    const sections = await analyzeBrand(supabase, decodedBrand, brandId, brandMap);

    // クロス分析を実行
    const crossAnalysis = await analyzeCrossDimensions(supabase, decodedBrand);

    // 高エンゲージメント投稿を取得
    const topEngagementPosts = await fetchSamplePosts(supabase, decodedBrand, { orderBy: "engagement_total", limit: 5 });

    // LLMで戦略示唆を生成（クロス分析結果も渡す）
    const strategy = await generateStrategyInsights(decodedBrand, sections, crossAnalysis, topEngagementPosts);

    // Markdownレポートを生成
    const markdown = generateMarkdown(decodedBrand, sections, strategy);

    const response: IssueReport = {
      issueId: `brand-${decodedBrand}`,
      title: `${decodedBrand} ブランド分析レポート`,
      generatedAt: new Date().toISOString(),
      sections,
      strategy,
      markdown,
    };

    // キャッシュヘッダー追加（5分間キャッシュ）
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Failed to generate brand report:", error);
    return NextResponse.json(
      { error: "Failed to generate brand report" },
      { status: 500 }
    );
  }
}

// ブランド別12問分析（並列実行で高速化）
async function analyzeBrand(
  supabase: SupabaseClientType,
  brandName: string,
  brandId: number,
  brandMap: Map<number, string>
): Promise<IssueSection[]> {
  // 全12問を並列実行
  const [
    q1Health,
    q2UserProfile,
    q3UsageContext,
    q4Competition,
    q5UniqueValue,
    q6Risks,
    q7Growth,
    q8Seasonal,
    q9Content,
    q10Search,
    q11Dishes,
    q12WsDetail,
  ] = await Promise.all([
    analyzeHealth(supabase, brandName, brandId, brandMap),
    analyzeUserProfile(supabase, brandName),
    analyzeUsageContext(supabase, brandName, brandId),
    analyzeCompetition(supabase, brandName, brandId, brandMap),
    analyzeUniqueValue(supabase, brandName),
    analyzeRisks(supabase, brandName, brandId),
    analyzeGrowthOpportunity(supabase, brandName, brandId),
    analyzeSeasonalStrategy(supabase, brandName, brandId),
    analyzeContentStrategy(supabase, brandName),
    analyzeSearchStrategy(supabase, brandName, brandId, brandMap),
    analyzeSignatureDishes(supabase, brandName),
    analyzeWsDetail(supabase, brandName),
  ]);

  return [
    q1Health,
    q2UserProfile,
    q3UsageContext,
    q4Competition,
    q5UniqueValue,
    q6Risks,
    q7Growth,
    q8Seasonal,
    q9Content,
    q10Search,
    q11Dishes,
    q12WsDetail,
  ];
}

// Q1: ブランド健康度
async function analyzeHealth(
  supabase: SupabaseClientType,
  brandName: string,
  brandId: number,
  brandMap: Map<number, string>
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // 検索トレンド（直近12週 vs 前年同期）
  const now = new Date();
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const oneYearTwelveWeeksAgo = new Date(oneYearAgo.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

  const { data: recentTrends } = await supabase
    .from("weekly_trends")
    .select("score")
    .eq("brand_id", brandId)
    .gte("week_start", twelveWeeksAgo.toISOString().split("T")[0]);

  const { data: lastYearTrends } = await supabase
    .from("weekly_trends")
    .select("score")
    .eq("brand_id", brandId)
    .gte("week_start", oneYearTwelveWeeksAgo.toISOString().split("T")[0])
    .lte("week_start", oneYearAgo.toISOString().split("T")[0]);

  let recentAvg = 0;
  let lastYearAvg = 0;
  let trendChange = 0;

  if (recentTrends && recentTrends.length > 0) {
    recentAvg = recentTrends.reduce((sum: number, r: { score: number }) => sum + r.score, 0) / recentTrends.length;
  }
  if (lastYearTrends && lastYearTrends.length > 0) {
    lastYearAvg = lastYearTrends.reduce((sum: number, r: { score: number }) => sum + r.score, 0) / lastYearTrends.length;
  }
  if (lastYearAvg > 0) {
    trendChange = Math.round(((recentAvg - lastYearAvg) / lastYearAvg) * 100);
  }

  // SNS言及数
  const { data: mentions } = await supabase
    .from("sns_mentions")
    .select("mention_count")
    .eq("brand_id", brandId)
    .single();

  const mentionCount = mentions?.mention_count || 0;

  // センチメント（sns_postsから直接集計）
  const { data: sentimentPosts } = await supabase
    .from("sns_posts")
    .select("sentiment")
    .ilike("brand_mentions", `%${brandName}%`)
    .not("sentiment", "is", null);

  let posRate = 0;
  let negRate = 0;
  let posCount = 0;
  let negCount = 0;
  let neuCount = 0;
  if (sentimentPosts && sentimentPosts.length > 0) {
    sentimentPosts.forEach((p: { sentiment: string }) => {
      if (p.sentiment === "positive") posCount++;
      else if (p.sentiment === "negative") negCount++;
      else neuCount++;
    });
    const total = posCount + negCount + neuCount;
    if (total > 0) {
      posRate = Math.round((posCount / total) * 100);
      negRate = Math.round((negCount / total) * 100);
    }
  }

  dataTable.push({
    指標: "検索スコア（直近12週）",
    現在: Math.round(recentAvg),
    前年同期: Math.round(lastYearAvg),
    変化: `${trendChange > 0 ? "+" : ""}${trendChange}%`,
  });
  dataTable.push({
    指標: "SNS言及数",
    現在: mentionCount,
    前年同期: "-",
    変化: "-",
  });
  dataTable.push({
    指標: "ポジティブ率",
    現在: `${posRate}%`,
    前年同期: "-",
    変化: "-",
  });
  dataTable.push({
    指標: "ネガティブ率",
    現在: `${negRate}%`,
    前年同期: "-",
    変化: "-",
  });

  // インサイト→アクション形式で発見事項を生成
  if (trendChange > 5) {
    findings.push(`【成長シグナル】検索+${trendChange}%（前年比） → 認知拡大施策を強化する好機`);
  } else if (trendChange < -5) {
    findings.push(`【警告】検索${trendChange}%減少 → 新規ユースケース開拓・リポジショニングを検討`);
  } else {
    findings.push(`【安定】検索トレンドは前年比±${Math.abs(trendChange)}%で横ばい`);
  }

  // センチメント分析
  const sentimentRatio = posCount + negCount > 0 ? posCount / (posCount + negCount) : 0;
  findings.push(`【声量】SNS ${mentionCount}件（Pos ${posCount}/Neg ${negCount}/Neu ${neuCount}）`);

  if (posRate > 60) {
    findings.push(`【好感度高】ポジティブ率${posRate}% → UGC活用でさらに拡散`);
  } else if (negRate > 15) {
    findings.push(`【要改善】ネガティブ率${negRate}% → ネガティブ要因の特定と改善を優先`);
  } else if (posRate > 40) {
    findings.push(`【中立的】ポジティブ率${posRate}% → 感動体験コンテンツで差別化`);
  } else if (posCount + negCount + neuCount === 0) {
    findings.push("【データ不足】センチメント分析には追加データが必要");
  }

  return {
    title: "ブランド健康度",
    question: `「${brandName}」は健全に成長しているか？`,
    findings,
    dataTable,
  };
}

// Q2: ユーザー像（ペルソナ統合版）
async function analyzeUserProfile(
  supabase: SupabaseClientType,
  brandName: string
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];
  const personas: PersonaSummary[] = [];
  let samplePosts: SamplePost[] = [];

  // ペルソナAPIを呼び出し（k-meansクラスタリング結果）
  try {
    const baseUrl = getBaseUrl();
    const personaRes = await fetch(
      `${baseUrl}/api/personas?brand=${encodeURIComponent(brandName)}`,
      { cache: "no-store" }
    );
    if (personaRes.ok) {
      const personaData = await personaRes.json();
      if (personaData.personas && personaData.personas.length > 0) {
        // ペルソナを findings に追加
        findings.push(`【k-meansクラスタリングで${personaData.personas.length}つのペルソナを特定】`);

        personaData.personas.forEach((p: {
          id: string;
          name: string;
          description: string;
          metrics: { post_count: number; share_percentage: number; avg_engagement: number };
          dominant_attributes: { life_stage: string; cooking_skill: string; cooking_for: string };
          sample_posts: string[];
        }, idx: number) => {
          const share = p.metrics?.share_percentage || 0;
          findings.push(`ペルソナ${idx + 1}「${p.name}」: ${p.description}（${share.toFixed(0)}%）`);

          // データテーブルに追加
          dataTable.push({
            ペルソナ: p.name,
            シェア: `${share.toFixed(0)}%`,
            投稿数: p.metrics?.post_count || 0,
            平均ENG: p.metrics?.avg_engagement || 0,
          });

          // ペルソナサマリーに追加
          personas.push({
            id: p.id || `persona-${idx}`,
            name: p.name,
            description: p.description,
            postCount: p.metrics?.post_count || 0,
            sharePercentage: share,
            avgEngagement: p.metrics?.avg_engagement || 0,
            keywords: [
              p.dominant_attributes?.life_stage,
              p.dominant_attributes?.cooking_skill,
              p.dominant_attributes?.cooking_for,
            ].filter(Boolean) as string[],
          });

          // サンプル投稿を収集
          if (p.sample_posts && p.sample_posts.length > 0) {
            p.sample_posts.slice(0, 2).forEach((content: string) => {
              samplePosts.push({
                content: content.slice(0, 150) + (content.length > 150 ? "..." : ""),
              });
            });
          }
        });

        // 品質情報
        if (personaData.quality) {
          findings.push(`クラスタリング品質: 信頼度${(personaData.quality.overall_confidence * 100).toFixed(0)}%`);
        }
      }
    }
  } catch (e) {
    // ペルソナAPI失敗時はフォールバック
  }

  // ペルソナがない場合は従来のlife_stage/cooking_skill集計にフォールバック
  if (personas.length === 0) {
    const { data: posts } = await supabase
      .from("sns_posts")
      .select("life_stage, cooking_skill, cooking_for, with_whom")
      .ilike("brand_mentions", `%${brandName}%`);

    const lifeStageCount = new Map<string, number>();
    const cookingForCount = new Map<string, number>();

    if (posts) {
      posts.forEach((p: { life_stage: string; cooking_for: string }) => {
        if (p.life_stage) {
          lifeStageCount.set(p.life_stage, (lifeStageCount.get(p.life_stage) || 0) + 1);
        }
        if (p.cooking_for) {
          cookingForCount.set(p.cooking_for, (cookingForCount.get(p.cooking_for) || 0) + 1);
        }
      });
    }

    const totalLife = Array.from(lifeStageCount.values()).reduce((a, b) => a + b, 0);
    const sortedLife = Array.from(lifeStageCount.entries()).sort((a, b) => b[1] - a[1]);

    sortedLife.slice(0, 3).forEach(([stage, count]) => {
      const share = totalLife > 0 ? Math.round((count / totalLife) * 100) : 0;
      dataTable.push({
        属性: `ライフステージ: ${stage}`,
        件数: count,
        シェア: `${share}%`,
      });
    });

    if (sortedLife.length > 0) {
      const top = sortedLife[0];
      const share = totalLife > 0 ? Math.round((top[1] / totalLife) * 100) : 0;
      findings.push(`主要ユーザー層は「${top[0]}」（${share}%）`);
    }

    const sortedFor = Array.from(cookingForCount.entries()).sort((a, b) => b[1] - a[1]);
    if (sortedFor.length > 0) {
      const totalFor = Array.from(cookingForCount.values()).reduce((a, b) => a + b, 0);
      const share = totalFor > 0 ? Math.round((sortedFor[0][1] / totalFor) * 100) : 0;
      findings.push(`主に「${sortedFor[0][0]}」向けに調理（${share}%）`);
    }
  }

  // サンプル投稿がない場合は取得
  if (samplePosts.length === 0) {
    samplePosts = await fetchSamplePosts(supabase, brandName, { limit: 3 });
  }

  if (findings.length === 0) {
    findings.push("ユーザー属性データが限られています");
  }

  return {
    title: "ペルソナ分析",
    question: `誰が「${brandName}」を使っているか？（k-meansクラスタリング）`,
    findings,
    dataTable,
    samplePosts: samplePosts.slice(0, 5),
    personas: personas.length > 0 ? personas : undefined,
  };
}

// Q3: 利用文脈（CEP）- エンゲージメント加重版
async function analyzeUsageContext(
  supabase: SupabaseClientType,
  brandName: string,
  brandId: number
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // SNS投稿からCEP別のエンゲージメントを集計
  const { data: cepPosts } = await supabase
    .from("sns_posts")
    .select("cep_name, engagement_total")
    .ilike("brand_mentions", `%${brandName}%`)
    .not("cep_name", "is", null)
    .limit(2000);

  const cepStats = new Map<string, { count: number; totalEng: number }>();
  if (cepPosts) {
    cepPosts.forEach((p: { cep_name: string; engagement_total: number }) => {
      if (p.cep_name && p.cep_name !== "unknown") {
        const existing = cepStats.get(p.cep_name) || { count: 0, totalEng: 0 };
        cepStats.set(p.cep_name, {
          count: existing.count + 1,
          totalEng: existing.totalEng + (p.engagement_total || 0),
        });
      }
    });
  }

  // エンゲージメント加重スコアで並べ替え
  const scoredCeps = Array.from(cepStats.entries())
    .map(([cepName, stats]) => {
      const avgEng = stats.count > 0 ? stats.totalEng / stats.count : 0;
      const score = stats.count * Math.log(avgEng + 1);
      return { cepName, count: stats.count, avgEng: Math.round(avgEng), score };
    })
    .sort((a, b) => b.score - a.score);

  if (scoredCeps.length > 0) {
    scoredCeps.slice(0, 8).forEach((row) => {
      dataTable.push({
        CEP: row.cepName,
        言及数: row.count,
        平均ENG: row.avgEng,
        スコア: row.score.toFixed(1),
      });
    });

    const top = scoredCeps[0];
    const totalCount = scoredCeps.reduce((sum, c) => sum + c.count, 0);
    const topShare = totalCount > 0 ? Math.round((top.count / totalCount) * 100) : 0;

    findings.push(`【主力CEP】「${top.cepName}」がスコア最高（${top.count}件, 平均ENG ${top.avgEng}）`);

    if (scoredCeps.length >= 2) {
      const second = scoredCeps[1];
      findings.push(`【次点】「${second.cepName}」（${second.count}件, 平均ENG ${second.avgEng}）`);
    }

    // 高エンゲージメントCEP（平均ENG上位）
    const highEngCeps = [...scoredCeps].sort((a, b) => b.avgEng - a.avgEng).slice(0, 3);
    if (highEngCeps[0].avgEng > 100) {
      findings.push(`【高反応シーン】${highEngCeps.slice(0, 2).map(c => `「${c.cepName}」(ENG ${c.avgEng})`).join("、")}`);
    }

    findings.push(`→ 施策: 「${top.cepName}」を中心にコンテンツ展開（シェア${topShare}%）`);
  } else {
    findings.push("CEPデータが限られています");
  }

  return {
    title: "利用文脈",
    question: `どんな場面で「${brandName}」が選ばれているか？`,
    findings,
    dataTable,
  };
}

// Q4: 競合関係 - CEP別シェア分析強化版
async function analyzeCompetition(
  supabase: SupabaseClientType,
  brandName: string,
  brandId: number,
  brandMap: Map<number, string>
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // 相関データ
  const { data: correlations } = await supabase
    .from("correlations")
    .select(`
      coefficient,
      brand_a:brands!correlations_brand_a_id_fkey(name),
      brand_b:brands!correlations_brand_b_id_fkey(name)
    `)
    .or(`brand_a_id.eq.${brandId},brand_b_id.eq.${brandId}`)
    .neq("coefficient", 1);

  // 共起データ
  const { data: cooccurrences } = await supabase
    .from("sns_cooccurrences")
    .select("brand_a_id, brand_b_id, cooccurrence_count")
    .or(`brand_a_id.eq.${brandId},brand_b_id.eq.${brandId}`);

  // CEP別シェア分析
  const { data: allCepPosts } = await supabase
    .from("sns_posts")
    .select("brand_mentions, cep_name")
    .not("cep_name", "is", null)
    .not("brand_mentions", "is", null)
    .limit(5000);

  // CEP別ブランドシェアを計算
  const cepBrandCounts = new Map<string, Map<string, number>>();
  if (allCepPosts) {
    allCepPosts.forEach((p: { brand_mentions: string; cep_name: string }) => {
      if (!p.cep_name || p.cep_name === "unknown") return;
      const brands = p.brand_mentions?.split(",").map(b => b.trim()) || [];
      brands.forEach(brand => {
        if (!cepBrandCounts.has(p.cep_name)) {
          cepBrandCounts.set(p.cep_name, new Map());
        }
        const brandCounts = cepBrandCounts.get(p.cep_name)!;
        brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
      });
    });
  }

  // 自ブランドのCEP別シェアと競合比較
  const cepPositioning: Array<{ cep: string; myShare: number; topCompetitor: string; competitorShare: number; position: string }> = [];
  cepBrandCounts.forEach((brandCounts, cep) => {
    const total = Array.from(brandCounts.values()).reduce((a, b) => a + b, 0);
    const myCount = brandCounts.get(brandName) || 0;
    const myShare = total > 0 ? (myCount / total) * 100 : 0;

    // 競合の最大シェアを見つける
    let topCompetitor = "";
    let competitorShare = 0;
    brandCounts.forEach((count, brand) => {
      if (brand !== brandName) {
        const share = total > 0 ? (count / total) * 100 : 0;
        if (share > competitorShare) {
          competitorShare = share;
          topCompetitor = brand;
        }
      }
    });

    if (myCount >= 3 || competitorShare > 0) {
      const position = myShare > competitorShare ? "リーダー" : myShare > competitorShare * 0.5 ? "チャレンジャー" : "フォロワー";
      cepPositioning.push({ cep, myShare, topCompetitor, competitorShare, position });
    }
  });

  // 従来の相関・共起分析
  const brandRelations = new Map<string, { correlation: number; cooccurrence: number }>();

  if (correlations) {
    correlations.forEach((row: { brand_a: { name: string }; brand_b: { name: string }; coefficient: number }) => {
      const brandA = row.brand_a?.name;
      const brandB = row.brand_b?.name;
      const other = brandA === brandName ? brandB : brandA;
      if (other && other !== brandName) {
        const existing = brandRelations.get(other) || { correlation: 0, cooccurrence: 0 };
        existing.correlation = row.coefficient;
        brandRelations.set(other, existing);
      }
    });
  }

  if (cooccurrences) {
    cooccurrences.forEach((row: { brand_a_id: number; brand_b_id: number; cooccurrence_count: number }) => {
      const otherId = row.brand_a_id === brandId ? row.brand_b_id : row.brand_a_id;
      const other = brandMap.get(otherId);
      if (other && other !== brandName) {
        const existing = brandRelations.get(other) || { correlation: 0, cooccurrence: 0 };
        existing.cooccurrence = row.cooccurrence_count;
        brandRelations.set(other, existing);
      }
    });
  }

  const sortedRelations = Array.from(brandRelations.entries())
    .sort((a, b) => Math.abs(b[1].correlation) - Math.abs(a[1].correlation));

  // CEP別ポジショニングテーブル
  const leaderCeps = cepPositioning.filter(c => c.position === "リーダー").sort((a, b) => b.myShare - a.myShare);
  const challengerCeps = cepPositioning.filter(c => c.position !== "リーダー").sort((a, b) => b.myShare - a.myShare);

  leaderCeps.slice(0, 3).forEach((c) => {
    dataTable.push({
      CEP: c.cep,
      自社シェア: `${c.myShare.toFixed(0)}%`,
      最大競合: `${c.topCompetitor}(${c.competitorShare.toFixed(0)}%)`,
      ポジション: "リーダー ✓",
    });
  });

  challengerCeps.slice(0, 3).forEach((c) => {
    dataTable.push({
      CEP: c.cep,
      自社シェア: `${c.myShare.toFixed(0)}%`,
      最大競合: `${c.topCompetitor}(${c.competitorShare.toFixed(0)}%)`,
      ポジション: c.position,
    });
  });

  // インサイト生成
  if (leaderCeps.length > 0) {
    findings.push(`【強みCEP】${leaderCeps.slice(0, 2).map(c => `「${c.cep}」(${c.myShare.toFixed(0)}%)`).join("、")}でトップ`);
  }

  if (challengerCeps.length > 0) {
    const gap = challengerCeps[0];
    const gapDiff = gap.competitorShare - gap.myShare;
    if (gapDiff > 10) {
      findings.push(`【奪取機会】「${gap.cep}」で${gap.topCompetitor}に${gapDiff.toFixed(0)}%差 → 差別化施策で逆転可能`);
    }
  }

  // 補完・競合関係
  const competitors = sortedRelations.filter(([, d]) => d.correlation < -0.1);
  const complements = sortedRelations.filter(([, d]) => d.correlation > 0.2);

  if (complements.length > 0) {
    findings.push(`【補完関係】${complements.slice(0, 2).map(([n]) => n).join("、")} → クロスセル施策有効`);
  }
  if (competitors.length > 0) {
    findings.push(`【競合関係】${competitors.slice(0, 2).map(([n]) => n).join("、")} → 差別化訴求が必要`);
  }

  if (findings.length === 0) {
    findings.push("明確な競合・補完関係は検出されませんでした");
  }

  return {
    title: "競合関係",
    question: `どのブランドと競合/補完関係にあるか？`,
    findings,
    dataTable,
  };
}

// Q5: DPT分析（Use Case×Positioning）
async function analyzeUniqueValue(
  supabase: SupabaseClientType,
  brandName: string
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];
  let samplePosts: SamplePost[] = [];

  // DPT APIを直接呼び出し（LLMでPOP/POD生成）
  try {
    const baseUrl = getBaseUrl();
    const dptRes = await fetch(
      `${baseUrl}/api/brands/${encodeURIComponent(brandName)}/dpt`,
      { cache: "no-store" }
    );
    if (dptRes.ok) {
      const dptData = await dptRes.json();
      if (dptData.useCases && dptData.useCases.length > 0) {
        findings.push(`【${dptData.useCases.length}つのUse Caseを特定】`);

        dptData.useCases.forEach((uc: {
          name: string;
          evidence: { postCount: number; samplePosts: string[] };
          context: { why: string; when: string; where: string; with_whom: string };
          positioning: { pop: string[]; pod: string[] };
        }, idx: number) => {
          // データテーブルに追加
          dataTable.push({
            "Use Case": uc.name,
            "投稿数": uc.evidence?.postCount || 0,
            "Why": uc.context?.why || "-",
            "POP（共通価値）": uc.positioning?.pop?.slice(0, 2).join("、") || "-",
            "POD（独自価値）": uc.positioning?.pod?.slice(0, 2).join("、") || "-",
          });

          // PODを findings に追加
          if (uc.positioning?.pod && uc.positioning.pod.length > 0) {
            findings.push(`「${uc.name}」での独自価値: ${uc.positioning.pod[0]}`);
          }

          // サンプル投稿を収集
          if (uc.evidence?.samplePosts) {
            uc.evidence.samplePosts.slice(0, 2).forEach((content: string) => {
              samplePosts.push({
                content: content.slice(0, 150) + (content.length > 150 ? "..." : ""),
              });
            });
          }
        });

        // PODのサマリー
        const allPODs = dptData.useCases
          .flatMap((uc: { positioning: { pod: string[] } }) => uc.positioning?.pod || [])
          .filter(Boolean);
        if (allPODs.length > 0) {
          findings.push(`→ 主要な差別化ポイント: ${[...new Set(allPODs)].slice(0, 3).join("、")}`);
        }
      }
    }
  } catch (e) {
    // DPT API失敗時はキャッシュにフォールバック
  }

  // APIが失敗した場合はキャッシュからフォールバック
  if (dataTable.length === 0) {
    const { data: dptCache } = await supabase
      .from("brand_dpt_cache")
      .select("dpt_data")
      .eq("brand_name", brandName)
      .single();

    if (dptCache?.dpt_data && Array.isArray(dptCache.dpt_data)) {
      dptCache.dpt_data.slice(0, 5).forEach((row: { useCase?: string; pop?: string; pod?: string }) => {
        dataTable.push({
          "Use Case": row.useCase || "-",
          "POP（共通価値）": row.pop || "-",
          "POD（独自価値）": row.pod || "-",
        });
        if (row.pod && row.pod !== "-") {
          findings.push(`「${row.useCase}」での独自価値: ${row.pod}`);
        }
      });
    }
  }

  if (findings.length === 0) {
    findings.push("DPT分析データを生成中です（Analyticsタブで確認可能）");
  }

  return {
    title: "DPT分析（Use Case×Positioning）",
    question: `どのような場面で、何が差別化価値となっているか？`,
    findings: findings.slice(0, 8),
    dataTable,
    samplePosts: samplePosts.slice(0, 5),
  };
}

// Q6: 弱み/リスク
async function analyzeRisks(
  supabase: SupabaseClientType,
  brandName: string,
  brandId: number
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // ネガティブ投稿を取得
  const { data: negativePosts } = await supabase
    .from("sns_posts")
    .select("content, engagement_total, published, url")
    .ilike("brand_mentions", `%${brandName}%`)
    .eq("sentiment", "negative")
    .order("engagement_total", { ascending: false })
    .limit(100);

  // ネガティブキーワード分析
  const negativeKeywords: Record<string, number> = {};
  const patterns = ["まずい", "高い", "体に悪い", "添加物", "塩分", "化学調味料", "使いにくい", "開けにくい"];

  if (negativePosts) {
    negativePosts.forEach((post: { content: string }) => {
      if (post.content) {
        patterns.forEach((kw) => {
          if (post.content.includes(kw)) {
            negativeKeywords[kw] = (negativeKeywords[kw] || 0) + 1;
          }
        });
      }
    });
  }

  const sorted = Object.entries(negativeKeywords).sort((a, b) => b[1] - a[1]);
  sorted.slice(0, 5).forEach(([kw, count]) => {
    dataTable.push({
      要因: kw,
      件数: count,
      対策: getCountermeasure(kw),
    });
  });

  if (sorted.length > 0) {
    findings.push(`主なネガティブ要因: ${sorted.slice(0, 3).map(([kw, cnt]) => `${kw}(${cnt}件)`).join("、")}`);
  }

  // センチメント
  const { data: sentiment } = await supabase
    .from("sns_sentiments")
    .select("negative_rate, negative_count")
    .eq("brand_id", brandId)
    .single();

  if (sentiment && sentiment.negative_rate > 10) {
    findings.push(`ネガティブ率${sentiment.negative_rate.toFixed(1)}%で要注意`);
  }

  if (findings.length === 0) {
    findings.push("顕著なネガティブ要因は検出されませんでした");
  }

  // ネガティブ投稿原文を追加
  const samplePosts: SamplePost[] = negativePosts
    ?.slice(0, 5)
    .map((p: { content: string; engagement_total: number; published: string; url: string }) => ({
      content: p.content?.slice(0, 150) + (p.content?.length > 150 ? "..." : ""),
      sentiment: "negative" as const,
      engagement: p.engagement_total || 0,
      date: p.published ? new Date(p.published).toLocaleDateString("ja-JP") : undefined,
      url: p.url,
    })) || [];

  return {
    title: "弱み/リスク",
    question: `ネガティブ評価の原因は？`,
    findings,
    dataTable,
    samplePosts,
  };
}

function getCountermeasure(keyword: string): string {
  const measures: Record<string, string> = {
    "まずい": "レシピ訴求",
    "高い": "コスパ訴求",
    "体に悪い": "安全性訴求",
    "添加物": "原材料訴求",
    "塩分": "減塩訴求",
    "化学調味料": "天然由来訴求",
    "使いにくい": "パッケージ改善",
    "開けにくい": "パッケージ改善",
  };
  return measures[keyword] || "-";
}

// Q7: 成長機会
async function analyzeGrowthOpportunity(
  supabase: SupabaseClientType,
  brandName: string,
  brandId: number
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // 自ブランドのCEPスコア
  const { data: myCeps } = await supabase
    .from("brand_ceps")
    .select(`
      potential_score,
      ceps(cep_name)
    `)
    .eq("brand_id", brandId);

  // 全ブランドのCEPスコアを取得
  const { data: allCeps } = await supabase
    .from("brand_ceps")
    .select(`
      potential_score,
      brand_id,
      ceps(cep_name)
    `);

  // 自ブランドが弱いが他ブランドが強いCEPを探す
  const myCepScores = new Map<string, number>();
  if (myCeps) {
    myCeps.forEach((row: { ceps: { cep_name: string }; potential_score: number }) => {
      if (row.ceps?.cep_name) {
        myCepScores.set(row.ceps.cep_name, row.potential_score);
      }
    });
  }

  const cepMaxScores = new Map<string, { score: number; brand: string }>();
  if (allCeps) {
    allCeps.forEach((row: { ceps: { cep_name: string }; potential_score: number; brand_id: number }) => {
      const cepName = row.ceps?.cep_name;
      if (cepName && row.brand_id !== brandId) {
        const current = cepMaxScores.get(cepName);
        if (!current || row.potential_score > current.score) {
          cepMaxScores.set(cepName, { score: row.potential_score, brand: `brand_${row.brand_id}` });
        }
      }
    });
  }

  const opportunities: Array<{ cep: string; myScore: number; maxScore: number; gap: number }> = [];

  cepMaxScores.forEach(({ score }, cepName) => {
    const myScore = myCepScores.get(cepName) || 0;
    if (myScore < 1.0 && score > 1.5) {
      opportunities.push({
        cep: cepName,
        myScore,
        maxScore: score,
        gap: score - myScore,
      });
    }
  });

  opportunities.sort((a, b) => b.gap - a.gap);

  opportunities.slice(0, 5).forEach((opp) => {
    dataTable.push({
      未開拓CEP: opp.cep,
      自社スコア: opp.myScore.toFixed(2),
      市場最高: opp.maxScore.toFixed(2),
      ポテンシャル: "高",
    });
  });

  if (opportunities.length > 0) {
    findings.push(`伸びしろCEP: ${opportunities.slice(0, 3).map((o) => `「${o.cep}」`).join("、")}`);
    findings.push(`${opportunities.length}件の未開拓CEPを発見`);
  } else {
    findings.push("主要CEPは概ねカバーしています");
  }

  return {
    title: "成長機会",
    question: `伸ばせる余地はどこか？`,
    findings,
    dataTable,
  };
}

// Q8: 季節戦略
async function analyzeSeasonalStrategy(
  supabase: SupabaseClientType,
  brandName: string,
  brandId: number
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  const { data: seasonality } = await supabase
    .from("seasonality")
    .select("month, avg_score")
    .eq("brand_id", brandId)
    .order("month");

  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  if (seasonality && seasonality.length > 0) {
    let peak = { month: 0, score: -Infinity };
    let low = { month: 0, score: Infinity };

    seasonality.forEach((row: { month: number; avg_score: number }) => {
      if (row.avg_score > peak.score) {
        peak = { month: row.month, score: row.avg_score };
      }
      if (row.avg_score < low.score) {
        low = { month: row.month, score: row.avg_score };
      }

      dataTable.push({
        月: monthNames[row.month - 1],
        スコア: Math.round(row.avg_score),
        施策: getSuggestedAction(brandName, row.month, row.avg_score, peak.score),
      });
    });

    findings.push(`ピーク月: ${monthNames[peak.month - 1]}（スコア${Math.round(peak.score)}）`);
    findings.push(`閑散期: ${monthNames[low.month - 1]}（スコア${Math.round(low.score)}）`);
    findings.push(`振れ幅: ${Math.round(peak.score - low.score)}pt`);

    // アクション提案
    const peakAction = getSeasonalAction(brandName, peak.month);
    const lowAction = getSeasonalAction(brandName, low.month);
    findings.push(`→ ${monthNames[peak.month - 1]}施策: ${peakAction}`);
    findings.push(`→ ${monthNames[low.month - 1]}施策: ${lowAction}（テコ入れ）`);
  } else {
    findings.push("季節データが限られています");
  }

  return {
    title: "季節戦略",
    question: `いつ強化すべきか？`,
    findings,
    dataTable,
  };
}

function getSuggestedAction(brandName: string, month: number, score: number, peakScore: number): string {
  if (score >= peakScore * 0.9) return "集中投下";
  if (score >= peakScore * 0.7) return "維持";
  return "テコ入れ";
}

function getSeasonalAction(brandName: string, month: number): string {
  const monthActions: Record<number, string> = {
    1: "正月料理・七草粥訴求",
    2: "バレンタイン料理訴求",
    3: "ひな祭り・卒業祝い訴求",
    4: "新生活応援・お弁当訴求",
    5: "GW・母の日料理訴求",
    6: "梅雨のさっぱり料理訴求",
    7: "夏バテ対策・冷やし料理訴求",
    8: "お盆・夏休み料理訴求",
    9: "敬老の日・秋の味覚訴求",
    10: "ハロウィン・秋の煮込み訴求",
    11: "鍋シーズン開始訴求",
    12: "年末・クリスマス料理訴求",
  };
  return monthActions[month] || "季節感のある料理訴求";
}

// Q9: コンテンツ戦略
async function analyzeContentStrategy(
  supabase: SupabaseClientType,
  brandName: string
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // エンゲージメントの高い投稿パターンを分析
  const { data: posts } = await supabase
    .from("sns_posts")
    .select("cooking_for, dish_category, meal_occasion, engagement_total, likes_count, retweets_count, content, published, url, sentiment")
    .ilike("brand_mentions", `%${brandName}%`)
    .order("engagement_total", { ascending: false })
    .limit(500);

  const patternStats = new Map<string, { total: number; count: number; avgLikes: number; avgRTs: number }>();
  const dishStats = new Map<string, { total: number; count: number }>();

  if (posts) {
    posts.forEach((p: { cooking_for: string; dish_category: string; meal_occasion: string; engagement_total: number; likes_count: number; retweets_count: number }) => {
      // cooking_for 別集計
      if (p.cooking_for) {
        const stats = patternStats.get(p.cooking_for) || { total: 0, count: 0, avgLikes: 0, avgRTs: 0 };
        stats.total += p.engagement_total || 0;
        stats.count++;
        stats.avgLikes += p.likes_count || 0;
        stats.avgRTs += p.retweets_count || 0;
        patternStats.set(p.cooking_for, stats);
      }
      // dish_category 別集計
      if (p.dish_category) {
        const stats = dishStats.get(p.dish_category) || { total: 0, count: 0 };
        stats.total += p.engagement_total || 0;
        stats.count++;
        dishStats.set(p.dish_category, stats);
      }
    });
  }

  const avgAll = posts && posts.length > 0
    ? posts.reduce((sum: number, p: { engagement_total: number }) => sum + (p.engagement_total || 0), 0) / posts.length
    : 0;

  // cooking_for パターン（最低2件で分析）
  const sorted = Array.from(patternStats.entries())
    .map(([pattern, stats]) => ({
      pattern,
      avg: stats.count > 0 ? stats.total / stats.count : 0,
      count: stats.count,
      avgLikes: Math.round(stats.avgLikes / stats.count),
      avgRTs: Math.round(stats.avgRTs / stats.count),
    }))
    .filter((s) => s.count >= 2)
    .sort((a, b) => b.avg - a.avg);

  sorted.slice(0, 5).forEach((s) => {
    const ratio = avgAll > 0 ? (s.avg / avgAll).toFixed(1) : "-";
    dataTable.push({
      タイプ: s.pattern,
      平均ENG: Math.round(s.avg),
      対平均比: `${ratio}x`,
      投稿数: s.count,
    });
  });

  // dish_category でエンゲージメントが高いもの
  const sortedDish = Array.from(dishStats.entries())
    .map(([dish, stats]) => ({ dish, avg: stats.count > 0 ? stats.total / stats.count : 0, count: stats.count }))
    .filter((s) => s.count >= 2)
    .sort((a, b) => b.avg - a.avg);

  if (sorted.length > 0 && avgAll > 0) {
    const best = sorted[0];
    const ratio = (best.avg / avgAll).toFixed(1);
    findings.push(`最もエンゲージメントが高いのは「${best.pattern}」投稿（${ratio}倍）`);

    const goodPatterns = sorted.filter((s) => s.avg > avgAll * 1.2);
    if (goodPatterns.length > 1) {
      findings.push(`高反応パターン: ${goodPatterns.slice(0, 3).map((s) => s.pattern).join("、")}`);
    }
  }

  if (sortedDish.length > 0 && avgAll > 0) {
    const bestDish = sortedDish[0];
    const ratio = (bestDish.avg / avgAll).toFixed(1);
    findings.push(`料理カテゴリでは「${bestDish.dish}」が高反応（${ratio}倍）`);
  }

  if (findings.length === 0) {
    if (posts && posts.length > 0) {
      findings.push(`${posts.length}件の投稿を分析中`);
    } else {
      findings.push("コンテンツパターン分析中です");
    }
  }

  // 高エンゲージメント投稿原文を追加
  const samplePosts: SamplePost[] = posts
    ?.slice(0, 5)
    .map((p: { content: string; engagement_total: number; published: string; url: string; sentiment: string }) => ({
      content: p.content?.slice(0, 150) + (p.content?.length > 150 ? "..." : ""),
      sentiment: (p.sentiment as "positive" | "neutral" | "negative") || undefined,
      engagement: p.engagement_total || 0,
      date: p.published ? new Date(p.published).toLocaleDateString("ja-JP") : undefined,
      url: p.url,
    })) || [];

  return {
    title: "コンテンツ戦略",
    question: `どんな投稿が響くか？`,
    findings,
    dataTable,
    samplePosts,
  };
}

// Q10: 検索対策
async function analyzeSearchStrategy(
  supabase: SupabaseClientType,
  brandName: string,
  brandId: number,
  brandMap: Map<number, string>
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  const { data: keywords } = await supabase
    .from("related_keywords")
    .select("keyword, search_volume")
    .eq("brand_id", brandId)
    .order("search_volume", { ascending: false })
    .limit(15);

  if (keywords && keywords.length > 0) {
    const negativeKWs = ["危険", "体に悪い", "害", "添加物", "化学"];
    const recipeKWs = ["レシピ", "作り方", "使い方"];

    let hasNegative = false;
    let hasRecipe = false;

    keywords.forEach((kw: { keyword: string; search_volume: number }) => {
      const intent = categorizeIntent(kw.keyword, negativeKWs, recipeKWs);
      dataTable.push({
        キーワード: kw.keyword,
        検索ボリューム: kw.search_volume || "-",
        意図: intent,
      });

      if (negativeKWs.some((neg) => kw.keyword.includes(neg))) {
        hasNegative = true;
      }
      if (recipeKWs.some((rec) => kw.keyword.includes(rec))) {
        hasRecipe = true;
      }
    });

    findings.push(`関連キーワード${keywords.length}件を検出`);

    if (hasRecipe) {
      findings.push("レシピ・使い方系の検索が多い（活用法訴求が有効）");
    }
    if (hasNegative) {
      findings.push("不安系キーワードあり（安全性・品質訴求が必要）");
    }
  } else {
    findings.push("関連キーワードデータが限られています");
  }

  return {
    title: "検索対策",
    question: `ユーザーは何を知りたいか？`,
    findings,
    dataTable,
  };
}

function categorizeIntent(keyword: string, negativeKWs: string[], recipeKWs: string[]): string {
  if (negativeKWs.some((neg) => keyword.includes(neg))) return "不安系";
  if (recipeKWs.some((rec) => keyword.includes(rec))) return "活用法";
  if (keyword.includes("代用") || keyword.includes("違い")) return "比較";
  if (keyword.includes("値段") || keyword.includes("安い")) return "価格";
  return "一般";
}

// Q11: 代表メニュー - エンゲージメント加重版
async function analyzeSignatureDishes(
  supabase: SupabaseClientType,
  brandName: string
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // brand_mentions で検索
  const { data: posts } = await supabase
    .from("sns_posts")
    .select("dish_category, dish_name, meal_occasion, content, engagement_total, published, url, sentiment")
    .ilike("brand_mentions", `%${brandName}%`)
    .order("engagement_total", { ascending: false })
    .limit(1000);

  const dishStats = new Map<string, { count: number; totalEng: number }>();
  const dishNameStats = new Map<string, { count: number; totalEng: number }>();
  const occasionStats = new Map<string, { count: number; totalEng: number }>();

  if (posts) {
    posts.forEach((p: { dish_category: string; dish_name?: string; meal_occasion?: string; engagement_total: number }) => {
      const eng = p.engagement_total || 0;
      if (p.dish_category && p.dish_category !== "unknown") {
        const existing = dishStats.get(p.dish_category) || { count: 0, totalEng: 0 };
        dishStats.set(p.dish_category, { count: existing.count + 1, totalEng: existing.totalEng + eng });
      }
      if (p.dish_name && p.dish_name !== "unknown") {
        const existing = dishNameStats.get(p.dish_name) || { count: 0, totalEng: 0 };
        dishNameStats.set(p.dish_name, { count: existing.count + 1, totalEng: existing.totalEng + eng });
      }
      if (p.meal_occasion && p.meal_occasion !== "unknown") {
        const existing = occasionStats.get(p.meal_occasion) || { count: 0, totalEng: 0 };
        occasionStats.set(p.meal_occasion, { count: existing.count + 1, totalEng: existing.totalEng + eng });
      }
    });
  }

  // エンゲージメント加重スコアで並べ替え
  const scoredDishes = Array.from(dishStats.entries())
    .map(([dish, stats]) => {
      const avgEng = stats.count > 0 ? stats.totalEng / stats.count : 0;
      const score = stats.count * Math.log(avgEng + 1);
      return { dish, count: stats.count, avgEng: Math.round(avgEng), score };
    })
    .filter(x => x.count >= 2)
    .sort((a, b) => b.score - a.score);

  const totalCount = scoredDishes.reduce((sum, d) => sum + d.count, 0);

  scoredDishes.slice(0, 5).forEach((row) => {
    const share = totalCount > 0 ? Math.round((row.count / totalCount) * 100) : 0;
    dataTable.push({
      料理カテゴリ: row.dish,
      投稿数: row.count,
      平均ENG: row.avgEng,
      シェア: `${share}%`,
    });
  });

  if (scoredDishes.length > 0) {
    const top = scoredDishes[0];
    const topShare = totalCount > 0 ? Math.round((top.count / totalCount) * 100) : 0;
    findings.push(`【定番料理】「${top.dish}」が最多（${topShare}%、平均ENG ${top.avgEng}）`);

    // 高エンゲージメント料理（平均ENG上位）
    const highEngDishes = [...scoredDishes].sort((a, b) => b.avgEng - a.avgEng).slice(0, 3);
    if (highEngDishes[0].avgEng > 100) {
      findings.push(`【高反応メニュー】${highEngDishes.slice(0, 2).map(d => `「${d.dish}」(ENG ${d.avgEng})`).join("、")}`);
    }
  }

  // 具体的な料理名（エンゲージメント加重）
  const scoredNames = Array.from(dishNameStats.entries())
    .map(([name, stats]) => {
      const avgEng = stats.count > 0 ? stats.totalEng / stats.count : 0;
      return { name, count: stats.count, avgEng: Math.round(avgEng) };
    })
    .filter(x => x.count >= 2)
    .sort((a, b) => b.avgEng - a.avgEng);

  if (scoredNames.length > 0) {
    findings.push(`【人気メニュー】${scoredNames.slice(0, 3).map((n) => n.name).join("、")}`);
  }

  // 食事シーン
  const scoredOccasions = Array.from(occasionStats.entries())
    .map(([occasion, stats]) => {
      const avgEng = stats.count > 0 ? stats.totalEng / stats.count : 0;
      return { occasion, count: stats.count, avgEng: Math.round(avgEng) };
    })
    .sort((a, b) => b.avgEng - a.avgEng);

  if (scoredOccasions.length > 0) {
    findings.push(`【食事シーン】${scoredOccasions.slice(0, 3).map((o) => o.occasion).join("、")}`);
  }

  if (findings.length === 0) {
    findings.push("料理データが限られています");
  }

  // 代表投稿原文を追加（料理関連の高ENG投稿）
  const samplePosts: SamplePost[] = posts
    ?.filter((p: { dish_name: string | null }) => p.dish_name)
    .slice(0, 5)
    .map((p: { content: string; engagement_total: number; published: string; url: string; sentiment: string }) => ({
      content: p.content?.slice(0, 150) + (p.content?.length > 150 ? "..." : ""),
      sentiment: (p.sentiment as "positive" | "neutral" | "negative") || undefined,
      engagement: p.engagement_total || 0,
      date: p.published ? new Date(p.published).toLocaleDateString("ja-JP") : undefined,
      url: p.url,
    })) || [];

  return {
    title: "代表メニュー",
    question: `このブランドの定番料理は？`,
    findings,
    dataTable,
    samplePosts,
  };
}

// Q12: W's詳細分析（いつ・どこで・誰と・なぜ）
async function analyzeWsDetail(
  supabase: SupabaseClientType,
  brandName: string
): Promise<IssueSection> {
  const findings: string[] = [];
  const dataTable: Array<Record<string, string | number>> = [];

  // W's詳細データを取得
  const { data: posts } = await supabase
    .from("sns_posts")
    .select("meal_occasion, cooking_for, motivation_category, with_whom, content, engagement_total, published, url, sentiment")
    .ilike("brand_mentions", `%${brandName}%`)
    .order("engagement_total", { ascending: false })
    .limit(1000);

  const occasionCount = new Map<string, number>();
  const cookingForCount = new Map<string, number>();
  const motivationCount = new Map<string, number>();
  const withWhomCount = new Map<string, number>();

  if (posts) {
    posts.forEach((p: { meal_occasion: string; cooking_for: string; motivation_category: string; with_whom: string }) => {
      if (p.meal_occasion && p.meal_occasion !== "unknown") {
        occasionCount.set(p.meal_occasion, (occasionCount.get(p.meal_occasion) || 0) + 1);
      }
      if (p.cooking_for && p.cooking_for !== "unknown") {
        cookingForCount.set(p.cooking_for, (cookingForCount.get(p.cooking_for) || 0) + 1);
      }
      if (p.motivation_category && p.motivation_category !== "unknown") {
        motivationCount.set(p.motivation_category, (motivationCount.get(p.motivation_category) || 0) + 1);
      }
      if (p.with_whom && p.with_whom !== "unknown") {
        withWhomCount.set(p.with_whom, (withWhomCount.get(p.with_whom) || 0) + 1);
      }
    });
  }

  // 食事シーン（When）
  const sortedOccasion = Array.from(occasionCount.entries()).sort((a, b) => b[1] - a[1]);
  const totalOccasion = Array.from(occasionCount.values()).reduce((a, b) => a + b, 0);

  sortedOccasion.slice(0, 3).forEach(([occasion, count]) => {
    const share = totalOccasion > 0 ? Math.round((count / totalOccasion) * 100) : 0;
    dataTable.push({
      次元: "When（いつ）",
      値: occasion,
      件数: count,
      シェア: `${share}%`,
    });
  });

  // 誰向け（Who For）
  const sortedFor = Array.from(cookingForCount.entries()).sort((a, b) => b[1] - a[1]);
  const totalFor = Array.from(cookingForCount.values()).reduce((a, b) => a + b, 0);

  sortedFor.slice(0, 3).forEach(([target, count]) => {
    const share = totalFor > 0 ? Math.round((count / totalFor) * 100) : 0;
    dataTable.push({
      次元: "Who For（誰向け）",
      値: target,
      件数: count,
      シェア: `${share}%`,
    });
  });

  // 動機（Why）
  const sortedMotivation = Array.from(motivationCount.entries()).sort((a, b) => b[1] - a[1]);
  const totalMotivation = Array.from(motivationCount.values()).reduce((a, b) => a + b, 0);

  sortedMotivation.slice(0, 3).forEach(([motivation, count]) => {
    const share = totalMotivation > 0 ? Math.round((count / totalMotivation) * 100) : 0;
    dataTable.push({
      次元: "Why（なぜ）",
      値: motivation,
      件数: count,
      シェア: `${share}%`,
    });
  });

  // 誰と（With Whom）
  const sortedWith = Array.from(withWhomCount.entries()).sort((a, b) => b[1] - a[1]);
  const totalWith = Array.from(withWhomCount.values()).reduce((a, b) => a + b, 0);

  sortedWith.slice(0, 2).forEach(([whom, count]) => {
    const share = totalWith > 0 ? Math.round((count / totalWith) * 100) : 0;
    dataTable.push({
      次元: "With Whom（誰と）",
      値: whom,
      件数: count,
      シェア: `${share}%`,
    });
  });

  // W'sの組み合わせでエンゲージメント最大のパターンを探す
  const wsPatterns: Array<{ pattern: string; count: number; avgEng: number }> = [];
  const patternMap = new Map<string, { count: number; totalEng: number }>();

  if (posts) {
    posts.forEach((p: { meal_occasion: string; cooking_for: string; motivation_category: string; engagement_total: number }) => {
      if (p.meal_occasion && p.cooking_for && p.meal_occasion !== "unknown" && p.cooking_for !== "unknown") {
        const pattern = `${p.meal_occasion} × ${p.cooking_for}`;
        const existing = patternMap.get(pattern) || { count: 0, totalEng: 0 };
        patternMap.set(pattern, {
          count: existing.count + 1,
          totalEng: existing.totalEng + (p.engagement_total || 0),
        });
      }
    });
  }

  const scoredPatterns = Array.from(patternMap.entries())
    .map(([pattern, stats]) => ({
      pattern,
      count: stats.count,
      avgEng: stats.count > 0 ? Math.round(stats.totalEng / stats.count) : 0,
    }))
    .filter(p => p.count >= 3)
    .sort((a, b) => b.avgEng - a.avgEng);

  // インサイト形式で発見事項を生成
  if (scoredPatterns.length > 0) {
    const best = scoredPatterns[0];
    findings.push(`【勝ちパターン】「${best.pattern}」が最高ENG（平均${best.avgEng}、${best.count}件）`);
  }

  if (sortedOccasion.length > 0) {
    const topOcc = sortedOccasion[0];
    const occShare = totalOccasion > 0 ? Math.round((topOcc[1] / totalOccasion) * 100) : 0;
    findings.push(`【When】${topOcc[0]}（${occShare}%）が主戦場`);
  }
  if (sortedFor.length > 0) {
    const topFor = sortedFor[0];
    const forShare = totalFor > 0 ? Math.round((topFor[1] / totalFor) * 100) : 0;
    findings.push(`【Who For】${topFor[0]}（${forShare}%）向けが中心`);
  }
  if (sortedMotivation.length > 0) {
    const topMot = sortedMotivation[0];
    const motShare = totalMotivation > 0 ? Math.round((topMot[1] / totalMotivation) * 100) : 0;
    findings.push(`【Why】「${topMot[0]}」（${motShare}%）が主動機`);
  }

  // アクション提案
  if (sortedOccasion.length > 0 && sortedFor.length > 0 && sortedMotivation.length > 0) {
    const topOccasion = sortedOccasion[0][0];
    const topFor = sortedFor[0][0];
    const topMotivation = sortedMotivation[0][0];
    findings.push(`→ 施策提案: 「${topFor}」向けに「${topOccasion}」で「${topMotivation}」を訴求`);
  }

  if (findings.length === 0) {
    findings.push("W's詳細データが限られています");
  }

  // サンプル投稿を取得
  const samplePosts: SamplePost[] = posts
    ?.filter((p: { meal_occasion: string | null; motivation_category: string | null }) => p.meal_occasion || p.motivation_category)
    .slice(0, 5)
    .map((p: { content: string; engagement_total: number; published: string; url: string; sentiment: string }) => ({
      content: p.content?.slice(0, 150) + (p.content?.length > 150 ? "..." : ""),
      sentiment: (p.sentiment as "positive" | "neutral" | "negative") || undefined,
      engagement: p.engagement_total || 0,
      date: p.published ? new Date(p.published).toLocaleDateString("ja-JP") : undefined,
      url: p.url,
    })) || [];

  return {
    title: "W's詳細分析",
    question: `いつ・どこで・誰のために・なぜ使われているか？`,
    findings,
    dataTable,
    samplePosts,
  };
}

// LLMで戦略示唆を生成
async function generateStrategyInsights(
  brandName: string,
  sections: IssueSection[],
  crossAnalysis?: CrossAnalysisResult,
  topPosts?: SamplePost[]
): Promise<{ findings: string[]; recommendations: string[]; keyInsight: string }> {
  const openai = getOpenAIClient();

  const defaultInsights = {
    findings: ["データに基づく分析完了", "複数のパターンを検出", "追加調査を推奨"],
    recommendations: ["定期的なモニタリング", "データ収集の継続", "仮説検証の実施"],
    keyInsight: `${brandName}のブランド分析が完了しました`,
  };

  if (!openai) {
    return defaultInsights;
  }

  // セクションからペルソナ・DPT・W's詳細を抽出
  const personaSection = sections.find((s) => s.title === "ペルソナ分析");
  const dptSection = sections.find((s) => s.title === "DPT分析（Use Case×Positioning）");
  const wsSection = sections.find((s) => s.title === "W's詳細分析");
  const healthSection = sections.find((s) => s.title === "ブランド健康度");

  // クロス分析結果をフォーマット
  const crossAnalysisSection = crossAnalysis ? `
## クロス分析結果（エンゲージメント加重）

### 勝ちパターン: ペルソナ × 利用シーン
${crossAnalysis.personaCEP.slice(0, 5).map((x) => `- 「${x.persona}」×「${x.cep}」: ${x.count}件、平均ENG ${x.avgEng}、スコア ${x.score.toFixed(1)}`).join("\n") || "- データなし"}

### 勝ちパターン: ペルソナ × 料理
${crossAnalysis.personaDish.slice(0, 5).map((x) => `- 「${x.persona}」×「${x.dish}」: ${x.count}件、平均ENG ${x.avgEng}、スコア ${x.score.toFixed(1)}`).join("\n") || "- データなし"}

### 勝ちパターン: 利用シーン × 料理
${crossAnalysis.cepDish.slice(0, 5).map((x) => `- 「${x.cep}」×「${x.dish}」: ${x.count}件、平均ENG ${x.avgEng}、スコア ${x.score.toFixed(1)}`).join("\n") || "- データなし"}

### 最強の3軸組み合わせ（ペルソナ × シーン × 料理）
${crossAnalysis.topCombinations.slice(0, 3).map((x, i) => `${i + 1}. 「${x.persona}」×「${x.cep}」×「${x.dish}」: ${x.count}件、平均ENG ${x.avgEng}、スコア ${x.score.toFixed(1)}`).join("\n") || "- データなし"}
` : "";

  // 高エンゲージメント投稿
  const topPostsSection = topPosts && topPosts.length > 0 ? `
## 高エンゲージメント投稿（生の声）
${topPosts.slice(0, 5).map((p, i) => `${i + 1}. "${p.content}" (ENG: ${p.engagement || 0})`).join("\n")}
` : "";

  // 競合分析セクション
  const competitionSection = sections.find((s) => s.title === "競合関係");

  const userPrompt = `
ブランド: ${brandName}

## 重要KPI
${healthSection ? healthSection.findings.slice(0, 3).map((f) => `- ${f}`).join("\n") : "- データなし"}

## ペルソナ分析（k-meansクラスタリング結果）
${personaSection ? personaSection.findings.map((f) => `- ${f}`).join("\n") : "- データなし"}
${personaSection?.personas ? `
### 特定されたペルソナ
${personaSection.personas.map((p) => `- ${p.name}（シェア${p.sharePercentage.toFixed(0)}%、投稿${p.postCount}件）: ${p.description}`).join("\n")}
` : ""}

## DPT分析（Use Case×Positioning）
${dptSection ? dptSection.findings.map((f) => `- ${f}`).join("\n") : "- データなし"}
${dptSection?.dataTable ? `
### Use Case詳細
${dptSection.dataTable.slice(0, 5).map((row) => `- ${row["Use Case"]}: POP=${row["POP（共通価値）"]}, POD=${row["POD（独自価値）"]}`).join("\n")}
` : ""}

## W's詳細分析（いつ・誰のために・なぜ・誰と）
${wsSection ? wsSection.findings.map((f) => `- ${f}`).join("\n") : "- データなし"}
${crossAnalysisSection}
## 競合ポジショニング
${competitionSection ? competitionSection.findings.map((f) => `- ${f}`).join("\n") : "- データなし"}
${competitionSection?.dataTable ? `
### 詳細
${competitionSection.dataTable.slice(0, 5).map((row) => `- ${row["ブランド"]}: 相関${row["相関"]}, 共起${row["共起数"]}件, ${row["関係性"]}`).join("\n")}
` : ""}
${topPostsSection}
## その他の分析結果
${sections
  .filter((s) => !["ペルソナ分析", "DPT分析（Use Case×Positioning）", "W's詳細分析", "ブランド健康度", "競合関係"].includes(s.title))
  .slice(0, 4)
  .map((s) => `
### ${s.title}
${s.findings.slice(0, 2).map((f) => `- ${f}`).join("\n")}
`).join("\n")}

上記データに基づき、以下の観点で戦略示唆を生成してください：
1. **最優先ターゲット**: クロス分析で発見した「勝ちパターン」を活用（ペルソナ×シーン×料理）
2. **具体的な施策案**: 必ず「誰に×いつ×何を」の形式で3つ提案
3. **競合との差別化**: 補完・競合関係を踏まえた明確なポジショニング
4. **高ENGコンテンツ**: エンゲージメントが高い投稿パターンの特徴を活用`;

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
  brandName: string,
  sections: IssueSection[],
  strategy: { findings: string[]; recommendations: string[]; keyInsight: string }
): string {
  let markdown = `# ${brandName} ブランド分析レポート

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
