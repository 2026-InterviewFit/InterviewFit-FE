// store/useInterviewStore.ts

import { create } from "zustand";

import {
  getJobRoles,
  startInterview,
  createFollowUpQuestion,
} from "@/lib/api";

import type { JobRole } from "@/types";

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

/**
 * 현재 화면이 기본 질문을 보여주고 있는지,
 * 아니면 그 질문에 대한 꼬리질문을 보여주고 있는지 구분.
 */
export type QuestionMode = "base" | "followup";

interface InterviewState {
  step: Step;
  countdown: number;
  time: number;

  currentQuestionIdx: number;

  /**
   * 현재 기본 질문 화면인지 꼬리질문 화면인지.
   * "base" → 화면에 기본 질문 표시
   * "followup" → 화면에 방금 생성된 꼬리질문 표시
   */
  questionMode: QuestionMode;

  /**
   * 현재 표시 중인 꼬리질문 텍스트.
   * questionMode === "followup"일 때 화면에 표시된다.
   */
  followUpQuestion: string | null;

  /**
   * 꼬리질문 로딩/에러 상태.
   */
  isFetchingFollowUp: boolean;
  followUpError: string | null;

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

  setCountdown: (
    val: number | ((prev: number) => number),
  ) => void;

  setTime: (
    val: number | ((prev: number) => number),
  ) => void;

  setCurrentQuestionIdx: (
    val: number | ((prev: number) => number),
  ) => void;

  setSelectedCategory: (category: string | null) => void;

  setSelectedJobId: (id: number | null) => void;

  fetchJobRoles: () => Promise<void>;

  uploadResume: (file: File) => Promise<void>;

  startInterviewSession: () => Promise<void>;

  /**
   * 방금 답변한 기본 질문을 기반으로 꼬리질문 1개를 생성한다.
   *
   * 성공 시:
   *   questionMode = "followup"
   *   followUpQuestion = 서버가 생성한 꼬리질문
   *
   * 실패 시:
   *   followUpError만 세팅하고 questionMode는 그대로 둔다.
   *   호출한 쪽에서 실패해도 다음 기본 질문으로 넘어가도록 함.
   *
   * @returns 성공 시 true, 실패 시 false
   */
  requestFollowUp: (params: {
    originalQuestion: string;
  }) => Promise<boolean>;

  /**
   * 꼬리질문 화면 → 다음 기본 질문 화면으로 넘어갈 때 상태 초기화.
   */
  resetFollowUp: () => void;

  reset: () => void;
}

