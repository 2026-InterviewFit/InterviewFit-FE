// store/useInterviewStore.ts

import { create } from "zustand";

import {
  getJobRoles,
  startInterview,
} from "@/lib/api";

import type {
  JobRole,
} from "@/types";


/**
 * 백엔드 직무 목록 API가 실패했을 때
 * 화면이 완전히 막히는 것을 방지하기 위한 임시 데이터.
 *
 * 질문 생성과는 관계없음.
 */
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

  jobRoles: JobRole[];

  selectedCategory: string | null;
  selectedJobId: number | null;
  recommendedJobId: number | null;

  resumeFile: File | null;
  isUploadingResume: boolean;

  /**
   * 실제 Spring에서 생성된 면접 정보
   */
  interviewId: number | null;
  startedUserId: number | null;
  jobRoleId: number | null;
}


interface InterviewActions {
  setStep: (
    step: Step,
  ) => void;

  setCountdown: (
    val:
      | number
      | ((prev: number) => number),
  ) => void;

  setTime: (
    val:
      | number
      | ((prev: number) => number),
  ) => void;

  setCurrentQuestionIdx: (
    val:
      | number
      | ((prev: number) => number),
  ) => void;

  setSelectedCategory: (
    category: string | null,
  ) => void;

  setSelectedJobId: (
    id: number | null,
  ) => void;

  fetchJobRoles: () => Promise<void>;

  uploadResume: (
    file: File,
  ) => Promise<void>;

  startInterviewSession:
    () => Promise<void>;

  reset: () => void;
}


const initialState: InterviewState = {
  step: "resumePrompt",

  countdown: 3,

  time: 0,

  currentQuestionIdx: 0,

  jobRoles: [],

  selectedCategory:
    "IT/개발",

  selectedJobId: null,

  recommendedJobId: null,

  resumeFile: null,

  isUploadingResume: false,

  interviewId: null,

  startedUserId: null,

  jobRoleId: null,
};


export const useInterviewStore =
  create<
    InterviewState &
      InterviewActions
  >(
    (set, get) => ({
      ...initialState,


      /**
       * 현재 면접 화면 단계 변경
       */
      setStep: (
        step,
      ) => {
        set({
          step,
        });
      },


      /**
       * 카운트다운 변경
       */
      setCountdown: (
        val,
      ) => {
        set(
          (state) => ({
            countdown:
              typeof val ===
              "function"
                ? val(
                    state.countdown,
                  )
                : val,
          }),
        );
      },


      /**
       * 녹화 시간 변경
       */
      setTime: (
        val,
      ) => {
        set(
          (state) => ({
            time:
              typeof val ===
              "function"
                ? val(
                    state.time,
                  )
                : val,
          }),
        );
      },


      /**
       * 현재 질문 번호 변경
       */
      setCurrentQuestionIdx: (
        val,
      ) => {
        set(
          (state) => ({
            currentQuestionIdx:
              typeof val ===
              "function"
                ? val(
                    state.currentQuestionIdx,
                  )
                : val,
          }),
        );
      },


      /**
       * 직무 카테고리 선택
       */
      setSelectedCategory: (
        category,
      ) => {
        set({
          selectedCategory:
            category,

          /**
           * 카테고리가 바뀌면
           * 기존 직무 선택은 초기화
           */
          selectedJobId:
            null,
        });
      },


      /**
       * 직무 선택
       */
      setSelectedJobId: (
        id,
      ) => {
        set({
          selectedJobId: id,
        });
      },


      /**
       * Spring에서 직무 목록 조회
       */
      fetchJobRoles:
        async () => {
          try {
            const data =
              await getJobRoles();

            if (
              data &&
              data.length >
                0
            ) {
              const categories =
                Array.from(
                  new Set(
                    data.map(
                      (
                        job,
                      ) =>
                        job.category,
                    ),
                  ),
                );

              const firstCategory =
                categories[0] ??
                "IT/개발";

              set({
                jobRoles: data,

                selectedCategory:
                  firstCategory,
              });

              return;
            }
          } catch (
            error
          ) {
            console.warn(
              "백엔드 직무 목록 조회 실패. 임시 데이터를 사용합니다.",
              error,
            );
          }

          /**
           * 직무 목록 조회만 fallback 허용.
           *
           * 면접 ID와 달리
           * 화면 표시용 데이터이기 때문에
           * 임시 데이터를 사용할 수 있음.
           */
          set({
            jobRoles:
              FALLBACK_JOBS,

            selectedCategory:
              "IT/개발",
          });
        },


      /**
       * 현재는 자소서 분석 임시 처리
       *
       * 질문 생성 담당 코드와는 관계없음.
       */
      uploadResume:
        async (
          file,
        ) => {
          set({
            resumeFile:
              file,

            isUploadingResume:
              true,
          });

          try {
            /**
             * 현재 임시 분석 대기
             */
            await new Promise(
              (
                resolve,
              ) =>
                setTimeout(
                  resolve,
                  2000,
                ),
            );

            const {
              jobRoles,
            } = get();

            /**
             * 현재 임시 추천 직무
             */
            const aiRecommendedId =
              1;

            const recommendedJob =
              jobRoles.find(
                (
                  job,
                ) =>
                  job.id ===
                  aiRecommendedId,
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

              step:
                "jobSelect",
            });
          } catch (
            error
          ) {
            console.error(
              "자소서 분석 실패:",
              error,
            );

            alert(
              "자소서 분석 중 오류가 발생했습니다. 직접 직무를 선택해주세요.",
            );

            set({
              step:
                "jobSelect",
            });
          } finally {
            set({
              isUploadingResume:
                false,
            });
          }
        },


      /**
       * 실제 면접 생성
       *
       * 중요:
       * userId를 프론트에서 보내지 않는다.
       *
       * Authorization Bearer JWT를 통해
       * Spring이 현재 로그인 사용자를 판단한다.
       *
       * 질문 생성은 여기서 하지 않는다.
       * 질문 생성 담당 팀원의 흐름과 분리한다.
       */
      startInterviewSession:
        async () => {
          const {
            selectedJobId,
          } = get();

          if (
            !selectedJobId
          ) {
            alert(
              "직무를 선택해주세요.",
            );

            return;
          }

          try {
            const result =
              await startInterview(
                {
                  jobRoleId:
                    selectedJobId,
                },
              );

            console.log(
              "[Interview] 면접 생성 성공:",
              result,
            );

            /**
             * 기존 코드에서 참조하는
             * userId도 실제 응답값으로 저장.
             */
            if (
              result.userId !=
              null
            ) {
              localStorage.setItem(
                "interviewfit_user_id",
                String(
                  result.userId,
                ),
              );
            }

            set({
              interviewId:
                result.interviewId,

              startedUserId:
                result.userId,

              jobRoleId:
                selectedJobId,

              currentQuestionIdx:
                0,

              step:
                "prepare",
            });
          } catch (
            error
          ) {
            console.error(
              "[Interview] 면접 시작 API 실패:",
              error,
            );

            /**
             * 실제 followup / 영상 분석 / DB 저장에서는
             *
             * interviewId = 9999
             *
             * 같은 가짜 ID를 사용하면
             * 뒤 API가 전부 꼬이기 때문에
             * 로컬 테스트 모드로 강제 진행하지 않는다.
             */
            alert(
              error instanceof
                Error
                ? error.message
                : "면접 시작에 실패했습니다.",
            );
          }
        },


      /**
       * 면접 상태 초기화
       */
      reset: () => {
        set(
          initialState,
        );
      },
    }),
  );