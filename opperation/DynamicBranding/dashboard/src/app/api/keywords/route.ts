import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), "output", "keywords", "all.json");
    let data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get("brand");
    const type = searchParams.get("type"); // 'rising' | 'top' | null

    // Filter by brand if specified
    if (brand) {
      data = data.filter((r: { brand: string }) => r.brand === brand);
    }

    // Filter by type if specified
    if (type) {
      data = data.filter((r: { queryType: string }) => r.queryType === type);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
