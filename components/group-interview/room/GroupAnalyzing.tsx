"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, RefreshCw } from "lucide-react";
import { getMyGroupInterviewAnswers } from "@/lib/groupInterviewApi";
import type { GroupInterviewMyAnswer } from "@/types/groupInterview";

const POLLING_INTERVAL_MS = 2500;

interface GroupAnalyzingProps {
  roomId: string;
  onDone: () => void;
}

export default function GroupAnalyzing({ roomId, onDone }: GroupAnalyzingProps) {
  const [answers, setAnswers] = useState<GroupInterviewMyAnswer[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadStatuses = useCallback(async () => {
    try {
      const nextAnswers = await getMyGroupInterviewAnswers(roomId);
      setAnswers(nextAnswers);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "분석 상태를 확인하지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  const isTerminal = answers.length > 0
    && answers.every((answer) => answer.analysisStatus === "DONE" || answer.analysisStatus === "FAILED");
  const doneCount = answers.filter((answer) => answer.analysisStatus === "DONE").length;
  const failedCount = answers.filter((answer) => answer.analysisStatus === "FAILED").length;

  useEffect(() => {
    if (isTerminal) return;
    const initialTimer = window.setTimeout(() => void loadStatuses(), 0);
    const timer = window.setInterval(() => void loadStatuses(), POLLING_INTERVAL_MS);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [isTerminal, loadStatuses]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg p-8 transition-colors duration-300 dark:bg-[#0f1729]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-50 dark:opacity-30">
        <div className="absolute -left-20 -top-40 h-[650px] w-[650px] rounded-full bg-[#E7F1A8]/40 blur-[130px]" />
        <div className="absolute -right-20 top-10 h-[750px] w-[750px] rounded-full bg-[#95B1EE]/50 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border-4 border-black/[0.04] dark:border-white/[0.06]">
          {isTerminal ? (
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          ) : (
            <LoaderCircle className="h-12 w-12 animate-spin text-navy dark:text-white" />
          )}
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-navy dark:text-white">
          {isTerminal ? "그룹 면접 분석이 종료되었습니다" : "그룹 면접을 분석하고 있습니다"}
        </h2>
        <p className="mt-2 text-sm font-medium text-muted">
          {isTerminal
            ? `분석 완료 ${doneCount}개${failedCount > 0 ? ` · 실패 ${failedCount}개` : ""}`
            : isLoading
              ? "답변별 분석 상태를 확인하고 있습니다."
              : `분석 완료 ${doneCount}/${answers.length} · 완료되는 대로 결과를 확인할 수 있습니다.`}
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-600">
            <p>{error}</p>
            <button type="button" onClick={() => void loadStatuses()} className="mx-auto mt-3 flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs shadow-sm">
              <RefreshCw className="h-3.5 w-3.5" /> 다시 확인
            </button>
          </div>
        )}

        {isTerminal && (
          <button onClick={onDone} className="mx-auto mt-8 flex items-center gap-2 rounded-full bg-navy px-10 py-4 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105">
            대시보드에서 결과 확인하기
          </button>
        )}
      </div>
    </main>
  );
}
