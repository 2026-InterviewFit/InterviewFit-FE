import { create } from "zustand";

import {
  createFollowUpQuestion,
  getJobRoles,
  startInterview,
} from "@/lib/api";

import type { JobRole } from "@/types";


/**
 * 백엔드 직무 목록 조회에 실패했을 때 사용하는 기본 직무 목록.
 *
 * develop 브랜치에서 사용하던 10개 직무를 fallback으로 유지한다.
 */
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


/**
 * 현재 화면이 기본 질문인지,
 * 기본 질문에 대한 꼬리질문인지 구분한다.
 */
export type QuestionMode =
  | "base"
  | "followup";


interface InterviewState {
  step: Step;

  countdown: number;

  time: number;

  currentQuestionIdx: number;

  /**
   * base:
   * 기본 질문
   *
   * followup:
   * 방금 생성된 꼬리질문
   */
  questionMode: QuestionMode;

  /**
   * 현재 표시할 꼬리질문.
   */
  followUpQuestion:
    | string
    | null;

  /**
   * 생성된 꼬리질문의 DB ID.
   * 다음 단계에서 꼬리질문 답변 저장 시 사용한다.
   */
  followUpQuestionId:
    | number
    | null;

  /**
   * 꼬리질문 생성 상태.
   */
  isFetchingFollowUp: boolean;

  followUpError:
    | string
    | null;

  jobRoles: JobRole[];

  selectedCategory:
    | string
    | null;

  selectedJobId:
    | number
    | null;

  recommendedJobId:
    | number
    | null;

  resumeFile:
    | File
    | null;

  isUploadingResume: boolean;

  /**
   * 실제 Spring Interview ID.
   */
  interviewId:
    | number
    | null;

  /**
   * 면접 생성 응답의 사용자 ID.
   *
   * 인증 자체는 HttpOnly Cookie를 사용하므로
   * localStorage에는 저장하지 않는다.
   */
  startedUserId:
    | number
    | null;

  jobRoleId:
    | number
    | null;
}


interface InterviewActions {
  setStep:
    (step: Step) =>
      void;

  setCountdown:
    (
      val:
        | number
        | ((
            prev: number,
          ) => number),
    ) => void;

  setTime:
    (
      val:
        | number
        | ((
            prev: number,
          ) => number),
    ) => void;

  setCurrentQuestionIdx:
    (
      val:
        | number
        | ((
            prev: number,
          ) => number),
    ) => void;

  setSelectedCategory:
    (
      category:
        | string
        | null,
    ) => void;

  setSelectedJobId:
    (
      id:
        | number
        | null,
    ) => void;

  /**
   * 백엔드 직무 목록 조회.
   *
   * 실패하면 FALLBACK_JOBS를 사용한다.
   */
  fetchJobRoles:
    () => Promise<void>;

  /**
   * 현재 자소서 AI 분석 API가 아직 연결되지 않았으므로
   * develop의 임시 추천 로직을 유지한다.
   */
  uploadResume:
    (
      file: File,
    ) => Promise<void>;

  /**
   * 실제 Spring Interview 생성 API 호출.
   */
  startInterviewSession:
    () => Promise<void>;

  /**
   * 기본 질문 + Whisper STT 답변을 기반으로
   * 꼬리질문을 정확히 1개 생성한다.
   */
  requestFollowUp:
    (
      params: {
        originalQuestion:
          string;

        answer:
          string;
      },
    ) => Promise<boolean>;

  /**
   * 꼬리질문 상태를 초기화하고
   * 다음 기본 질문으로 넘어갈 준비를 한다.
   */
  resetFollowUp:
    () => void;

  reset:
    () => void;
}


