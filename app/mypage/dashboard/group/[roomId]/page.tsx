"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, FileVideo, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  getGroupAnswerAnalysis,
  getMyGroupInterviewAnswers,
  getMyGroupInterviewHistory,
  GroupInterviewApiError,
  retryGroupAnswerAnalysis,
} from "@/lib/groupInterviewApi";
import { GROUP_ANALYSIS_STATUS_LABEL, getGroupAnalysisStatusClassName } from "@/lib/groupInterviewDashboard";
import { formatKoreanDateTime } from "@/lib/reportUtils";
import { safeParseJson } from "@/lib/utils";
import type {
  GroupInterviewAnswerAnalysis,
  GroupInterviewHistory,
  GroupInterviewMyAnswer,
} from "@/types/groupInterview";

type JsonValue = Record<string, unknown> | unknown[] | null;

function JsonResult({ title, value }: { title: string; value: JsonValue }) {
  if (value == null) return null;
  return (
    <section className="rounded-2xl border border-line bg-slate-50 p-5 dark:border-white/10 dark:bg-[#0f1729]">
      <h4 className="text-sm font-bold text-navy dark:text-white">{title}</h4>
      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-muted">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}

export default function GroupInterviewDashboardDetailPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const roomId = params.roomId;
  const isValidRoomId = /^\d+$/.test(roomId);
  const mountedRef = useRef(true);
  const pollingAnswerIdsRef = useRef(new Set<number>());
  const [history, setHistory] = useState<GroupInterviewHistory | null>(null);
  const [answers, setAnswers] = useState<GroupInterviewMyAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [analysisByAnswerId, setAnalysisByAnswerId] = useState<Record<number, GroupInterviewAnswerAnalysis>>({});
  const [analysisLoadingId, setAnalysisLoadingId] = useState<number | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [retryingAnswerIds, setRetryingAnswerIds] = useState<number[]>([]);

  const handleError = (cause: unknown, fallback: string) => {
    if (cause instanceof GroupInterviewApiError && cause.status === 401) {
      router.replace("/login");
      return "";
    }
    if (cause instanceof GroupInterviewApiError && cause.status === 403) {
      return "이 면접의 답변을 조회할 권한이 없습니다.";
    }
    return cause instanceof Error ? cause.message : fallback;
  };

  useEffect(() => {
    mountedRef.current = true;
    if (!isValidRoomId) {
      const timer = window.setTimeout(() => {
        setPageError("잘못된 그룹 면접 ID입니다.");
        setIsLoading(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    let cancelled = false;
    void Promise.all([getMyGroupInterviewAnswers(roomId), getMyGroupInterviewHistory()])
      .then(([answerList, historyList]) => {
        if (cancelled) return;
        setAnswers(answerList);
        setHistory(historyList.find((item) => String(item.roomId) === roomId) ?? null);
      })
      .catch((cause) => {
        if (!cancelled) setPageError(handleError(cause, "그룹 면접 답변을 불러오지 못했습니다."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
    // router는 App Router에서 안정적인 참조다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidRoomId, roomId]);

  const loadAnalysis = async (answerId: number) => {
    if (analysisByAnswerId[answerId] || analysisLoadingId === answerId) return;
    try {
      setAnalysisLoadingId(answerId);
      setAnalysisError("");
      const analysis = await getGroupAnswerAnalysis(roomId, answerId);
      if (mountedRef.current) {
        setAnalysisByAnswerId((values) => ({ ...values, [answerId]: analysis }));
      }
    } catch (cause) {
      if (mountedRef.current) setAnalysisError(handleError(cause, "상세 분석 결과를 불러오지 못했습니다."));
    } finally {
      if (mountedRef.current) setAnalysisLoadingId(null);
    }
  };

  const handleSelectAnswer = (answer: GroupInterviewMyAnswer) => {
    setSelectedAnswerId(answer.answerId);
    setAnalysisError("");
    if (answer.analysisStatus === "DONE") void loadAnalysis(answer.answerId);
  };

  const pollRetriedAnswer = async (answerId: number) => {
    if (pollingAnswerIdsRef.current.has(answerId)) return;
    pollingAnswerIdsRef.current.add(answerId);

    try {
      for (let attempt = 0; attempt < 40 && mountedRef.current; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 2500));
        if (!mountedRef.current) return;
        const nextAnswers = await getMyGroupInterviewAnswers(roomId);
        if (!mountedRef.current) return;
        setAnswers(nextAnswers);
        const current = nextAnswers.find((item) => item.answerId === answerId);
        if (current?.analysisStatus === "DONE") {
          await loadAnalysis(answerId);
          return;
        }
        if (current?.analysisStatus === "FAILED") return;
      }
    } catch (cause) {
      if (mountedRef.current) setAnalysisError(handleError(cause, "분석 상태를 확인하지 못했습니다."));
    } finally {
      pollingAnswerIdsRef.current.delete(answerId);
      if (mountedRef.current) {
        setRetryingAnswerIds((ids) => ids.filter((id) => id !== answerId));
      }
    }
  };

  const handleRetry = async (answerId: number) => {
    if (retryingAnswerIds.includes(answerId)) return;
    setRetryingAnswerIds((ids) => [...ids, answerId]);
    setAnalysisError("");
    try {
      await retryGroupAnswerAnalysis(roomId, answerId);
      void pollRetriedAnswer(answerId);
    } catch (cause) {
      if (cause instanceof GroupInterviewApiError && cause.status === 409) {
        void pollRetriedAnswer(answerId);
        return;
      }
      setRetryingAnswerIds((ids) => ids.filter((id) => id !== answerId));
      setAnalysisError(handleError(cause, "분석 재시도를 요청하지 못했습니다."));
    }
  };

  const selectedAnswer = answers.find((answer) => answer.answerId === selectedAnswerId) ?? null;
  const analysis = selectedAnswerId ? analysisByAnswerId[selectedAnswerId] : undefined;
  const speechResult = safeParseJson<JsonValue>(analysis?.speechResultJson, null);
  const aiEvaluation = safeParseJson<JsonValue>(analysis?.aiEvaluationJson, null);
  const blinkingResult = safeParseJson<JsonValue>(analysis?.eyeBlinkingResultJson, null);
  const gazeResult = safeParseJson<JsonValue>(analysis?.eyeGazeResultJson, null);
  const poseResult = safeParseJson<JsonValue>(analysis?.poseResultJson, null);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-col px-6 pb-32 pt-6 lg:px-10 lg:pt-10">
        <button type="button" onClick={() => router.push("/mypage/dashboard")} className="mb-6 flex w-fit items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-bold text-ink shadow-sm hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" /> 목록으로 돌아가기
        </button>

        {isLoading && <div className="rounded-[24px] border border-line bg-white p-12 text-center text-sm font-bold text-muted dark:border-white/10 dark:bg-[#1e293b]">그룹 면접 답변을 불러오는 중입니다.</div>}
        {!isLoading && pageError && <div className="rounded-[24px] border border-red-200 bg-red-50 p-12 text-center text-sm font-bold text-red-600">{pageError}</div>}

        {!isLoading && !pageError && (
          <>
            <header className="rounded-[28px] border border-line bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#1e293b]">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">다대일 그룹 면접</span>
              <h1 className="mt-4 text-2xl font-bold text-navy dark:text-white">{history?.title ?? `그룹 면접 #${roomId}`}</h1>
              <p className="mt-2 text-sm text-muted">
                {[history?.jobCategory, history?.jobName].filter(Boolean).join(" · ") || "직무 정보 없음"}
                {history ? ` · ${formatKoreanDateTime(history.startedAt)} → ${formatKoreanDateTime(history.endedAt)}` : ""}
              </p>
            </header>

            {answers.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-line bg-white p-12 text-center text-sm font-bold text-muted dark:border-white/10 dark:bg-[#1e293b]">저장된 답변 기록이 없습니다.</div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
                <section className="flex flex-col gap-3 xl:col-span-5">
                  {answers.map((answer) => {
                    const isRetrying = retryingAnswerIds.includes(answer.answerId);
                    return (
                      <article key={answer.answerId} className={`rounded-[22px] border bg-white p-5 shadow-sm transition-colors dark:bg-[#1e293b] ${selectedAnswerId === answer.answerId ? "border-navy" : "border-line dark:border-white/10"}`}>
                        <button type="button" onClick={() => handleSelectAnswer(answer)} className="w-full text-left">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-indigo-500">라운드 {answer.round} · 질문 {answer.questionIndex}</span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getGroupAnalysisStatusClassName(answer.analysisStatus)}`}>{GROUP_ANALYSIS_STATUS_LABEL[answer.analysisStatus]}</span>
                          </div>
                          <h2 className="mt-3 text-sm font-bold leading-relaxed text-ink dark:text-white">{answer.questionText ?? "질문 내용이 없습니다."}</h2>
                          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-muted">
                            <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{answer.completionType === "TIMED_OUT" ? "시간 초과" : answer.completionType === "COMPLETED" ? "정상 완료" : "완료 상태 없음"}</span>
                            <span className="flex items-center gap-1"><FileVideo className="h-3.5 w-3.5" />{answer.videoUploaded ? "영상 저장 완료" : "답변 영상이 저장되지 않았습니다."}</span>
                          </div>
                        </button>
                        {answer.analysisStatus === "FAILED" && (
                          <button type="button" disabled={isRetrying} onClick={() => void handleRetry(answer.answerId)} className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-50">
                            <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} /> {isRetrying ? "재분석 중" : "다시 분석하기"}
                          </button>
                        )}
                      </article>
                    );
                  })}
                </section>

                <section className="xl:col-span-7">
                  <div className="min-h-[360px] rounded-[28px] border border-line bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#1e293b]">
                    {!selectedAnswer && <div className="flex min-h-[300px] items-center justify-center text-center text-sm font-bold text-muted">질문을 선택하면 상세 분석 결과를 확인할 수 있습니다.</div>}
                    {selectedAnswer && selectedAnswer.analysisStatus !== "DONE" && selectedAnswer.analysisStatus !== "FAILED" && <div className="flex min-h-[300px] items-center justify-center text-center text-sm font-bold text-muted">분석 결과를 준비하고 있습니다.</div>}
                    {selectedAnswer?.analysisStatus === "FAILED" && <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center"><p className="text-sm font-bold text-red-600">분석에 실패했습니다.</p><button type="button" disabled={retryingAnswerIds.includes(selectedAnswer.answerId)} onClick={() => void handleRetry(selectedAnswer.answerId)} className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">다시 분석하기</button></div>}
                    {selectedAnswer?.analysisStatus === "DONE" && analysisLoadingId === selectedAnswer.answerId && <div className="flex min-h-[300px] items-center justify-center text-sm font-bold text-muted">상세 분석 결과를 불러오는 중입니다.</div>}
                    {analysisError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">{analysisError}</div>}
                    {analysis && (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-5 w-5" /><h3 className="text-lg font-bold">질문별 AI 분석 완료</h3></div>
                        <section className="rounded-2xl border border-line p-5 dark:border-white/10"><h4 className="text-sm font-bold text-navy dark:text-white">답변 내용</h4><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">{analysis.speechText || "변환된 답변 텍스트가 없습니다."}</p></section>
                        <JsonResult title="음성 분석" value={speechResult} />
                        <JsonResult title="AI 평가" value={aiEvaluation} />
                        <JsonResult title="눈 깜빡임 분석" value={blinkingResult} />
                        <JsonResult title="시선 분석" value={gazeResult} />
                        <JsonResult title="자세 분석" value={poseResult} />
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </main>
    </DashboardLayout>
  );
}
