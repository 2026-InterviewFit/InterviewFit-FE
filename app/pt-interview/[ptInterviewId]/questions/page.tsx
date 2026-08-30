"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Mic,
  ChevronRight,
  Play,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { usePtMedia } from "@/hooks/usePtMedia";
import { usePtInterviewStore } from "@/store/usePtInterviewStore";
import { questionTypeMeta, formatSeconds } from "@/lib/ptInterviewData";
import { PALETTE } from "@/lib/communityData";
import {
  generatePtQuestions,
  getPtQuestions,
  uploadPtAnswer,
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

function getRecorderMimeType(): string | undefined {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  return candidates.find((type) =>
    MediaRecorder.isTypeSupported(type)
  );
}

export default function PtQuestionsPage() {
  const router = useRouter();
  const params = useParams();

  const rawPtInterviewId = params.ptInterviewId;
  const ptInterviewId = Number(
    Array.isArray(rawPtInterviewId)
      ? rawPtInterviewId[0]
      : rawPtInterviewId
  );

  const {
    questions,
    currentQuestionIdx,
    setCurrentQuestionIdx,
    setQuestions,
  } = usePtInterviewStore();

  const {
    videoRef,
    getStream,
    ready,
    error: mediaError,
  } = usePtMedia();

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [answerTime, setAnswerTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const isValidId =
    Number.isInteger(ptInterviewId) && ptInterviewId > 0;

  useEffect(() => {
    if (!isValidId || questions.length > 0) {
      return;
    }

    let cancelled = false;

    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      setPageError(null);

      try {
        let responses = await getPtQuestions(ptInterviewId);

        if (responses.length === 0) {
          responses = await generatePtQuestions(ptInterviewId);
        }

        if (!cancelled) {
          setQuestions(responses.map(mapQuestion));
        }
      } catch (error) {
        if (!cancelled) {
          setPageError(
            error instanceof Error
              ? error.message
              : "질문을 불러오지 못했습니다."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingQuestions(false);
        }
      }
    };

    void loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [isValidId, ptInterviewId, questions.length, setQuestions]);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const timer = setInterval(() => {
      setAnswerTime((current) => current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
    };
  }, []);

  const question = questions[currentQuestionIdx];
  const isLast = currentQuestionIdx === questions.length - 1;

  const startRecording = () => {
    const stream = getStream();

    if (!stream) {
      setPageError("카메라와 마이크가 아직 준비되지 않았습니다.");
      return;
    }

    try {
      chunksRef.current = [];

      const mimeType = getRecorderMimeType();

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.start(1000);
      recorderRef.current = recorder;

      setAnswerTime(0);
      setPageError(null);
      setIsRecording(true);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "녹화를 시작하지 못했습니다."
      );
    }
  };

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const recorder = recorderRef.current;

      if (!recorder || recorder.state === "inactive") {
        reject(new Error("진행 중인 녹화가 없습니다."));
        return;
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "video/webm";

        const blob = new Blob(chunksRef.current, {
          type: mimeType,
        });

        recorderRef.current = null;
        chunksRef.current = [];
        setIsRecording(false);

        if (blob.size === 0) {
          reject(new Error("녹화된 영상이 비어 있습니다."));
          return;
        }

        resolve(blob);
      };

      recorder.onerror = () => {
        reject(new Error("영상 녹화 중 오류가 발생했습니다."));
      };

      recorder.stop();
    });
  };

  const handleAnswerComplete = async () => {
    if (!question || isUploading) {
      return;
    }

    setIsUploading(true);
    setPageError(null);

    try {
      const recordedBlob = await stopRecording();

      await uploadPtAnswer({
        ptInterviewId,
        ptQuestionId: Number(question.id),
        file: recordedBlob,
      });

      setAnswerTime(0);

      if (isLast) {
        router.push(`/pt-interview/${ptInterviewId}/analyzing`);
        return;
      }

      setCurrentQuestionIdx((previous) => previous + 1);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "답변 영상을 업로드하지 못했습니다."
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!isValidId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg">
        잘못된 PT 면접 ID입니다.
      </main>
    );
  }

  if (isLoadingQuestions) {
    return (
      <main className="flex min-h-screen items-center justify-center gap-2 bg-bg text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        예상 질문을 불러오는 중입니다.
      </main>
    );
  }

  if (!question) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg">
        <div className="text-center">
          <p className="font-bold text-ink">
            표시할 질문이 없습니다.
          </p>

          {pageError && (
            <p className="mt-2 text-sm text-red-500">
              {pageError}
            </p>
          )}
        </div>
      </main>
    );
  }

  const typeMeta = questionTypeMeta(question.type);

  return (
    <main className="relative flex min-h-screen flex-col bg-bg transition-colors duration-300 dark:bg-[#0f1729]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-[#95B1EE]/40 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 pb-20 pt-16">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-bold text-muted">
            질문 <span className="text-navy">{currentQuestionIdx + 1}</span> / {questions.length}
          </span>

          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold"
            style={{
              backgroundColor: typeMeta.bg,
              color: typeMeta.fg,
            }}
          >
            {typeMeta.label}
          </span>
        </div>

        {pageError && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {pageError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            <div className="relative aspect-video w-full overflow-hidden rounded-[24px] bg-slate-900 shadow-lg border border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-slate-900" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-navy border-2 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                  <Bot className="h-12 w-12 text-indigo-300" />
                  
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 border-2 border-slate-900">
                    <span className="h-2 w-2 animate-ping rounded-full bg-white" />
                  </span>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-full bg-black/60 px-4 py-2 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <Bot className="h-4 w-4 text-white" />
                  <span className="text-[13px] font-bold text-white">AI 면접관</span>
                </div>
                
                <div className="flex h-3.5 items-end gap-[3px] border-l border-white/20 pl-3">
                  <motion.div animate={{ height: ["40%", "100%", "60%", "90%", "40%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} className="w-[3px] bg-green-400 rounded-full" />
                  <motion.div animate={{ height: ["80%", "30%", "100%", "50%", "80%"] }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }} className="w-[3px] bg-green-400 rounded-full" />
                  <motion.div animate={{ height: ["30%", "80%", "40%", "100%", "30%"] }} transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }} className="w-[3px] bg-green-400 rounded-full" />
                  <motion.div animate={{ height: ["100%", "50%", "90%", "30%", "100%"] }} transition={{ duration: 1.0, repeat: Infinity, ease: "easeInOut" }} className="w-[3px] bg-green-400 rounded-full" />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-line bg-surface p-8 shadow-sm">
              <AnimatePresence mode="wait">
                <motion.p
                  key={question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-lg font-bold leading-relaxed text-ink mt-2"
                >
                  {question.text}
                </motion.p>
              </AnimatePresence>

              {question.relatedSlideSummary && (
                <p className="mt-6 rounded-xl bg-bg px-4 py-3 text-sm text-muted border border-line">
                  <strong className="text-navy">질문 생성 배경: </strong>
                  {question.relatedSlideSummary}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm">
              <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#0f1729]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full -scale-x-100 object-cover"
                />

                {isRecording && (
                  <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-red-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    REC {formatSeconds(answerTime)}
                  </span>
                )}
              </div>

              {mediaError && (
                <p className="mb-3 text-xs font-bold text-red-500">
                  {mediaError}
                </p>
              )}

              <div className="flex items-center justify-between text-xs font-medium text-muted px-1">
                <span className="flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5" />
                  {ready ? "마이크 준비 완료" : "장치 준비 중"}
                </span>
                <span>답변 시간 {formatSeconds(answerTime)}</span>
              </div>
            </div>

            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={!ready || isUploading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 py-4 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play className="h-4 w-4 fill-current" />
                답변 녹화 시작
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAnswerComplete}
                disabled={isUploading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-4 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    답변 업로드 중...
                  </>
                ) : (
                  <>
                    {isLast
                      ? "최종 답변 완료"
                      : "답변 완료 및 다음 질문"}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}