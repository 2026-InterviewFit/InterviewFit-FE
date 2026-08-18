"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LocalParticipant } from "livekit-client";
import { Track } from "livekit-client";
import { uploadGroupAnswerVideo } from "@/lib/groupInterviewApi";
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

export function useGroupAnswerRecording({
  roomId,
  myUserId,
  localParticipant,
  progress,
  lastEvent,
}: UseGroupAnswerRecordingOptions) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const currentAnswerIdRef = useRef<number | null>(null);
  const recordingAnswerIdRef = useRef<number | null>(null);
  const isStoppingRef = useRef(false);
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

  const rememberAnswerId = useCallback((answerId: number | null | undefined) => {
    if (typeof answerId === "number" && Number.isFinite(answerId)) {
      currentAnswerIdRef.current = answerId;
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive" || isStoppingRef.current) return;

    isStoppingRef.current = true;
    try {
      recorder.stop();
    } catch (cause) {
      isStoppingRef.current = false;
      console.error("그룹 답변 녹화 종료 실패", cause);
      if (mountedRef.current) setRecordingError("답변 녹화를 종료하지 못했습니다.");
    }
  }, []);

  const startRecording = useCallback((answerId: number) => {
    if (recorderRef.current || isStoppingRef.current) return;

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
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        const stoppedAnswerId = recordingAnswerIdRef.current ?? answerId;
        const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });

        recorderRef.current = null;
        recordingAnswerIdRef.current = null;
        isStoppingRef.current = false;
        if (currentAnswerIdRef.current === stoppedAnswerId) currentAnswerIdRef.current = null;

        if (blob.size === 0) {
          console.error(`그룹 답변 영상이 비어 있습니다. (answerId: ${stoppedAnswerId})`);
          if (mountedRef.current) setRecordingError("녹화된 답변 영상이 비어 있어 업로드하지 못했습니다.");
          return;
        }
        void uploadVideo(stoppedAnswerId, blob);
      };
      recorder.onerror = (event) => {
        console.error("그룹 답변 녹화 오류", event);
        if (mountedRef.current) setRecordingError("답변 녹화 중 오류가 발생했습니다.");
      };

      currentAnswerIdRef.current = answerId;
      recordingAnswerIdRef.current = answerId;
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
      rememberAnswerId(eventAnswerId);
    }
  }, [lastEvent, myUserId, rememberAnswerId]);

  useEffect(() => {
    const isMyActiveAnswer = progress?.status?.toUpperCase() === "ANSWERING"
      && String(progress.currentParticipantUserId ?? "") === myUserId;

    if (isMyActiveAnswer) {
      const answerId = progress?.answerId ?? currentAnswerIdRef.current;
      rememberAnswerId(answerId);
      if (typeof answerId === "number") startRecording(answerId);
      return;
    }

    if (recorderRef.current?.state === "recording") stopRecording();
    else if (!isStoppingRef.current) currentAnswerIdRef.current = null;
  }, [myUserId, progress, rememberAnswerId, startRecording, stopRecording]);

  useEffect(() => {
    if (!lastEvent?.type.startsWith("ANSWER_TIMED_OUT_")) return;
    // 이 브라우저가 해당 답변을 녹화 중일 때만 종료한다. 진행 API는 호출하지 않는다.
    if (recorderRef.current && recordingAnswerIdRef.current != null) stopRecording();
  }, [lastEvent, stopRecording]);

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

  return {
    rememberAnswerId,
    stopRecording,
    uploadStatuses,
    recordingError,
    retryUpload,
  };
}
