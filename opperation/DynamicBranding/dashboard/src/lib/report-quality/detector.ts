/**
 * Report Quality Detector
 *
 * Detects low-quality sections in brand reports based on predefined rules.
 */

// Quality issue types
export type IssueType =
  | "template_phrase"
  | "too_abstract"
  | "high_unknown"
  | "missing_data"
  | "generic_recommendation";

export type Severity = "high" | "medium" | "low";

export interface QualityIssue {
  sectionTitle: string;
  issueType: IssueType;
  severity: Severity;
  field: "findings" | "insights" | "recommendations" | "dataTable" | "strategy";
  originalValue: string;
  reason: string;
}

export interface ReportSection {
  title: string;
  question?: string;
  findings?: string[];
  insights?: string[];
  recommendations?: string[];
  dataTable?: Record<string, string | number>[];
  samplePosts?: unknown[];
  priority?: string;
}

export interface ReportStrategy {
  findings?: string[];
  recommendations?: string[];
  keyInsight?: string;
  executiveSummary?: string;
  deepInsights?: string[];
  winningPatterns?: string[];
  improvementOpportunities?: string[];
  actionPlan?: string[];
  competitorStrategy?: string[];
}

export interface BrandReport {
  issueId: string;
  title: string;
  generatedAt: string;
  sections: ReportSection[];
  strategy?: ReportStrategy;
  markdown?: string;
}

// Template phrases that indicate low-quality content
const TEMPLATE_PHRASES: { pattern: RegExp; severity: Severity; reason: string }[] = [
  { pattern: /分析完了/, severity: "high", reason: "具体的な分析内容がない定型文" },
  { pattern: /データなし/, severity: "high", reason: "データ取得に失敗した可能性" },
  { pattern: /データが限られています/, severity: "high", reason: "分析が不完全" },
  { pattern: /DPT分析データを生成中/, severity: "high", reason: "生成処理が完了していない" },
  { pattern: /Analyticsタブで確認可能/, severity: "high", reason: "レポート内で完結していない" },
  { pattern: /追加調査を推奨/, severity: "medium", reason: "具体的な調査内容が不明" },
  { pattern: /継続モニタリング推奨/, severity: "medium", reason: "何をモニタリングすべきか不明" },
  { pattern: /が最も多く、.+が続きます/, severity: "medium", reason: "数値を並べただけで洞察がない" },
  { pattern: /可能性があります$/, severity: "low", reason: "曖昧な表現" },
  { pattern: /余地があります$/, severity: "low", reason: "曖昧な表現" },
];

// Abstract recommendation patterns
const ABSTRACT_PATTERNS: { pattern: RegExp; severity: Severity; reason: string }[] = [
  { pattern: /^.{1,10}訴求$/, severity: "medium", reason: "訴求方法が具体的でない（例: 減塩訴求）" },
  { pattern: /^.{1,10}強化$/, severity: "medium", reason: "強化施策が具体的でない（例: SNS強化）" },
  { pattern: /^.{1,10}拡大$/, severity: "medium", reason: "拡大方法が具体的でない（例: 認知度拡大）" },
  { pattern: /^.{1,10}向上$/, severity: "medium", reason: "向上施策が具体的でない" },
  { pattern: /^.{1,10}推進$/, severity: "medium", reason: "推進方法が具体的でない" },
];

// Minimum length for meaningful recommendations
const MIN_RECOMMENDATION_LENGTH = 15;

// Unknown rate threshold
const UNKNOWN_RATE_THRESHOLD = 50;

/**
 * Detect quality issues in a single text value
 */
function detectTextIssues(
  text: string,
  sectionTitle: string,
  field: QualityIssue["field"]
): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Check template phrases
  for (const { pattern, severity, reason } of TEMPLATE_PHRASES) {
    if (pattern.test(text)) {
      issues.push({
        sectionTitle,
        issueType: "template_phrase",
        severity,
        field,
        originalValue: text,
        reason,
      });
    }
  }

  // Check abstract patterns (only for recommendations)
  if (field === "recommendations") {
    for (const { pattern, severity, reason } of ABSTRACT_PATTERNS) {
      if (pattern.test(text)) {
        issues.push({
          sectionTitle,
          issueType: "too_abstract",
          severity,
          field,
          originalValue: text,
          reason,
        });
      }
    }

    // Check minimum length
    if (text.length < MIN_RECOMMENDATION_LENGTH) {
      issues.push({
        sectionTitle,
        issueType: "too_abstract",
        severity: "medium",
        field,
        originalValue: text,
        reason: `推奨事項が短すぎる（${text.length}文字 < ${MIN_RECOMMENDATION_LENGTH}文字）`,
      });
    }
  }

  return issues;
}

/**
 * Detect high unknown rate in dataTable
 */
