"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleDashed, FileVideo2, Lightbulb, LoaderCircle, RefreshCw, Sparkles, TriangleAlert, UsersRound } from "lucide-react";
import { getMyGroupInterviewAnswers } from "@/lib/groupInterviewApi";
import type { GroupInterviewMyAnswer } from "@/types/groupInterview";

const POLLING_INTERVAL_MS = 2500;
const PHASE_INTERVAL_MS = 3200;
const TIP_INTERVAL_MS = 6500;

const ANALYSIS_PHASES = [
  "답변 영상을 안전하게 확인하고 있어요",
  "음성과 발화 습관을 분석하고 있어요",
  "시선과 자세의 안정성을 확인하고 있어요",
  "답변 내용과 STAR 구조를 평가하고 있어요",
  "참가자 비교 결과를 준비하고 있어요",
] as const;

const GROUP_INTERVIEW_TIPS = [
  "다른 지원자의 답변을 들을 때 고개를 자연스럽게 끄덕이면 경청하는 인상을 줄 수 있어요.",
  "비슷한 답변이 먼저 나왔더라도 본인의 역할과 행동을 구체적으로 설명하면 충분히 차별화할 수 있어요.",
  "STAR 답변의 Result에는 수치나 변화처럼 확인할 수 있는 결과를 넣는 것이 좋아요.",
  "압박 질문에서는 빠른 정답보다 침착하게 판단 근거를 설명하는 태도가 더 중요해요.",
] as const;

interface GroupAnalyzingProps {
  roomId: string;
  onDone: () => void;
}

