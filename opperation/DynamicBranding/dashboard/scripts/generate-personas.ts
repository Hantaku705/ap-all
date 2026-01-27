/**
 * ペルソナ静的生成スクリプト
 *
 * 全SNS投稿（50,000件）を使用してブランド別ペルソナを事前生成し、
 * output/personas/ に保存
 *
 * 実行方法:
 * npx tsx scripts/generate-personas.ts                 # 全ブランド
 * npx tsx scripts/generate-personas.ts --brand=ほんだし # 特定ブランド
 */

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

// Load .env.local from dashboard directory
config({ path: path.join(__dirname, "..", ".env.local") });

// Types
import {
  Persona,
  PersonaResponse,
  ClusterConfig,
  ClusteringQuality,
  DEFAULT_CLUSTER_CONFIG,
  PersonaRecommendations,
  PersonaInsights,
} from "../src/types/persona.types";

import {
  runKMeans,
  ClusterInfo,
  clusterToPersonaInput,
} from "../src/lib/clustering";

// APIキー検証
function validateApiKey(key: string | undefined): string | null {
  if (!key) return null;
  const trimmed = key.trim().replace(/\\n/g, "").replace(/\n/g, "");
  return trimmed.length > 10 ? trimmed : null;
}

// 環境変数チェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const geminiKey = validateApiKey(process.env.GEMINI_API_KEY);

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase credentials required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const gemini = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

console.log(`[LLM Status] Gemini: ${gemini ? "有効" : "無効"}`);

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

// 出力ディレクトリ
const OUTPUT_DIR = path.join(process.cwd(), "output", "personas");

// CEP日本語ラベル
const CEP_LABELS: Record<string, string> = {
  time_saving_weeknight: "平日夜の時短ニーズ",
  weekend_cooking: "週末の料理を楽しむ",
  health_conscious: "健康・栄養を意識",
  kids_meal: "子供向けの食事作り",
  budget_cooking: "節約・コスパ重視",
  cooking_beginner: "料理初心者のサポート",
  special_occasion: "特別な日の料理",
  comfort_food: "定番・安心の味",
  variety_seeking: "マンネリ解消・新しい味",
  entertaining_guests: "おもてなし料理",
  quick_lunch: "簡単ランチ",
  late_night_snack: "夜食・軽食",
};

// 属性日本語ラベル（既存のものに合わせる）
const LABEL_MAPPINGS = {
  life_stage: {
    single: "一人暮らし",
    couple: "夫婦二人",
    child_raising: "子育て中",
    empty_nest: "子供独立後",
    senior: "シニア",
    unknown: "不明",
  },
  cooking_skill: {
    beginner: "初級",
    intermediate: "中級",
    advanced: "上級",
    unknown: "不明",
  },
  motivation_category: {
    time_saving: "時短",
    health: "健康志向",
    taste: "味へのこだわり",
    variety: "レパートリー拡大",
    budget: "節約",
    convenience: "手軽さ",
    entertainment: "楽しみ",
    unknown: "不明",
  },
  meal_occasion: {
    weekday_dinner_rush: "平日夜（急ぎ）",
    weekday_dinner_leisurely: "平日夜（ゆっくり）",
    weekend_brunch: "週末ブランチ",
    weekend_dinner: "週末ディナー",
    breakfast: "朝食",
    lunch_box: "お弁当",
    late_night_snack: "夜食",
    party: "パーティー",
    unknown: "不明",
  },
  cooking_for: {
    self: "自分",
    family: "家族",
    kids: "子ども",
    guests: "お客様",
    unknown: "不明",
  },
  emotion: {
    stress: "ストレス",
    satisfaction: "満足",
    anxiety: "不安",
    joy: "喜び",
    neutral: "普通",
    frustration: "イライラ",
    excitement: "ワクワク",
    unknown: "不明",
  },
};

// PostForClustering型
interface PostForClustering {
  id: string;
  content: string;
  engagement_total: number;
  life_stage: string | null;
  cooking_skill: string | null;
  motivation_category: string | null;
  meal_occasion: string | null;
  cooking_for: string | null;
  emotion: string | null;
  cep_category?: string | null;
}

