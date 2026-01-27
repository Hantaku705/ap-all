import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand") || "all";

    const filePath = path.join(process.cwd(), "output", "sns", "labels", `${brand}.json`);

    // ファイルが存在しない場合はallを使用
    if (!fs.existsSync(filePath)) {
      const allPath = path.join(process.cwd(), "output", "sns", "labels", "all.json");
      const data = JSON.parse(fs.readFileSync(allPath, "utf-8"));
      return NextResponse.json(data);
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch label distribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch label distribution" },
      { status: 500 }
    );
  }
}
