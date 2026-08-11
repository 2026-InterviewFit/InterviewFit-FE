"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Lightbulb } from "lucide-react";

const ANALYZE_STEPS = [
  "발언 슬라이스 취합",
  "음성 및 발화 분석",
  "시선·자세 분석",
  "답변 내용 분석",
  "종합 리포트 생성",
];

const LOADING_TIPS = [
  { category: "💡 면접 꿀팁", text: "그룹 면접에서는 내 차례가 아닐 때의 경청 태도도 평가 요소가 됩니다." },
  { category: "🗣️ 답변 노하우", text: "앞 지원자와 답변이 겹칠 땐 '덧붙이자면' 으로 시작해 차별점을 만드세요." },
  { category: "👀 시선 처리", text: "카메라 렌즈를 가끔 응시하면 면접관과 눈을 맞추는 효과를 줄 수 있어요." },
];

interface GroupAnalyzingProps {
  onDone: () => void;
}

export default function GroupAnalyzing({ onDone }: GroupAnalyzingProps) {
  const [progress, setProgress] = useState(4);
  const [done, setDone] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + Math.floor(Math.random() * 6) + 3, 100);
        if (next >= 100) {
          clearInterval(t);
          setDone(true);
        }
        return next;
      });
    }, 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const tipTimer = setInterval(() => setTipIdx((i) => (i + 1) % LOADING_TIPS.length), 5000);
    return () => clearInterval(tipTimer);
  }, []);

  const activeStep = Math.min(
    Math.floor((progress / 100) * ANALYZE_STEPS.length),
    ANALYZE_STEPS.length - 1
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg p-8 transition-colors duration-300 dark:bg-[#0f1729]">
      {/* 밝은 블롭 배경 (랜딩/대기실과 동일 톤) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-50 dark:opacity-30">
        <div className="absolute -top-40 -left-20 h-[650px] w-[650px] rounded-full bg-[#E7F1A8]/40 blur-[130px]" />
        <div className="absolute top-10 -right-20 h-[750px] w-[750px] rounded-full bg-[#95B1EE]/50 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* 진행 원 */}
        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-black/[0.04] dark:border-white/[0.06]" />
          {!done ? (
            <>
              <div className="absolute inset-0 animate-[spin_2s_linear_infinite] rounded-full border-4 border-transparent border-t-navy" />
              <span className="font-serif text-xl font-bold text-navy dark:text-white">{progress}%</span>
            </>
          ) : (
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          )}
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-navy dark:text-white">
          {done ? "그룹 면접 분석 완료!" : "그룹 면접을 분석하고 있습니다"}
        </h2>
        <p className="mt-2 text-sm font-medium text-muted">
          {done
            ? "결과가 대시보드에 저장되었습니다."
            : "각 지원자의 발언과 비언어적 요소를 분석하고 있어요."}
        </p>

        {!done ? (
          <>
            {/* 단계 체크리스트 */}
            <div className="mt-8 flex flex-col gap-2.5 rounded-[24px] border border-line bg-surface p-6 text-left shadow-sm dark:bg-[#1e293b] dark:border-white/10">
              {ANALYZE_STEPS.map((step, i) => {
                const stepDone = i < activeStep;
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
                        stepDone
                          ? "bg-navy text-white"
                          : current
                          ? "bg-brand-soft/25 text-navy"
                          : "bg-chip text-muted"
                      }`}
                    >
                      {stepDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : current ? (
                        <span className="inline-block h-3.5 w-3.5 animate-[spin_1s_linear_infinite] rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-sm font-bold ${stepDone || current ? "text-ink" : "text-muted"}`}>
                      {step}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* 로딩 팁 */}
            <div className="mt-6 flex min-h-[110px] flex-col items-center justify-center rounded-[24px] border border-line bg-surface/70 p-6 shadow-sm backdrop-blur-md dark:bg-[#1e293b]/70 dark:border-white/10">
              <div className="mb-3 flex items-center gap-1.5 text-navy dark:text-brand-soft opacity-80">
                <Lightbulb className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest">Take a break</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={tipIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="rounded-full bg-brand-soft/20 px-3 py-1 text-xs font-bold text-navy">
                    {LOADING_TIPS[tipIdx].category}
                  </span>
                  <p className="max-w-sm break-keep text-sm font-semibold leading-relaxed text-ink dark:text-gray-200">
                    {LOADING_TIPS[tipIdx].text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        ) : (
          <button
            onClick={onDone}
            className="mx-auto mt-8 flex items-center gap-2 rounded-full bg-navy px-10 py-4 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            대시보드에서 결과 확인하기
          </button>
        )}
      </div>
    </main>
  );
}