// コマンドライン引数解析
function parseArgs(): { brand?: string } {
  const args = process.argv.slice(2);
  const brandArg = args.find((a) => a.startsWith("--brand="));
  return {
    brand: brandArg ? brandArg.split("=")[1] : undefined,
  };
}

// 全投稿取得（ページネーション）
async function fetchAllPosts(brandName: string): Promise<PostForClustering[]> {
  const PAGE_SIZE = 1000;
  let offset = 0;
  let hasMore = true;
  const allPosts: PostForClustering[] = [];

  console.log(`  [${brandName}] 投稿取得中...`);

  while (hasMore) {
    const { data, error } = await supabase
      .from("sns_posts")
      .select(
        `
        id, content, engagement_total,
        life_stage, cooking_skill, motivation_category,
        meal_occasion, cooking_for, emotion, cep_id
      `
      )
      .ilike("brand_mentions", `%${brandName}%`)
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error(`  Error fetching posts: ${error.message}`);
      break;
    }

    if (data && data.length > 0) {
      const posts = data.map((p) => ({
        id: String(p.id),
        content: p.content || "",
        engagement_total: p.engagement_total || 0,
        life_stage: p.life_stage,
        cooking_skill: p.cooking_skill,
        motivation_category: p.motivation_category,
        meal_occasion: p.meal_occasion,
        cooking_for: p.cooking_for,
        emotion: p.emotion,
        cep_category: p.cep_id ? String(p.cep_id) : null,
      }));
      allPosts.push(...posts);
      process.stdout.write(`\r  [${brandName}] ${allPosts.length}件取得済み`);
      offset += PAGE_SIZE;
    }

    hasMore = data && data.length === PAGE_SIZE;
  }

  console.log(`\n  [${brandName}] 合計 ${allPosts.length}件`);
  return allPosts;
}

// CEP分布を計算
function calculateCEPDistribution(
  posts: PostForClustering[]
): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const post of posts) {
    if (post.cep_category && post.cep_category !== "unknown") {
      dist[post.cep_category] = (dist[post.cep_category] || 0) + 1;
    }
  }
  return dist;
}

// unknown率計算
function calculateUnknownRates(posts: PostForClustering[]): {
  life_stage: number;
  cooking_skill: number;
  motivation_category: number;
  meal_occasion: number;
  cooking_for: number;
  emotion: number;
  average: number;
} {
  const total = posts.length;
  if (total === 0) {
    return {
      life_stage: 100,
      cooking_skill: 100,
      motivation_category: 100,
      meal_occasion: 100,
      cooking_for: 100,
      emotion: 100,
      average: 100,
    };
  }

  const counts = {
    life_stage: posts.filter(
      (p) => !p.life_stage || p.life_stage === "unknown"
    ).length,
    cooking_skill: posts.filter(
      (p) => !p.cooking_skill || p.cooking_skill === "unknown"
    ).length,
    motivation_category: posts.filter(
      (p) => !p.motivation_category || p.motivation_category === "unknown"
    ).length,
    meal_occasion: posts.filter(
      (p) => !p.meal_occasion || p.meal_occasion === "unknown"
    ).length,
    cooking_for: posts.filter(
      (p) => !p.cooking_for || p.cooking_for === "unknown"
    ).length,
    emotion: posts.filter((p) => !p.emotion || p.emotion === "unknown").length,
  };

  const rates = {
    life_stage: Math.round((counts.life_stage / total) * 100),
    cooking_skill: Math.round((counts.cooking_skill / total) * 100),
    motivation_category: Math.round((counts.motivation_category / total) * 100),
    meal_occasion: Math.round((counts.meal_occasion / total) * 100),
    cooking_for: Math.round((counts.cooking_for / total) * 100),
    emotion: Math.round((counts.emotion / total) * 100),
    average: 0,
  };

  rates.average = Math.round(
    (rates.life_stage +
      rates.cooking_skill +
      rates.motivation_category +
      rates.meal_occasion +
      rates.cooking_for +
      rates.emotion) /
      6
  );

  return rates;
}

