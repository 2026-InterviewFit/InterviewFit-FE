// app/pt-interview/[ptInterviewId]/document/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCcw, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import AnalysisStepper from "@/components/pt-interview/document/AnalysisStepper";
import SlidePreviewList from "@/components/pt-interview/document/SlidePreviewList";
import DocumentSummaryCard from "@/components/pt-interview/document/DocumentSummaryCard";
import { usePtInterviewStore } from "@/store/usePtInterviewStore";

export default function PtDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const ptInterviewId = params.ptInterviewId as string;

  const {
    analysisStatus,
    analysisProgress,
    slides,
    docSummary,
    runDocumentAnalysis,
    loadFallbackDocument,
  } = usePtInterviewStore();

  useEffect(() => {
    // store가 비어있으면(새로고침/직접 진입) 데모 데이터, 아니면 분석 시뮬레이션 시작
    if (slides.length > 0) return;
    if (analysisStatus === "UPLOADED") {
      runDocumentAnalysis();
    } else {
      loadFallbackDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDone = analysisStatus === "DONE";

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
            AI가 분석한 슬라이드 내용을 확인한 뒤 발표 준비로 넘어가세요.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <AnalysisStepper status={analysisStatus} progress={analysisProgress} />

          {isDone && (
            <>
              {docSummary && <DocumentSummaryCard summary={docSummary} />}
              <SlidePreviewList slides={slides} />

              {/* 하단 버튼 */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push("/pt-interview")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-surface py-4 text-sm font-bold text-ink shadow-sm transition-all hover:border-navy/40"
                >
                  <RefreshCcw className="h-4 w-4" /> 자료 다시 업로드
                </button>
                <button
                  onClick={() =>
                    router.push(`/pt-interview/${ptInterviewId}/waiting`)
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy py-4 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-dark"
                >
                  <CheckCircle2 className="h-4 w-4" /> 분석 내용 확인 완료
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}