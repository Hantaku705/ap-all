/**
 * LLMベースのBrand Personality生成スクリプト
 *
 * 5軸スコアとUGC根拠からLLMがパーソナリティラベルを生成
 *
 * 実行方法:
 * npx tsx scripts/generate-personality-llm.ts
 */

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { resolve } from "path";
import fs from "fs";
import path from "path";

import { calculateAllScores, PersonalityScores } from "../src/lib/personality/score-calculator";
import { PersonalityAxis, getKeywordStats } from "../src/lib/personality/keyword-dictionary";

// .env.local を読み込み
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\\n/g, "").trim() || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\\n/g, "").trim() || "";
const geminiKey = process.env.GEMINI_API_KEY?.replace(/\\n/g, "").trim() || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase credentials not found");
  process.exit(1);
}

if (!geminiKey) {
  console.error("Error: Gemini API key not found");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);

const OUTPUT_DIR = path.resolve(process.cwd(), "output/corporate");

/**
 * UGC投稿を取得
 */
async function fetchUGCPosts(corporateId: number): Promise<string[]> {
  console.log("Fetching brand hierarchy...");

  const { data: hierarchy } = await supabase
    .from("brand_hierarchy")
    .select("product_brand_id")
    .eq("corporate_brand_id", corporateId);

  const productBrandIds = hierarchy?.map((h) => h.product_brand_id) ?? [];

  const { data: brands } = await supabase
    .from("brands")
    .select("id, name")
    .in("id", productBrandIds);

  const brandNames = brands?.map((b) => b.name) ?? [];
  console.log(`  Brands: ${brandNames.join(", ")}`);

  const allPosts: string[] = [];

  for (const brandName of brandNames) {
    const PAGE_SIZE = 1000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: posts } = await supabase
        .from("sns_posts")
        .select("content")
        .ilike("brand_mentions", `%${brandName}%`)
        .not("content", "is", null)
        .range(offset, offset + PAGE_SIZE - 1);

      if (posts && posts.length > 0) {
        for (const post of posts) {
          if (post.content) {
            allPosts.push(post.content as string);
          }
        }
        offset += PAGE_SIZE;
      }

      hasMore = !!(posts && posts.length === PAGE_SIZE);
    }
  }

  console.log(`  Total: ${allPosts.length} posts`);
  return allPosts;
}

/**
 * LLMでパーソナリティを生成
 */
async function generatePersonalityWithLLM(
  corporateName: string,
  scores: PersonalityScores
): Promise<{
  personality: string;
  description: string;
  tone: string;
  reasoning: string;
  alternatives: string[];
}> {
  const axes: PersonalityAxis[] = ["intellect", "innovation", "warmth", "reliability", "boldness"];

  // スコアサマリーを作成
  const scoreSummary = axes.map((axis) => {
    const s = scores[axis];
    const topKw = s.topKeywords.slice(0, 5).map((k) => `${k.word}(${k.count})`).join(", ");
    return `- ${axis}: ${s.score}/100\n  キーワード: ${topKw}\n  サンプル投稿: 「${s.evidence[0]?.slice(0, 80) || "なし"}...」`;
  }).join("\n\n");

  const systemPrompt = `あなたはブランド戦略の専門家です。
UGCデータの分析結果から、企業のブランドパーソナリティを人格化した表現で提案してください。

## 要件
1. パーソナリティは「〇〇な△△」のような10文字以内のキャッチーな表現
2. 生活者がSNSで語っている印象に基づく
3. 社内マーケティング資料で使える表現
4. 単なる形容詞ではなく、人物像が浮かぶ表現

## 良い例
- 「インテリのヘンタイ」（知性+遊び心）
- 「頼れる実家の母」（安心感+親しみ）
- 「真面目なムードメーカー」（信頼+明るさ）
- 「こだわりの職人肌」（品質+専門性）

## 悪い例
- 「信頼できるブランド」（抽象的すぎる）
- 「美味しい調味料」（商品説明になっている）
- 「日本を代表する」（主観的すぎる）`;

  const userPrompt = `# ${corporateName} のブランドパーソナリティ分析

## UGC分析結果（${scores.totalPostsAnalyzed}件の投稿を分析）

${scoreSummary}

## タスク
上記の分析結果から、${corporateName}のブランドパーソナリティを提案してください。

以下のJSON形式で回答してください：
{
  "personality": "メインのパーソナリティ表現（10文字以内）",
  "description": "このパーソナリティの説明（50文字以内）",
  "tone": "親しみやすい/尊敬・憧れ/ユーモア混じり のいずれか",
  "reasoning": "なぜこのパーソナリティを選んだか（データに基づく根拠）",
  "alternatives": ["代替案1", "代替案2", "代替案3"]
}`;

  console.log("\nCalling Gemini API...");

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `${systemPrompt}\n\n---\n\n${userPrompt}\n\nJSON形式で回答してください。`;

  const response = await model.generateContent(prompt);
  const responseText = response.response.text();

  // JSONを抽出（```json ... ``` の中身を取得）
  const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/\{[\s\S]*\}/);
  const content = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : "{}";
  const result = JSON.parse(content);

  return {
    personality: result.personality || "バランス型パートナー",
    description: result.description || "",
    tone: result.tone || "親しみやすい",
    reasoning: result.reasoning || "",
    alternatives: result.alternatives || [],
  };
}

