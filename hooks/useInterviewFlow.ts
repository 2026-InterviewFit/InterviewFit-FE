// hooks/useInterviewFlow.ts
import { useState, useEffect } from "react";
import { getJobRoles, startInterview } from "@/lib/api";
import type { JobRole } from "@/types";

export type Step = "jobSelect" | "prepare" | "countdown" | "recording" | "confirmStop" | "analyzing";

export function useInterviewFlow() {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const [step, setStep] = useState<Step>("jobSelect");
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
        } else {
          throw new Error("데이터가 비어있습니다.");
        }
      })
      .catch((e) => {
        console.error("백엔드 연결 실패, 임시 데이터를 사용합니다.", e);
        const fallback: JobRole[] = [
          { id: 1, category: "IT/개발", name: "프론트엔드" },
          { id: 2, category: "IT/개발", name: "백엔드" },
          { id: 3, category: "디자인", name: "UX/UI 디자이너" },
        ];
        setJobRoles(fallback);
        setSelectedCategory("IT/개발");
      });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
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
      alert("면접 시작 중 오류가 발생했습니다. 서버가 꺼져있을 수 있습니다.");
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