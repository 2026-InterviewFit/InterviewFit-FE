"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  ChevronRight,
  HelpCircle,
  Briefcase,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  createQuestions,
  getJobRoles,
  getInterviewReport,
  startInterview,
  uploadInterviewAnswer,
  type InterviewAnswerUploadResponse,
  type InterviewReportResponse,
  type InterviewStartResponse,
  type JobRole,
  type Question,
} from "@/lib/api";

type Step =
  | "jobSelect"
  | "prepare"
  | "countdown"
  | "recording"
  | "confirmStop"
  | "analyzing";

const LOADING_TIPS = [
  {
    category: "💡 면접 꿀팁",
    text: "답변을 하다가 막힐 때는 1~2초간 천천히 숨을 고르고 '잠시 생각할 시간을 주시겠습니까?'라고 정중히 양해를 구해보세요.",
  },
  {
    category: "👔 면접 복장 추천",
    text: "IT/개발 직군은 너무 딱딱한 정장보다 깔끔한 셔츠나 슬랙스, 단정한 니트 레이어드가 훨씬 세련되고 전문적인 인상을 줍니다.",
  },
  {
    category: "🗣️ 면접 멘트 추천",
    text: "협업 갈등을 묻는 질문에는 '제 의견이 옳다'보다는 '팀의 목표를 위해 어떤 조율 과정을 거쳤는지' STAR 구조로 풀어내는 것이 핵심입니다.",
  },
  {
    category: "💻 개발일화",
    text: "인터뷰핏의 AI 엔진은 은재님 팀이 새벽에 마시는 커피의 양과 정비례해서 고도화되고 있다는 소문이 있습니다...☕",
  },
  {
    category: "💡 실시간 채용 정보",
    text: "최근 테크 기업들은 단순 기술 나열보다, 하나의 프로젝트라도 깊게 파고들어 직면한 한계를 어떻게 트러블슈팅했는지를 집중적으로 평가합니다.",
  },
];

