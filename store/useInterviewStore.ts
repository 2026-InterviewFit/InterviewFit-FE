import { create } from "zustand";

import {
  createFollowUpQuestion,
  getJobRoles,
  startInterview,
  analyzeCoverLetter,
  createQuestionsWithRetry,
  transcribeFollowUpAnswer,
} from "@/lib/api";

import type { JobRole } from "@/types";

const FALLBACK_JOBS: JobRole[] = [
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

export type QuestionMode = "base" | "followup";

interface InterviewState {
  step: Step;
  countdown: number;
  time: number;
  currentQuestionIdx: number;
  questionMode: QuestionMode;
  
  isFollowUpEnabled: boolean; 
  followUpList: string[]; 
  activeBackgroundTasks: number; 

  jobRoles: JobRole[];
  selectedCategory: string | null;
  selectedJobId: number | null;
  recommendedJobId: number | null;
  resumeFile: File | null;
  
  coverLetterId: number | null; 
  
  isUploadingResume: boolean;
  interviewId: number | null;
  startedUserId: number | null;
  jobRoleId: number | null;

  generatedQuestions: any[]; 
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
  
  setIsFollowUpEnabled: (val: boolean) => void;
  setQuestionMode: (mode: QuestionMode) => void;
  
  // 💡 sourceQuestionId 파라미터 추가
  addFollowUpTask: (blob: Blob, originalQuestion: string, sourceQuestionId?: number) => Promise<void>;
  
  reset: () => void;
}

const initialState: Omit<InterviewState, "jobRoles"> = {
  step: "resumePrompt",
  countdown: 3,
  time: 0,
  currentQuestionIdx: 0,
  questionMode: "base",
  
  isFollowUpEnabled: true,
  followUpList: [],
  activeBackgroundTasks: 0,

  selectedCategory: "IT/개발",
  selectedJobId: null,
  recommendedJobId: null,
  resumeFile: null,
  coverLetterId: null, 
  isUploadingResume: false,
  interviewId: null,
  startedUserId: null,
  jobRoleId: null,
  generatedQuestions: [], 
};

export const useInterviewStore = create<InterviewState & InterviewActions>((set, get) => ({
  ...initialState,
  jobRoles: FALLBACK_JOBS,

  setStep: (step) => set({ step }),
  setCountdown: (val) => set((state) => ({ countdown: typeof val === "function" ? val(state.countdown) : val })),
  setTime: (val) => set((state) => ({ time: typeof val === "function" ? val(state.time) : val })),
  setCurrentQuestionIdx: (val) => set((state) => ({ currentQuestionIdx: typeof val === "function" ? val(state.currentQuestionIdx) : val })),
  
  setSelectedCategory: (category) => set({ selectedCategory: category, selectedJobId: null }),
  setSelectedJobId: (id) => set({ selectedJobId: id }),
  
  setIsFollowUpEnabled: (val) => set({ isFollowUpEnabled: val }),
  setQuestionMode: (mode) => set({ questionMode: mode }),

  fetchJobRoles: async () => {
    try {
      const data = await getJobRoles();
      if (Array.isArray(data) && data.length > 0) {
        const categories = Array.from(new Set(data.map((job) => job.category)));
        const currentCategory = get().selectedCategory;
        const selectedCategory = currentCategory && categories.includes(currentCategory) ? currentCategory : categories[0] ?? "IT/개발";
        set({ jobRoles: data, selectedCategory });
        return;
      }
    } catch (error) {
      console.warn("[Interview] 직무 목록 조회 실패. 기본 직무 목록을 사용합니다.", error);
    }
    set({ jobRoles: FALLBACK_JOBS, selectedCategory: "IT/개발" });
  },

  uploadResume: async (file) => {
    set({ resumeFile: file, isUploadingResume: true });

    try {
      const result = await analyzeCoverLetter(file);
      const { jobRoles } = get();

      let aiRecommendedId = result.jobRoleId;
      let targetCategory = "기타";
      let updatedJobRoles = [...jobRoles];

      const matchedJob = jobRoles.find((job) => job.id === aiRecommendedId);

      if (matchedJob) {
        targetCategory = matchedJob.category;
      } else {
        aiRecommendedId = 11;
        const newJob: JobRole = {
          id: aiRecommendedId,
          category: "기타",
          name: `기타 (${result.recommendedJobName})`,
        };
        updatedJobRoles = [...jobRoles, newJob];
      }

      set({
        coverLetterId: result.coverLetterId, 
        jobRoles: updatedJobRoles,
        recommendedJobId: aiRecommendedId,
        selectedJobId: aiRecommendedId,
        selectedCategory: targetCategory,
        step: "jobSelect",
      });

    } catch (error) {
      console.error("[Interview] 자소서 분석 실패:", error);
      alert("자소서 분석 중 오류가 발생했습니다. 직접 직무를 선택해주세요.");
      set({ step: "jobSelect" });
    } finally {
      set({ isUploadingResume: false });
    }
  },

  startInterviewSession: async () => {
    const { selectedJobId, jobRoles, coverLetterId } = get();

    if (!selectedJobId) {
      alert("직무를 선택해주세요.");
      return;
    }

    const selectedJob = jobRoles.find((j) => j.id === selectedJobId);
    if (!selectedJob) return;

    try {
      const result = await startInterview({ jobRoleId: selectedJobId });

      const questionsResponse = await createQuestionsWithRetry({
        count: 3,
        jobRoleId: selectedJobId,
        jobName: selectedJob.name,
        coverLetterId: coverLetterId ?? undefined,
      });

      console.log("[Interview] 생성된 질문 목록 3개 도착! :", questionsResponse);

      set({
        interviewId: result.interviewId,
        startedUserId: result.userId,
        jobRoleId: selectedJobId,
        currentQuestionIdx: 0,
        questionMode: "base",
        followUpList: [],
        activeBackgroundTasks: 0,
        step: "prepare",
        generatedQuestions: questionsResponse,
      });

    } catch (error: any) {
      console.error("[Interview] 면접 시작 또는 질문 생성 API 실패:", error);
      alert(error instanceof Error ? error.message : "면접 준비에 실패했습니다.");
    }
  },

  // 💡 DB 저장을 위해 sourceQuestionId 를 받아 넘겨주도록 수정
  addFollowUpTask: async (blob, originalQuestion, sourceQuestionId) => {
    set((state) => ({ activeBackgroundTasks: state.activeBackgroundTasks + 1 }));
    try {
      const { jobRoleId, interviewId } = get();
      if (!jobRoleId) return;
      
      const transcription = await transcribeFollowUpAnswer(blob);
      
      const result = await createFollowUpQuestion({
        jobRoleId,
        interviewId: interviewId ?? undefined,
        originalQuestion,
        answer: transcription.text,
        interviewStyle: "normal",
        sourceQuestionId: sourceQuestionId, // 🔥 백엔드 DB 에러를 막기 위해 추가된 부분!
      });
      
      console.log("🔥 [꼬리질문 API 응답 원본]:", result);
      
      const followUpText = 
          result?.followUpQuestion || 
          result?.follow_up_question || 
          result?.question ||
          result?.data?.followUpQuestion ||
          result?.data?.question ||
          result?.data?.follow_up_question;
          
      if (followUpText) {
        set((state) => ({ followUpList: [...state.followUpList, followUpText] }));
      } else {
        console.warn("⚠️ 꼬리질문 텍스트를 찾을 수 없습니다. 응답 구조를 확인하세요.");
      }
    } catch (error) {
      console.warn("[Background FollowUp Error] 꼬리질문 비동기 생성 실패:", error);
    } finally {
      set((state) => ({ activeBackgroundTasks: state.activeBackgroundTasks - 1 }));
    }
  },

  reset: () => {
    set({ ...initialState, coverLetterId: null, jobRoles: [...FALLBACK_JOBS] });
  },
}));