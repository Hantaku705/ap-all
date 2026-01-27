#!/usr/bin/env npx tsx
/**
 * Report Brushup Script
 *
 * Detects low-quality sections in brand reports and regenerates them
 * using LLM with UGC evidence from Supabase.
 *
 * Usage:
 *   npx tsx scripts/brushup-reports.ts                    # All brands
 *   npx tsx scripts/brushup-reports.ts --brand=ほんだし   # Single brand
 *   npx tsx scripts/brushup-reports.ts --dry-run          # Detect only, no changes
 *   npx tsx scripts/brushup-reports.ts --verbose          # Detailed logging
 */

import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

import {
  detectQualityIssues,
  getQualityIssueSummary,
  filterIssuesBySeverity,
  groupIssuesBySection,
  fetchUGCForSection,
  fetchUGCForStrategy,
  fetchUGCAggregation,
  fetchUGCAggregationFallback,
  fetchStratifiedSample,
  getSectionType,
  regenerateSection,
  regenerateStrategy,
  isLLMAvailable,
  getAvailableLLMProvider,
  type BrandReport,
  type QualityIssue,
  type Severity,
  type UGCAggregation,
} from "../src/lib/report-quality";

// Configuration
const REPORTS_DIR = path.join(__dirname, "../output/reports");
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

// CLI arguments
interface CliArgs {
  brand?: string;
  dryRun: boolean;
  verbose: boolean;
  minSeverity: Severity;
}

function parseArgs(): CliArgs {
  const args: CliArgs = {
    dryRun: false,
    verbose: false,
    minSeverity: "medium",
  };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--brand=")) {
      args.brand = arg.replace("--brand=", "");
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--verbose") {
      args.verbose = true;
    } else if (arg.startsWith("--min-severity=")) {
      args.minSeverity = arg.replace("--min-severity=", "") as Severity;
    }
  }

  return args;
}

// Logging utilities
function log(message: string, verbose: boolean = false): void {
  if (!verbose || parseArgs().verbose) {
    console.log(message);
  }
}

function logError(message: string): void {
  console.error(`❌ ${message}`);
}

function logSuccess(message: string): void {
  console.log(`✅ ${message}`);
}

function logWarning(message: string): void {
  console.log(`⚠️  ${message}`);
}

function logInfo(message: string): void {
  console.log(`ℹ️  ${message}`);
}

/**
 * Load report from file
 */
function loadReport(brandName: string): BrandReport | null {
  const reportPath = path.join(REPORTS_DIR, brandName, "report.json");

  if (!fs.existsSync(reportPath)) {
    logError(`Report not found: ${reportPath}`);
    return null;
  }

  try {
    const content = fs.readFileSync(reportPath, "utf-8");
    return JSON.parse(content) as BrandReport;
  } catch (error) {
    logError(`Failed to parse report: ${reportPath}`);
    return null;
  }
}

/**
 * Save report to file with backup
 */
function saveReport(brandName: string, report: BrandReport): void {
  const reportPath = path.join(REPORTS_DIR, brandName, "report.json");
  const backupPath = path.join(REPORTS_DIR, brandName, "report.json.bak");

  // Create backup
  if (fs.existsSync(reportPath)) {
    fs.copyFileSync(reportPath, backupPath);
  }

  // Save updated report
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  // Regenerate markdown
  const markdownPath = path.join(REPORTS_DIR, brandName, "report.md");
  const markdown = generateMarkdown(report);
  fs.writeFileSync(markdownPath, markdown, "utf-8");
}

/**
 * Generate markdown from report JSON
 */
