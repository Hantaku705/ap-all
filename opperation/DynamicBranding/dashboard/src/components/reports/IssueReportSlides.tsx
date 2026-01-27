"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Lightbulb, RefreshCw, Download } from "lucide-react";
import { QuestionSlide } from "./QuestionSlide";
import type { IssueReport } from "@/types/data.types";

interface IssueReportSlidesProps {
  report: IssueReport;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function IssueReportSlides({ report, onRefresh, isRefreshing }: IssueReportSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Total slides = sections + 1 (summary slide at the end)
  const totalSlides = report.sections.length + 1;
  const isLastSlide = currentSlide === totalSlides - 1;
  const isSummarySlide = isLastSlide;

  const goToPrev = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
  };

  const handleExport = () => {
    if (!report.markdown) return;
    const blob = new Blob([report.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.issueId}-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <p className="text-sm text-muted-foreground">
            生成: {new Date(report.generatedAt).toLocaleString("ja-JP")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              更新
            </button>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Slide Area */}
      <div className="flex-1 flex flex-col">
        {/* Slide Content */}
        <div className="flex-1 flex items-center justify-center py-4">
          {isSummarySlide ? (
            <SummarySlide report={report} slideNumber={totalSlides} totalSlides={totalSlides} />
          ) : (
            <QuestionSlide
              section={report.sections[currentSlide]}
              slideNumber={currentSlide + 1}
              totalSlides={totalSlides}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            onClick={goToPrev}
            disabled={currentSlide === 0}
            className="p-2 rounded-full border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  idx === currentSlide
                    ? "bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            disabled={currentSlide === totalSlides - 1}
            className="p-2 rounded-full border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-xs text-muted-foreground pb-2">
          ← → キーでスライド移動
        </p>
      </div>
    </div>
  );
}

// Summary Slide Component
function SummarySlide({
  report,
  slideNumber,
  totalSlides,
}: {
  report: IssueReport;
  slideNumber: number;
  totalSlides: number;
}) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Slide Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-muted-foreground">
          戦略示唆
        </h2>
        <span className="text-sm text-muted-foreground">
          {slideNumber} / {totalSlides}
        </span>
      </div>

      <Card className="border-2">
        <CardContent className="p-8 space-y-8">
          {/* Key Insight */}
          <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 text-amber-600 mb-3">
              <Lightbulb className="h-5 w-5" />
              <span className="text-sm font-medium">Key Insight</span>
            </div>
            <p className="text-xl font-bold text-amber-900">
              {report.strategy.keyInsight}
            </p>
          </div>

          {/* Two Column: Findings & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Findings */}
            <div className="space-y-3">
              <h3 className="font-semibold text-green-700 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-sm">
                  ✓
                </span>
                主な発見
              </h3>
              <div className="space-y-2">
                {report.strategy.findings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-green-50 rounded-lg text-sm border border-green-100"
                  >
                    {finding}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-700 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm">
                  →
                </span>
                提言
              </h3>
              <div className="space-y-2">
                {report.strategy.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-blue-50 rounded-lg text-sm border border-blue-100"
                  >
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
