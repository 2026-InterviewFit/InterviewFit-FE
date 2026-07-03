"use client";

import { useRef } from "react";

// ── 분리한 Custom Hooks Import ──
import { useInterviewFlow } from "@/hooks/useInterviewFlow";
import { useInterviewCamera } from "@/hooks/useInterviewCamera";

// ── 분리한 UI Components Import ──
import JobSelectionModal from "./JobSelectionModal";
import AnalysisProgress from "./AnalysisProgress";
import RecordingControls from "./RecordingControls";
import CameraViewport from "./CameraViewport";

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

export default function InterviewRecording({ onExit }: { onExit: () => void }) {
  // 1. 상태 및 흐름 관리 Hook 호출
  const flow = useInterviewFlow();

  // 🔑 질문이 전환될 때마다 "그 순간의 녹화 경과 시간(초)"을 쌓아두는 ref
  // Q1은 항상 0초부터 시작하므로 초기값 [0]
  const questionTimestampsRef = useRef<number[]>([0]);

  const selectedJobData = flow.jobRoles.find((job) => job.id === flow.selectedJobId);
  const uniqueCategories = Array.from(new Set(flow.jobRoles.map((job) => job.category)));
  const filteredJobs = flow.jobRoles.filter((job) => job.category === flow.selectedCategory);
  const currentQuestions = QUESTIONS_BY_CATEGORY[flow.selectedCategory ?? "IT/개발"] ?? QUESTIONS_BY_CATEGORY["IT/개발"];

  // 2. 카메라 및 녹화 제어 Hook 호출
  const camera = useInterviewCamera({
    step: flow.step,
    interviewId: flow.interviewId,
    startedUserId: flow.startedUserId,
    jobRoleId: flow.jobRoleId,
    jobName: selectedJobData?.name,
    currentQuestions,
    questionTimestamps: questionTimestampsRef.current, // 🔑 전달
    onExit,
  });

  const handleNextQuestion = () => {
    if (flow.currentQuestionIdx < currentQuestions.length - 1) {
      questionTimestampsRef.current.push(flow.time); // 🔑 다음 질문 시작 시각 기록
      flow.setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      flow.setStep("analyzing");
    }
  };

  const handleFinalExit = () => {
    camera.stopCamera();
    onExit();
  };

  // ── 렌더링 ──
  if (flow.step === "analyzing") {
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

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black font-sans">
      <CameraViewport
        videoRef={camera.videoRef}
        step={flow.step}
        countdown={flow.countdown}
        selectedCategory={flow.selectedCategory}
        selectedJobName={selectedJobData?.name}
        currentQuestionText={currentQuestions[flow.currentQuestionIdx]}
        onCancelStop={() => flow.setStep("recording")}
        onConfirmStop={() => flow.setStep("analyzing")}
      />

      {flow.step === "jobSelect" && (
        <JobSelectionModal
          jobRoles={flow.jobRoles}
          selectedCategory={flow.selectedCategory}
          setSelectedCategory={flow.setSelectedCategory}
          selectedJobId={flow.selectedJobId}
          setSelectedJobId={flow.setSelectedJobId}
          filteredJobs={filteredJobs}
          uniqueCategories={uniqueCategories}
          onStartInterview={flow.handleStartInterview}
        />
      )}

      {flow.step !== "jobSelect" && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex h-32 w-full items-end justify-center pb-12 pointer-events-none">
          <div className="pointer-events-auto">
            <RecordingControls
              step={flow.step}
              time={flow.time}
              currentQuestionIdx={flow.currentQuestionIdx}
              totalQuestions={currentQuestions.length}
              onStartCountdown={() => flow.setStep("countdown")}
              onStopRecording={() => flow.setStep("confirmStop")}
              onNextQuestion={handleNextQuestion}
            />
          </div>
        </div>
      )}
    </div>
  );
}