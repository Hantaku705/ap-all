/**
 * DPT (Dynamic Positioning Table) 静的データシードスクリプト
 *
 * 8ブランド分のDPTデータを brand_dpt_cache テーブルに投入する
 *
 * 使用方法:
 *   npx tsx scripts/seed-dpt-data.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Use Case型定義
interface UseCase {
  id: string;
  name: string;
  context: {
    why: string;
    when: string;
    where: string;
    withWhom: string;
  };
  positioning: {
    competitors: string[];
    pop: string[];
    pod: string[];
  };
  evidence: {
    postCount: number;
    topKeywords: string[];
    samplePosts: string[];
  };
}

// 8ブランド分のDPTデータ定義
const DPT_DATA: Record<string, UseCase[]> = {
  ほんだし: [
    {
      id: "uc_1",
      name: "平日夜の時短",
      context: {
        why: "仕事帰りで疲れているが、家族に温かい味噌汁を出したい",
        when: "平日夜（急いで作る必要がある時）",
        where: "自宅キッチン",
        withWhom: "家族のため",
      },
      positioning: {
        competitors: ["顆粒だし", "液体だし", "だしパック"],
        pop: ["手軽さ", "溶けやすさ", "失敗しない"],
        pod: ["本格的なだしの風味", "和食全般に使える万能性", "味噌汁の必需品としての地位"],
      },
      evidence: {
        postCount: 450,
        topKeywords: ["味噌汁", "時短", "簡単", "毎日"],
        samplePosts: [],
      },
    },
    {
      id: "uc_2",
      name: "味付け不安解消",
      context: {
        why: "料理の味付けに自信がなく、失敗したくない",
        when: "日常の料理時",
        where: "自宅キッチン",
        withWhom: "家族のため",
      },
      positioning: {
        competitors: ["めんつゆ", "白だし", "合わせ調味料"],
        pop: ["失敗しない", "計量不要", "安定した味"],
        pod: ["プロの味を再現できる信頼感", "50年以上の実績", "和食の基本"],
      },
      evidence: {
        postCount: 320,
        topKeywords: ["味が決まる", "失敗しない", "安心"],
        samplePosts: [],
      },
    },
    {
      id: "uc_3",
      name: "子ども好き嫌い",
      context: {
        why: "子どもに野菜を食べてもらいたい",
        when: "日常の食事準備時",
        where: "自宅キッチン",
        withWhom: "子どものため",
      },
      positioning: {
        competitors: ["冷凍食品", "ベビーフード", "子ども向け調味料"],
        pop: ["食べやすい味付け", "優しい風味"],
        pod: ["野菜も美味しく食べられる", "自然なうま味", "添加物の少なさ"],
      },
      evidence: {
        postCount: 180,
        topKeywords: ["子ども", "野菜", "食べてくれた"],
        samplePosts: [],
      },
    },
  ],

  クックドゥ: [
    {
      id: "uc_1",
      name: "平日夜の時短",
      context: {
        why: "時間がないけど本格的な中華を食卓に出したい",
        when: "平日夜（急いで作る必要がある時）",
        where: "自宅キッチン",
        withWhom: "家族のため",
      },
      positioning: {
        competitors: ["冷凍中華", "レトルト食品", "中華料理店のテイクアウト"],
        pop: ["時短調理", "簡単", "メニューの豊富さ"],
        pod: ["レストラン品質の本格中華", "家庭で再現できない味", "野菜たっぷり"],
      },
      evidence: {
        postCount: 380,
        topKeywords: ["麻婆豆腐", "時短", "本格", "簡単"],
        samplePosts: [],
      },
    },
    {
      id: "uc_2",
      name: "週末の本格料理",
      context: {
        why: "週末は少し手をかけて特別な料理を作りたい",
        when: "週末夕食",
        where: "自宅キッチン",
        withWhom: "家族のため",
      },
      positioning: {
        competitors: ["中華料理店での外食", "料理キット", "冷凍食品"],
        pop: ["豊富なメニューバリエーション", "本格的な味"],
        pod: ["プロの味を家庭で再現", "特別感のある食卓", "家族が喜ぶ"],
      },
      evidence: {
        postCount: 250,
        topKeywords: ["週末", "本格", "家族", "喜ぶ"],
        samplePosts: [],
      },
    },
    {
      id: "uc_3",
      name: "子ども好き嫌い",
      context: {
        why: "子どもが好きな味付けで野菜を食べさせたい",
        when: "日常の食事準備時",
        where: "自宅キッチン",
        withWhom: "子どものため",
      },
      positioning: {
        competitors: ["子ども向けレトルト", "冷凍食品"],
        pop: ["甘辛い味付け", "子どもウケする味"],
        pod: ["野菜たっぷりでも食べてくれる", "栄養バランス", "食育につながる"],
      },
      evidence: {
        postCount: 190,
        topKeywords: ["子ども", "野菜", "完食", "おかわり"],
        samplePosts: [],
      },
    },
  ],

  味の素: [
    {
      id: "uc_1",
      name: "味付け不安解消",
      context: {
        why: "料理の味が物足りない時の最後の一振り",
        when: "日常の料理時",
        where: "自宅キッチン",
        withWhom: "自分・家族のため",
      },
      positioning: {
        competitors: ["塩", "醤油", "その他調味料"],
        pop: ["少量で効く", "どんな料理にも使える"],
        pod: ["うま味の万能性", "味の素でしか出せない旨味", "料理の完成度が上がる"],
      },
      evidence: {
        postCount: 280,
        topKeywords: ["うま味", "隠し味", "味が決まる"],
        samplePosts: [],
      },
    },
    {
      id: "uc_2",
      name: "健康意識",
      context: {
        why: "塩分を控えながらも美味しく食べたい",
        when: "日常の料理時",
        where: "自宅キッチン",
        withWhom: "家族のため",
      },
      positioning: {
        competitors: ["減塩調味料", "ハーブ・スパイス"],
        pop: ["塩分控えめでも満足", "健康的"],
        pod: ["うま味で減塩効果", "物足りなさを感じない", "健康と美味しさの両立"],
      },
      evidence: {
        postCount: 150,
        topKeywords: ["減塩", "健康", "うま味"],
        samplePosts: [],
      },
    },
    {
      id: "uc_3",
      name: "一人暮らし手抜き",
      context: {
        why: "簡単に美味しいものを作りたい",
        when: "日常の料理時",
        where: "自宅キッチン",
        withWhom: "自分のため",
      },
      positioning: {
        competitors: ["インスタント食品", "コンビニ弁当"],
        pop: ["手軽さ", "長期保存可能"],
        pod: ["何にでも使える万能性", "一振りで味が変わる", "自炊のハードルを下げる"],
      },
      evidence: {
        postCount: 120,
        topKeywords: ["一人暮らし", "簡単", "万能"],
        samplePosts: [],
      },
    },
  ],

  丸鶏がらスープ: [
    {
      id: "uc_1",
      name: "平日夜の時短",
      context: {
        why: "手早く本格的なスープを作りたい",
        when: "平日夜（急いで作る必要がある時）",
        where: "自宅キッチン",
        withWhom: "家族のため",
      },
      positioning: {
        competitors: ["インスタントスープ", "缶詰スープ", "レトルトスープ"],
        pop: ["溶けやすい", "時短調理"],
        pod: ["本格鶏ガラの風味", "コクのある味わい", "中華だけでなく和洋にも"],
      },
      evidence: {
        postCount: 220,
        topKeywords: ["スープ", "鶏ガラ", "時短", "本格"],
        samplePosts: [],
      },
    },
    {
      id: "uc_2",
      name: "アレンジ自在",
      context: {
        why: "いろんな料理に使える万能調味料が欲しい",
        when: "日常の料理時",
        where: "自宅キッチン",
        withWhom: "自分のため",
      },
      positioning: {
        competitors: ["コンソメ", "ブイヨン", "和風だし"],
        pop: ["万能調味料", "どんな料理にも合う"],
        pod: ["中華以外にも使える汎用性", "チャーハンの決め手", "野菜炒めに最適"],
      },
      evidence: {
        postCount: 180,
        topKeywords: ["チャーハン", "炒め物", "万能"],
        samplePosts: [],
      },
    },
    {
      id: "uc_3",
      name: "健康意識",
      context: {
        why: "体が温まる栄養のあるスープを作りたい",
        when: "日常の食事時",
        where: "自宅キッチン",
        withWhom: "家族のため",
      },
      positioning: {
        competitors: ["健康食品", "サプリメント入りスープ"],
        pop: ["ヘルシー", "野菜たっぷり"],
        pod: ["コラーゲン感", "体の芯から温まる", "滋養がある印象"],
      },
      evidence: {
        postCount: 130,
        topKeywords: ["健康", "温まる", "野菜スープ"],
        samplePosts: [],
      },
    },
  ],

  香味ペースト: [
    {
      id: "uc_1",
      name: "平日夜の時短",
      context: {
        why: "炒め物を簡単に本格的に仕上げたい",
        when: "平日夜（急いで作る必要がある時）",
        where: "自宅キッチン",
        withWhom: "自分・家族のため",
      },
      positioning: {
        competitors: ["中華調味料", "オイスターソース", "合わせ調味料"],
        pop: ["ワンタッチで使える", "チューブで便利"],
        pod: ["香味野菜の本格風味", "にんにく・生姜の手間なし", "炒め物が劇的に変わる"],
      },
      evidence: {
        postCount: 200,
        topKeywords: ["炒め物", "香味", "時短", "本格"],
        samplePosts: [],
      },
    },
    {
      id: "uc_2",
      name: "一人暮らし手抜き",
      context: {
        why: "一人分の料理を簡単に美味しく作りたい",
        when: "日常の料理時",
        where: "自宅キッチン",
        withWhom: "自分のため",
      },
      positioning: {
        competitors: ["インスタント食品", "冷凍食品"],
        pop: ["1本で完結", "手軽さ"],
        pod: ["本格的な仕上がり", "野菜炒めが店の味に", "コスパの良さ"],
      },
      evidence: {
        postCount: 160,
        topKeywords: ["一人暮らし", "簡単", "野菜炒め"],
        samplePosts: [],
      },
    },
    {
      id: "uc_3",
      name: "晩酌おつまみ",
      context: {
        why: "ビールに合う一品を手早く作りたい",
        when: "夜の晩酌時",
        where: "自宅キッチン",
        withWhom: "自分のため",
      },
      positioning: {
        competitors: ["冷凍おつまみ", "スナック菓子", "コンビニ総菜"],
        pop: ["手軽さ", "すぐできる"],
        pod: ["パンチのある味", "ビールが進む", "本格中華風おつまみ"],
      },
      evidence: {
        postCount: 90,
        topKeywords: ["おつまみ", "ビール", "晩酌"],
        samplePosts: [],
      },
    },
  ],

  コンソメ: [
    {
      id: "uc_1",
      name: "週末の本格料理",
      context: {
        why: "本格的な洋食を家庭で作りたい",
        when: "週末夕食",
        where: "自宅キッチン",
        withWhom: "家族のため",
      },
      positioning: {
        competitors: ["ブイヨン", "鶏ガラスープ", "洋風だし"],
        pop: ["溶けやすい", "使いやすい"],
        pod: ["本格洋風だしの風味", "シチュー・カレーに欠かせない", "プロの味"],
      },
      evidence: {
        postCount: 240,
        topKeywords: ["シチュー", "カレー", "洋食", "本格"],
        samplePosts: [],
      },
    },
    {
      id: "uc_2",
      name: "おもてなし",
      context: {
        why: "来客に美味しい料理を振る舞いたい",
        when: "パーティー・おもてなし時",
        where: "自宅キッチン",
        withWhom: "来客のため",
      },
      positioning: {
        competitors: ["レストランケータリング", "高級レトルト"],
        pop: ["失敗しない", "安定した味"],
        pod: ["高級感のある味わい", "ポタージュが絶品", "おもてなし料理の格が上がる"],
      },
      evidence: {
        postCount: 120,
        topKeywords: ["おもてなし", "ポタージュ", "来客"],
        samplePosts: [],
      },
    },
    {
      id: "uc_3",
      name: "子ども好き嫌い",
      context: {
        why: "子どもが野菜を食べてくれるスープを作りたい",
        when: "日常の食事準備時",
        where: "自宅キッチン",
        withWhom: "子どものため",
      },
      positioning: {
        competitors: ["子ども向けスープ", "野菜ジュース"],
        pop: ["優しい味", "野菜が溶け込む"],
        pod: ["野菜が食べやすくなる", "栄養満点スープ", "子どもが喜ぶ味"],
      },
      evidence: {
        postCount: 100,
        topKeywords: ["子ども", "野菜スープ", "完食"],
        samplePosts: [],
      },
    },
  ],

  ピュアセレクト: [
    {
      id: "uc_1",
      name: "健康意識",
      context: {
        why: "体に良いマヨネーズを選びたい",
        when: "日常の食事時",
        where: "自宅キッチン",
        withWhom: "家族のため",
      },
      positioning: {
        competitors: ["一般的なマヨネーズ", "カロリーハーフマヨネーズ"],
        pop: ["コレステロールゼロ", "健康的"],
        pod: ["卵のコクがしっかり", "健康でも妥協しない味", "罪悪感なく使える"],
      },
      evidence: {
        postCount: 180,
        topKeywords: ["健康", "コレステロール", "美味しい"],
        samplePosts: [],
      },
    },
    {
      id: "uc_2",
      name: "子ども好き嫌い",
      context: {
        why: "子どもにサラダを食べさせたい",
        when: "日常の食事準備時",
        where: "自宅キッチン",
        withWhom: "子どものため",
      },
      positioning: {
        competitors: ["ドレッシング", "ディップソース"],
        pop: ["食べやすい味", "野菜に合う"],
        pod: ["サラダがどんどん進む", "野菜嫌い克服", "マイルドで子ども向け"],
      },
      evidence: {
        postCount: 130,
        topKeywords: ["サラダ", "子ども", "野菜"],
        samplePosts: [],
      },
    },
    {
      id: "uc_3",
      name: "一人暮らし手抜き",
      context: {
        why: "手軽にサラダを美味しく食べたい",
        when: "日常の食事時",
        where: "自宅キッチン",
        withWhom: "自分のため",
      },
      positioning: {
        competitors: ["ドレッシング", "サラダキット"],
        pop: ["使いやすい", "どんな野菜にも合う"],
        pod: ["マヨネーズの定番感", "安心の味", "料理の幅が広がる"],
      },
      evidence: {
        postCount: 90,
        topKeywords: ["サラダ", "簡単", "マヨネーズ"],
        samplePosts: [],
      },
    },
  ],

  アジシオ: [
    {
      id: "uc_1",
      name: "日常の調理",
      context: {
        why: "料理の味を整えたい",
        when: "日常の料理時",
        where: "自宅キッチン",
        withWhom: "自分のため",
      },
      positioning: {
        competitors: ["食塩", "岩塩", "その他調味塩"],
        pop: ["使いやすい", "サラサラで振りやすい"],
        pod: ["うま味がプラスされる", "普通の塩より料理が美味しくなる", "まろやかな塩味"],
      },
      evidence: {
        postCount: 150,
        topKeywords: ["塩", "うま味", "料理"],
        samplePosts: [],
      },
    },
    {
      id: "uc_2",
      name: "おにぎり・焼き魚",
      context: {
        why: "定番料理を美味しく仕上げたい",
        when: "日常の食事準備時",
        where: "自宅キッチン",
        withWhom: "家族のため",
      },
      positioning: {
        competitors: ["普通の塩", "梅塩", "ゆかり"],
        pop: ["振りやすい", "適量が出せる"],
        pod: ["まろやかな塩味", "おにぎりが美味しくなる", "焼き魚に最適"],
      },
      evidence: {
        postCount: 120,
        topKeywords: ["おにぎり", "焼き魚", "美味しい"],
        samplePosts: [],
      },
    },
    {
      id: "uc_3",
      name: "健康意識",
      context: {
        why: "塩分を控えながらも美味しく食べたい",
        when: "日常の食事時",
        where: "自宅キッチン",
        withWhom: "家族のため",
      },
      positioning: {
        competitors: ["減塩塩", "塩分カット調味料"],
        pop: ["少量でOK", "健康的"],
        pod: ["うま味で減塩効果", "物足りなさを感じない", "味の素との相乗効果"],
      },
      evidence: {
        postCount: 80,
        topKeywords: ["減塩", "健康", "うま味"],
        samplePosts: [],
      },
    },
  ],
};

async function seedDPTData() {
  console.log("Starting DPT data seeding...\n");

  // ブランドマスタを取得
  const { data: brands, error: brandsError } = await supabase
    .from("brands")
    .select("id, name");

  if (brandsError) {
    console.error("Failed to fetch brands:", brandsError);
    return;
  }

  const brandMap = new Map(brands?.map((b) => [b.name, b.id]) || []);

  // 現在時刻と1年後の期限
  const now = new Date();
  const oneYearLater = new Date(now);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  let successCount = 0;
  let errorCount = 0;

  for (const [brandName, useCases] of Object.entries(DPT_DATA)) {
    const brandId = brandMap.get(brandName);

    if (!brandId) {
      console.warn(`  Warning: Brand "${brandName}" not found in database`);
      errorCount++;
      continue;
    }

    // 投稿数の合計を計算
    const totalPostCount = useCases.reduce(
      (sum, uc) => sum + uc.evidence.postCount,
      0
    );

    // brand_dpt_cache にupsert
    const { error } = await supabase.from("brand_dpt_cache").upsert(
      {
        brand_id: brandId,
        dpt_data: { useCases },
        post_count: totalPostCount,
        use_case_count: useCases.length,
        llm_provider: "static",
        llm_model: "manual",
        generation_time_ms: 0,
        generated_at: now.toISOString(),
        expires_at: oneYearLater.toISOString(),
      },
      { onConflict: "brand_id" }
    );

    if (error) {
      console.error(`  Error seeding ${brandName}:`, error.message);
      errorCount++;
    } else {
      console.log(
        `  Seeded: ${brandName} (${useCases.length} use cases, ${totalPostCount} posts)`
      );
      successCount++;
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Success: ${successCount} brands`);
  console.log(`Errors: ${errorCount} brands`);
  console.log(`Expires at: ${oneYearLater.toISOString()}`);
}

seedDPTData().catch(console.error);
