"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Award, Sparkles, TrendingUp, UserRound, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getGroupInterviewComparisons,
  getGroupInterviewQuestionComparisons,
  GroupInterviewApiError,
} from "@/lib/groupInterviewApi";
import { initializeAuth } from "@/lib/auth";
import { formatGroupComparisonScore, getGroupQuestionIndices } from "@/lib/groupInterviewDashboard";
import type { GroupInterviewComparison } from "@/types/groupInterview";

type ComparisonSelection = "OVERALL" | number;

const SCORE_FIELDS: {
  label: string;
  key: "contentScore" | "speechScore" | "gazeScore" | "poseScore" | "blinkScore";
}[] = [
  { label: "답변 내용", key: "contentScore" },
  { label: "전달력", key: "speechScore" },
  { label: "시선", key: "gazeScore" },
  { label: "자세", key: "poseScore" },
  { label: "눈 깜빡임", key: "blinkScore" },
];

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  const width = score === null ? 0 : Math.min(100, Math.max(0, score));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-bold">
        <span className="text-muted">{label}</span>
        <span className={score === null ? "text-muted" : "text-navy dark:text-white"}>
          {formatGroupComparisonScore(score)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        {score !== null && (
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#95B1EE] to-[#364C84] transition-[width] duration-300"
            style={{ width: `${width}%` }}
          />
        )}
      </div>
    </div>
  );
}

