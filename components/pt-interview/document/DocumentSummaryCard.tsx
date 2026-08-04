// components/pt-interview/document/DocumentSummaryCard.tsx
"use client";

import { Target, Hash, GitBranch, HelpCircle } from "lucide-react";
import type { DocumentSummary } from "@/types/ptInterview";
import { PALETTE } from "@/lib/communityData";

interface DocumentSummaryCardProps {
  summary: DocumentSummary;
}

export default function DocumentSummaryCard({ summary }: DocumentSummaryCardProps) {
  return (
    <div className="rounded-[24px] border border-line bg-surface p-8 shadow-sm">
      <h3 className="mb-6 flex items-center gap-2 text-base font-bold text-ink">
        <Target className="h-5 w-5" style={{ color: PALETTE.navy }} /> 전체 발표 자료 요약
      </h3>

      <div className="space-y-6">
        {/* 핵심 주제 */}
        <div>
          <p className="mb-1.5 text-xs font-bold text-muted">핵심 주제</p>
          <p className="text-sm font-semibold leading-relaxed text-ink">
            {summary.coreTopic}
          </p>
        </div>

        {/* 주요 키워드 */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-muted">
            <Hash className="h-3.5 w-3.5" /> 주요 키워드
          </p>
          <div className="flex flex-wrap gap-2">
            {summary.keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-lg px-2.5 py-1 text-[11px] font-bold"
                style={{ backgroundColor: "rgba(149,177,238,0.18)", color: PALETTE.navy }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* 발표 흐름 */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-muted">
            <GitBranch className="h-3.5 w-3.5" /> 발표 흐름
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {summary.flow.map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <span className="rounded-lg bg-chip px-2.5 py-1 text-[11px] font-bold text-ink">
                  {step}
                </span>
                {i < summary.flow.length - 1 && (
                  <span className="text-muted">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 예상 질문 영역 */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-muted">
            <HelpCircle className="h-3.5 w-3.5" /> 예상 질문 영역
          </p>
          <ul className="space-y-1.5">
            {summary.expectedQuestionAreas.map((q) => (
              <li
                key={q}
                className="flex items-start gap-2 text-sm font-medium text-ink"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: PALETTE.lime }}
                />
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}