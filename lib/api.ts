// lib/api.ts

import type {
  JobRole,
  InterviewStartResponse,
  AnswerUploadResponse,
  InterviewReportResponse,
  VideoUploadResponse,
} from "@/types";

import type {
  PtInterviewResponse,
  PtDocumentUploadResponse,
  PtDocumentDetailResponse,
  PtQuestionResponse,
  PtReportResponse,
} from "@/types/ptInterview";

import {
  authenticatedFetch,
  type AuthUser,
} from "@/lib/auth";


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";


/* =========================================================
 * 공통 타입
 * ========================================================= */


/**
 * 카카오 로그인 응답
 */
export type KakaoLoginResponse = {
  /**
   * 현재 Spring이 기존 FE 호환을 위해
   * token을 응답 body에 포함할 수도 있다.
   *
   * 하지만 FE에서는 저장하지 않는다.
   * 실제 인증은 HttpOnly Cookie를 사용한다.
   */
  token?: string;

  user: AuthUser;
};


export type FollowUpQuestionResponse = {
  id?: number;

  followUpQuestionId?: number;

  follow_up_question_id?: number;

  followUpQuestion?: string;

  follow_up_question?: string;

  question?: string;

  interviewId?: number;

  sourceQuestionId?: number | null;

  source_question_id?: number | null;

  sourceAnswerId?: number | null;

  source_answer_id?: number | null;

  [key: string]: unknown;
};


export type FollowUpTranscriptionResponse = {
  text: string;
};


/* =========================================================
 * 공통 함수
 * ========================================================= */


/**
 * 백엔드 오류 응답을 문자열로 변환한다.
 */
export async function readErrorMessage(
  response: Response,
): Promise<string> {

  const text =
    await response.text();


  if (!text) {
    return (
      response.statusText ||
      "요청에 실패했습니다."
    );
  }


  try {

    const data =
      JSON.parse(
        text,
      ) as {
        message?: string;
        error?: string;
        detail?: string;
      };


    return (
      data.message ??
      data.error ??
      data.detail ??
      text
    );

  } catch {

    return text;
  }
}


/**
 * 인증이 필요한 API 요청.
 *
 * 이제 localStorage JWT를 사용하지 않는다.
 *
 * authenticatedFetch:
 *
 * 1. HttpOnly Cookie 자동 포함
 * 2. API 호출
 * 3. 401이면 Refresh Token으로 Access Token 재발급
 * 4. 원래 요청 자동 재시도
 */
export async function authFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {

  return authenticatedFetch(
    input,
    init,
  );
}


/* =========================================================
 * 카카오 로그인
 * ========================================================= */

/**
 * 카카오 Authorization Code를
 * Spring Boot 서버에 전달한다.
 *
 * POST /api/users/kakao-login
 *
 * Spring이 응답에서:
 *
 * interviewfit_access_token
 * interviewfit_refresh_token
 *
 * HttpOnly Cookie를 설정한다.
 */