// 品質メトリクス計算（簡易版）
function calculateSimpleQualityMetrics(
  posts: PostForClustering[],
  clusters: ClusterInfo[]
): ClusteringQuality {
  const unknownRates = calculateUnknownRates(posts);
  const dataCompleteness = 100 - unknownRates.average;

  // シルエットスコアの簡易計算（クラスターサイズの均等性で代替）
  const sizes = clusters.map((c) => c.size);
  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  const variance =
    sizes.reduce((sum, s) => sum + Math.pow(s - avgSize, 2), 0) / sizes.length;
  const stdDev = Math.sqrt(variance);
  const cv = avgSize > 0 ? stdDev / avgSize : 1;
  const silhouetteScore = Math.max(0, Math.min(1, 1 - cv));

  // 総合信頼度
  const overallConfidence = Math.round(
    dataCompleteness * 0.5 + silhouetteScore * 50
  );

  return {
    silhouetteScore: Math.round(silhouetteScore * 100) / 100,
    unknownRates,
    dataCompleteness: Math.round(dataCompleteness),
    clusterSeparation: Math.round(silhouetteScore * 100),
    overallConfidence,
    postsAnalyzed: posts.length,
    postsClustered: clusters.reduce((sum, c) => sum + c.size, 0),
    postsExcluded:
      posts.length - clusters.reduce((sum, c) => sum + c.size, 0),
    clusteringMethod: "kmeans",
    clusterSizes: sizes,
  };
}

// 強化版LLMプロンプト（recommendations + insights付き）
const ENHANCED_SYSTEM_PROMPT = `あなたは調味料ブランドのペルソナ分析エキスパートです。
k-meansクラスタリングの結果から、マーケティングに活用できるペルソナを生成してください。

## 出力要件

各クラスターについて、以下のJSON形式で出力してください：

{
  "personas": [
    {
      "id": "p_0",
      "name": "ペルソナ名（10文字以内の日本語）",
      "description": "このペルソナの詳細説明（50-100文字）",
      "keywords": ["関連キーワード1", "関連キーワード2", "関連キーワード3"],
      "selectedSampleIndices": [0, 2, 4, 6, 8],
      "recommendations": {
        "targetCEPs": ["効果的なCEP1", "効果的なCEP2", "効果的なCEP3"],
        "contentThemes": ["推奨コンテンツテーマ1", "推奨コンテンツテーマ2", "推奨コンテンツテーマ3"],
        "communicationTips": ["コミュニケーション施策1", "コミュニケーション施策2"]
      },
      "insights": {
        "painPoints": ["課題・不満1", "課題・不満2"],
        "motivations": ["動機・欲求1", "動機・欲求2"],
        "brandPerception": "このペルソナがブランドに対して持つ認識（1文）"
      }
    }
  ]
}

## 命名規則

- キャッチーで覚えやすい日本語名
- 例: 「忙しいワーママ」「週末料理パパ」「時短ひとり暮らし」「こだわり主婦」

## recommendations について

- targetCEPs: このペルソナが最も反応しやすいCEP（利用文脈）を3つ選定
- contentThemes: このペルソナに刺さるコンテンツテーマを3つ提案
- communicationTips: マーケティングコミュニケーションのTipsを2つ

## insights について

- painPoints: このペルソナが抱える料理に関する課題・不満を2-3つ
- motivations: このペルソナの料理に対する動機・欲求を2-3つ
- brandPerception: ブランドに対する認識を1文で表現

## selectedSampleIndices について

提示されたサンプル投稿（最大10件）の中から、このペルソナを最も代表する投稿を5件選び、
そのインデックス（0から始まる）を配列で指定してください。
`;

