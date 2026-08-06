// app/pt-interview/[ptInterviewId]/analyzing/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

import { generatePtReport } from "@/lib/api";

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-[spin_1s_linear_infinite] rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

const ANALYZE_STEPS = [
  "답변 영상 확인",
  "음성 분석 결과 수집",
  "발표 내용 분석",
  "시선 및 자세 분석",
  "질의응답 분석",
  "종합 리포트 생성",
];

export default function PtAnalyzingPage() {
  const router = useRouter();
  const params = useParams();

  const rawPtInterviewId = params.ptInterviewId;
  const ptInterviewId = Number(
    Array.isArray(rawPtInterviewId)
      ? rawPtInterviewId[0]
      : rawPtInterviewId
  );

  const [progress, setProgress] = useState(5);
  const [failed, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const isValidId =
    Number.isInteger(ptInterviewId) && ptInterviewId > 0;

  const generateReport = useCallback(async () => {
    if (!isValidId || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setFailed(false);
    setErrorMessage(null);
    setProgress(8);

    const progressTimer = setInterval(() => {
      setProgress((current) => {
        if (current >= 92) {
          return current;
        }

        return Math.min(
          current + Math.floor(Math.random() * 5) + 2,
          92
        );
      });
    }, 700);

    try {
      await generatePtReport(ptInterviewId);

      clearInterval(progressTimer);
      setProgress(100);

      setTimeout(() => {
        router.replace(
          `/pt-interview/${ptInterviewId}/result`
        );
      }, 500);
    } catch (error) {
      clearInterval(progressTimer);

      setFailed(true);
      setProgress(0);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "PT 종합 리포트 생성에 실패했습니다."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [
    isGenerating,
    isValidId,
    ptInterviewId,
    router,
  ]);

  useEffect(() => {
    if (!isValidId) {
      setFailed(true);
      setErrorMessage("잘못된 PT 면접 ID입니다.");
      return;
    }

    void generateReport();
  }, [generateReport, isValidId]);

  const activeStep =
    progress >= 100
      ? ANALYZE_STEPS.length
      : Math.min(
          Math.floor(
            (progress / 100) * ANALYZE_STEPS.length
          ),
          ANALYZE_STEPS.length - 1
        );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg p-8 transition-colors duration-300 dark:bg-[#0f1729]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-50">
        <div className="absolute -left-20 -top-40 h-[650px] w-[650px] rounded-full bg-[#E7F1A8]/40 blur-[130px]" />
        <div className="absolute -right-20 top-10 h-[750px] w-[750px] rounded-full bg-[#95B1EE]/50 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-black/[0.04]" />

          {!failed ? (
            <>
              <div className="absolute inset-0 animate-[spin_2s_linear_infinite] rounded-full border-4 border-transparent border-t-navy" />

              <span className="font-serif text-xl font-bold text-navy dark:text-white">
                {progress}%
              </span>
            </>
          ) : (
            <AlertCircle className="h-12 w-12 text-red-500" />
          )}
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-navy dark:text-white">
          {failed
            ? "분석에 실패했습니다"
            : "발표 역량을 분석하고 있습니다"}
        </h2>

        <p className="mt-2 text-sm font-medium text-muted">
          {failed
            ? errorMessage ??
              "분석을 완료하지 못했습니다."
            : "발표와 질의응답 분석 결과를 수집해 종합 리포트를 생성합니다."}
        </p>

        {!failed ? (
          <div className="mt-8 flex flex-col gap-2.5 rounded-[24px] border border-line bg-surface p-6 text-left shadow-sm">
            {ANALYZE_STEPS.map((step, index) => {
              const done = index < activeStep;
              const current =
                index === activeStep &&
                progress < 100;

              return (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? "bg-navy text-white"
                        : current
                          ? "bg-brand-soft/25 text-navy"
                          : "bg-chip text-muted"
                    }`}
                  >
                    {done ? (
                      <Check
                        className="h-3.5 w-3.5"
                        strokeWidth={3}
                      />
                    ) : current ? (
                      <Spinner className="h-3.5 w-3.5" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <span
                    className={`text-sm font-bold ${
                      done || current
                        ? "text-ink"
                        : "text-muted"
                    }`}
                  >
                    {step}
                  </span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => void generateReport()}
            disabled={isGenerating || !isValidId}
            className="mx-auto mt-8 flex items-center gap-2 rounded-full bg-navy px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <RefreshCcw className="h-4 w-4" />
            다시 분석하기
          </button>
        )}
      </div>
    </main>
  );
}