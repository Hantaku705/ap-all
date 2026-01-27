import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // 2024年8月のコーポレートUGCを確認
  const { data: posts, count } = await supabase
    .from("sns_posts")
    .select("published, text, sentiment, engagement_total, is_corporate, corporate_topic", { count: "exact" })
    .eq("is_corporate", true)
    .gte("published", "2024-08-01T00:00:00Z")
    .lte("published", "2024-08-10T23:59:59Z")
    .order("published");

  console.log("2024年8月1-10日のコーポレートUGC:", count, "件");
  if (posts && posts.length > 0) {
    for (const p of posts.slice(0, 10)) {
      console.log("---");
      console.log("日時:", p.published);
      console.log("センチメント:", p.sentiment);
      console.log("本文:", (p.text || "").substring(0, 100));
    }
  }

  // 8月のUGCの実際の日付を確認
  console.log("\n=== 2024年8月のUGC日付サンプル ===");
  const { data: augSample } = await supabase
    .from("sns_posts")
    .select("published")
    .eq("is_corporate", true)
    .like("published", "2024-08%")
    .limit(10);

  if (augSample) {
    for (const p of augSample) {
      console.log("published:", p.published);
    }
  }

  // 文字列部分一致で8月のデータを取得
  console.log("\n=== 8月第1週のUGC（LIKE検索） ===");
  const { data: aug1stWeek, error } = await supabase
    .from("sns_posts")
    .select("published, text, sentiment, engagement_total, corporate_topic")
    .eq("is_corporate", true)
    .or("published.like.2024-08-01%,published.like.2024-08-02%,published.like.2024-08-03%,published.like.2024-08-04%,published.like.2024-08-05%,published.like.2024-08-06%,published.like.2024-08-07%")
    .order("engagement_total", { ascending: false })
    .limit(10);

  if (error) {
    console.log("エラー:", error.message);
  }
  console.log("件数:", aug1stWeek?.length || 0);
  if (aug1stWeek && aug1stWeek.length > 0) {
    for (const p of aug1stWeek) {
      console.log("---");
      console.log("日時:", p.published);
      console.log("トピック:", p.corporate_topic);
      console.log("センチメント:", p.sentiment);
      console.log("ENG:", p.engagement_total);
      console.log("本文:", (p.text || "").substring(0, 120));
    }
  }

  // 全期間のコーポレートUGCの月別件数を確認
  console.log("\n=== 月別コーポレートUGC件数 ===");
  const PAGE_SIZE = 1000;
  let offset = 0;
  const allPosts: Array<{ published: string }> = [];

  while (true) {
    const { data } = await supabase
      .from("sns_posts")
      .select("published")
      .eq("is_corporate", true)
      .range(offset, offset + PAGE_SIZE - 1);

    if (!data || data.length === 0) break;
    allPosts.push(...data);
    offset += PAGE_SIZE;
    if (data.length < PAGE_SIZE) break;
  }

  const monthly: Record<string, number> = {};
  for (const p of allPosts) {
    if (p.published) {
      const month = p.published.substring(0, 7);
      monthly[month] = (monthly[month] || 0) + 1;
    }
  }
  const sorted = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [month, cnt] of sorted) {
    console.log(month + ":", cnt, "件");
  }
}
check();
