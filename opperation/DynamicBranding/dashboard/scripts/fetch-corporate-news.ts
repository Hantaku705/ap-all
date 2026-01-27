/**
 * 世の中ニュース収集スクリプト
 *
 * NewsAPI/SerpAPIからコーポレート関連のニュースを収集し、
 * LLM（Gemini）で分析してSupabaseに保存する
 *
 * 使用方法:
 *   npx tsx scripts/fetch-corporate-news.ts --corp-id=1
 *   npx tsx scripts/fetch-corporate-news.ts --corp-id=1 --dry-run
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 環境変数
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const NEWS_API_KEY = process.env.NEWS_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// 引数パース
const args = process.argv.slice(2);
const getArg = (name: string): string | undefined => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg?.split("=")[1];
};

const corpId = parseInt(getArg("corp-id") || "1", 10);
const dryRun = args.includes("--dry-run");

// コーポレート検索キーワード（corp_idごとに定義）
const CORP_KEYWORDS: Record<number, { name: string; keywords: string[] }> = {
  1: {
    name: "味の素",
    keywords: ["味の素", "Ajinomoto", "味の素グループ", "味の素社"],
  },
};

interface NewsAPIArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  author: string | null;
  content: string | null;
}

interface AnalysisResult {
  category: string;
  sentiment: "positive" | "neutral" | "negative";
  sentiment_score: number;
  relevance_score: number;
  summary: string;
  keywords: string[];
  is_important: boolean;
  company_relevance_type: "self" | "competitor" | "industry";
}

// 競合企業リスト（LLM判定用）
const COMPETITOR_COMPANIES = [
  "キッコーマン",
  "ヤマサ醤油",
  "カゴメ",
  "ハウス食品",
  "エスビー食品",
  "日清食品",
  "明治",
  "森永製菓",
  "江崎グリコ",
  "ネスレ日本",
  "日本ハム",
  "マルハニチロ",
  "Kikkoman",
  "Kagome",
  "House Foods",
  "Nissin",
  "Meiji",
  "Morinaga",
  "Glico",
  "Nestle",
];

// NewsAPI からニュース取得
async function fetchFromNewsAPI(keywords: string[]): Promise<NewsAPIArticle[]> {
  if (!NEWS_API_KEY) {
    console.log("⚠️ NEWS_API_KEY not set, skipping NewsAPI");
    return [];
  }

  const query = keywords.join(" OR ");
  // 言語フィルタなし（日本語+英語両方取得）
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=50`;

  console.log(`📰 Fetching from NewsAPI: ${query}`);

  const res = await fetch(url, {
    headers: { "X-Api-Key": NEWS_API_KEY },
  });

  if (!res.ok) {
    console.error("NewsAPI error:", await res.text());
    return [];
  }

  const data = await res.json();
  console.log(`✅ Found ${data.articles?.length || 0} articles from NewsAPI`);
  return data.articles || [];
}

// LLM で分析
async function analyzeWithLLM(
  title: string,
  content: string,
  corpName: string
): Promise<AnalysisResult | null> {
  if (!GEMINI_API_KEY) {
    console.log("⚠️ GEMINI_API_KEY not set, skipping analysis");
    return null;
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const competitorList = COMPETITOR_COMPANIES.join("、");
  const prompt = `以下のニュース記事を分析してください。

対象企業: ${corpName}
競合企業リスト: ${competitorList}

タイトル: ${title}
内容: ${content.slice(0, 1000)}

以下のJSON形式で回答してください（コードブロックなし）:
{
  "category": "ir_finance" | "product_service" | "esg_sustainability" | "management" | "industry" | "reputation" | "other",
  "sentiment": "positive" | "neutral" | "negative",
  "sentiment_score": 0.0〜1.0（ポジティブ寄り）または -1.0〜0.0（ネガティブ寄り）,
  "relevance_score": 0.0〜1.0（${corpName}との関連度）,
  "summary": "記事の要約（100文字以内）",
  "keywords": ["キーワード1", "キーワード2", "キーワード3"],
  "is_important": true/false（経営インパクトが大きいか）,
  "company_relevance_type": "self" | "competitor" | "industry"
}

company_relevance_typeの判定基準:
- "self": ${corpName}（味の素）について直接言及している記事
- "competitor": 上記の競合企業について言及している記事（${corpName}への言及がない、または少ない）
- "industry": 食品業界全般・市場動向についての記事（特定企業への言及がない）`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // JSON抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("⚠️ Could not extract JSON from LLM response");
      return null;
    }

    return JSON.parse(jsonMatch[0]) as AnalysisResult;
  } catch (err) {
    console.error("LLM analysis error:", err);
    return null;
  }
}

// メイン処理
async function main() {
  console.log("🚀 Corporate News Fetcher");
  console.log(`  Corp ID: ${corpId}`);
  console.log(`  Dry Run: ${dryRun}`);
  console.log("");

  const corpConfig = CORP_KEYWORDS[corpId];
  if (!corpConfig) {
    console.error(`❌ Unknown corp_id: ${corpId}`);
    process.exit(1);
  }

  console.log(`📋 Fetching news for: ${corpConfig.name}`);
  console.log(`   Keywords: ${corpConfig.keywords.join(", ")}`);
  console.log("");

  // Supabase クライアント
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // ニュース取得
  const articles = await fetchFromNewsAPI(corpConfig.keywords);

  if (articles.length === 0) {
    console.log("❌ No articles found");
    return;
  }

  const startTime = Date.now();
  let insertedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`\n[${i + 1}/${articles.length}] ${article.title.slice(0, 50)}...`);

    // 既存チェック
    const { data: existing } = await supabase
      .from("corporate_world_news")
      .select("id")
      .eq("corp_id", corpId)
      .eq("url", article.url)
      .single();

    if (existing) {
      console.log("  ⏭️ Already exists, skipping");
      skippedCount++;
      continue;
    }

    // LLM分析
    const analysis = await analyzeWithLLM(
      article.title,
      article.description || article.content || "",
      corpConfig.name
    );

    // 低関連度はスキップ
    if (analysis && analysis.relevance_score < 0.3) {
      console.log(`  ⏭️ Low relevance (${analysis.relevance_score}), skipping`);
      skippedCount++;
      continue;
    }

    if (dryRun) {
      console.log("  📝 [DRY RUN] Would insert:");
      console.log(`     Category: ${analysis?.category || "N/A"}`);
      console.log(`     Sentiment: ${analysis?.sentiment || "N/A"}`);
      console.log(`     Relevance: ${analysis?.relevance_score || "N/A"}`);
      console.log(`     Company: ${analysis?.company_relevance_type || "N/A"}`);
      continue;
    }

    // 挿入
    const { error } = await supabase.from("corporate_world_news").insert({
      corp_id: corpId,
      title: article.title,
      content: article.description || article.content,
      url: article.url,
      source_name: article.source.name,
      source_type: "news",
      published_at: article.publishedAt,
      author: article.author,
      image_url: article.urlToImage,
      category: analysis?.category || "other",
      sentiment: analysis?.sentiment || "neutral",
      sentiment_score: analysis?.sentiment_score || 0,
      relevance_score: analysis?.relevance_score || 0.5,
      summary: analysis?.summary || null,
      keywords: analysis?.keywords || [],
      is_important: analysis?.is_important || false,
      company_relevance_type: analysis?.company_relevance_type || "self",
      raw_data: article,
    } as never);

    if (error) {
      console.error(`  ❌ Insert error: ${error.message}`);
    } else {
      console.log("  ✅ Inserted");
      insertedCount++;
    }

    // レートリミット対策
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const duration = Date.now() - startTime;

  // フェッチログ記録
  if (!dryRun) {
    await supabase.from("corporate_news_fetch_log").insert({
      corp_id: corpId,
      source: "newsapi",
      articles_count: insertedCount,
      status: "success",
      duration_ms: duration,
    } as never);
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Summary:");
  console.log(`   Total articles: ${articles.length}`);
  console.log(`   Inserted: ${insertedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
