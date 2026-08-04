// app/pt-interview/[ptInterviewId]/analyzing/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, AlertCircle, RefreshCcw } from "lucide-react";

// lucide-react 구버전 호환 스피너
function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-[spin_1s_linear_infinite] rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

const ANALYZE_STEPS = [
  "발표 영상 업로드",
  "음성 분석",
  "발표 내용 분석",
  "시선 및 자세 분석",
  "질의응답 분석",
  "종합 리포트 생성",
];

export default function PtAnalyzingPage() {
  const router = useRouter();
  const params = useParams();
  const ptInterviewId = params.ptInterviewId as string;

  const [progress, setProgress] = useState(4);
  const [failed] = useState(false); // 실패 UI 확인용으로 true 토글 가능

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + Math.floor(Math.random() * 6) + 2, 100);
        if (next >= 100) {
          clearInterval(t);
          setTimeout(() => router.push(`/pt-interview/${ptInterviewId}/result`), 600);
        }
        return next;
      });
    }, 600);
    return () => clearInterval(t);
  }, [ptInterviewId, router]);

  const activeStep = Math.min(
    Math.floor((progress / 100) * ANALYZE_STEPS.length),
    ANALYZE_STEPS.length - 1
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg p-8 transition-colors duration-300 dark:bg-[#0f1729]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-50">
        <div className="absolute -top-40 -left-20 h-[650px] w-[650px] rounded-full bg-[#E7F1A8]/40 blur-[130px]" />
        <div className="absolute top-10 -right-20 h-[750px] w-[750px] rounded-full bg-[#95B1EE]/50 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* 진행 원 */}
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
          {failed ? "분석에 실패했어요" : "발표 역량을 분석하고 있습니다"}
        </h2>
        <p className="mt-2 text-sm font-medium text-muted">
          {failed
            ? "네트워크 오류로 분석을 완료하지 못했습니다."
            : "발표와 질의응답 내용을 분석 중입니다. 완료되면 종합 리포트로 이동합니다."}
        </p>

        {/* 단계 체크리스트 */}
        {!failed ? (
          <div className="mt-8 flex flex-col gap-2.5 rounded-[24px] border border-line bg-surface p-6 text-left shadow-sm">
            {ANALYZE_STEPS.map((step, i) => {
              const done = i < activeStep;
              const current = i === activeStep;
              return (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
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
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : current ? (
                      <Spinner className="h-3.5 w-3.5" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      done || current ? "text-ink" : "text-muted"
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
            onClick={() => setProgress(4)}
            className="mx-auto mt-8 flex items-center gap-2 rounded-full bg-navy px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            <RefreshCcw className="h-4 w-4" /> 다시 분석하기
          </button>
        )}
      </div>
    </main>
  );
}