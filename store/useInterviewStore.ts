// store/useInterviewStore.ts

import { create } from "zustand";

import {
  getJobRoles,
  startInterview,
  createFollowUpQuestion,
  createFollowUpAnswer,
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

export type QuestionMode = "base" | "followup";

interface InterviewState {
  step: Step;
  countdown: number;
  time: number;

  currentQuestionIdx: number;

  questionMode: QuestionMode;

  followUpQuestion: string | null;

  /**
   * 현재 표시 중인 꼬리질문의 DB ID.
   * createFollowUpQuestion 응답의 followUpId.
   * 이 값을 꼬리답변 저장 시 followUpQuestionId로 사용.
   */
  currentFollowUpId: number | null;

  /**
   * 꼬리질문 답변 구간이 시작된 시각(초).
   * 꼬리질문이 표시된 순간의 recording time.
   */
  followUpStartTime: number | null;

  isFetchingFollowUp: boolean;
  followUpError: string | null;

  nextAnswerOrder: number;

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
   * 꼬리질문 생성.
   * 성공 시 currentFollowUpId, followUpStartTime도 세팅.
   */
  requestFollowUp: (params: {
    originalQuestion: string;
    answerText: string;
    followUpStartTime: number;
  }) => Promise<boolean>;

  /**
   * 꼬리질문 답변 저장.
   * 꼬리질문 답변 완료 시 호출.
   */
  saveFollowUpAnswer: (params: {
    endTime: number;
    answerText: string;
  }) => Promise<boolean>;

  resetFollowUp: () => void;

  incrementAnswerOrder: () => void;

  reset: () => void;
}

const initialState: InterviewState = {
  step: "resumePrompt",
  countdown: 3,
  time: 0,

  currentQuestionIdx: 0,

  questionMode: "base",
  followUpQuestion: null,
  currentFollowUpId: null,
  followUpStartTime: null,
  isFetchingFollowUp: false,
  followUpError: null,

  nextAnswerOrder: 1,

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

export const useInterviewStore = create<
  InterviewState & InterviewActions
>((set, get) => ({
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
        currentFollowUpId: null,
        followUpStartTime: null,
        followUpError: null,
        nextAnswerOrder: 1,
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

  requestFollowUp: async ({
    originalQuestion,
    answerText,
    followUpStartTime,
  }) => {
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
      currentFollowUpId: null,
    });

    try {
      const result = await createFollowUpQuestion({
        jobRoleId,
        interviewId: interviewId ?? undefined,
        originalQuestion,
        answer: answerText,
        interviewStyle: "normal",
      });

      const followUpText =
        (result.followUpQuestion as string | undefined) ??
        (result.follow_up_question as string | undefined) ??
        (result.question as string | undefined) ??
        null;

      // Spring 응답의 실제 필드명(snake/camel) 모두 대응
      const followUpId =
        result.followUpQuestionId ??
        result.follow_up_question_id ??
        result.id ??
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
        currentFollowUpId: followUpId,
        followUpStartTime,
        questionMode: "followup",
      });

      console.log(
        "[FollowUp] 꼬리질문 생성 성공. id:",
        followUpId,
        ", text:",
        followUpText,
      );
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
   * 꼬리질문 답변 저장.
   * 꼬리질문 답변 완료 시 호출.
   *
   * 실패해도 흐름을 막지 않는다.
   */
  saveFollowUpAnswer: async ({ endTime, answerText }) => {
    const {
      currentFollowUpId,
      followUpStartTime,
      interviewId,
    } = get();

    if (!currentFollowUpId) {
      console.warn(
        "[FollowUpAnswer] 저장할 꼬리질문 ID가 없습니다. (실패한 요청일 수 있음)",
      );
      return false;
    }

    try {
      const result = await createFollowUpAnswer({
        interviewId: interviewId ?? undefined,
        followUpQuestionId: currentFollowUpId,
        answerText,
        startTime: followUpStartTime ?? undefined,
        endTime,
      });

      console.log(
        "[FollowUpAnswer] 꼬리질문 답변 저장 성공:",
        result,
      );
      return true;
    } catch (error) {
      console.error(
        "[FollowUpAnswer] 꼬리질문 답변 저장 실패:",
        error,
      );
      return false;
    }
  },

  resetFollowUp: () => {
    set({
      questionMode: "base",
      followUpQuestion: null,
      currentFollowUpId: null,
      followUpStartTime: null,
      isFetchingFollowUp: false,
      followUpError: null,
    });
  },

  incrementAnswerOrder: () => {
    set((state) => ({
      nextAnswerOrder: state.nextAnswerOrder + 1,
    }));
  },

  reset: () => {
    set(initialState);
  },
}));