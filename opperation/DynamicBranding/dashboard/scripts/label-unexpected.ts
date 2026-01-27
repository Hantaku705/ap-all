/**
 * 口コミ「王道/意外」判定スクリプト（Gemini版）
 *
 * 対象: post_brand_impacts.impact_level = 'high' の投稿のみ
 *
 * 使用方法:
 *   npx tsx scripts/label-unexpected.ts                # 全件処理
 *   npx tsx scripts/label-unexpected.ts --limit 100    # 100件のみ
 *   npx tsx scripts/label-unexpected.ts --dry-run      # API呼び出しなし（テスト用）
 *
 * 環境変数:
 *   GEMINI_API_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { resolve } from "path";

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

// ブランド別の王道用途（LLMプロンプト用）
const BRAND_STANDARD_USES: Record<string, string[]> = {
  ほんだし: ["味噌汁", "煮物", "和風だし料理", "お吸い物", "うどん・そば"],
  クックドゥ: ["麻婆豆腐", "青椒肉絲", "回鍋肉", "中華炒め", "酢豚"],
  味の素: ["炒め物の仕上げ", "卵料理", "チャーハン", "スープ"],
  丸鶏がらスープ: ["中華スープ", "鍋", "炒飯", "野菜炒め"],
  香味ペースト: ["炒め物", "チャーハン", "スープ", "鍋"],
  コンソメ: ["洋風スープ", "ポトフ", "カレー", "シチュー", "ピラフ"],
  ピュアセレクト: ["サラダ", "マヨネーズ料理", "ポテトサラダ", "サンドイッチ"],
  アジシオ: ["おにぎり", "塩焼き", "下味", "漬物"],
};

// プロンプト
const SYSTEM_PROMPT = `あなたは調味料ブランドに関するSNS投稿を分析するエキスパートです。

各投稿が「王道の使い方」か「意外な使い方」かを判定してください。

## 判定基準

### 王道（is_unexpected: false）
- 商品パッケージに記載されている使い方
- 公式レシピサイトで紹介されている定番レシピ
- ブランドの主要用途として広く認知されている

### 意外（is_unexpected: true）
- 公式が想定していない創造的な使い方
- 異なるカテゴリ・ジャンルへの転用
- 「え、そんな使い方あるの？」と驚くような活用法

## ブランド別の王道用途（参考）
${Object.entries(BRAND_STANDARD_USES)
  .map(([brand, uses]) => `- ${brand}: ${uses.join("、")}`)
  .join("\n")}

## 出力形式（JSON配列のみ、説明不要）
[{"id":1,"is_unexpected":false},{"id":2,"is_unexpected":true}]`;

interface Post {
  id: number;
  content: string | null;
  title: string | null;
  brand_mentions: string | null;
}

interface LabelResult {
  id: number;
  is_unexpected: boolean;
}

// 設定
const BATCH_SIZE = 20;
const MAX_RETRIES = 3;
const DELAY_BETWEEN_BATCHES = 1500;

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

// メイン処理
async function main() {
  const { limit, dryRun } = parseArgs();

  console.log("=".repeat(60));
  console.log("口コミ「王道/意外」判定スクリプト（Gemini版）");
  console.log("=".repeat(60));
  console.log(`モード: ${dryRun ? "ドライラン（DB更新なし）" : "本番"}`);
  if (limit) console.log(`件数制限: ${limit}件`);

  // 1. impact_level = 'high' の投稿IDを取得
  console.log("\n[1/4] 対象投稿IDを取得中...");
  const { data: impactData, error: impactError } = await supabase
    .from("post_brand_impacts")
    .select("post_id")
    .eq("impact_level", "high");

  if (impactError) {
    console.error("Failed to fetch impact data:", impactError.message);
    process.exit(1);
  }

  const highImpactIds = [...new Set((impactData || []).map((d) => d.post_id))];
  console.log(`  影響度 'high' の投稿: ${highImpactIds.length}件`);

  if (highImpactIds.length === 0) {
    console.log("\n対象投稿がありません。終了します。");
    return;
  }

  // 2. 未判定の投稿を取得
  console.log("\n[2/4] 未判定の投稿を取得中...");
  let query = supabase
    .from("sns_posts")
    .select("id, content, title, brand_mentions")
    .in("id", highImpactIds)
    .is("is_unexpected", null)
    .order("id", { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: posts, error: postsError } = await query;

  if (postsError) {
    console.error("Failed to fetch posts:", postsError.message);
    process.exit(1);
  }

  console.log(`  未判定の投稿: ${(posts || []).length}件`);

  if (!posts || posts.length === 0) {
    console.log("\n処理対象がありません。終了します。");
    return;
  }

  // 3. バッチ処理
  console.log("\n[3/4] LLM判定を実行中...");
  const batches: Post[][] = [];
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    batches.push(posts.slice(i, i + BATCH_SIZE));
  }

  let processed = 0;
  let unexpected = 0;
  let standard = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    process.stdout.write(
      `  バッチ ${i + 1}/${batches.length} (${batch.length}件)...`
    );

    if (dryRun) {
      console.log(" スキップ（ドライラン）");
      processed += batch.length;
      continue;
    }

    const results = await labelBatch(batch);

    // 4. DB更新
    let batchUnexpected = 0;
    let batchStandard = 0;
    for (const result of results) {
      const { error: updateError } = await supabase
        .from("sns_posts")
        .update({ is_unexpected: result.is_unexpected })
        .eq("id", result.id);

      if (updateError) {
        console.error(`\n  Failed to update ID ${result.id}:`, updateError.message);
      } else {
        processed++;
        if (result.is_unexpected) {
          unexpected++;
          batchUnexpected++;
        } else {
          standard++;
          batchStandard++;
        }
      }
    }
    console.log(` 完了（王道:${batchStandard}, 意外:${batchUnexpected}）`);

    // バッチ間待機
    if (i < batches.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }
  }

  // 5. 完了
  console.log("\n[4/4] 完了");
  console.log("=".repeat(60));
  console.log(`処理件数: ${processed}件`);
  if (!dryRun) {
    console.log(`  王道: ${standard}件`);
    console.log(`  意外: ${unexpected}件`);
  }
  console.log("=".repeat(60));
}

main().catch(console.error);
