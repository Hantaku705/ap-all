import { NextRequest, NextResponse } from "next/server";
import type { LoyaltySummaryResponse } from "@/types/corporate.types";

// 静的データをインポート
import corp1Summary from "@/data/corporate-loyalty/corp-1-summary.json";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ corpId: string }> }
) {
  try {
    const { corpId } = await params;

    // コーポレートID 1 のみサポート
    if (corpId === "1") {
      return NextResponse.json(corp1Summary as LoyaltySummaryResponse, {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      });
    }

    return NextResponse.json(
      { error: "Corporate not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Failed to get loyalty summary:", error);
    return NextResponse.json(
      { error: "Failed to get loyalty summary" },
      { status: 500 }
    );
  }
}
