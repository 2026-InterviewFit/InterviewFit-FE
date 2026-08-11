// components/pt-interview/document/AnalysisStepper.tsx
"use client";

import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import type { DocumentAnalysisStatus } from "@/types/ptInterview";
import { DOC_STEPS } from "@/lib/ptInterviewData";

// lucide-react 구버전 호환: Loader2 대신 CSS 스피너 (기존 AnalysisProgress.tsx 방식)
function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-[spin_1s_linear_infinite] rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

interface AnalysisStepperProps {
  status: DocumentAnalysisStatus;
  progress: number;
}

export default function AnalysisStepper({ status, progress }: AnalysisStepperProps) {
  const activeIdx = DOC_STEPS.findIndex((s) => s.key === status);
  const isDone = status === "DONE";
  const isFailed = status === "FAILED";

  return (
    <div className="rounded-[24px] border border-line bg-surface p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        {isFailed ? (
          <AlertCircle className="h-5 w-5 text-red-500" />
        ) : isDone ? (
          <Check className="h-5 w-5 text-navy" />
        ) : (
          <Spinner className="h-5 w-5 text-navy" />
        )}
        <div>
          <h2 className="text-lg font-bold text-ink">
            {isFailed
              ? "분석에 실패했어요"
              : isDone
              ? "분석이 완료되었습니다"
              : "발표 자료를 분석하고 있습니다"}
          </h2>
          <p className="mt-0.5 text-xs font-medium text-muted">
            {isDone
              ? "슬라이드별 내용을 확인하고 발표를 준비하세요."
              : "AI가 텍스트를 추출하고 슬라이드 흐름을 파악하는 중입니다."}
          </p>
        </div>
      </div>

      {/* 진행 바 */}
      {!isFailed && (
        <div className="mb-8">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
            <span className="text-muted">진행률</span>
            <span className="text-navy">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-chip">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: isDone ? "#364C84" : "#95B1EE" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* 단계 표시 */}
      <div className="grid grid-cols-4 gap-2">
        {DOC_STEPS.map((step, i) => {
          const reached = isDone ? true : i <= activeIdx;
          const current = !isDone && i === activeIdx;
          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  reached ? "bg-navy text-white" : "bg-chip text-muted"
                }`}
              >
                {reached && !current ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : current ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-center text-[11px] font-bold ${
                  reached ? "text-ink" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}