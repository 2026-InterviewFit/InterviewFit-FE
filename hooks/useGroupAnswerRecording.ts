"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LocalParticipant } from "livekit-client";
import { Track } from "livekit-client";
import { uploadGroupAnswerVideo } from "@/lib/groupInterviewApi";
import { fixWebmBlobDuration, getSupportedWebmMimeType } from "@/lib/mediaRecorder";
import type { GroupInterviewEvent, GroupInterviewProgress } from "@/types/groupInterview";

export interface GroupVideoUploadStatus {
  answerId: number;
  status: "uploading" | "failed";
  error?: string;
}

interface UseGroupAnswerRecordingOptions {
  roomId: string;
  myUserId: string;
  localParticipant: LocalParticipant;
  progress: GroupInterviewProgress | null;
  lastEvent: GroupInterviewEvent | null;
}

interface AnswerRecordingContext {
  answerId: number;
  participantUserId: string;
  serverStartedAt: string | null;
  startedAtMs: number;
}

interface AnswerContextInput {
  answerId: number | null | undefined;
  participantUserId: number | string | null | undefined;
  serverStartedAt: string | null | undefined;
}

export function useGroupAnswerRecording({
  roomId,
  myUserId,
  localParticipant,
  progress,
  lastEvent,
}: UseGroupAnswerRecordingOptions) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const currentAnswerContextRef = useRef<AnswerContextInput | null>(null);
  const recordingContextRef = useRef<AnswerRecordingContext | null>(null);
  const isStoppingRef = useRef(false);
  const stopPromiseRef = useRef<Promise<AnswerRecordingContext | null> | null>(null);
  const resolveStopRef = useRef<((context: AnswerRecordingContext | null) => void) | null>(null);
  const timedOutAnswerIdsRef = useRef(new Set<number>());
  const uploadedAnswerIdsRef = useRef(new Set<number>());
  const uploadingAnswerIdsRef = useRef(new Set<number>());
  const pendingUploadBlobsRef = useRef(new Map<number, Blob>());
  const mountedRef = useRef(true);
  const [uploadStatuses, setUploadStatuses] = useState<GroupVideoUploadStatus[]>([]);
  const [recordingError, setRecordingError] = useState("");

  const setUploadStatus = useCallback((next: GroupVideoUploadStatus | null, answerId: number) => {
    if (!mountedRef.current) return;
    setUploadStatuses((statuses) => {
      const withoutCurrent = statuses.filter((item) => item.answerId !== answerId);
      return next ? [...withoutCurrent, next] : withoutCurrent;
    });
  }, []);

  const uploadVideo = useCallback(async (answerId: number, blob: Blob) => {
    if (uploadedAnswerIdsRef.current.has(answerId) || uploadingAnswerIdsRef.current.has(answerId)) return;

    pendingUploadBlobsRef.current.set(answerId, blob);
    uploadingAnswerIdsRef.current.add(answerId);
    setUploadStatus({ answerId, status: "uploading" }, answerId);

    try {
      await uploadGroupAnswerVideo(roomId, answerId, blob);
      uploadedAnswerIdsRef.current.add(answerId);
      pendingUploadBlobsRef.current.delete(answerId);
      setUploadStatus(null, answerId);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "답변 영상 업로드에 실패했습니다.";
      console.error(`그룹 답변 영상 업로드 실패 (answerId: ${answerId})`, cause);
      setUploadStatus({ answerId, status: "failed", error: message }, answerId);
    } finally {
      uploadingAnswerIdsRef.current.delete(answerId);
    }
  }, [roomId, setUploadStatus]);

  const rememberAnswerContext = useCallback((context: AnswerContextInput) => {
    if (typeof context.answerId === "number" && Number.isFinite(context.answerId)) {
      currentAnswerContextRef.current = context;
    }
  }, []);

  const stopRecording = useCallback((): Promise<AnswerRecordingContext | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return Promise.resolve(null);
    if (isStoppingRef.current) return stopPromiseRef.current ?? Promise.resolve(null);

    isStoppingRef.current = true;
    stopPromiseRef.current = new Promise((resolve) => {
      resolveStopRef.current = resolve;
    });
    try {
      recorder.stop();
    } catch (cause) {
      isStoppingRef.current = false;
      resolveStopRef.current?.(null);
      resolveStopRef.current = null;
      console.error("그룹 답변 녹화 종료 실패", cause);
      if (mountedRef.current) setRecordingError("답변 녹화를 종료하지 못했습니다.");
    }
    return stopPromiseRef.current;
  }, []);

  const startRecording = useCallback((input: AnswerContextInput) => {
    if (recorderRef.current || isStoppingRef.current) return;
    if (typeof input.answerId !== "number") return;

    const recordingContext: AnswerRecordingContext = {
      answerId: input.answerId,
      participantUserId: String(input.participantUserId ?? ""),
      serverStartedAt: input.serverStartedAt ?? null,
      startedAtMs: Date.now(),
    };

    const cameraTrack = localParticipant.getTrackPublication(Track.Source.Camera)?.track?.mediaStreamTrack;
    const microphoneTrack = localParticipant.getTrackPublication(Track.Source.Microphone)?.track?.mediaStreamTrack;
    if (!cameraTrack && !microphoneTrack) {
      setRecordingError("녹화할 카메라 또는 마이크 트랙이 없습니다.");
      return;
    }

    const stream = new MediaStream(
      [cameraTrack, microphoneTrack].filter((track): track is MediaStreamTrack => Boolean(track)),
    );
    const chunks: Blob[] = [];

    try {
      const mimeType = getSupportedWebmMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        const stoppedContext = recordingContextRef.current ?? recordingContext;
        const rawBlob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });

        recorderRef.current = null;
        recordingContextRef.current = null;
        isStoppingRef.current = false;
        if (currentAnswerContextRef.current?.answerId === stoppedContext.answerId) {
          currentAnswerContextRef.current = null;
        }

        if (rawBlob.size === 0) {
          console.error(`그룹 답변 영상이 비어 있습니다. (answerId: ${stoppedContext.answerId})`);
          if (mountedRef.current) setRecordingError("녹화된 답변 영상이 비어 있어 업로드하지 못했습니다.");
        } else {
          // progress가 이미 다음 답변자로 바뀌었더라도 녹화 시작 시 고정한 answerId를 사용한다.
          pendingUploadBlobsRef.current.set(stoppedContext.answerId, rawBlob);
          const durationMs = Math.max(1, Date.now() - stoppedContext.startedAtMs);
          void fixWebmBlobDuration(rawBlob, durationMs)
            .catch((cause) => {
              console.error(`그룹 답변 영상 길이 보정 실패 (answerId: ${stoppedContext.answerId})`, cause);
              return rawBlob;
            })
            .then((blob) => uploadVideo(stoppedContext.answerId, blob));
        }
        resolveStopRef.current?.(stoppedContext);
        resolveStopRef.current = null;
        stopPromiseRef.current = null;
      };
      recorder.onerror = (event) => {
        console.error("그룹 답변 녹화 오류", event);
        if (mountedRef.current) setRecordingError("답변 녹화 중 오류가 발생했습니다.");
      };

      currentAnswerContextRef.current = input;
      recordingContextRef.current = recordingContext;
      recorderRef.current = recorder;
      setRecordingError("");
      recorder.start(1000);
    } catch (cause) {
      console.error("그룹 답변 녹화 시작 실패", cause);
      setRecordingError("답변 녹화를 시작하지 못했습니다.");
    }
  }, [localParticipant, uploadVideo]);

  useEffect(() => {
    const eventAnswerId = lastEvent?.progress?.answerId ?? lastEvent?.answerId;
    if (
      lastEvent?.type === "ANSWER_STARTED"
      && String(lastEvent.progress?.currentParticipantUserId ?? "") === myUserId
    ) {
      rememberAnswerContext({
        answerId: eventAnswerId,
        participantUserId: lastEvent.progress?.currentParticipantUserId,
        serverStartedAt: lastEvent.progress?.answerStartedAt,
      });
    }
  }, [lastEvent, myUserId, rememberAnswerContext]);

  useEffect(() => {
    const isMyActiveAnswer = progress?.status?.toUpperCase() === "ANSWERING"
      && String(progress.currentParticipantUserId ?? "") === myUserId;

    if (isMyActiveAnswer) {
      const context: AnswerContextInput = {
        answerId: progress?.answerId ?? currentAnswerContextRef.current?.answerId,
        participantUserId: progress?.currentParticipantUserId,
        serverStartedAt: progress?.answerStartedAt,
      };
      rememberAnswerContext(context);
      startRecording(context);
      return;
    }

    if (recorderRef.current?.state === "recording") void stopRecording();
    else if (!isStoppingRef.current) currentAnswerContextRef.current = null;
  }, [myUserId, progress, rememberAnswerContext, startRecording, stopRecording]);

  useEffect(() => {
    if (!lastEvent?.type.startsWith("ANSWER_TIMED_OUT_")) return;
    // 이 브라우저가 해당 답변을 녹화 중일 때만 종료한다. 진행 API는 호출하지 않는다.
    if (
      recorderRef.current
      && recordingContextRef.current?.participantUserId === myUserId
    ) {
      timedOutAnswerIdsRef.current.add(recordingContextRef.current.answerId);
      void stopRecording();
    }
  }, [lastEvent, myUserId, stopRecording]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasUnsentVideo = recorderRef.current != null
        || isStoppingRef.current
        || pendingUploadBlobsRef.current.size > 0
        || uploadingAnswerIdsRef.current.size > 0;
      if (!hasUnsentVideo) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const recorder = recorderRef.current;
      if (recorder?.state === "recording" && !isStoppingRef.current) {
        isStoppingRef.current = true;
        recorder.stop();
      }
    };
  }, []);

  const retryUpload = useCallback((answerId: number) => {
    const blob = pendingUploadBlobsRef.current.get(answerId);
    if (blob) void uploadVideo(answerId, blob);
  }, [uploadVideo]);

  const wasAnswerTimedOut = useCallback(
    (answerId: number) => timedOutAnswerIdsRef.current.has(answerId),
    [],
  );

  return {
    rememberAnswerContext,
    stopRecording,
    uploadStatuses,
    recordingError,
    retryUpload,
    wasAnswerTimedOut,
  };
}
