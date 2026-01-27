import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

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

// CEP名マッピング
const CEP_NAMES: Record<string, string> = {
  time_saving_weeknight: "平日夜の時短",
  taste_anxiety: "味付け不安解消",
  weekend_cooking: "週末の本格料理",
  kids_picky_eating: "子ども好き嫌い",
  solo_easy_meal: "一人暮らし手抜き",
  health_conscious: "健康意識",
  entertaining: "おもてなし",
  drinking_snacks: "晩酌おつまみ",
  leftover_remake: "残り物リメイク",
  seasonal_taste: "季節の味覚",
  diet_satisfaction: "ダイエット中",
  morning_time_save: "朝の時短",
};

// Context生成用マッピング
const INTENT_WHY: Record<string, string> = {
  usage_report: "実際に使って良かった体験を共有したい",
  recipe_share: "レシピや使い方を共有したい",
  purchase_consider: "購入を検討している",
  question: "使い方や選び方を知りたい",
  complaint: "不満や改善点がある",
  other: "その他の理由",
};

// Motivation Category → Why（日本語）
const MOTIVATION_WHY: Record<string, string> = {
  time_pressure: "時間がない中で手早く作りたい",
  taste_assurance: "失敗せず確実においしく作りたい",
  variety_seeking: "いつもと違う料理に挑戦したい",
  skill_confidence: "料理スキルに自信がない",
  cost_saving: "節約しながらおいしく作りたい",
  health_concern: "健康に気を使った料理を作りたい",
  comfort_food: "慣れ親しんだ味で安心したい",
  impression: "誰かを喜ばせたい・印象づけたい",
  unknown: "調理をより良くしたい",
};

const MEAL_OCCASION_WHEN: Record<string, string> = {
  weekday_dinner_rush: "平日夜（急いで作る必要がある時）",
  weekday_dinner_leisurely: "平日夜（ゆっくり作れる時）",
  weekend_brunch: "週末ブランチ",
  weekend_dinner: "週末夕食",
  lunch_box: "お弁当作り",
  late_night_snack: "夜食・晩酌",
  breakfast: "朝食",
  party: "パーティー・おもてなし",
  unknown: "時間帯不明",
};

const COOKING_FOR_WHOM: Record<string, string> = {
  self: "自分のため",
  family: "家族のため",
  kids: "子どものため",
  spouse: "配偶者のため",
  parents: "親・高齢者のため",
  guest: "来客のため",
  multiple: "複数の人のため",
  unknown: "対象不明",
};

// Use Case型定義
interface UseCase {
  id: string;
  name: string;
  context: {
    why: string;
    when: string;
    where: string;
    withWhom: string;
  };
  positioning: {
    competitors: string[];
    pop: string[];
    pod: string[];
  };
  evidence: {
    postCount: number;
    topKeywords: string[];
    samplePosts: string[];
  };
}

interface DPTResponse {
  brandName: string;
  useCases: UseCase[];
  generatedAt: string;
  postCount: number;
}