export default function InterviewRecording({ onExit }: { onExit: () => void }) {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const selectedJobRole = jobRoles.find((job) => job.id === selectedJob) ?? null;

  const [step, setStep] = useState<Step>("jobSelect");
  const [countdown, setCountdown] = useState(3);
  const [time, setTime] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(1);
  const [analysisError, setAnalysisError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [interviewReport, setInterviewReport] = useState<InterviewReportResponse | null>(null);
  const [isPollingReport, setIsPollingReport] = useState(false);

  const [interviewSession, setInterviewSession] =
    useState<InterviewStartResponse | null>(null);
  const [answerUploads, setAnswerUploads] = useState<
    InterviewAnswerUploadResponse[]
  >([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isUploadingAnswer, setIsUploadingAnswer] = useState(false);

  const currentQuestions = questions;
  const currentQuestion = currentQuestions[currentQuestionIdx];
  const isAllAnswersUploaded =
    answerUploads.length > 0 && answerUploads.length === currentQuestions.length;
  const isAnalysisCompleted = interviewReport?.completed === true;
  const analysisStatusText = analysisError
    ? "오류"
    : isAnalysisCompleted
      ? "분석 완료"
      : "분석 중";

  useEffect(() => {
    const fetchJobRoles = async () => {
      try {
        const data = await getJobRoles();
        console.log("직무 목록 조회 성공", data);
        setJobRoles(data);
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

  const startRecordingSegment = () => {
    if (!streamRef.current) {
      throw new Error("카메라/마이크 스트림이 준비되지 않았습니다.");
    }

    if (mediaRecorderRef.current?.state === "recording") {
      return;
    }

    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : "video/webm";

    const recorder = new MediaRecorder(streamRef.current, { mimeType });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current = recorder;
    recorder.start(1000);
  };

  const stopRecordingSegment = () => {
    return new Promise<Blob>((resolve, reject) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder) {
        reject(new Error("진행 중인 녹화가 없습니다."));
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "video/webm",
        });

        mediaRecorderRef.current = null;
        chunksRef.current = [];

        if (blob.size === 0) {
          reject(new Error("녹화된 영상 파일이 비어 있습니다."));
          return;
        }

        resolve(blob);
      };

      if (recorder.state === "recording") {
        recorder.requestData();
        recorder.stop();
        return;
      }

      reject(new Error(`녹화 상태가 올바르지 않습니다: ${recorder.state}`));
    });
  };

  useEffect(() => {
    if (step !== "recording") return;

    try {
      startRecordingSegment();
    } catch (error) {
      console.error(error);
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "녹화를 시작하는 중 오류가 발생했습니다."
      );
      setStep("analyzing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currentQuestionIdx]);

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
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
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

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }

        const increment = prev > 80 ? 1 : Math.floor(Math.random() * 8) + 3;
        return Math.min(prev + increment, 95);
      });
    }, 400);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, [step]);

  const saveLatestInterviewJob = (
    session: InterviewStartResponse,
    uploads: InterviewAnswerUploadResponse[]
  ) => {
    if (typeof window === "undefined") return;

    const job = {
      interviewId: session.interviewId,
      userId: session.userId,
      jobRoleId: session.jobRoleId,
      jobName: session.jobName,
      answers: uploads,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("latestInterviewAnalysisJob", JSON.stringify(job));

    const rawHistory = localStorage.getItem("interviewAnalysisHistory");
    const history = rawHistory ? JSON.parse(rawHistory) : [];
    const nextHistory = [
      job,
      ...history.filter((item: { interviewId?: number }) => item.interviewId !== session.interviewId),
    ];

    localStorage.setItem(
      "interviewAnalysisHistory",
      JSON.stringify(nextHistory.slice(0, 20))
    );
  };

  const handleStartInterview = async () => {
    if (!selectedJob) return;

    try {
      setIsLoadingQuestions(true);
      setAnalysisError("");
      setInterviewReport(null);
      setIsPollingReport(false);
      setAnswerUploads([]);
      setCurrentQuestionIdx(0);
      setTime(0);

      const session = await startInterview({
        jobRoleId: selectedJob,
      });

      console.log("면접 세션 생성 성공", session);
      setInterviewSession(session);

      const response = await createQuestions({
        count: 3,
        jobRoleId: selectedJob,
      });

      if (response.length === 0) {
        throw new Error("생성된 질문이 없습니다.");
      }

      console.log("질문 조회 성공", response);
      setQuestions(response);

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "latestInterviewSession",
          JSON.stringify({
            ...session,
            questions: response,
            savedAt: new Date().toISOString(),
          })
        );
      }

      setStep("prepare");
    } catch (error) {
      console.error("면접 시작 실패", error);
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "면접 시작 중 알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleCompleteCurrentAnswer = async () => {
    if (!interviewSession) {
      setAnalysisError("면접 세션이 없습니다. 다시 시작해주세요.");
      setStep("analyzing");
      return;
    }

    if (!currentQuestion) {
      setAnalysisError("현재 질문 정보가 없습니다.");
      setStep("analyzing");
      return;
    }

    try {
      setIsUploadingAnswer(true);
      setUploadMessage(`${currentQuestionIdx + 1}번 답변 영상을 저장하는 중...`);

      const blob = await stopRecordingSegment();

      console.log("답변 녹화 blob size:", blob.size);
      console.log("답변 녹화 blob type:", blob.type);

      const uploadResult = await uploadInterviewAnswer({
        interviewId: interviewSession.interviewId,
        file: blob,
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        answerOrder: currentQuestionIdx + 1,
      });

      console.log("질문별 답변 업로드 결과", uploadResult);

      const nextUploads = [...answerUploads, uploadResult];
      setAnswerUploads(nextUploads);
      saveLatestInterviewJob(interviewSession, nextUploads);

      if (currentQuestionIdx < currentQuestions.length - 1) {
        setCurrentQuestionIdx((prev) => prev + 1);
        setTime(0);
        setUploadMessage("");
        setStep("recording");
        return;
      }

      setUploadMessage("모든 답변 업로드 완료. 서버에서 AI 분석을 진행 중입니다.");
      setAnalysisProgress(100);
      setStep("analyzing");
    } catch (error) {
      console.error(error);
      setAnalysisProgress(100);
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "답변 영상 업로드 중 알 수 없는 오류가 발생했습니다."
      );
      setStep("analyzing");
    } finally {
      setIsUploadingAnswer(false);
    }
  };


  useEffect(() => {
    if (step !== "analyzing") return;
    if (!interviewSession) return;
    if (!isAllAnswersUploaded) return;
    if (analysisError) return;

    let stopped = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const pollReport = async () => {
      try {
        setIsPollingReport(true);

        const report = await getInterviewReport(interviewSession.interviewId);

        if (stopped) return;

        setInterviewReport(report);

        if (report.completed) {
          setAnalysisProgress(100);
          setUploadMessage("AI 분석이 완료되었습니다. 대시보드에서 결과를 확인할 수 있습니다.");
          setIsPollingReport(false);

          saveLatestInterviewJob(interviewSession, answerUploads);

          if (intervalId) {
            clearInterval(intervalId);
          }

          return;
        }

        if (report.analysisStatus === "FAILED") {
          const failedAnswer = report.answers.find(
            (answer) => answer.analysisStatus === "FAILED"
          );

          throw new Error(
            failedAnswer?.errorMessage || "분석 중 실패한 답변이 있습니다."
          );
        }
      } catch (error) {
        if (stopped) return;

        console.error("면접 분석 결과 조회 실패", error);
        setAnalysisError(
          error instanceof Error
            ? error.message
            : "면접 분석 결과를 조회하는 중 오류가 발생했습니다."
        );
        setIsPollingReport(false);

        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    };

    pollReport();
    intervalId = setInterval(pollReport, 3000);

    return () => {
      stopped = true;

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, interviewSession?.interviewId, isAllAnswersUploaded, analysisError]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const remainSeconds = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainSeconds}`;
  };

  const handleFinalExit = () => {
    if (!analysisError && isAllAnswersUploaded && !isAnalysisCompleted) {
      return;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    onExit();
  };

  if (step === "analyzing") {
    return (
      <div className="relative flex h-full w-full select-none flex-col items-center justify-center bg-bg p-8 font-sans text-ink">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
          <div className="absolute -top-40 -left-20 h-[650px] w-[650px] rounded-full bg-[#fef08a]/40 blur-[140px]" />
          <div className="absolute top-10 -right-20 h-[750px] w-[750px] rounded-full bg-[#bfdbfe]/60 blur-[160px]" />
          <div className="absolute bottom-[-150px] left-1/4 h-[600px] w-[600px] rounded-full bg-[#e9d5ff]/30 blur-[130px]" />
        </div>

        <div className="relative z-10 flex w-full max-w-2xl flex-col items-center space-y-8 text-center">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-black/[0.04]" />

            {!isAnalysisCompleted && !analysisError && (
              <div className="absolute inset-0 animate-[spin_2s_linear_infinite] rounded-full border-4 border-transparent border-t-blue-500" />
            )}

            {isAnalysisCompleted && !analysisError && (
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            )}

            {analysisError && <AlertCircle className="h-12 w-12 text-red-500" />}

            {!isAnalysisCompleted && !analysisError && (
              <span className="font-serif text-xl font-bold tracking-tight text-navy">
                {analysisProgress}%
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-navy">
              {analysisError
                ? "분석 요청 중 오류가 발생했습니다"
                : isAnalysisCompleted
                  ? "AI 분석 완료"
                  : isAllAnswersUploaded
                    ? "AI 분석 중..."
                    : "면접 답변 저장 중..."}
            </h2>

            <p className="text-sm text-muted">
              {analysisError
                ? "오류 내용을 확인한 뒤 다시 시도해주세요."
                : isAnalysisCompleted
                  ? "분석이 완료되었습니다. 아래 버튼을 눌러 대시보드에서 결과를 확인하세요."
                  : isAllAnswersUploaded
                    ? "Spring 서버가 FastAPI로 eye/pose/speech 분석을 진행 중입니다. 완료되면 버튼이 활성화됩니다."
                    : uploadMessage ||
                      "질문별 답변 영상을 Spring 서버로 전송하고 있습니다."}
            </p>
          </div>

          {!isAnalysisCompleted && !analysisError && (
            <div className="flex min-h-[160px] w-full flex-col items-center justify-center overflow-hidden rounded-[32px] border border-black/[0.04] bg-white/70 p-8 text-center shadow-sm backdrop-blur-md">
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
                  <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                    {LOADING_TIPS[tipIdx].category}
                  </span>
                  <p className="max-w-md text-sm font-semibold leading-relaxed text-navy">
                    {LOADING_TIPS[tipIdx].text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {isAllAnswersUploaded && !analysisError && (
            <div className="w-full rounded-[32px] border border-black/[0.04] bg-white/80 p-8 text-left shadow-sm backdrop-blur-md">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-5">
                  <p className="text-xs font-bold text-blue-600">면접 ID</p>
                  <p className="mt-2 text-2xl font-bold text-navy">
                    {interviewSession?.interviewId ?? "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-5">
                  <p className="text-xs font-bold text-emerald-600">업로드 답변</p>
                  <p className="mt-2 text-2xl font-bold text-navy">
                    {answerUploads.length}개
                  </p>
                </div>

                <div className="rounded-2xl bg-purple-50 p-5">
                  <p className="text-xs font-bold text-purple-600">상태</p>
                  <p className="mt-2 text-2xl font-bold text-navy">{analysisStatusText}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-gray-50 p-5">
                <p className="text-xs font-bold text-gray-500">업로드된 answerId</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-navy">
                  {answerUploads.map((answer) => answer.answerId).join(", ")}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  {isAnalysisCompleted
                    ? "백엔드 분석이 완료되어 대시보드에서 결과를 확인할 수 있습니다."
                    : isPollingReport
                      ? "백엔드 분석 상태를 확인하는 중입니다. 모든 답변이 DONE으로 바뀌면 버튼이 활성화됩니다."
                      : "업로드 직후 상태는 UPLOADED가 정상입니다. 백엔드 비동기 분석이 완료되면 DB에서 DONE으로 변경됩니다."}
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
            disabled={!analysisError && isAllAnswersUploaded && !isAnalysisCompleted}
            onClick={handleFinalExit}
            className={`rounded-full px-10 py-4 text-sm font-bold text-white shadow-lg shadow-navy/10 transition-colors ${
              !analysisError && isAllAnswersUploaded && !isAnalysisCompleted
                ? "cursor-not-allowed bg-gray-400"
                : "bg-navy hover:bg-navy-dark"
            }`}
          >
            {analysisError
              ? "대시보드로 이동하기"
              : isAnalysisCompleted
                ? "대시보드에서 결과 확인하기"
                : "분석 완료를 기다리는 중..."}
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
        className={`absolute inset-0 h-full w-full -scale-x-100 transform object-cover transition-all duration-500 ${
          step === "jobSelect" ? "opacity-25 blur-sm" : "opacity-80"
        }`}
      />

      {step === "jobSelect" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-sm rounded-[32px] border border-white/30 bg-white p-8 shadow-2xl"
          >
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-navy">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight text-navy">
                  직무를 선택해 주세요
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  직무에 맞는 면접 질문이 출제됩니다
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mb-6 grid grid-cols-2 gap-2"
              >
                {jobRoles.map((job) => {
                  const isSelected = selectedJob === job.id;

                  return (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job.id)}
                      className={`rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                        isSelected
                          ? "border-navy bg-blue-50 text-navy"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`mb-1.5 block h-2 w-2 rounded-full ${
                          isSelected ? "bg-navy" : "bg-gray-300"
                        }`}
                      />
                      <div>{job.name}</div>
                      <div className="mt-1 text-xs text-gray-400">
                        {job.category}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {analysisError && (
              <div className="mb-4 rounded-2xl bg-red-50 p-4 text-xs font-semibold leading-relaxed text-red-500">
                {analysisError}
              </div>
            )}

            <button
              disabled={!selectedJob || isLoadingQuestions}
              onClick={handleStartInterview}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all duration-200 ${
                selectedJob && !isLoadingQuestions
                  ? "bg-navy text-white shadow-md shadow-navy/20 hover:-translate-y-0.5 hover:bg-navy-dark"
                  : "cursor-not-allowed bg-gray-100 text-gray-400"
              }`}
            >
              {isLoadingQuestions
                ? "면접 세션 생성 중..."
                : selectedJobRole
                  ? `${selectedJobRole.name} 면접 시작하기`
                  : "직무를 선택해 주세요"}
              {selectedJob && !isLoadingQuestions && (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </motion.div>
        </div>
      )}

      {step !== "jobSelect" && (
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-8">
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
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-8 py-3 text-sm font-medium text-white backdrop-blur-md">
                    아이콘 라인에 상체를 맞춰주세요.
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/20 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                    <span className="opacity-70">
                      {selectedJobRole?.category ?? "직무"}
                    </span>
                    <span className="opacity-40">·</span>
                    <span>{selectedJobRole?.name ?? "선택 완료"}</span>
                  </div>
                </motion.div>
              )}

              {step === "recording" && currentQuestion && (
                <motion.div
                  key={`question-${currentQuestionIdx}`}
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex max-w-2xl flex-col items-center rounded-[28px] border border-white/40 bg-white px-10 py-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Q{currentQuestionIdx + 1}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {selectedJobRole?.category} · {selectedJobRole?.name}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-bold leading-snug text-navy">
                    {currentQuestion.question}
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
                className="pointer-events-none flex h-[500px] w-[500px] items-center justify-center text-white drop-shadow-2xl"
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
                  <path
                    d="M3,21 C3,15.5 7,13 12,13 C17,13 21,15.5 21,21"
                    strokeLinecap="round"
                  />
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
                className="font-serif text-[140px] font-bold text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
              >
                {countdown}
              </motion.div>
            )}

            {step === "confirmStop" && (
              <div className="w-full max-w-sm rounded-[32px] border border-black/[0.03] bg-white p-8 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-navy">답변을 완료할까요?</h3>
                <p className="mt-2 px-2 text-xs leading-relaxed text-muted">
                  현재 질문의 녹화를 종료하고 답변 영상을 서버로 업로드합니다.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    onClick={() => setStep("recording")}
                    disabled={isUploadingAnswer}
                    className="w-full rounded-2xl bg-navy py-3.5 text-sm font-bold text-white shadow-md shadow-navy/10 transition-colors hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    아니요, 계속 답변하기
                  </button>
                  <button
                    onClick={handleCompleteCurrentAnswer}
                    disabled={isUploadingAnswer}
                    className="w-full rounded-2xl bg-red-50 py-3.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-100/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploadingAnswer
                      ? "답변 저장 중..."
                      : currentQuestionIdx === currentQuestions.length - 1
                        ? "네, 최종 답변 저장하기"
                        : "네, 저장하고 다음 질문으로"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex h-24 w-full items-end justify-center pb-4">
            {step === "prepare" ? (
              <button
                onClick={() => setStep("countdown")}
                className="rounded-full bg-blue-600 px-10 py-4 text-base font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-transform hover:scale-103"
              >
                자세 정렬 완료 (촬영 시작)
              </button>
            ) : (
              step !== "confirmStop" && (
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-6 rounded-full border border-white/10 bg-black/75 px-6 py-3.5 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2.5">
                      <Mic className="h-4 w-4 text-white/60" />
                      <div className="flex h-3 items-end gap-0.5">
                        <motion.div
                          animate={{ height: ["30%", "100%", "30%"] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="w-1 rounded-full bg-emerald-400"
                        />
                        <motion.div
                          animate={{ height: ["70%", "40%", "90%"] }}
                          transition={{ repeat: Infinity, duration: 0.5 }}
                          className="w-1 rounded-full bg-emerald-400"
                        />
                        <motion.div
                          animate={{ height: ["40%", "80%", "50%"] }}
                          transition={{ repeat: Infinity, duration: 0.6 }}
                          className="w-1 rounded-full bg-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="h-6 w-px bg-white/20" />

                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                      <span className="font-mono text-lg font-medium tracking-widest text-white">
                        {formatTime(time)}
                      </span>
                    </div>

                    <div className="h-6 w-px bg-white/20" />

                    <button
                      onClick={() => setStep("confirmStop")}
                      disabled={isUploadingAnswer}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-400 transition-colors hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Square className="h-3 w-3 fill-current" />
                      답변 완료
                    </button>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleCompleteCurrentAnswer}
                    disabled={isUploadingAnswer}
                    className="flex items-center gap-1.5 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-navy shadow-xl transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>
                      {isUploadingAnswer
                        ? "답변 저장 중..."
                        : currentQuestionIdx === currentQuestions.length - 1
                          ? "최종 답변 완료"
                          : "답변 완료 (다음 질문)"}
                    </span>
                    {!isUploadingAnswer && <ChevronRight className="h-4 w-4" />}
                    {isUploadingAnswer && <Loader2 className="h-4 w-4 animate-spin" />}
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
