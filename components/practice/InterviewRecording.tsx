"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mic, Square, ChevronRight, HelpCircle, Briefcase, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  analyzeEyeBlinkingByVideoUrl,
  uploadInterviewVideo,
  type EyeBlinkingAnalyzeResponse,
} from "@/lib/api";

type Step = "jobSelect" | "prepare" | "countdown" | "recording" | "confirmStop" | "analyzing";

// ── 직무 데이터 ───────────────────────────────────────────────
const JOB_CATEGORIES = [
  {
    label: "IT/개발",
    emoji: "💻",
    jobs: ["프론트엔드", "백엔드", "AI", "데이터분석"],
  },
  {
    label: "비즈니스",
    emoji: "📊",
    jobs: ["마케팅", "인사", "재무·회계"],
  },
  {
    label: "디자인",
    emoji: "🎨",
    jobs: ["UX/UI 디자이너", "영상 제작", "그래픽 디자이너"],
  },
];

// 카테고리별 색상 테마
const CATEGORY_COLORS: Record<string, { activeTab: string; activeJob: string; dot: string }> = {
  "IT/개발": {
    activeTab: "bg-blue-600 text-white shadow-md shadow-blue-300/40",
    activeJob: "border-blue-500 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  "비즈니스": {
    activeTab: "bg-emerald-600 text-white shadow-md shadow-emerald-300/40",
    activeJob: "border-emerald-500 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  "디자인": {
    activeTab: "bg-purple-600 text-white shadow-md shadow-purple-300/40",
    activeJob: "border-purple-500 bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
};

// ── 직무별 면접 질문 ──────────────────────────────────────────
const QUESTIONS_BY_CATEGORY: Record<string, string[]> = {
  "IT/개발": [
    "Q1. 프로젝트 중 가장 해결하기 어려웠던 기술적 한계와 트러블슈팅 경험을 말씀해 주세요.",
    "Q2. 코드 리뷰나 협업 도구를 활용한 팀 개발 경험이 있으시면 구체적으로 설명해 주세요.",
    "Q3. 본인이 가장 자신 있는 기술 스택과 해당 기술을 선택한 이유를 말씀해 주세요.",
  ],
  "비즈니스": [
    "Q1. 데이터를 기반으로 의사결정을 내린 경험이 있으시면 구체적으로 설명해 주세요.",
    "Q2. 팀원 간 의견이 대립할 때 조율한 경험과 본인만의 소통 노하우는 무엇인가요?",
    "Q3. 본인이 주도적으로 기획하거나 실행한 프로젝트를 STAR 구조로 말씀해 주세요.",
  ],
  "디자인": [
    "Q1. 사용자 중심의 디자인 결정을 내린 경험이 있으시면 구체적으로 설명해 주세요.",
    "Q2. 개발팀 혹은 기획팀과 협업 시 디자인 의도를 효과적으로 전달한 방법을 말씀해 주세요.",
    "Q3. 본인 포트폴리오 중 가장 애착이 가는 작업물과 그 이유를 설명해 주세요.",
  ],
};

// ── 분석 화면 팁 ──────────────────────────────────────────────
const LOADING_TIPS = [
  { category: "💡 면접 꿀팁", text: "답변을 하다가 막힐 때는 1~2초간 천천히 숨을 고르고 '잠시 생각할 시간을 주시겠습니까?'라고 정중히 양해를 구해보세요." },
  { category: "👔 면접 복장 추천", text: "IT/개발 직군은 너무 딱딱한 정장보다 깔끔한 셔츠나 슬랙스, 단정한 니트 레이어드가 훨씬 세련되고 전문적인 인상을 줍니다." },
  { category: "🗣️ 면접 멘트 추천", text: "협업 갈등을 묻는 질문에는 '제 의견이 옳다'보다는 '팀의 목표를 위해 어떤 조율 과정을 거쳤는지' STAR 구조로 풀어내는 것이 핵심입니다." },
  { category: "💻 개발일화", text: "인터뷰핏의 AI 엔진은 은재님 팀이 새벽에 마시는 커피의 양과 정비례해서 고도화되고 있다는 소문이 있습니다...☕" },
  { category: "💡 실시간 채용 정보", text: "최근 테크 기업들은 단순 기술 나열보다, 하나의 프로젝트라도 깊게 파고들어 직면한 한계를 어떻게 트러블슈팅했는지를 집중적으로 평가합니다." },
];

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function InterviewRecording({ onExit }: { onExit: () => void }) {
  const router = useRouter();

  // 직무 선택 상태
  const [selectedCategory, setSelectedCategory] = useState("IT/개발");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  // 면접 진행 상태
  const [step, setStep] = useState<Step>("jobSelect");
  const [countdown, setCountdown] = useState(3);
  const [time, setTime] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(1);
  const [analysisResult, setAnalysisResult] = useState<EyeBlinkingAnalyzeResponse | null>(null);
  const [analysisError, setAnalysisError] = useState("");

  // refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 현재 카테고리 파생 데이터
  const currentCategoryData =
    JOB_CATEGORIES.find((c) => c.label === selectedCategory) ?? JOB_CATEGORIES[0];
  const currentColors = CATEGORY_COLORS[selectedCategory];
  const currentQuestions =
    QUESTIONS_BY_CATEGORY[selectedCategory] ?? QUESTIONS_BY_CATEGORY["IT/개발"];

  const eyeBlinkingData = analysisResult?.result ?? analysisResult?.data;

  // ── 카메라 초기화 (컴포넌트 마운트 시 바로 시작 → 배경 미리보기) ─
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = mediaStream;
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
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── MediaRecorder: recording 시작 / analyzing 시 종료 + Spring 분석 API 호출 ─
  useEffect(() => {
    if (step === "recording" && streamRef.current && !mediaRecorderRef.current) {
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";
      const recorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start(1000);
    }

    if (step === "analyzing" && mediaRecorderRef.current?.state === "recording") {
      setAnalysisResult(null);
      setAnalysisError("");
      setAnalysisProgress(1);

      mediaRecorderRef.current.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, {
            type: mediaRecorderRef.current?.mimeType || "video/webm",
          });
          console.log("녹화 chunks 개수:", chunksRef.current.length);
          console.log("녹화 blob size:", blob.size);
          console.log("녹화 blob type:", blob.type);

          if (blob.size === 0) {
            throw new Error("녹화된 영상 파일이 비어 있습니다.");
          }

          /**
           * 1단계: 팀원 VideoService에 영상 저장 요청
           *
           * 기존에는 eye-blink API가 영상을 직접 업로드받았지만,
           * 지금은 팀원 코드에 /videos/upload → MinIO 저장 → videoUrl 반환 흐름이 있다.
           * 따라서 FE는 먼저 /videos/upload를 호출해서 영상 저장 방식을 팀원 코드와 통일한다.
           */
          const uploadResult = await uploadInterviewVideo({
            file: blob,
          });
          
          console.log("영상 업로드 결과:", uploadResult);
          
          const videoUrl =
            uploadResult.videoUrl ??
            uploadResult.objectKey;
          
          if (!videoUrl) {
            throw new Error("영상 업로드 응답에 videoUrl/objectKey가 없습니다.");
          }
          
          console.log("분석에 넘기는 videoUrl:", videoUrl);
          
          setAnalysisProgress(55);
          
          const result = await analyzeEyeBlinkingByVideoUrl({
            videoUrl,
          });

          console.log("눈 깜빡임 분석 결과:", result);

          if (typeof window !== "undefined") {
            localStorage.setItem(
              "latestEyeBlinkingAnalysis",
              JSON.stringify({
                message: result.message,
                reportId: result.reportId,
                result: result.result ?? result.data,
                videoUrl,
                savedAt: new Date().toISOString(),
              })
            );
          }

          setAnalysisResult(result);
          setAnalysisProgress(100);
        } catch (error) {
          console.error(error);
          setAnalysisProgress(100);
          setAnalysisError(
            error instanceof Error
              ? error.message
              : "눈 깜빡임 분석 중 알 수 없는 오류가 발생했습니다."
          );
        } finally {
          mediaRecorderRef.current = null;
        }
      };

      mediaRecorderRef.current.stop();
    }
  }, [step]);

  // ── 카운트다운 & 녹화 타이머 ──────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (step === "countdown") {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { setStep("recording"); return 3; }
          return prev - 1;
        });
      }, 1000);
    } else if (step === "recording") {
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    }

    return () => { if (interval) clearInterval(interval); };
  }, [step]);

  // ── 분석 화면 팁 & 진행률 ─────────────────────────────────────
  useEffect(() => {
    if (step !== "analyzing") return;

    const tipInterval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 4000);

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        const increment = prev > 80 ? 1 : Math.floor(Math.random() * 8) + 3;
        return Math.min(prev + increment, 95);
      });
    }, 400);

    return () => { clearInterval(tipInterval); clearInterval(progressInterval); };
  }, [step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < currentQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setStep("analyzing");
    }
  };

  const handleFinalExit = () => {
  streamRef.current?.getTracks().forEach((track) => track.stop());
  onExit(); // ← router.push 대신 prop 사용
};

  // ── 분석 화면 (별도 풀스크린) ─────────────────────────────────
  if (step === "analyzing") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-bg text-ink p-8 relative font-sans select-none">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute -top-40 -left-20 h-[650px] w-[650px] rounded-full bg-[#fef08a]/40 blur-[140px]" />
          <div className="absolute top-10 -right-20 h-[750px] w-[750px] rounded-full bg-[#bfdbfe]/60 blur-[160px]" />
          <div className="absolute bottom-[-150px] left-1/4 h-[600px] w-[600px] rounded-full bg-[#e9d5ff]/30 blur-[130px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-2xl text-center space-y-8 w-full">
          <div className="relative flex items-center justify-center w-28 h-28">
            <div className="absolute inset-0 rounded-full border-4 border-black/[0.04]" />
            {!analysisResult && !analysisError && (
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-transparent animate-[spin_2s_linear_infinite]" />
            )}
            {analysisResult && <CheckCircle2 className="h-12 w-12 text-emerald-500" />}
            {analysisError && <AlertCircle className="h-12 w-12 text-red-500" />}
            {!analysisResult && !analysisError && (
              <span className="font-serif text-xl font-bold tracking-tight text-navy">
                {analysisProgress}%
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-navy">
              {analysisResult
                ? "눈 깜빡임 분석 완료"
                : analysisError
                  ? "분석 중 오류가 발생했습니다"
                  : "면접 촬영 완료! AI 데이터 정밀 분석 중..."}
            </h2>
            <p className="text-sm text-muted">
              <span className="font-bold text-navy">{selectedJob}</span> 직무 기준으로 녹화 영상을 Spring으로 전송하고, Spring이 FastAPI 분석을 요청합니다.
            </p>
          </div>

          {!analysisResult && !analysisError && (
            <div className="w-full bg-white/70 border border-black/[0.04] backdrop-blur-md rounded-[32px] p-8 text-center min-h-[160px] flex flex-col items-center justify-center overflow-hidden shadow-sm">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={tipIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6 }}
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
          )}

          {analysisResult && (
            <div className="w-full rounded-[32px] bg-white/80 p-8 text-left shadow-sm border border-black/[0.04] backdrop-blur-md">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-5">
                  <p className="text-xs font-bold text-blue-600">깜빡임 횟수</p>
                  <p className="mt-2 text-2xl font-bold text-navy">
                    {eyeBlinkingData?.blink_count ?? "-"}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-5">
                  <p className="text-xs font-bold text-emerald-600">분당 깜빡임</p>
                  <p className="mt-2 text-2xl font-bold text-navy">
                    {eyeBlinkingData?.blink_rate ?? eyeBlinkingData?.blinks_per_minute ?? "-"}
                  </p>
                </div>
                <div className="rounded-2xl bg-purple-50 p-5">
                  <p className="text-xs font-bold text-purple-600">점수</p>
                  <p className="mt-2 text-2xl font-bold text-navy">
                    {eyeBlinkingData?.score ?? "-"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-gray-50 p-5">
                <p className="text-xs font-bold text-gray-500">피드백</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-navy">
                  {eyeBlinkingData?.feedback ?? eyeBlinkingData?.evaluation ?? analysisResult.message ?? "분석 결과가 저장되었습니다."}
                </p>
              </div>
            </div>
          )}

          {analysisError && (
            <div className="w-full rounded-[28px] border border-red-100 bg-red-50 p-6 text-left text-sm font-semibold leading-relaxed text-red-600">
              {analysisError}
            </div>
          )}

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

  // ── 메인 화면 (jobSelect / prepare / countdown / recording / confirmStop) ──
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black font-sans">

      {/* 카메라 피드 — 항상 DOM에 존재 (jobSelect 시 흐리게) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 h-full w-full object-cover transform -scale-x-100 transition-all duration-500 ${
          step === "jobSelect" ? "opacity-25 blur-sm" : "opacity-80"
        }`}
      />

      {/* ── 직무 선택 팝업 ─────────────────────────────────────── */}
      {step === "jobSelect" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-white/30 p-8"
          >
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-7">
              <div className="h-10 w-10 rounded-2xl bg-navy flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-navy leading-tight">
                  직무를 선택해 주세요
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  직무에 맞는 면접 질문이 출제됩니다
                </p>
              </div>
            </div>

            {/* 카테고리 탭 */}
            <div className="flex gap-2 mb-5">
              {JOB_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.label;
                const colors = CATEGORY_COLORS[cat.label];
                return (
                  <button
                    key={cat.label}
                    onClick={() => {
                      setSelectedCategory(cat.label);
                      setSelectedJob(null);
                    }}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? colors.activeTab
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span className="leading-none">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 세부 직무 선택 — 카테고리 바뀔 때 페이드 전환 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-2 mb-6"
              >
                {currentCategoryData.jobs.map((job) => {
                  const isSelected = selectedJob === job;
                  return (
                    <button
                      key={job}
                      onClick={() => setSelectedJob(job)}
                      className={`py-3 px-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? currentColors.activeJob
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 bg-white"
                      }`}
                    >
                      {/* 선택 표시 도트 */}
                      <span
                        className={`block w-2 h-2 rounded-full mb-1.5 transition-colors ${
                          isSelected ? currentColors.dot : "bg-gray-300"
                        }`}
                      />
                      {job}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* 시작 버튼 — 직무 선택 전까지 비활성화 */}
            <button
              disabled={!selectedJob}
              onClick={() => setStep("prepare")}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all duration-200 ${
                selectedJob
                  ? "bg-navy text-white hover:bg-navy-dark shadow-md shadow-navy/20 hover:-translate-y-0.5"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {selectedJob ? `${selectedJob} 면접 시작하기` : "직무를 선택해 주세요"}
              {selectedJob && <ChevronRight className="h-4 w-4" />}
            </button>
          </motion.div>
        </div>
      )}

      {/* ── 면접 진행 UI (prepare / countdown / recording / confirmStop) ─ */}
      {step !== "jobSelect" && (
        <div className="relative z-10 flex h-full w-full flex-col p-8 justify-between">

          {/* 상단: 안내 문구 / 질문 */}
          <div className="flex w-full justify-center pt-4">
            <AnimatePresence mode="wait">
              {step === "prepare" && (
                <motion.div
                  key="prepare"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex items-center gap-2 rounded-full bg-black/60 px-8 py-3 text-sm font-medium text-white backdrop-blur-md border border-white/10">
                    아이콘 라인에 상체를 맞춰주세요.
                  </div>
                  {/* 선택된 직무 배지 */}
                  <div className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white border border-white/20">
                    <span className="opacity-70">{selectedCategory}</span>
                    <span className="opacity-40">·</span>
                    <span>{selectedJob}</span>
                  </div>
                </motion.div>
              )}

              {step === "recording" && (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center rounded-[28px] bg-white px-10 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-white/40 max-w-2xl text-center"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      AI Live Question
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {selectedCategory} · {selectedJob}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-navy mt-1 leading-snug">
                    {currentQuestions[currentQuestionIdx]}
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 중앙: 실루엣 / 카운트다운 / 중단 확인 */}
          <div className="relative flex flex-1 items-center justify-center">
            {step === "prepare" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 0.5 }}
                className="pointer-events-none w-[500px] h-[500px] text-white flex items-center justify-center drop-shadow-2xl"
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeDasharray="5 5"
                >
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

          {/* 하단: 버튼 영역 */}
          <div className="flex h-24 w-full items-end justify-center pb-4">
            {step === "prepare" ? (
              <button
                onClick={() => setStep("countdown")}
                className="rounded-full bg-blue-600 px-10 py-4.5 text-base font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-transform hover:scale-103"
              >
                자세 정렬 완료 (촬영 시작)
              </button>
            ) : (
              step !== "confirmStop" && (
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
                      {currentQuestionIdx === currentQuestions.length - 1
                        ? "최종 답변 완료"
                        : "답변 완료 (다음 질문)"}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