const initialState: InterviewState = {
  step: "resumePrompt",
  countdown: 3,
  time: 0,

  currentQuestionIdx: 0,

  questionMode: "base",
  followUpQuestion: null,
  isFetchingFollowUp: false,
  followUpError: null,

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

export const useInterviewStore 
= create <InterviewState & InterviewActions>((set, get) => ({
  ...initialState,

  setStep: (step) => {
    set({ step });
  },

  setCountdown: (val) => {
    set((state) => ({
      countdown:
        typeof val === "function" ? val(state.countdown) : val,
    }));
  },

  setTime: (val) => {
    set((state) => ({
      time: typeof val === "function" ? val(state.time) : val,
    }));
  },

  setCurrentQuestionIdx: (val) => {
    set((state) => ({
      currentQuestionIdx:
        typeof val === "function"
          ? val(state.currentQuestionIdx)
          : val,
    }));
  },

  setSelectedCategory: (category) => {
    set({
      selectedCategory: category,
      selectedJobId: null,
    });
  },

  setSelectedJobId: (id) => {
    set({ selectedJobId: id });
  },

  fetchJobRoles: async () => {
    try {
      const data = await getJobRoles();

      if (data && data.length > 0) {
        const categories = Array.from(
          new Set(data.map((job) => job.category)),
        );

        const firstCategory = categories[0] ?? "IT/개발";

        set({
          jobRoles: data,
          selectedCategory: firstCategory,
        });

        return;
      }
    } catch (error) {
      console.warn(
        "백엔드 직무 목록 조회 실패. 임시 데이터를 사용합니다.",
        error,
      );
    }

    set({
      jobRoles: FALLBACK_JOBS,
      selectedCategory: "IT/개발",
    });
  },

  uploadResume: async (file) => {
    set({
      resumeFile: file,
      isUploadingResume: true,
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const { jobRoles } = get();

      const aiRecommendedId = 1;

      const recommendedJob = jobRoles.find(
        (job) => job.id === aiRecommendedId,
      );

      set({
        recommendedJobId: aiRecommendedId,
        selectedJobId: aiRecommendedId,
        selectedCategory: recommendedJob
          ? recommendedJob.category
          : get().selectedCategory,
        step: "jobSelect",
      });
    } catch (error) {
      console.error("자소서 분석 실패:", error);

      alert(
        "자소서 분석 중 오류가 발생했습니다. 직접 직무를 선택해주세요.",
      );

      set({ step: "jobSelect" });
    } finally {
      set({ isUploadingResume: false });
    }
  },

  startInterviewSession: async () => {
    const { selectedJobId } = get();

    if (!selectedJobId) {
      alert("직무를 선택해주세요.");
      return;
    }

    try {
      const result = await startInterview({
        jobRoleId: selectedJobId,
      });

      console.log("[Interview] 면접 생성 성공:", result);

      if (result.userId != null) {
        localStorage.setItem(
          "interviewfit_user_id",
          String(result.userId),
        );
      }

      set({
        interviewId: result.interviewId,
        startedUserId: result.userId,
        jobRoleId: selectedJobId,
        currentQuestionIdx: 0,
        questionMode: "base",
        followUpQuestion: null,
        followUpError: null,
        step: "prepare",
      });
    } catch (error) {
      console.error("[Interview] 면접 시작 API 실패:", error);

      alert(
        error instanceof Error
          ? error.message
          : "면접 시작에 실패했습니다.",
      );
    }
  },

  /**
   * 방금 답변한 기본 질문을 기반으로 꼬리질문 1개를 생성한다.
   *
   * 실패해도 흐름을 막지 않고 false를 반환한다.
   * 호출한 쪽(InterviewRecording)에서 실패 시 다음 기본 질문으로 넘어간다.
   */
  requestFollowUp: async ({ originalQuestion }) => {
    const { jobRoleId, interviewId } = get();

    if (!jobRoleId) {
      console.warn(
        "[FollowUp] jobRoleId가 없어 꼬리질문을 생성할 수 없습니다.",
      );
      set({ followUpError: "직무 정보가 없습니다." });
      return false;
    }

    set({
      isFetchingFollowUp: true,
      followUpError: null,
      followUpQuestion: null,
    });

    try {
      const result = await createFollowUpQuestion({
        jobRoleId,
        interviewId: interviewId ?? undefined,
        originalQuestion,
        // TODO: STT 연동되면 실제 답변 텍스트로 교체.
        //       지금은 답변 텍스트를 즉시 얻을 수 없어 placeholder를 보낸다.
        answer: "답변을 마쳤습니다.",
        interviewStyle: "normal",
      });

      // 서버 응답 필드 이름이 여러 개일 수 있으므로 우선순위대로 조회
      const followUpText =
        (result.followUpQuestion as string | undefined) ??
        (result.follow_up_question as string | undefined) ??
        (result.question as string | undefined) ??
        null;

      if (!followUpText) {
        console.warn(
          "[FollowUp] 서버 응답에 꼬리질문 텍스트가 없습니다:",
          result,
        );
        set({
          isFetchingFollowUp: false,
          followUpError: "꼬리질문을 받지 못했습니다.",
        });
        return false;
      }

      set({
        isFetchingFollowUp: false,
        followUpQuestion: followUpText,
        questionMode: "followup",
      });

      console.log("[FollowUp] 꼬리질문 생성 성공:", followUpText);
      return true;
    } catch (error) {
      console.error("[FollowUp] 꼬리질문 API 실패:", error);

      set({
        isFetchingFollowUp: false,
        followUpError:
          error instanceof Error
            ? error.message
            : "꼬리질문 생성에 실패했습니다.",
      });

      return false;
    }
  },

  /**
   * 꼬리질문 표시가 끝난 뒤 상태 초기화.
   * 다음 기본 질문으로 넘어가기 전에 호출한다.
   */
  resetFollowUp: () => {
    set({
      questionMode: "base",
      followUpQuestion: null,
      isFetchingFollowUp: false,
      followUpError: null,
    });
  },

  reset: () => {
    set(initialState);
  },
}));