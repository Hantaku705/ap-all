import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data, error } = await supabase
    .from("ceps")
    .select("id, cep_name, description")
    .order("id");
  
  if (error) {
    console.error("Error:", error.message);
    return;
  }
  
  console.log("CEP一覧:");
  data?.forEach(cep => {
    console.log(`  ${cep.id}: ${cep.cep_name} - ${cep.description}`);
  });
}

main();
