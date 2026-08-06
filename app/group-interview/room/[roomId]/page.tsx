"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoomConnection } from "@/hooks/useRoomConnection";
import { usePtMedia } from "@/hooks/usePtMedia";
import ParticipantGrid from "@/components/group-interview/room/ParticipantGrid";
import Navbar from "@/components/shared/Navbar";
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Send, Sparkles, Bot, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GROUP_INTERVIEW_QUESTIONS } from "@/lib/groupInterviewData";
import { uploadGroupAnswerSlice } from "@/lib/groupInterviewApi";
import GroupAnalyzing from "@/components/group-interview/room/GroupAnalyzing";

const INTERVIEW_TIPS = [
  "모르는 질문이 나오면 '잠시 생각할 시간을 주시겠습니까?'라고 정중히 요청하세요.",
  "결과보다는 과정! 협업 시 문제를 어떻게 해결했는지 구체적으로 대답해보세요.",
  "면접관의 눈을 맞추는 것이 부담스럽다면 미간이나 코를 바라보세요.",
  "다른 지원자가 답변할 때에도 경청하는 태도를 유지하는 것이 좋습니다."
];

export default function GroupInterviewRoomPage() {
  // 💡 컴포넌트 내부로 이동한 상태 선언
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const myUserId = useMemo(() => "user_" + Math.floor(Math.random() * 10000), []);
  const myNickname = "김은재";

  const { participants, toggleReady, isAllReady } = useRoomConnection(roomId, myUserId, myNickname);
  const { videoRef, cameraOn, micOn, error, toggleCamera, toggleMic, getStream } = usePtMedia();

  const [isInterviewing, setIsInterviewing] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ id: number; sender: string; text: string; isMe: boolean }[]>([
    { id: 1, sender: "시스템", text: "대기실에 입장하셨습니다. 다른 지원자들을 기다리며 장비를 점검해주세요.", isMe: false }
  ]);

  // 💡 슬라이스(발언 순번) 상태
  const [questionIdx, setQuestionIdx] = useState(0);
  const [speakerIdx, setSpeakerIdx] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const syncedParticipants = participants.map((p) =>
    p.isMe ? { ...p, micOn, cameraOn } : p
  );

  const currentQuestion = GROUP_INTERVIEW_QUESTIONS[questionIdx];
  const currentSpeaker = syncedParticipants[speakerIdx];
  const isMyTurn = !!currentSpeaker?.isMe;
  const isLastSpeaker = speakerIdx >= syncedParticipants.length - 1;
  const isLastQuestion = questionIdx >= GROUP_INTERVIEW_QUESTIONS.length - 1;
  const nextLabel = !isLastSpeaker ? "다음 발언자" : !isLastQuestion ? "다음 질문" : "면접 종료";

  // ── 내 슬라이스 녹화 시작/종료+업로드 ──
  const startMyRecording = () => {
    if (recorderRef.current && recorderRef.current.state === "recording") return;
    const stream = getStream();
    if (!stream) return;
    chunksRef.current = [];
    try {
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";
      const rec = new MediaRecorder(stream, { mimeType });
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.start(1000);
      recorderRef.current = rec;
    } catch (e) {
      console.error("녹화 시작 실패:", e);
    }
  };

  const stopAndUploadMySlice = async (qIdx: number, sIdx: number) => {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return;
    await new Promise<void>((resolve) => {
      rec.onstop = () => resolve();
      rec.stop();
    });
    recorderRef.current = null;
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    chunksRef.current = [];
    if (blob.size === 0) return;
    try {
      // 발언 종료 즉시 서버로 전송
      await uploadGroupAnswerSlice({ roomId, userId: myUserId, questionIndex: qIdx, speakerIndex: sIdx, file: blob });
    } catch (e) {
      console.warn("슬라이스 업로드 실패(백엔드 미가동 가능):", e);
    }
  };

  // 대기실 → 전원 준비 완료 시 실전 진입
  useEffect(() => {
    if (isAllReady) {
      const timer = setTimeout(() => setIsInterviewing(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAllReady]);

  useEffect(() => {
    const tipTimer = setInterval(() => setTipIndex((prev) => (prev + 1) % INTERVIEW_TIPS.length), 6000);
    return () => clearInterval(tipTimer);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), sender: "프론트장인", text: "안녕하세요! 다들 준비 잘 되셨나요?", isMe: false }]);
    }, 4000);
    const t2 = setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now()+1, sender: "스프링깎는노인", text: "안녕하세요~ 많이 떨리네요 화이팅입니다!", isMe: false }]);
    }, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // 💡 현재 발언자가 '나'로 바뀌면 자동으로 내 슬라이스 녹화 시작
  useEffect(() => {
    if (!isInterviewing) return;
    if (syncedParticipants[speakerIdx]?.isMe) {
      startMyRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInterviewing, questionIdx, speakerIdx]);

  // 언마운트 시 녹화 정리
  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: myNickname, text: chatInput, isMe: true }]);
    setChatInput("");
  };

  const handleFinish = async () => {
    if (isMyTurn) await stopAndUploadMySlice(questionIdx, speakerIdx);
    setIsAnalyzing(true); // 💡 바로 대시보드 X → 분석 로딩으로
  };

  const handleNextSpeaker = async () => {
    if (isMyTurn) await stopAndUploadMySlice(questionIdx, speakerIdx);

    if (!isLastSpeaker) {
      setSpeakerIdx((i) => i + 1);
    } else if (!isLastQuestion) {
      setQuestionIdx((q) => q + 1);
      setSpeakerIdx(0);
    } else {
      setIsAnalyzing(true); // 💡 마지막 발언까지 끝나면 분석 로딩으로
    }
  };

  const isMeReady = syncedParticipants.find((p) => p.isMe)?.isReady;

  if (isAnalyzing) {
    return <GroupAnalyzing onDone={() => router.push("/mypage/dashboard")} />;
  }

  // ── 1. 실전 면접 진행 화면 ──
  if (isInterviewing) {
    return (
      <main className="fixed inset-0 z-50 flex flex-col bg-bg text-ink overflow-hidden transition-colors duration-300 dark:bg-[#0f1729] dark:text-white">
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
            <span className="hidden sm:inline text-[11px] font-bold text-muted">
              질문 {questionIdx + 1}/{GROUP_INTERVIEW_QUESTIONS.length} · 발언 {speakerIdx + 1}/{syncedParticipants.length}
            </span>
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
            <button onClick={handleFinish} className="flex items-center gap-1.5 md:gap-2 bg-red-500 hover:bg-red-600 px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold text-white transition-transform hover:scale-105">
              <PhoneOff className="h-3 w-3 md:h-4 md:w-4" /> 종료
            </button>
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
                    key={questionIdx}
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
              myVideoStream={videoRef}
              activeSpeakerId={currentSpeaker?.userId}
            />
          </div>
        </div>

        {/* 하단 컨트롤 */}
        <div className="relative z-10 flex shrink-0 items-center justify-between gap-4 border-t border-line px-4 md:px-8 py-4 dark:border-white/10">
          <p className="text-xs font-medium text-muted">
            {isMyTurn ? "내 차례입니다. 답변 후 '다음'을 누르면 녹화가 종료되고 서버로 전송됩니다." : "다른 지원자의 답변을 경청하세요."}
          </p>
          <button
            onClick={handleNextSpeaker}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-navy px-6 md:px-8 py-2.5 md:py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 hover:bg-navy-dark"
          >
            {nextLabel} <ChevronRight className="h-4 w-4" />
          </button>
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
                  onClick={toggleReady}
                  className={`px-8 py-4 rounded-2xl text-[15px] font-bold transition-all shadow-md shrink-0 ${
                    isMeReady
                      ? "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800"
                      : "bg-navy text-white hover:bg-navy-dark hover:-translate-y-0.5"
                  }`}
                >
                  {isMeReady ? "준비 해제" : "준비 완료"}
                </button>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3 mb-6 shrink-0">
              {error && (
                <div className="w-full rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 px-5 py-3.5 text-sm font-bold text-red-500">
                  {error}
                </div>
              )}
              {isAllReady && (
                <div className="w-full rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-5 py-3.5 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white animate-pulse">🎉</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">모든 참여자가 준비를 마쳤습니다. 잠시 후 실전 화면으로 전환됩니다.</span>
                </div>
              )}
            </div>

            <div className="w-full pb-10 mt-auto mb-auto">
              <ParticipantGrid participants={syncedParticipants} myVideoStream={videoRef} />
            </div>
          </div>
        </div>

        {/* 우측 사이드 패널 */}
        <div className="w-full lg:w-[380px] h-[400px] lg:h-full flex flex-col shrink-0 border-t lg:border-t-0 lg:border-l border-line/50 dark:border-white/5 bg-surface/50 dark:bg-[#111827]/40 backdrop-blur-xl">
          <div className="p-6 pb-5 border-b border-line/50 dark:border-white/5 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-navy dark:text-white uppercase tracking-widest">Interview Tip</span>
            </div>
            <div className="h-12 flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm font-medium leading-relaxed text-ink dark:text-gray-300 break-keep"
                >
                  {INTERVIEW_TIPS[tipIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.isMe ? "self-end items-end" : "self-start items-start"}`}>
                <span className="text-[10px] font-medium text-muted mb-1 px-1">{msg.sender}</span>
                <div className={`px-4 py-2.5 text-[13px] font-medium leading-relaxed shadow-sm ${
                  msg.isMe
                    ? "bg-gradient-to-br from-navy to-blue-600 text-white rounded-2xl rounded-tr-sm"
                    : msg.sender === "시스템"
                      ? "bg-transparent border border-line/50 dark:border-white/10 text-muted rounded-xl w-full text-center text-xs"
                      : "bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 text-ink dark:text-white rounded-2xl rounded-tl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-5 border-t border-line/50 dark:border-white/5 bg-transparent shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="참여자들과 대화를 나눠보세요"
                className="w-full bg-white dark:bg-[#0f1729] border border-line dark:border-white/10 rounded-full pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:border-navy dark:focus:border-blue-500 shadow-inner transition-colors"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="absolute right-2 bg-navy text-white h-9 w-9 rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-chip disabled:text-muted transition-colors hover:bg-navy-dark"
              >
                <Send className="h-4 w-4 pl-0.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}