export async function kakaoLogin(
  code: string,
): Promise<KakaoLoginResponse> {

  const response =
    await fetch(
      `${API_BASE_URL}/api/users/kakao-login`,
      {
        method: "POST",

        /**
         * Set-Cookie를 브라우저가 받아서 저장하고
         * 이후 요청에서도 보내기 위해 필요.
         */
        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            code,
          }),
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `카카오 로그인 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/* =========================================================
 * 직무
 * ========================================================= */


/**
 * 직무 목록 조회.
 *
 * SecurityConfig에서 공개 API이므로
 * authFetch가 아닌 일반 fetch 사용.
 */
export async function getJobRoles():
  Promise<JobRole[]> {

  const response =
    await fetch(
      `${API_BASE_URL}/api/job-role/all`,
      {
        method:
          "GET",
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `직무 목록 조회 실패: ${errorMessage}`,
    );
  }


  return response.json();
}


/* =========================================================
 * 1:1 면접
 * ========================================================= */


/**
 * 새로운 면접 세션 시작.
 *
 * userId는 FE에서 보내지 않고
 * Spring Security 인증 사용자 ID를 사용한다.
 */
export async function startInterview(
  params: {
    jobRoleId: number;
  },
): Promise<InterviewStartResponse> {

  const response =
    await authFetch(
      `${API_BASE_URL}/api/interview/start`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            jobRoleId:
              params.jobRoleId,
          }),
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `면접 시작 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/**
 * 면접 답변 영상 업로드.
 */
export async function uploadAnswerVideo(
  params: {
    interviewId: number;
    file: Blob;
    answerOrder: number;
    questionId?: number;
    questionText?: string;
  },
): Promise<AnswerUploadResponse> {

  const formData =
    new FormData();


  formData.append(
    "file",
    params.file,
    "interview.webm",
  );


  formData.append(
    "answerOrder",
    String(
      params.answerOrder,
    ),
  );


  if (
    params.questionId !==
    undefined
  ) {

    formData.append(
      "questionId",
      String(
        params.questionId,
      ),
    );
  }


  if (
    params.questionText
  ) {

    formData.append(
      "questionText",
      params.questionText,
    );
  }


  const response =
    await authFetch(
      `${API_BASE_URL}/api/interview/${params.interviewId}/answers`,
      {
        method:
          "POST",

        body:
          formData,
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `답변 영상 업로드 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/**
 * 면접 분석 리포트 조회.
 */
export async function getInterviewReport(
  interviewId: number,
): Promise<InterviewReportResponse> {

  const response =
    await authFetch(
      `${API_BASE_URL}/api/interview/${interviewId}/report`,
      {
        method:
          "GET",
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `리포트 조회 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/* =========================================================
 * 꼬리질문
 * ========================================================= */


/**
 * 기본 질문/꼬리질문에 대한 답변 음성 Blob을
 * Spring STT 프록시로 전송한다.
 *
 * POST /api/followup/transcribe
 *
 * Spring -> FastAPI -> Whisper 순서로 처리되고
 * FE에는 변환된 텍스트만 반환된다.
 */
export async function transcribeFollowUpAnswer(
  file: Blob,
): Promise<FollowUpTranscriptionResponse> {

  const formData =
    new FormData();


  formData.append(
    "file",
    file,
    "answer.webm",
  );


  const response =
    await authFetch(
      `${API_BASE_URL}/api/followup/transcribe`,
      {
        method: "POST",
        body: formData,
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `답변 STT 실패 (${response.status}): ${errorMessage}`,
    );
  }


  const result =
    (await response.json()) as
      FollowUpTranscriptionResponse;


  if (
    !result.text ||
    !result.text.trim()
  ) {
    throw new Error(
      "답변 음성을 텍스트로 변환하지 못했습니다.",
    );
  }


  return {
    text: result.text.trim(),
  };
}


/**
 * 사용자의 기본 질문 답변을 기반으로
 * 꼬리질문 1개를 생성한다.
 *
 * POST /api/followup/create
 *
 * 현재 기본 질문이 DB Question과 아직 연결되지 않았다면
 * sourceQuestionId/sourceAnswerId는 생략 가능하도록 둔다.
 */
export async function createFollowUpQuestion(
  params: {
    jobRoleId: number;

    originalQuestion:
      string;

    answer:
      string;

    interviewStyle?:
      string;

    interviewId?:
      number;

    sourceQuestionId?:
      number;

    sourceAnswerId?:
      number;
  },
): Promise<FollowUpQuestionResponse> {

  const response =
    await authFetch(
      `${API_BASE_URL}/api/followup/create`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            interviewId:
              params.interviewId,

            jobRoleId:
              params.jobRoleId,

            sourceQuestionId:
              params.sourceQuestionId,

            sourceAnswerId:
              params.sourceAnswerId,

            originalQuestion:
              params.originalQuestion,

            answer:
              params.answer,

            interviewStyle:
              params.interviewStyle ??
              "normal",
          }),
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `꼬리질문 생성 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/* =========================================================
 * 영상 저장
 * ========================================================= */


/**
 * 면접 영상 저장.
 */
export async function uploadVideo(
  params: {
    file:
      | File
      | Blob;

    fileName?:
      string;
  },
): Promise<VideoUploadResponse> {

  const formData =
    new FormData();


  formData.append(
    "file",
    params.file,
    params.fileName ??
      "interview.webm",
  );


  const response =
    await authFetch(
      `${API_BASE_URL}/videos/upload`,
      {
        method:
          "POST",

        body:
          formData,
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `영상 업로드 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/* =========================================================
 * 눈 깜빡임
 * ========================================================= */


/**
 * 눈 깜빡임 분석.
 */
export async function analyzeEyeBlinking(
  params: {
    file: Blob;
    userId?: number;
    interviewId?: number;
  },
) {

  const formData =
    new FormData();


  formData.append(
    "file",
    params.file,
    "interview.webm",
  );


  if (
    params.userId !==
    undefined
  ) {

    formData.append(
      "userId",
      String(
        params.userId,
      ),
    );
  }


  if (
    params.interviewId !==
    undefined
  ) {

    formData.append(
      "interviewId",
      String(
        params.interviewId,
      ),
    );
  }


  const response =
    await authFetch(
      `${API_BASE_URL}/api/eye-blinking/analyze/upload`,
      {
        method:
          "POST",

        body:
          formData,
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `눈 깜빡임 분석 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/* =========================================================
 * PT 면접
 * ========================================================= */


/**
 * PT 면접 생성.
 */
export async function createPtInterview(
  params: {
    interviewId: number;

    topic:
      string;

    instruction:
      string;

    preparationSeconds:
      number;

    presentationSeconds:
      number;
  },
): Promise<PtInterviewResponse> {

  const response =
    await authFetch(
      `${API_BASE_URL}/api/pt-interviews`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            params,
          ),
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `PT 면접 생성 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/**
 * PT 발표 자료 업로드.
 */
export async function uploadPtDocument(
  ptInterviewId:
    number,

  file:
    File,
): Promise<PtDocumentUploadResponse> {

  const formData =
    new FormData();


  formData.append(
    "file",
    file,
  );


  const response =
    await authFetch(
      `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/document`,
      {
        method:
          "POST",

        body:
          formData,
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `PT 발표 자료 업로드 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/**
 * PT 발표 자료 조회.
 */
export async function getPtDocument(
  ptInterviewId:
    number,
): Promise<PtDocumentDetailResponse> {

  const response =
    await authFetch(
      `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/document`,
      {
        method:
          "GET",
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `PT 발표 자료 조회 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/**
 * PT 예상 질문 생성.
 */
export async function generatePtQuestions(
  ptInterviewId:
    number,
): Promise<PtQuestionResponse[]> {

  const response =
    await authFetch(
      `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/questions/generate`,
      {
        method:
          "POST",
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `PT 예상 질문 생성 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/**
 * PT 예상 질문 조회.
 */
export async function getPtQuestions(
  ptInterviewId:
    number,
): Promise<PtQuestionResponse[]> {

  const response =
    await authFetch(
      `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/questions`,
      {
        method:
          "GET",
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `PT 예상 질문 조회 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/**
 * PT 답변 영상 업로드.
 */
export async function uploadPtAnswer(
  params: {
    ptInterviewId:
      number;

    ptQuestionId:
      number;

    file:
      Blob;
  },
): Promise<unknown> {

  const formData =
    new FormData();


  formData.append(
    "ptQuestionId",
    String(
      params.ptQuestionId,
    ),
  );


  formData.append(
    "file",
    params.file,
    `pt-answer-${params.ptQuestionId}.webm`,
  );


  const response =
    await authFetch(
      `${API_BASE_URL}/api/pt-interviews/${params.ptInterviewId}/answers`,
      {
        method:
          "POST",

        body:
          formData,
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `PT 답변 영상 업로드 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/**
 * PT 종합 리포트 생성.
 */
export async function generatePtReport(
  ptInterviewId:
    number,
): Promise<PtReportResponse> {

  const response =
    await authFetch(
      `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/report/generate`,
      {
        method:
          "POST",
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `PT 종합 리포트 생성 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/**
 * PT 종합 리포트 조회.
 */
export async function getPtReport(
  ptInterviewId:
    number,
): Promise<PtReportResponse> {

  const response =
    await authFetch(
      `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/report`,
      {
        method:
          "GET",
      },
    );


  if (!response.ok) {

    const errorMessage =
      await readErrorMessage(
        response,
      );


    throw new Error(
      `PT 종합 리포트 조회 실패 (${response.status}): ${errorMessage}`,
    );
  }


  return response.json();
}


/* =========================================================
 * UI Constants
 * ========================================================= */


export const MARKETING_NAV_ITEMS = [
  {
    label:
      "기능 소개",

    href:
      "/features",
  },

  {
    label:
      "커뮤니티",

    href:
      "/community",
  },

  {
    label:
      "사용법",

    href:
      "/how-to",
  },

  {
    label:
      "소개",

    href:
      "/about",
  },
] as const;


export const APP_NAV_ITEMS = [
  {
    label:
      "대시보드",

    href:
      "/dashboard",
  },

  {
    label:
      "연습 기록",

    href:
      "/history",
  },

  {
    label:
      "추천 질문",

    href:
      "/questions",
  },
] as const;


export const HERO = {
  title:
    "Practice smarter.",

  subtitle:
    "AI-powered interview coaching that analyzes your tone, gaze, and answers.",
} as const;


export const LIVE_STATS = {
  users:
    12847,

  passRate: {
    first:
      52,

    repeat:
      86,
  },

  satisfaction:
    4.8,
} as const;


export const BRAND = {
  name: "InterviewFit",
} as const;