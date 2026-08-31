"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { RefObject } from "react";

interface CameraViewportProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  step: string;
  countdown: number;
  selectedCategory: string | null;
  selectedJobName?: string;
  currentQuestionText: string;
  questionMode: "base" | "followup";
  onCancelStop: () => void;
  onConfirmStop: () => void;
}

export default function CameraViewport({
  videoRef,
  step,
  countdown,
  selectedCategory,
  selectedJobName,
  currentQuestionText,
  questionMode,
  onCancelStop,
  onConfirmStop,
}: CameraViewportProps) {
  // 💡 팝업이 뜨는 모든 모달 단계를 체크하기 위한 변수 생성
  const isModalStep = ["resumePrompt", "resumeUpload", "jobSelect"].includes(step);

  return (
    <>
      {/* 1. 배경 카메라 비디오 (풀스크린 원상 복구: object-cover) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 h-full w-full object-cover transform -scale-x-100 transition-all duration-500 ${
          isModalStep ? "opacity-25 blur-sm" : "opacity-80"
        }`}
      />

      {/* 💡 모달 단계가 아닐 때만 카메라 UI 가이드라인 및 면접용 오버레이 표시 */}
      {!isModalStep && (
        <div className="absolute inset-0 z-40 flex flex-col p-8 justify-between pointer-events-none">
          
          <div className="flex w-full justify-center pt-4">
            <AnimatePresence mode="wait">
              {step === "prepare" && (
                <motion.div
                  key="prepare"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center gap-2 pointer-events-auto"
                >
                  <div className="flex items-center gap-2 rounded-full bg-black/60 px-8 py-3 text-sm font-medium text-white backdrop-blur-md border border-white/10">
                    아이콘에 얼굴을 맞춰주세요.
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white border border-white/20">
                    <span className="opacity-70">{selectedCategory}</span>
                    <span className="opacity-40">·</span>
                    <span>{selectedJobName}</span>
                  </div>
                </motion.div>
              )}

              {step === "recording" && (
                <motion.div
                  key={`${questionMode}-${currentQuestionText}`}
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center rounded-[28px] bg-white px-10 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-white/40 max-w-2xl text-center pointer-events-auto"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      questionMode === "followup"
                        ? "bg-violet-50 text-violet-700"
                        : "bg-blue-50 text-blue-600"
                    }`}>
                      {questionMode === "followup" ? "AI Follow-up Question" : "AI Live Question"}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {selectedCategory} · {selectedJobName}
                    </span>
                  </div>
                  <h2 className="mt-1 whitespace-pre-line text-lg font-bold leading-snug text-slate-900">
                    {currentQuestionText?.trim() || "질문을 불러오는 중입니다..."}
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex flex-1 items-center justify-center">
            {step === "prepare" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 0.5 }}
                className="w-[20vmin] h-[20vmin] max-w-[150px] max-h-[150px] text-white flex items-center justify-center drop-shadow-2xl"
              >
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <line x1="12" y1="4" x2="12" y2="20" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                </svg>
              </motion.div>
            )}

            {step === "countdown" && (
              <motion.div
                key={countdown}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.5 }}
                className="text-[140px] font-bold text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)] font-serif"
              >
                {countdown}
              </motion.div>
            )}

            {step === "confirmStop" && (
              <div className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-2xl border border-black/[0.03] pointer-events-auto">
                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-navy">촬영을 중단하시나요?</h3>
                <p className="mt-2 text-xs text-muted leading-relaxed px-2">
                  촬영을 멈추고 대시보드로 돌아가시겠습니까?
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <button onClick={onCancelStop} className="w-full rounded-2xl bg-navy py-3.5 text-sm font-bold text-white shadow-md shadow-navy/10 hover:bg-navy-dark transition-colors">
                    아니요, 계속 촬영하기
                  </button>
                  <button onClick={onConfirmStop} className="w-full rounded-2xl bg-red-50 py-3.5 text-sm font-bold text-red-500 hover:bg-red-100/60 transition-colors">
                    네, 촬영 종료하고 대시보드로 돌아가기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}