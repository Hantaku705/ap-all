import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { ReportContent, ReportHeading } from "@/types/data.types";

const REPORT_PATHS: Record<string, string> = {
  "total-simple": "total/report_simple/report_simple.md",
  "total-detail": "total/report_detail/report_detail.md",
  googletrend: "googletrend/report/report.md",
  sns: "sns/report/report.md",
};

function extractHeadings(markdown: string): ReportHeading[] {
  const headings: ReportHeading[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ level, text, id });
    }
  }

  return headings;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ホワイトリスト検証: idが許可されたキーのみ
    if (!Object.prototype.hasOwnProperty.call(REPORT_PATHS, id)) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const reportPath = REPORT_PATHS[id];
    const baseDir = path.resolve(process.cwd(), "data/output");
    const filePath = path.resolve(baseDir, reportPath);

    // パストラバーサル防止: ファイルパスがbaseDir内にあることを確認
    if (!filePath.startsWith(baseDir + path.sep)) {
      return NextResponse.json({ error: "Invalid report path" }, { status: 400 });
    }

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const headings = extractHeadings(content);

      const response: ReportContent = {
        content,
        headings,
      };

      return NextResponse.json(response);
    } catch (fileError) {
      console.error(`File not found: ${filePath}`, fileError);
      return NextResponse.json({ error: "Report file not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to fetch report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
