/**
 * ネガティブ判定の再検証スクリプト
 *
 * sentiment=negative の投稿を取得し、より厳密な基準で再判定する
 *
 * 使用方法:
 *   npx tsx scripts/revalidate-negative.ts                # 全件処理
 *   npx tsx scripts/revalidate-negative.ts --limit 100   # 100件のみ
 *   npx tsx scripts/revalidate-negative.ts --dry-run     # API呼び出しなし
 */

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync, existsSync, readFileSync } from "fs";

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

// 進捗保存ファイル
const PROGRESS_FILE = resolve(process.cwd(), ".revalidate-negative-progress.json");

// 再検証用プロンプト
const SYSTEM_PROMPT = `あなたは調味料ブランド（味の素、ほんだし、クックドゥ、コンソメ、丸鶏がらスープ、香味ペースト、ピュアセレクト、アジシオ、鍋キューブ）に関するSNS投稿のセンチメントを判定するエキスパートです。

この投稿がブランドにとって**本当にネガティブか**判定してください。

## ネガティブの定義（これに該当する場合のみnegative）

- ブランド/商品への**明確な不満・批判**（「まずい」「使えない」「買わない」）
- **健康懸念・安全性への疑問**（「体に悪い」「添加物が心配」）
- **品質問題・使いにくさの指摘**（「味が落ちた」「開けにくい」）
- **他社製品との比較で劣る評価**（「〇〇の方がいい」）

## ネガティブではない（neutral または positive に変更すべき）

- 単なる事実報告（「〇〇を使った」「〇〇を買った」）→ **neutral**
- レシピ共有（評価なし）→ **neutral**
- 質問（「〇〇の使い方は？」）→ **neutral**
- 軽い冗談・ネタ投稿 → **neutral**
- ブランドと無関係なニュース → **neutral**
- 肯定的な感想（「おいしい」「便利」「好き」）→ **positive**
- 推奨（「おすすめ」「使ってみて」）→ **positive**

## 出力形式（JSON配列のみ、説明不要）

[{"id":1,"sentiment":"negative","reason":"商品への不満"},{"id":2,"sentiment":"neutral","reason":"単なる事実報告"}]

sentimentは "negative", "neutral", "positive" のいずれか。
reasonは10文字以内で判定理由を記載。`;

interface Post {
  id: number;
  content: string | null;
  brand_mentions: string | null;
}

interface RevalidateResult {
  id: number;
  sentiment: "negative" | "neutral" | "positive";
  reason: string;
}

interface Progress {
  lastProcessedId: number;
  totalProcessed: number;
  stats: {
    negative: number;
    neutral: number;
    positive: number;
  };
  lastUpdated: string;
}

// 設定
const BATCH_SIZE = 20;
const MAX_RETRIES = 3;

// 引数解析
const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith("--limit"));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1] || args[args.indexOf("--limit") + 1]) : null;
const DRY_RUN = args.includes("--dry-run");

async function analyzeWithGemini(posts: Post[]): Promise<RevalidateResult[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const postsText = posts
    .map((p) => `[ID:${p.id}] ${p.content?.substring(0, 300) || "(empty)"}`)
    .join("\n\n");

  const prompt = `${SYSTEM_PROMPT}\n\n## 投稿データ\n\n${postsText}`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // JSON部分を抽出
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]) as RevalidateResult[];
      return parsed;
    } catch (error) {
      console.error(`  Attempt ${attempt + 1} failed:`, error);
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
  }

  return [];
}

function loadProgress(): Progress {
  if (existsSync(PROGRESS_FILE)) {
    const saved = JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
    // 古い形式からの移行
    if (saved.processedIds) {
      return {
        lastProcessedId: Math.max(...saved.processedIds, 0),
        totalProcessed: saved.processedIds.length,
        stats: saved.stats || { negative: 0, neutral: 0, positive: 0 },
        lastUpdated: saved.lastUpdated,
      };
    }
    return saved;
  }
  return {
    lastProcessedId: 0,
    totalProcessed: 0,
    stats: { negative: 0, neutral: 0, positive: 0 },
    lastUpdated: new Date().toISOString(),
  };
}

