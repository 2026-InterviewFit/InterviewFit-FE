"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useInterviewStore } from "@/store/useInterviewStore";
import { useInterviewCamera } from "@/hooks/useInterviewCamera";
import { transcribeFollowUpAnswer } from "@/lib/api";

import JobSelectionModal from "./JobSelectionModal";
import AnalysisProgress from "./AnalysisProgress";
import RecordingControls from "./RecordingControls";
import CameraViewport from "./CameraViewport";
import ResumePromptModal from "./ResumePromptModal";
import ResumeUploadModal from "./ResumeUploadModal";

const QUESTIONS_BY_CATEGORY: Record<string, string[]> = {
  "IT/개발": [
    "Q1. 프로젝트 중 가장 해결하기 어려웠던 기술적 한계와 트러블슈팅 경험을 말씀해 주세요.",
    "Q2. 코드 리뷰나 협업 도구를 활용한 팀 개발 경험이 있으시면 구체적으로 설명해 주세요.",
    "Q3. 본인이 가장 자신 있는 기술 스택과 해당 기술을 선택한 이유를 말씀해 주세요.",
  ],
  비즈니스: [
    "Q1. 데이터를 기반으로 의사결정을 내린 경험이 있으시면 구체적으로 설명해 주세요.",
    "Q2. 팀원 간 의견이 대립할 때 조율한 경험과 본인만의 소통 노하우는 무엇인가요?",
    "Q3. 본인이 주도적으로 기획하거나 실행한 프로젝트를 STAR 구조로 말씀해 주세요.",
  ],
  디자인: [
    "Q1. 사용자 중심의 디자인 결정을 내린 경험이 있으시면 구체적으로 설명해 주세요.",
    "Q2. 개발팀 혹은 기획팀과 협업 시 디자인 의도를 효과적으로 전달한 방법을 말씀해 주세요.",
    "Q3. 본인 포트폴리오 중 가장 애착이 가는 작업물과 그 이유를 설명해 주세요.",
  ],
};

interface InterviewRecordingProps {
  onExit: () => void;
}