function CoachingSection({ comparison }: { comparison: GroupInterviewComparison }) {
  const hasFeedback = comparison.strengthSummary !== null || comparison.improvementSummary !== null;
  if (!hasFeedback) {
    return (
      <div className="rounded-2xl bg-slate-50 p-4 text-sm font-medium text-muted dark:bg-slate-800/70">
        AI 비교 피드백을 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <Sparkles className="h-4 w-4" /> 상대적 강점
        </div>
        <p className="text-sm leading-relaxed text-ink dark:text-slate-200">
          {comparison.strengthSummary ?? "AI 비교 피드백을 불러오지 못했습니다."}
        </p>
      </div>
      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
          <TrendingUp className="h-4 w-4" /> 개선할 점
        </div>
        <p className="text-sm leading-relaxed text-ink dark:text-slate-200">
          {comparison.improvementSummary ?? "AI 비교 피드백을 불러오지 못했습니다."}
        </p>
      </div>
    </div>
  );
}

function ComparisonCard({
  comparison,
  isMe,
  showCoaching,
}: {
  comparison: GroupInterviewComparison;
  isMe: boolean;
  showCoaching: boolean;
}) {
  const showRank = comparison.status === "DONE" && comparison.rank !== null;
  const participantLabel = comparison.participantName ?? `참가자 #${comparison.participantUserId}`;
  return (
    <article className={`rounded-[24px] border bg-white p-6 shadow-sm dark:bg-[#1e293b] ${
      isMe ? "border-navy ring-2 ring-navy/10" : "border-line dark:border-white/10"
    }`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="flex items-center gap-2 text-base font-bold text-ink dark:text-white">
              <UserRound className="h-5 w-5 text-navy dark:text-sky-300" />
              {participantLabel}
            </h3>
            {isMe && <span className="rounded-full bg-navy px-2.5 py-1 text-[10px] font-bold text-white">나</span>}
            {comparison.status === "PARTIAL" && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">일부 분석</span>
            )}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-muted">
            <Users className="h-3.5 w-3.5" />
            {showRank ? `${comparison.rank}위 / ${comparison.participantCount}명` : "순위 없음"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-muted">종합 점수</p>
          <p className="mt-1 text-2xl font-black text-navy dark:text-white">{formatGroupComparisonScore(comparison.totalScore)}</p>
        </div>
      </div>

      <div className="my-5 h-px bg-line dark:bg-white/10" />
      <div className="grid gap-4 md:grid-cols-2">
        {SCORE_FIELDS.map((field) => (
          <ScoreBar key={field.key} label={field.label} score={comparison[field.key]} />
        ))}
      </div>

      {showCoaching && (
        <div className="mt-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink dark:text-white">
            <Award className="h-4 w-4 text-indigo-500" /> AI 상대 비교 코칭
          </h4>
          <CoachingSection comparison={comparison} />
        </div>
      )}
    </article>
  );
}

export default function GroupComparisonView({
  roomId,
  questionIndices,
}: {
  roomId: string;
  questionIndices: readonly number[];
}) {
  const router = useRouter();
  const requestIdRef = useRef(0);
  const availableQuestionIndices = getGroupQuestionIndices(questionIndices);
  const comparisonTabs: { label: string; value: ComparisonSelection }[] = [
    { label: "전체", value: "OVERALL" },
    ...availableQuestionIndices.map((questionIndex) => ({
      label: `질문 ${questionIndex + 1}`,
      value: questionIndex,
    })),
  ];
  const [selection, setSelection] = useState<ComparisonSelection>("OVERALL");
  const [comparisons, setComparisons] = useState<GroupInterviewComparison[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadComparisons = useCallback(async (nextSelection: ComparisonSelection) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setComparisons([]);
    setError("");
    try {
      const data = nextSelection === "OVERALL"
        ? await getGroupInterviewComparisons(roomId)
        : await getGroupInterviewQuestionComparisons(roomId, nextSelection);
      if (requestId === requestIdRef.current) setComparisons(data);
    } catch (cause) {
      if (requestId !== requestIdRef.current) return;
      if (cause instanceof GroupInterviewApiError && cause.status === 401) {
        router.replace("/login");
        return;
      }
      setError(cause instanceof Error ? cause.message : "참가자 비교 결과를 불러오지 못했습니다.");
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [roomId, router]);

  useEffect(() => {
    let cancelled = false;
    void initializeAuth().then((user) => {
      if (!cancelled) setCurrentUserId(user?.id ?? null);
    });
    const timer = window.setTimeout(() => void loadComparisons("OVERALL"), 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      requestIdRef.current += 1;
    };
  }, [loadComparisons]);

  const handleSelection = (nextSelection: ComparisonSelection) => {
    if (nextSelection === selection) return;
    if (nextSelection !== "OVERALL" && !availableQuestionIndices.includes(nextSelection)) return;
    setSelection(nextSelection);
    void loadComparisons(nextSelection);
  };

  const hasPartial = comparisons.some((comparison) => comparison.status === "PARTIAL");

  return (
    <section className="mt-6">
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {comparisonTabs.map((tab) => (
          <button
            key={String(tab.value)}
            type="button"
            onClick={() => handleSelection(tab.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              selection === tab.value
                ? "bg-navy text-white"
                : "border border-line bg-white text-muted hover:border-navy/40 hover:text-ink dark:border-white/10 dark:bg-[#1e293b]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="rounded-[24px] border border-line bg-white p-12 text-center text-sm font-bold text-muted dark:border-white/10 dark:bg-[#1e293b]">
          참가자 비교 결과를 불러오는 중입니다.
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-[24px] border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
          <button type="button" onClick={() => void loadComparisons(selection)} className="mt-4 rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white">
            다시 불러오기
          </button>
        </div>
      )}

      {!isLoading && !error && comparisons.length === 0 && (
        <div className="rounded-[24px] border border-line bg-white p-12 text-center dark:border-white/10 dark:bg-[#1e293b]">
          <Users className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-sm font-bold text-ink dark:text-white">
            {selection === "OVERALL"
              ? "전체 질문 분석이 완료되면 종합 비교 결과를 확인할 수 있습니다."
              : "이 질문의 참가자 비교 결과가 아직 준비되지 않았습니다."}
          </p>
        </div>
      )}

      {!isLoading && !error && comparisons.length > 0 && (
        <div className="space-y-4">
          {hasPartial && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              일부 참가자의 분석 결과가 없어 완전한 비교를 제공할 수 없습니다.
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-indigo-500">
                {selection === "OVERALL" ? "전체 질문" : `질문 ${selection + 1}`}
              </p>
              <h2 className="mt-1 text-xl font-bold text-navy dark:text-white">참가자 비교</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-muted dark:bg-slate-800">
              {comparisons.length}명
            </span>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {comparisons.map((comparison) => (
              <ComparisonCard
                key={`${comparison.scope}-${comparison.questionIndex ?? "overall"}-${comparison.participantUserId}`}
                comparison={comparison}
                isMe={currentUserId === comparison.participantUserId}
                showCoaching={selection === "OVERALL"}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
