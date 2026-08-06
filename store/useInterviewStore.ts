// store/useInterviewStore.ts
import { create } from "zustand";
import { getJobRoles, startInterview } from "@/lib/api";
import type { JobRole } from "@/types";

// 💡 백엔드가 꺼져있을 때를 대비한 임시 직무 데이터
const FALLBACK_JOBS: JobRole[] = [
  { id: 1, category: "IT/개발", name: "프론트엔드" },
  { id: 2, category: "IT/개발", name: "백엔드" },
  { id: 3, category: "디자인", name: "UX/UI 디자이너" },
];

export type Step =
  | "resumePrompt"
  | "resumeUpload"
  | "jobSelect"
  | "prepare"
  | "countdown"
  | "recording"
  | "confirmStop"
  | "analyzing";

interface InterviewState {
  step: Step;
  countdown: number;
  time: number;
  currentQuestionIdx: number;

  jobRoles: JobRole[];
  selectedCategory: string | null;
  selectedJobId: number | null;
  recommendedJobId: number | null;
  resumeFile: File | null;
  isUploadingResume: boolean;

  interviewId: number | null;
  startedUserId: number | null;
  jobRoleId: number | null;
}

interface InterviewActions {
  setStep: (step: Step) => void;
  setCountdown: (val: number | ((prev: number) => number)) => void;
  setTime: (val: number | ((prev: number) => number)) => void;
  setCurrentQuestionIdx: (val: number | ((prev: number) => number)) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedJobId: (id: number | null) => void;
  
  fetchJobRoles: () => Promise<void>;
  uploadResume: (file: File) => Promise<void>;
  startInterviewSession: () => Promise<void>;
  
  reset: () => void;
}

const initialState: InterviewState = {
  step: "resumePrompt",
  countdown: 3,
  time: 0,
  currentQuestionIdx: 0,
  jobRoles: [],
  selectedCategory: "IT/개발",
  selectedJobId: null,
  recommendedJobId: null,
  resumeFile: null,
  isUploadingResume: false,
  interviewId: null,
  startedUserId: null,
  jobRoleId: null,
};

export const useInterviewStore = create<InterviewState & InterviewActions>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setCountdown: (val) => set((state) => ({ countdown: typeof val === "function" ? val(state.countdown) : val })),
  setTime: (val) => set((state) => ({ time: typeof val === "function" ? val(state.time) : val })),
  setCurrentQuestionIdx: (val) => set((state) => ({ currentQuestionIdx: typeof val === "function" ? val(state.currentQuestionIdx) : val })),
  setSelectedCategory: (category) => set({ selectedCategory: category, selectedJobId: null }),
  setSelectedJobId: (id) => set({ selectedJobId: id }),

  fetchJobRoles: async () => {
    try {
      const data = await getJobRoles();
      if (data && data.length > 0) {
        const firstCategory = Array.from(new Set(data.map((job) => job.category)))[0];
        set({ jobRoles: data, selectedCategory: firstCategory });
        return;
      }
    } catch (error) {
      console.warn("백엔드 연결 실패. 임시 데이터를 사용합니다.", error);
    }
    // 💡 백엔드 에러 시 Fallback 데이터로 화면이 굳는 것을 방지
    set({ jobRoles: FALLBACK_JOBS, selectedCategory: "IT/개발" });
  },

  uploadResume: async (file: File) => {
    set({ resumeFile: file, isUploadingResume: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const { jobRoles } = get();
      const aiRecommendedId = 1; 
      const recommendedJob = jobRoles.find((job) => job.id === aiRecommendedId);

      set({
        recommendedJobId: aiRecommendedId,
        selectedJobId: aiRecommendedId,
        selectedCategory: recommendedJob ? recommendedJob.category : get().selectedCategory,
        step: "jobSelect",
      });
    } catch (error) {
      alert("자소서 분석 중 오류가 발생했습니다. 직접 직무를 선택해주세요.");
      set({ step: "jobSelect" });
    } finally {
      set({ isUploadingResume: false });
    }
  },

  startInterviewSession: async () => {
    const { selectedJobId } = get();
    if (!selectedJobId) return;

    try {
      const savedUserId = localStorage.getItem("interviewfit_user_id");
      const result = await startInterview({
        jobRoleId: selectedJobId,
        userId: savedUserId ? Number(savedUserId) : null,
      });

      localStorage.setItem("interviewfit_user_id", String(result.userId));
      
      set({
        interviewId: result.interviewId,
        startedUserId: result.userId,
        jobRoleId: selectedJobId,
        step: "prepare",
      });
    } catch (error) {
      console.warn("면접 시작 API 실패, 로컬 테스트 모드로 진입합니다.", error);
      // 💡 백엔드 서버가 닫혀있어도 프론트엔드 웹캠 UI를 계속 테스트할 수 있게 해줍니다!
      set({
        interviewId: 9999,
        startedUserId: 9999,
        jobRoleId: selectedJobId,
        step: "prepare",
      });
    }
  },

  reset: () => set(initialState),
}));