// LLMでペルソナ生成
async function generatePersonasWithLLM(
  brandName: string,
  clusters: ClusterInfo[],
  quality: ClusteringQuality,
  posts: PostForClustering[]
): Promise<Persona[]> {
  if (!gemini) {
    console.log("  [WARN] Gemini APIキーなし、デフォルト生成");
    return clusters.map((cluster, idx) =>
      createDefaultPersona(cluster, brandName, idx)
    );
  }

  // CEP分布取得（クラスター内）
  const clusterCEPDistributions = clusters.map((cluster) => {
    const clusterPostIds = new Set(cluster.postIds);
    const clusterPosts = posts.filter((p) => clusterPostIds.has(p.id));
    return calculateCEPDistribution(clusterPosts);
  });

  // クラスター情報をLLM入力用に整形
  const clusterInputs = clusters.map((c) => clusterToPersonaInput(c));

  const userPrompt = `
ブランド: ${brandName}
総投稿数: ${quality.postsAnalyzed}件
クラスタリング使用: ${quality.postsClustered}件
総合信頼度: ${quality.overallConfidence}%

## クラスター統計（${clusters.length}個）

${clusterInputs
  .map((c, i) => {
    const cepDist = clusterCEPDistributions[i];
    const topCEPs = Object.entries(cepDist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cep, count]) => `${CEP_LABELS[cep] || cep}: ${count}件`)
      .join(", ");

    return `
### クラスター ${i}
- 投稿数: ${c.size}件 (${c.sharePercentage}%)
- 平均エンゲージメント: ${c.avgEngagement}
- 位置: x=${c.position.x}, y=${c.position.y}

**支配的属性:**
- ライフステージ: ${c.dominantAttributes.lifeStage} (${c.dominantPercentages.lifeStage}%)
- 料理スキル: ${c.dominantAttributes.cookingSkill} (${c.dominantPercentages.cookingSkill}%)
- 主な動機: ${c.dominantAttributes.motivation} (${c.dominantPercentages.motivation}%)
- 調理シーン: ${c.dominantAttributes.occasion} (${c.dominantPercentages.occasion}%)
- 調理対象: ${c.dominantAttributes.cookingFor} (${c.dominantPercentages.cookingFor}%)
- 感情: ${c.dominantAttributes.emotion} (${c.dominantPercentages.emotion}%)

**よく使われるCEP:** ${topCEPs || "データなし"}

**代表的な投稿サンプル（5件選定用）:**
${c.samplePosts
  .slice(0, 10)
  .map((p, j) => `${j}. "${p.slice(0, 120)}"`)
  .join("\n")}
`;
  })
  .join("\n---\n")}

上記のクラスター統計に基づいて、各クラスターのペルソナ情報をJSON形式で生成してください。
`;

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = `${ENHANCED_SYSTEM_PROMPT}\n\n${userPrompt}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON部分を抽出
    let jsonStr = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr) as {
      personas: Array<{
        id: string;
        name: string;
        description: string;
        keywords?: string[];
        selectedSampleIndices?: number[];
        recommendations?: PersonaRecommendations;
        insights?: PersonaInsights;
      }>;
    };

    // LLM結果とクラスター統計をマージ
    return clusters.map((cluster, idx) => {
      const llmPersona = parsed.personas[idx];
      const clusterInput = clusterInputs[idx];

      // サンプル投稿選定
      let selectedPosts: string[] = [];
      if (
        llmPersona?.selectedSampleIndices &&
        llmPersona.selectedSampleIndices.length > 0
      ) {
        selectedPosts = llmPersona.selectedSampleIndices
          .filter((i) => i >= 0 && i < clusterInput.samplePosts.length)
          .map((i) => clusterInput.samplePosts[i]);
      }
      if (selectedPosts.length < 5) {
        // 足りない場合は先頭から補完
        selectedPosts = clusterInput.samplePosts.slice(0, 5);
      }

      return {
        id: `p_${idx}`,
        name: llmPersona?.name || `ペルソナ${idx + 1}`,
        description:
          llmPersona?.description || generateDefaultDescription(cluster),
        brand: brandName,
        position: cluster.position,
        attributes: {
          life_stage: cluster.dominantAttributes.life_stage.label,
          cooking_skill: cluster.dominantAttributes.cooking_skill.label,
          primary_motivation:
            cluster.dominantAttributes.motivation_category.label,
          primary_occasion: cluster.dominantAttributes.meal_occasion.label,
          primary_emotion: cluster.dominantAttributes.emotion.label,
        },
        behavior: {
          cooking_for: [cluster.dominantAttributes.cooking_for.label],
          peak_occasions: [cluster.dominantAttributes.meal_occasion.label],
          keywords: llmPersona?.keywords || extractKeywords(cluster),
        },
        metrics: {
          post_count: cluster.size,
          avg_engagement: cluster.avgEngagement,
          share_percentage: cluster.sharePercentage,
          is_real_data: true,
        },
        sample_posts: selectedPosts,
        recommendations: llmPersona?.recommendations || {
          targetCEPs: [],
          contentThemes: [],
          communicationTips: [],
        },
        insights: llmPersona?.insights || {
          painPoints: [],
          motivations: [],
          brandPerception: "",
        },
      };
    });
  } catch (error) {
    console.error("  [ERROR] LLM生成失敗:", error);
    return clusters.map((cluster, idx) =>
      createDefaultPersona(cluster, brandName, idx)
    );
  }
}

// デフォルトペルソナ作成
function createDefaultPersona(
  cluster: ClusterInfo,
  brandName: string,
  idx: number
): Persona {
  const clusterInput = clusterToPersonaInput(cluster);

  return {
    id: `p_${idx}`,
    name: `ペルソナ${idx + 1}`,
    description: generateDefaultDescription(cluster),
    brand: brandName,
    position: cluster.position,
    attributes: {
      life_stage: cluster.dominantAttributes.life_stage.label,
      cooking_skill: cluster.dominantAttributes.cooking_skill.label,
      primary_motivation:
        cluster.dominantAttributes.motivation_category.label,
      primary_occasion: cluster.dominantAttributes.meal_occasion.label,
      primary_emotion: cluster.dominantAttributes.emotion.label,
    },
    behavior: {
      cooking_for: [cluster.dominantAttributes.cooking_for.label],
      peak_occasions: [cluster.dominantAttributes.meal_occasion.label],
      keywords: extractKeywords(cluster),
    },
    metrics: {
      post_count: cluster.size,
      avg_engagement: cluster.avgEngagement,
      share_percentage: cluster.sharePercentage,
      is_real_data: true,
    },
    sample_posts: clusterInput.samplePosts.slice(0, 5),
    recommendations: {
      targetCEPs: [],
      contentThemes: [],
      communicationTips: [],
    },
    insights: {
      painPoints: [],
      motivations: [],
      brandPerception: "",
    },
  };
}

// デフォルト説明生成
function generateDefaultDescription(cluster: ClusterInfo): string {
  const dom = cluster.dominantAttributes;
  const parts: string[] = [];

  if (dom.life_stage.label !== "不明") {
    parts.push(dom.life_stage.label);
  }
  if (dom.cooking_skill.label !== "不明") {
    parts.push(`料理${dom.cooking_skill.label}`);
  }
  if (dom.motivation_category.label !== "不明") {
    parts.push(`${dom.motivation_category.label}を重視`);
  }

  return parts.length > 0
    ? `${parts.join("で、")}するユーザー層。`
    : "このクラスターのユーザー層。";
}

// キーワード抽出
function extractKeywords(cluster: ClusterInfo): string[] {
  const keywords: string[] = [];
  const dom = cluster.dominantAttributes;

  if (dom.motivation_category.label !== "不明") {
    keywords.push(dom.motivation_category.label);
  }
  if (dom.meal_occasion.label !== "不明") {
    keywords.push(dom.meal_occasion.label);
  }
  if (dom.cooking_for.label !== "不明") {
    keywords.push(dom.cooking_for.label);
  }

  return keywords.slice(0, 3);
}

// ブランド別ペルソナ生成
async function generateBrandPersonas(
  brandName: string
): Promise<PersonaResponse | null> {
  console.log(`\n=== ${brandName} ===`);

  const startTime = Date.now();

  // 1. 全投稿取得
  const posts = await fetchAllPosts(brandName);

  if (posts.length < 50) {
    console.log(`  [SKIP] 投稿数が少なすぎます (${posts.length}件)`);
    return null;
  }

  // 2. k-meansクラスタリング
  console.log(`  クラスタリング実行中 (K=5~8)...`);

  try {
    const clusteringResult = await runKMeans(posts, {
      minK: 5,
      maxK: 8,
      minKnownFields: 3,
      samplePostCount: 10,
    });

    console.log(
      `  クラスター数: ${clusteringResult.clusters.length}, 使用投稿: ${clusteringResult.postsClustered}件`
    );

    // 3. 品質メトリクス計算
    const quality = calculateSimpleQualityMetrics(
      posts,
      clusteringResult.clusters
    );

    // 4. LLMでペルソナ生成
    console.log(`  ペルソナ生成中 (LLM)...`);
    const personas = await generatePersonasWithLLM(
      brandName,
      clusteringResult.clusters,
      quality,
      posts
    );

    const generationTime = Date.now() - startTime;

    const response: PersonaResponse = {
      brand: brandName,
      personas,
      clusterConfig: DEFAULT_CLUSTER_CONFIG,
      postCount: posts.length,
      personaCount: personas.length,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(), // 7日間
      cached: false,
      llmProvider: gemini ? "gemini" : "default",
      llmModel: gemini ? "gemini-2.0-flash-exp" : "none",
      generationTimeMs: generationTime,
      quality,
    };

    console.log(
      `  完了: ${personas.length}ペルソナ, ${generationTime}ms`
    );

    return response;
  } catch (error) {
    console.error(`  [ERROR] クラスタリング失敗:`, error);
    return null;
  }
}

// メタデータ生成
interface PersonaMetadata {
  generatedAt: string;
  totalBrands: number;
  totalPersonas: number;
  brands: Array<{
    name: string;
    personaCount: number;
    postCount: number;
    quality: number;
  }>;
  clusterConfig: ClusterConfig;
}

// メイン処理
async function main() {
  const { brand } = parseArgs();

  // 出力ディレクトリ作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const brandsToProcess = brand
    ? [brand]
    : VALID_BRANDS;

  if (brand && !VALID_BRANDS.includes(brand)) {
    console.error(`Error: Unknown brand "${brand}"`);
    console.error(`Valid brands: ${VALID_BRANDS.join(", ")}`);
    process.exit(1);
  }

  console.log(`\n=== ペルソナ静的生成 ===`);
  console.log(`対象ブランド: ${brandsToProcess.join(", ")}`);
  console.log(`出力先: ${OUTPUT_DIR}\n`);

  const results: PersonaResponse[] = [];

  for (const brandName of brandsToProcess) {
    const result = await generateBrandPersonas(brandName);
    if (result) {
      results.push(result);

      // 個別ファイル保存
      const filePath = path.join(OUTPUT_DIR, `${brandName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(result, null, 2), "utf-8");
      console.log(`  保存: ${filePath}`);
    }
  }

  // メタデータ生成
  const metadata: PersonaMetadata = {
    generatedAt: new Date().toISOString(),
    totalBrands: results.length,
    totalPersonas: results.reduce((sum, r) => sum + r.personaCount, 0),
    brands: results.map((r) => ({
      name: r.brand,
      personaCount: r.personaCount,
      postCount: r.postCount,
      quality: r.quality?.overallConfidence || 0,
    })),
    clusterConfig: DEFAULT_CLUSTER_CONFIG,
  };

  const metadataPath = path.join(OUTPUT_DIR, "metadata.json");
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");

  console.log(`\n=== 完了 ===`);
  console.log(`生成ブランド数: ${results.length}`);
  console.log(`総ペルソナ数: ${metadata.totalPersonas}`);
  console.log(`メタデータ: ${metadataPath}`);
}

main().catch(console.error);
