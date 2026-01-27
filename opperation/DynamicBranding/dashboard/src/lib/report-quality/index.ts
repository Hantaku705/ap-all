/**
 * Report Quality Module
 *
 * Exports all quality detection, UGC fetching, and regeneration functions.
 */

// Detector exports
export {
  detectQualityIssues,
  getQualityIssueSummary,
  filterIssuesBySeverity,
  groupIssuesBySection,
} from "./detector";

export type {
  QualityIssue,
  IssueType,
  Severity,
  ReportSection,
  ReportStrategy,
  BrandReport,
} from "./detector";

// UGC Fetcher exports
export {
  fetchUGCForSection,
  fetchUGCForStrategy,
  fetchUGCAggregation,
  fetchUGCAggregationFallback,
  fetchStratifiedSample,
  formatUGCForPrompt,
  formatAggregationForPrompt,
  getSectionType,
} from "./ugc-fetcher";

export type { UGCEvidence, SectionType, UGCAggregation } from "./ugc-fetcher";

// Regenerator exports
export {
  regenerateSection,
  regenerateStrategy,
  isLLMAvailable,
  getAvailableLLMProvider,
} from "./regenerator";

export type { RegeneratedSection, RegeneratedStrategy } from "./regenerator";
