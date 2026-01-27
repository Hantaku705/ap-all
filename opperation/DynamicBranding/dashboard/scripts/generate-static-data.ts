/**
 * 静的データ生成スクリプト
 *
 * 全APIエンドポイントのデータをSupabaseから取得し、
 * output/ に静的JSONファイルとして保存
 *
 * 実行方法:
 * npx tsx scripts/generate-static-data.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

// Load .env.local from dashboard directory
config({ path: path.join(__dirname, "..", ".env.local") });

// 環境変数チェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase credentials required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 出力ディレクトリ
const OUTPUT_DIR = path.join(process.cwd(), "output");

// ブランド定義
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

// ユーティリティ: ディレクトリ作成
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ユーティリティ: JSON保存
function saveJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  ✓ ${filePath}`);
}

// ユーティリティ: ページネーション付きデータ取得
async function fetchAllWithPagination<T>(
  tableName: string,
  selectQuery: string,
  orderBy?: { column: string; ascending: boolean }
): Promise<T[]> {
  const PAGE_SIZE = 1000;
  let offset = 0;
  let hasMore = true;
  const allData: T[] = [];

  while (hasMore) {
    let query = supabase
      .from(tableName)
      .select(selectQuery)
      .range(offset, offset + PAGE_SIZE - 1);

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending });
    }

    const { data, error } = await query;

    if (error) {
      console.error(`  Error fetching ${tableName}:`, error.message);
      break;
    }

    if (data && data.length > 0) {
      allData.push(...(data as T[]));
      offset += PAGE_SIZE;
    }

    hasMore = data !== null && data.length === PAGE_SIZE;
  }

  return allData;
}

// ===================
// 1. Google Trends
// ===================
async function generateTrendsData() {
  console.log("\n[1/10] Generating trends data...");

  const data = await fetchAllWithPagination<{
    week_start: string;
    score: number;
    brands: { name: string; color: string } | null;
  }>("weekly_trends", "week_start, score, brands(name, color)", {
    column: "week_start",
    ascending: true,
  });

  // ピボット変換
  const pivotedData: Record<string, Record<string, number | string>> = {};
  data.forEach((row) => {
    const date = row.week_start;
    const brand = row.brands?.name;
    const score = row.score;

    if (!pivotedData[date]) {
      pivotedData[date] = { date };
    }
    if (brand && score !== null) {
      pivotedData[date][brand] = score;
    }
  });

  const result = Object.values(pivotedData);
  ensureDir(path.join(OUTPUT_DIR, "trends"));
  saveJson(path.join(OUTPUT_DIR, "trends", "google.json"), result);
}

// ===================
// 2. SNS Trends
// ===================
async function generateSnsTrendsData() {
  console.log("\n[2/10] Generating SNS trends data...");

  const data = await fetchAllWithPagination<{
    week_start: string;
    mention_count: number;
    brands: { name: string } | null;
  }>("sns_weekly_trends", "week_start, mention_count, brands(name)", {
    column: "week_start",
    ascending: true,
  });

  // ピボット変換
  const pivotedData: Record<string, Record<string, number | string>> = {};
  data.forEach((row) => {
    const date = row.week_start;
    const brand = row.brands?.name;
    const count = row.mention_count;

    if (!pivotedData[date]) {
      pivotedData[date] = { date };
    }
    if (brand && count !== null) {
      pivotedData[date][brand] = count;
    }
  });

  const result = Object.values(pivotedData);
  saveJson(path.join(OUTPUT_DIR, "trends", "sns.json"), result);
}

// ===================
// 3. Correlations
// ===================
async function generateCorrelationsData() {
  console.log("\n[3/10] Generating correlations data...");

  const { data, error } = await supabase.from("correlations").select(`
      coefficient,
      brand_a:brands!correlations_brand_a_id_fkey(name),
      brand_b:brands!correlations_brand_b_id_fkey(name)
    `);

  if (error) {
    console.error("  Error:", error.message);
    return;
  }

  // マトリクス形式に変換
  const matrix: Record<string, Record<string, number>> = {};
  data?.forEach((row) => {
    const brandA = (row.brand_a as unknown as { name: string } | null)?.name;
    const brandB = (row.brand_b as unknown as { name: string } | null)?.name;
    const coefficient = row.coefficient;

    if (brandA && brandB && coefficient !== null) {
      if (!matrix[brandA]) {
        matrix[brandA] = {};
      }
      matrix[brandA][brandB] = coefficient;
    }
  });

  saveJson(path.join(OUTPUT_DIR, "correlations.json"), matrix);
}

// ===================
// 4. Seasonality
// ===================
async function generateSeasonalityData() {
  console.log("\n[4/10] Generating seasonality data...");

  const { data, error } = await supabase
    .from("seasonality")
    .select("month, avg_score, brands(name, color)")
    .order("month", { ascending: true });

  if (error) {
    console.error("  Error:", error.message);
    return;
  }

  const monthNames = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月",
  ];

  // ピボット変換
  const pivotedData: Record<number, Record<string, number | string>> = {};
  data?.forEach((row) => {
    const month = row.month;
    const brand = (row.brands as unknown as { name: string; color: string } | null)?.name;
    const avgScore = row.avg_score;

    if (month && !pivotedData[month]) {
      pivotedData[month] = {
        month,
        monthName: monthNames[month - 1],
      };
    }
    if (month && brand && avgScore !== null) {
      pivotedData[month][brand] = avgScore;
    }
  });

  const result = Object.values(pivotedData).sort(
    (a, b) => (a.month as number) - (b.month as number)
  );

  saveJson(path.join(OUTPUT_DIR, "seasonality.json"), result);
}

// ===================
// 5. SNS Mentions
// ===================
async function generateSnsMentionsData() {
  console.log("\n[5/10] Generating SNS data (mentions, cooccurrences, sentiments)...");

  ensureDir(path.join(OUTPUT_DIR, "sns"));

  // Mentions
  const { data: mentionsData, error: mentionsError } = await supabase
    .from("sns_mentions")
    .select("mention_count, share_percentage, brands(name, color)")
    .order("mention_count", { ascending: false });

  if (mentionsError) {
    console.error("  Error (mentions):", mentionsError.message);
    return;
  }

  const mentions = mentionsData?.map((row) => {
    const brand = row.brands as unknown as { name: string; color: string } | null;
    return {
      brand: brand?.name || "",
      count: row.mention_count,
      share: row.share_percentage,
      color: brand?.color || "#666666",
    };
  });

  saveJson(path.join(OUTPUT_DIR, "sns", "mentions.json"), mentions);

  // Cooccurrences
  const { data: coocData, error: coocError } = await supabase
    .from("sns_cooccurrences")
    .select(`
      cooccurrence_count,
      brand_a:brands!sns_cooccurrences_brand_a_id_fkey(name),
      brand_b:brands!sns_cooccurrences_brand_b_id_fkey(name)
    `);

  if (coocError) {
    console.error("  Error (cooccurrences):", coocError.message);
    return;
  }

  const coocMatrix: Record<string, Record<string, number>> = {};
  coocData?.forEach((row) => {
    const brandA = (row.brand_a as unknown as { name: string } | null)?.name;
    const brandB = (row.brand_b as unknown as { name: string } | null)?.name;
    const count = row.cooccurrence_count;

    if (brandA && brandB && count !== null) {
      if (!coocMatrix[brandA]) {
        coocMatrix[brandA] = {};
      }
      coocMatrix[brandA][brandB] = count;
    }
  });

  saveJson(path.join(OUTPUT_DIR, "sns", "cooccurrences.json"), coocMatrix);

  // Sentiments
  const { data: sentData, error: sentError } = await supabase
    .from("sns_sentiments")
    .select("positive_count, neutral_count, negative_count, negative_rate, brands(name, color)")
    .order("negative_rate", { ascending: false });

  if (sentError) {
    console.error("  Error (sentiments):", sentError.message);
    return;
  }

  const sentiments = sentData?.map((row) => {
    const brand = row.brands as unknown as { name: string; color: string } | null;
    const total = row.positive_count + row.neutral_count + row.negative_count;
    return {
      brand: brand?.name || "",
      positiveCount: row.positive_count,
      neutralCount: row.neutral_count,
      negativeCount: row.negative_count,
      negativeRate: row.negative_rate,
      total,
      color: brand?.color || "#666666",
    };
  });

  saveJson(path.join(OUTPUT_DIR, "sns", "sentiments.json"), sentiments);
}

// ===================
// 6. SNS Labels
// ===================
async function generateSnsLabelsData() {
  console.log("\n[6/10] Generating SNS labels data...");

  ensureDir(path.join(OUTPUT_DIR, "sns", "labels"));

  // 全ブランド + ブランドなし
  const brandsToProcess = ["all", ...VALID_BRANDS];

  for (const brand of brandsToProcess) {
    let query = supabase
      .from("sns_posts")
      .select("sentiment, intent, emotion, cep_id, ceps(cep_name)");

    if (brand !== "all") {
      query = query.ilike("brand_mentions", `%${brand}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`  Error (labels for ${brand}):`, error.message);
      continue;
    }

    const sentimentCounts: Record<string, number> = {};
    const intentCounts: Record<string, number> = {};
    const emotionCounts: Record<string, number> = {};
    const cepCounts: Record<string, number> = {};

    data?.forEach((row) => {
      if (row.sentiment) {
        sentimentCounts[row.sentiment] = (sentimentCounts[row.sentiment] || 0) + 1;
      }
      if (row.intent) {
        intentCounts[row.intent] = (intentCounts[row.intent] || 0) + 1;
      }
      if (row.emotion) {
        emotionCounts[row.emotion] = (emotionCounts[row.emotion] || 0) + 1;
      }
      if (row.cep_id) {
        const ceps = row.ceps as unknown as { cep_name: string } | { cep_name: string }[] | null;
        let cepName: string;
        if (Array.isArray(ceps)) {
          cepName = ceps[0]?.cep_name || `cep_${row.cep_id}`;
        } else {
          cepName = ceps?.cep_name || `cep_${row.cep_id}`;
        }
        cepCounts[cepName] = (cepCounts[cepName] || 0) + 1;
      }
    });

    const total = data?.length || 0;

    const toDistribution = (counts: Record<string, number>) => {
      return Object.entries(counts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.count - a.count);
    };

    const result = {
      total,
      sentiment: toDistribution(sentimentCounts),
      intent: toDistribution(intentCounts),
      emotion: toDistribution(emotionCounts),
      cep: toDistribution(cepCounts),
    };

    saveJson(path.join(OUTPUT_DIR, "sns", "labels", `${brand}.json`), result);
  }
}

// ===================
// 7. W's Detail (ブランド別静的ファイル生成)
// ===================
async function generateWsDetailData() {
  console.log("\n[7/10] Generating W's detail data (per-brand files)...");

  // W's Detail 専用ディレクトリ
  const wsDetailDir = path.join(OUTPUT_DIR, "sns", "ws-detail");
  ensureDir(wsDetailDir);

  // 全投稿を取得（ページネーション）
  const PAGE_SIZE = 1000;
  let offset = 0;
  let hasMore = true;
  const allPosts: Array<{
    brand_mentions: string | null;
    dish_category: string | null;
    dish_name: string | null;
    meal_occasion: string | null;
    cooking_for: string | null;
    motivation_category: string | null;
  }> = [];

  while (hasMore) {
    const { data, error } = await supabase
      .from("sns_posts")
      .select(
        "brand_mentions, dish_category, dish_name, meal_occasion, cooking_for, motivation_category"
      )
      .not("dish_category", "is", null)
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("  Error:", error.message);
      return;
    }

    if (data && data.length > 0) {
      allPosts.push(...data);
      offset += PAGE_SIZE;
    }
    hasMore = data && data.length === PAGE_SIZE;
  }

  console.log(`  Total posts fetched: ${allPosts.length}`);

  // ラベルマッピング
  const CATEGORY_LABELS: Record<string, string> = {
    soup: "汁物", stir_fry: "炒め物", stew: "煮込み", chinese: "中華",
    rice: "ご飯もの", salad: "サラダ", noodle: "麺類", fried: "揚げ物",
    grilled: "焼き物", seasoning: "下味・調味", other: "その他", unknown: "不明",
  };

  const OCCASION_LABELS: Record<string, string> = {
    weekday_dinner_rush: "平日夜（急ぎ）", weekday_dinner_leisurely: "平日夜（ゆっくり）",
    weekend_brunch: "週末ブランチ", weekend_dinner: "週末夕食",
    lunch_box: "お弁当", late_night_snack: "夜食・晩酌",
    breakfast: "朝食", party: "パーティー", unknown: "不明",
  };

  const TARGET_LABELS: Record<string, string> = {
    self: "自分用", family: "家族", kids: "子ども", spouse: "配偶者",
    parents: "親・高齢者", guest: "来客", multiple: "複数", unknown: "不明",
  };

  const MOTIVATION_LABELS: Record<string, string> = {
    time_pressure: "時間がない", taste_assurance: "味を失敗したくない",
    health_concern: "健康志向", cost_saving: "節約",
    skill_confidence: "料理に自信がない", variety_seeking: "いつもと違うもの",
    comfort_food: "定番・安心感", impression: "相手を喜ばせたい", unknown: "不明",
  };

  // 集計ヘルパー関数
  type Post = typeof allPosts[number];
  function aggregatePosts(posts: Post[]) {
    const dishCounts: Record<string, number> = {};
    const nameCounts: Record<string, { count: number; brands: Set<string> }> = {};
    const occasionCounts: Record<string, number> = {};
    const targetCounts: Record<string, number> = {};
    const motivationCounts: Record<string, number> = {};
    const brandDishCross: Record<string, Record<string, number>> = {};

    posts.forEach((p) => {
      if (p.dish_category && p.dish_category !== "unknown") {
        dishCounts[p.dish_category] = (dishCounts[p.dish_category] || 0) + 1;
      }
      if (p.dish_name && p.dish_name !== "unknown" && p.dish_name !== "") {
        if (!nameCounts[p.dish_name]) {
          nameCounts[p.dish_name] = { count: 0, brands: new Set() };
        }
        nameCounts[p.dish_name].count++;
        if (p.brand_mentions) nameCounts[p.dish_name].brands.add(p.brand_mentions);
      }
      if (p.meal_occasion && p.meal_occasion !== "unknown") {
        occasionCounts[p.meal_occasion] = (occasionCounts[p.meal_occasion] || 0) + 1;
      }
      if (p.cooking_for && p.cooking_for !== "unknown") {
        targetCounts[p.cooking_for] = (targetCounts[p.cooking_for] || 0) + 1;
      }
      if (p.motivation_category && p.motivation_category !== "unknown") {
        motivationCounts[p.motivation_category] =
          (motivationCounts[p.motivation_category] || 0) + 1;
      }
      if (
        p.brand_mentions &&
        p.dish_category &&
        p.dish_category !== "unknown" &&
        p.dish_category !== "other"
      ) {
        if (!brandDishCross[p.brand_mentions]) brandDishCross[p.brand_mentions] = {};
        brandDishCross[p.brand_mentions][p.dish_category] =
          (brandDishCross[p.brand_mentions][p.dish_category] || 0) + 1;
      }
    });

    const dishTotal = Object.values(dishCounts).reduce((a, b) => a + b, 0) || 1;
    const dish_category = Object.entries(dishCounts)
      .map(([category, count]) => ({
        category: CATEGORY_LABELS[category] || category,
        count,
        percentage: Math.round((count / dishTotal) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    const dish_name = Object.entries(nameCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        brand: Array.from(data.brands).slice(0, 2).join("・"),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const occasionTotal = Object.values(occasionCounts).reduce((a, b) => a + b, 0) || 1;
    const meal_occasion = Object.entries(occasionCounts)
      .map(([occasion, count]) => ({
        occasion: OCCASION_LABELS[occasion] || occasion,
        count,
        percentage: Math.round((count / occasionTotal) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    const targetTotal = Object.values(targetCounts).reduce((a, b) => a + b, 0) || 1;
    const cooking_for = Object.entries(targetCounts)
      .map(([target, count]) => ({
        target: TARGET_LABELS[target] || target,
        count,
        percentage: Math.round((count / targetTotal) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    const motivationTotal = Object.values(motivationCounts).reduce((a, b) => a + b, 0) || 1;
    const motivation = Object.entries(motivationCounts)
      .map(([category, count]) => ({
        category: MOTIVATION_LABELS[category] || category,
        count,
        percentage: Math.round((count / motivationTotal) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    const brand_dish: { brand: string; category: string; count: number }[] = [];
    Object.entries(brandDishCross).forEach(([brand, categories]) => {
      Object.entries(categories).forEach(([category, count]) => {
        brand_dish.push({
          brand,
          category: CATEGORY_LABELS[category] || category,
          count,
        });
      });
    });

    return { dish_category, dish_name, meal_occasion, cooking_for, motivation, brand_dish };
  }

  // 全ブランド統合ファイル
  const allResult = aggregatePosts(allPosts);
  saveJson(path.join(wsDetailDir, "all.json"), allResult);

  // ブランド別ファイル
  for (const brand of VALID_BRANDS) {
    const brandPosts = allPosts.filter((p) => p.brand_mentions === brand);
    if (brandPosts.length > 0) {
      const result = aggregatePosts(brandPosts);
      saveJson(path.join(wsDetailDir, `${brand}.json`), result);
      console.log(`    ${brand}: ${brandPosts.length} posts`);
    } else {
      console.log(`    ${brand}: 0 posts (skipped)`);
    }
  }

  // 後方互換性のため旧ファイルも更新
  saveJson(path.join(OUTPUT_DIR, "sns", "ws-detail.json"), allResult);
}

// ===================
// 8. CEPs
// ===================
async function generateCepsData() {
  console.log("\n[8/10] Generating CEP data...");

  ensureDir(path.join(OUTPUT_DIR, "ceps"));

  // All CEPs
  const { data: cepsData, error: cepsError } = await supabase
    .from("ceps")
    .select("*")
    .order("cep_name");

  if (cepsError) {
    console.error("  Error (ceps):", cepsError.message);
    return;
  }

  saveJson(path.join(OUTPUT_DIR, "ceps", "all.json"), cepsData);

  // Brand CEPs
  const { data: brandCepsData, error: brandCepsError } = await supabase
    .from("brand_ceps")
    .select(`
      reach_score, frequency_score, habit_strength, wtp,
      potential_score, strength_alignment, quadrant, mention_count, analysis_date,
      brands(name, color),
      ceps(cep_name, category, description)
    `)
    .order("potential_score", { ascending: false });

  if (brandCepsError) {
    console.error("  Error (brand_ceps):", brandCepsError.message);
    return;
  }

  const brandCeps = brandCepsData?.map((row) => {
    const brand = row.brands as unknown as { name: string; color: string } | null;
    const cep = row.ceps as unknown as { cep_name: string; category: string; description: string } | null;
    return {
      brand: brand?.name || "",
      brandColor: brand?.color || "#666666",
      cepName: cep?.cep_name || "",
      cepCategory: cep?.category || "",
      cepDescription: cep?.description || "",
      reachScore: row.reach_score,
      frequencyScore: row.frequency_score,
      habitStrength: row.habit_strength,
      wtp: row.wtp,
      potentialScore: row.potential_score,
      strengthAlignment: row.strength_alignment,
      quadrant: row.quadrant,
      mentionCount: row.mention_count,
      analysisDate: row.analysis_date,
    };
  });

  saveJson(path.join(OUTPUT_DIR, "ceps", "brands.json"), brandCeps);

  // Portfolio
  const portfolioData = brandCeps
    ?.filter((d) => d.quadrant)
    ?.map((d) => ({
      brand: d.brand,
      color: d.brandColor,
      cepName: d.cepName,
      category: d.cepCategory,
      x: d.strengthAlignment,
      y: d.potentialScore,
      quadrant: d.quadrant,
      size: d.mentionCount,
    }));

  const quadrantSummary = {
    コア強化: portfolioData?.filter((d) => d.quadrant === "コア強化") || [],
    機会獲得: portfolioData?.filter((d) => d.quadrant === "機会獲得") || [],
    育成検討: portfolioData?.filter((d) => d.quadrant === "育成検討") || [],
    低優先: portfolioData?.filter((d) => d.quadrant === "低優先") || [],
  };

  saveJson(path.join(OUTPUT_DIR, "ceps", "portfolio.json"), {
    data: portfolioData,
    summary: {
      コア強化: quadrantSummary.コア強化.length,
      機会獲得: quadrantSummary.機会獲得.length,
      育成検討: quadrantSummary.育成検討.length,
      低優先: quadrantSummary.低優先.length,
    },
  });
}

// ===================
// 9. Keywords
// ===================
async function generateKeywordsData() {
  console.log("\n[9/10] Generating keywords data...");

  ensureDir(path.join(OUTPUT_DIR, "keywords"));

  // All keywords
  const { data: kwData, error: kwError } = await supabase
    .from("related_keywords")
    .select("keyword, query_type, value, extracted_value, rank, fetch_date, brands(name, color)")
    .order("rank", { ascending: true });

  if (kwError) {
    console.error("  Error (keywords):", kwError.message);
    return;
  }

  const keywords = kwData?.map((row) => {
    const brand = row.brands as unknown as { name: string; color: string } | null;
    return {
      keyword: row.keyword,
      queryType: row.query_type,
      value: row.value,
      extractedValue: row.extracted_value,
      rank: row.rank,
      fetchDate: row.fetch_date,
      brand: brand?.name || "",
      brandColor: brand?.color || "#666666",
    };
  });

  saveJson(path.join(OUTPUT_DIR, "keywords", "all.json"), keywords);

  // Cooccurrences
  const { data: coocData, error: coocError } = await supabase
    .from("keyword_cooccurrences")
    .select("keyword, brand_ids, brand_count, total_score, analysis_date")
    .order("brand_count", { ascending: false })
    .order("total_score", { ascending: false })
    .limit(50);

  if (coocError) {
    console.error("  Error (keyword cooccurrences):", coocError.message);
    return;
  }

  const { data: brandsData } = await supabase
    .from("brands")
    .select("id, name, color")
    .order("id");

  const brandMap = new Map(brandsData?.map((b) => [b.id, { name: b.name, color: b.color }]));
  const allBrands = brandsData?.map((b) => b.name) || [];

  const coocResult = coocData?.map((row) => {
    const brandIds = row.brand_ids as number[];
    const brandNames = brandIds.map((id) => brandMap.get(id)?.name || "").filter(Boolean);
    const brandColors = brandIds.map((id) => brandMap.get(id)?.color || "#666666");
    return {
      keyword: row.keyword,
      brandCount: row.brand_count,
      totalScore: row.total_score,
      brandNames,
      brandColors,
      analysisDate: row.analysis_date,
    };
  });

  // Build matrix
  const matrix: Record<string, Record<string, number>> = {};
  coocResult?.forEach((row) => {
    row.brandNames.forEach((brandA: string) => {
      if (!matrix[brandA]) {
        matrix[brandA] = {};
        allBrands.forEach((b) => (matrix[brandA][b] = 0));
      }
      row.brandNames.forEach((brandB: string) => {
        if (brandA !== brandB) {
          matrix[brandA][brandB] = (matrix[brandA][brandB] || 0) + 1;
        }
      });
    });
  });

  saveJson(path.join(OUTPUT_DIR, "keywords", "cooccurrences.json"), {
    keywords: coocResult,
    matrix,
    brands: allBrands,
  });

  // Sankey (simplified - full version requires more complex logic)
  // For now, save the basic keyword data with CEP info
  const { data: mappings } = await supabase
    .from("keyword_cep_mappings")
    .select("keyword, relevance_score, ceps(cep_name, category)")
    .gte("relevance_score", 0.5);

  saveJson(path.join(OUTPUT_DIR, "keywords", "sankey.json"), {
    keywords: keywords?.filter((k) => k.queryType === "top"),
    cepMappings: mappings,
  });
}

// ===================
// 10. Insights
// ===================
async function generateInsightsData() {
  console.log("\n[10/10] Generating insights data...");

  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("  Error:", error.message);
    return;
  }

  saveJson(path.join(OUTPUT_DIR, "insights.json"), data);
}

// ===================
// 11. Brands (サマリーと関連性)
// ===================
async function generateBrandsData() {
  console.log("\n[Bonus] Generating brand summary data...");

  ensureDir(path.join(OUTPUT_DIR, "brands"));

  for (const brandName of VALID_BRANDS) {
    // Brand basic info
    const { data: brandData } = await supabase
      .from("brands")
      .select("id, name, name_en, color")
      .eq("name", brandName)
      .single();

    if (!brandData) continue;

    // Mention
    const { data: mentionData } = await supabase
      .from("sns_mentions")
      .select("mention_count, share_percentage")
      .eq("brand_id", brandData.id)
      .single();

    // Sentiment
    const { data: sentimentData } = await supabase
      .from("sns_sentiments")
      .select("positive_count, neutral_count, negative_count, negative_rate")
      .eq("brand_id", brandData.id)
      .single();

    // Top CEPs
    const { data: cepData } = await supabase
      .from("brand_ceps")
      .select("cep_id, potential_score, quadrant, ceps(cep_name)")
      .eq("brand_id", brandData.id)
      .order("potential_score", { ascending: false })
      .limit(5);

    const quadrantDistribution: Record<string, number> = {
      コア強化: 0, 機会獲得: 0, 育成検討: 0, 低優先: 0,
    };

    cepData?.forEach((cep) => {
      if (cep.quadrant && quadrantDistribution[cep.quadrant] !== undefined) {
        quadrantDistribution[cep.quadrant]++;
      }
    });

    const primaryQuadrant = Object.entries(quadrantDistribution).reduce(
      (a, b) => (b[1] > a[1] ? b : a)
    )[0];

    const topCep = cepData?.[0];
    const ceps = topCep?.ceps as unknown as { cep_name: string } | { cep_name: string }[] | null;
    const topCepName = Array.isArray(ceps) ? ceps[0]?.cep_name : ceps?.cep_name;

    const summary = {
      id: brandData.id,
      name: brandData.name,
      nameEn: brandData.name_en,
      color: brandData.color,
      mentionCount: mentionData?.mention_count || 0,
      mentionShare: mentionData?.share_percentage || 0,
      positiveCount: sentimentData?.positive_count || 0,
      neutralCount: sentimentData?.neutral_count || 0,
      negativeCount: sentimentData?.negative_count || 0,
      negativeRate: sentimentData?.negative_rate || 0,
      topCep: topCep
        ? { name: topCepName || "不明", score: topCep.potential_score }
        : null,
      primaryQuadrant,
      quadrantDistribution,
      cepCount: cepData?.length || 0,
    };

    saveJson(path.join(OUTPUT_DIR, "brands", `${brandName}.json`), summary);

    // Relations
    const brandId = brandData.id;

    // Cooccurrences
    const { data: coocData } = await supabase
      .from("sns_cooccurrences")
      .select("brand_a_id, brand_b_id, cooccurrence_count, brands!sns_cooccurrences_brand_b_id_fkey(name)")
      .or(`brand_a_id.eq.${brandId},brand_b_id.eq.${brandId}`)
      .order("cooccurrence_count", { ascending: false })
      .limit(10);

    const cooccurrences = (coocData || [])
      .map((row) => {
        const brands = row.brands as unknown as { name: string } | { name: string }[] | null;
        const otherBrandName = Array.isArray(brands) ? brands[0]?.name : brands?.name;
        if (otherBrandName === brandName) return null;
        return { brand: otherBrandName || "不明", count: row.cooccurrence_count };
      })
      .filter((x): x is { brand: string; count: number } => x !== null)
      .slice(0, 5);

    // Correlations
    const { data: corrData } = await supabase
      .from("correlations")
      .select("brand_a_id, brand_b_id, coefficient, brands!correlations_brand_b_id_fkey(name)")
      .or(`brand_a_id.eq.${brandId},brand_b_id.eq.${brandId}`)
      .order("coefficient", { ascending: false });

    const correlations = (corrData || [])
      .map((row) => {
        const brands = row.brands as unknown as { name: string } | { name: string }[] | null;
        const otherBrandName = Array.isArray(brands) ? brands[0]?.name : brands?.name;
        if (otherBrandName === brandName) return null;
        return { brand: otherBrandName || "不明", coefficient: row.coefficient };
      })
      .filter((x): x is { brand: string; coefficient: number } => x !== null)
      .sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient))
      .slice(0, 5);

    // Keywords
    const { data: kwData } = await supabase
      .from("related_keywords")
      .select("keyword, relevance_score, keyword_type")
      .eq("brand_id", brandId)
      .order("relevance_score", { ascending: false })
      .limit(10);

    const relations = {
      brand: brandName,
      cooccurrences,
      correlations,
      keywords: kwData || [],
    };

    saveJson(path.join(OUTPUT_DIR, "brands", `${brandName}_relations.json`), relations);
  }
}

// ===================
// メイン処理
// ===================
async function main() {
  console.log("===========================================");
  console.log(" Static Data Generation");
  console.log("===========================================");
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Brands: ${VALID_BRANDS.join(", ")}`);

  const startTime = Date.now();

  await generateTrendsData();
  await generateSnsTrendsData();
  await generateCorrelationsData();
  await generateSeasonalityData();
  await generateSnsMentionsData();
  await generateSnsLabelsData();
  await generateWsDetailData();
  await generateCepsData();
  await generateKeywordsData();
  await generateInsightsData();
  await generateBrandsData();

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log("\n===========================================");
  console.log(` Done! (${duration}s)`);
  console.log("===========================================");
}

main().catch(console.error);
