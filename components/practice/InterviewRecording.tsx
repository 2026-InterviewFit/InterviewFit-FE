// components/practice/InterviewRecording.tsx

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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


export default function InterviewRecording({
  onExit,
}: InterviewRecordingProps) {
  const {
    step,
    setStep,

    countdown,
    setCountdown,

    time,
    setTime,

    currentQuestionIdx,
    setCurrentQuestionIdx,

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

    // followup 관련
    questionMode,
    followUpQuestion,
    isFetchingFollowUp,
    requestFollowUp,
    saveFollowUpAnswer,
    resetFollowUp,

    // answerOrder 관련
    incrementAnswerOrder,

    reset,
  } = useInterviewStore();


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
    () =>
      jobRoles.filter((job) => job.category === selectedCategory),
    [jobRoles, selectedCategory],
  );


  const currentQuestions = useMemo(
    () =>
      QUESTIONS_BY_CATEGORY[selectedCategory ?? "IT/개발"] ??
      QUESTIONS_BY_CATEGORY["IT/개발"],
    [selectedCategory],
  );


  const currentBaseQuestion =
    currentQuestions[currentQuestionIdx] ?? "";


  const displayedQuestion =
    questionMode === "followup" && followUpQuestion
      ? followUpQuestion
      : currentBaseQuestion;


  useEffect(() => {
    void fetchJobRoles();

    return () => {
      reset();
    };
  }, [fetchJobRoles, reset]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (step === "countdown") {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    if (step === "recording") {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
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


  // eslint-disable-next-line react-hooks/refs
  const camera = useInterviewCamera({
    step,
    interviewId,
    startedUserId,
    jobRoleId,
    jobName: selectedJobData?.name,
    currentQuestions,
    // eslint-disable-next-line react-hooks/refs
    questionTimestamps: questionTimestampsRef.current,
    onExit: stableOnExit,
  });


  /**
   * STT / 꼬리질문 API 처리 중 중복 클릭 방지.
   */
  const isHandlingAnswerRef = useRef(false);


  /**
   * 화면에 새 질문(기본/꼬리)이 표시될 때마다
   * 해당 답변 구간만 별도 audio MediaRecorder로 녹음한다.
   *
   * 전체 면접 영상 MediaRecorder는 useInterviewCamera 내부에서
   * 별도로 계속 녹화되므로 눈깜빡임/자세 분석 영상은 끊기지 않는다.
   */
  useEffect(() => {
    if (step !== "recording") {
      return;
    }

    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const tryStartRecording = () => {
      const started =
        camera.startAnswerRecording();

      if (!started) {
        retryTimer = setTimeout(
          tryStartRecording,
          300,
        );
      }
    };

    tryStartRecording();

    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [
    step,
    questionMode,
    currentQuestionIdx,
    followUpQuestion,
    camera.startAnswerRecording,
  ]);


  /**
   * "답변 완료" 버튼 처리.
   *
   * 흐름:
   *   [기본질문 답변 완료]
   *     → 꼬리질문 API 호출 → 꼬리질문 화면 표시
   *
   *   [꼬리질문 답변 완료]
   *     → follow_up_answers 저장 → 다음 기본질문 (또는 분석 화면)
   *
   * 각 실패 시:
   *   에러를 콘솔에 남기고 흐름은 계속 진행 (사용자 막지 않음)
   */
  const handleNextQuestion = async () => {
    if (isFetchingFollowUp || isHandlingAnswerRef.current) {
      return;
    }

    isHandlingAnswerRef.current = true;

    try {
      /**
       * 현재 질문의 답변 오디오를 먼저 종료하고
       * Whisper STT로 실제 답변 텍스트를 얻는다.
       */
      const answerAudio =
        await camera.stopAnswerRecording();

      const transcription =
        await transcribeFollowUpAnswer(
          answerAudio,
        );

      const answerText =
        transcription.text.trim();

      if (!answerText) {
        throw new Error(
          "답변 음성을 인식하지 못했습니다.",
        );
      }


      /**
       * 1) 기본 질문 답변 완료
       *    실제 STT 텍스트를 Gemini 꼬리질문 생성에 사용한다.
       */
      if (questionMode === "base") {
        incrementAnswerOrder();

        const success =
          await requestFollowUp({
            originalQuestion:
              currentBaseQuestion,
            answerText,
            followUpStartTime: time,
          });

        if (success) {
          // store가 questionMode를 followup으로 바꾸면
          // 위 useEffect가 꼬리질문 답변 녹음을 자동 시작한다.
          return;
        }

        console.warn(
          "꼬리질문 생성에 실패해 다음 기본 질문으로 넘어갑니다.",
        );
      }


      /**
       * 2) 꼬리질문 답변 완료
       *    실제 STT 텍스트를 follow_up_answers에 저장한다.
       *    여기서는 재귀 꼬리질문을 만들지 않는다.
       */
      if (questionMode === "followup") {
        const saved =
          await saveFollowUpAnswer({
            endTime: time,
            answerText,
          });

        if (!saved) {
          throw new Error(
            "꼬리질문 답변 저장에 실패했습니다.",
          );
        }

        incrementAnswerOrder();
      }


      /**
       * 다음 기본 질문으로 이동.
       */
      if (
        currentQuestionIdx <
        currentQuestions.length - 1
      ) {
        questionTimestampsRef.current.push(
          time,
        );

        setCurrentQuestionIdx(
          (prev) => prev + 1,
        );

        resetFollowUp();
        return;
      }


      /**
       * 마지막 꼬리질문 답변까지 저장했으면
       * 기존 전체 영상 분석 단계로 이동한다.
       */
      resetFollowUp();
      setStep("analyzing");

    } catch (error) {
      console.error(
        "[FollowUp] 답변 처리 실패:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "답변 처리 중 오류가 발생했습니다.",
      );

      /**
       * 실패 시 현재 질문에 다시 답할 수 있도록
       * 새 답변 녹음을 시작한다.
       */
      if (step === "recording") {
        camera.startAnswerRecording();
      }

    } finally {
      isHandlingAnswerRef.current = false;
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


  const isInputPhase = [
    "resumePrompt",
    "resumeUpload",
    "jobSelect",
  ].includes(step);


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
              isProcessingAnswer={
                isFetchingFollowUp ||
                isHandlingAnswerRef.current
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