function saveProgress(progress: Progress) {
  progress.lastUpdated = new Date().toISOString();
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function main() {
  console.log("=".repeat(60));
  console.log("ネガティブ判定の再検証");
  console.log("=".repeat(60));
  console.log(`DRY_RUN: ${DRY_RUN}`);
  console.log(`LIMIT: ${LIMIT || "なし"}`);
  console.log("");

  // 進捗読み込み
  const progress = loadProgress();
  console.log(`進捗: ${progress.totalProcessed}件処理済み (lastId: ${progress.lastProcessedId})`);

  // Before統計
  console.log("\n1. Before統計を取得中...");
  const { count: beforeNegative } = await supabase
    .from("sns_posts")
    .select("*", { count: "exact", head: true })
    .eq("sentiment", "negative");
  const { count: beforeNeutral } = await supabase
    .from("sns_posts")
    .select("*", { count: "exact", head: true })
    .eq("sentiment", "neutral");
  const { count: beforePositive } = await supabase
    .from("sns_posts")
    .select("*", { count: "exact", head: true })
    .eq("sentiment", "positive");

  console.log(`   negative: ${beforeNegative}`);
  console.log(`   neutral: ${beforeNeutral}`);
  console.log(`   positive: ${beforePositive}`);

  // ネガティブ投稿を取得
  console.log("\n2. ネガティブ投稿を取得中...");
  let query = supabase
    .from("sns_posts")
    .select("id, content, brand_mentions")
    .eq("sentiment", "negative")
    .gt("id", progress.lastProcessedId)
    .order("id", { ascending: true })
    .limit(LIMIT || 1000);

  const { data: posts, error } = await query;

  if (error) {
    console.error("Error fetching posts:", error);
    process.exit(1);
  }

  console.log(`   対象: ${posts?.length || 0}件`);

  if (!posts || posts.length === 0) {
    console.log("\n処理対象がありません。");
    return;
  }

  if (DRY_RUN) {
    console.log("\n[DRY_RUN] サンプル10件を表示:");
    posts.slice(0, 10).forEach((p, i) => {
      console.log(`${i + 1}. [${p.brand_mentions || "null"}] ${p.content?.substring(0, 80)}`);
    });
    return;
  }

  // バッチ処理
  console.log("\n3. 再判定中...");
  const batches = [];
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    batches.push(posts.slice(i, i + BATCH_SIZE));
  }

  let updated = 0;
  const stats = { negative: 0, neutral: 0, positive: 0 };

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const startTime = Date.now();

    console.log(`   バッチ ${i + 1}/${batches.length} (${batch.length}件)...`);

    const results = await analyzeWithGemini(batch);

    if (results.length === 0) {
      console.log(`   [ERROR] 結果なし、スキップ`);
      continue;
    }

    // 結果をDBに更新
    for (const result of results) {
      const post = batch.find((p) => p.id === result.id);
      if (!post) {
        // IDが一致しない場合は順序ベースでマッピング
        const index = results.indexOf(result);
        if (index < batch.length) {
          result.id = batch[index].id;
        }
      }

      // 変更があった場合のみ更新
      if (result.sentiment !== "negative") {
        const { error: updateError } = await supabase
          .from("sns_posts")
          .update({ sentiment: result.sentiment })
          .eq("id", result.id);

        if (!updateError) {
          updated++;
        }
      }

      // 統計更新
      stats[result.sentiment]++;
      if (result.id > progress.lastProcessedId) {
        progress.lastProcessedId = result.id;
      }
    }

    // 進捗保存
    progress.totalProcessed += results.length;
    progress.stats.negative += stats.negative;
    progress.stats.neutral += stats.neutral;
    progress.stats.positive += stats.positive;
    saveProgress(progress);

    const elapsed = Date.now() - startTime;
    console.log(`   完了 (${elapsed}ms) - neg:${stats.negative} neu:${stats.neutral} pos:${stats.positive}`);

    // レート制限対策
    if (i < batches.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // After統計
  console.log("\n4. After統計...");
  const { count: afterNegative } = await supabase
    .from("sns_posts")
    .select("*", { count: "exact", head: true })
    .eq("sentiment", "negative");
  const { count: afterNeutral } = await supabase
    .from("sns_posts")
    .select("*", { count: "exact", head: true })
    .eq("sentiment", "neutral");
  const { count: afterPositive } = await supabase
    .from("sns_posts")
    .select("*", { count: "exact", head: true })
    .eq("sentiment", "positive");

  console.log("\n" + "=".repeat(60));
  console.log("結果サマリー");
  console.log("=".repeat(60));
  console.log(`\n処理件数: ${posts.length}`);
  console.log(`更新件数: ${updated}`);
  console.log("");
  console.log("センチメント分布の変化:");
  console.log(`   negative: ${beforeNegative} → ${afterNegative} (${(afterNegative || 0) - (beforeNegative || 0)})`);
  console.log(`   neutral:  ${beforeNeutral} → ${afterNeutral} (${(afterNeutral || 0) - (beforeNeutral || 0)})`);
  console.log(`   positive: ${beforePositive} → ${afterPositive} (${(afterPositive || 0) - (beforePositive || 0)})`);
}

main().catch(console.error);
