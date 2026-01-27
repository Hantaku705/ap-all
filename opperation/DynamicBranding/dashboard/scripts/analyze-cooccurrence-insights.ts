/**
 * 共起インサイト分析スクリプト
 * - マルチブランド投稿を抽出
 * - ブランドペア毎に代表投稿・パターン・インサイトを生成
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const anthropicApiKey = process.env.ANTHROPIC_API_KEY_TAKUMI || process.env.ANTHROPIC_API_KEY;

const BRANDS = [
  "味の素",
  "ほんだし",
  "コンソメ",
  "クックドゥ",
  "アジシオ",
  "丸鶏がらスープ",
  "香味ペースト",
  "ピュアセレクト",
];

interface Post {
  id: string;
  content: string;
  brand_mentions: string;
  sentiment: string | null;
  cep_id: string | null;
  emotion: string | null;
  intent: string | null;
  dish_name: string | null;
  meal_occasion: string | null;
}

interface CooccurrencePair {
  brand1: string;
  brand2: string;
  count: number;
  representativePosts: Array<{
    id: string;
    content: string;
    sentiment: string | null;
    dish: string | null;
    scene: string | null;
  }>;
  patterns: {
    dishes: string[];
    scenes: string[];
    sentiments: Record<string, number>;
  };
  insight: string;
}

async function fetchMultiBrandPosts(): Promise<Post[]> {
  const PAGE_SIZE = 1000;
  let offset = 0;
  let hasMore = true;
  const allPosts: Post[] = [];

  while (hasMore) {
    const { data, error } = await supabase
      .from("sns_posts")
      .select(
        "id, content, brand_mentions, sentiment, cep_id, emotion, intent, dish_name, meal_occasion"
      )
      .eq("is_multi_brand", true)
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      allPosts.push(...data);
      offset += PAGE_SIZE;
    }
    hasMore = data !== null && data.length === PAGE_SIZE;
  }

  return allPosts;
}

function extractBrandPairs(
  posts: Post[]
): Map<string, Post[]> {
  const pairMap = new Map<string, Post[]>();

  for (const post of posts) {
    if (!post.brand_mentions) continue;

    const brands = post.brand_mentions.split(",").filter((b) => BRANDS.includes(b.trim()));
    if (brands.length < 2) continue;

    // 全ペアを抽出
    for (let i = 0; i < brands.length; i++) {
      for (let j = i + 1; j < brands.length; j++) {
        const pair = [brands[i].trim(), brands[j].trim()].sort().join("|");
        if (!pairMap.has(pair)) {
          pairMap.set(pair, []);
        }
        pairMap.get(pair)!.push(post);
      }
    }
  }

  return pairMap;
}

function analyzePatterns(posts: Post[]): CooccurrencePair["patterns"] {
  const dishes: Record<string, number> = {};
  const scenes: Record<string, number> = {};
  const sentiments: Record<string, number> = {};

  for (const post of posts) {
    if (post.dish_name) {
      dishes[post.dish_name] = (dishes[post.dish_name] || 0) + 1;
    }
    if (post.meal_occasion) {
      scenes[post.meal_occasion] = (scenes[post.meal_occasion] || 0) + 1;
    }
    if (post.sentiment) {
      sentiments[post.sentiment] = (sentiments[post.sentiment] || 0) + 1;
    }
  }

  // 上位5件に絞る
  const topDishes = Object.entries(dishes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  const topScenes = Object.entries(scenes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  return {
    dishes: topDishes,
    scenes: topScenes,
    sentiments,
  };
}

async function generateInsight(
  brand1: string,
  brand2: string,
  posts: Post[],
  patterns: CooccurrencePair["patterns"]
): Promise<string> {
  if (!anthropicApiKey) {
    return `${brand1}と${brand2}が同時に言及される投稿が${posts.length}件見つかりました。`;
  }

  const anthropic = new Anthropic({ apiKey: anthropicApiKey });

  const samplePosts = posts
    .slice(0, 10)
    .map((p) => `- ${p.content.slice(0, 200)}`)
    .join("\n");

  const prompt = `以下は「${brand1}」と「${brand2}」が同時に言及されているSNS投稿の分析です。

## 統計
- 投稿数: ${posts.length}件
- よく出てくる料理: ${patterns.dishes.join(", ") || "不明"}
- よく出てくるシーン: ${patterns.scenes.join(", ") || "不明"}
- センチメント: positive ${patterns.sentiments.positive || 0}件, neutral ${patterns.sentiments.neutral || 0}件, negative ${patterns.sentiments.negative || 0}件

## サンプル投稿
${samplePosts}

## タスク
上記を踏まえて、この2つのブランドが同時に言及される理由・文脈を2-3文で簡潔に分析してください。
マーケティング施策への示唆も含めてください。`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    return textContent?.text || "インサイト生成に失敗しました";
  } catch (err) {
    return `${brand1}と${brand2}は同時に使用されることが多いようです（${posts.length}件）。`;
  }
}

async function main() {
  console.log("Fetching multi-brand posts...");
  const posts = await fetchMultiBrandPosts();
  console.log(`Found ${posts.length} multi-brand posts`);

  console.log("Extracting brand pairs...");
  const pairMap = extractBrandPairs(posts);
  console.log(`Found ${pairMap.size} unique brand pairs`);

  const pairs: CooccurrencePair[] = [];

  for (const [pairKey, pairPosts] of pairMap) {
    const [brand1, brand2] = pairKey.split("|");
    if (pairPosts.length < 3) continue; // 3件未満はスキップ

    console.log(`Analyzing: ${brand1} × ${brand2} (${pairPosts.length} posts)`);

    const patterns = analyzePatterns(pairPosts);
    const insight = await generateInsight(brand1, brand2, pairPosts, patterns);

    pairs.push({
      brand1,
      brand2,
      count: pairPosts.length,
      representativePosts: pairPosts.slice(0, 5).map((p) => ({
        id: p.id,
        content: p.content.slice(0, 300),
        sentiment: p.sentiment,
        dish: p.dish_name,
        scene: p.meal_occasion,
      })),
      patterns,
      insight,
    });

    // レート制限対策
    await new Promise((r) => setTimeout(r, 500));
  }

  // カウント降順でソート
  pairs.sort((a, b) => b.count - a.count);

  // 出力
  const outputDir = path.join(process.cwd(), "output", "sns");
  const outputPath = path.join(outputDir, "cooccurrence-insights.json");
  fs.writeFileSync(outputPath, JSON.stringify({ pairs }, null, 2));
  console.log(`Generated: ${outputPath}`);
  console.log(`Total pairs analyzed: ${pairs.length}`);
}

main().catch(console.error);
