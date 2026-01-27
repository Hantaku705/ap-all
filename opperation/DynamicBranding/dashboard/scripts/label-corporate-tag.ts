/**
 * コーポレートタグ判定スクリプト（Gemini版）
 *
 * 商品言及のない企業全体に関する投稿を識別
 * - is_corporate: true = 企業情報（株価、CSR、採用等）
 * - is_corporate: false = 商品関連（レシピ、使用感想等）
 *
 * 使用方法:
 *   npx tsx scripts/label-corporate-tag.ts                # 全件処理
 *   npx tsx scripts/label-corporate-tag.ts --limit 100    # 100件のみ
 *   npx tsx scripts/label-corporate-tag.ts --dry-run      # API呼び出しなし（テスト用）
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
const PROGRESS_FILE = resolve(PROGRESS_DIR, "corporate-tag-progress.json");

// プロンプト
const SYSTEM_PROMPT = `あなたは味の素グループに関するSNS投稿を分析するエキスパートです。

各投稿が「企業全体に関する投稿」か「商品・レシピに関する投稿」かを判定してください。

## 判定基準

### 企業全体に関する投稿（is_corporate: true）
- 株価・決算・IR情報（例: 「味の素の株価が上昇」「決算発表」）
- CSR・サステナビリティ活動（例: 「味の素のSDGs活動」）
- 採用・就職・働き方（例: 「味の素に就職したい」「味の素の働き方」）
- 企業ニュース・発表（例: 「味の素が新工場を建設」）
- 経営陣・企業理念（例: 「味の素の社長」「企業ミッション」）
- 研究開発（R&D）全般（例: 「味の素の研究」）
- 企業イメージ全般（例: 「味の素という会社は〜」）

### 商品・レシピに関する投稿（is_corporate: false）
- 具体的な商品名の言及（例: 「ほんだしで味噌汁作った」）
- レシピ・料理（例: 「クックドゥで時短」）
- 味・使い方の感想（例: 「コンソメ美味しい」）
- 購入・価格（例: 「ほんだし買った」「セールで安かった」）
- 商品比較（例: 「ほんだしより〇〇が好き」）

### 注意
- 「味の素」という単語があっても、商品としての「味の素」（うま味調味料）の場合は false
- 企業としての「味の素株式会社」「味の素グループ」の場合は true

## 出力形式（JSON配列のみ、説明不要）
[{"id":1,"is_corporate":false,"reason":"商品レシピ"},{"id":2,"is_corporate":true,"reason":"株価情報"}]

reasonは20文字以内で簡潔に。`;

interface Post {
  id: number;
  content: string | null;
  title: string | null;
  brand_mentions: string | null;
}

interface LabelResult {
  id: number;
  is_corporate: boolean;
  reason: string;
}

interface Progress {
  last_processed_id: number;
  total_processed: number;
  corporate_count: number;
  product_count: number;
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
        `ID: ${p.id}\nブランド: ${p.brand_mentions || "不明"}\n内容: ${(
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
    let query = supabase
      .from("sns_posts")
      .select("id, content, title, brand_mentions")
      .is("is_corporate", null)
      .gt("id", lastProcessedId)
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch posts:", error.message);
      break;
    }

    if (data && data.length > 0) {
      allPosts.push(...data);
      offset += PAGE_SIZE;

      // limit指定がある場合
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
  console.log("コーポレートタグ判定スクリプト（Gemini版）");
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
      corporate_count: 0,
      product_count: 0,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // 1. 未処理の投稿を取得
  console.log("\n[1/3] 未処理の投稿を取得中...");
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

  let sessionCorporate = 0;
  let sessionProduct = 0;

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
    let batchCorporate = 0;
    let batchProduct = 0;
    for (const result of results) {
      const { error: updateError } = await supabase
        .from("sns_posts")
        .update({
          is_corporate: result.is_corporate,
          corporate_reason: result.reason,
        })
        .eq("id", result.id);

      if (updateError) {
        console.error(`\n  Failed to update ID ${result.id}:`, updateError.message);
      } else {
        progress.total_processed++;
        if (result.is_corporate) {
          progress.corporate_count++;
          sessionCorporate++;
          batchCorporate++;
        } else {
          progress.product_count++;
          sessionProduct++;
          batchProduct++;
        }
      }
    }

    // 最後に処理したIDを更新
    if (batch.length > 0) {
      progress.last_processed_id = batch[batch.length - 1].id;
    }

    console.log(` 完了（商品:${batchProduct}, 企業:${batchCorporate}）`);

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
  console.log(`今回の処理件数: ${sessionCorporate + sessionProduct}件`);
  if (!dryRun) {
    console.log(`  商品関連: ${sessionProduct}件`);
    console.log(`  企業関連: ${sessionCorporate}件`);
  }
  console.log("\n累計:");
  console.log(`  総処理件数: ${progress.total_processed}件`);
  console.log(`  商品関連: ${progress.product_count}件`);
  console.log(`  企業関連: ${progress.corporate_count}件`);
  console.log("=".repeat(60));
}

main().catch(console.error);
