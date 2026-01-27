/**
 * 鍋キューブのbrand_mentionsを更新するスクリプト
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Supabase credentials not found");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log("1. Finding posts with 鍋キューブ in content/title...");

  const { data: posts, error } = await supabase
    .from("sns_posts")
    .select("id, url, content, title, brand_mentions")
    .or("content.ilike.%鍋キューブ%,title.ilike.%鍋キューブ%");

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("   Found:", posts.length, "posts with 鍋キューブ in content/title");

  // Filter to those without 鍋キューブ in brand_mentions
  const toUpdate = posts.filter(
    (p) => !p.brand_mentions || !p.brand_mentions.includes("鍋キューブ")
  );

  console.log("   Need update:", toUpdate.length);

  // Update each post
  console.log("\n2. Updating brand_mentions...");
  let updated = 0;
  for (const post of toUpdate) {
    const currentMentions = post.brand_mentions
      ? post.brand_mentions.split(",").filter(Boolean)
      : [];
    if (!currentMentions.includes("鍋キューブ")) {
      currentMentions.push("鍋キューブ");
    }
    const newMentions = currentMentions.join(",");

    const { error: updateError } = await supabase
      .from("sns_posts")
      .update({ brand_mentions: newMentions })
      .eq("id", post.id);

    if (!updateError) {
      updated++;
    }
  }

  console.log("   Updated:", updated, "posts");

  // Verify
  console.log("\n3. Verifying...");
  const { count } = await supabase
    .from("sns_posts")
    .select("*", { count: "exact", head: true })
    .ilike("brand_mentions", "%鍋キューブ%");
  console.log("   Posts with 鍋キューブ in brand_mentions:", count);
}

main().catch(console.error);
