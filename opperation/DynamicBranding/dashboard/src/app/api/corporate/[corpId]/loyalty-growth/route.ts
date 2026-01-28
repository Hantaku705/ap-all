/**
 * Loyalty Growth Strategy API
 *
 * LLM動的生成 + 24時間キャッシュ + フォールバック（静的JSON）
 */

import { NextRequest, NextResponse } from "next/server";
import type { LoyaltyGrowthResponse } from "@/lib/loyalty-growth/types";
import {
  fetchAllLoyaltyGrowthData,
  transformToLLMInput,
  generateInputHash,
  generateLoyaltyGrowthStrategy,
  isLLMAvailable,
  getCachedLoyaltyGrowth,
  saveLoyaltyGrowthCache,
} from "@/lib/loyalty-growth";

// Fallback static data
import corp1Growth from "@/data/corporate-loyalty/corp-1-growth.json";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ corpId: string }> }
) {
  const { corpId } = await params;
  const corpIdNum = parseInt(corpId, 10);

  // Only corp_id=1 is supported
  if (corpIdNum !== 1) {
    return NextResponse.json({ error: "Corporate not found" }, { status: 404 });
  }

  try {
    // 1. Fetch raw data and calculate input hash
    const rawData = await fetchAllLoyaltyGrowthData();
    const input = transformToLLMInput(rawData);
    const inputHash = generateInputHash(input);

    // 2. Check cache
    const cached = await getCachedLoyaltyGrowth(corpIdNum, inputHash);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
          "X-Cache-Status": "HIT",
        },
      });
    }

    // 3. Check if LLM is available
    if (!isLLMAvailable()) {
      console.warn("No LLM available, returning static fallback");
      return returnFallback("LLM not available");
    }

    // 4. Generate with LLM
    const { output, model } = await generateLoyaltyGrowthStrategy(input);

    if (!output) {
      console.warn("LLM generation failed, returning static fallback");
      return returnFallback("LLM generation failed");
    }

    // 5. Save to cache
    await saveLoyaltyGrowthCache(corpIdNum, output, model, inputHash);

    // 6. Return response
    const response: LoyaltyGrowthResponse = {
      ...output,
      generatedAt: new Date().toISOString(),
      cached: false,
      inputHash,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        "X-Cache-Status": "MISS",
        "X-LLM-Model": model,
      },
    });
  } catch (error) {
    console.error("Error in loyalty-growth API:", error);
    return returnFallback("Server error");
  }
}

/**
 * Return static fallback data
 */
function returnFallback(reason: string) {
  const response: LoyaltyGrowthResponse = {
    ...(corp1Growth as LoyaltyGrowthResponse),
    generatedAt: new Date().toISOString(),
    cached: false,
    isFallback: true,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      "X-Cache-Status": "FALLBACK",
      "X-Fallback-Reason": reason,
    },
  });
}
