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
    setQuestionMode,

    isFollowUpEnabled,
    setIsFollowUpEnabled,
    followUpSlots,
    addFollowUpTask,
    saveFollowUpAnswerTask,

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
    generatedQuestions,
  } = useInterviewStore();

  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [isWaitingForQuestion, setIsWaitingForQuestion] = useState(false);

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

  const currentQuestions = useMemo(() => {
    if (generatedQuestions.length > 0) {
      return generatedQuestions.map((question) => question.question);
    }

    return (
      QUESTIONS_BY_CATEGORY[selectedCategory ?? "IT/개발"] ??
      QUESTIONS_BY_CATEGORY["IT/개발"]
    );
  }, [generatedQuestions, selectedCategory]);

  const currentQuestion = currentQuestions[currentQuestionIdx] ?? "";
  const currentFollowUpSlot = followUpSlots[currentQuestionIdx];

  const displayedQuestion = useMemo(() => {
    if (questionMode === "base") {
      return currentQuestion;
    }

    if (currentFollowUpSlot?.status === "ready" && currentFollowUpSlot.question) {
      return currentFollowUpSlot.question;
    }

    if (currentFollowUpSlot?.status === "loading") {
      return "답변을 분석하여 꼬리질문을 준비하고 있습니다...\n잠시만 기다려주세요.";
    }

    return "다음 꼬리질문을 확인하고 있습니다...";
  }, [questionMode, currentQuestion, currentFollowUpSlot]);

  const findNextFollowUpIndex = useCallback(
    (startIndex: number) => {
      for (let index = startIndex; index < followUpSlots.length; index += 1) {
        const status = followUpSlots[index]?.status;

        if (status === "ready" || status === "loading") {
          return index;
        }
      }

      return -1;
    },
    [followUpSlots],
  );

  useEffect(() => {
    void fetchJobRoles();

    return () => {
      reset();
    };
  }, [fetchJobRoles, reset]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (step === "countdown") {
      interval = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }

    if (step === "recording") {
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
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

  /**
   * 기본 질문은 Q1 -> Q2 -> Q3 순서로 바로 이어서 진행한다.
   * 각 답변의 STT/Gemini 꼬리질문 생성은 백그라운드에서 동시에 수행된다.
   */
  useEffect(() => {
    if (step === "recording" && questionMode === "base") {
      camera.startAnswerRecording();
    }
  }, [step, questionMode, camera]);

  /**
   * 기본 질문 3개가 모두 끝난 뒤 꼬리질문 단계로 진입한다.
   * Q1/Q2/Q3 순서를 유지하고, 특정 꼬리질문 생성에 실패하면 그 항목만 건너뛴다.
   */
  useEffect(() => {
    if (
      step !== "recording" ||
      questionMode !== "followup" ||
      !isWaitingForQuestion
    ) {
      return;
    }

    const slot = followUpSlots[currentQuestionIdx];

    if (slot?.status === "ready") {
      const started = camera.startAnswerRecording();

      if (started) {
        setIsWaitingForQuestion(false);
      }
      return;
    }

    if (slot?.status === "loading") {
      return;
    }

    const nextIndex = findNextFollowUpIndex(currentQuestionIdx + 1);

    if (nextIndex >= 0) {
      setCurrentQuestionIdx(nextIndex);
      return;
    }

    setIsWaitingForQuestion(false);
    setStep("analyzing");
  }, [
    step,
    questionMode,
    isWaitingForQuestion,
    followUpSlots,
    currentQuestionIdx,
    camera,
    findNextFollowUpIndex,
    setCurrentQuestionIdx,
    setStep,
  ]);

  const proceedToNextQuestion = useCallback(() => {
    if (questionMode === "base") {
      if (currentQuestionIdx < currentQuestions.length - 1) {
        questionTimestampsRef.current.push(time);
        setCurrentQuestionIdx((prev) => prev + 1);
        camera.startAnswerRecording();
        return;
      }

      if (!isFollowUpEnabled) {
        setStep("analyzing");
        return;
      }

      /*
       * 마지막 기본 답변의 꼬리질문 task를 방금 시작했을 수 있으므로
       * 현재 렌더의 followUpSlots를 보고 즉시 종료 여부를 판단하지 않는다.
       * followup 모드로 전환한 뒤 effect가 최신 슬롯 상태를 확인한다.
       */
      setQuestionMode("followup");
      setCurrentQuestionIdx(0);
      setIsWaitingForQuestion(true);
      return;
    }

    const nextFollowUpIndex = findNextFollowUpIndex(currentQuestionIdx + 1);

    if (nextFollowUpIndex >= 0) {
      setCurrentQuestionIdx(nextFollowUpIndex);
      setIsWaitingForQuestion(true);
      return;
    }

    setStep("analyzing");
  }, [
    questionMode,
    currentQuestionIdx,
    currentQuestions.length,
    isFollowUpEnabled,
    time,
    camera,
    findNextFollowUpIndex,
    setCurrentQuestionIdx,
    setQuestionMode,
    setStep,
  ]);

  const handleNextQuestion = async () => {
    if (isProcessingAnswer || step !== "recording") {
      return;
    }

    setIsProcessingAnswer(true);

    try {
      const answerBlob = await camera.stopAnswerRecording();

      if (questionMode === "base") {
        if (isFollowUpEnabled) {
          const currentGeneratedQuestion = generatedQuestions[currentQuestionIdx];
          const sourceQuestionId = currentGeneratedQuestion?.id;

          /*
           * 기다리지 않는다.
           * Q1 답변 -> 꼬리질문 생성 시작과 동시에 Q2로 진행한다.
           */
          void addFollowUpTask(
            answerBlob,
            currentQuestion,
            currentQuestionIdx,
            sourceQuestionId,
          );
        }
      } else if (
        currentFollowUpSlot?.status === "ready" &&
        currentFollowUpSlot.followUpQuestionId
      ) {
        /*
         * 꼬리답변 STT/DB 저장도 다음 질문 진행을 막지 않도록 백그라운드 처리한다.
         */
        void saveFollowUpAnswerTask(
          answerBlob,
          currentFollowUpSlot.followUpQuestionId,
        );
      }

      proceedToNextQuestion();
    } catch (error) {
      console.error("[Interview Flow Error] 답변 처리 실패:", error);
      alert("답변 처리 중 오류가 발생했습니다. 다음 질문으로 넘어갑니다.");
      proceedToNextQuestion();
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
          isFollowUpEnabled={isFollowUpEnabled}
          setIsFollowUpEnabled={setIsFollowUpEnabled}
        />
      )}

      {!isInputPhase && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex h-32 w-full items-end justify-center pb-12">
          <div className="pointer-events-auto">
            <RecordingControls
              step={step}
              time={time}
              currentQuestionIdx={currentQuestionIdx}
              totalQuestions={
                questionMode === "base"
                  ? currentQuestions.length
                  : Math.max(followUpSlots.length, 1)
              }
              questionMode={questionMode}
              isProcessingAnswer={
                isProcessingAnswer ||
                (questionMode === "followup" && isWaitingForQuestion)
              }
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
