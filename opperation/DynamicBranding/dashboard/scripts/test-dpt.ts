import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
  const brandName = "クックドゥ";

  // CEP別の投稿を集計
  const { data, error } = await supabase
    .from("sns_posts")
    .select("cep_id, intent, emotion, cooking_for, meal_occasion, motivation_category, content")
    .ilike("brand_mentions", `%${brandName}%`)
    .not("cep_id", "is", null)
    .limit(200);

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("取得件数:", data.length);

  // CEPごとにグループ化
  const cepGroups = new Map<number, typeof data>();
  for (const post of data) {
    if (!post.cep_id) continue;
    const group = cepGroups.get(post.cep_id) || [];
    group.push(post);
    cepGroups.set(post.cep_id, group);
  }

  console.log("CEPグループ数:", cepGroups.size);

  // 各CEPの件数を表示
  for (const [cepId, posts] of cepGroups.entries()) {
    console.log(`  CEP ${cepId}: ${posts.length}件`);
  }
}

test();
