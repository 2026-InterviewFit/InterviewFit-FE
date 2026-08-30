"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LocalParticipant, LocalTrackPublication } from "livekit-client";
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
  audioTrack: MediaStreamTrack;
  microphonePublication: LocalTrackPublication;
}

export interface GroupRecordingStopResult extends AnswerRecordingContext {
  videoCreated: boolean;
}

interface AnswerContextInput {
  answerId: number | null | undefined;
  participantUserId: number | string | null | undefined;
  serverStartedAt: string | null | undefined;
}

const AUDIO_LEVEL_CHECK_MS = 1500;
const RECORDING_TAIL_BUFFER_MS = 250;
// 약 -66dBFS. 조용한 환경의 작은 입력도 허용하되 사실상 무음인 트랙은 거른다.
const MIN_AUDIO_RMS = 0.0005;

function checkAudioInputLevel(track: MediaStreamTrack): Promise<boolean> {
  return new Promise((resolve) => {
    const AudioContextClass = window.AudioContext;
    const audioContext = new AudioContextClass();
    const source = audioContext.createMediaStreamSource(new MediaStream([track]));
    const analyser = audioContext.createAnalyser();
    const samples = new Float32Array(analyser.fftSize);
    let settled = false;
    let animationFrame = 0;
    let timer = 0;

    const finish = (detected: boolean) => {
      if (settled) return;
      settled = true;
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(timer);
      source.disconnect();
      analyser.disconnect();
      void audioContext.close();
      resolve(detected);
    };

    const sample = () => {
      if (!track.enabled || track.muted || track.readyState !== "live") {
        finish(false);
        return;
      }
      analyser.getFloatTimeDomainData(samples);
      const sumSquares = samples.reduce((sum, value) => sum + value * value, 0);
      if (Math.sqrt(sumSquares / samples.length) >= MIN_AUDIO_RMS) {
        finish(true);
        return;
      }
      animationFrame = window.requestAnimationFrame(sample);
    };

    source.connect(analyser);
    timer = window.setTimeout(() => finish(false), AUDIO_LEVEL_CHECK_MS);
    void audioContext.resume().then(sample).catch(() => finish(false));
  });
}

