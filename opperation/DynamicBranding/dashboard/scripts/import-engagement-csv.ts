/**
 * AnyMind CSVからエンゲージメントデータをインポート
 *
 * 実行方法:
 * 1. Supabaseで 010_engagement.sql を実行
 * 2. npx tsx scripts/import-engagement-csv.ts
 *
 * 処理:
 * - 新CSVを読み込み（50,000件）
 * - URLで既存sns_postsとマッチング
 * - マッチしたらエンゲージメント更新
 * - マッチしなかったら新規挿入
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { config } from "dotenv";
import { resolve } from "path";

// .env.local を明示的に読み込み
config({ path: resolve(process.cwd(), ".env.local") });

// 環境変数チェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CSVファイルパス
const CSV_PATH = path.resolve(
  __dirname,
  "../../data/sns/raw/export_AnyMindGroup_味の素_sfHCe37Z.csv"
);

// ブランド検出パターン
const BRAND_PATTERNS = [
  { name: "ほんだし", patterns: ["ほんだし", "本だし", "ホンダシ"] },
  { name: "クックドゥ", patterns: ["クックドゥ", "CookDo", "cook do", "クックドゥー"] },
  { name: "味の素", patterns: ["味の素", "あじのもと", "アジノモト", "味の素ギョーザ", "味の素冷凍餃子"] },
  { name: "コンソメ", patterns: ["コンソメ", "コンソメキューブ"] },
  { name: "丸鶏がらスープ", patterns: ["丸鶏がらスープ", "丸鶏ガラ", "がらスープ", "鶏ガラスープ"] },
  { name: "香味ペースト", patterns: ["香味ペースト"] },
  { name: "アジシオ", patterns: ["アジシオ", "味塩", "あじしお"] },
  { name: "ピュアセレクト", patterns: ["ピュアセレクト", "pure select"] },
  { name: "鍋キューブ", patterns: ["鍋キューブ", "なべキューブ"] },
];

/**
 * テキストからブランドを検出
 */
function detectBrands(text: string): string[] {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const detected: string[] = [];

  for (const brand of BRAND_PATTERNS) {
    for (const pattern of brand.patterns) {
      if (lowerText.includes(pattern.toLowerCase())) {
        if (!detected.includes(brand.name)) {
          detected.push(brand.name);
        }
        break;
      }
    }
  }

  return detected;
}

/**
 * 日付パース: "24/09/08 08:24:50" → ISO形式
 */
function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  try {
    const [datePart, timePart] = dateStr.split(" ");
    const [yy, mm, dd] = datePart.split("/");
    const year = parseInt(yy) < 50 ? 2000 + parseInt(yy) : 1900 + parseInt(yy);
    return `${year}-${mm}-${dd}T${timePart || "00:00:00"}`;
  } catch {
    return new Date().toISOString();
  }
}

/**
 * センチメント変換（AnyMind 0-5 → positive/neutral/negative）
 * AnyMindのスケール: 5=positive, 3=neutral, 0=negative (推定)
 */
function convertSentiment(value: string | number | undefined): string | null {
  if (value === undefined || value === "") return null;
  const num = typeof value === "string" ? parseInt(value) : value;
  if (isNaN(num)) return null;
  if (num >= 4) return "positive";
  if (num >= 2) return "neutral";
  return "negative";
}

/**
 * 数値パース（空文字・undefinedは0）
 */
function parseNumber(value: string | undefined): number {
  if (!value || value === "") return 0;
  const num = parseInt(value);
  return isNaN(num) ? 0 : num;
}

/**
 * ソースカテゴリ変換
 */
function convertSourceCategory(sourceType: string): string {
  if (!sourceType) return "other";
  const lower = sourceType.toLowerCase();
  if (lower.includes("twitter")) return "twitter";
  if (lower.includes("blog")) return "blog";
  if (lower.includes("news")) return "news";
  if (lower.includes("message") || lower.includes("forum")) return "messageboard";
  return "other";
}