// LLMプロンプト
const SYSTEM_PROMPT = `あなたは調味料ブランドのポジショニング分析エキスパートです。

各Use Caseについて、以下の観点で分析してください：

## 競合カテゴリの特定
具体的なブランド名は使わず、カテゴリ名で記載してください。
例: "冷凍食品", "レトルト食品", "総菜・中食", "外食", "他社調味料"

## POP（Point of Parity）
生活者視点で、競合カテゴリと同等に提供できる価値
- 機能的価値（時短、簡単、失敗しない等）
- 感情的価値（安心、満足等）
3〜5点で記載

## POD（Point of Difference）
競合カテゴリにはない、このブランドならではの差別化価値
- 本質的な強み
- 感情的なベネフィット
- 生活者インサイト
3〜5点で記載

## 出力形式
JSONで出力してください。説明は不要です。
{
  "useCases": [
    {
      "id": "uc_1",
      "positioning": {
        "competitors": ["冷凍食品", "レトルト食品"],
        "pop": ["手軽さ", "時短調理", "失敗しない"],
        "pod": ["本格的な味", "アレンジ自在", "罪悪感なし"]
      }
    }
  ]
}`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandName: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const openai = getOpenAIClient();
    const { brandName } = await params;
    const decodedBrand = decodeURIComponent(brandName);
    const refresh = request.nextUrl.searchParams.get("refresh") === "true";

    // ブランド名の検証
    if (!VALID_BRANDS.includes(decodedBrand)) {
      return NextResponse.json(
        { error: "Invalid brand name" },
        { status: 404 }
      );
    }

    // ブランドID取得
    const { data: brandData, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("name", decodedBrand)
      .single();

    if (brandError || !brandData) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // キャッシュ確認（refreshパラメータがなければ）
    if (!refresh) {
      const { data: cacheData } = await supabase
        .from("brand_dpt_cache")
        .select("dpt_data, generated_at, post_count, use_case_count")
        .eq("brand_id", brandData.id)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (cacheData) {
        const dptData = cacheData.dpt_data as { useCases: UseCase[] };
        return NextResponse.json({
          brandName: decodedBrand,
          useCases: dptData.useCases,
          generatedAt: cacheData.generated_at,
          postCount: cacheData.post_count,
        });
      }
    }

    // SNS投稿からUse Case候補を集計
    const useCases = await extractUseCases(decodedBrand);

    if (useCases.length === 0) {
      return NextResponse.json({
        brandName: decodedBrand,
        useCases: [],
        generatedAt: new Date().toISOString(),
        postCount: 0,
      });
    }

    // 総投稿数を取得
    const { count: totalPostCount } = await supabase
      .from("sns_posts")
      .select("*", { count: "exact", head: true })
      .ilike("brand_mentions", `%${decodedBrand}%`);

    // LLMでPOP/POD生成
    const startTime = Date.now();
    const enrichedUseCases = await generatePositioning(decodedBrand, useCases);
    const generationTime = Date.now() - startTime;

    // キャッシュに保存
    const dptData: DPTResponse = {
      brandName: decodedBrand,
      useCases: enrichedUseCases,
      generatedAt: new Date().toISOString(),
      postCount: totalPostCount || 0,
    };

    await supabase.from("brand_dpt_cache").upsert(
      {
        brand_id: brandData.id,
        dpt_data: { useCases: enrichedUseCases },
        post_count: totalPostCount || 0,
        use_case_count: enrichedUseCases.length,
        llm_provider: "openai",
        llm_model: "gpt-4o-mini",
        generation_time_ms: generationTime,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "brand_id" }
    );

    return NextResponse.json(dptData);
  } catch (error) {
    console.error("Failed to generate DPT:", error);
    return NextResponse.json(
      { error: "Failed to generate DPT" },
      { status: 500 }
    );
  }
}

