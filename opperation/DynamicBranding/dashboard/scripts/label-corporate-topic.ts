/**
 * コーポレートトピック分類スクリプト（Gemini版）
 *
 * is_corporate = true の投稿をさらに細分化
 * - stock_ir: 株価・IR・決算
 * - csr_sustainability: CSR・サステナビリティ
 * - employment: 採用・働き方
 * - company_news: 企業ニュース・発表
 * - rnd: 研究開発
 * - management: 経営陣・企業理念
 * - other: その他
 *
 * 使用方法:
 *   npx tsx scripts/label-corporate-topic.ts                # 全件処理
 *   npx tsx scripts/label-corporate-topic.ts --limit 100    # 100件のみ
 *   npx tsx scripts/label-corporate-topic.ts --dry-run      # API呼び出しなし
 *
 * 環境変数:
 *   GEMINI_API_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";

// 環境変数読み込み
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const geminiKey = process.env.GEMINI_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

if (!geminiKey) {
  console.error("Missing GEMINI_API_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// 進捗ファイル
const PROGRESS_DIR = resolve(process.cwd(), "progress");
const PROGRESS_FILE = resolve(PROGRESS_DIR, "corporate-topic-progress.json");

// トピック定義
const TOPICS = {
  stock_ir: "株価・IR・決算（投資家向け情報、配当、株主総会など）",
  csr_sustainability: "CSR・サステナビリティ（SDGs、環境活動、社会貢献など）",
  employment: "採用・働き方（就職、転職、年収、福利厚生、働き方改革など）",
  company_news: "企業ニュース・発表（新工場、買収、提携、新事業など）",
  rnd: "研究開発（新技術、特許、イノベーション、研究成果など）",
  management: "経営陣・企業理念（社長、経営方針、企業文化、ビジョンなど）",
  other: "その他（上記に該当しない企業関連情報）",
};

// プロンプト
const SYSTEM_PROMPT = `あなたは味の素グループに関するSNS投稿を分析するエキスパートです。

以下の投稿は「企業全体に関する投稿」と判定されたものです。
これをさらに細かいトピックに分類してください。

## トピック分類

${Object.entries(TOPICS)
  .map(([key, desc]) => `- **${key}**: ${desc}`)
  .join("\n")}

## 判定のポイント

- 株価、配当、決算、IR → stock_ir
- SDGs、環境、サステナブル、社会貢献 → csr_sustainability
- 就職、転職、採用、年収、働き方 → employment
- 新工場、買収、提携、新事業、発表 → company_news
- 研究、開発、技術、特許、イノベーション → rnd
- 社長、経営、理念、企業文化 → management
- 上記に該当しない → other

## 出力形式（JSON配列のみ、説明不要）
[{"id":1,"topic":"stock_ir"},{"id":2,"topic":"employment"}]`;

interface Post {
  id: number;
  content: string | null;
  title: string | null;
  corporate_reason: string | null;
}

interface LabelResult {
  id: number;
  topic: string;
}

interface Progress {
  last_processed_id: number;
  total_processed: number;
  topic_counts: Record<string, number>;
  started_at: string;
  updated_at: string;
}

// 設定
const BATCH_SIZE = 20;
const MAX_RETRIES = 3;
const DELAY_BETWEEN_BATCHES = 1500;
const PAGE_SIZE = 1000;

// コマンドライン引数解析
function parseArgs(): { limit: number | null; dryRun: boolean } {
  const args = process.argv.slice(2);
  let limit: number | null = null;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    }
  }

  return { limit, dryRun };
}

// 進捗読み込み
function loadProgress(): Progress | null {
  if (!existsSync(PROGRESS_FILE)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
  } catch {
    return null;
  }
}

// 進捗保存
function saveProgress(progress: Progress): void {
  if (!existsSync(PROGRESS_DIR)) {
    mkdirSync(PROGRESS_DIR, { recursive: true });
  }
  progress.updated_at = new Date().toISOString();
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Gemini API呼び出し
async function labelBatch(
  posts: Post[],
  retries = 0
): Promise<LabelResult[]> {
  const userPrompt = posts
    .map(
      (p) =>
        `ID: ${p.id}\n判定理由: ${p.corporate_reason || "不明"}\n内容: ${(
          p.content ||
          p.title ||
          ""
        ).slice(0, 300)}`
    )
    .join("\n---\n");

  try {
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: userPrompt },
    ]);

    const content = result.response.text();
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn("  Failed to parse JSON, retrying...");
      if (retries < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 2000));
        return labelBatch(posts, retries + 1);
      }
      return [];
    }

    return JSON.parse(jsonMatch[0]) as LabelResult[];
  } catch (error) {
    console.error("  API error:", (error as Error).message);
    if (retries < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 3000));
      return labelBatch(posts, retries + 1);
    }
    return [];
  }
}

// ページネーションで全件取得
async function fetchAllUnlabeledPosts(
  lastProcessedId: number,
  limit: number | null
): Promise<Post[]> {
  const allPosts: Post[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("sns_posts")
      .select("id, content, title, corporate_reason")
      .eq("is_corporate", true)
      .is("corporate_topic", null)
      .gt("id", lastProcessedId)
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Failed to fetch posts:", error.message);
      break;
    }

    if (data && data.length > 0) {
      allPosts.push(...data);
      offset += PAGE_SIZE;

      if (limit && allPosts.length >= limit) {
        return allPosts.slice(0, limit);
      }
    }

    hasMore = data && data.length === PAGE_SIZE;
  }

  return allPosts;
}

// メイン処理
async function main() {
  const { limit, dryRun } = parseArgs();

  console.log("=".repeat(60));
  console.log("コーポレートトピック分類スクリプト（Gemini版）");
  console.log("=".repeat(60));
  console.log(`モード: ${dryRun ? "ドライラン（DB更新なし）" : "本番"}`);
  if (limit) console.log(`件数制限: ${limit}件`);

  // 進捗確認
  let progress = loadProgress();
  if (progress) {
    console.log(`\n進捗を復元: 最後のID=${progress.last_processed_id}, 処理済み=${progress.total_processed}件`);
  } else {
    progress = {
      last_processed_id: 0,
      total_processed: 0,
      topic_counts: {},
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // 1. 未処理の投稿を取得
  console.log("\n[1/3] 未処理のコーポレート投稿を取得中...");
  const posts = await fetchAllUnlabeledPosts(progress.last_processed_id, limit);

  console.log(`  未処理の投稿: ${posts.length}件`);

  if (posts.length === 0) {
    console.log("\n処理対象がありません。終了します。");
    return;
  }

  // 2. バッチ処理
  console.log("\n[2/3] LLM判定を実行中...");
  const batches: Post[][] = [];
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    batches.push(posts.slice(i, i + BATCH_SIZE));
  }

  const sessionCounts: Record<string, number> = {};

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    process.stdout.write(
      `  バッチ ${i + 1}/${batches.length} (${batch.length}件)...`
    );

    if (dryRun) {
      console.log(" スキップ（ドライラン）");
      progress.total_processed += batch.length;
      progress.last_processed_id = batch[batch.length - 1].id;
      continue;
    }

    const results = await labelBatch(batch);

    // DB更新
    const batchCounts: Record<string, number> = {};
    for (const result of results) {
      const { error: updateError } = await supabase
        .from("sns_posts")
        .update({ corporate_topic: result.topic })
        .eq("id", result.id);

      if (updateError) {
        console.error(`\n  Failed to update ID ${result.id}:`, updateError.message);
      } else {
        progress.total_processed++;
        progress.topic_counts[result.topic] = (progress.topic_counts[result.topic] || 0) + 1;
        sessionCounts[result.topic] = (sessionCounts[result.topic] || 0) + 1;
        batchCounts[result.topic] = (batchCounts[result.topic] || 0) + 1;
      }
    }

    // 最後に処理したIDを更新
    if (batch.length > 0) {
      progress.last_processed_id = batch[batch.length - 1].id;
    }

    // バッチ結果を表示
    const batchSummary = Object.entries(batchCounts)
      .map(([k, v]) => `${k}:${v}`)
      .join(", ");
    console.log(` 完了（${batchSummary}）`);

    // 進捗保存（バッチごと）
    saveProgress(progress);

    // バッチ間待機
    if (i < batches.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }
  }

  // 3. 完了
  console.log("\n[3/3] 完了");
  console.log("=".repeat(60));
  console.log(`今回の処理件数: ${Object.values(sessionCounts).reduce((a, b) => a + b, 0)}件`);
  if (!dryRun) {
    console.log("\nトピック別内訳:");
    for (const [topic, count] of Object.entries(sessionCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${topic}: ${count}件`);
    }
  }
  console.log("\n累計:");
  console.log(`  総処理件数: ${progress.total_processed}件`);
  for (const [topic, count] of Object.entries(progress.topic_counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${topic}: ${count}件`);
  }
  console.log("=".repeat(60));
}

main().catch(console.error);
