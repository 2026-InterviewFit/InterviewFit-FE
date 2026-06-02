"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, ChevronRight, HelpCircle } from "lucide-react";

type Step = "prepare" | "countdown" | "recording" | "confirmStop" | "analyzing";

const LOADING_TIPS = [
  { category: "💡 면접 꿀팁", text: "답변을 하다가 막힐 때는 1~2초간 천천히 숨을 고르고 '잠시 생각할 시간을 주시겠습니까?'라고 정중히 양해를 구해보세요." },
  { category: "👔 면접 복장 추천", text: "IT/개발 직군은 너무 딱딱한 정장보다 깔끔한 셔츠나 슬랙스, 단정한 니트 레이어드가 훨씬 세련되고 전문적인 인상을 줍니다." },
  { category: "🗣️ 면접 멘트 추천", text: "협업 갈등을 묻는 질문에는 '제 의견이 옳다'보다는 '팀의 목표를 위해 어떤 조율 과정을 거쳤는지' STAR 구조로 풀어내는 것이 핵심입니다." },
  { category: "💻 개발일화", text: "인터뷰핏의 AI 엔진은 은재님 팀이 새벽에 마시는 커피의 양과 정비례해서 고도화되고 있다는 소문이 있습니다...☕" },
  { category: "💡 실시간 채용 정보", text: "최근 테크 기업들은 단순 기술 나열보다, 하나의 프로젝트라도 깊게 파고들어 직면한 한계를 어떻게 트러블슈팅했는지를 집중적으로 평가합니다." }
];

const MOCK_QUESTIONS = [
  "Q1. 프로젝트 중 가장 해결하기 어려웠던 기술적 한계와 트러블슈팅 경험을 말씀해 주세요.",
  "Q2. 팀원 간의 의견 조율이 대립할 때, 본인만의 소통 노하우는 무엇인가요?",
  "Q3. 마지막으로 인터뷰핏에 꼭 합격해야 하는 본인만의 강점을 어필해 주세요."
];