// SNS投稿からUse Case候補を抽出
async function extractUseCases(brandName: string): Promise<UseCase[]> {
  const supabase = getSupabaseClient();
  // CEP別の投稿数を集計
  const { data: cepAggregation } = await supabase
    .from("sns_posts")
    .select("cep_id, intent, emotion, cooking_for, meal_occasion, motivation_category, content")
    .ilike("brand_mentions", `%${brandName}%`)
    .not("cep_id", "is", null);

  if (!cepAggregation || cepAggregation.length === 0) {
    return [];
  }

  // CEP ID → カテゴリ名のマッピングを取得
  const { data: ceps } = await supabase
    .from("ceps")
    .select("id, cep_name, category");

  const cepMap = new Map(ceps?.map(c => [c.id, c]) || []);

  // CEPごとに集計
  const cepGroups = new Map<number, typeof cepAggregation>();
  for (const post of cepAggregation) {
    if (!post.cep_id) continue;
    const group = cepGroups.get(post.cep_id) || [];
    group.push(post);
    cepGroups.set(post.cep_id, group);
  }

  // 投稿数が多い順にソート、上位5〜8件を採用
  const sortedCeps = Array.from(cepGroups.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 8);

  // Use Case構造に変換
  const useCases: UseCase[] = [];

  for (const [cepId, posts] of sortedCeps) {
    if (posts.length < 5) continue; // 最低5件以上

    const cepInfo = cepMap.get(cepId);
    if (!cepInfo) continue;

    // 最頻出のintent, emotion, cooking_forを取得
    const intentCounts = countValues(posts, "intent");
    const emotionCounts = countValues(posts, "emotion");
    const cookingForCounts = countValues(posts, "cooking_for");
    const mealOccasionCounts = countValues(posts, "meal_occasion");
    const motivationCounts = countValues(posts, "motivation_category");

    const topIntent = Object.entries(intentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "other";
    const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";
    const topCookingFor = Object.entries(cookingForCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";
    const topMealOccasion = Object.entries(mealOccasionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";
    const topMotivation = Object.entries(motivationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    // キーワード抽出（簡易版：投稿内容から頻出単語）
    const keywords = extractKeywords(posts.map(p => p.content || ""));

    // サンプル投稿を取得（最初の3件）
    const samplePosts = posts
      .slice(0, 3)
      .map(p => (p.content || "").slice(0, 100));

    const cepName = CEP_NAMES[cepInfo.category] || cepInfo.cep_name;

    useCases.push({
      id: `uc_${useCases.length + 1}`,
      name: cepName,
      context: {
        why: MOTIVATION_WHY[topMotivation] || INTENT_WHY[topIntent] || "調理をより良くしたい",
        when: MEAL_OCCASION_WHEN[topMealOccasion] || "日常の食事時",
        where: "自宅キッチン",
        withWhom: COOKING_FOR_WHOM[topCookingFor] || "家族",
      },
      positioning: {
        competitors: [], // LLMで生成
        pop: [],
        pod: [],
      },
      evidence: {
        postCount: posts.length,
        topKeywords: keywords.slice(0, 5),
        samplePosts,
      },
    });
  }

  return useCases;
}

// 値のカウント
function countValues(
  posts: Array<{ [key: string]: unknown }>,
  key: string
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const post of posts) {
    const value = post[key] as string;
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
  }
  return counts;
}

// キーワード抽出（簡易版）
function extractKeywords(contents: string[]): string[] {
  const text = contents.join(" ");
  const words = text
    .replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\w]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 2 && w.length <= 10);

  const wordCounts: Record<string, number> = {};
  for (const word of words) {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }

  // 除外ワード
  const excludes = new Set(["する", "ある", "いる", "なる", "できる", "という", "これ", "それ", "あれ", "この", "その", "あの"]);

  return Object.entries(wordCounts)
    .filter(([word]) => !excludes.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// LLMでPOP/POD生成
async function generatePositioning(
  brandName: string,
  useCases: UseCase[]
): Promise<UseCase[]> {
  const openai = getOpenAIClient();
  if (!openai) {
    // OpenAI APIキーがない場合はデフォルト値を設定
    return useCases.map(uc => ({
      ...uc,
      positioning: {
        competitors: ["冷凍食品", "レトルト食品", "外食"],
        pop: ["手軽さ", "時短調理", "失敗しない味付け"],
        pod: ["本格的な味わい", "アレンジの自由度", "手作り感"],
      },
    }));
  }

  const userPrompt = `
ブランド: ${brandName}

以下のUse Caseデータを分析し、POP/PODを生成してください：

${useCases
  .map(
    (uc, i) => `
## Use Case ${i + 1}: ${uc.name}
- ID: ${uc.id}
- 利用文脈: ${uc.context.why}
- 時間帯: ${uc.context.when}
- 対象: ${uc.context.withWhom}
- 投稿数: ${uc.evidence.postCount}件
- キーワード: ${uc.evidence.topKeywords.join(", ")}
- 代表投稿:
${uc.evidence.samplePosts.map(p => `  - "${p}"`).join("\n")}
`
  )
  .join("\n")}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from LLM");
    }

    const result = JSON.parse(content) as { useCases: Array<{ id: string; positioning: UseCase["positioning"] }> };

    // 生成されたpositioningをマージ
    return useCases.map(uc => {
      const generated = result.useCases.find(g => g.id === uc.id);
      if (generated?.positioning) {
        return {
          ...uc,
          positioning: generated.positioning,
        };
      }
      return {
        ...uc,
        positioning: {
          competitors: ["冷凍食品", "レトルト食品", "外食"],
          pop: ["手軽さ", "時短調理"],
          pod: ["本格的な味わい", "アレンジ自在"],
        },
      };
    });
  } catch (error) {
    console.error("LLM generation failed:", error);
    // フォールバック：デフォルト値を設定
    return useCases.map(uc => ({
      ...uc,
      positioning: {
        competitors: ["冷凍食品", "レトルト食品", "外食"],
        pop: ["手軽さ", "時短調理", "失敗しない味付け"],
        pod: ["本格的な味わい", "アレンジの自由度", "手作り感"],
      },
    }));
  }
}
