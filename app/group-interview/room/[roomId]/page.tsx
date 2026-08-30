"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoomConnection } from "@/hooks/useRoomConnection";
import { useGroupAnswerRecording, type GroupVideoUploadStatus } from "@/hooks/useGroupAnswerRecording";
import ParticipantGrid from "@/components/group-interview/room/ParticipantGrid";
import Navbar from "@/components/shared/Navbar";
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Sparkles, Bot, ChevronRight, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  completeGroupAnswer,
  finishGroupInterview,
  getGroupParticipants,
  getGroupRoom,
  getLiveKitCredentials,
  GroupInterviewApiError,
  joinGroupRoom,
  skipGroupAnswer,
  startGroupAnswer,
  startGroupInterview,
} from "@/lib/groupInterviewApi";
import GroupAnalyzing from "@/components/group-interview/room/GroupAnalyzing";
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant } from "@livekit/components-react";
import { getAuthUser, initializeAuth } from "@/lib/auth";
import type { LiveKitCredentials } from "@/types/groupInterview";
import {
  GROUP_INTERVIEW_TOTAL_ROUNDS,
  groupInterviewRoundLabel,
} from "@/lib/groupInterviewData";

const INTERVIEW_TIPS = [
  "모르는 질문이 나오면 '잠시 생각할 시간을 주시겠습니까?'라고 정중히 요청하세요.",
  "결과보다는 과정! 협업 시 문제를 어떻게 해결했는지 구체적으로 대답해보세요.",
  "면접관의 눈을 맞추는 것이 부담스럽다면 미간이나 코를 바라보세요.",
  "다른 지원자가 답변할 때에도 경청하는 태도를 유지하는 것이 좋습니다."
];

