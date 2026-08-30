import { create } from "zustand";

import {
  createFollowUpQuestion,
  getJobRoles,
  startInterview,
  analyzeCoverLetter,
  createQuestionsWithRetry,
  transcribeFollowUpAnswer,
  saveFollowUpAnswer,
  uploadAnswerVideo,
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

export type FollowUpSlotStatus = "idle" | "loading" | "ready" | "failed";

export type FollowUpSlot = {
  status: FollowUpSlotStatus;
  followUpQuestionId: number | null;
  question: string | null;
  sourceQuestionId?: number;
  error?: string;
};

interface InterviewState {
  step: Step;
  countdown: number;
  time: number;
  currentQuestionIdx: number;
  questionMode: QuestionMode;

  /**
   * 사용자가 면접 시작 전 선택하는 꼬리질문 사용 여부.
   * false이면 기본 질문 3개 종료 후 바로 분석 단계로 이동한다.
   */
  isFollowUpEnabled: boolean;

  /**
   * 기본 질문 index와 1:1로 대응하는 꼬리질문 슬롯.
   * 비동기 생성 완료 순서가 뒤섞여도 Q1/Q2/Q3의 꼬리질문 순서를 유지한다.
   */
  followUpSlots: FollowUpSlot[];
  activeFollowUpGenerationTasks: number;
  activeFollowUpSaveTasks: number;

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

  generatedQuestions: Array<{ id: number; question: string }>;
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

  addFollowUpTask: (
    blob: Blob,
    originalQuestion: string,
    baseQuestionIndex: number,
    sourceQuestionId?: number,
  ) => Promise<void>;

  saveFollowUpAnswerTask: (
    blob: Blob,
    followUpQuestionId: number,
  ) => Promise<void>;

  reset: () => void;
}

const initialState: Omit<InterviewState, "jobRoles"> = {
  step: "resumePrompt",
  countdown: 3,
  time: 0,
  currentQuestionIdx: 0,
  questionMode: "base",

  isFollowUpEnabled: true,
  followUpSlots: [],
  activeFollowUpGenerationTasks: 0,
  activeFollowUpSaveTasks: 0,

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

function emptyFollowUpSlots(count: number): FollowUpSlot[] {
  return Array.from({ length: count }, () => ({
    status: "idle" as const,
    followUpQuestionId: null,
    question: null,
  }));
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export const useInterviewStore = create<InterviewState & InterviewActions>((set, get) => ({
  ...initialState,
  jobRoles: FALLBACK_JOBS,

  setStep: (step) => set({ step }),
  setCountdown: (val) =>
    set((state) => ({
      countdown: typeof val === "function" ? val(state.countdown) : val,
    })),
  setTime: (val) =>
    set((state) => ({
      time: typeof val === "function" ? val(state.time) : val,
    })),
  setCurrentQuestionIdx: (val) =>
    set((state) => ({
      currentQuestionIdx:
        typeof val === "function" ? val(state.currentQuestionIdx) : val,
    })),

  setSelectedCategory: (category) =>
    set({ selectedCategory: category, selectedJobId: null }),
  setSelectedJobId: (id) => set({ selectedJobId: id }),

  setIsFollowUpEnabled: (val) => set({ isFollowUpEnabled: val }),
  setQuestionMode: (mode) => set({ questionMode: mode }),

  fetchJobRoles: async () => {
    try {
      const data = await getJobRoles();
      if (Array.isArray(data) && data.length > 0) {
        const categories = Array.from(new Set(data.map((job) => job.category)));
        const currentCategory = get().selectedCategory;
        const selectedCategory =
          currentCategory && categories.includes(currentCategory)
            ? currentCategory
            : categories[0] ?? "IT/개발";

        set({ jobRoles: data, selectedCategory });
        return;
      }
    } catch (error) {
      console.warn(
        "[Interview] 직무 목록 조회 실패. 기본 직무 목록을 사용합니다.",
        error,
      );
    }

    set({
      jobRoles: FALLBACK_JOBS,
      selectedCategory: "IT/개발",
    });
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

    const selectedJob = jobRoles.find((job) => job.id === selectedJobId);
    if (!selectedJob) {
      return;
    }

    try {
      /*
       * 1) Interview를 먼저 생성한다.
       * 2) 생성된 interviewId를 질문 생성 API에 함께 전달한다.
       * 3) Spring이 questions.interview_id / question_order를 연결한다.
       */
      const result = await startInterview({ jobRoleId: selectedJobId });

      const questionsResponse = await createQuestionsWithRetry({
        interviewId: result.interviewId,
        count: 3,
        jobRoleId: selectedJobId,
        jobName: selectedJob.name,
        coverLetterId: coverLetterId ?? undefined,
      });

      console.log("[Interview] 생성 및 연결된 질문 목록:", questionsResponse);

      set({
        interviewId: result.interviewId,
        startedUserId: result.userId,
        jobRoleId: selectedJobId,
        currentQuestionIdx: 0,
        questionMode: "base",
        followUpSlots: emptyFollowUpSlots(questionsResponse.length),
        activeFollowUpGenerationTasks: 0,
        activeFollowUpSaveTasks: 0,
        step: "prepare",
        generatedQuestions: questionsResponse,
      });
    } catch (error: unknown) {
      console.error("[Interview] 면접 시작 또는 질문 생성 API 실패:", error);
      alert(error instanceof Error ? error.message : "면접 준비에 실패했습니다.");
    }
  },

  addFollowUpTask: async (
    blob,
    originalQuestion,
    baseQuestionIndex,
    sourceQuestionId,
  ) => {
    set((state) => {
      const nextSlots = [...state.followUpSlots];
      nextSlots[baseQuestionIndex] = {
        status: "loading",
        followUpQuestionId: null,
        question: null,
        sourceQuestionId,
      };

      return {
        followUpSlots: nextSlots,
        activeFollowUpGenerationTasks:
          state.activeFollowUpGenerationTasks + 1,
      };
    });

    try {
      const { jobRoleId, interviewId } = get();

      if (!jobRoleId || !interviewId) {
        throw new Error("면접 또는 직무 정보가 없습니다.");
      }

      if (!sourceQuestionId) {
        throw new Error("원 질문 ID를 확인할 수 없습니다.");
      }

      /*
       * 기본 질문 답변은 두 가지 용도로 사용한다.
       *
       * 1) Whisper STT -> 꼬리질문 생성용 텍스트
       * 2) interview_answers 저장 -> sourceAnswerId 확보
       *
       * 두 작업은 서로 독립적이므로 동시에 실행한다.
       */
      const [transcription, savedAnswer] = await Promise.all([
        transcribeFollowUpAnswer(blob),
        uploadAnswerVideo({
          interviewId,
          file: blob,
          answerOrder: baseQuestionIndex + 1,
          questionId: sourceQuestionId,
        }),
      ]);

      console.log("[FollowUp] 원 답변 저장 완료:", {
        questionId: sourceQuestionId,
        answerId: savedAnswer.answerId,
      });

      const result = await createFollowUpQuestion({
        jobRoleId,
        interviewId,
        originalQuestion,
        answer: transcription.text,
        interviewStyle: "normal",
        sourceQuestionId,
        sourceAnswerId: savedAnswer.answerId,
      });

      const followUpQuestion =
        result?.followUpQuestion ??
        result?.follow_up_question ??
        result?.question ??
        (result?.data as { followUpQuestion?: string; question?: string; follow_up_question?: string } | undefined)
          ?.followUpQuestion ??
        (result?.data as { question?: string } | undefined)?.question ??
        (result?.data as { follow_up_question?: string } | undefined)?.follow_up_question;

      const followUpQuestionId = toNumber(
        result?.followUpQuestionId ??
          result?.follow_up_question_id ??
          result?.id,
      );

      if (!followUpQuestion || !followUpQuestionId) {
        throw new Error("꼬리질문 ID 또는 질문 텍스트를 확인할 수 없습니다.");
      }

      set((state) => {
        const nextSlots = [...state.followUpSlots];
        nextSlots[baseQuestionIndex] = {
          status: "ready",
          followUpQuestionId,
          question: followUpQuestion,
          sourceQuestionId,
        };

        return { followUpSlots: nextSlots };
      });
    } catch (error) {
      console.warn(
        `[FollowUp] 기본 질문 ${baseQuestionIndex + 1}의 꼬리질문 생성 실패:`,
        error,
      );

      set((state) => {
        const nextSlots = [...state.followUpSlots];
        nextSlots[baseQuestionIndex] = {
          status: "failed",
          followUpQuestionId: null,
          question: null,
          sourceQuestionId,
          error: error instanceof Error ? error.message : "꼬리질문 생성 실패",
        };

        return { followUpSlots: nextSlots };
      });
    } finally {
      set((state) => ({
        activeFollowUpGenerationTasks: Math.max(
          0,
          state.activeFollowUpGenerationTasks - 1,
        ),
      }));
    }
  },

  saveFollowUpAnswerTask: async (blob, followUpQuestionId) => {
    set((state) => ({
      activeFollowUpSaveTasks: state.activeFollowUpSaveTasks + 1,
    }));

    try {
      const { interviewId } = get();

      if (!interviewId) {
        throw new Error("면접 정보가 없습니다.");
      }

      const transcription = await transcribeFollowUpAnswer(blob);

      await saveFollowUpAnswer({
        interviewId,
        followUpQuestionId,
        answerText: transcription.text,
      });

      console.log(
        `[FollowUp] 꼬리질문 ${followUpQuestionId} 답변 저장 완료`,
      );
    } catch (error) {
      console.warn("[FollowUp] 꼬리질문 답변 저장 실패:", error);
    } finally {
      set((state) => ({
        activeFollowUpSaveTasks: Math.max(0, state.activeFollowUpSaveTasks - 1),
      }));
    }
  },

  reset: () => {
    set({
      ...initialState,
      coverLetterId: null,
      jobRoles: [...FALLBACK_JOBS],
    });
  },
}));
