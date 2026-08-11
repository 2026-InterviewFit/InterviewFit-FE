// app/pt-interview/[ptInterviewId]/presentation/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Square,
  AlertTriangle,
  HelpCircle,
  Loader2,
} from "lucide-react";

import SlideStage from "@/components/pt-interview/shared/SlideStage";
import { usePtMedia } from "@/hooks/usePtMedia";
import { usePtInterviewStore } from "@/store/usePtInterviewStore";
import { formatSeconds } from "@/lib/ptInterviewData";

export default function PtPresentationPage() {
  const router = useRouter();
  const params = useParams();

  const rawPtInterviewId = params.ptInterviewId;
  const ptInterviewId = Number(
    Array.isArray(rawPtInterviewId)
      ? rawPtInterviewId[0]
      : rawPtInterviewId
  );

  const {
    meta,
    slides,
    currentSlideIdx,
    nextSlide,
    prevSlide,
    setCurrentSlideIdx,
    fetchDocument,
  } = usePtInterviewStore();

  const { videoRef, ready, error: mediaError } = usePtMedia();

  const limitSeconds = meta?.limitSeconds ?? 300;

  const [elapsed, setElapsed] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const didInit = useRef(false);

  const isValidId =
    Number.isInteger(ptInterviewId) && ptInterviewId > 0;

  useEffect(() => {
    if (didInit.current || !isValidId) {
      return;
    }

    didInit.current = true;
    setCurrentSlideIdx(0);

    if (usePtInterviewStore.getState().slides.length > 0) {
      return;
    }

    const loadDocument = async () => {
      setIsLoading(true);
      setPageError(null);

      try {
        await fetchDocument(ptInterviewId);
      } catch (error) {
        setPageError(
          error instanceof Error
            ? error.message
            : "발표 자료를 불러오지 못했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadDocument();
  }, [
    fetchDocument,
    isValidId,
    ptInterviewId,
    setCurrentSlideIdx,
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        nextSlide();
      }

      if (event.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextSlide, prevSlide]);

  const remaining = Math.max(limitSeconds - elapsed, 0);
  const isWarning = remaining <= 60 && remaining > 0;

  const goQuestions = () => {
    router.push(`/pt-interview/${ptInterviewId}/questions`);
  };

  if (!isValidId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1120] text-white">
        잘못된 PT 면접 ID입니다.
      </main>
    );
  }

  return (
    <main className="fixed inset-0 z-[100] flex h-screen w-screen flex-col overflow-hidden bg-[#0b1120] font-sans text-white">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            발표 진행 중
          </span>

          <span className="text-sm font-medium text-white/70">
            {meta?.topic ?? "PT 발표"}
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <span className="text-white/50">
            경과{" "}
            <span className="font-mono font-bold text-white">
              {formatSeconds(elapsed)}
            </span>
          </span>

          <span
            className={isWarning ? "text-red-400" : "text-white/50"}
          >
            남은 시간{" "}
            <span className="font-mono font-bold">
              {formatSeconds(remaining)}
            </span>
          </span>

          <span className="text-white/50">
            <span className="font-bold text-white">
              {slides.length > 0 ? currentSlideIdx + 1 : 0}
            </span>{" "}
            / {slides.length}
          </span>
        </div>
      </div>

      {isWarning && (
        <div className="flex shrink-0 items-center justify-center gap-2 bg-red-500/15 py-1.5 text-xs font-bold text-red-300">
          <AlertTriangle className="h-3.5 w-3.5" />
          발표 종료까지 1분 이내입니다.
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-white/70">
          <Loader2 className="h-5 w-5 animate-spin" />
          발표 자료를 불러오는 중입니다.
        </div>
      ) : pageError ? (
        <div className="flex flex-1 items-center justify-center text-red-300">
          {pageError}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 justify-center overflow-hidden px-6 py-4">
          {slides.length > 0 ? (
            <div className="flex h-full w-full max-w-6xl flex-col">
              <SlideStage
                slides={slides}
                currentIdx={currentSlideIdx}
                onPrev={prevSlide}
                onNext={nextSlide}
                onSelect={setCurrentSlideIdx}
                fitHeight
                activeColor="white"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center text-white/50">
              표시할 슬라이드가 없습니다.
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-24 right-6 h-28 w-44 overflow-hidden rounded-xl border-2 border-white/20 bg-black shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full -scale-x-100 object-cover"
        />

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-white/50">
            카메라 준비 중
          </div>
        )}

        {mediaError && (
          <div className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-red-300">
            {mediaError}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-center border-t border-white/10 py-4">
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 rounded-full bg-red-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          <Square className="h-4 w-4 fill-current" />
          발표 종료
        </button>
      </div>

      {showConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-[28px] bg-white p-8 text-center text-navy shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <HelpCircle className="h-6 w-6" />
            </div>

            <h3 className="text-xl font-bold">
              발표를 종료하시나요?
            </h3>

            <p className="mt-2 px-2 text-xs leading-relaxed text-muted">
              발표를 종료하면 AI 질의응답이 진행됩니다.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={goQuestions}
                className="w-full rounded-2xl bg-navy py-3.5 text-sm font-bold text-white transition-colors hover:bg-navy-dark"
              >
                네, 질의응답 시작
              </button>

              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="w-full rounded-2xl bg-gray-100 py-3.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-200"
              >
                아니요, 계속 발표하기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}