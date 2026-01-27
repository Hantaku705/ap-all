/**
 * CEPデータ シードスクリプト
 *
 * 実行方法:
 * 1. .env.local に Supabase 接続情報を設定
 * 2. npx tsx scripts/seed-cep-data.ts
 *
 * データソース: /extract-brand-cep 実行結果またはサンプルデータ
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

// .env.local を明示的に読み込む
config({ path: resolve(process.cwd(), ".env.local") });

// 環境変数チェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
  );
  console.error("Please set them in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// CEPマスタデータ
// ============================================
const CEPS_DATA = [
  {
    cep_name: "平日夜の時短ニーズ",
    description: "仕事帰りで疲れているが、家族のために手早く食事を作りたい",
    representative_goal: "短時間で満足感ある食事を提供したい",
    representative_attribute: "即効性・簡単調理",
    context_summary:
      "19時帰宅、子どもが空腹、30分で作りたい。疲れているが手抜きに見られたくない。",
    category: "平日夕食",
  },
  {
    cep_name: "味付け不安の解消",
    description: "自炊初心者や料理に自信がない人の味付けサポートニーズ",
    representative_goal: "失敗せずに美味しく作りたい",
    representative_attribute: "味の安定性・使いやすさ",
    context_summary:
      "自炊を始めたばかり。味が決まらない不安。失敗したくない。",
    category: "料理不安",
  },
  {
    cep_name: "週末の本格料理挑戦",
    description: "平日は時間がないが、週末は少し手の込んだ料理に挑戦したい",
    representative_goal: "家庭でプロの味を再現したい",
    representative_attribute: "本格的な風味・深み",
    context_summary:
      "週末の余裕ある時間。レストランのような味を家で出したい。",
    category: "週末料理",
  },
  {
    cep_name: "子どもの好き嫌い対策",
    description: "子どもが野菜を食べない、偏食を解消したい親のニーズ",
    representative_goal: "子どもに栄養バランスの良い食事を食べさせたい",
    representative_attribute: "マイルドな味・アレンジ性",
    context_summary:
      "子どもが野菜嫌い。栄養バランスが心配。でも美味しくないと食べない。",
    category: "子育て",
  },
  {
    cep_name: "一人暮らしの手抜き飯",
    description: "一人暮らしで料理へのモチベーションが低い時の簡単調理ニーズ",
    representative_goal: "最小限の手間で満足できる食事をとりたい",
    representative_attribute: "手軽さ・コスパ",
    context_summary:
      "一人だと作る気が起きない。でもコンビニ飯は飽きた。簡単に済ませたい。",
    category: "一人飯",
  },
  {
    cep_name: "健康意識の高まり",
    description: "塩分控えめ、添加物を気にする健康志向層のニーズ",
    representative_goal: "体に優しい食事を心がけたい",
    representative_attribute: "自然な味・減塩対応",
    context_summary:
      "健康診断で引っかかった。塩分を控えたい。でも味が薄いのは嫌。",
    category: "健康志向",
  },
  {
    cep_name: "おもてなし料理",
    description: "来客時に手料理で喜ばせたいというニーズ",
    representative_goal: "ゲストを美味しい料理でもてなしたい",
    representative_attribute: "見栄え・本格感",
    context_summary:
      "友人が来る。手料理で喜ばせたい。でも失敗は許されない。",
    category: "おもてなし",
  },
  {
    cep_name: "晩酌のおつまみ",
    description: "お酒に合う簡単なつまみをサッと作りたいニーズ",
    representative_goal: "お酒を美味しく楽しむためのつまみを用意したい",
    representative_attribute: "即効性・酒との相性",
    context_summary: "仕事終わりのビール。何かつまみが欲しい。サッと作りたい。",
    category: "晩酌",
  },
  {
    cep_name: "残り物リメイク",
    description: "冷蔵庫の残り物を活用して無駄なく料理したいニーズ",
    representative_goal: "食材を無駄にせず美味しく食べきりたい",
    representative_attribute: "汎用性・アレンジ性",
    context_summary:
      "冷蔵庫に半端な食材。捨てたくない。何か作れないか。",
    category: "節約",
  },
  {
    cep_name: "季節の味覚",
    description: "旬の食材を活かした季節感ある料理を楽しみたいニーズ",
    representative_goal: "季節を感じる美味しい料理を作りたい",
    representative_attribute: "素材の引き立て・季節感",
    context_summary: "旬の野菜が手に入った。素材を活かした料理がしたい。",
    category: "季節料理",
  },
  {
    cep_name: "ダイエット中の満足感",
    description: "カロリーを抑えつつも満足感のある食事を求めるニーズ",
    representative_goal: "ヘルシーでも美味しく満足できる食事をとりたい",
    representative_attribute: "低カロリー・満足感",
    context_summary:
      "ダイエット中。でも味気ない食事は続かない。美味しくヘルシーに。",
    category: "ダイエット",
  },
  {
    cep_name: "朝の時間節約",
    description: "朝の忙しい時間に手早く朝食・弁当を準備したいニーズ",
    representative_goal: "朝の限られた時間で効率的に準備を終えたい",
    representative_attribute: "超時短・簡単",
    context_summary:
      "朝は時間がない。弁当も作らないと。とにかく早く済ませたい。",
    category: "朝食",
  },
];

// ============================================
// ブランド別CEPスコアデータ（サンプル）
// ============================================
const BRAND_CEPS_DATA: Array<{
  brand: string;
  cep_name: string;
  reach_score: number;
  frequency_score: number;
  habit_strength: number;
  wtp: number;
  potential_score: number;
  strength_alignment: number;
  quadrant: string;
  mention_count: number;
}> = [
  // ほんだし
  {
    brand: "ほんだし",
    cep_name: "平日夜の時短ニーズ",
    reach_score: 0.15,
    frequency_score: 12,
    habit_strength: 7.5,
    wtp: 350,
    potential_score: 2.1,
    strength_alignment: 1.5,
    quadrant: "コア強化",
    mention_count: 45,
  },
  {
    brand: "ほんだし",
    cep_name: "味付け不安の解消",
    reach_score: 0.12,
    frequency_score: 8,
    habit_strength: 8.0,
    wtp: 300,
    potential_score: 1.8,
    strength_alignment: 2.0,
    quadrant: "コア強化",
    mention_count: 38,
  },
  {
    brand: "ほんだし",
    cep_name: "季節の味覚",
    reach_score: 0.08,
    frequency_score: 4,
    habit_strength: 6.5,
    wtp: 400,
    potential_score: 0.9,
    strength_alignment: 1.0,
    quadrant: "育成検討",
    mention_count: 22,
  },
  {
    brand: "ほんだし",
    cep_name: "健康意識の高まり",
    reach_score: 0.05,
    frequency_score: 3,
    habit_strength: 4.0,
    wtp: 450,
    potential_score: -0.2,
    strength_alignment: -1.0,
    quadrant: "低優先",
    mention_count: 8,
  },

  // クックドゥ
  {
    brand: "クックドゥ",
    cep_name: "平日夜の時短ニーズ",
    reach_score: 0.18,
    frequency_score: 10,
    habit_strength: 8.5,
    wtp: 400,
    potential_score: 2.4,
    strength_alignment: 2.0,
    quadrant: "コア強化",
    mention_count: 52,
  },
  {
    brand: "クックドゥ",
    cep_name: "味付け不安の解消",
    reach_score: 0.2,
    frequency_score: 9,
    habit_strength: 9.0,
    wtp: 380,
    potential_score: 2.5,
    strength_alignment: 2.0,
    quadrant: "コア強化",
    mention_count: 58,
  },
  {
    brand: "クックドゥ",
    cep_name: "週末の本格料理挑戦",
    reach_score: 0.1,
    frequency_score: 4,
    habit_strength: 6.0,
    wtp: 500,
    potential_score: 1.0,
    strength_alignment: 1.5,
    quadrant: "育成検討",
    mention_count: 28,
  },
  {
    brand: "クックドゥ",
    cep_name: "子どもの好き嫌い対策",
    reach_score: 0.07,
    frequency_score: 6,
    habit_strength: 7.0,
    wtp: 350,
    potential_score: 0.8,
    strength_alignment: 1.0,
    quadrant: "育成検討",
    mention_count: 18,
  },

  // 味の素
  {
    brand: "味の素",
    cep_name: "味付け不安の解消",
    reach_score: 0.25,
    frequency_score: 15,
    habit_strength: 8.0,
    wtp: 200,
    potential_score: 2.8,
    strength_alignment: 2.0,
    quadrant: "コア強化",
    mention_count: 320,
  },
  {
    brand: "味の素",
    cep_name: "平日夜の時短ニーズ",
    reach_score: 0.15,
    frequency_score: 12,
    habit_strength: 6.5,
    wtp: 200,
    potential_score: 1.5,
    strength_alignment: 1.0,
    quadrant: "育成検討",
    mention_count: 180,
  },
  {
    brand: "味の素",
    cep_name: "健康意識の高まり",
    reach_score: 0.1,
    frequency_score: 8,
    habit_strength: 3.0,
    wtp: 250,
    potential_score: -0.5,
    strength_alignment: -1.5,
    quadrant: "低優先",
    mention_count: 95,
  },
  {
    brand: "味の素",
    cep_name: "残り物リメイク",
    reach_score: 0.08,
    frequency_score: 6,
    habit_strength: 7.0,
    wtp: 200,
    potential_score: 0.7,
    strength_alignment: 1.5,
    quadrant: "育成検討",
    mention_count: 75,
  },

  // 丸鶏がらスープ
  {
    brand: "丸鶏がらスープ",
    cep_name: "平日夜の時短ニーズ",
    reach_score: 0.12,
    frequency_score: 8,
    habit_strength: 7.0,
    wtp: 300,
    potential_score: 1.6,
    strength_alignment: 1.5,
    quadrant: "コア強化",
    mention_count: 35,
  },
  {
    brand: "丸鶏がらスープ",
    cep_name: "週末の本格料理挑戦",
    reach_score: 0.1,
    frequency_score: 4,
    habit_strength: 6.5,
    wtp: 400,
    potential_score: 1.2,
    strength_alignment: 2.0,
    quadrant: "コア強化",
    mention_count: 28,
  },
  {
    brand: "丸鶏がらスープ",
    cep_name: "残り物リメイク",
    reach_score: 0.06,
    frequency_score: 5,
    habit_strength: 6.0,
    wtp: 300,
    potential_score: 0.5,
    strength_alignment: 1.0,
    quadrant: "育成検討",
    mention_count: 15,
  },

  // コンソメ
  {
    brand: "コンソメ",
    cep_name: "週末の本格料理挑戦",
    reach_score: 0.15,
    frequency_score: 6,
    habit_strength: 8.0,
    wtp: 350,
    potential_score: 1.8,
    strength_alignment: 2.0,
    quadrant: "コア強化",
    mention_count: 85,
  },
  {
    brand: "コンソメ",
    cep_name: "おもてなし料理",
    reach_score: 0.08,
    frequency_score: 2,
    habit_strength: 7.5,
    wtp: 450,
    potential_score: 1.0,
    strength_alignment: 1.5,
    quadrant: "育成検討",
    mention_count: 42,
  },
  {
    brand: "コンソメ",
    cep_name: "子どもの好き嫌い対策",
    reach_score: 0.1,
    frequency_score: 8,
    habit_strength: 7.0,
    wtp: 300,
    potential_score: 1.4,
    strength_alignment: 1.0,
    quadrant: "育成検討",
    mention_count: 55,
  },
  {
    brand: "コンソメ",
    cep_name: "残り物リメイク",
    reach_score: 0.12,
    frequency_score: 10,
    habit_strength: 7.5,
    wtp: 280,
    potential_score: 1.6,
    strength_alignment: 1.5,
    quadrant: "コア強化",
    mention_count: 68,
  },

  // 香味ペースト
  {
    brand: "香味ペースト",
    cep_name: "平日夜の時短ニーズ",
    reach_score: 0.05,
    frequency_score: 6,
    habit_strength: 8.0,
    wtp: 350,
    potential_score: 1.2,
    strength_alignment: 2.0,
    quadrant: "コア強化",
    mention_count: 8,
  },
  {
    brand: "香味ペースト",
    cep_name: "味付け不安の解消",
    reach_score: 0.04,
    frequency_score: 5,
    habit_strength: 8.5,
    wtp: 320,
    potential_score: 1.0,
    strength_alignment: 2.0,
    quadrant: "育成検討",
    mention_count: 6,
  },
  {
    brand: "香味ペースト",
    cep_name: "晩酌のおつまみ",
    reach_score: 0.03,
    frequency_score: 4,
    habit_strength: 7.0,
    wtp: 300,
    potential_score: 0.5,
    strength_alignment: 1.0,
    quadrant: "育成検討",
    mention_count: 4,
  },

  // アジシオ
  {
    brand: "アジシオ",
    cep_name: "味付け不安の解消",
    reach_score: 0.06,
    frequency_score: 10,
    habit_strength: 6.0,
    wtp: 150,
    potential_score: 0.8,
    strength_alignment: 1.5,
    quadrant: "育成検討",
    mention_count: 25,
  },
  {
    brand: "アジシオ",
    cep_name: "朝の時間節約",
    reach_score: 0.04,
    frequency_score: 15,
    habit_strength: 5.5,
    wtp: 150,
    potential_score: 0.6,
    strength_alignment: 1.0,
    quadrant: "育成検討",
    mention_count: 18,
  },
  {
    brand: "アジシオ",
    cep_name: "健康意識の高まり",
    reach_score: 0.03,
    frequency_score: 5,
    habit_strength: 3.0,
    wtp: 200,
    potential_score: -0.8,
    strength_alignment: -1.0,
    quadrant: "低優先",
    mention_count: 10,
  },

  // ピュアセレクト
  {
    brand: "ピュアセレクト",
    cep_name: "健康意識の高まり",
    reach_score: 0.04,
    frequency_score: 6,
    habit_strength: 7.0,
    wtp: 400,
    potential_score: 1.0,
    strength_alignment: 2.0,
    quadrant: "育成検討",
    mention_count: 12,
  },
  {
    brand: "ピュアセレクト",
    cep_name: "子どもの好き嫌い対策",
    reach_score: 0.03,
    frequency_score: 4,
    habit_strength: 6.5,
    wtp: 350,
    potential_score: 0.6,
    strength_alignment: 1.5,
    quadrant: "育成検討",
    mention_count: 8,
  },
  {
    brand: "ピュアセレクト",
    cep_name: "おもてなし料理",
    reach_score: 0.02,
    frequency_score: 2,
    habit_strength: 7.0,
    wtp: 450,
    potential_score: 0.4,
    strength_alignment: 1.0,
    quadrant: "育成検討",
    mention_count: 5,
  },
];

// メイン処理
async function main() {
  console.log("Starting CEP seed process...\n");

  // 1. ブランドIDの取得
  console.log("1. Fetching brand IDs...");
  const { data: brands, error: brandsError } = await supabase
    .from("brands")
    .select("id, name");

  if (brandsError) {
    console.error("Error fetching brands:", brandsError);
    process.exit(1);
  }

  const brandIdMap: Record<string, number> = {};
  brands?.forEach((brand) => {
    brandIdMap[brand.name] = brand.id;
  });
  console.log(`  Found ${Object.keys(brandIdMap).length} brands\n`);

  // 2. CEPマスタ投入
  console.log("2. Inserting CEP master data...");
  const { data: insertedCeps, error: cepsError } = await supabase
    .from("ceps")
    .upsert(CEPS_DATA, { onConflict: "cep_name" })
    .select("id, cep_name");

  if (cepsError) {
    console.error("Error inserting CEPs:", cepsError);
    process.exit(1);
  }

  const cepIdMap: Record<string, number> = {};
  insertedCeps?.forEach((cep) => {
    cepIdMap[cep.cep_name] = cep.id;
  });
  console.log(`  Inserted ${insertedCeps?.length || 0} CEP records\n`);

  // 3. ブランド別CEPスコア投入
  console.log("3. Inserting brand CEP scores...");
  const brandCepRecords = BRAND_CEPS_DATA.map((bc) => ({
    brand_id: brandIdMap[bc.brand],
    cep_id: cepIdMap[bc.cep_name],
    reach_score: bc.reach_score,
    frequency_score: bc.frequency_score,
    habit_strength: bc.habit_strength,
    wtp: bc.wtp,
    potential_score: bc.potential_score,
    strength_alignment: bc.strength_alignment,
    quadrant: bc.quadrant,
    mention_count: bc.mention_count,
  })).filter((r) => r.brand_id !== undefined && r.cep_id !== undefined);

  const { error: brandCepsError } = await supabase
    .from("brand_ceps")
    .upsert(brandCepRecords, {
      onConflict: "brand_id,cep_id,analysis_date",
    });

  if (brandCepsError) {
    console.error("Error inserting brand CEPs:", brandCepsError);
  } else {
    console.log(`  Inserted ${brandCepRecords.length} brand CEP records\n`);
  }

  // 4. サマリー表示
  console.log("4. Summary:");
  console.log(`   CEPs: ${Object.keys(cepIdMap).length}`);
  console.log(`   Brand-CEP combinations: ${brandCepRecords.length}`);

  // 象限別集計
  const quadrantCounts: Record<string, number> = {};
  for (const bc of BRAND_CEPS_DATA) {
    quadrantCounts[bc.quadrant] = (quadrantCounts[bc.quadrant] || 0) + 1;
  }
  console.log("\n   Quadrant distribution:");
  for (const [quadrant, count] of Object.entries(quadrantCounts)) {
    console.log(`     ${quadrant}: ${count}`);
  }

  console.log("\nCEP seed process completed!");
}

main().catch(console.error);
