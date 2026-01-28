import { NextRequest, NextResponse } from "next/server";
import type { LoyaltyGrowthResponse } from "@/types/corporate.types";
import corp1Growth from "@/data/corporate-loyalty/corp-1-growth.json";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ corpId: string }> }
) {
  const { corpId } = await params;

  if (corpId === "1") {
    return NextResponse.json(corp1Growth as LoyaltyGrowthResponse, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  }

  return NextResponse.json({ error: "Corporate not found" }, { status: 404 });
}
