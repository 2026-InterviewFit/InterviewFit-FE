// app/pt-interview/[ptInterviewId]/result/page.tsx
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
} from "lucide-react";

import Navbar from "@/components/shared/Navbar";
import { getPtReport } from "@/lib/api";
import { saveRecord } from "@/lib/interviewHistoryStore";
import { usePtInterviewStore } from "@/store/usePtInterviewStore";

import type { PtReportResponse } from "@/types/ptInterview";

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
}

function ScoreBar({ label, value }: ScoreBarProps) {
  const normalizedValue = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-4">
      <span className="w-24 shrink-0 text-xs font-semibold text-muted">
        {label}
      </span>

      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-chip">
        <div
          className="h-full rounded-full bg-navy transition-all duration-700"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>

      <span className="w-8 text-right text-xs font-bold text-ink">
        {normalizedValue}
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

export default function PtResultPage() {
  const router = useRouter();
  const params = useParams();

  const rawPtInterviewId = params.ptInterviewId;

  const ptInterviewId = Number(
    Array.isArray(rawPtInterviewId)
      ? rawPtInterviewId[0]
      : rawPtInterviewId
  );

  const { meta } = usePtInterviewStore();

  const [report, setReport] =
    useState<PtReportResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isValidId =
    Number.isInteger(ptInterviewId) && ptInterviewId > 0;

  const loadReport = async () => {
    if (!isValidId) {
      setError("잘못된 PT 면접 ID입니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getPtReport(ptInterviewId);
      setReport(response);
    } catch (loadError) {
      console.error("PT 리포트 조회 실패:", loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "PT 리포트를 불러오지 못했습니다."
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
      title: meta?.topic ?? "PT 발표 면접",
      jobName: meta?.job ?? "직무 미지정",
      overallScore: report.overallScore,
      savedAt: new Date().toISOString(),
      detail: report,
    });

    setSaved(true);
  };

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

  if (error || !report) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg px-6 dark:bg-[#0f1729]">
        <div className="w-full max-w-md rounded-[24px] border border-red-200 bg-surface p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />

          <h2 className="mt-4 text-lg font-bold text-ink">
            리포트를 불러오지 못했습니다.
          </h2>

          <p className="mt-2 break-all text-sm leading-6 text-red-500">
            {error ?? "리포트가 존재하지 않습니다."}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void loadReport()}
              className="flex items-center justify-center gap-2 rounded-xl bg-navy py-3.5 text-sm font-bold text-white"
            >
              <RefreshCcw className="h-4 w-4" />
              다시 조회
            </button>

            <button
              type="button"
              onClick={() => router.push("/pt-interview")}
              className="rounded-xl border border-line bg-surface py-3.5 text-sm font-bold text-ink"
            >
              PT 면접 시작 화면으로 이동
            </button>
          </div>
        </div>
      </main>
    );
  }

  const scoreItems = [
    {
      label: "발표 내용",
      value: report.contentScore,
    },
    {
      label: "발표 구조",
      value: report.structureScore,
    },
    {
      label: "전달력",
      value: report.deliveryScore,
    },
    {
      label: "질의응답",
      value: report.qaScore,
    },
  ];

  return (
    <main className="relative flex min-h-screen flex-col bg-bg transition-colors duration-300 dark:bg-[#0f1729]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-[#E7F1A8]/30 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-[600px] w-[600px] rounded-full bg-[#95B1EE]/40 blur-[160px]" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pb-28 pt-32">
        <div className="mb-8">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-navy">
            PT Interview Report
          </span>

          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            PT 면접 종합 리포트
          </h1>

          <p className="mt-2 text-sm font-medium text-muted">
            {meta?.topic ?? "PT 발표 면접"}에 대한 분석 결과입니다.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <ScoreCard
            label="종합 점수"
            value={report.overallScore}
            primary
          />

          <ScoreCard
            label="발표 내용"
            value={report.contentScore}
          />

          <ScoreCard
            label="발표 구조"
            value={report.structureScore}
          />

          <ScoreCard
            label="전달력"
            value={report.deliveryScore}
          />

          <ScoreCard
            label="질의응답"
            value={report.qaScore}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-[24px] border border-line bg-surface p-8 shadow-sm lg:col-span-5">
            <h2 className="mb-5 text-sm font-bold text-ink">
              역량별 점수
            </h2>

            <div className="flex flex-col gap-5">
              {scoreItems.map((item) => (
                <ScoreBar
                  key={item.label}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-line bg-surface p-8 shadow-sm lg:col-span-7">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
              <FileText className="h-4 w-4 text-navy" />
              발표 요약
            </h2>

            <p className="whitespace-pre-line text-sm font-medium leading-7 text-muted">
              {report.presentationSummary ||
                "발표 요약이 없습니다."}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeedbackCard
            title="강점"
            content={report.strengths}
            icon={
              <ThumbsUp className="h-4 w-4 text-emerald-500" />
            }
          />

          <FeedbackCard
            title="개선이 필요한 점"
            content={report.weaknesses}
            icon={
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            }
          />

          <FeedbackCard
            title="향후 개선 방향"
            content={report.improvement}
            icon={
              <Target className="h-4 w-4 text-blue-500" />
            }
          />
        </div>

        <div className="mt-6 rounded-[24px] border border-line bg-surface px-6 py-4 text-xs font-medium text-muted shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <span>리포트 번호: {report.reportId}</span>

            <span>
              생성일:{" "}
              {new Date(report.createdAt).toLocaleString("ko-KR")}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/pt-interview")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-surface py-4 text-sm font-bold text-ink shadow-sm transition-all hover:border-navy/40"
          >
            <RotateCcw className="h-4 w-4" />
            다시 면접하기
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-4 text-sm font-bold shadow-sm transition-all ${
              saved
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-line bg-surface text-ink hover:border-navy/40"
            }`}
          >
            <Save className="h-4 w-4" />
            {saved ? "저장됨" : "리포트 저장"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/mypage/dashboard")}
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