// メイン処理
async function main() {
  console.log("===========================================");
  console.log("AnyMind CSV → sns_posts エンゲージメントインポート");
  console.log("===========================================\n");

  // 1. CSVパース
  console.log("1. Parsing CSV file...");
  console.log(`   Path: ${CSV_PATH}`);

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`   Error: File not found: ${CSV_PATH}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(CSV_PATH, "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];
  console.log(`   Found ${records.length} records\n`);

  // 2. 既存URLを取得
  console.log("2. Fetching existing URLs from sns_posts...");
  const { data: existingPosts, error: fetchError } = await supabase
    .from("sns_posts")
    .select("url");

  if (fetchError) {
    console.error("   Error fetching existing posts:", fetchError);
    process.exit(1);
  }

  const existingUrls = new Set((existingPosts || []).map((p) => p.url));
  console.log(`   Found ${existingUrls.size} existing posts\n`);

  // 3. データ変換
  console.log("3. Transforming records...");
  let newCount = 0;
  let updateCount = 0;
  let skippedCount = 0;

  const postsToInsert: Record<string, unknown>[] = [];
  const postsToUpdate: Record<string, unknown>[] = [];

  for (const row of records) {
    const url = row.url;
    if (!url) {
      skippedCount++;
      continue;
    }

    // エンゲージメントデータ（全プラットフォーム合算）
    // いいね = Twitter + Facebook + Instagram + YouTube + Pinterest
    const likes =
      parseNumber(row["article_extended_attributes.twitter_likes"]) +
      parseNumber(row["article_extended_attributes.facebook_likes"]) +
      parseNumber(row["article_extended_attributes.instagram_likes"]) +
      parseNumber(row["article_extended_attributes.youtube_likes"]) +
      parseNumber(row["article_extended_attributes.pinterest_likes"]);

    // シェア/RT = Twitter RT + Twitter shares + Facebook shares + LinkedIn shares
    const retweets =
      parseNumber(row["article_extended_attributes.twitter_retweets"]) +
      parseNumber(row["article_extended_attributes.twitter_shares"]) +
      parseNumber(row["article_extended_attributes.facebook_shares"]) +
      parseNumber(row["article_extended_attributes.linkedin_shares"]);

    // コメント = Twitter replies + num_comments
    const replies = parseNumber(row["article_extended_attributes.twitter_replies"]);
    const numComments = parseNumber(row["article_extended_attributes.num_comments"]);

    // 閲覧数 = Twitter IMP + Twitter video views + YouTube views + url_views
    const impressions =
      parseNumber(row["article_extended_attributes.twitter_impressions"]) +
      parseNumber(row["article_extended_attributes.twitter_video_views"]) +
      parseNumber(row["article_extended_attributes.youtube_views"]) +
      parseNumber(row["article_extended_attributes.url_views"]);

    // engagement_total, followers はAnyMind計算値をそのまま使用
    const engagementTotal = parseNumber(row["engagement"]);
    const followersValue = parseNumber(row["reach"]); // CSVではreach、DBではfollowers

    const commentsCount = replies + numComments;

    // ブランド検出
    const content = row.content || "";
    const title = row.title || "";
    const detectedBrands = detectBrands(content + " " + title);

    if (existingUrls.has(url)) {
      // 既存データ → エンゲージメント更新
      postsToUpdate.push({
        url,
        likes_count: likes,
        retweets_count: retweets,
        comments_count: commentsCount,
        engagement_total: engagementTotal || (likes + retweets + commentsCount),
        impressions: impressions,
        followers: followersValue,
      });
      updateCount++;
    } else {
      // 新規データ → 挿入
      postsToInsert.push({
        url,
        published: parseDate(row.published),
        title: title || null,
        content: content || null,
        lang: row.lang || "ja",
        source_type: row.source_type || null,
        author_name: row["extra_author_attributes.name"] || null,
        brand_mentions: detectedBrands.join(",") || null,
        brand_count: detectedBrands.length,
        is_multi_brand: detectedBrands.length > 1,
        content_length: content.length,
        has_negative_kw: false,
        source_category: convertSourceCategory(row.source_type),
        likes_count: likes,
        retweets_count: retweets,
        comments_count: commentsCount,
        engagement_total: engagementTotal || (likes + retweets + commentsCount),
        impressions: impressions,
        followers: followersValue,
        sentiment: convertSentiment(row.sentiment),
      });
      newCount++;
    }
  }

  console.log(`   New posts: ${newCount}`);
  console.log(`   Updates: ${updateCount}`);
  console.log(`   Skipped: ${skippedCount}\n`);

  // 4. 新規投稿を挿入
  if (postsToInsert.length > 0) {
    console.log("4. Inserting new posts...");
    const BATCH_SIZE = 500;
    let insertedCount = 0;

    for (let i = 0; i < postsToInsert.length; i += BATCH_SIZE) {
      const batch = postsToInsert.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from("sns_posts")
        .upsert(batch as never[], { onConflict: "url" });

      if (error) {
        console.error(`   Error at batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
      } else {
        insertedCount += batch.length;
        process.stdout.write(`\r   Inserted ${insertedCount}/${postsToInsert.length}...`);
      }
    }
    console.log(`\n   Total inserted: ${insertedCount}\n`);
  } else {
    console.log("4. No new posts to insert\n");
  }

  // 5. 既存投稿のエンゲージメント更新
  if (postsToUpdate.length > 0) {
    console.log("5. Updating engagement for existing posts...");
    const BATCH_SIZE = 500;
    let updatedCount = 0;

    for (let i = 0; i < postsToUpdate.length; i += BATCH_SIZE) {
      const batch = postsToUpdate.slice(i, i + BATCH_SIZE);

      // バッチ更新（個別にupdate）
      for (const post of batch) {
        const { error } = await supabase
          .from("sns_posts")
          .update({
            likes_count: post.likes_count,
            retweets_count: post.retweets_count,
            comments_count: post.comments_count,
            engagement_total: post.engagement_total,
            impressions: post.impressions,
            reach: post.reach,
          })
          .eq("url", post.url as string);

        if (error) {
          console.error(`   Error updating ${post.url}:`, error.message);
        } else {
          updatedCount++;
        }
      }
      process.stdout.write(`\r   Updated ${updatedCount}/${postsToUpdate.length}...`);
    }
    console.log(`\n   Total updated: ${updatedCount}\n`);
  } else {
    console.log("5. No existing posts to update\n");
  }

  // 6. サマリー
  console.log("===========================================");
  console.log("Import completed!");
  console.log(`   New posts inserted: ${newCount}`);
  console.log(`   Existing posts updated: ${updateCount}`);
  console.log(`   Skipped (no URL): ${skippedCount}`);
  console.log("===========================================");
}

main().catch(console.error);
