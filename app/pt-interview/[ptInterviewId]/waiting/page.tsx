// app/pt-interview/[ptInterviewId]/waiting/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Eye,
  MessageSquare,
  Play,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Navbar from "@/components/shared/Navbar";
import SlideStage from "@/components/pt-interview/shared/SlideStage";
import { usePtMedia } from "@/hooks/usePtMedia";
import { usePtInterviewStore } from "@/store/usePtInterviewStore";
import { formatSeconds } from "@/lib/ptInterviewData";
import {
  generatePtQuestions,
  getPtQuestions,
} from "@/lib/api";

import type {
  PtQuestion,
  PtQuestionResponse,
} from "@/types/ptInterview";

function mapQuestion(response: PtQuestionResponse): PtQuestion {
  return {
    id: String(response.id),
    order: response.questionNumber,
    type: "content",
    text: response.question,
    relatedSlideSummary: response.reason ?? undefined,
  };
}

export default function PtWaitingPage() {
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
    questions,
    currentSlideIdx,
    nextSlide,
    prevSlide,
    setCurrentSlideIdx,
    fetchDocument,
    setQuestions,
  } = usePtInterviewStore();

  const {
    videoRef,
    cameraOn,
    micOn,
    error: mediaError,
    toggleCamera,
    toggleMic,
  } = usePtMedia();

  const prepSeconds = meta?.prepSeconds ?? 180;

  const [remaining, setRemaining] = useState(prepSeconds);
  const [isPreparing, setIsPreparing] = useState(true);
  const [prepareError, setPrepareError] = useState<string | null>(null);

  const isValidId =
    Number.isInteger(ptInterviewId) && ptInterviewId > 0;

  useEffect(() => {
    if (!isValidId) {
      setIsPreparing(false);
      setPrepareError("잘못된 PT 면접 ID입니다.");
      return;
    }

    let cancelled = false;

    const prepareInterview = async () => {
      setIsPreparing(true);
      setPrepareError(null);

      try {
        if (usePtInterviewStore.getState().slides.length === 0) {
          await fetchDocument(ptInterviewId);
        }

        if (usePtInterviewStore.getState().questions.length === 0) {
          let questionResponses =
            await getPtQuestions(ptInterviewId);

          if (questionResponses.length === 0) {
            questionResponses =
              await generatePtQuestions(ptInterviewId);
          }

          if (!cancelled) {
            setQuestions(questionResponses.map(mapQuestion));
          }
        }
      } catch (error) {
        console.error("PT 발표 준비 실패:", error);

        if (!cancelled) {
          setPrepareError(
            error instanceof Error
              ? error.message
              : "PT 발표 준비 중 오류가 발생했습니다."
          );
        }
      } finally {
        if (!cancelled) {
          setIsPreparing(false);
        }
      }
    };

    void prepareInterview();

    return () => {
      cancelled = true;
    };
  }, [
    fetchDocument,
    isValidId,
    ptInterviewId,
    setQuestions,
  ]);

  useEffect(() => {
    setRemaining(prepSeconds);
  }, [prepSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining]);

  const goPresentation = () => {
    if (!isValidId) {
      alert("잘못된 PT 면접 ID입니다.");
      return;
    }

    if (slides.length === 0) {
      alert("발표 자료를 불러오지 못했습니다.");
      return;
    }

    if (questions.length === 0) {
      alert("예상 질문이 아직 준비되지 않았습니다.");
      return;
    }

    router.push(
      `/pt-interview/${ptInterviewId}/presentation`
    );
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-bg transition-colors duration-300 dark:bg-[#0f1729]">
      <Navbar />

      <div className="mx-auto w-full max-w-6xl flex-1 px-6 pb-28 pt-32">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="flex items-center gap-1.5 rounded-full bg-brand-soft/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-navy">
            <Clock className="h-3 w-3" />
            준비 시간
          </span>

          <p className="font-serif text-6xl font-bold tracking-tight text-navy dark:text-white">
            {formatSeconds(remaining)}
          </p>

          <p className="text-sm font-medium text-muted">
            발표 전 자료와 장치를 점검하세요.
          </p>
        </div>

        {isPreparing && (
          <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-6 py-5 text-sm font-medium text-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
            발표 자료와 예상 질문을 준비하고 있습니다.
          </div>
        )}

        {prepareError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-red-600">
              <AlertCircle className="h-5 w-5" />
              {prepareError}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {slides.length > 0 ? (
              <SlideStage
                slides={slides}
                currentIdx={currentSlideIdx}
                onPrev={prevSlide}
                onNext={nextSlide}
                onSelect={setCurrentSlideIdx}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-[24px] border border-line bg-surface text-sm font-medium text-muted">
                발표 자료가 없습니다.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-ink">
                발표 핵심 정보
              </h3>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium text-muted">
                    발표 주제
                  </dt>
                  <dd className="max-w-[60%] truncate text-right font-bold text-ink">
                    {meta?.topic ?? "발표 주제"}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="font-medium text-muted">
                    직무
                  </dt>
                  <dd className="font-bold text-ink">
                    {meta?.job ?? "-"}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="font-medium text-muted">
                    발표 제한 시간
                  </dt>
                  <dd className="font-bold text-ink">
                    {formatSeconds(
                      meta?.limitSeconds ?? 300
                    )}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="font-medium text-muted">
                    총 슬라이드 수
                  </dt>
                  <dd className="font-bold text-ink">
                    {slides.length}장
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="font-medium text-muted">
                    예상 질문
                  </dt>
                  <dd className="font-bold text-ink">
                    {questions.length}개
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-ink">
                장치 테스트
              </h3>

              <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-xl bg-[#0f1729]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full -scale-x-100 object-cover"
                />

                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0f1729] text-white/40">
                    <CameraOff className="h-8 w-8" />
                    <span className="text-xs font-bold">
                      카메라 꺼짐
                    </span>
                  </div>
                )}

                {!micOn && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-red-500/90 px-2 py-1 text-[10px] font-bold text-white">
                    <MicOff className="h-3 w-3" />
                    음소거
                  </span>
                )}
              </div>

              {mediaError && (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-500">
                  {mediaError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-xs font-bold transition-all ${
                    cameraOn
                      ? "border-navy bg-brand-soft/15 text-navy"
                      : "border-red-200 bg-red-50 text-red-500"
                  }`}
                >
                  {cameraOn ? (
                    <Camera className="h-3.5 w-3.5" />
                  ) : (
                    <CameraOff className="h-3.5 w-3.5" />
                  )}
                  카메라 {cameraOn ? "ON" : "OFF"}
                </button>

                <button
                  type="button"
                  onClick={toggleMic}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-xs font-bold transition-all ${
                    micOn
                      ? "border-navy bg-brand-soft/15 text-navy"
                      : "border-red-200 bg-red-50 text-red-500"
                  }`}
                >
                  {micOn ? (
                    <Mic className="h-3.5 w-3.5" />
                  ) : (
                    <MicOff className="h-3.5 w-3.5" />
                  )}
                  마이크 {micOn ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            <div
              className="flex flex-col gap-2 rounded-[20px] p-5"
              style={{
                backgroundColor:
                  "rgba(231,241,168,0.3)",
              }}
            >
              <p
                className="flex items-center gap-2 text-xs font-bold"
                style={{ color: "#3F4A1B" }}
              >
                <Eye className="h-3.5 w-3.5" />
                발표 중 시선·자세·음성·발표 내용을
                분석합니다.
              </p>

              <p
                className="flex items-center gap-2 text-xs font-bold"
                style={{ color: "#3F4A1B" }}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                발표 종료 후 AI 질의응답이 진행됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={goPresentation}
            disabled={
              isPreparing ||
              Boolean(prepareError) ||
              slides.length === 0 ||
              questions.length === 0
            }
            className="flex items-center gap-2 rounded-full bg-navy px-12 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {isPreparing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}

            발표 시작
          </button>
        </div>
      </div>
    </main>
  );
}