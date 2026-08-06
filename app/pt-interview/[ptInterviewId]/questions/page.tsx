"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Mic, ChevronRight, Play } from "lucide-react"; // 💡 Play 아이콘 추가
import { useDeviceTest } from "@/hooks/useDeviceTest";
import { usePtInterviewStore } from "@/store/usePtInterviewStore";
import { questionTypeMeta, formatSeconds } from "@/lib/ptInterviewData";
import { PALETTE } from "@/lib/communityData";

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-[spin_1s_linear_infinite] rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

export default function PtQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const ptInterviewId = params.ptInterviewId as string;

  const {
    questions,
    currentQuestionIdx,
    setCurrentQuestionIdx,
    loadQuestions,
  } = usePtInterviewStore();

  const { videoRef } = useDeviceTest();

  // 💡 자동 시작을 막고, 버튼을 눌러야 시작되도록 변경
  const [isRecordingStarted, setIsRecordingStarted] = useState(false); 
  const [answerTime, setAnswerTime] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadQuestions();
    // 초기화 시 자동 녹화를 시작하지 않음
  }, []);

  // 💡 답변 경과 시간 측정 (시작버튼 누른 이후부터 멈추지 않고 쭉 측정)
  useEffect(() => {
    if (!isRecordingStarted) return;
    const t = setInterval(() => setAnswerTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isRecordingStarted]);

  const q = questions[currentQuestionIdx];
  const isLast = currentQuestionIdx === questions.length - 1;

  const handleStartRecording = () => {
    setIsRecordingStarted(true);
  };

  const handleNext = () => {
    if (isLast) {
      router.push(`/pt-interview/${ptInterviewId}/analyzing`);
      return;
    }

    // 💡 녹화를 중단하지 않고 쭉 이어가기 위해 setAnswering(false) 및 시간 초기화 코드 제거
    setAnalyzing(true);
    setTimeout(() => {
      setCurrentQuestionIdx((p) => p + 1);
      setAnalyzing(false);
    }, 1400);
  };

  if (!q) return null;
  const typeMeta = questionTypeMeta(q.type);

  return (
    <main className="relative flex min-h-screen flex-col bg-bg transition-colors duration-300 dark:bg-[#0f1729]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-[#95B1EE]/40 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pb-20 pt-16">
        {/* 질문 번호 */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-bold text-muted">
            질문 <span className="text-navy">{currentQuestionIdx + 1}</span> / {questions.length}
          </span>
          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold"
            style={{ backgroundColor: typeMeta.bg, color: typeMeta.fg }}
          >
            {typeMeta.label}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* AI 면접관 + 질문 */}
          <div className="lg:col-span-7">
            <div className="rounded-[24px] border border-line bg-surface p-8 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: PALETTE.navy, color: PALETTE.lime }}
                >
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">AI 면접관</p>
                  <p className="text-xs font-medium text-muted">발표 내용 기반 질문</p>
                </div>
              </div>

              {analyzing ? (
                <div className="flex flex-col items-center gap-3 py-10">
                  <Spinner className="h-7 w-7 text-navy" />
                  <p className="text-sm font-bold text-muted">
                    답변을 분석하여 꼬리 질문을 준비하고 있어요...
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.p
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg font-bold leading-relaxed text-ink"
                  >
                    {q.text}
                  </motion.p>
                </AnimatePresence>
              )}
            </div>

            {/* 관련 슬라이드 */}
            {q.relatedSlide && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
                <div
                  className="flex aspect-video w-24 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${PALETTE.navy} 0%, ${PALETTE.sky} 100%)`,
                  }}
                >
                  <span className="text-2xl font-bold text-white/40">{q.relatedSlide}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-muted">
                    관련 슬라이드 {q.relatedSlide}
                  </p>
                  <p className="truncate text-sm font-semibold text-ink">
                    {q.relatedSlideSummary}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 답변 녹화 및 조작 */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm">
              <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-xl bg-[#0f1729]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full -scale-x-100 object-cover"
                />
                {/* 💡 시작 버튼을 눌렀을 때만 녹화 뱃지 표시 */}
                {isRecordingStarted && (
                  <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-red-500/80 px-2 py-0.5 text-[10px] font-bold text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> REC {formatSeconds(answerTime)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span className="flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5" /> 마이크 활성
                </span>
                <span>총 누적 답변 시간 {formatSeconds(answerTime)}</span>
              </div>
            </div>

            {/* 💡 시작 버튼과 진행 버튼 분리 */}
            {!isRecordingStarted ? (
              <button
                onClick={handleStartRecording}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-red-600 hover:-translate-y-0.5"
              >
                <Play className="h-4 w-4 fill-current" /> 녹화 시작 (답변 시작)
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={analyzing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-navy-dark hover:-translate-y-0.5 disabled:opacity-40"
              >
                {isLast ? "최종 답변 완료" : "답변 완료 및 다음 질문"} <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}