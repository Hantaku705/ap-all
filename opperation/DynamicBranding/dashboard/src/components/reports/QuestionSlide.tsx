"use client";

import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, MessageSquare, BarChart3 } from "lucide-react";
import type { IssueSection } from "@/types/data.types";

interface QuestionSlideProps {
  section: IssueSection;
  slideNumber: number;
  totalSlides: number;
}

export function QuestionSlide({ section, slideNumber, totalSlides }: QuestionSlideProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Slide Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-muted-foreground">
          {section.title}
        </h2>
        <span className="text-sm text-muted-foreground">
          {slideNumber} / {totalSlides}
        </span>
      </div>

      <Card className="border-2">
        <CardContent className="p-8 space-y-8">
          {/* Question */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <HelpCircle className="h-4 w-4" />
              <span>Question</span>
            </div>
            <p className="text-2xl font-bold leading-relaxed">
              {section.question}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Answer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <MessageSquare className="h-4 w-4" />
              <span>Answer</span>
            </div>
            <div className="space-y-2">
              {section.findings.map((finding, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-sm flex items-center justify-center font-medium">
                    {idx + 1}
                  </span>
                  <p className="text-base leading-relaxed">{finding}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence */}
          {section.dataTable && section.dataTable.length > 0 && (
            <>
              <div className="border-t" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                  <BarChart3 className="h-4 w-4" />
                  <span>Evidence</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        {Object.keys(section.dataTable[0]).map((header) => (
                          <th
                            key={header}
                            className="px-4 py-2 text-left text-sm font-semibold border"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.dataTable.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className={rowIdx % 2 === 0 ? "bg-white" : "bg-muted/30"}
                        >
                          {Object.values(row).map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              className="px-4 py-2 text-sm border"
                            >
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
