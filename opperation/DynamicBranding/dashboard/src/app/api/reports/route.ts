import { NextResponse } from "next/server";
import type { Report } from "@/types/data.types";

const REPORTS: Report[] = [
  // 静的レポート
  {
    id: "total-simple",
    title: "統合レポート（簡易版）",
    path: "total/report_simple/report_simple.md",
    category: "total",
  },
  {
    id: "total-detail",
    title: "統合レポート（詳細版）",
    path: "total/report_detail/report_detail.md",
    category: "total",
  },
  {
    id: "googletrend",
    title: "Google Trends分析",
    path: "googletrend/report/report.md",
    category: "googletrend",
  },
  {
    id: "sns",
    title: "SNS分析",
    path: "sns/report/report.md",
    category: "sns",
  },
  // Issue分析（動的レポート）
  {
    id: "issue-portfolio",
    title: "ポートフォリオ戦略分析",
    category: "issue",
    isDynamic: true,
    issueId: "portfolio",
  },
  {
    id: "issue-growth",
    title: "成長機会分析",
    category: "issue",
    isDynamic: true,
    issueId: "growth",
  },
  {
    id: "issue-risk",
    title: "リスク管理分析",
    category: "issue",
    isDynamic: true,
    issueId: "risk",
  },
  {
    id: "issue-ugc",
    title: "UGC活用分析",
    category: "issue",
    isDynamic: true,
    issueId: "ugc",
  },
];

export async function GET() {
  return NextResponse.json(REPORTS);
}
