/**
 * 既存の世の中ニュースにcompany_relevance_typeを付与するスクリプト
 *
 * 使用方法:
 *   npx tsx scripts/relabel-world-news.ts --corp-id=1
 *   npx tsx scripts/relabel-world-news.ts --corp-id=1 --dry-run
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 環境変数
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// 引数パース
const args = process.argv.slice(2);
const getArg = (name: string): string | undefined => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg?.split("=")[1];
};

const corpId = parseInt(getArg("corp-id") || "1", 10);
const dryRun = args.includes("--dry-run");

// コーポレート名マッピング
const CORP_NAMES: Record<number, string> = {
  1: "味の素",
};

// 競合企業リスト
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

type CompanyRelevanceType = "self" | "competitor" | "industry";

// LLMで関連性判定
async function analyzeCompanyRelevance(
  title: string,
  content: string | null,
  corpName: string
): Promise<CompanyRelevanceType | null> {
  if (!GEMINI_API_KEY) {
    console.log("⚠️ GEMINI_API_KEY not set, skipping analysis");
    return null;
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const competitorList = COMPETITOR_COMPANIES.join("、");
  const prompt = `以下のニュース記事の関連性を判定してください。

対象企業: ${corpName}
競合企業リスト: ${competitorList}

タイトル: ${title}
内容: ${(content || "").slice(0, 500)}

以下の3つから1つだけ回答してください（理由なし、単語のみ）:
- self: ${corpName}（味の素）について直接言及している記事
- competitor: 上記の競合企業について言及している記事
- industry: 食品業界全般・市場動向についての記事

回答:`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().toLowerCase();

    if (text.includes("self")) return "self";
    if (text.includes("competitor")) return "competitor";
    if (text.includes("industry")) return "industry";

    // デフォルト判定
    const titleLower = title.toLowerCase();
    if (
      titleLower.includes("味の素") ||
      titleLower.includes("ajinomoto")
    ) {
      return "self";
    }
    if (
      COMPETITOR_COMPANIES.some(
        (c) =>
          titleLower.includes(c.toLowerCase()) ||
          (content && content.toLowerCase().includes(c.toLowerCase()))
      )
    ) {
      return "competitor";
    }
    return "industry";
  } catch (err) {
    console.error("LLM analysis error:", err);
    return null;
  }
}

async function main() {
  console.log("🔄 World News Re-labeling");
  console.log(`  Corp ID: ${corpId}`);
  console.log(`  Dry Run: ${dryRun}`);
  console.log("");

  const corpName = CORP_NAMES[corpId];
  if (!corpName) {
    console.error(`❌ Unknown corp_id: ${corpId}`);
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // company_relevance_typeがnullの記事を取得
  const { data: news, error } = await supabase
    .from("corporate_world_news")
    .select("id, title, content, company_relevance_type")
    .eq("corp_id", corpId)
    .is("company_relevance_type", null);

  if (error) {
    console.error("❌ Failed to fetch news:", error.message);
    process.exit(1);
  }

  if (!news || news.length === 0) {
    console.log("✅ All news already labeled");
    return;
  }

  console.log(`📰 Found ${news.length} unlabeled news`);
  console.log("");

  let updatedCount = 0;

  for (let i = 0; i < news.length; i++) {
    const item = news[i];
    console.log(`[${i + 1}/${news.length}] ${item.title.slice(0, 40)}...`);

    const relevanceType = await analyzeCompanyRelevance(
      item.title,
      item.content,
      corpName
    );

    if (!relevanceType) {
      console.log("  ⏭️ Skipped (analysis failed)");
      continue;
    }

    console.log(`  → ${relevanceType}`);

    if (dryRun) {
      console.log("  📝 [DRY RUN] Would update");
      continue;
    }

    const { error: updateError } = await supabase
      .from("corporate_world_news")
      .update({ company_relevance_type: relevanceType } as never)
      .eq("id", item.id);

    if (updateError) {
      console.error(`  ❌ Update failed: ${updateError.message}`);
    } else {
      console.log("  ✅ Updated");
      updatedCount++;
    }

    // レートリミット対策
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log("");
  console.log("=" .repeat(50));
  console.log("📊 Summary:");
  console.log(`   Total: ${news.length}`);
  console.log(`   Updated: ${updatedCount}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
