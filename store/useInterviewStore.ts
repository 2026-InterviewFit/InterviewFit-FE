import { create } from "zustand";
import { getJobRoles, startInterview } from "@/lib/api";
import type { JobRole } from "@/types";

// 💡 1. 백엔드에 입력되어 있을 기본 10개 직무 세팅
const DEFAULT_10_JOBS: JobRole[] = [
  { id: 1, category: "기획/전략", name: "서비스 기획자" },
  { id: 2, category: "기획/전략", name: "사업 기획" },
  { id: 3, category: "IT/개발", name: "프론트엔드 개발자" },
  { id: 4, category: "IT/개발", name: "백엔드 개발자" },
  { id: 5, category: "IT/개발", name: "인프라 엔지니어" },
  { id: 6, category: "디자인", name: "UX/UI 디자이너" },
  { id: 7, category: "디자인", name: "브랜드 디자이너" },
  { id: 8, category: "마케팅", name: "퍼포먼스 마케터" },
  { id: 9, category: "마케팅", name: "콘텐츠 마케터" },
  { id: 10, category: "영업/고객지원", name: "CS 매니저" },
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
  jobRoles: DEFAULT_10_JOBS, // 💡 초기값을 10개 직무로 설정
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
    // 💡 백엔드가 닫혀있으므로 무조건 DEFAULT_10_JOBS를 쓰도록 처리
    set({ jobRoles: DEFAULT_10_JOBS, selectedCategory: "IT/개발" });
  },

  uploadResume: async (file: File) => {
    set({ resumeFile: file, isUploadingResume: true }); // 로딩 팝업 트리거
    try {
      // 💡 백엔드 분석 시간 가짜로 3초 기다림
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const { jobRoles } = get();

      // ==========================================
      // 💡 여기가 가장 중요한 [백엔드 응답 시뮬레이션] 부분입니다!
      // 테스트할 때 아래 analyzedJobName 값을 바꿔보세요.
      // 1) "프론트엔드 개발자" 로 하면 기존 10개 안에 있으므로 추천 딱지만 붙음
      // 2) "데이터 엔지니어" 로 하면 10개에 없으므로 '기타' 탭이 생기고 11번째로 들어감
      // ==========================================
      const analyzedJobName = "데이터 엔지니어"; 
      
      const matchedJob = jobRoles.find((job) => job.name === analyzedJobName);
      
      let aiRecommendedId;
      let updatedJobRoles = [...jobRoles];
      let targetCategory = "";

      if (matchedJob) {
        aiRecommendedId = matchedJob.id;
        targetCategory = matchedJob.category;
      } else {
        // 💡 10개 안에 없으면 무조건 '기타'로 빠지도록 11번째 직무 생성
        aiRecommendedId = 999;
        targetCategory = "기타";
        const newJob: JobRole = {
          id: aiRecommendedId,
          category: targetCategory,
          name: `기타 (${analyzedJobName})`, 
        };
        updatedJobRoles = [...jobRoles, newJob];
      }

      set({
        jobRoles: updatedJobRoles,
        recommendedJobId: aiRecommendedId,
        selectedJobId: aiRecommendedId,
        selectedCategory: targetCategory,
        step: "jobSelect", 
      });
    } catch (error) {
      alert("자소서 분석 중 오류가 발생했습니다.");
      set({ step: "jobSelect" });
    } finally {
      set({ isUploadingResume: false });
    }
  },

  startInterviewSession: async () => {
    const { selectedJobId } = get();
    if (!selectedJobId) return;

    try {
      // 💡 실제 백엔드 연동이 되면 아래 주석을 풀고 사용하세요.
      /*
      const result = await startInterview({
        jobRoleId: selectedJobId,
      });
      localStorage.setItem("interviewfit_user_id", String(result.userId));
      
      set({
        interviewId: result.interviewId,
        startedUserId: result.userId,
        jobRoleId: selectedJobId,
        step: "prepare", // 다음 화면으로 이동
      });
      */
      
      // 💡 현재는 백엔드 없이 프론트 화면만 넘어가도록 가짜 데이터로 바로 step을 넘깁니다.
      set({
        interviewId: 9999,
        startedUserId: 9999,
        jobRoleId: selectedJobId,
        step: "prepare", // 여기서 prepare 또는 바로 recording으로 넘어가게 트리거!
      });
      
    } catch (error) {
      console.warn("면접 시작 API 실패, 로컬 테스트 모드로 진입합니다.", error);
      
      // 에러가 나도 테스트가 끊기지 않게 억지로 다음 화면으로 넘겨줌
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