export default function GroupAnalyzing({ roomId, onDone }: GroupAnalyzingProps) {
  const [answers, setAnswers] = useState<GroupInterviewMyAnswer[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const loadStatuses = useCallback(async () => {
    try {
      setAnswers(await getMyGroupInterviewAnswers(roomId));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "분석 상태를 확인하지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  const doneCount = answers.filter((answer) => answer.analysisStatus === "DONE").length;
  const failedCount = answers.filter((answer) => answer.analysisStatus === "FAILED").length;
  const runningCount = answers.filter((answer) => answer.analysisStatus === "RUNNING").length;
  const uploadedCount = answers.filter((answer) => answer.analysisStatus === "UPLOADED").length;
  const waitingCount = answers.filter((answer) => answer.analysisStatus === "WAITING").length;
  const terminalCount = doneCount + failedCount;
  const isTerminal = answers.length > 0 && terminalCount === answers.length;
  const progressPercent = answers.length > 0 ? Math.round((terminalCount / answers.length) * 100) : 0;

  useEffect(() => {
    if (isTerminal) return;
    const initialTimer = window.setTimeout(() => void loadStatuses(), 0);
    const timer = window.setInterval(() => void loadStatuses(), POLLING_INTERVAL_MS);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [isTerminal, loadStatuses]);

  useEffect(() => {
    if (isTerminal) return;
    const phaseTimer = window.setInterval(() => setPhaseIndex((current) => (current + 1) % ANALYSIS_PHASES.length), PHASE_INTERVAL_MS);
    const tipTimer = window.setInterval(() => setTipIndex((current) => (current + 1) % GROUP_INTERVIEW_TIPS.length), TIP_INTERVAL_MS);
    return () => {
      window.clearInterval(phaseTimer);
      window.clearInterval(tipTimer);
    };
  }, [isTerminal]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg px-5 py-10 transition-colors duration-300 dark:bg-[#0f1729] md:p-8">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-60 dark:opacity-30">
        <div className="absolute -left-20 -top-40 h-[650px] w-[650px] rounded-full bg-[#E7F1A8]/45 blur-[130px]" />
        <div className="absolute -right-20 top-10 h-[750px] w-[750px] rounded-full bg-[#95B1EE]/55 blur-[150px]" />
        <div className="absolute -bottom-52 left-1/4 h-[580px] w-[580px] rounded-full bg-purple-200/30 blur-[140px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-black/[0.04] dark:border-white/[0.06]" />
          {!isTerminal && <div className="absolute inset-0 animate-[spin_2s_linear_infinite] rounded-full border-4 border-transparent border-t-navy dark:border-t-sky-300" />}
          {isTerminal ? <CheckCircle2 className="h-12 w-12 text-emerald-500" /> : isLoading ? <LoaderCircle className="h-10 w-10 animate-spin text-navy dark:text-white" /> : <span className="font-serif text-xl font-bold text-navy dark:text-white">{progressPercent}%</span>}
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-navy dark:text-white">
          {isTerminal ? "그룹 면접 분석이 완료되었습니다" : "AI가 그룹 면접을 분석하고 있습니다"}
        </h2>
        <p className="mt-2 text-sm font-medium text-muted">
          {isTerminal ? `분석 완료 ${doneCount}개${failedCount > 0 ? ` · 분석 미제공 ${failedCount}개` : ""}` : "답변별 분석 상태를 확인해 완료되는 즉시 결과를 보여드릴게요."}
        </p>

        {!isTerminal && (
          <div className="mt-7 w-full overflow-hidden rounded-[28px] border border-black/[0.04] bg-white/75 p-6 text-left shadow-sm backdrop-blur-md dark:border-white/[0.06] dark:bg-[#1e293b]/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"><Sparkles className="h-5 w-5" /></div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">Now analyzing</p>
                <AnimatePresence mode="wait">
                  <motion.p key={phaseIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="mt-1 text-sm font-bold text-navy dark:text-white">
                    {ANALYSIS_PHASES[phaseIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#95B1EE] to-[#364C84]" animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatusBox icon={<CircleDashed className="h-4 w-4" />} label="대기" value={waitingCount} tone="slate" />
              <StatusBox icon={<FileVideo2 className="h-4 w-4" />} label="업로드 완료" value={uploadedCount} tone="blue" />
              <StatusBox icon={<LoaderCircle className="h-4 w-4" />} label="분석 중" value={runningCount} tone="purple" />
              <StatusBox icon={<CheckCircle2 className="h-4 w-4" />} label="처리 완료" value={terminalCount} tone="emerald" />
            </div>
          </div>
        )}

        {!isTerminal && (
          <div className="mt-4 flex min-h-[138px] w-full flex-col items-center justify-center rounded-[28px] border border-black/[0.04] bg-white/65 p-6 shadow-sm backdrop-blur-md dark:border-white/[0.06] dark:bg-[#1e293b]/65">
            <div className="flex items-center gap-2 text-amber-500"><Lightbulb className="h-4 w-4" /><span className="text-[11px] font-bold uppercase tracking-[0.18em]">Interview tip</span></div>
            <AnimatePresence mode="wait">
              <motion.p key={tipIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45 }} className="mt-3 max-w-xl text-sm font-semibold leading-relaxed text-navy dark:text-slate-200">
                {GROUP_INTERVIEW_TIPS[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}

        {error && (
          <div className="mt-5 w-full rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            <p>{error}</p>
            <button type="button" onClick={() => void loadStatuses()} className="mx-auto mt-3 flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs shadow-sm dark:bg-slate-800"><RefreshCw className="h-3.5 w-3.5" /> 다시 확인</button>
          </div>
        )}

        {isTerminal && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-7 w-full rounded-[28px] border border-black/[0.04] bg-white/80 p-7 shadow-sm backdrop-blur-md dark:border-white/[0.06] dark:bg-[#1e293b]/80">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <CompletionBox icon={<FileVideo2 className="h-5 w-5" />} label="답변 처리" value={`${answers.length}개`} tone="blue" />
              <CompletionBox icon={<CheckCircle2 className="h-5 w-5" />} label="분석 완료" value={`${doneCount}개`} tone="emerald" />
              <CompletionBox icon={failedCount > 0 ? <TriangleAlert className="h-5 w-5" /> : <UsersRound className="h-5 w-5" />} label="분석 미제공" value={`${failedCount}개`} tone={failedCount > 0 ? "amber" : "slate"} />
            </div>
            <button onClick={onDone} className="mx-auto mt-6 flex items-center gap-2 rounded-full bg-navy px-10 py-4 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105">대시보드에서 결과 확인하기</button>
          </motion.div>
        )}
      </div>
    </main>
  );
}

const STATUS_TONES = {
  slate: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300",
} as const;

type StatusTone = keyof typeof STATUS_TONES;

function StatusBox({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: StatusTone }) {
  return <div className={`rounded-xl p-3 ${STATUS_TONES[tone]}`}><div className="flex items-center gap-1.5 text-[11px] font-bold">{icon}{label}</div><p className="mt-1.5 text-lg font-black">{value}</p></div>;
}

function CompletionBox({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: StatusTone }) {
  return <div className={`rounded-2xl p-5 ${STATUS_TONES[tone]}`}><div className="flex items-center justify-center gap-2 text-xs font-bold">{icon}{label}</div><p className="mt-2 text-xl font-black">{value}</p></div>;
}
