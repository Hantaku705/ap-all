import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ corpId: string }> }
) {
  try {
    const { corpId } = await params;
    const corporateId = parseInt(corpId);

    if (isNaN(corporateId)) {
      return NextResponse.json(
        { error: "Invalid corporate ID" },
        { status: 400 }
      );
    }

    // 静的ファイルから読み込み
    const filePath = path.join(process.cwd(), "output/corporate", `${corporateId}-fans.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Fan assets data not found" },
        { status: 404 }
      );
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Failed to fetch fan assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch fan assets" },
      { status: 500 }
    );
  }
}
