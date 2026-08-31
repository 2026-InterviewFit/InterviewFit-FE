"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, PlayCircle, TriangleAlert } from "lucide-react";
import { getMyGroupAnswerVideo } from "@/lib/groupInterviewApi";
import { getGroupAnswerVideoState } from "@/lib/groupInterviewDashboard";
import type { GroupInterviewMyAnswer } from "@/types/groupInterview";

interface GroupAnswerVideoPlayerProps {
  roomId: string;
  answer: GroupInterviewMyAnswer;
}

export default function GroupAnswerVideoPlayer({ roomId, answer }: GroupAnswerVideoPlayerProps) {
  const objectUrlRef = useRef<string | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const videoState = getGroupAnswerVideoState(answer.videoUploaded, answer.completionType);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestControllerRef.current?.abort();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  if (videoState === "HIDDEN") return null;

  if (videoState === "RECORDING_FAILED") {
    return (
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        녹화에 실패하여 다시 볼 수 있는 답변 영상이 없습니다.
      </div>
    );
  }

  const togglePlayer = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    if (videoUrl || isLoading) return;

    setIsLoading(true);
    setError("");
    const controller = new AbortController();
    requestControllerRef.current = controller;
    try {
      const blob = await getMyGroupAnswerVideo(roomId, answer.answerId, controller.signal);
      if (!mountedRef.current) return;
      const nextUrl = URL.createObjectURL(blob);
      objectUrlRef.current = nextUrl;
      setVideoUrl(nextUrl);
    } catch (cause) {
      if (mountedRef.current && !(cause instanceof DOMException && cause.name === "AbortError")) {
        setError(cause instanceof Error ? cause.message : "답변 영상을 불러오지 못했습니다.");
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-line bg-slate-50/70 dark:border-white/10 dark:bg-slate-800/40">
      <button
        type="button"
        onClick={() => void togglePlayer()}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-sm font-bold text-navy dark:text-white">
          <PlayCircle className="h-5 w-5 text-indigo-500" /> 내 답변 영상 다시보기
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
      </button>

      {isOpen && (
        <div className="border-t border-line p-4 dark:border-white/10">
          {isLoading && (
            <div className="flex aspect-video max-h-[360px] items-center justify-center gap-2 rounded-xl bg-black/90 text-sm font-bold text-white">
              <Loader2 className="h-5 w-5 animate-spin" /> 영상을 불러오는 중입니다.
            </div>
          )}
          {!isLoading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-xs font-bold text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}
          {!isLoading && videoUrl && (
            <video
              key={answer.answerId}
              src={videoUrl}
              controls
              preload="metadata"
              playsInline
              className="aspect-video max-h-[360px] w-full rounded-xl bg-black object-contain"
              aria-label={`질문 ${answer.questionIndex + 1} 내 답변 영상`}
            >
              브라우저가 영상 재생을 지원하지 않습니다.
            </video>
          )}
        </div>
      )}
    </div>
  );
}
