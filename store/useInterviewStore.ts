// store/useInterviewStore.ts

import { create } from "zustand";

import {
  createInterviewQuestions,
  getJobRoles,
  startInterview,
  type InterviewQuestion,
} from "@/lib/api";

import type { JobRole } from "@/types";

const FALLBACK_JOBS: JobRole[] = [
  {
    id: 1,
    category: "IT/개발",
    name: "프론트엔드",
  },
  {
    id: 2,
    category: "IT/개발",
    name: "백엔드",
  },
  {
    id: 3,
    category: "디자인",
    name: "UX/UI 디자이너",
  },
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

  /*
   * 이제 하드코딩 문자열이 아니라
   * 서버에서 생성된 질문 ID + 질문 내용을 저장한다.
   */
  questions: InterviewQuestion[];

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
    val: number | ((prev: number) => number)
  ) => void;

  setTime: (
    val: number | ((prev: number) => number)
  ) => void;

  setCurrentQuestionIdx: (
    val: number | ((prev: number) => number)
  ) => void;

  setSelectedCategory: (
    category: string | null
  ) => void;

  setSelectedJobId: (
    id: number | null
  ) => void;

  fetchJobRoles: () => Promise<void>;

  uploadResume: (
    file: File
  ) => Promise<void>;

  startInterviewSession: () => Promise<void>;

  reset: () => void;
}

const initialState: InterviewState = {
  step: "resumePrompt",

  countdown: 3,
  time: 0,

  currentQuestionIdx: 0,

  questions: [],

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

export const useInterviewStore =
  create<InterviewState & InterviewActions>(
    (set, get) => ({
      ...initialState,

      setStep: (step) =>
        set({
          step,
        }),

      setCountdown: (val) =>
        set((state) => ({
          countdown:
            typeof val === "function"
              ? val(state.countdown)
              : val,
        })),

      setTime: (val) =>
        set((state) => ({
          time:
            typeof val === "function"
              ? val(state.time)
              : val,
        })),

      setCurrentQuestionIdx: (val) =>
        set((state) => ({
          currentQuestionIdx:
            typeof val === "function"
              ? val(state.currentQuestionIdx)
              : val,
        })),

      setSelectedCategory: (
        category
      ) =>
        set({
          selectedCategory: category,
          selectedJobId: null,
        }),

      setSelectedJobId: (id) =>
        set({
          selectedJobId: id,
        }),

      fetchJobRoles: async () => {
        try {
          const data =
            await getJobRoles();

          if (
            data &&
            data.length > 0
          ) {
            const firstCategory =
              Array.from(
                new Set(
                  data.map(
                    (job) =>
                      job.category
                  )
                )
              )[0];

            set({
              jobRoles: data,
              selectedCategory:
                firstCategory,
            });

            return;
          }
        } catch (error) {
          console.warn(
            "백엔드 직무 목록 조회 실패. 임시 데이터를 사용합니다.",
            error
          );
        }

        set({
          jobRoles:
            FALLBACK_JOBS,

          selectedCategory:
            "IT/개발",
        });
      },

      uploadResume: async (
        file
      ) => {
        set({
          resumeFile: file,
          isUploadingResume: true,
        });

        try {
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                2000
              )
          );

          const {
            jobRoles,
          } = get();

          const aiRecommendedId =
            1;

          const recommendedJob =
            jobRoles.find(
              (job) =>
                job.id ===
                aiRecommendedId
            );

          set({
            recommendedJobId:
              aiRecommendedId,

            selectedJobId:
              aiRecommendedId,

            selectedCategory:
              recommendedJob
                ? recommendedJob.category
                : get()
                    .selectedCategory,

            step: "jobSelect",
          });
        } catch (error) {
          console.error(
            "자소서 분석 실패:",
            error
          );

          alert(
            "자소서 분석 중 오류가 발생했습니다. 직접 직무를 선택해주세요."
          );

          set({
            step: "jobSelect",
          });
        } finally {
          set({
            isUploadingResume:
              false,
          });
        }
      },

      startInterviewSession:
        async () => {
          const {
            selectedJobId,
            jobRoles,
          } = get();

          if (
            !selectedJobId
          ) {
            alert(
              "직무를 선택해주세요."
            );

            return;
          }

          const selectedJob =
            jobRoles.find(
              (job) =>
                job.id ===
                selectedJobId
            );

          if (!selectedJob) {
            alert(
              "선택한 직무 정보를 찾을 수 없습니다."
            );

            return;
          }

          try {
            /*
             * 1. 면접 생성
             *
             * userId는 JWT에서 처리한다.
             */
            const interview =
              await startInterview({
                jobRoleId:
                  selectedJobId,
              });

            /*
             * 2. 질문 생성
             *
             * 여기서 DB Question ID까지 함께 받아온다.
             */
            const questions =
              await createInterviewQuestions({
                count: 3,

                jobRoleId:
                  selectedJobId,

                jobName:
                  selectedJob.name,
              });

            if (
              !questions ||
              questions.length ===
                0
            ) {
              throw new Error(
                "생성된 면접 질문이 없습니다."
              );
            }

            localStorage.setItem(
              "interviewfit_user_id",
              String(
                interview.userId
              )
            );

            console.log(
              "면접 생성 완료:",
              interview
            );

            console.log(
              "면접 질문 생성 완료:",
              questions
            );

            set({
              interviewId:
                interview.interviewId,

              startedUserId:
                interview.userId,

              jobRoleId:
                selectedJobId,

              questions,

              currentQuestionIdx:
                0,

              step: "prepare",
            });
          } catch (error) {
            console.error(
              "면접 시작 또는 질문 생성 실패:",
              error
            );

            /*
             * followup 실제 연동에서는
             * fake interviewId=9999로 넘어가면 안 된다.
             *
             * 실제 questionId가 필요하기 때문.
             */
            alert(
              error instanceof
                Error
                ? error.message
                : "면접 시작에 실패했습니다."
            );
          }
        },

      reset: () =>
        set(initialState),
    })
  );