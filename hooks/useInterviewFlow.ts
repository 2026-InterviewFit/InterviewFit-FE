// hooks/useInterviewFlow.ts

import { useEffect, useState } from "react";
import { getJobRoles, startInterview } from "@/lib/api";
import { getLoginUserId, initializeAuth } from "@/lib/auth";
import type { JobRole } from "@/types";

export type Step =
  | "resumePrompt"
  | "resumeUpload"
  | "jobSelect"
  | "prepare"
  | "countdown"
  | "recording"
  | "confirmStop"
  | "analyzing";

const FALLBACK_JOBS: JobRole[] = [
  { id: 1, category: "IT/개발", name: "프론트엔드" },
  { id: 2, category: "IT/개발", name: "백엔드" },
  { id: 3, category: "디자인", name: "UX/UI 디자이너" },
];

export function useInterviewFlow() {
  const [jobRoles, setJobRoles] = useState<JobRole[]>(FALLBACK_JOBS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>("IT/개발");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  
  // 일대일 면접 흐름 상태
  const [step, setStep] = useState<Step>("resumePrompt");
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [recommendedJobId, setRecommendedJobId] = useState<number | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const [countdown, setCountdown] = useState(3);
  const [time, setTime] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [startedUserId, setStartedUserId] = useState<number | null>(null);
  const [jobRoleId, setJobRoleId] = useState<number | null>(null);

  useEffect(() => {
    getJobRoles()
      .then((data) => {
        if (data && data.length > 0) {
          setJobRoles(data);
          const firstCategory = Array.from(
            new Set(data.map((job) => job.category)),
          )[0];
          setSelectedCategory(firstCategory);
        }
      })
      .catch((error) => {
        console.error("백엔드 연결 실패, 초기 임시 데이터를 계속 유지합니다.", error);
      });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (step === "countdown") {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
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
    if (step === "countdown" && countdown === 0) {
      setStep("recording");
      setCountdown(3); // 다음 녹화를 위해 카운트다운 초기화
    }
  }, [countdown, step]);

  const handleResumeUpload = async (file: File) => {
    setResumeFile(file);
    setIsUploadingResume(true);

    try {
      // API 통신 딜레이 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const aiRecommendedId = 1;
      setRecommendedJobId(aiRecommendedId);
      setSelectedJobId(aiRecommendedId);

      const recommendedJob = jobRoles.find((job) => job.id === aiRecommendedId);
      if (recommendedJob) {
        setSelectedCategory(recommendedJob.category);
      }
      setStep("jobSelect");
    } catch (error) {
      console.error("자소서 분석 실패:", error);
      alert("자소서 분석 중 오류가 발생했습니다. 직접 직무를 선택해주세요.");
      setStep("jobSelect");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleStartInterview = async () => {
    if (!selectedJobId) {
      alert("직무를 선택해주세요.");
      return;
    }

    const authUser = await initializeAuth();
    const loginUserId = authUser?.id ?? getLoginUserId();

    if (!loginUserId) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      window.location.href = "/login";
      return;
    }

    try {
      console.log("선택된 jobRoleId:", selectedJobId);
      console.log("로그인 userId:", loginUserId);

      const result = await startInterview({
        jobRoleId: selectedJobId,
      });

      setInterviewId(result.interviewId);
      setStartedUserId(result.userId ?? loginUserId);
      setJobRoleId(selectedJobId);
      
      // 상태를 'prepare'로 넘기면 일대일 면접 준비 화면으로 전환됨
      setStep("prepare");
    } catch (error) {
      console.error("면접 시작 API 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "면접 시작 API 호출에 실패했습니다."
      );
    }
  };

  return {
    jobRoles,
    selectedCategory,
    setSelectedCategory,
    selectedJobId,
    setSelectedJobId,
    step,
    setStep,
    resumeFile,
    recommendedJobId,
    isUploadingResume,
    handleResumeUpload,
    countdown,
    time,
    currentQuestionIdx,
    setCurrentQuestionIdx,
    interviewId,
    startedUserId,
    jobRoleId,
    handleStartInterview,
  };
}