function GroupVideoUploadNotice({
  statuses,
  onRetry,
}: {
  statuses: GroupVideoUploadStatus[];
  onRetry: (answerId: number) => void;
}) {
  if (statuses.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[70] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {statuses.map((item) => (
        <div
          key={item.answerId}
          className={`rounded-2xl border p-4 shadow-lg ${
            item.status === "failed"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-blue-200 bg-blue-50 text-blue-700"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold">
                {item.status === "failed" ? "답변 영상 업로드 실패" : "답변 영상 업로드 중"}
              </p>
              <p className="mt-1 text-xs opacity-80">
                답변 #{item.answerId}{item.error ? ` · ${item.error}` : ""}
              </p>
            </div>
            {item.status === "failed" && (
              <button
                type="button"
                onClick={() => onRetry(item.answerId)}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-bold shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" /> 재시도
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GroupInterviewRoomPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const roomId = params.roomId;
  const [credentials, setCredentials] = useState<LiveKitCredentials | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const enter = async () => {
      const me = await initializeAuth();
      if (!me) {
        router.replace("/login");
        return;
      }
      try {
        await getGroupRoom(roomId);
        const participants = await getGroupParticipants(roomId);
        const alreadyJoined = participants.some((participant) => participant.userId === String(me?.id));
        if (!alreadyJoined) {
          try {
            await joinGroupRoom(roomId);
          } catch (cause) {
            if (!(cause instanceof GroupInterviewApiError) || !/\uc774\ubbf8|already/i.test(cause.message)) throw cause;
            const refreshed = await getGroupParticipants(roomId);
            if (!refreshed.some((participant) => participant.userId === String(me?.id))) throw cause;
          }
        }
        const value = await getLiveKitCredentials(roomId);
        if (!cancelled) setCredentials(value);
      } catch (cause) {
        if (cause instanceof GroupInterviewApiError && cause.status === 401) {
          router.replace("/login");
          return;
        }
        if (!cancelled) setError(cause instanceof Error ? cause.message : "\ubc29\uc5d0 \uc785\uc7a5\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
      }
    };
    void enter();
    return () => { cancelled = true; };
  }, [roomId, router]);

  if (error) return <main className="flex min-h-screen items-center justify-center bg-bg p-6"><div className="rounded-2xl border border-red-100 bg-white p-8 text-center"><p className="font-bold text-red-600">{error}</p><button className="mt-5 rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white" onClick={() => router.push("/group-interview")}>\ubaa9\ub85d\uc73c\ub85c</button></div></main>;
  if (!credentials) return <main className="flex min-h-screen items-center justify-center bg-bg text-sm font-bold text-muted">\uba74\uc811\ubc29\uc5d0 \uc5f0\uacb0\ud558\ub294 \uc911...</main>;

  return <LiveKitRoom serverUrl={credentials.url} token={credentials.token} connect audio video onError={(cause) => setError(cause.message)}><RoomAudioRenderer /><GroupInterviewRoom roomId={roomId} /></LiveKitRoom>;
}

function GroupInterviewRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const me = getAuthUser();
  const { localParticipant } = useLocalParticipant();
  const {
    participants,
    progress,
    lastEvent,
    connectionError,
    isReadyUpdating,
    toggleReady,
    toggleCamera,
    toggleMic,
    isAllReady,
  } = useRoomConnection(roomId);
  const cameraOn = localParticipant.isCameraEnabled;
  const micOn = localParticipant.isMicrophoneEnabled;

  const [tipIndex, setTipIndex] = useState(0);
  const [pendingAnswerAction, setPendingAnswerAction] = useState<"start" | "complete" | null>(null);
  const [requestedActionKey, setRequestedActionKey] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [recordingFallbackNotice, setRecordingFallbackNotice] = useState("");
  const terminalAnswerKeysRef = useRef(new Set<string>());
  const syncedParticipants = participants;

  const currentQuestion = progress?.currentQuestionText || "질문을 불러오는 중입니다.";
  const currentSpeaker = syncedParticipants.find(
    (participant) => participant.userId === String(progress?.currentParticipantUserId ?? ""),
  );
  const isMyTurn = progress?.currentParticipantUserId != null
    && String(progress.currentParticipantUserId) === String(me?.id ?? "");
  const currentQuestionIndex = progress?.currentQuestionIndex;
  const currentRound = progress?.currentRound;
  const currentRoundLabel = groupInterviewRoundLabel(currentRound);
  const meParticipant = syncedParticipants.find((participant) => participant.isMe);
  const isHost = !!meParticipant?.isHost;
  const serverStatus = progress?.status ?? "WAITING";
  const isQuestionView = serverStatus === "QUESTION_VIEW";
  const isAnswering = serverStatus === "ANSWERING";
  // 면접 종료는 라운드 숫자가 아니라 백엔드 세션 상태로만 판단한다.
  const isFinished = serverStatus === "FINISHED";
  const isAnalyzing = isFinished;
  const isInterviewing = !["WAITING", "READY", "FINISHED"].includes(serverStatus);
  const answerActionKey = [
    serverStatus,
    progress?.currentParticipantUserId ?? "",
    progress?.currentQuestionIndex ?? "",
    progress?.answerStartedAt ?? "",
  ].join(":");
  const {
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
  } = useGroupAnswerRecording({
    roomId,
    myUserId: String(me?.id ?? ""),
    localParticipant,
    progress,
    lastEvent,
  });

  const terminalAnswerKey = useCallback((answerId?: number | null) => (
    typeof answerId === "number" && Number.isFinite(answerId)
      ? `answer:${answerId}`
      : `turn:${progress?.currentRound ?? ""}:${progress?.currentQuestionIndex ?? ""}:${progress?.currentParticipantUserId ?? ""}`
  ), [progress?.currentParticipantUserId, progress?.currentQuestionIndex, progress?.currentRound]);

  const skipRecordingFailed = useCallback(async (answerId?: number | null) => {
    const key = terminalAnswerKey(answerId);
    if (terminalAnswerKeysRef.current.has(key)) return;
    terminalAnswerKeysRef.current.add(key);
    setRequestedActionKey(answerActionKey);
    setPendingAnswerAction("complete");
    setAnswerError("");
    setRecordingFallbackNotice("음성/영상이 정상적으로 저장되지 않아 해당 답변의 분석이 제공되지 않을 수 있지만 면접은 계속 진행됩니다.");
    try {
      await skipGroupAnswer(roomId, "RECORDING_FAILED");
    } catch (cause) {
      terminalAnswerKeysRef.current.delete(key);
      setRequestedActionKey("");
      setAnswerError(cause instanceof Error ? cause.message : "녹화 실패 답변을 건너뛰지 못했습니다.");
    } finally {
      setPendingAnswerAction(null);
    }
  }, [answerActionKey, roomId, terminalAnswerKey]);

  useEffect(() => {
    const tipTimer = setInterval(() => setTipIndex((prev) => (prev + 1) % INTERVIEW_TIPS.length), 6000);
    return () => clearInterval(tipTimer);
  }, []);

  useEffect(() => {
    if (!isMyTurn || !isAnswering || recordingFailureAnswerId == null) return;
    const timer = window.setTimeout(() => {
      void skipRecordingFailed(recordingFailureAnswerId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isAnswering, isMyTurn, recordingFailureAnswerId, skipRecordingFailed]);

  useEffect(() => {
    const deadline = progress?.answerDeadlineAt ? Date.parse(progress.answerDeadlineAt) : Number.NaN;
    if (!isAnswering || !Number.isFinite(deadline)) return;

    const updateRemainingTime = () => {
      setRemainingSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    };
    const initialTimer = window.setTimeout(updateRemainingTime, 0);
    const timer = window.setInterval(updateRemainingTime, 250);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [isAnswering, progress?.answerDeadlineAt]);

  const handleFinish = async () => {
    try {
      setAnswerError("");
      if (isMyTurn) await stopRecording();
      await finishGroupInterview(roomId);
    } catch (cause) {
      setAnswerError(cause instanceof Error ? cause.message : "면접을 종료하지 못했습니다.");
      alert(cause instanceof Error ? cause.message : "면접을 종료하지 못했습니다.");
    }
  };

  const handleStartAnswer = async () => {
    if (!isMyTurn || !isQuestionView || pendingAnswerAction || requestedActionKey === answerActionKey) return;

    try {
      setRecordingFallbackNotice("");
      if (!canStartRecording()) {
        await skipRecordingFailed(progress?.answerId);
        return;
      }
      setRequestedActionKey(answerActionKey);
      setPendingAnswerAction("start");
      setAnswerError("");
      const started = await startGroupAnswer(roomId);
      rememberAnswerContext({
        answerId: started.answerId,
        participantUserId: started.currentParticipantUserId,
        serverStartedAt: started.answerStartedAt,
      });
      // ANSWERING 전환과 녹화 시작은 ANSWER_STARTED의 progress를 받은 뒤 일어난다.
    } catch (cause) {
      setRequestedActionKey("");
      setAnswerError(cause instanceof Error ? cause.message : "답변을 시작하지 못했습니다.");
    } finally {
      setPendingAnswerAction(null);
    }
  };

  const handleCompleteAnswer = async () => {
    if (!isMyTurn || !isAnswering || pendingAnswerAction || requestedActionKey === answerActionKey) return;

    try {
      setPendingAnswerAction("complete");
      setAnswerError("");
      setRecordingFallbackNotice("");
      const answerId = progress?.answerId;
      if (typeof answerId !== "number" || !Number.isFinite(answerId)) {
        setAnswerError("현재 답변 정보를 확인할 수 없어 답변을 완료할 수 없습니다.");
        return;
      }
      // Blob 생성과 영상 업로드 시도를 마친 뒤 성공 여부에 따라 완료 또는 fallback으로 진행한다.
      const stoppedContext = await stopRecordingForAnswer(answerId);
      if (!stoppedContext || stoppedContext.answerId !== answerId || !stoppedContext.videoCreated) {
        await skipRecordingFailed(answerId);
        return;
      }
      if (wasAnswerTimedOut(stoppedContext.answerId)) return;
      const terminalKey = terminalAnswerKey(answerId);
      if (terminalAnswerKeysRef.current.has(terminalKey)) return;
      terminalAnswerKeysRef.current.add(terminalKey);
      setRequestedActionKey(answerActionKey);
      try {
        await completeGroupAnswer(roomId);
      } catch (cause) {
        terminalAnswerKeysRef.current.delete(terminalKey);
        throw cause;
      }
    } catch (cause) {
      setRequestedActionKey("");
      setAnswerError(cause instanceof Error ? cause.message : "답변 완료를 처리하지 못했습니다.");
    } finally {
      setPendingAnswerAction(null);
    }
  };

  const handleStartInterview = async () => {
    try {
      await startGroupInterview(roomId);
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : "면접을 시작하지 못했습니다.");
    }
  };

  const isMeReady = syncedParticipants.find((p) => p.isMe)?.isReady;

  if (isAnalyzing) {
    return (
      <>
        <GroupAnalyzing roomId={roomId} onDone={() => {
          if (uploadStatuses.some((item) => item.status === "uploading")) {
            alert("답변 영상 업로드가 끝난 뒤 이동해주세요.");
            return;
          }
          if (uploadStatuses.some((item) => item.status === "failed")) {
            alert("일부 답변 영상이 저장되지 않아 해당 답변의 분석이 제공되지 않을 수 있습니다.");
          }
          router.push("/mypage/dashboard");
        }} />
        <GroupVideoUploadNotice statuses={uploadStatuses} onRetry={retryUpload} />
      </>
    );
  }

  // ── 1. 실전 면접 진행 화면 ──
  if (isInterviewing) {
    return (
      <main className="fixed inset-0 z-50 flex flex-col bg-bg text-ink overflow-hidden transition-colors duration-300 dark:bg-[#0f1729] dark:text-white">
        <GroupVideoUploadNotice statuses={uploadStatuses} onRetry={retryUpload} />
        {/* 밝은 블롭 배경 */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40 dark:opacity-25">
          <div className="absolute -left-20 top-10 h-[500px] w-[500px] rounded-full bg-[#E7F1A8]/40 blur-[140px]" />
          <div className="absolute right-0 top-1/3 h-[600px] w-[600px] rounded-full bg-[#95B1EE]/40 blur-[160px]" />
        </div>

        {/* 상단 바 */}
        <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-line px-4 md:px-8 py-4 dark:border-white/10">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold text-red-500 border border-red-100 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30">
              <span className="h-1.5 w-1.5 md:h-2 md:w-2 animate-pulse rounded-full bg-red-500" /> REC
            </span>
            <span className="text-xs md:text-sm font-bold text-navy dark:text-white">실시간 다대일 면접 진행 중</span>
            <span className="text-[10px] font-bold text-muted md:text-[11px]">
              <span className="hidden sm:inline">
                {currentQuestionIndex != null ? `질문 ${currentQuestionIndex + 1} · ` : ""}
              </span>
              {currentRound != null
                ? `${currentRound}라운드 / ${GROUP_INTERVIEW_TOTAL_ROUNDS}라운드 · ${currentRoundLabel}`
                : currentRoundLabel}
            </span>
            {isAnswering && progress?.answerDeadlineAt && (
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${remainingSeconds <= 10 ? "bg-red-100 text-red-600" : "bg-chip text-navy"}`}>
                남은 시간 {remainingSeconds}초
              </span>
            )}
          </div>
          <div className="flex gap-2 md:gap-4">
            <div className="flex gap-1 md:gap-2">
              <button onClick={toggleMic} className={`p-2.5 md:p-3 rounded-full transition-colors ${micOn ? "bg-chip text-navy hover:bg-brand-soft/20 dark:bg-white/10 dark:text-white" : "bg-red-50 text-red-500 dark:bg-red-500/20 dark:text-red-400"}`}>
                {micOn ? <Mic className="h-4 w-4 md:h-5 md:w-5" /> : <MicOff className="h-4 w-4 md:h-5 md:w-5" />}
              </button>
              <button onClick={toggleCamera} className={`p-2.5 md:p-3 rounded-full transition-colors ${cameraOn ? "bg-chip text-navy hover:bg-brand-soft/20 dark:bg-white/10 dark:text-white" : "bg-red-50 text-red-500 dark:bg-red-500/20 dark:text-red-400"}`}>
                {cameraOn ? <Camera className="h-4 w-4 md:h-5 md:w-5" /> : <CameraOff className="h-4 w-4 md:h-5 md:w-5" />}
              </button>
            </div>
            <div className="w-px h-6 md:h-8 bg-line dark:bg-white/10 my-auto mx-1 md:mx-2" />
            {isHost && (
              <button onClick={() => void handleFinish()} className="flex items-center gap-1.5 md:gap-2 bg-red-500 hover:bg-red-600 px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold text-white transition-transform hover:scale-105">
                <PhoneOff className="h-3 w-3 md:h-4 md:w-4" /> 면접 종료
              </button>
            )}
          </div>
        </div>

        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-6">
            {/* AI 면접관 질문 배너 (밝은 카드) */}
            <div className="flex items-start gap-4 rounded-[24px] border border-line bg-surface p-5 md:p-6 shadow-sm dark:bg-[#1e293b] dark:border-white/10">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#364C84] to-[#95B1EE] text-3xl shadow-md">
                🤖
                <span className="absolute inset-0 rounded-2xl border-2 border-brand-soft/50 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-navy" />
                  <span className="text-xs font-bold uppercase tracking-widest text-navy">AI 면접관</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={progress?.currentQuestionId ?? currentQuestionIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-base md:text-lg font-bold leading-relaxed text-ink dark:text-white break-keep"
                  >
                    {currentQuestion}
                  </motion.p>
                </AnimatePresence>
                <p className="mt-2 text-xs font-medium text-muted">
                  현재 <span className="font-bold text-navy">{currentSpeaker?.nickname ?? "-"}</span> 님의 답변 순서입니다.
                </p>
              </div>
            </div>

            <ParticipantGrid
              participants={syncedParticipants}
              activeSpeakerId={currentSpeaker?.userId}
            />
          </div>
        </div>

        {/* 하단 컨트롤 */}
        <div className="relative z-10 flex shrink-0 items-center justify-between gap-4 border-t border-line px-4 md:px-8 py-4 dark:border-white/10">
          <p className="text-xs font-medium text-muted">
            {answerError || recordingFallbackNotice || recordingError || (isMyTurn
              ? isQuestionView
                ? "질문을 확인한 뒤 답변을 시작해주세요."
                : isAnswering
                  ? "답변을 마치면 '답변 완료'를 눌러주세요."
                  : "서버의 다음 진행 상태를 기다리고 있습니다."
              : "다른 지원자의 답변을 경청하세요.")}
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={!isMyTurn
                || (!isQuestionView && !isAnswering)
                || pendingAnswerAction !== null
                || isCheckingAudio
                || requestedActionKey === answerActionKey}
              onClick={() => void (isQuestionView
                ? handleStartAnswer()
                : canRetryRecording
                  ? retryRecording()
                  : handleCompleteAnswer())}
              className="flex items-center gap-1.5 rounded-full bg-navy px-6 md:px-8 py-2.5 md:py-3 text-sm font-bold text-white shadow-md transition-transform enabled:hover:scale-105 enabled:hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pendingAnswerAction
                ? "처리 중..."
                : isCheckingAudio
                  ? "마이크 확인 중..."
                : isQuestionView
                  ? "답변 시작"
                  : canRetryRecording
                    ? "녹화 다시 시도"
                  : "답변 완료"} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── 2. 대기방(Lobby) 화면 ──
  return (
    <main className="fixed inset-0 flex flex-col bg-bg dark:bg-[#0f1729] transition-colors duration-300 overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row pt-[64px] md:pt-[80px] min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto flex flex-col min-h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-navy dark:text-white tracking-tight">그룹 면접 대기실</h1>
                <p className="mt-1.5 text-sm font-medium text-muted">카메라와 마이크를 확인하고, 전원 준비가 완료되면 시작됩니다.</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex bg-surface dark:bg-white/5 p-1.5 rounded-2xl border border-line dark:border-white/10 shadow-sm">
                  <button onClick={toggleMic} className={`p-3 rounded-xl transition-colors ${micOn ? "text-navy dark:text-white hover:bg-chip dark:hover:bg-white/10" : "bg-red-50 dark:bg-red-500/20 text-red-500"}`}>
                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </button>
                  <button onClick={toggleCamera} className={`p-3 rounded-xl transition-colors ${cameraOn ? "text-navy dark:text-white hover:bg-chip dark:hover:bg-white/10" : "bg-red-50 dark:bg-red-500/20 text-red-500"}`}>
                    {cameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
                  </button>
                </div>

                <button
                  disabled={isReadyUpdating}
                  onClick={() => void toggleReady()}
                  className={`px-8 py-4 rounded-2xl text-[15px] font-bold transition-all shadow-md shrink-0 ${
                    isMeReady
                      ? "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800"
                      : "bg-navy text-white hover:bg-navy-dark hover:-translate-y-0.5"
                  }`}
                >
                  {isReadyUpdating ? "처리 중..." : isMeReady ? "준비 해제" : "준비 완료"}
                </button>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3 mb-6 shrink-0">
              {connectionError && (
                <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-700">
                  {connectionError}
                </div>
              )}
              {isAllReady && (
                <div className="w-full rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-5 py-3.5 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white animate-pulse">🎉</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">모든 참여자가 준비를 마쳤습니다. 방장이 면접을 시작할 수 있습니다.</span>
                </div>
              )}
              {isHost && (
                <button
                  type="button"
                  disabled={!isAllReady}
                  onClick={() => void handleStartInterview()}
                  className="self-end rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  면접 시작
                </button>
              )}
            </div>

            <div className="w-full pb-10 mt-auto mb-auto">
              <ParticipantGrid participants={syncedParticipants} />
            </div>
          </div>
        </div>

        {/* 발표 범위에서는 실제 통신이 없는 채팅을 숨기고 면접 팁만 제공한다. */}
        <aside className="w-full shrink-0 border-t border-line/50 bg-surface/50 backdrop-blur-xl dark:border-white/5 dark:bg-[#111827]/40 lg:w-[380px] lg:self-start lg:border-l lg:border-t-0">
          <div className="flex items-start gap-3 border-b border-line/50 px-5 py-3 dark:border-white/5 shrink-0">
            <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-navy dark:text-white">Tip</span>
            </div>
            <div className="flex min-h-10 flex-1 items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="break-keep text-[13px] font-medium leading-5 text-ink dark:text-gray-300"
                >
                  {INTERVIEW_TIPS[tipIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

        </aside>
      </div>
    </main>
  );
}
