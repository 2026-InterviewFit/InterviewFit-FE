// hooks/useInterviewFlow.ts
import { useState, useEffect } from "react";
import { getJobRoles, startInterview } from "@/lib/api";
import type { JobRole } from "@/types";

export type Step = "resumePrompt" | "resumeUpload" | "jobSelect" | "prepare" | "countdown" | "recording" | "confirmStop" | "analyzing";

// 테스트용 임시 데이터
const FALLBACK_JOBS: JobRole[] = [
  { id: 1, category: "IT/개발", name: "프론트엔드" },
  { id: 2, category: "IT/개발", name: "백엔드" },
  { id: 3, category: "디자인", name: "UX/UI 디자이너" },
];

export function useInterviewFlow() {
  const [jobRoles, setJobRoles] = useState<JobRole[]>(FALLBACK_JOBS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>("IT/개발");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

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
          setSelectedCategory(Array.from(new Set(data.map((job) => job.category)))[0]);
        }
      })
      .catch((e) => {
        console.error("백엔드 연결 실패, 초기 임시 데이터를 계속 유지합니다.", e);
      });
  }, []);

  // 💡 수정됨 1: 숫자를 1씩 줄이거나 시간을 늘리는 "순수 타이머" 역할만 수행
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (step === "countdown") {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (step === "recording") {
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  // 💡 수정됨 2: 카운트다운이 0이 되었을 때 상태를 전환하는 로직을 분리
  useEffect(() => {
    if (step === "countdown" && countdown === 0) {
      setStep("recording");
      setCountdown(3); // 다음번을 위해 3으로 초기화
    }
  }, [countdown, step]);

  const handleResumeUpload = async (file: File) => {
    setResumeFile(file);
    setIsUploadingResume(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const aiRecommendedId = 1; 
      setRecommendedJobId(aiRecommendedId);
      setSelectedJobId(aiRecommendedId); 

      const recommendedJob = jobRoles.find(job => job.id === aiRecommendedId);
      if (recommendedJob) {
        setSelectedCategory(recommendedJob.category);
      }

      setStep("jobSelect");
    } catch (error) {
      alert("자소서 분석 중 오류가 발생했습니다. 직접 직무를 선택해주세요.");
      setStep("jobSelect");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleStartInterview = async () => {
    if (!selectedJobId) return;
    try {
      const savedUserId = localStorage.getItem("interviewfit_user_id");
      const result = await startInterview({
        jobRoleId: selectedJobId,
        userId: savedUserId ? Number(savedUserId) : null,
      });
      setInterviewId(result.interviewId);
      setStartedUserId(result.userId);
      setJobRoleId(selectedJobId);
      localStorage.setItem("interviewfit_user_id", String(result.userId));
      setStep("prepare");
    } catch (e) {
      console.error("면접 시작 API 실패, 가상 세션으로 prepare 단계를 진행합니다.");
      setInterviewId(Math.floor(Math.random() * 1000));
      setStep("prepare");
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