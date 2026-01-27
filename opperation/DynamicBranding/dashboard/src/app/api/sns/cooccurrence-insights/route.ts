import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "output",
      "sns",
      "cooccurrence-insights.json"
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ pairs: [] });
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch co-occurrence insights" },
      { status: 500 }
    );
  }
}
