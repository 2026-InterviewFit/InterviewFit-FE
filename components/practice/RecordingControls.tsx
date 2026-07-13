"use client";

import { motion } from "framer-motion";
import { Mic, Square, ChevronRight } from "lucide-react";

interface RecordingControlsProps {
  step: string;
  time: number;
  currentQuestionIdx: number;
  totalQuestions: number;
  onStartCountdown: () => void;
  onStopRecording: () => void;
  onNextQuestion: () => void;
}

export default function RecordingControls({
  step,
  time,
  currentQuestionIdx,
  totalQuestions,
  onStartCountdown,
  onStopRecording,
  onNextQuestion,
}: RecordingControlsProps) {
  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  // 💡 수정됨: confirmStop 뿐만 아니라 countdown 중일 때도 하단 바를 숨김 처리!
  if (step === "confirmStop" || step === "countdown") return null;

  return (
    <div className="flex items-center gap-4">
      {step === "prepare" ? (
        <button
          onClick={onStartCountdown}
          className="rounded-full bg-blue-600 px-10 py-4 text-base font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-transform hover:scale-105"
        >
          자세 정렬 완료 (촬영 시작)
        </button>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6 rounded-full bg-black/75 px-6 py-3.5 backdrop-blur-md border border-white/10"
          >
            <div className="flex items-center gap-2.5">
              <Mic className="h-4 w-4 text-white/60" />
              <div className="flex h-3 gap-0.5 items-end">
                <motion.div animate={{ height: ["30%", "100%", "30%"] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 rounded-full bg-emerald-400" />
                <motion.div animate={{ height: ["70%", "40%", "90%"] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 rounded-full bg-emerald-400" />
                <motion.div animate={{ height: ["40%", "80%", "50%"] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-lg font-medium tracking-widest text-white">
                {formatTime(time)}
              </span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <button
              onClick={onStopRecording}
              className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              <Square className="h-3 w-3 fill-current" /> 연습 중단
            </button>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onNextQuestion}
            className="flex items-center gap-1.5 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-navy shadow-xl hover:bg-gray-50 transition-colors"
          >
            <span>{currentQuestionIdx === totalQuestions - 1 ? "최종 답변 완료" : "답변 완료 (다음 질문)"}</span>
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </>
      )}
    </div>
  );
}