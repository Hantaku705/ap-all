import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand");

    // ブランド指定時は新しいディレクトリ構造を使用
    if (brand && brand !== "all") {
      const brandFilePath = path.join(
        process.cwd(),
        "output",
        "sns",
        "sentiments",
        `${brand}.json`
      );
      if (fs.existsSync(brandFilePath)) {
        const data = JSON.parse(fs.readFileSync(brandFilePath, "utf-8"));
        // 単一ブランドのデータを配列として返す
        return NextResponse.json([data]);
      }
    }

    // 全体データ（新しいall.jsonまたは旧sentiments.json）
    const allFilePath = path.join(
      process.cwd(),
      "output",
      "sns",
      "sentiments",
      "all.json"
    );
    if (fs.existsSync(allFilePath)) {
      const data = JSON.parse(fs.readFileSync(allFilePath, "utf-8"));
      return NextResponse.json(data);
    }

    // フォールバック: 旧形式
    const filePath = path.join(process.cwd(), "output", "sns", "sentiments.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching SNS sentiments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
