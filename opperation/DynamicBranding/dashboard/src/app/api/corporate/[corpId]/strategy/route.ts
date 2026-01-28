import { NextRequest, NextResponse } from "next/server";
import type { StrategyResponse } from "@/types/corporate.types";
import corp1Strategy from "@/data/corporate-strategy/corp-1.json";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ corpId: string }> }
) {
  try {
    const { corpId } = await params;

    // 静的データを返す
    if (corpId === "1") {
      return NextResponse.json(corp1Strategy as StrategyResponse);
    }

    return NextResponse.json(
      { error: "Corporate strategy not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Failed to load strategy:", error);
    return NextResponse.json(
      { error: "Failed to load strategy" },
      { status: 500 }
    );
  }
}