/**
 * MVV JSONを生成
 */
function generateMVVJson(
  corporateId: number,
  scores: PersonalityScores,
  llmResult: Awaited<ReturnType<typeof generatePersonalityWithLLM>>
) {
  const axes: PersonalityAxis[] = ["intellect", "innovation", "warmth", "reliability", "boldness"];

  const personalityTraitsSimple: Record<string, number> = {};
  const personalityTraitsDetailed: Record<string, object> = {};

  for (const axis of axes) {
    const s = scores[axis];
    personalityTraitsSimple[axis] = s.score;

    const keywords: Record<string, number> = {};
    for (const kw of s.topKeywords.slice(0, 5)) {
      keywords[kw.word] = kw.count;
    }

    personalityTraitsDetailed[axis] = {
      score: s.score,
      keywords,
      top_evidence: s.evidence.slice(0, 3),
    };
  }

  return {
    mvv: {
      id: 0,
      corporate_brand_id: corporateId,
      mission: "食と健康の科学で、人々の暮らしを支える",
      vision: "世界中の食卓に笑顔と安心を届ける",
      purpose: "おいしさの追求を通じて、日常の幸せを創造する",
      values: ["品質へのこだわり", "科学的探究心", "家族の健康", "信頼と安心", "伝統と革新"],
      personality: llmResult.personality,
      personality_description: llmResult.description,
      personality_tone: llmResult.tone,
      personality_reasoning: llmResult.reasoning,
      personality_alternatives: llmResult.alternatives,
      personality_traits: personalityTraitsSimple,
      personality_traits_detailed: personalityTraitsDetailed,
      evidence: {
        mission_evidence: ["UGCデータからの自動抽出", `${scores.totalPostsAnalyzed}件の投稿を分析`],
        vision_evidence: ["UGCデータからの自動抽出"],
        values_evidence: ["UGCデータからの自動抽出"],
        personality_evidence: [llmResult.reasoning],
      },
      selection_reason: llmResult.reasoning,
      llm_provider: "openai",
      llm_model: "gpt-4o",
      posts_analyzed: scores.totalPostsAnalyzed,
      methodology: "ルールベーススコアリング + LLMラベル生成",
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    cached: false,
    generation_time_ms: 0,
    generated_at: new Date().toISOString(),
  };
}

async function main() {
  console.log("=".repeat(60));
  console.log("Brand Personality Generator (LLM-Enhanced)");
  console.log("=".repeat(60));

  const corporateId = 1;
  const corporateName = "味の素グループ";

  // 1. UGC取得
  const posts = await fetchUGCPosts(corporateId);

  if (posts.length === 0) {
    console.error("Error: No posts found");
    process.exit(1);
  }

  // 2. スコア算出
  console.log("\nCalculating scores...");
  const scores = calculateAllScores(posts);

  console.log("\nScores:");
  const axes: PersonalityAxis[] = ["intellect", "innovation", "warmth", "reliability", "boldness"];
  for (const axis of axes) {
    console.log(`  ${axis}: ${scores[axis].score}`);
  }

  // 3. LLMでパーソナリティ生成
  const llmResult = await generatePersonalityWithLLM(corporateName, scores);

  console.log("\n" + "=".repeat(60));
  console.log("LLM Generated Personality:");
  console.log("=".repeat(60));
  console.log(`\n  【パーソナリティ】${llmResult.personality}`);
  console.log(`  【説明】${llmResult.description}`);
  console.log(`  【トーン】${llmResult.tone}`);
  console.log(`  【根拠】${llmResult.reasoning}`);
  console.log(`  【代替案】${llmResult.alternatives.join(" / ")}`);

  // 4. JSON保存
  const mvvData = generateMVVJson(corporateId, scores, llmResult);
  const mvvPath = path.join(OUTPUT_DIR, "1-mvv.json");
  fs.writeFileSync(mvvPath, JSON.stringify(mvvData, null, 2));
  console.log(`\n  Saved: ${mvvPath}`);

  console.log("\n" + "=".repeat(60));
  console.log("Done!");
  console.log("=".repeat(60));
}

main().catch(console.error);