export default function InterviewRecording({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState<Step>("prepare");
  const [countdown, setCountdown] = useState(3);
  const [time, setTime] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  
  // 💡 실제 데이터 수집처럼 구동되는 분석 진행률(%) 상태 추가
  const [analysisProgress, setAnalysisProgress] = useState(1);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

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

  useEffect(() => {
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

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  useEffect(() => {
    if (step !== "analyzing") return;
    
    const tipInterval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 4000);
    
    // 💡 실시간 분석 진행률 타이머 매칭 (점진적으로 99%까지 차오름)
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 99) {
          clearInterval(progressInterval);
          return 99;
        }
        // 후반부로 갈수록 정밀 연산 느낌을 주기 위해 속도 조절
        const increment = prev > 80 ? 1 : Math.floor(Math.random() * 8) + 3;
        return Math.min(prev + increment, 99);
      });
    }, 400);
    
    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, [step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setStep("analyzing");
    }
  };

  const handleFinalExit = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    window.location.href = "/mypage/dashboard";
  };

  // 💡 수정 완료: 중앙 정렬 최적화 및 노랑+파랑 파스텔톤 그라데이션 블롭 레이어 탑재 로딩창
  if (step === "analyzing") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-bg text-ink p-8 relative font-sans select-none">
        
        {/* 💡 히어로 섹션과 완벽 매칭되는 영롱한 노랑-파랑 파스텔톤 배경 블롭 복사 */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute -top-40 -left-20 h-[650px] w-[650px] rounded-full bg-[#fef08a]/40 blur-[140px]" />
          <div className="absolute top-10 -right-20 h-[750px] w-[750px] rounded-full bg-[#bfdbfe]/60 blur-[160px]" />
          <div className="absolute bottom-[-150px] left-1/4 h-[600px] w-[600px] rounded-full bg-[#e9d5ff]/30 blur-[130px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-xl text-center space-y-8 w-full">
          
          {/* 차분하게 천천히 돌도록 늦춘 2s 스핀 로더 + 중앙 실시간 퍼센트(%) 표기 */}
          <div className="relative flex items-center justify-center w-28 h-28">
            <div className="absolute inset-0 rounded-full border-4 border-black/[0.04]" />
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-transparent animate-[spin_2s_linear_infinite]" />
            <span className="font-serif text-xl font-bold tracking-tight text-navy">{analysisProgress}%</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-navy">면접 촬영 완료! AI 데이터 정밀 분석 중...</h2>
            <p className="text-sm text-muted">은재님의 시선 처리, 발화 패턴, 논리 구조를 종합 평가하고 있습니다.</p>
          </div>

          {/* 깔끔하게 전면 중앙 정렬 완료된 무빙 꿀팁 박스 */}
          <div className="w-full bg-white/70 border border-black/[0.04] backdrop-blur-md rounded-[32px] p-8 text-center min-h-[160px] flex flex-col items-center justify-center overflow-hidden shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={tipIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="flex flex-col items-center space-y-3"
              >
                <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {LOADING_TIPS[tipIdx].category}
                </span>
                <p className="text-sm font-semibold leading-relaxed text-navy max-w-md">
                  {LOADING_TIPS[tipIdx].text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <button
            onClick={handleFinalExit}
            className="rounded-full bg-navy px-10 py-4 text-sm font-bold text-white shadow-lg shadow-navy/10 hover:bg-navy-dark transition-colors"
          >
            대시보드에서 결과 확인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black font-sans">
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover transform -scale-x-100 opacity-80" 
      />

      <div className="relative z-10 flex h-full w-full flex-col p-8 justify-between">

        <div className="flex w-full justify-center pt-4">
          <AnimatePresence mode="wait">
            {step === "prepare" && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-2 rounded-full bg-black/60 px-8 py-3 text-sm font-medium text-white backdrop-blur-md border border-white/10"
              >
              아이콘 라인에 상체를 맞춰주세요.
              </motion.div>
            )}

            {step === "recording" && (
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center rounded-[28px] bg-white px-10 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-white/40 max-w-2xl text-center"
              >
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">AI Live Question</span>
                <h2 className="text-lg font-bold text-navy mt-1.5 leading-snug">
                  {MOCK_QUESTIONS[currentQuestionIdx]}
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          
          {/* 💡 수정 완료: 상체 실루엣 가이드 아이콘 크기를 500px로 확 키워 볼륨감 확보 */}
          {step === "prepare" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 0.5 }}
              className="pointer-events-none w-[500px] h-[500px] text-white flex items-center justify-center drop-shadow-2xl"
            >
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="5 5">
                <circle cx="12" cy="7" r="4.2" />
                <path d="M3,21 C3,15.5 7,13 12,13 C17,13 21,15.5 21,21" strokeLinecap="round" />
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
            <div className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-2xl border border-black/[0.03]">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-navy">촬영을 중단하시나요?</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed px-2">
                촬영을 멈추고 대시보드로 돌아가시겠습니까?
              </p>
              
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => setStep("recording")}
                  className="w-full rounded-2xl bg-navy py-3.5 text-sm font-bold text-white shadow-md shadow-navy/10 hover:bg-navy-dark transition-colors"
                >
                  아니요, 계속 촬영하기
                </button>
                <button
                  onClick={() => setStep("analyzing")}
                  className="w-full rounded-2xl bg-red-50 py-3.5 text-sm font-bold text-red-500 hover:bg-red-100/60 transition-colors"
                >
                  네, 촬영 종료하고 대시보드로 돌아가기
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex h-24 w-full items-end justify-center pb-4">
          
          {step === "prepare" ? (
            <button
              onClick={() => setStep("countdown")}
              className="rounded-full bg-blue-600 px-10 py-4.5 text-base font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-transform hover:scale-103"
            >
              자세 정렬 완료 (촬영 시작)
            </button>
          ) : (
            step !== "confirmStop" && step !== "analyzing" && (
              <div className="flex items-center gap-4">
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
                    onClick={() => setStep("confirmStop")}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Square className="h-3 w-3 fill-current" />
                    연습 중단
                  </button>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handleNextQuestion}
                  className="flex items-center gap-1.5 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-navy shadow-xl hover:bg-gray-50 transition-colors"
                >
                  <span>
                    {currentQuestionIdx === MOCK_QUESTIONS.length - 1 ? "최종 답변 완료" : "답변 완료 (다음 질문)"}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}