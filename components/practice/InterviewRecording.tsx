// components/practice/InterviewRecording.tsx

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


/**
 * 현재 기본 질문.
 *
 * 이 부분은 다른 팀원이 서버 질문 생성 기능을 연결하면
 * 나중에 서버에서 받은 질문 배열로 교체하면 된다.
 *
 * followup 파트에서는 질문 생성 자체를 수정하지 않는다.
 */
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
  } = useInterviewStore();


  /**
   * 답변 음성 STT + 꼬리질문 생성 처리 중 여부.
   *
   * 연속 클릭으로 동일 답변이 여러 번 전송되는 것을 막는다.
   */
  const [isProcessingAnswer, setIsProcessingAnswer] =
    useState(false);


  /**
   * 각 기본 질문이 시작된 시점.
   *
   * 현재 전체 영상 분석에서 사용하고 있다.
   */
  const questionTimestampsRef =
    useRef<number[]>([0]);


  /**
   * 부모 컴포넌트가 다시 렌더링되더라도
   * onExit 참조가 바뀌어서 카메라가 재실행되지 않도록 한다.
   */
  const onExitRef =
    useRef(onExit);

  useEffect(() => {
    onExitRef.current =
      onExit;
  }, [onExit]);


  /**
   * useInterviewCamera에 전달할
   * 안정화된 종료 함수.
   */
  const stableOnExit =
    useCallback(() => {
      onExitRef.current();
    }, []);


  /**
   * 현재 선택된 직무.
   */
  const selectedJobData =
    useMemo(
      () =>
        jobRoles.find(
          (job) =>
            job.id ===
            selectedJobId,
        ),
      [
        jobRoles,
        selectedJobId,
      ],
    );


  /**
   * 중복 제거된 직무 카테고리 목록.
   */
  const uniqueCategories =
    useMemo(
      () =>
        Array.from(
          new Set(
            jobRoles.map(
              (job) =>
                job.category,
            ),
          ),
        ),
      [jobRoles],
    );


  /**
   * 선택한 카테고리에 해당하는 직무 목록.
   */
  const filteredJobs =
    useMemo(
      () =>
        jobRoles.filter(
          (job) =>
            job.category ===
            selectedCategory,
        ),
      [
        jobRoles,
        selectedCategory,
      ],
    );


  /**
   * 현재 카테고리의 기본 질문 목록.
   *
   * 다른 팀원이 질문 생성 기능을 연결하면
   * 이 부분만 서버 질문 배열로 변경하면 된다.
   */
  const currentQuestions =
    useMemo(
      () =>
        QUESTIONS_BY_CATEGORY[
          selectedCategory ??
            "IT/개발"
        ] ??
        QUESTIONS_BY_CATEGORY[
          "IT/개발"
        ],
      [
        selectedCategory,
      ],
    );


  /**
   * 현재 기본 질문.
   *
   * 일반 질문 생성/조회는 다른 팀원의 담당이므로
   * 현재 하드코딩 질문 구조를 그대로 유지한다.
   */
  const currentQuestion =
    currentQuestions[
      currentQuestionIdx
    ] ?? "";


  /**
   * 실제 화면에 표시할 질문.
   *
   * base     -> 현재 기본 질문
   * followup -> Gemini가 방금 생성한 꼬리질문
   */
  const displayedQuestion =
    questionMode === "followup"
      ? followUpQuestion ??
        "꼬리질문을 불러오는 중입니다..."
      : currentQuestion;


  /**
   * 페이지 진입 시 직무 목록 조회.
   *
   * 컴포넌트 종료 시 면접 상태 초기화.
   */
  useEffect(() => {
    void fetchJobRoles();

    return () => {
      reset();
    };
  }, [
    fetchJobRoles,
    reset,
  ]);


  /**
   * store에서 발생한 꼬리질문 API 오류는
   * 개발 중 확인할 수 있도록 콘솔에 남긴다.
   */
  useEffect(() => {
    if (followUpError) {
      console.error(
        "[FollowUp]",
        followUpError,
      );
    }
  }, [followUpError]);


  /**
   * 카운트다운 / 녹화 시간 처리.
   */
  useEffect(() => {
    let interval:
      | NodeJS.Timeout
      | null = null;

    if (
      step ===
      "countdown"
    ) {
      interval =
        setInterval(
          () => {
            setCountdown(
              (prev) =>
                prev - 1,
            );
          },
          1000,
        );
    }

    if (
      step ===
      "recording"
    ) {
      interval =
        setInterval(
          () => {
            setTime(
              (prev) =>
                prev + 1,
            );
          },
          1000,
        );
    }

    return () => {
      if (interval) {
        clearInterval(
          interval,
        );
      }
    };
  }, [
    step,
    setCountdown,
    setTime,
  ]);


  /**
   * 3 → 2 → 1 → 0 이후
   * 실제 녹화 상태로 전환.
   */
  useEffect(() => {
    if (
      step ===
        "countdown" &&
      countdown === 0
    ) {
      setStep(
        "recording",
      );

      setCountdown(3);
    }
  }, [
    countdown,
    step,
    setStep,
    setCountdown,
  ]);


  /**
   * 실제 카메라 / 녹화 / 영상 업로드 / 분석 처리.
   */
  const camera =
    useInterviewCamera({
      step,

      interviewId,

      startedUserId,

      jobRoleId,

      jobName:
        selectedJobData?.name,

      currentQuestions,

      questionTimestamps:
        questionTimestampsRef.current,

      onExit:
        stableOnExit,
    });


  /**
   * 첫 번째 기본 질문 녹화가 시작되면
   * 꼬리질문용 답변 오디오도 동시에 시작한다.
   *
   * 전체 영상 MediaRecorder와 별개의 녹음이므로
   * 눈/자세 분석용 전체 영상은 끊기지 않는다.
   */
  useEffect(() => {
    if (
      step === "recording"
    ) {
      camera.startAnswerRecording();
    }
  }, [
    step,
    camera.startAnswerRecording,
  ]);


  /**
   * =====================================================
   * 답변 완료 처리
   * =====================================================
   *
   * base 질문에서 답변 완료:
   *
   * 답변 오디오 종료
   * -> Spring /api/followup/transcribe
   * -> FastAPI Whisper STT
   * -> 실제 답변 텍스트
   * -> Spring /api/followup/create
   * -> 꼬리질문 1개 생성
   * -> questionMode = followup
   * -> 꼬리질문 답변 녹음 시작
   *
   * followup 질문에서 답변 완료:
   *
   * 현재 단계에서는 답변 오디오만 종료하고
   * 다음 기본 질문으로 이동한다.
   *
   * 꼬리질문 답변 STT + DB 저장은 다음 단계에서 연결한다.
   */
  const handleNextQuestion =
    async () => {
      if (
        isProcessingAnswer ||
        step !== "recording"
      ) {
        return;
      }


      setIsProcessingAnswer(true);


      try {
        /**
         * -----------------------------------------------
         * 기본 질문 답변 완료
         * -----------------------------------------------
         */
        if (
          questionMode === "base"
        ) {
          const answerBlob =
            await camera.stopAnswerRecording();


          console.log(
            "[FollowUp] 기본 질문 답변 음성 녹음 완료:",
            answerBlob.size,
            "bytes",
          );


          const transcription =
            await transcribeFollowUpAnswer(
              answerBlob,
            );


          console.log(
            "[FollowUp] STT 결과:",
            transcription.text,
          );


          const created =
            await requestFollowUp({
              originalQuestion:
                currentQuestion,

              answer:
                transcription.text,
            });


          if (!created) {
            throw new Error(
              "꼬리질문 생성에 실패했습니다.",
            );
          }


          /**
           * store의 questionMode가 followup으로 바뀌었으므로
           * 화면에는 생성된 꼬리질문이 표시된다.
           *
           * 동시에 꼬리질문 답변용 새 오디오 녹음을 시작한다.
           */
          const started =
            camera.startAnswerRecording();


          if (!started) {
            console.warn(
              "[FollowUp] 꼬리질문 답변 오디오 녹음을 시작하지 못했습니다.",
            );
          }


          return;
        }


        /**
         * -----------------------------------------------
         * 꼬리질문 답변 완료
         * -----------------------------------------------
         *
         * 현재 단계에서는 별도 오디오 구간을 정상 종료만 한다.
         * 다음 단계에서 이 Blob을 STT하고 DB에 저장한다.
         */
        await camera.stopAnswerRecording();


        resetFollowUp();


        if (
          currentQuestionIdx <
          currentQuestions.length - 1
        ) {
          /**
           * 기본 질문 하나 + 꼬리질문 하나가 끝난 시점.
           * 전체 영상 분석의 질문 구간 경계로 유지한다.
           */
          questionTimestampsRef.current.push(
            time,
          );


          setCurrentQuestionIdx(
            (prev) =>
              prev + 1,
          );


          /**
           * 다음 기본 질문 답변용 오디오 녹음 시작.
           */
          camera.startAnswerRecording();


          return;
        }


        /**
         * Q3의 꼬리질문까지 답변했을 때만
         * 기존 전체 영상 분석으로 넘어간다.
         */
        setStep(
          "analyzing",
        );

      } catch (error) {
        console.error(
          "[FollowUp] 답변 처리 실패:",
          error,
        );


        /**
         * 기본 질문 처리 중 실패했다면
         * 같은 질문에 다시 답할 수 있도록 오디오 녹음을 재시작한다.
         */
        if (
          questionMode === "base"
        ) {
          camera.startAnswerRecording();
        }


        alert(
          error instanceof Error
            ? error.message
            : "답변 처리 중 오류가 발생했습니다.",
        );

      } finally {
        setIsProcessingAnswer(false);
      }
    };


  /**
   * 분석 화면 종료.
   */
  const handleFinalExit =
    () => {
      camera.stopCamera();

      stableOnExit();
    };


  /**
   * AI 분석 화면.
   */
  if (
    step ===
    "analyzing"
  ) {
    return (
      <AnalysisProgress
        analysisProgress={
          camera.analysisProgress
        }
        analysisResult={
          camera.analysisResult
        }
        analysisError={
          camera.analysisError
        }
        selectedJobData={
          selectedJobData
        }
        onExit={
          handleFinalExit
        }
      />
    );
  }


  /**
   * 면접 시작 전 입력 단계인지 여부.
   */
  const isInputPhase =
    [
      "resumePrompt",
      "resumeUpload",
      "jobSelect",
    ].includes(step);


  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black font-sans">

      {/* 카메라 화면 */}
      <CameraViewport
        videoRef={
          camera.videoRef
        }
        step={
          step
        }
        countdown={
          countdown
        }
        selectedCategory={
          selectedCategory
        }
        selectedJobName={
          selectedJobData?.name
        }
        currentQuestionText={
          displayedQuestion
        }
        onCancelStop={() =>
          setStep(
            "recording",
          )
        }
        onConfirmStop={() =>
          setStep(
            "analyzing",
          )
        }
      />


      {/* 자소서 여부 선택 */}
      {step ===
        "resumePrompt" && (
        <ResumePromptModal
          onYes={() =>
            setStep(
              "resumeUpload",
            )
          }
          onNo={() =>
            setStep(
              "jobSelect",
            )
          }
        />
      )}


      {/* 자소서 업로드 */}
      {step ===
        "resumeUpload" && (
        <ResumeUploadModal
          isUploading={
            isUploadingResume
          }
          onNext={(
            file,
          ) =>
            uploadResume(
              file,
            )
          }
          onSkip={() =>
            setStep(
              "jobSelect",
            )
          }
        />
      )}


      {/* 직무 선택 */}
      {step ===
        "jobSelect" && (
        <JobSelectionModal
          jobRoles={
            jobRoles
          }
          selectedCategory={
            selectedCategory
          }
          setSelectedCategory={
            setSelectedCategory
          }
          selectedJobId={
            selectedJobId
          }
          setSelectedJobId={
            setSelectedJobId
          }
          filteredJobs={
            filteredJobs
          }
          uniqueCategories={
            uniqueCategories
          }
          recommendedJobId={
            recommendedJobId
          }
          onStartInterview={
            startInterviewSession
          }
        />
      )}


      {/* 녹화 컨트롤 */}
      {!isInputPhase && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex h-32 w-full items-end justify-center pb-12">
          <div className="pointer-events-auto">
            <RecordingControls
              step={
                step
              }
              time={
                time
              }
              currentQuestionIdx={
                currentQuestionIdx
              }
              totalQuestions={
                currentQuestions.length
              }
              questionMode={
                questionMode
              }
              isProcessingAnswer={
                isProcessingAnswer ||
                isFetchingFollowUp
              }
              onStartCountdown={() =>
                setStep(
                  "countdown",
                )
              }
              onStopRecording={() =>
                setStep(
                  "confirmStop",
                )
              }
              onNextQuestion={
                handleNextQuestion
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}