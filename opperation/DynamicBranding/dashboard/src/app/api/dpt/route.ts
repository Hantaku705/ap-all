import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }

  return createClient(supabaseUrl, supabaseKey);
}

const VALID_BRANDS = [
  "ほんだし",
  "クックドゥ",
  "味の素",
  "丸鶏がらスープ",
  "香味ペースト",
  "コンソメ",
  "ピュアセレクト",
  "アジシオ",
];

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
    topKeywords?: string[];
    samplePosts?: string[];
  };
}

interface DPTDetailUseCase extends UseCase {
  brandName: string;
  brandId: number;
  generatedAt: string | null;
}

interface DPTSummary {
  brandName: string;
  brandId: number | null;
  useCaseCount: number;
  postCount: number;
  topUseCase: string | null;
  topUseCasePostCount: number;
  generatedAt: string | null;
  expiresAt: string | null;
  isExpired: boolean;
  isGenerated: boolean;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");
  try {
    const supabase = getSupabaseClient();

    // 全ブランドのID取得
    const { data: brands, error: brandsError } = await supabase
      .from("brands")
      .select("id, name")
      .in("name", VALID_BRANDS);

    if (brandsError) {
      console.error("Brands fetch error:", brandsError);
      return NextResponse.json(
        { error: "Failed to fetch brands" },
        { status: 500 }
      );
    }

    const brandMap = new Map(brands?.map((b) => [b.name, b.id]) || []);

    // 全キャッシュデータを取得
    const { data: cacheData, error: cacheError } = await supabase
      .from("brand_dpt_cache")
      .select(
        "brand_id, dpt_data, post_count, use_case_count, generated_at, expires_at"
      );

    if (cacheError) {
      console.error("Cache fetch error:", cacheError);
    }

    const cacheMap = new Map(
      cacheData?.map((c) => [c.brand_id, c]) || []
    );

    // 詳細ビュー: 全Use Caseをフラットに展開
    if (view === "detail") {
      const useCases: DPTDetailUseCase[] = [];
      for (const brandName of VALID_BRANDS) {
        const brandId = brandMap.get(brandName);
        if (!brandId) continue;

        const cache = cacheMap.get(brandId);
        if (!cache?.dpt_data) continue;

        const dptData = cache.dpt_data as { useCases?: UseCase[] };
        const brandUseCases = dptData?.useCases || [];

        for (const uc of brandUseCases) {
          useCases.push({
            ...uc,
            brandName,
            brandId,
            generatedAt: cache.generated_at,
          });
        }
      }

      return NextResponse.json({
        useCases,
        totalCount: useCases.length,
      });
    }

    const now = new Date();

    // 全ブランドのサマリーを生成
    const summaries: DPTSummary[] = VALID_BRANDS.map((brandName) => {
      const brandId = brandMap.get(brandName) || null;
      const cache = brandId ? cacheMap.get(brandId) : null;

      if (!cache) {
        return {
          brandName,
          brandId,
          useCaseCount: 0,
          postCount: 0,
          topUseCase: null,
          topUseCasePostCount: 0,
          generatedAt: null,
          expiresAt: null,
          isExpired: true,
          isGenerated: false,
        };
      }

      // dpt_dataからトップUse Caseを抽出
      const dptData = cache.dpt_data as { useCases?: UseCase[] } | null;
      const useCases = dptData?.useCases || [];
      const topUseCase = useCases.length > 0 ? useCases[0] : null;

      const expiresAt = cache.expires_at
        ? new Date(cache.expires_at)
        : null;
      const isExpired = expiresAt ? expiresAt < now : true;

      return {
        brandName,
        brandId,
        useCaseCount: cache.use_case_count || useCases.length,
        postCount: cache.post_count || 0,
        topUseCase: topUseCase?.name || null,
        topUseCasePostCount: topUseCase?.evidence?.postCount || 0,
        generatedAt: cache.generated_at,
        expiresAt: cache.expires_at,
        isExpired,
        isGenerated: true,
      };
    });

    return NextResponse.json({
      summaries,
      generatedCount: summaries.filter((s) => s.isGenerated).length,
      expiredCount: summaries.filter((s) => s.isGenerated && s.isExpired)
        .length,
      totalBrands: VALID_BRANDS.length,
    });
  } catch (error) {
    console.error("Failed to fetch DPT summaries:", error);
    return NextResponse.json(
      { error: "Failed to fetch DPT summaries" },
      { status: 500 }
    );
  }
}
