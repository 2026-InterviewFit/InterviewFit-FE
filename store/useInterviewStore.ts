import { create } from "zustand";

import {
  createFollowUpQuestion,
  getJobRoles,
  startInterview,
  analyzeCoverLetter,
  createQuestionsWithRetry,
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

  // 💡 팀원분 파트: 꼬리질문 상태 상세화
  followUpQuestion: string | null;
  followUpQuestionId: number | null;
  isFetchingFollowUp: boolean;
  followUpError: string | null;
  
  jobRoles: JobRole[];
  selectedCategory: string | null;
  selectedJobId: number | null;
  recommendedJobId: number | null;
  
  // 💡 은재님 파트: 자소서 분석 상태
  resumeFile: File | null;
  coverLetterId: number | null; 
  isUploadingResume: boolean;
  
  interviewId: number | null;
  startedUserId: number | null;
  jobRoleId: number | null;

  // 💡 은재님 파트: 생성된 진짜 질문 목록
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
  
  // 은재님이 연결한 자소서 분석 API
  uploadResume: (file: File) => Promise<void>;
  
  // 은재님이 연결한 1:1 질문 생성 API 호출 포함
  startInterviewSession: () => Promise<void>;
  
  // 팀원분이 개선한 꼬리질문 API (STT answer 포함)
  requestFollowUp: (params: { originalQuestion: string; answer: string }) => Promise<boolean>;
  
  resetFollowUp: () => void;
  reset: () => void;
}

const initialState: Omit<InterviewState, "jobRoles"> = {
  step: "resumePrompt",
  countdown: 3,
  time: 0,
  currentQuestionIdx: 0,
  questionMode: "base",
  
  followUpQuestion: null,
  followUpQuestionId: null,
  isFetchingFollowUp: false,
  followUpError: null,
  
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

  // 🚀 은재님 담당: 자소서 분석 로직 완벽 반영
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
        // 백엔드 추천 직무가 기존 목록에 없을 경우 임시 추가
        aiRecommendedId = 999;
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

  // 🚀 은재님 담당: 면접 시작 & AI 1:1 질문 생성 호출 반영
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
        followUpQuestion: null,
        followUpQuestionId: null,
        isFetchingFollowUp: false,
        followUpError: null,
        step: "prepare",
        generatedQuestions: questionsResponse, 
      });

    } catch (error: any) {
      console.error("[Interview] 면접 시작 또는 질문 생성 API 실패:", error);
      alert(error instanceof Error ? error.message : "면접 준비에 실패했습니다.");
    }
  },

  // 🚀 팀원분 담당: STT answer 기반 꼬리질문 생성 로직 반영
  requestFollowUp: async ({ originalQuestion, answer }) => {
    const { jobRoleId, interviewId } = get();
    
    if (!jobRoleId) {
      console.warn("[FollowUp] jobRoleId가 없어 꼬리질문을 생성할 수 없습니다.");
      set({ followUpError: "직무 정보가 없습니다." });
      return false;
    }

    set({ isFetchingFollowUp: true, followUpError: null, followUpQuestion: null });

    try {
      const result = await createFollowUpQuestion({
        jobRoleId,
        interviewId: interviewId ?? undefined,
        originalQuestion,
        answer,
        interviewStyle: "normal",
      });

      const followUpText = 
        (result.followUpQuestion as string | undefined) ?? 
        (result.follow_up_question as string | undefined) ?? 
        (result.question as string | undefined) ?? 
        null;

      const followUpId = 
        (result.followUpQuestionId as number | undefined) ?? 
        (result.follow_up_question_id as number | undefined) ?? 
        (result.id as number | undefined) ?? 
        null;

      if (!followUpText) {
        console.warn("[FollowUp] 서버 응답에 꼬리질문 텍스트가 없습니다:", result);
        set({ isFetchingFollowUp: false, followUpError: "꼬리질문을 받지 못했습니다." });
        return false;
      }

      console.log("[FollowUp] 꼬리질문 생성 성공:", followUpText);

      set({ 
        isFetchingFollowUp: false, 
        followUpQuestion: followUpText,
        followUpQuestionId: followUpId, 
        questionMode: "followup" 
      });
      return true;
      
    } catch (error) {
      console.error("[FollowUp] 꼬리질문 API 실패:", error);
      set({ isFetchingFollowUp: false, followUpError: error instanceof Error ? error.message : "꼬리질문 생성에 실패했습니다." });
      return false;
    }
  },

  resetFollowUp: () => {
    set({ 
      questionMode: "base", 
      followUpQuestion: null, 
      followUpQuestionId: null,
      isFetchingFollowUp: false, 
      followUpError: null 
    });
  },

  reset: () => {
    set({ 
      ...initialState, 
      coverLetterId: null, 
      jobRoles: [...FALLBACK_JOBS] 
    });
  },
}));