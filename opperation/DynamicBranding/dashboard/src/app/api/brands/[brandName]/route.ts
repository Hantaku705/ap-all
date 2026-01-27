import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandName: string }> }
) {
  try {
    const { brandName } = await params;
    const decodedBrand = decodeURIComponent(brandName);

    // ブランド名の検証
    if (!VALID_BRANDS.includes(decodedBrand)) {
      return NextResponse.json(
        { error: "Invalid brand name" },
        { status: 404 }
      );
    }

    const filePath = path.join(process.cwd(), "output", "brands", `${decodedBrand}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch brand summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand summary" },
      { status: 500 }
    );
  }
}