export function useGroupAnswerRecording({
  roomId,
  myUserId,
  localParticipant,
  progress,
  lastEvent,
}: UseGroupAnswerRecordingOptions) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const isStartingRef = useRef(false);
  const currentAnswerContextRef = useRef<AnswerContextInput | null>(null);
  const recordingContextRef = useRef<AnswerRecordingContext | null>(null);
  const isStoppingRef = useRef(false);
  const stopPromiseRef = useRef<Promise<GroupRecordingStopResult | null> | null>(null);
  const resolveStopRef = useRef<((result: GroupRecordingStopResult | null) => void) | null>(null);
  const recordingErrorAnswerIdsRef = useRef(new Set<number>());
  const timedOutAnswerIdsRef = useRef(new Set<number>());
  const uploadedAnswerIdsRef = useRef(new Set<number>());
  const uploadingAnswerIdsRef = useRef(new Set<number>());
  const pendingUploadBlobsRef = useRef(new Map<number, Blob>());
  const recordingStartAttemptRef = useRef(0);
  const mountedRef = useRef(true);
  const [uploadStatuses, setUploadStatuses] = useState<GroupVideoUploadStatus[]>([]);
  const [recordingError, setRecordingError] = useState("");
  const [isCheckingAudio, setIsCheckingAudio] = useState(false);
  const [canRetryRecording, setCanRetryRecording] = useState(false);
  const [recordingFailureAnswerId, setRecordingFailureAnswerId] = useState<number | null>(null);

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

  const stopRecording = useCallback((): Promise<GroupRecordingStopResult | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return Promise.resolve(null);
    if (isStoppingRef.current) return stopPromiseRef.current ?? Promise.resolve(null);

    isStoppingRef.current = true;
    const stopPromise = new Promise<GroupRecordingStopResult | null>((resolve) => {
      resolveStopRef.current = resolve;
    });
    stopPromiseRef.current = stopPromise;
    try {
      recorder.stop();
    } catch (cause) {
      isStoppingRef.current = false;
      resolveStopRef.current?.(null);
      resolveStopRef.current = null;
      stopPromiseRef.current = null;
      console.error("그룹 답변 녹화 종료 실패", cause);
      if (mountedRef.current) setRecordingError("답변 녹화를 종료하지 못했습니다.");
    }
    return stopPromise;
  }, []);

  const startRecording = useCallback(async (input: AnswerContextInput) => {
    if (recorderRef.current || isStartingRef.current || isStoppingRef.current) return;
    if (typeof input.answerId !== "number") return;
    isStartingRef.current = true;
    const startAttempt = ++recordingStartAttemptRef.current;
    setIsCheckingAudio(true);
    setCanRetryRecording(false);

    const microphonePublication = localParticipant.getTrackPublication(Track.Source.Microphone);
    const localMicrophoneTrack = microphonePublication?.track;
    const microphoneTrack = localMicrophoneTrack?.mediaStreamTrack;
    const microphoneUnavailable = !microphonePublication
      || !localMicrophoneTrack
      || microphonePublication.isMuted
      || localMicrophoneTrack.isMuted
      || !microphoneTrack
      || microphoneTrack.kind !== "audio"
      || !microphoneTrack.enabled
      || microphoneTrack.muted
      || microphoneTrack.readyState === "ended";
    if (microphoneUnavailable) {
      isStartingRef.current = false;
      setIsCheckingAudio(false);
      setCanRetryRecording(true);
      setRecordingFailureAnswerId(input.answerId);
      setRecordingError("마이크 입력이 감지되지 않습니다. 마이크 권한/음소거/입력 장치를 확인해주세요.");
      return;
    }

    const cameraTrack = localParticipant.getTrackPublication(Track.Source.Camera)?.track?.mediaStreamTrack;
    const stream = new MediaStream(
      [cameraTrack?.readyState === "live" ? cameraTrack : null, microphoneTrack]
        .filter((track): track is MediaStreamTrack => Boolean(track)),
    );
    const streamAudioTrack = stream.getAudioTracks()[0];
    if (
      stream.getAudioTracks().length === 0
      || streamAudioTrack !== microphoneTrack
      || microphonePublication.isMuted
      || localMicrophoneTrack.isMuted
      || !streamAudioTrack.enabled
      || streamAudioTrack.muted
      || streamAudioTrack.readyState !== "live"
    ) {
      isStartingRef.current = false;
      setIsCheckingAudio(false);
      setCanRetryRecording(true);
      setRecordingFailureAnswerId(input.answerId);
      setRecordingError("마이크 입력이 감지되지 않습니다. 마이크 권한/음소거/입력 장치를 확인해주세요.");
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[Group Recording] 녹화 시작 직전 audio tracks",
        stream.getAudioTracks().map((track) => {
          const settings = track.getSettings() as MediaTrackSettings & { voiceIsolation?: boolean };
          return {
            label: track.label,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState,
            settings,
            sampleRate: settings.sampleRate,
            channelCount: settings.channelCount,
            echoCancellation: settings.echoCancellation,
            noiseSuppression: settings.noiseSuppression,
            autoGainControl: settings.autoGainControl,
            voiceIsolation: settings.voiceIsolation,
          };
        }),
        { audioTrackCount: stream.getAudioTracks().length },
      );
    }

    const recordingContext: AnswerRecordingContext = {
      answerId: input.answerId,
      participantUserId: String(input.participantUserId ?? ""),
      serverStartedAt: input.serverStartedAt ?? null,
      startedAtMs: Date.now(),
      audioTrack: microphoneTrack,
      microphonePublication,
    };
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

        const videoCreated = rawBlob.size > 0
          && !recordingErrorAnswerIdsRef.current.has(stoppedContext.answerId);
        recordingErrorAnswerIdsRef.current.delete(stoppedContext.answerId);

        const resolveStoppedRecording = () => {
          resolveStopRef.current?.({ ...stoppedContext, videoCreated });
          resolveStopRef.current = null;
          stopPromiseRef.current = null;
        };

        if (!videoCreated) {
          console.error(`그룹 답변 영상이 비어 있습니다. (answerId: ${stoppedContext.answerId})`);
          if (mountedRef.current) setRecordingError("녹화된 답변 영상이 비어 있어 업로드하지 못했습니다.");
          resolveStoppedRecording();
        } else {
          // 업로드 실패는 상태만 남기고 완료되므로, 호출자는 그 후 answer-complete로 진행할 수 있다.
          pendingUploadBlobsRef.current.set(stoppedContext.answerId, rawBlob);
          const durationMs = Math.max(1, Date.now() - stoppedContext.startedAtMs);
          void fixWebmBlobDuration(rawBlob, durationMs)
            .catch((cause) => {
              console.error(`그룹 답변 영상 길이 보정 실패 (answerId: ${stoppedContext.answerId})`, cause);
              return rawBlob;
            })
            .then((blob) => uploadVideo(stoppedContext.answerId, blob))
            .finally(resolveStoppedRecording);
        }
      };
      recorder.onerror = (event) => {
        console.error("그룹 답변 녹화 오류", event);
        recordingErrorAnswerIdsRef.current.add(recordingContext.answerId);
        if (mountedRef.current) setRecordingError("답변 녹화 중 오류가 발생했습니다.");
      };

      currentAnswerContextRef.current = input;
      recordingContextRef.current = recordingContext;
      recorderRef.current = recorder;
      setRecordingError("");
      setRecordingFailureAnswerId(null);
      // 답변 첫 음절을 놓치지 않도록 chunking 없이 즉시 녹화를 시작한다.
      recorder.start();
      isStartingRef.current = false;
      setCanRetryRecording(false);

      // 음량 확인은 녹화와 병렬로 수행하며, 낮은 음량만으로 녹화를 지연하거나 중단하지 않는다.
      void checkAudioInputLevel(microphoneTrack)
        .catch(() => false)
        .then((hasAudioInput) => {
          if (!mountedRef.current || startAttempt !== recordingStartAttemptRef.current) return;
          setIsCheckingAudio(false);
          if (!hasAudioInput && recorderRef.current === recorder && recorder.state === "recording") {
            console.warn("[Group Recording] 녹화는 진행 중이지만 마이크 음량이 감지되지 않습니다.");
            setRecordingError("녹화는 진행 중이지만 마이크 음량이 낮습니다. 마이크 입력 장치를 확인해주세요.");
          }
        });
    } catch (cause) {
      recorderRef.current = null;
      recordingContextRef.current = null;
      isStartingRef.current = false;
      isStoppingRef.current = false;
      setIsCheckingAudio(false);
      setCanRetryRecording(true);
      setRecordingFailureAnswerId(input.answerId);
      console.error("그룹 답변 녹화 시작 실패", cause);
      setRecordingError("답변 녹화를 시작하지 못했습니다.");
    }
  }, [localParticipant, uploadVideo]);

  const stopRecordingForAnswer = useCallback((answerId: number) => {
    const recorder = recorderRef.current;
    const context = recordingContextRef.current;
    if (
      !Number.isFinite(answerId)
      || !recorder
      || recorder.state !== "recording"
      || !context
      || context.answerId !== answerId
      || context.microphonePublication.isMuted
      || context.audioTrack.kind !== "audio"
      || !context.audioTrack.enabled
      || context.audioTrack.muted
      || context.audioTrack.readyState !== "live"
      || !recorder.stream.getAudioTracks().includes(context.audioTrack)
    ) {
      if (mountedRef.current) {
        setRecordingError("마이크 입력이 감지되지 않습니다. 마이크 권한/음소거/입력 장치를 확인해주세요.");
      }
      if (recorder?.state === "recording" && context?.answerId === answerId) {
        // 실패한 녹화의 잔여 chunk가 skip 후 업로드되지 않도록 실패로 표시하고 먼저 정지한다.
        recordingErrorAnswerIdsRef.current.add(answerId);
        return stopRecording().then(() => null);
      }
      return Promise.resolve(null);
    }
    return new Promise<GroupRecordingStopResult | null>((resolve) => {
      window.setTimeout(() => {
        void stopRecording().then(resolve);
      }, RECORDING_TAIL_BUFFER_MS);
    });
  }, [stopRecording]);

  const retryRecording = useCallback(() => {
    const context = currentAnswerContextRef.current;
    if (!context || typeof context.answerId !== "number") {
      setRecordingError("현재 답변 정보를 확인할 수 없어 녹화를 다시 시작할 수 없습니다.");
      return;
    }
    void startRecording(context);
  }, [startRecording]);

  const canStartRecording = useCallback(() => {
    const publication = localParticipant.getTrackPublication(Track.Source.Microphone);
    const track = publication?.track;
    const mediaTrack = track?.mediaStreamTrack;
    return Boolean(
      publication
      && track
      && !publication.isMuted
      && !track.isMuted
      && mediaTrack
      && mediaTrack.kind === "audio"
      && mediaTrack.enabled
      && !mediaTrack.muted
      && mediaTrack.readyState === "live",
    );
  }, [localParticipant]);

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
      void startRecording(context);
      return;
    }

    recordingStartAttemptRef.current += 1;
    isStartingRef.current = false;
    setIsCheckingAudio(false);
    setCanRetryRecording(false);
    setRecordingFailureAnswerId(null);
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
      recordingStartAttemptRef.current += 1;
      isStartingRef.current = false;
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
    stopRecordingForAnswer,
    retryRecording,
    canStartRecording,
    isCheckingAudio,
    canRetryRecording,
    uploadStatuses,
    recordingError,
    recordingFailureAnswerId,
    retryUpload,
    wasAnswerTimedOut,
  };
}