function generateMarkdown(report: BrandReport): string {
  const lines: string[] = [];

  lines.push(`# ${report.title}`);
  lines.push("");
  lines.push(`*生成日時: ${new Date(report.generatedAt).toLocaleString("ja-JP")}*`);
  lines.push("");

  // Strategy summary
  if (report.strategy) {
    lines.push("## 戦略サマリー");
    lines.push("");

    if (report.strategy.keyInsight) {
      lines.push(`**キーインサイト**: ${report.strategy.keyInsight}`);
      lines.push("");
    }

    if (report.strategy.executiveSummary) {
      lines.push(`**エグゼクティブサマリー**: ${report.strategy.executiveSummary}`);
      lines.push("");
    }

    if (report.strategy.findings && report.strategy.findings.length > 0) {
      lines.push("### 主な発見事項");
      for (const finding of report.strategy.findings) {
        lines.push(`- ${finding}`);
      }
      lines.push("");
    }

    if (report.strategy.recommendations && report.strategy.recommendations.length > 0) {
      lines.push("### 推奨アクション");
      for (const rec of report.strategy.recommendations) {
        lines.push(`- ${rec}`);
      }
      lines.push("");
    }

    if (report.strategy.actionPlan && report.strategy.actionPlan.length > 0) {
      lines.push("### アクションプラン");
      for (const action of report.strategy.actionPlan) {
        lines.push(`- ${action}`);
      }
      lines.push("");
    }
  }

  // Sections
  for (const section of report.sections) {
    lines.push(`## ${section.title}`);
    lines.push("");

    if (section.question) {
      lines.push(`*${section.question}*`);
      lines.push("");
    }

    if (section.findings && section.findings.length > 0) {
      lines.push("### 発見事項");
      for (const finding of section.findings) {
        lines.push(`- ${finding}`);
      }
      lines.push("");
    }

    if (section.dataTable && section.dataTable.length > 0) {
      lines.push("### データ");
      const headers = Object.keys(section.dataTable[0]);
      lines.push(`| ${headers.join(" | ")} |`);
      lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
      for (const row of section.dataTable) {
        lines.push(`| ${headers.map((h) => row[h]).join(" | ")} |`);
      }
      lines.push("");
    }

    if (section.insights && section.insights.length > 0) {
      lines.push("### インサイト");
      for (const insight of section.insights) {
        lines.push(`- ${insight}`);
      }
      lines.push("");
    }

    if (section.recommendations && section.recommendations.length > 0) {
      lines.push("### 推奨アクション");
      for (const rec of section.recommendations) {
        lines.push(`- ${rec}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Process a single brand report
 */
async function processBrand(
  brandName: string,
  args: CliArgs
): Promise<{
  brandName: string;
  issuesFound: number;
  sectionsImproved: number;
  strategyImproved: boolean;
}> {
  log(`\n${"=".repeat(60)}`);
  log(`Processing: ${brandName}`);
  log("=".repeat(60));

  // Load report
  const report = loadReport(brandName);
  if (!report) {
    return { brandName, issuesFound: 0, sectionsImproved: 0, strategyImproved: false };
  }

  // Detect quality issues
  const allIssues = detectQualityIssues(report);
  const issues = filterIssuesBySeverity(allIssues, args.minSeverity);
  const summary = getQualityIssueSummary(issues);

  log(`\nQuality issues detected: ${summary.total}`);
  log(`  - HIGH: ${summary.bySeverity.high}`);
  log(`  - MEDIUM: ${summary.bySeverity.medium}`);
  log(`  - LOW: ${summary.bySeverity.low}`);

  if (args.verbose) {
    log("\nIssues by section:");
    for (const [section, count] of Object.entries(summary.bySection)) {
      log(`  - ${section}: ${count}`);
    }
  }

  if (issues.length === 0) {
    logSuccess(`No quality issues found for ${brandName}`);
    return { brandName, issuesFound: 0, sectionsImproved: 0, strategyImproved: false };
  }

  if (args.dryRun) {
    logInfo("Dry run mode - no changes will be made");
    log("\nDetected issues:");
    for (const issue of issues) {
      log(`  [${issue.severity.toUpperCase()}] ${issue.sectionTitle}: ${issue.reason}`);
      if (args.verbose) {
        log(`    Original: "${issue.originalValue.substring(0, 80)}..."`);
      }
    }
    return { brandName, issuesFound: issues.length, sectionsImproved: 0, strategyImproved: false };
  }

  // Fetch aggregation data for the entire brand (once per brand)
  log(`\nFetching UGC aggregation statistics for ${brandName}...`);
  let aggregation: UGCAggregation | undefined;
  try {
    aggregation = await fetchUGCAggregation(brandName);
    log(`  Total UGC: ${aggregation.totalCount.toLocaleString()} posts`);
    log(`  Sentiment: ${aggregation.sentimentDistribution.map(s => `${s.sentiment}=${s.percentage.toFixed(1)}%`).join(", ")}`);
    log(`  Top CEPs: ${aggregation.cepDistribution.slice(0, 3).map(c => c.cep_name).join(", ")}`);
    log(`  Engagement: avg=${aggregation.engagementStats.avg.toFixed(1)}, max=${aggregation.engagementStats.max}`);
  } catch (error) {
    logWarning(`Failed to fetch aggregation via RPC, trying fallback...`);
    try {
      aggregation = await fetchUGCAggregationFallback(brandName);
      log(`  Fallback succeeded: ${aggregation.totalCount.toLocaleString()} posts`);
    } catch (fallbackError) {
      logWarning(`Aggregation fallback also failed, proceeding without aggregation`);
      aggregation = undefined;
    }
  }

  // Group issues by section
  const issuesBySection = groupIssuesBySection(issues);
  let sectionsImproved = 0;
  let strategyImproved = false;

  // Process strategy issues
  const strategyIssues = issues.filter((i) => i.sectionTitle === "戦略サマリー");
  if (strategyIssues.length > 0 && report.strategy) {
    log(`\nRegenerating strategy (${strategyIssues.length} issues)...`);

    const ugcEvidence = await fetchUGCForStrategy(brandName, 20);
    log(`  Fetched UGC: ${ugcEvidence.highEngagement.length} high-eng, ${ugcEvidence.negative.length} negative, ${ugcEvidence.withCEP.length} with-CEP`);
    if (aggregation) {
      log(`  Using aggregation: ${aggregation.totalCount.toLocaleString()} total posts for context`);
    }

    const regenerated = await regenerateStrategy(brandName, report.strategy, strategyIssues, ugcEvidence, aggregation);

    if (regenerated) {
      // Merge regenerated content
      report.strategy.keyInsight = regenerated.keyInsight || report.strategy.keyInsight;
      report.strategy.executiveSummary = regenerated.executiveSummary || report.strategy.executiveSummary;
      report.strategy.findings = regenerated.findings.length > 0 ? regenerated.findings : report.strategy.findings;
      report.strategy.recommendations = regenerated.recommendations.length > 0 ? regenerated.recommendations : report.strategy.recommendations;
      report.strategy.actionPlan = regenerated.actionPlan.length > 0 ? regenerated.actionPlan : report.strategy.actionPlan;

      strategyImproved = true;
      logSuccess("Strategy regenerated successfully");
      log(`  Cited ${regenerated.citedPostIds.length} UGC posts`);
    } else {
      logWarning("Strategy regeneration failed");
    }
  }

  // Process section issues
  for (const [sectionTitle, sectionIssues] of issuesBySection) {
    if (sectionTitle === "戦略サマリー") continue;

    const sectionIndex = report.sections.findIndex((s) => s.title === sectionTitle);
    if (sectionIndex === -1) continue;

    const section = report.sections[sectionIndex];
    log(`\nRegenerating section: ${sectionTitle} (${sectionIssues.length} issues)...`);

    // Fetch UGC evidence using stratified sampling for diversity
    const sectionType = getSectionType(sectionTitle);
    let ugcEvidence = await fetchStratifiedSample(brandName, sectionType, 30);

    // Fallback to regular fetching if stratified sample is too small
    if (ugcEvidence.length < 15) {
      log(`  Stratified sample small (${ugcEvidence.length}), adding top engagement posts...`);
      const topEngagement = await fetchUGCForSection(brandName, sectionType, 30);
      const existingIds = new Set(ugcEvidence.map(e => e.id));
      const additional = topEngagement.filter(e => !existingIds.has(e.id));
      ugcEvidence = [...ugcEvidence, ...additional].slice(0, 30);
    }

    log(`  Fetched ${ugcEvidence.length} UGC posts for ${sectionType} (stratified sampling)`);
    if (aggregation) {
      log(`  Using aggregation: ${aggregation.totalCount.toLocaleString()} total posts for context`);
    }

    if (ugcEvidence.length < 5) {
      logWarning(`Insufficient UGC (${ugcEvidence.length} < 5), skipping section`);
      continue;
    }

    // Regenerate section with aggregation context
    const regenerated = await regenerateSection(section, sectionIssues, ugcEvidence, aggregation);

    if (regenerated) {
      // Merge regenerated content
      if (regenerated.findings.length > 0) {
        report.sections[sectionIndex].findings = regenerated.findings;
      }
      if (regenerated.insights.length > 0) {
        report.sections[sectionIndex].insights = regenerated.insights;
      }
      if (regenerated.recommendations.length > 0) {
        report.sections[sectionIndex].recommendations = regenerated.recommendations;
      }

      sectionsImproved++;
      logSuccess(`Section regenerated: ${sectionTitle}`);
      log(`  Cited ${regenerated.citedPostIds.length} UGC posts`);
    } else {
      logWarning(`Section regeneration failed: ${sectionTitle}`);
    }
  }

  // Save updated report
  if (sectionsImproved > 0 || strategyImproved) {
    report.generatedAt = new Date().toISOString();
    saveReport(brandName, report);
    logSuccess(`Report saved: ${brandName}`);
  }

  return { brandName, issuesFound: issues.length, sectionsImproved, strategyImproved };
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const args = parseArgs();

  console.log("\n" + "=".repeat(60));
  console.log("Report Brushup Script");
  console.log("=".repeat(60));
  console.log(`Mode: ${args.dryRun ? "DRY RUN (no changes)" : "LIVE (will modify files)"}`);
  console.log(`Min severity: ${args.minSeverity}`);
  console.log(`LLM provider: ${getAvailableLLMProvider()}`);

  if (!isLLMAvailable() && !args.dryRun) {
    logError("No LLM provider available. Set OPENAI_API_KEY or GEMINI_API_KEY.");
    process.exit(1);
  }

  // Determine brands to process
  const brands = args.brand ? [args.brand] : VALID_BRANDS;

  if (args.brand && !VALID_BRANDS.includes(args.brand)) {
    logError(`Invalid brand: ${args.brand}`);
    console.log(`Valid brands: ${VALID_BRANDS.join(", ")}`);
    process.exit(1);
  }

  // Process each brand
  const results: Awaited<ReturnType<typeof processBrand>>[] = [];

  for (const brand of brands) {
    const result = await processBrand(brand, args);
    results.push(result);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("Summary");
  console.log("=".repeat(60));

  const totalIssues = results.reduce((sum, r) => sum + r.issuesFound, 0);
  const totalSections = results.reduce((sum, r) => sum + r.sectionsImproved, 0);
  const totalStrategies = results.filter((r) => r.strategyImproved).length;

  console.log(`\nBrands processed: ${results.length}`);
  console.log(`Total issues found: ${totalIssues}`);

  if (!args.dryRun) {
    console.log(`Sections improved: ${totalSections}`);
    console.log(`Strategies improved: ${totalStrategies}`);
  }

  console.log("\nPer-brand results:");
  for (const result of results) {
    const status = args.dryRun
      ? `${result.issuesFound} issues`
      : `${result.issuesFound} issues → ${result.sectionsImproved} sections improved`;
    console.log(`  ${result.brandName}: ${status}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log(args.dryRun ? "Dry run complete" : "Brushup complete");
  console.log("=".repeat(60) + "\n");
}

// Run
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
