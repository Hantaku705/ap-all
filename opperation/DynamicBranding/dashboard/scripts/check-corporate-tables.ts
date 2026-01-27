import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\\n/g, "").trim() || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\\n/g, "").trim() || "";

const supabase = createClient(url, key);

async function main() {
  console.log("Checking corporate tables...");
  
  // 1. corporate_brands
  const { data: corpBrands, error: e1 } = await supabase
    .from("corporate_brands")
    .select("*")
    .limit(5);
  
  if (e1) {
    console.log("❌ corporate_brands:", e1.message);
  } else {
    console.log("✅ corporate_brands:", corpBrands?.length || 0, "rows");
    if (corpBrands && corpBrands.length > 0) {
      console.log("   Data:", JSON.stringify(corpBrands[0]));
    }
  }
  
  // 2. brand_hierarchy
  const { data: hierarchy, error: e2 } = await supabase
    .from("brand_hierarchy")
    .select("*")
    .limit(5);
  
  if (e2) {
    console.log("❌ brand_hierarchy:", e2.message);
  } else {
    console.log("✅ brand_hierarchy:", hierarchy?.length || 0, "rows");
  }
  
  // 3. stock_prices
  const { data: stocks, error: e3 } = await supabase
    .from("stock_prices")
    .select("*")
    .limit(5);
  
  if (e3) {
    console.log("❌ stock_prices:", e3.message);
  } else {
    console.log("✅ stock_prices:", stocks?.length || 0, "rows");
  }
  
  // 4. corporate_mvv
  const { data: mvv, error: e4 } = await supabase
    .from("corporate_mvv")
    .select("*")
    .limit(5);
  
  if (e4) {
    console.log("❌ corporate_mvv:", e4.message);
  } else {
    console.log("✅ corporate_mvv:", mvv?.length || 0, "rows");
  }
  
  // 5. fan_assets
  const { data: fans, error: e5 } = await supabase
    .from("fan_assets")
    .select("*")
    .limit(5);
  
  if (e5) {
    console.log("❌ fan_assets:", e5.message);
  } else {
    console.log("✅ fan_assets:", fans?.length || 0, "rows");
  }
}

main();