export default function InterviewRecording({ onExit }: InterviewRecordingProps) {
  const {
    step,
    setStep,
    countdown,
    setCountdown,
    time,
    setTime,
    currentQuestionIdx,
    setCurrentQuestionIdx,
    questionMode,
    followUpQuestion,
    isFetchingFollowUp,
    followUpError,
    requestFollowUp,
    resetFollowUp,
    jobRoles,
    selectedCategory,
    setSelectedCategory,
    selectedJobId,
    setSelectedJobId,
    recommendedJobId,
    isUploadingResume,
    uploadResume,
    interviewId,
    startedUserId,
    jobRoleId,
    fetchJobRoles,
    startInterviewSession,
    reset,
    // 💡 팀원분이 추가하신 핵심: Store에 저장해둔 진짜 질문 데이터 가져오기
    generatedQuestions, 
  } = useInterviewStore();

  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const questionTimestampsRef = useRef<number[]>([0]);
  const onExitRef = useRef(onExit);

  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  const stableOnExit = useCallback(() => {
    onExitRef.current();
  }, []);

  const selectedJobData = useMemo(
    () => jobRoles.find((job) => job.id === selectedJobId),
    [jobRoles, selectedJobId],
  );

  const uniqueCategories = useMemo(
    () => Array.from(new Set(jobRoles.map((job) => job.category))),
    [jobRoles],
  );

  const filteredJobs = useMemo(
    () => jobRoles.filter((job) => job.category === selectedCategory),
    [jobRoles, selectedCategory],
  );

  // 🚀 두 기능의 융합 지점: AI 질문이 있으면 우선 적용, 없으면 카테고리별 폴백 사용
  const currentQuestions = useMemo(() => {
    if (generatedQuestions && generatedQuestions.length > 0) {
      return generatedQuestions.map((q: any) => q.question || q.questionText || q);
    }
    return (
      QUESTIONS_BY_CATEGORY[selectedCategory ?? "IT/개발"] ??
      QUESTIONS_BY_CATEGORY["IT/개발"]
    );
  }, [generatedQuestions, selectedCategory]);

  const currentQuestion = currentQuestions[currentQuestionIdx] ?? "";

  // 현재 화면에 렌더링할 질문 결정
  const displayedQuestion = questionMode === "followup"
    ? followUpQuestion ?? "꼬리질문을 생성하고 있습니다..."
    : currentQuestion;

  useEffect(() => {
    void fetchJobRoles();
    return () => {
      reset();
    };
  }, [fetchJobRoles, reset]);

  useEffect(() => {
    if (followUpError) {
      console.error("[FollowUp Error]", followUpError);
    }
  }, [followUpError]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === "countdown") {
      interval = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    if (step === "recording") {
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, setCountdown, setTime]);

  useEffect(() => {
    if (step === "countdown" && countdown === 0) {
      setStep("recording");
      setCountdown(3);
    }
  }, [countdown, step, setStep, setCountdown]);

  const camera = useInterviewCamera({
    step,
    interviewId,
    startedUserId,
    jobRoleId,
    jobName: selectedJobData?.name,
    currentQuestions,
    questionTimestamps: questionTimestampsRef.current,
    onExit: stableOnExit,
  });

  useEffect(() => {
    if (step === "recording") {
      camera.startAnswerRecording();
    }
  }, [step, camera]);

  // 다음 질문으로 넘어가기 로직 (다음 기본 질문 진행 공통화)
  const proceedToNextBaseQuestion = useCallback(() => {
    resetFollowUp();
    if (currentQuestionIdx < currentQuestions.length - 1) {
      questionTimestampsRef.current.push(time);
      setCurrentQuestionIdx((prev) => prev + 1);
      camera.startAnswerRecording();
    } else {
      setStep("analyzing");
    }
  }, [currentQuestionIdx, currentQuestions.length, resetFollowUp, setCurrentQuestionIdx, setStep, time, camera]);

  const handleNextQuestion = async () => {
    if (isProcessingAnswer || step !== "recording") return;
    setIsProcessingAnswer(true);

    try {
      if (questionMode === "base") {
        const answerBlob = await camera.stopAnswerRecording();
        let transcriptionText = "";

        try {
          const transcription = await transcribeFollowUpAnswer(answerBlob);
          transcriptionText = transcription.text;
        } catch (sttError) {
          console.warn("[STT Error] 텍스트 변환 실패, 다음 질문으로 스킵합니다.", sttError);
          alert("음성 인식에 실패하여 다음 질문으로 넘어갑니다.");
          proceedToNextBaseQuestion();
          return;
        }

        const created = await requestFollowUp({
          originalQuestion: currentQuestion,
          answer: transcriptionText,
        });

        // 꼬리질문 생성 실패 시 무한 로딩 방지 -> 바로 다음 질문으로 넘김
        if (!created) {
          console.warn("[FollowUp] 꼬리질문 생성 실패. 다음 기본 질문으로 넘어갑니다.");
          proceedToNextBaseQuestion();
          return;
        }

        const started = camera.startAnswerRecording();
        if (!started) console.warn("[FollowUp] 오디오 녹음 시작 실패.");
        return;
      }

      // 꼬리질문 답변 시
      await camera.stopAnswerRecording();
      proceedToNextBaseQuestion();

    } catch (error) {
      console.error("[Interview Flow Error] 답변 처리 실패:", error);
      alert(error instanceof Error ? error.message : "오류가 발생했습니다. 다음 질문으로 넘어갑니다.");
      proceedToNextBaseQuestion();
    } finally {
      setIsProcessingAnswer(false);
    }
  };

  const handleFinalExit = () => {
    camera.stopCamera();
    stableOnExit();
  };

  if (step === "analyzing") {
    return (
      <AnalysisProgress
        analysisProgress={camera.analysisProgress}
        analysisResult={camera.analysisResult}
        analysisError={camera.analysisError}
        selectedJobData={selectedJobData}
        onExit={handleFinalExit}
      />
    );
  }

  const isInputPhase = ["resumePrompt", "resumeUpload", "jobSelect"].includes(step);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black font-sans">
      <CameraViewport
        videoRef={camera.videoRef}
        step={step}
        countdown={countdown}
        selectedCategory={selectedCategory}
        selectedJobName={selectedJobData?.name}
        currentQuestionText={displayedQuestion}
        onCancelStop={() => setStep("recording")}
        onConfirmStop={() => setStep("analyzing")}
      />

      {step === "resumePrompt" && (
        <ResumePromptModal
          onYes={() => setStep("resumeUpload")}
          onNo={() => setStep("jobSelect")}
        />
      )}

      {step === "resumeUpload" && (
        <ResumeUploadModal
          isUploading={isUploadingResume}
          onNext={(file) => uploadResume(file)}
          onSkip={() => setStep("jobSelect")}
        />
      )}

      {step === "jobSelect" && (
        <JobSelectionModal
          jobRoles={jobRoles}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedJobId={selectedJobId}
          setSelectedJobId={setSelectedJobId}
          filteredJobs={filteredJobs}
          uniqueCategories={uniqueCategories}
          recommendedJobId={recommendedJobId}
          onStartInterview={startInterviewSession}
        />
      )}

      {!isInputPhase && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex h-32 w-full items-end justify-center pb-12">
          <div className="pointer-events-auto">
            <RecordingControls
              step={step}
              time={time}
              currentQuestionIdx={currentQuestionIdx}
              totalQuestions={currentQuestions.length}
              questionMode={questionMode}
              isProcessingAnswer={isProcessingAnswer || isFetchingFollowUp}
              onStartCountdown={() => setStep("countdown")}
              onStopRecording={() => setStep("confirmStop")}
              onNextQuestion={handleNextQuestion}
            />
          </div>
        </div>
      )}
    </div>
  );
}