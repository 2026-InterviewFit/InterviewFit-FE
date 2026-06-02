"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, AlertCircle, Loader2 } from "lucide-react";

type Step = "prepare" | "countdown" | "recording" | "confirmStop" | "analyzing";

export default function InterviewRecording({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState<Step>("prepare");
  const [countdown, setCountdown] = useState(3);
  const [time, setTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // 1. 컴포넌트 마운트 시 브라우저 웹캠 켜기
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("카메라 접근 에러:", error);
        alert("카메라와 마이크 권한을 허용해주세요!");
        onExit(); 
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // 2. 타이머 & 카운트다운 로직 (🔥 오류 해결된 부분!)
  useEffect(() => {
    // 타입을 브라우저 환경에 맞추고 초기값을 명시적으로 null로 지정
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (step === "countdown") {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setStep("recording");
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (step === "recording") {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }

    // interval 값이 있을 때만 안전하게 클리어
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 3. AI 분석 대기 화면
  if (step === "analyzing") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-navy text-white">
        <Loader2 className="h-16 w-16 animate-spin text-emerald-400" />
        <h2 className="mt-8 text-2xl font-bold">면접 종료! AI가 데이터를 분석하고 있습니다...</h2>
        <p className="mt-4 text-white/70">시선 처리, 목소리 톤, 답변 내용을 종합적으로 평가 중입니다.</p>
        <p className="mt-4 text-white/50">AI의 분석결과 및 피드백은 '마이페이지'를 이용해주세요.</p>
        
        <button
          onClick={() => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            onExit();
          }}
          className="mt-12 rounded-full border border-white/20 bg-white/10 px-8 py-3 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white/20"
        >
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  // 4. 메인 풀스크린 녹화 화면 UI
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black font-sans">
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover transform -scale-x-100" 
      />

      <div className="relative z-10 flex h-full w-full flex-col p-8">

        <div className="flex h-32 w-full justify-center pt-8">
          <AnimatePresence mode="wait">
            
            {step === "prepare" && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center rounded-full bg-black/60 px-8 py-3 text-sm font-medium text-white backdrop-blur-md"
              >
                카메라 렌즈를 바라보고 점선 안에 몸통을 맞춰주세요.
              </motion.div>
            )}

            {step === "recording" && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center rounded-[32px] bg-[#d1f2eb] px-12 py-6 shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/20"
              >
                <h2 className="text-xl font-bold text-black">Q. 자기 소개를 해주세요.</h2>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          
          {step === "prepare" && (
            <div className="pointer-events-none absolute h-[70%] w-[45%] rounded-[60px] border-[6px] border-dashed border-white/50" />
          )}

          {step === "countdown" && (
            <motion.div
              key={countdown}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.5 }}
              className="text-[150px] font-bold text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
            >
              {countdown}
            </motion.div>
          )}

          {step === "recording" && time === 0 && (
            <motion.div
              initial={{ opacity: 1, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 1.2 }}
              className="absolute text-6xl font-bold text-white drop-shadow-2xl"
            >
              면접 시작!
            </motion.div>
          )}

          {step === "confirmStop" && (
            <div className="w-full max-w-md rounded-[32px] bg-white p-8 text-center shadow-2xl">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <h3 className="text-xl font-bold text-ink">면접이 중단됩니다.</h3>
              <p className="mt-2 text-muted">카메라를 끄고 분석을 시작하시겠습니까?</p>
              
              <div className="mt-8 flex justify-center gap-3">
                <button
                  onClick={() => setStep("recording")}
                  className="rounded-2xl bg-gray-100 px-6 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-gray-200"
                >
                  아니요, 계속하기
                </button>
                <button
                  onClick={() => setStep("analyzing")}
                  className="rounded-2xl bg-red-500 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-600"
                >
                  예, 종료하기
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex h-32 w-full items-end justify-center pb-8">
          
          {step === "prepare" ? (
            <button
              onClick={() => setStep("countdown")}
              className="rounded-full bg-blue-600 px-10 py-4 text-base font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-transform hover:scale-105"
            >
              자세 확인 완료 (녹화 시작)
            </button>
          ) : (
            step !== "confirmStop" && step !== "analyzing" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-8 rounded-full bg-black/70 px-8 py-4 backdrop-blur-md border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <Mic className="h-5 w-5 text-white/70" />
                  <div className="flex h-4 gap-1">
                    <motion.div animate={{ height: ["40%", "100%", "40%"] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 rounded-full bg-emerald-400" />
                    <motion.div animate={{ height: ["60%", "30%", "80%"] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1.5 rounded-full bg-emerald-400" />
                    <motion.div animate={{ height: ["30%", "90%", "50%"] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div className="h-8 w-px bg-white/20" />

                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-mono text-xl font-medium tracking-widest text-white">
                    {formatTime(time)}
                  </span>
                </div>

                <div className="h-8 w-px bg-white/20" />

                <button
                  onClick={() => setStep("confirmStop")}
                  className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600"
                >
                  <Square className="h-4 w-4 fill-white" />
                  면접 중단
                </button>
              </motion.div>
            )
          )}
        </div>
      </div>
    </div>
  );
}