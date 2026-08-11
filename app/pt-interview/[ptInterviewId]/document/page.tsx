// app/pt-interview/[ptInterviewId]/document/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RefreshCcw,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Navbar from "@/components/shared/Navbar";
import AnalysisStepper from "@/components/pt-interview/document/AnalysisStepper";
import SlidePreviewList from "@/components/pt-interview/document/SlidePreviewList";
import DocumentSummaryCard from "@/components/pt-interview/document/DocumentSummaryCard";
import { usePtInterviewStore } from "@/store/usePtInterviewStore";

export default function PtDocumentPage() {
  const router = useRouter();
  const params = useParams();

  const rawPtInterviewId = params.ptInterviewId;
  const ptInterviewId = Number(
    Array.isArray(rawPtInterviewId)
      ? rawPtInterviewId[0]
      : rawPtInterviewId
  );

  const {
    analysisStatus,
    analysisProgress,
    slides,
    docSummary,
    isLoadingDocument,
    error,
    fetchDocument,
    clearError,
  } = usePtInterviewStore();

  useEffect(() => {
    if (!Number.isInteger(ptInterviewId) || ptInterviewId <= 0) {
      return;
    }

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const loadDocument = async () => {
      try {
        await fetchDocument(ptInterviewId);

        if (cancelled) {
          return;
        }

        const currentStatus =
          usePtInterviewStore.getState().analysisStatus;

        if (
          currentStatus === "UPLOADED" ||
          currentStatus === "EXTRACTING" ||
          currentStatus === "ANALYZING"
        ) {
          pollTimer = setTimeout(loadDocument, 2000);
        }
      } catch (fetchError) {
        console.error("PT 문서 분석 결과 조회 실패:", fetchError);
      }
    };

    void loadDocument();

    return () => {
      cancelled = true;

      if (pollTimer) {
        clearTimeout(pollTimer);
      }
    };
  }, [fetchDocument, ptInterviewId]);

  const isValidId =
    Number.isInteger(ptInterviewId) && ptInterviewId > 0;

  const isDone = analysisStatus === "DONE";
  const isFailed = analysisStatus === "FAILED";

  const handleRetry = async () => {
    if (!isValidId) {
      return;
    }

    clearError();

    try {
      await fetchDocument(ptInterviewId);
    } catch (fetchError) {
      console.error("PT 문서 재조회 실패:", fetchError);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-bg transition-colors duration-300 dark:bg-[#0f1729]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute right-10 top-0 h-[500px] w-[500px] rounded-full bg-[#95B1EE]/40 blur-[150px]" />
        <div className="absolute bottom-[-100px] left-[-50px] h-[400px] w-[400px] rounded-full bg-[#E7F1A8]/25 blur-[120px]" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto w-full max-w-[820px] flex-1 px-6 pb-28 pt-32">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            발표 자료 분석
          </h1>

          <p className="mt-1.5 text-sm font-medium text-muted">
            AI가 분석한 슬라이드 내용을 확인한 뒤 발표 준비로
            넘어가세요.
          </p>
        </div>

        {!isValidId ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-red-600">
              <AlertCircle className="h-5 w-5" />
              잘못된 PT 면접 주소입니다.
            </div>

            <button
              type="button"
              onClick={() => router.replace("/pt-interview")}
              className="mt-4 rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white"
            >
              PT 면접 생성 화면으로 이동
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <AnalysisStepper
              status={analysisStatus}
              progress={analysisProgress}
            />

            {isLoadingDocument && slides.length === 0 && (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-6 py-8 text-sm font-medium text-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
                문서 분석 결과를 불러오는 중입니다.
              </div>
            )}

            {(error || isFailed) && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-700">
                      문서 분석 결과를 불러오지 못했습니다.
                    </p>

                    <p className="mt-1 break-all text-sm text-red-600">
                      {error ?? "문서 분석에 실패했습니다."}
                    </p>

                    <button
                      type="button"
                      onClick={handleRetry}
                      disabled={isLoadingDocument}
                      className="mt-4 flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-bold text-red-600 disabled:opacity-60"
                    >
                      {isLoadingDocument ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCcw className="h-4 w-4" />
                      )}
                      다시 조회
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isDone && (
              <>
                {docSummary && (
                  <DocumentSummaryCard summary={docSummary} />
                )}

                <SlidePreviewList slides={slides} />

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => router.push("/pt-interview")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-surface py-4 text-sm font-bold text-ink shadow-sm transition-all hover:border-navy/40"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    자료 다시 업로드
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/pt-interview/${ptInterviewId}/waiting`
                      )
                    }
                    disabled={slides.length === 0}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy py-4 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    분석 내용 확인 완료
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}