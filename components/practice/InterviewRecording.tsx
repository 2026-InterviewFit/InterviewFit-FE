"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mic, Square, ChevronRight, HelpCircle, Briefcase, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  analyzeEyeBlinkingByVideoUrl,
  uploadInterviewVideo,
  createQuestions,
  type EyeBlinkingAnalyzeResponse,
  JobRole,
  Question,
  getJobRoles,
} from "@/lib/api";

type Step = "jobSelect" | "prepare" | "countdown" | "recording" | "confirmStop" | "analyzing";

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
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  // 현재 선택된 직무 객체 찾기
  const selectedJobData = jobRoles.find((job) => job.id === selectedJob);
  // 중복 없는 대분류 카테고리 추출
  const uniqueCategories = Array.from(new Set(jobRoles.map((job) => job.category)));
  // 선택된 대분류에 속하는 세부 직무만 필터링
  const filteredJobs = jobRoles.filter((job) => job.category === selectedCategory);

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

  // 프로토타입: 질문을 직군별 1개로 제한
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const currentQuestions = questions.slice(0, 1);

  const eyeBlinkingData = analysisResult?.result ?? analysisResult?.data;

  useEffect(() => {
    const fetchJobRoles = async () => {
      try {
        const data = await getJobRoles();
        console.log("직무 목록 조회 성공", data);
        setJobRoles(data);
        // 데이터를 불러온 후 첫 번째 카테고리를 기본값으로 자동 선택
        if (data.length > 0) {
          const categories = Array.from(new Set(data.map((job) => job.category)));
          setSelectedCategory(categories[0]);
        }
      } catch (error) {
        console.error("직무 목록 조회 실패", error);
      }
    };

    fetchJobRoles();
  }, []);

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

          if (blob.size === 0) {
            throw new Error("녹화된 영상 파일이 비어 있습니다.");
          }

          const uploadResult = await uploadInterviewVideo({
            file: blob,
          });
          
          const videoUrl = uploadResult.videoUrl ?? uploadResult.objectKey;
          
          if (!videoUrl) {
            throw new Error("영상 업로드 응답에 videoUrl/objectKey가 없습니다.");
          }
          
          setAnalysisProgress(55);
          
          const result = await analyzeEyeBlinkingByVideoUrl({
            videoUrl,
          });

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

      // 카메라 백그라운드 트랙 완전 종료 (웹캠 불빛 꺼짐)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
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

  const handleStartInterview = async () => {
    if (!selectedJob) return;

    try {
      setIsLoadingQuestions(true);

      const response = await createQuestions({
        count: 3,
        jobRoleId: selectedJob,
      });

      setQuestions(response);
      setCurrentQuestionIdx(0);
      setStep("prepare");
    } catch (error) {
      console.error("질문 조회 실패", error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

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
    onExit(); 
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
              <span className="font-bold text-navy">{selectedJobData?.name || selectedJob}</span> 직무 기준으로 녹화 영상을 Spring으로 전송하고, Spring이 FastAPI 분석을 요청합니다.
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
            className="w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl border border-white/30 p-8"
          >
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-navy flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-navy leading-tight">
                  직무를 선택해 주세요
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  계열을 먼저 선택하면 세부 직무가 나타납니다.
                </p>
              </div>
            </div>

            {/* 대분류 탭 (스크롤 가능) */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
              {uniqueCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedJob(null); // 카테고리 변경 시 선택된 직무 초기화
                  }}
                  className={`shrink-0 px-4 py-2.5 rounded-full text-xs font-bold transition-colors ${
                    selectedCategory === category
                      ? "bg-navy text-white shadow-md shadow-navy/10"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* 세부 직무 칩(Chip) 영역 */}
            <div className="mb-8 min-h-[140px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-2 gap-2.5 content-start"
                >
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => setSelectedJob(job.id)}
                        className={`px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all border-2 flex items-center justify-between group ${
                          selectedJob === job.id
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span className="truncate pr-2">{job.name}</span>
                        {selectedJob === job.id && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-xs text-gray-400 py-6">
                      데이터를 불러오는 중입니다...
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 시작 버튼 — 직무 선택 전까지 비활성화 */}
            <button
              disabled={!selectedJob}
              onClick={() => handleStartInterview()}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4.5 text-sm font-bold transition-all duration-200 ${
                selectedJob
                  ? "bg-navy text-white hover:bg-navy-dark shadow-lg shadow-navy/20 hover:-translate-y-0.5"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {selectedJobData ? `${selectedJobData.name} 면접 시작하기` : "세부 직무를 선택해 주세요"}
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
                    아이콘에 얼굴을 맞춰주세요.
                  </div>
                  {/* 선택된 직무명 표기 */}
                  <div className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white border border-white/20">
                    <span className="opacity-70">{selectedJobData?.category}</span>
                    <span className="opacity-40">·</span>
                    <span>{selectedJobData?.name}</span>
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
                      {selectedJobData?.category} · {selectedJobData?.name}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-navy mt-1 leading-snug">
                    {currentQuestions[currentQuestionIdx].question}
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
                // 화면 잘림 해결: 고정 px 대신 화면 비율에 맞는 반응형 크기(vmin) 적용
                className="pointer-events-none w-[45vmin] h-[45vmin] max-w-[500px] max-h-[500px] text-white flex items-center justify-center drop-shadow-2xl"
              >
                {/* 십자가 안내선 (SVG) */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="1.5 3"
                >
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <circle cx="12" cy="12" r="3" strokeDasharray="none" />
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