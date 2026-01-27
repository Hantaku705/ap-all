/**
 * コーポレートタグ検証・修正スクリプト
 *
 * is_corporate=true なのに商品名（味の素以外）を含む投稿を再分析
 *
 * 使用方法:
 *   npx tsx scripts/verify-corporate-tag.ts                # 全件処理
 *   npx tsx scripts/verify-corporate-tag.ts --dry-run      # DB更新なし（確認用）
 *   npx tsx scripts/verify-corporate-tag.ts --limit 10     # 10件のみ
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

// 商品ブランド名（味の素以外）
const PRODUCT_BRANDS = [
  "ほんだし",
  "クックドゥ",
  "コンソメ",
  "丸鶏がらスープ",
  "香味ペースト",
  "ピュアセレクト",
  "アジシオ",
  "鍋キューブ",
];

// 改善したプロンプト
const SYSTEM_PROMPT = `あなたは味の素グループに関するSNS投稿を分析するエキスパートです。

各投稿が「企業情報」か「商品関連」かを判定してください。

## 判定基準

### 企業情報（is_corporate: true）
- 株価・決算・IR情報
- CSR・サステナビリティ活動
- 採用・就職・働き方
- 企業ニュース・発表
- 経営陣・企業理念
- 研究開発（R&D）

### 商品関連（is_corporate: false）
- 具体的な商品名の言及（ほんだし、クックドゥ、コンソメ、丸鶏がらスープ、香味ペースト、ピュアセレクト、アジシオ、鍋キューブ）
- レシピ・料理・使い方
- 味・購入・価格の話題
- 商品推しキャンペーン（#味の素社推し商品 など）

### 重要ルール（厳守）
1. **商品名が1つでも含まれていれば is_corporate=false**
2. 「味の素」単独は文脈で判断（うま味調味料 vs 企業）
3. 企業キャンペーンでも商品紹介なら is_corporate=false
4. 商品を話題にしている投稿は全て is_corporate=false

## 出力形式（JSON配列のみ、説明不要）
[{"id":1,"is_corporate":false,"reason":"商品言及"},{"id":2,"is_corporate":true,"reason":"株価情報"}]

reasonは20文字以内で簡潔に。`;

interface Post {
  id: number;
  content: string | null;
  title: string | null;
  brand_mentions: string | null;
  is_corporate: boolean | null;
  corporate_reason: string | null;
}

interface LabelResult {
  id: number;
  is_corporate: boolean;
  reason: string;
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
        ).slice(0, 400)}`
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

// 問題投稿を取得
async function fetchProblemPosts(limit: number | null): Promise<Post[]> {
  const allPosts: Post[] = [];

  // 各商品ブランドで検索
  for (const brand of PRODUCT_BRANDS) {
    const { data, error } = await supabase
      .from("sns_posts")
      .select("id, content, title, brand_mentions, is_corporate, corporate_reason")
      .eq("is_corporate", true)
      .ilike("brand_mentions", `%${brand}%`)
      .order("id", { ascending: true });

    if (error) {
      console.error(`Failed to fetch posts for ${brand}:`, error.message);
      continue;
    }

    if (data) {
      // 重複を避けるためIDでチェック
      for (const post of data) {
        if (!allPosts.find((p) => p.id === post.id)) {
          allPosts.push(post);
        }
      }
    }
  }

  // IDでソート
  allPosts.sort((a, b) => a.id - b.id);

  // limit指定がある場合
  if (limit && allPosts.length > limit) {
    return allPosts.slice(0, limit);
  }

  return allPosts;
}

// メイン処理
async function main() {
  const { limit, dryRun } = parseArgs();

  console.log("=".repeat(60));
  console.log("コーポレートタグ検証・修正スクリプト");
  console.log("=".repeat(60));
  console.log(`モード: ${dryRun ? "ドライラン（DB更新なし）" : "本番"}`);
  if (limit) console.log(`件数制限: ${limit}件`);
  console.log(`対象: is_corporate=true かつ商品名を含む投稿`);
  console.log(`商品ブランド: ${PRODUCT_BRANDS.join(", ")}`);

  // 1. 問題投稿を取得
  console.log("\n[1/3] 問題投稿を取得中...");
  const posts = await fetchProblemPosts(limit);

  console.log(`  対象投稿: ${posts.length}件`);

  if (posts.length === 0) {
    console.log("\n処理対象がありません。終了します。");
    return;
  }

  // サンプル表示
  console.log("\n  サンプル投稿:");
  for (const post of posts.slice(0, 3)) {
    console.log(`    ID ${post.id}: ${(post.content || "").slice(0, 50)}...`);
    console.log(`      ブランド: ${post.brand_mentions}`);
    console.log(`      現在の判定: is_corporate=${post.is_corporate}, reason=${post.corporate_reason}`);
  }

  // 2. バッチ処理
  console.log("\n[2/3] LLM再判定を実行中...");
  const batches: Post[][] = [];
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    batches.push(posts.slice(i, i + BATCH_SIZE));
  }

  let changedToProduct = 0;
  let unchanged = 0;
  const changedPosts: { id: number; before: boolean | null; after: boolean; reason: string }[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    process.stdout.write(
      `  バッチ ${i + 1}/${batches.length} (${batch.length}件)...`
    );

    if (dryRun && i > 0) {
      // ドライランでは最初のバッチのみ実際にAPI呼び出し
      console.log(" スキップ（ドライラン）");
      continue;
    }

    const results = await labelBatch(batch);

    // 結果を処理
    for (const result of results) {
      const originalPost = batch.find((p) => p.id === result.id);
      if (!originalPost) continue;

      if (result.is_corporate === false) {
        // 変更あり: corporate → product
        changedToProduct++;
        changedPosts.push({
          id: result.id,
          before: originalPost.is_corporate,
          after: result.is_corporate,
          reason: result.reason,
        });

        if (!dryRun) {
          const { error: updateError } = await supabase
            .from("sns_posts")
            .update({
              is_corporate: false,
              corporate_reason: result.reason,
            })
            .eq("id", result.id);

          if (updateError) {
            console.error(`\n  Failed to update ID ${result.id}:`, updateError.message);
          }
        }
      } else {
        unchanged++;
      }
    }

    console.log(` 完了（変更:${results.filter((r) => !r.is_corporate).length}, 維持:${results.filter((r) => r.is_corporate).length}）`);

    // バッチ間待機
    if (i < batches.length - 1 && !dryRun) {
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }
  }

  // 3. 結果サマリー
  console.log("\n[3/3] 完了");
  console.log("=".repeat(60));
  console.log("結果サマリー:");
  console.log(`  処理対象: ${posts.length}件`);
  console.log(`  変更（corporate → product）: ${changedToProduct}件`);
  console.log(`  維持（corporate のまま）: ${unchanged}件`);

  if (changedPosts.length > 0) {
    console.log("\n変更された投稿（最大10件）:");
    for (const changed of changedPosts.slice(0, 10)) {
      const post = posts.find((p) => p.id === changed.id);
      console.log(`  ID ${changed.id}:`);
      console.log(`    内容: ${(post?.content || "").slice(0, 60)}...`);
      console.log(`    ブランド: ${post?.brand_mentions}`);
      console.log(`    変更: is_corporate=${changed.before} → ${changed.after}`);
      console.log(`    理由: ${changed.reason}`);
    }
  }

  if (dryRun) {
    console.log("\n※ ドライランのためDBは更新されていません");
    console.log("  本番実行: npx tsx scripts/verify-corporate-tag.ts");
  }

  console.log("=".repeat(60));
}

main().catch(console.error);
