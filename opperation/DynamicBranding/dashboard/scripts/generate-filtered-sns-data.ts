/**
 * ブランド別SNSデータ生成スクリプト
 * - sentiments/{brand}.json を生成
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

interface SentimentData {
  brand: string;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  negativeRate: number;
  total: number;
}

async function fetchAllPosts(): Promise<
  { brand_mentions: string; sentiment: string }[]
> {
  const PAGE_SIZE = 1000;
  let offset = 0;
  let hasMore = true;
  const allPosts: { brand_mentions: string; sentiment: string }[] = [];

  while (hasMore) {
    const { data, error } = await supabase
      .from("sns_posts")
      .select("brand_mentions, sentiment")
      .not("sentiment", "is", null)
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

async function generateBrandSentiments() {
  console.log("Fetching all SNS posts...");
  const posts = await fetchAllPosts();
  console.log(`Total posts with sentiment: ${posts.length}`);

  const outputDir = path.join(process.cwd(), "output", "sns", "sentiments");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 全体データ
  const allData: SentimentData[] = [];

  for (const brand of BRANDS) {
    const brandPosts = posts.filter((p) =>
      p.brand_mentions?.includes(brand)
    );

    const positiveCount = brandPosts.filter(
      (p) => p.sentiment === "positive"
    ).length;
    const neutralCount = brandPosts.filter(
      (p) => p.sentiment === "neutral"
    ).length;
    const negativeCount = brandPosts.filter(
      (p) => p.sentiment === "negative"
    ).length;
    const total = positiveCount + neutralCount + negativeCount;
    const negativeRate = total > 0 ? Math.round((negativeCount / total) * 10000) / 100 : 0;

    const data: SentimentData = {
      brand,
      positiveCount,
      neutralCount,
      negativeCount,
      negativeRate,
      total,
    };

    allData.push(data);

    // ブランド別ファイル出力
    const filePath = path.join(outputDir, `${brand}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Generated: ${filePath} (${total} posts)`);
  }

  // 全体ファイル出力（ネガティブ率でソート）
  allData.sort((a, b) => b.negativeRate - a.negativeRate);
  const allFilePath = path.join(outputDir, "all.json");
  fs.writeFileSync(allFilePath, JSON.stringify(allData, null, 2));
  console.log(`Generated: ${allFilePath}`);
}

generateBrandSentiments()
  .then(() => console.log("Done!"))
  .catch(console.error);
