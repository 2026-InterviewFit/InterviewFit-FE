"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RotateCcw,
  Save,
  LayoutDashboard,
  ThumbsUp,
  AlertTriangle,
  Target,
  FileText,
  Loader2,
  RefreshCcw,
  Eye,
  AudioLines,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

import Navbar from "@/components/shared/Navbar";
import { getPtReport } from "@/lib/api";
import { saveRecord } from "@/lib/interviewHistoryStore";
import { usePtInterviewStore } from "@/store/usePtInterviewStore";

import type {
  PtReportResponse,
  PtQuestionAnalysisResponse,
} from "@/types/ptInterview";

// =========================================================
// 공통
// =========================================================

interface ScoreCardProps {
  label: string;
  value: number;
  primary?: boolean;
}

function ScoreCard({
  label,
  value,
  primary = false,
}: ScoreCardProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border p-5 text-center ${
        primary
          ? "border-transparent bg-navy text-white"
          : "border-line bg-surface text-ink"
      }`}
    >
      <span
        className={`text-[11px] font-bold ${
          primary ? "text-white/70" : "text-muted"
        }`}
      >
        {label}
      </span>

      <span className="mt-1 text-3xl font-bold">
        {value}
        <span
          className={`ml-0.5 text-sm ${
            primary ? "text-white/60" : "text-muted"
          }`}
        >
          점
        </span>
      </span>
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
}

function ScoreBar({
  label,
  value,
  max = 100,
}: ScoreBarProps) {
  const normalizedValue = Math.max(
    0,
    Math.min(100, (value / max) * 100),
  );

  return (
    <div className="flex items-center gap-4">
      <span className="w-24 shrink-0 text-xs font-semibold text-muted">
        {label}
      </span>

      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-chip">
        <div
          className="h-full rounded-full bg-navy transition-all duration-700"
          style={{
            width: `${normalizedValue}%`,
          }}
        />
      </div>

      <span className="w-14 text-right text-xs font-bold text-ink">
        {value}/{max}
      </span>
    </div>
  );
}

interface FeedbackCardProps {
  title: string;
  content: string;
  icon: React.ReactNode;
}

function FeedbackCard({
  title,
  content,
  icon,
}: FeedbackCardProps) {
  return (
    <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
        {icon}
        {title}
      </h3>

      <p className="whitespace-pre-line text-sm font-medium leading-7 text-muted">
        {content || "분석 내용이 없습니다."}
      </p>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
}

function MetricCard({
  label,
  value,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-chip/60 p-4">
      <p className="text-[11px] font-bold text-muted">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-ink">
        {value}
      </p>
    </div>
  );
}

function formatNumber(
  value: number | null | undefined,
  digits = 1,
) {
  if (value === null || value === undefined) {
    return "-";
  }

  return value.toFixed(digits);
}

function formatPercent(
  value: number | null | undefined,
) {
  if (value === null || value === undefined) {
    return "-";
  }

  /*
   * DB 값이 0~1 비율이면 100을 곱하고,
   * 이미 0~100 값이면 그대로 사용한다.
   */
  const percent =
    Math.abs(value) <= 1
      ? value * 100
      : value;

  return `${percent.toFixed(1)}%`;
}

// =========================================================
// 질문별 상세 분석
// =========================================================

function QuestionAnalysisCard({
  analysis,
}: {
  analysis: PtQuestionAnalysisResponse;
}) {
  const star = analysis.starAnalysis;

  return (
    <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm md:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
          {analysis.questionNumber}
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
            Question
          </p>

          <h3 className="mt-1 text-base font-bold leading-7 text-ink">
            {analysis.question}
          </h3>
        </div>
      </div>

      {/* 질문별 기존 평가 점수 */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <MetricCard
          label="종합"
          value={`${analysis.overallScore ?? 0}점`}
        />

        <MetricCard
          label="이해도"
          value={`${analysis.understandingScore ?? 0}점`}
        />

        <MetricCard
          label="논리성"
          value={`${analysis.logicScore ?? 0}점`}
        />

        <MetricCard
          label="구체성"
          value={`${analysis.specificityScore ?? 0}점`}
        />

        <MetricCard
          label="근거"
          value={`${analysis.evidenceScore ?? 0}점`}
        />
      </div>

      {/* 실제 답변 */}
      <div className="mt-6 rounded-2xl border border-line bg-bg/60 p-5">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
          <MessageSquareText className="h-4 w-4 text-navy" />
          실제 답변
        </h4>

        <p className="whitespace-pre-line text-sm font-medium leading-7 text-muted">
          {analysis.answer || "답변 내용이 없습니다."}
        </p>
      </div>

      {/* STAR */}
      {star && (
        <div className="mt-6 rounded-2xl border border-line p-5">
          <div className="mb-5 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-bold text-ink">
              <Target className="h-4 w-4 text-navy" />
              STAR 구조 평가
            </h4>

            <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">
              {star.totalScore}/40
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <ScoreBar
              label="S · Situation"
              value={star.situation}
              max={10}
            />

            <ScoreBar
              label="T · Task"
              value={star.task}
              max={10}
            />

            <ScoreBar
              label="A · Action"
              value={star.action}
              max={10}
            />

            <ScoreBar
              label="R · Result"
              value={star.result}
              max={10}
            />
          </div>
        </div>
      )}

      {/* AI 피드백 */}
      {analysis.aiFeedback && (
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 dark:bg-blue-950/10">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <Sparkles className="h-4 w-4 text-blue-500" />
            AI 답변 피드백
          </h4>

          <p className="whitespace-pre-line text-sm font-medium leading-7 text-muted">
            {analysis.aiFeedback}
          </p>
        </div>
      )}

      {/* 모범 답변 */}
      {(analysis.modelAnswer ||
        analysis.improvedAnswer) && (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 dark:bg-emerald-950/10">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <ThumbsUp className="h-4 w-4 text-emerald-500" />
            AI 모범 답변
          </h4>

          <p className="whitespace-pre-line text-sm font-medium leading-7 text-muted">
            {analysis.modelAnswer ||
              analysis.improvedAnswer}
          </p>
        </div>
      )}

      {/* 기존 PT 분석 */}
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <FeedbackCard
          title="답변 강점"
          content={analysis.strengths}
          icon={
            <ThumbsUp className="h-4 w-4 text-emerald-500" />
          }
        />

        <FeedbackCard
          title="답변 약점"
          content={analysis.weaknesses}
          icon={
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          }
        />

        <FeedbackCard
          title="개선 방법"
          content={analysis.improvement}
          icon={
            <Target className="h-4 w-4 text-blue-500" />
          }
        />
      </div>
    </div>
  );
}

// =========================================================
// 페이지
// =========================================================

export default function PtResultPage() {
  const router = useRouter();
  const params = useParams();

  const rawPtInterviewId =
    params.ptInterviewId;

  const ptInterviewId = Number(
    Array.isArray(rawPtInterviewId)
      ? rawPtInterviewId[0]
      : rawPtInterviewId,
  );

  const { meta } =
    usePtInterviewStore();

  const [report, setReport] =
    useState<PtReportResponse | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [saved, setSaved] =
    useState(false);

  const isValidId =
    Number.isInteger(ptInterviewId) &&
    ptInterviewId > 0;

  const loadReport = async () => {
    if (!isValidId) {
      setError(
        "잘못된 PT 면접 ID입니다.",
      );

      setIsLoading(false);

      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response =
        await getPtReport(
          ptInterviewId,
        );

      setReport(response);
    } catch (loadError) {
      console.error(
        "PT 리포트 조회 실패:",
        loadError,
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : "PT 리포트를 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ptInterviewId]);

  const handleSave = () => {
    if (!report) {
      return;
    }

    saveRecord("pt", {
      id: String(ptInterviewId),
      title:
        meta?.topic ??
        "PT 발표 면접",
      jobName:
        meta?.job ??
        "직무 미지정",
      overallScore:
        report.overallScore,
      savedAt:
        new Date().toISOString(),
      detail: report,
    });

    setSaved(true);
  };

  // =======================================================
  // Loading
  // =======================================================

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg dark:bg-[#0f1729]">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />

          <p className="text-sm font-bold">
            PT 종합 리포트를 불러오는 중입니다.
          </p>
        </div>
      </main>
    );
  }

  // =======================================================
  // Error
  // =======================================================

  if (error || !report) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg px-6 dark:bg-[#0f1729]">
        <div className="w-full max-w-md rounded-[24px] border border-red-200 bg-surface p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />

          <h2 className="mt-4 text-lg font-bold text-ink">
            리포트를 불러오지 못했습니다.
          </h2>

          <p className="mt-2 break-all text-sm leading-6 text-red-500">
            {error ??
              "리포트가 존재하지 않습니다."}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                void loadReport()
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-navy py-3.5 text-sm font-bold text-white"
            >
              <RefreshCcw className="h-4 w-4" />
              다시 조회
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/pt-interview",
                )
              }
              className="rounded-xl border border-line bg-surface py-3.5 text-sm font-bold text-ink"
            >
              PT 면접 시작 화면으로 이동
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =======================================================
  // Data
  // =======================================================

  const scoreItems = [
    {
      label: "발표 내용",
      value:
        report.contentScore,
    },
    {
      label: "발표 구조",
      value:
        report.structureScore,
    },
    {
      label: "전달력",
      value:
        report.deliveryScore,
    },
    {
      label: "질의응답",
      value:
        report.qaScore,
    },
  ];

  const presentation =
    report.presentationAnalysis;

  const blinking =
    presentation?.eyeBlinking;

  const gaze =
    presentation?.eyeGaze;

  const speech =
    presentation?.speech;

  const questionAnalyses =
    report.questionAnalyses ?? [];

  // =======================================================
  // UI
  // =======================================================

  return (
    <main className="relative flex min-h-screen flex-col bg-bg transition-colors duration-300 dark:bg-[#0f1729]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-[#E7F1A8]/30 blur-[140px]" />

        <div className="absolute right-0 top-1/3 h-[600px] w-[600px] rounded-full bg-[#95B1EE]/40 blur-[160px]" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pb-28 pt-32">
        {/* Header */}
        <div className="mb-8">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-navy">
            PT Interview Report
          </span>

          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            PT 면접 종합 리포트
          </h1>

          <p className="mt-2 text-sm font-medium text-muted">
            {meta?.topic ??
              "PT 발표 면접"}
            에 대한 분석 결과입니다.
          </p>
        </div>

        {/* =================================================
            종합 점수
        ================================================= */}

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <ScoreCard
            label="종합 점수"
            value={
              report.overallScore
            }
            primary
          />

          <ScoreCard
            label="발표 내용"
            value={
              report.contentScore
            }
          />

          <ScoreCard
            label="발표 구조"
            value={
              report.structureScore
            }
          />

          <ScoreCard
            label="전달력"
            value={
              report.deliveryScore
            }
          />

          <ScoreCard
            label="질의응답"
            value={
              report.qaScore
            }
          />
        </div>

        {/* =================================================
            기존 종합 분석
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-[24px] border border-line bg-surface p-8 shadow-sm lg:col-span-5">
            <h2 className="mb-5 text-sm font-bold text-ink">
              역량별 점수
            </h2>

            <div className="flex flex-col gap-5">
              {scoreItems.map(
                (item) => (
                  <ScoreBar
                    key={
                      item.label
                    }
                    label={
                      item.label
                    }
                    value={
                      item.value
                    }
                  />
                ),
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-line bg-surface p-8 shadow-sm lg:col-span-7">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
              <FileText className="h-4 w-4 text-navy" />
              발표 요약
            </h2>

            <p className="whitespace-pre-line text-sm font-medium leading-7 text-muted">
              {report.actualPresentationSummary ||
                "발표 요약이 없습니다."}
            </p>
          </div>
        </div>

        {/* 발표자료 vs 실제 발표 */}
        {report.presentationComparison && (
          <div className="mt-6 rounded-[24px] border border-line bg-surface p-6 shadow-sm md:p-8">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
              <FileText className="h-4 w-4 text-navy" />
              발표자료와 실제 발표 비교
            </h2>

            <p className="whitespace-pre-line text-sm font-medium leading-7 text-muted">
              {
                report.presentationComparison
              }
            </p>
          </div>
        )}

        {/* 종합 피드백 */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeedbackCard
            title="강점"
            content={
              report.strengths
            }
            icon={
              <ThumbsUp className="h-4 w-4 text-emerald-500" />
            }
          />

          <FeedbackCard
            title="개선이 필요한 점"
            content={
              report.weaknesses
            }
            icon={
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            }
          />

          <FeedbackCard
            title="향후 개선 방향"
            content={
              report.improvement
            }
            icon={
              <Target className="h-4 w-4 text-blue-500" />
            }
          />
        </div>

        {/* =================================================
            상세 발표 분석
        ================================================= */}

        <div className="mb-5 mt-12">
          <span className="text-[11px] font-bold uppercase tracking-widest text-navy">
            Detailed Analysis
          </span>

          <h2 className="mt-2 text-xl font-bold text-ink">
            발표 상세 분석
          </h2>

          <p className="mt-1 text-sm text-muted">
            발표 영상의 시선, 눈 깜빡임,
            음성 데이터를 분석한 결과입니다.
          </p>
        </div>

        {!presentation && (
          <div className="rounded-[24px] border border-line bg-surface p-8 text-center text-sm font-medium text-muted shadow-sm">
            발표 상세 분석 데이터가 없습니다.
          </div>
        )}

        {/* =================================================
            눈 깜빡임
        ================================================= */}

        {blinking && (
          <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                  Eye Blinking
                </p>

                <h3 className="mt-1 flex items-center gap-2 text-lg font-bold text-ink">
                  <Eye className="h-5 w-5 text-navy" />
                  눈 깜빡임 분석
                </h3>
              </div>

              <div className="rounded-full bg-navy px-4 py-2 text-sm font-bold text-white">
                {formatNumber(
                  blinking.score,
                  0,
                )}
                점
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <MetricCard
                label="분석 시간"
                value={
                  blinking.durationSeconds !==
                    null
                    ? `${formatNumber(
                        blinking.durationSeconds,
                        1,
                      )}초`
                    : "-"
                }
              />

              <MetricCard
                label="총 깜빡임"
                value={
                  blinking.blinkCount !==
                    null
                    ? `${blinking.blinkCount}회`
                    : "-"
                }
              />

              <MetricCard
                label="분당 깜빡임"
                value={
                  blinking.blinkRate !==
                    null
                    ? `${formatNumber(
                        blinking.blinkRate,
                        1,
                      )}회/분`
                    : "-"
                }
              />

              <MetricCard
                label="등급"
                value={
                  blinking.grade ??
                  "-"
                }
              />
            </div>

            <div className="mt-5 rounded-2xl bg-bg/60 p-5">
              <p className="text-xs font-bold text-ink">
                분석 피드백
              </p>

              <p className="mt-2 whitespace-pre-line text-sm font-medium leading-7 text-muted">
                {blinking.feedback ||
                  "눈 깜빡임 분석 피드백이 없습니다."}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            시선
        ================================================= */}

        {gaze && (
          <div className="mt-6 rounded-[24px] border border-line bg-surface p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                  Eye Gaze
                </p>

                <h3 className="mt-1 flex items-center gap-2 text-lg font-bold text-ink">
                  <Eye className="h-5 w-5 text-navy" />
                  시선 방향 분석
                </h3>
              </div>

              <div className="rounded-full bg-navy px-4 py-2 text-sm font-bold text-white">
                {formatNumber(
                  gaze.score,
                  0,
                )}
                점
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <MetricCard
                label="정면 응시 비율"
                value={formatPercent(
                  gaze.centerRatio,
                )}
              />

              <MetricCard
                label="시선 이탈 비율"
                value={formatPercent(
                  gaze.gazeAwayRatio,
                )}
              />

              <MetricCard
                label="시선 이탈 횟수"
                value={
                  gaze.gazeAwayCount !==
                    null
                    ? `${gaze.gazeAwayCount}회`
                    : "-"
                }
              />

              <MetricCard
                label="등급"
                value={
                  gaze.grade ?? "-"
                }
              />
            </div>

            <div className="mt-5 rounded-2xl bg-bg/60 p-5">
              <p className="text-xs font-bold text-ink">
                시선 평가
              </p>

              <p className="mt-2 whitespace-pre-line text-sm font-medium leading-7 text-muted">
                {gaze.evaluation ||
                  "시선 분석 평가가 없습니다."}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            음성 / STT
        ================================================= */}

        {speech && (
          <div className="mt-6 rounded-[24px] border border-line bg-surface p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                  Speech Analysis
                </p>

                <h3 className="mt-1 flex items-center gap-2 text-lg font-bold text-ink">
                  <AudioLines className="h-5 w-5 text-navy" />
                  음성 및 발표 내용 분석
                </h3>
              </div>

              <div className="rounded-full bg-navy px-4 py-2 text-sm font-bold text-white">
                {formatNumber(
                  speech.score,
                  0,
                )}
                점
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <MetricCard
                label="불필요 표현"
                value={
                  speech.totalFillerCount !==
                    null
                    ? `${speech.totalFillerCount}회`
                    : "-"
                }
              />

              <MetricCard
                label="초당 글자 수"
                value={
                  speech.charactersPerSecond !==
                    null
                    ? formatNumber(
                        speech.charactersPerSecond,
                        2,
                      )
                    : "-"
                }
              />

              <MetricCard
                label="침묵 시간"
                value={
                  speech.totalSilenceSeconds !==
                    null
                    ? `${formatNumber(
                        speech.totalSilenceSeconds,
                        1,
                      )}초`
                    : "-"
                }
              />

              <MetricCard
                label="긴 침묵"
                value={
                  speech.criticalSilenceCount !==
                    null
                    ? `${speech.criticalSilenceCount}회`
                    : "-"
                }
              />
            </div>

            {speech.paceEvaluation && (
              <div className="mt-5 rounded-2xl bg-bg/60 p-5">
                <p className="text-xs font-bold text-ink">
                  말하기 속도
                </p>

                <p className="mt-2 text-sm font-bold text-navy">
                  {
                    speech.paceEvaluation
                  }
                </p>

                {speech.paceFeedback && (
                  <p className="mt-2 whitespace-pre-line text-sm font-medium leading-7 text-muted">
                    {
                      speech.paceFeedback
                    }
                  </p>
                )}
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-line p-5">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
                <MessageSquareText className="h-4 w-4 text-navy" />
                발표 STT
              </h4>

              <p className="whitespace-pre-line text-sm font-medium leading-7 text-muted">
                {speech.textScript ||
                  "발표 음성 텍스트가 없습니다."}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            질문별 상세 분석
        ================================================= */}

        <div className="mb-5 mt-12">
          <span className="text-[11px] font-bold uppercase tracking-widest text-navy">
            Q&A Analysis
          </span>

          <h2 className="mt-2 text-xl font-bold text-ink">
            질문별 답변 상세 분석
          </h2>

          <p className="mt-1 text-sm text-muted">
            실제 답변과 STAR 구조, AI 피드백,
            모범 답변을 확인할 수 있습니다.
          </p>
        </div>

        {questionAnalyses.length ===
        0 ? (
          <div className="rounded-[24px] border border-line bg-surface p-8 text-center text-sm font-medium text-muted shadow-sm">
            질문별 분석 데이터가 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {questionAnalyses.map(
              (
                analysis,
                index,
              ) => (
                <QuestionAnalysisCard
                  key={`${analysis.questionNumber}-${index}`}
                  analysis={
                    analysis
                  }
                />
              ),
            )}
          </div>
        )}

        {/* =================================================
            Report Metadata
        ================================================= */}

        <div className="mt-8 rounded-[24px] border border-line bg-surface px-6 py-4 text-xs font-medium text-muted shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <span>
              리포트 번호:{" "}
              {report.reportId}
            </span>

            <span>
              생성일:{" "}
              {new Date(
                report.createdAt,
              ).toLocaleString(
                "ko-KR",
              )}
            </span>
          </div>
        </div>

        {/* =================================================
            Buttons
        ================================================= */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/pt-interview",
              )
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-surface py-4 text-sm font-bold text-ink shadow-sm transition-all hover:border-navy/40"
          >
            <RotateCcw className="h-4 w-4" />
            다시 면접하기
          </button>

          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={saved}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-4 text-sm font-bold shadow-sm transition-all ${
              saved
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-line bg-surface text-ink hover:border-navy/40"
            }`}
          >
            <Save className="h-4 w-4" />

            {saved
              ? "저장됨"
              : "리포트 저장"}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/mypage/dashboard",
              )
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy py-4 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-dark"
          >
            <LayoutDashboard className="h-4 w-4" />
            대시보드로 이동
          </button>
        </div>
      </div>
    </main>
  );
}