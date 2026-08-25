"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Square,
  AlertTriangle,
  HelpCircle,
  Loader2,
  Bot,
} from "lucide-react";

import SlideStage from "@/components/pt-interview/shared/SlideStage";
import { usePtMedia } from "@/hooks/usePtMedia";
import { usePtInterviewStore } from "@/store/usePtInterviewStore";
import { formatSeconds } from "@/lib/ptInterviewData";
import { uploadPtPresentation } from "@/lib/api";

export default function PtPresentationPage() {
  const router = useRouter();
  const params = useParams();

  const rawPtInterviewId = params.ptInterviewId;

  const ptInterviewId = Number(
    Array.isArray(rawPtInterviewId)
      ? rawPtInterviewId[0]
      : rawPtInterviewId,
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

  const {
    videoRef,
    ready,
    error: mediaError,
    getStream,
  } = usePtMedia();

  const limitSeconds =
    meta?.limitSeconds ?? 300;

  const [elapsed, setElapsed] =
    useState(0);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [pageError, setPageError] =
    useState<string | null>(null);

  const [isRecording, setIsRecording] =
    useState(false);

  const didInit = useRef(false);

  /*
   * MediaRecorder
   */
  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  /*
   * 녹화된 영상 조각
   */
  const recordedChunksRef =
    useRef<Blob[]>([]);

  /*
   * 녹화를 한 번만 시작하기 위한 플래그
   */
  const recordingStartedRef =
    useRef(false);

  const isValidId =
    Number.isInteger(ptInterviewId) &&
    ptInterviewId > 0;

  /*
   * 발표자료 불러오기
   */
  useEffect(() => {
    if (
      didInit.current ||
      !isValidId
    ) {
      return;
    }

    didInit.current = true;

    setCurrentSlideIdx(0);

    if (
      usePtInterviewStore
        .getState()
        .slides.length > 0
    ) {
      return;
    }

    const loadDocument = async () => {
      setIsLoading(true);
      setPageError(null);

      try {
        await fetchDocument(
          ptInterviewId,
        );
      } catch (error) {
        setPageError(
          error instanceof Error
            ? error.message
            : "발표 자료를 불러오지 못했습니다.",
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

  /*
   * 발표 시간 측정
   */
  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setElapsed(
          (current) => current + 1,
        );
      }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /*
   * 키보드 슬라이드 이동
   */
  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "ArrowRight"
      ) {
        nextSlide();
      }

      if (
        event.key === "ArrowLeft"
      ) {
        prevSlide();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    nextSlide,
    prevSlide,
  ]);

  /*
   * 브라우저가 지원하는 녹화 MIME 타입 선택
   */
  const getSupportedMimeType =
    useCallback(() => {

      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ];

      for (
        const mimeType of mimeTypes
      ) {
        if (
          MediaRecorder
            .isTypeSupported(
              mimeType,
            )
        ) {
          return mimeType;
        }
      }

      return "";
    }, []);

  /*
   * 카메라/마이크 준비가 완료되면
   * 발표 영상 자동 녹화 시작
   */
  useEffect(() => {
    if (!ready) {
      return;
    }

    if (
      recordingStartedRef.current
    ) {
      return;
    }

    const stream = getStream();

    if (!stream) {
      return;
    }

    /*
     * 마이크 트랙이 실제로 존재하는지 확인
     */
    const audioTracks =
      stream.getAudioTracks();

    if (
      audioTracks.length === 0
    ) {
      setPageError(
        "마이크 오디오 트랙을 찾을 수 없습니다.",
      );

      return;
    }

    if (
      typeof MediaRecorder ===
      "undefined"
    ) {
      setPageError(
        "현재 브라우저에서 영상 녹화를 지원하지 않습니다.",
      );

      return;
    }

    try {
      recordedChunksRef.current = [];

      const mimeType =
        getSupportedMimeType();

      const recorder =
        mimeType
          ? new MediaRecorder(
              stream,
              {
                mimeType,
              },
            )
          : new MediaRecorder(
              stream,
            );

      recorder.ondataavailable = (
        event: BlobEvent,
      ) => {
        if (
          event.data &&
          event.data.size > 0
        ) {
          recordedChunksRef
            .current
            .push(
              event.data,
            );
        }
      };

      recorder.onerror = () => {
        setPageError(
          "발표 영상 녹화 중 오류가 발생했습니다.",
        );
      };

      recorder.onstart = () => {
        setIsRecording(true);
      };

      recorder.onstop = () => {
        setIsRecording(false);
      };

      /*
       * 1초마다 Blob 조각 생성
       */
      recorder.start(1000);

      mediaRecorderRef.current =
        recorder;

      recordingStartedRef.current =
        true;

      console.log(
        "[PT] 발표 영상 녹화 시작",
      );

      console.log(
        "[PT] audio tracks:",
        audioTracks.map(
          (track) => ({
            label: track.label,
            enabled: track.enabled,
            muted: track.muted,
            readyState:
              track.readyState,
          }),
        ),
      );
    } catch (error) {
      console.error(
        "[PT] MediaRecorder 시작 실패",
        error,
      );

      setPageError(
        error instanceof Error
          ? error.message
          : "발표 영상 녹화를 시작하지 못했습니다.",
      );
    }
  }, [
    getStream,
    getSupportedMimeType,
    ready,
  ]);

  /*
   * 발표 종료 + 녹화 종료 + BE 업로드
   */
  const finishPresentation =
    async () => {

      if (isUploading) {
        return;
      }

      setIsUploading(true);
      setPageError(null);

      try {
        const recorder =
          mediaRecorderRef.current;

        if (!recorder) {
          throw new Error(
            "녹화된 발표 영상을 찾을 수 없습니다.",
          );
        }

        /*
         * 녹화가 진행 중이라면 stop 후
         * 마지막 dataavailable까지 기다린다.
         */
        if (
          recorder.state !==
          "inactive"
        ) {
          await new Promise<void>(
            (resolve, reject) => {

              const handleStop =
                () => {
                  recorder.removeEventListener(
                    "stop",
                    handleStop,
                  );

                  resolve();
                };

              recorder.addEventListener(
                "stop",
                handleStop,
              );

              try {
                /*
                 * 마지막 chunk 요청
                 */
                recorder.requestData();

                recorder.stop();
              } catch (error) {
                reject(error);
              }
            },
          );
        }

        const chunks =
          recordedChunksRef.current;

        if (
          chunks.length === 0
        ) {
          throw new Error(
            "녹화된 발표 영상 데이터가 없습니다.",
          );
        }

        const mimeType =
          recorder.mimeType ||
          "video/webm";

        const videoBlob =
          new Blob(
            chunks,
            {
              type: mimeType,
            },
          );

        console.log(
          "[PT] 발표 영상 생성 완료",
          {
            size:
              videoBlob.size,
            type:
              videoBlob.type,
            chunks:
              chunks.length,
          },
        );

        if (
          videoBlob.size === 0
        ) {
          throw new Error(
            "발표 영상의 크기가 0입니다.",
          );
        }

        /*
         * Spring Boot 업로드
         *
         * Spring:
         * /api/pt-interviews/{id}/presentation
         *
         * ↓
         *
         * MinIO
         *
         * ↓
         *
         * Speech / STT
         */
        const speechReportId =
          await uploadPtPresentation({
            ptInterviewId,
            file: videoBlob,
          });

        console.log(
          "[PT] 발표 영상/STT 처리 완료",
          {
            speechReportId,
          },
        );

        /*
         * STT 저장까지 성공한 다음
         * 질문 페이지 이동
         */
        router.push(
          `/pt-interview/${ptInterviewId}/questions`,
        );
      } catch (error) {
        console.error(
          "[PT] 발표 종료 처리 실패",
          error,
        );

        setPageError(
          error instanceof Error
            ? error.message
            : "발표 영상을 처리하지 못했습니다.",
        );

        /*
         * 실패하면 모달을 닫아서
         * 오류 메시지를 확인할 수 있게 한다.
         */
        setShowConfirm(false);
      } finally {
        setIsUploading(false);
      }
    };

  const remaining =
    Math.max(
      limitSeconds - elapsed,
      0,
    );

  const isWarning =
    remaining <= 60 &&
    remaining > 0;

  if (!isValidId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1120] text-white">
        잘못된 PT 면접 ID입니다.
      </main>
    );
  }

  return (
    <main className="fixed inset-0 z-[100] flex h-screen w-screen flex-col overflow-hidden bg-[#0b1120] font-sans text-white">

      {/* 상단 */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-3">
        <div className="flex items-center gap-4">

          <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

            {isRecording
              ? "발표 녹화 중"
              : "발표 진행 중"}
          </span>

          <span className="text-sm font-medium text-white/70">
            {meta?.topic ??
              "PT 발표"}
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm">

          <span className="text-white/50">
            경과{" "}
            <span className="font-mono font-bold text-white">
              {formatSeconds(
                elapsed,
              )}
            </span>
          </span>

          <span
            className={
              isWarning
                ? "text-red-400"
                : "text-white/50"
            }
          >
            남은 시간{" "}
            <span className="font-mono font-bold">
              {formatSeconds(
                remaining,
              )}
            </span>
          </span>

          <span className="text-white/50">
            <span className="font-bold text-white">
              {slides.length > 0
                ? currentSlideIdx +
                  1
                : 0}
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

      {pageError && (
        <div className="flex shrink-0 items-center justify-center bg-red-500/15 px-4 py-2 text-xs font-bold text-red-300">
          <AlertTriangle className="mr-2 h-4 w-4" />
          {pageError}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-white/70">
          <Loader2 className="h-5 w-5 animate-spin" />
          발표 자료를 불러오는 중입니다.
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 gap-6 overflow-hidden px-6 py-4">

          {/* 슬라이드 */}
          <div className="flex min-w-0 flex-1 flex-col justify-center">

            {slides.length > 0 ? (
              <SlideStage
                slides={slides}
                currentIdx={
                  currentSlideIdx
                }
                onPrev={prevSlide}
                onNext={nextSlide}
                onSelect={
                  setCurrentSlideIdx
                }
                fitHeight
                activeColor="white"
              />
            ) : (
              <div className="flex items-center justify-center text-white/50">
                표시할 슬라이드가 없습니다.
              </div>
            )}
          </div>

          {/* 우측 */}
          <div className="flex w-[280px] shrink-0 flex-col gap-4">

            {/* AI 면접관 */}
            <div className="relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-xl">

              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#1e293b] shadow-[0_0_20px_rgba(79,70,229,0.3)]">

                <Bot className="h-10 w-10 text-indigo-400" />

                <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-900 bg-green-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              </div>

              <span className="mt-4 text-[13px] font-medium text-white/70">
                AI 면접관 경청 중...
              </span>

              <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                AI 면접관
              </div>
            </div>

            {/* 사용자 카메라 */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-xl">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full -scale-x-100 object-cover"
              />

              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white/50">
                  카메라/마이크 준비 중
                </div>
              )}

              {mediaError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-3 text-center text-xs text-red-300">
                  {mediaError}
                </div>
              )}

              <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                지원자 (나)
              </div>

              {isRecording && (
                <div className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-red-500/80 px-2 py-1 text-[10px] font-bold text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  REC
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 하단 */}
      <div className="flex shrink-0 items-center justify-center border-t border-white/10 py-4">

        <button
          type="button"
          disabled={
            isUploading ||
            !isRecording
          }
          onClick={() =>
            setShowConfirm(true)
          }
          className="flex items-center gap-2 rounded-full bg-red-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Square className="h-4 w-4 fill-current" />
          )}

          {isUploading
            ? "발표 분석 중..."
            : "발표 종료"}
        </button>
      </div>

      {/* 종료 확인 */}
      {showConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="w-full max-w-sm rounded-[28px] bg-white p-8 text-center text-navy shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <HelpCircle className="h-6 w-6" />
            </div>

            <h3 className="text-xl font-bold">
              발표를 종료하시나요?
            </h3>

            <p className="mt-2 px-2 text-xs leading-relaxed text-muted">
              발표 영상을 저장하고 음성을 분석한 뒤 AI 질의응답이 진행됩니다.
            </p>

            <div className="mt-6 flex flex-col gap-2">

              <button
                type="button"
                disabled={isUploading}
                onClick={() => {
                  void finishPresentation();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-3.5 text-sm font-bold text-white transition-colors hover:bg-navy-dark disabled:opacity-50"
              >
                {isUploading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {isUploading
                  ? "발표 분석 중..."
                  : "네, 질의응답 시작"}
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={() =>
                  setShowConfirm(false)
                }
                className="w-full rounded-2xl bg-gray-100 py-3.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-200 disabled:opacity-50"
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