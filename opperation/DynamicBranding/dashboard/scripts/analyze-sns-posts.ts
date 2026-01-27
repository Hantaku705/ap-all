/**
 * SNS投稿のセンチメント・CEP分析スクリプト
 *
 * 使用方法:
 *   npx tsx scripts/analyze-sns-posts.ts           # 全件処理
 *   npx tsx scripts/analyze-sns-posts.ts --limit 100  # 100件のみ
 *   npx tsx scripts/analyze-sns-posts.ts --dry-run    # API呼び出しなし（デバッグ用）
 */

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { resolve } from "path";

// 環境変数読み込み
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const geminiApiKey = process.env.GEMINI_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

if (!geminiApiKey) {
  console.error("Missing GEMINI_API_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);

// CEPマッピング（cep_name → id）
const CEP_MAP: Record<string, number | null> = {
  time_saving_weeknight: 1,
  taste_anxiety: 2,
  weekend_cooking: 3,
  kids_picky_eating: 4,
  solo_easy_meal: 5,
  health_conscious: 6,
  entertaining: 7,
  drinking_snacks: 8,
  leftover_remake: 9,
  seasonal_taste: 10,
  diet_satisfaction: 11,
  morning_time_save: 12,
  none: null, // 該当なし
};

// プロンプト
const SYSTEM_PROMPT = `あなたは調味料ブランド（味の素、ほんだし、クックドゥ、コンソメなど）に関するSNS投稿を分析するアシスタントです。

各投稿について以下を判定してください：

## 1. センチメント
投稿全体の感情を判定してください：
- **positive**: 好意的、おすすめ、満足、美味しい、便利など
- **neutral**: 事実の共有、質問、レシピ紹介、中立的な報告
- **negative**: 不満、批判、問題提起、体に悪いなどのネガティブ言及

## 2. CEP（生活文脈）
投稿内容から読み取れる生活シーンを以下から1つ選択：
- time_saving_weeknight: 平日夜の時短ニーズ（忙しい、帰宅後すぐ、パパッと）
- taste_anxiety: 味付け不安の解消（失敗しない、味が決まる、初心者）
- weekend_cooking: 週末の本格料理挑戦（休日、じっくり、手の込んだ）
- kids_picky_eating: 子どもの好き嫌い対策（子ども、野菜嫌い、食べてくれた）
- solo_easy_meal: 一人暮らしの手抜き飯（一人暮らし、適当、簡単）
- health_conscious: 健康意識（塩分、添加物、体に良い/悪い）
- entertaining: おもてなし料理（来客、パーティー、喜ばれた）
- drinking_snacks: 晩酌のおつまみ（酒、ビール、つまみ、おつまみ）
- leftover_remake: 残り物リメイク（余った、残り物、アレンジ）
- seasonal_taste: 季節の味覚（旬、季節、〇〇の季節）
- diet_satisfaction: ダイエット中の満足感（ダイエット、カロリー、ヘルシー）
- morning_time_save: 朝の時間節約（朝食、弁当、朝の）
- none: 該当なし（単なる商品紹介、ニュース記事、生活文脈が読み取れない）

## 出力形式
必ず以下のJSON配列形式で出力してください。他の説明文は不要です：
[
  {"id": 1, "sentiment": "positive", "cep": "time_saving_weeknight"},
  {"id": 2, "sentiment": "neutral", "cep": "none"}
]`;

interface Post {
  id: number;
  url: string;
  title: string | null;
  content: string | null;
}

interface AnalysisResult {
  id: number;
  sentiment: "positive" | "neutral" | "negative";
  cep: string;
}

// バッチサイズと待機時間
const BATCH_SIZE = 10;
const DELAY_MS = 6500; // 6.5秒（Gemini API: 10リクエスト/分制限対策）

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

// Gemini APIで分析
async function analyzeWithGemini(posts: Post[]): Promise<AnalysisResult[]> {
  // Use gemini-2.0-flash-exp (latest available model)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  // 投稿をフォーマット
  const postsText = posts
    .map((p, idx) => {
      const text = p.content || p.title || "(内容なし)";
      const truncated = text.length > 500 ? text.slice(0, 500) + "..." : text;
      return `[ID: ${p.id}]\n${truncated}`;
    })
    .join("\n\n---\n\n");

  const prompt = `${SYSTEM_PROMPT}\n\n## 分析対象の投稿（${posts.length}件）\n\n${postsText}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // JSONを抽出（```json ... ``` で囲まれている場合に対応）
    let jsonStr = response;
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // [ で始まる部分を抽出
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      console.error("JSON配列が見つかりません:", response.slice(0, 200));
      return [];
    }

    const parsed: AnalysisResult[] = JSON.parse(arrayMatch[0]);
    return parsed;
  } catch (error) {
    console.error("Gemini API error:", error);
    return [];
  }
}

// メイン処理
async function main() {
  const { limit, dryRun } = parseArgs();

  console.log("=== SNS投稿分析スクリプト ===");
  console.log(`モード: ${dryRun ? "ドライラン（API呼び出しなし）" : "本番実行"}`);
  if (limit) console.log(`件数制限: ${limit}件`);
  console.log("");

  // 未分析投稿を取得
  let query = supabase
    .from("sns_posts")
    .select("id, url, title, content")
    .is("analyzed_at", null)
    .order("id", { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error("Supabase error:", error.message);
    process.exit(1);
  }

  if (!posts || posts.length === 0) {
    console.log("未分析の投稿がありません。");
    return;
  }

  console.log(`未分析投稿: ${posts.length}件`);
  console.log(`バッチサイズ: ${BATCH_SIZE}件`);
  console.log(`予想処理時間: 約${Math.ceil((posts.length / BATCH_SIZE) * (DELAY_MS / 1000 + 1))}秒`);
  console.log("");

  let processed = 0;
  let errors = 0;
  const stats = {
    positive: 0,
    neutral: 0,
    negative: 0,
    ceps: {} as Record<string, number>,
  };

  // バッチ処理
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(posts.length / BATCH_SIZE);

    console.log(`[${batchNum}/${totalBatches}] 処理中... (ID: ${batch[0].id}〜${batch[batch.length - 1].id})`);

    if (dryRun) {
      // ドライラン: ダミーデータ
      processed += batch.length;
      continue;
    }

    // Gemini APIで分析
    const results = await analyzeWithGemini(batch);

    if (results.length === 0) {
      console.log(`  ⚠️ API応答なし、スキップ`);
      errors += batch.length;
      continue;
    }

    // Supabase更新
    for (const result of results) {
      const cepId = CEP_MAP[result.cep] ?? null;

      const { error: updateError } = await supabase
        .from("sns_posts")
        .update({
          sentiment: result.sentiment,
          cep_id: cepId,
          analyzed_at: new Date().toISOString(),
        })
        .eq("id", result.id);

      if (updateError) {
        console.log(`  ⚠️ ID ${result.id} 更新エラー: ${updateError.message}`);
        errors++;
      } else {
        processed++;
        stats[result.sentiment]++;
        stats.ceps[result.cep] = (stats.ceps[result.cep] || 0) + 1;
      }
    }

    // レート制限対策
    if (i + BATCH_SIZE < posts.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  // 結果サマリー
  console.log("");
  console.log("=== 処理完了 ===");
  console.log(`処理件数: ${processed}/${posts.length}`);
  console.log(`エラー: ${errors}件`);

  if (!dryRun && processed > 0) {
    console.log("");
    console.log("センチメント分布:");
    console.log(`  positive: ${stats.positive} (${((stats.positive / processed) * 100).toFixed(1)}%)`);
    console.log(`  neutral:  ${stats.neutral} (${((stats.neutral / processed) * 100).toFixed(1)}%)`);
    console.log(`  negative: ${stats.negative} (${((stats.negative / processed) * 100).toFixed(1)}%)`);

    console.log("");
    console.log("CEP分布 (上位5):");
    const sortedCeps = Object.entries(stats.ceps)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    for (const [cep, count] of sortedCeps) {
      console.log(`  ${cep}: ${count} (${((count / processed) * 100).toFixed(1)}%)`);
    }
  }
}

main().catch(console.error);