const initialState: InterviewState = {
  step:
    "resumePrompt",

  countdown:
    3,

  time:
    0,

  currentQuestionIdx:
    0,

  questionMode:
    "base",

  followUpQuestion:
    null,

  followUpQuestionId:
    null,

  isFetchingFollowUp:
    false,

  followUpError:
    null,

  /**
   * 초기 화면에서도 직무 목록이 보이도록
   * fallback을 먼저 넣어두고,
   * fetchJobRoles() 성공 시 백엔드 데이터로 교체한다.
   */
  jobRoles:
    FALLBACK_JOBS,

  selectedCategory:
    "IT/개발",

  selectedJobId:
    null,

  recommendedJobId:
    null,

  resumeFile:
    null,

  isUploadingResume:
    false,

  interviewId:
    null,

  startedUserId:
    null,

  jobRoleId:
    null,
};


export const useInterviewStore =
  create<
    InterviewState &
      InterviewActions
  >(
    (
      set,
      get,
    ) => ({
      ...initialState,


      setStep:
        (step) => {
          set({
            step,
          });
        },


      setCountdown:
        (val) => {
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


      setTime:
        (val) => {
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


      setCurrentQuestionIdx:
        (val) => {
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


      setSelectedCategory:
        (category) => {
          set({
            selectedCategory:
              category,

            selectedJobId:
              null,
          });
        },


      setSelectedJobId:
        (id) => {
          set({
            selectedJobId:
              id,
          });
        },


      fetchJobRoles:
        async () => {
          try {
            const data =
              await getJobRoles();


            if (
              Array.isArray(
                data,
              ) &&
              data.length >
                0
            ) {
              const categories =
                Array.from(
                  new Set(
                    data.map(
                      (job) =>
                        job.category,
                    ),
                  ),
                );


              /**
               * 기존 선택 카테고리가
               * 서버 데이터에 존재하면 유지하고,
               * 없으면 첫 카테고리를 선택한다.
               */
              const currentCategory =
                get()
                  .selectedCategory;


              const selectedCategory =
                currentCategory &&
                categories.includes(
                  currentCategory,
                )
                  ? currentCategory
                  : categories[0] ??
                    "IT/개발";


              set({
                jobRoles:
                  data,

                selectedCategory,
              });


              return;
            }

          } catch (
            error
          ) {
            console.warn(
              "[Interview] 직무 목록 조회 실패. 기본 직무 목록을 사용합니다.",
              error,
            );
          }


          set({
            jobRoles:
              FALLBACK_JOBS,

            selectedCategory:
              "IT/개발",
          });
        },


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
             * TODO:
             * 실제 자소서 분석 API 연결 시 교체.
             *
             * 현재 develop 브랜치 UI 흐름을 보존하기 위한
             * 임시 분석 지연.
             */
            await new Promise(
              (resolve) =>
                setTimeout(
                  resolve,
                  3000,
                ),
            );


            const {
              jobRoles,
            } =
              get();


            /**
             * TODO:
             * 실제 분석 응답의 추천 직무명으로 교체.
             */
            const analyzedJobName =
              "데이터 엔지니어";


            const matchedJob =
              jobRoles.find(
                (job) =>
                  job.name ===
                  analyzedJobName,
              );


            let aiRecommendedId:
              number;

            let updatedJobRoles =
              [
                ...jobRoles,
              ];

            let targetCategory:
              string;


            if (
              matchedJob
            ) {
              aiRecommendedId =
                matchedJob.id;

              targetCategory =
                matchedJob.category;

            } else {
              /**
               * 추천 직무가 현재 목록에 없으면
               * develop UI의 "기타" 직무 표시 방식을 유지.
               */
              aiRecommendedId =
                999;

              targetCategory =
                "기타";


              const newJob:
                JobRole = {
                id:
                  aiRecommendedId,

                category:
                  targetCategory,

                name:
                  `기타 (${analyzedJobName})`,
              };


              updatedJobRoles =
                [
                  ...jobRoles,
                  newJob,
                ];
            }


            set({
              jobRoles:
                updatedJobRoles,

              recommendedJobId:
                aiRecommendedId,

              selectedJobId:
                aiRecommendedId,

              selectedCategory:
                targetCategory,

              step:
                "jobSelect",
            });

          } catch (
            error
          ) {
            console.error(
              "[Interview] 자소서 분석 실패:",
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


      startInterviewSession:
        async () => {
          const {
            selectedJobId,
          } =
            get();


          if (
            !selectedJobId
          ) {
            alert(
              "직무를 선택해주세요.",
            );

            return;
          }


          try {
            /**
             * 실제 Spring API 호출.
             *
             * 인증 사용자 ID는 FE에서 보내지 않고
             * HttpOnly Access Cookie를 통해
             * Spring Security에서 식별한다.
             */
            const result =
              await startInterview({
                jobRoleId:
                  selectedJobId,
              });


            console.log(
              "[Interview] 면접 생성 성공:",
              result,
            );


            /**
             * localStorage에 userId/JWT를 저장하지 않는다.
             */
            set({
              interviewId:
                result.interviewId,

              startedUserId:
                result.userId,

              jobRoleId:
                selectedJobId,

              currentQuestionIdx:
                0,

              questionMode:
                "base",

              followUpQuestion:
                null,

              followUpQuestionId:
                null,

              isFetchingFollowUp:
                false,

              followUpError:
                null,

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


            alert(
              error instanceof
                Error
                ? error.message
                : "면접 시작에 실패했습니다.",
            );
          }
        },


      requestFollowUp:
        async ({
          originalQuestion,
          answer,
        }) => {
          const {
            jobRoleId,
            interviewId,
          } =
            get();


          if (
            !jobRoleId
          ) {
            console.warn(
              "[FollowUp] jobRoleId가 없어 꼬리질문을 생성할 수 없습니다.",
            );


            set({
              followUpError:
                "직무 정보가 없습니다.",
            });


            return false;
          }


          set({
            isFetchingFollowUp:
              true,

            followUpError:
              null,

            followUpQuestion:
              null,
          });


          try {
            const result =
              await createFollowUpQuestion({
                jobRoleId,

                interviewId:
                  interviewId ??
                  undefined,

                originalQuestion,

                answer,

                interviewStyle:
                  "normal",
              });


            const followUpText =
              (
                result.followUpQuestion as
                  | string
                  | undefined
              ) ??
              (
                result.follow_up_question as
                  | string
                  | undefined
              ) ??
              (
                result.question as
                  | string
                  | undefined
              ) ??
              null;


            if (
              !followUpText
            ) {
              console.warn(
                "[FollowUp] 서버 응답에 꼬리질문 텍스트가 없습니다:",
                result,
              );


              set({
                isFetchingFollowUp:
                  false,

                followUpError:
                  "꼬리질문을 받지 못했습니다.",
              });


              return false;
            }


            const followUpId =
              (
                result.followUpQuestionId as
                  | number
                  | undefined
              ) ??
              (
                result.follow_up_question_id as
                  | number
                  | undefined
              ) ??
              (
                result.id as
                  | number
                  | undefined
              ) ??
              null;


            set({
              isFetchingFollowUp:
                false,

              followUpQuestion:
                followUpText,

              followUpQuestionId:
                followUpId,

              questionMode:
                "followup",
            });


            console.log(
              "[FollowUp] 꼬리질문 생성 성공:",
              followUpText,
            );


            return true;

          } catch (
            error
          ) {
            console.error(
              "[FollowUp] 꼬리질문 API 실패:",
              error,
            );


            set({
              isFetchingFollowUp:
                false,

              followUpError:
                error instanceof
                  Error
                  ? error.message
                  : "꼬리질문 생성에 실패했습니다.",
            });


            return false;
          }
        },


      resetFollowUp:
        () => {
          set({
            questionMode:
              "base",

            followUpQuestion:
              null,

            followUpQuestionId:
              null,

            isFetchingFollowUp:
              false,

            followUpError:
              null,
          });
        },


      reset:
        () => {
          set({
            ...initialState,

            /**
             * 배열 참조도 새로 만들어
             * 상태 초기화를 확실히 한다.
             */
            jobRoles:
              [
                ...FALLBACK_JOBS,
              ],
          });
        },
    }),
  );