function detectUnknownRateIssues(
  dataTable: Record<string, string | number>[],
  sectionTitle: string
): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Check for unknown rate in user profile or W's analysis
  if (sectionTitle.includes("ユーザー像") || sectionTitle.includes("W's")) {
    for (const row of dataTable) {
      const attribute = String(row["属性"] || row["パターン"] || "");
      const share = String(row["シェア"] || row["割合"] || "");

      if (attribute.toLowerCase().includes("unknown")) {
        const shareNum = parseInt(share.replace("%", ""), 10);
        if (!isNaN(shareNum) && shareNum > UNKNOWN_RATE_THRESHOLD) {
          issues.push({
            sectionTitle,
            issueType: "high_unknown",
            severity: "high",
            field: "dataTable",
            originalValue: `${attribute}: ${share}`,
            reason: `unknown率が${shareNum}%で閾値${UNKNOWN_RATE_THRESHOLD}%を超過`,
          });
        }
      }
    }
  }

  return issues;
}

/**
 * Detect issues in a report section
 */
function detectSectionIssues(section: ReportSection): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Check findings
  if (section.findings) {
    for (const finding of section.findings) {
      issues.push(...detectTextIssues(finding, section.title, "findings"));
    }
  }

  // Check insights
  if (section.insights) {
    for (const insight of section.insights) {
      issues.push(...detectTextIssues(insight, section.title, "insights"));
    }
  }

  // Check recommendations
  if (section.recommendations) {
    for (const rec of section.recommendations) {
      issues.push(...detectTextIssues(rec, section.title, "recommendations"));
    }
  }

  // Check dataTable for unknown rate
  if (section.dataTable) {
    issues.push(...detectUnknownRateIssues(section.dataTable, section.title));
  }

  // Check for missing data
  if (!section.findings || section.findings.length === 0) {
    issues.push({
      sectionTitle: section.title,
      issueType: "missing_data",
      severity: "high",
      field: "findings",
      originalValue: "",
      reason: "発見事項がない",
    });
  }

  return issues;
}

/**
 * Detect issues in strategy section
 */
function detectStrategyIssues(strategy: ReportStrategy): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const sectionTitle = "戦略サマリー";

  // Check keyInsight
  if (strategy.keyInsight) {
    issues.push(...detectTextIssues(strategy.keyInsight, sectionTitle, "strategy"));
  }

  // Check findings
  if (strategy.findings) {
    for (const finding of strategy.findings) {
      issues.push(...detectTextIssues(finding, sectionTitle, "findings"));
    }
  }

  // Check recommendations
  if (strategy.recommendations) {
    for (const rec of strategy.recommendations) {
      issues.push(...detectTextIssues(rec, sectionTitle, "recommendations"));
    }
  }

  // Check for generic recommendations without 5W1H
  if (strategy.actionPlan) {
    for (const action of strategy.actionPlan) {
      // Check if action contains specific elements (KPI, timeline, etc.)
      const hasKPI = /KPI|目標|達成/i.test(action);
      const hasTimeline = /フェーズ|ヶ月|週間|即座|継続/i.test(action);
      const hasWho = /ターゲット|層|ユーザー|顧客/i.test(action);

      if (!hasKPI && !hasTimeline && !hasWho && action.length < 50) {
        issues.push({
          sectionTitle,
          issueType: "generic_recommendation",
          severity: "low",
          field: "strategy",
          originalValue: action,
          reason: "5W1H（誰が、何を、いつ）が不明確",
        });
      }
    }
  }

  return issues;
}

/**
 * Detect all quality issues in a brand report
 */
export function detectQualityIssues(report: BrandReport): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Check all sections
  for (const section of report.sections) {
    issues.push(...detectSectionIssues(section));
  }

  // Check strategy
  if (report.strategy) {
    issues.push(...detectStrategyIssues(report.strategy));
  }

  return issues;
}

/**
 * Get summary of quality issues
 */
export function getQualityIssueSummary(issues: QualityIssue[]): {
  total: number;
  bySeverity: Record<Severity, number>;
  byType: Record<IssueType, number>;
  bySection: Record<string, number>;
} {
  const bySeverity: Record<Severity, number> = { high: 0, medium: 0, low: 0 };
  const byType: Record<IssueType, number> = {
    template_phrase: 0,
    too_abstract: 0,
    high_unknown: 0,
    missing_data: 0,
    generic_recommendation: 0,
  };
  const bySection: Record<string, number> = {};

  for (const issue of issues) {
    bySeverity[issue.severity]++;
    byType[issue.issueType]++;
    bySection[issue.sectionTitle] = (bySection[issue.sectionTitle] || 0) + 1;
  }

  return {
    total: issues.length,
    bySeverity,
    byType,
    bySection,
  };
}

/**
 * Filter issues by severity
 */
export function filterIssuesBySeverity(
  issues: QualityIssue[],
  minSeverity: Severity
): QualityIssue[] {
  const severityOrder: Record<Severity, number> = { high: 3, medium: 2, low: 1 };
  const minLevel = severityOrder[minSeverity];
  return issues.filter((issue) => severityOrder[issue.severity] >= minLevel);
}

/**
 * Group issues by section
 */
export function groupIssuesBySection(
  issues: QualityIssue[]
): Map<string, QualityIssue[]> {
  const grouped = new Map<string, QualityIssue[]>();

  for (const issue of issues) {
    const existing = grouped.get(issue.sectionTitle) || [];
    existing.push(issue);
    grouped.set(issue.sectionTitle, existing);
  }

  return grouped;
}
