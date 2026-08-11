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
  clearAuth,
  getAuthToken,
  type AuthUser,
} from "@/lib/auth";


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";


/**
 * 카카오 로그인 응답
 */
export type KakaoLoginResponse = {
  token: string;
  user: AuthUser;
};


/**
 * 백엔드에서 전달된 오류 응답을 문자열로 변환한다.
 *
 * JSON:
 * {
 *   message: "...",
 *   error: "..."
 * }
 *
 * 일반 문자열 응답도 처리한다.
 */
async function readErrorMessage(
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
      JSON.parse(text) as {
        message?: string;
        error?: string;
      };

    return (
      data.message ??
      data.error ??
      text
    );
  } catch {
    return text;
  }
}


/**
 * JWT 인증이 필요한 API 요청
 */
async function authFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const token =
    getAuthToken();

  if (!token) {
    throw new Error(
      "로그인이 필요합니다.",
    );
  }

  const headers =
    new Headers(
      init.headers,
    );

  headers.set(
    "Authorization",
    `Bearer ${token}`,
  );

  const response =
    await fetch(
      input,
      {
        ...init,
        headers,
      },
    );

  /**
   * 401:
   * JWT가 없거나 만료/유효하지 않은 경우
   *
   * 403:
   * 인증은 되었지만 접근 권한이 없는 경우일 수 있으므로
   * 토큰을 삭제하지 않는다.
   */
  if (
    response.status === 401
  ) {
    const errorMessage =
      await readErrorMessage(
        response,
      );

    clearAuth();

    throw new Error(
      `인증 실패 (401): ${
        errorMessage ||
        "다시 로그인해주세요."
      }`,
    );
  }

  return response;
}


/* =========================================================
 * 카카오 로그인
 * ========================================================= */


/**
 * 카카오 Authorization Code를 Spring Boot로 전달한다.
 *
 * Spring:
 * POST /api/users/kakao-login
 */
export async function kakaoLogin(
  code: string,
): Promise<KakaoLoginResponse> {
  const response =
    await fetch(
      `${API_BASE_URL}/api/users/kakao-login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
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
 * 직무 목록 조회
 */
export async function getJobRoles():
  Promise<JobRole[]> {
  const response =
    await fetch(
      `${API_BASE_URL}/api/job-role/all`,
      {
        method: "GET",
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
 * 로그인 사용자의 새로운 면접 생성
 *
 * userId는 프론트에서 보내지 않는다.
 * Spring Security에서 JWT 사용자 ID를 사용한다.
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
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
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
 * 면접 질문에 대한 답변 영상을 업로드한다.
 *
 * questionId는 현재 질문 생성 담당 파트가
 * 프론트와 연결되면 사용할 수 있다.
 *
 * 현재는 questionId 없이도 업로드 가능.
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
      `답변 영상 업로드 실패: ${errorMessage}`,
    );
  }

  return response.json();
}


/**
 * 완료된 면접의 전체 분석 리포트 조회
 */
export async function getInterviewReport(
  interviewId: number,
): Promise<InterviewReportResponse> {
  const response =
    await authFetch(
      `${API_BASE_URL}/api/interview/${interviewId}/report`,
      {
        method: "GET",
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
 * 꼬리질문 생성 응답
 *
 * Spring 실제 응답 필드가 추가돼도 사용할 수 있도록
 * 필요한 필드만 정의한다.
 */
export type FollowUpQuestionResponse = {
  id?: number;

  followUpQuestion?: string;

  follow_up_question?: string;

  question?: string;

  [key: string]: unknown;
};


/**
 * 사용자의 기본 질문 답변을 기반으로
 * 꼬리질문 1개를 생성한다.
 *
 * Spring:
 * POST /api/followup/create
 *
 * sourceQuestionId:
 *   기본 질문 DB ID
 *
 * sourceAnswerId:
 *   기본 질문에 대한 InterviewAnswer DB ID
 *
 * 현재 질문 생성 파트가 아직 연결되지 않은 경우
 * 둘 다 생략 가능하게 둔다.
 */
export async function createFollowUpQuestion(
  params: {
    jobRoleId: number;

    originalQuestion: string;

    answer: string;

    interviewStyle?: string;

    interviewId?: number;

    sourceQuestionId?: number;

    sourceAnswerId?: number;
  },
): Promise<FollowUpQuestionResponse> {
  const response =
    await authFetch(
      `${API_BASE_URL}/api/followup/create`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          interviewId:
            params.interviewId,

          jobRoleId:
            params.jobRoleId,

          source_question_id:
            params.sourceQuestionId,

          source_answer_id:
            params.sourceAnswerId,

          original_question:
            params.originalQuestion,

          answer:
            params.answer,

          interview_style:
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
 * 녹화된 영상을 Spring 영상 저장 API로 업로드한다.
 */
export async function uploadVideo(
  params: {
    file: File | Blob;
    fileName?: string;
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
      `영상 업로드 실패: ${errorMessage}`,
    );
  }

  return response.json();
}


/* =========================================================
 * 눈 깜빡임
 * ========================================================= */


/**
 * 영상을 Spring 눈 깜빡임 분석 API로 전달한다.
 *
 * 현재 실제 면접 흐름에서는
 * 답변 업로드 후 Spring 비동기 분석에서도
 * Eye Blinking 분석을 실행하고 있다.
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
      `눈 깜빡임 분석 실패 (${response.status}): ${errorMessage}`,
    );
  }

  return response.json();
}


/* =========================================================
 * PT 면접
 * ========================================================= */


/**
 * PT 면접 생성
 */
export async function createPtInterview(
  params: {
    interviewId: number;
    topic: string;
    instruction: string;
    preparationSeconds: number;
    presentationSeconds: number;
  },
): Promise<PtInterviewResponse> {
  const response =
    await fetch(
      `${API_BASE_URL}/api/pt-interviews`,
      {
        method: "POST",

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
    const errorText =
      await response.text();

    throw new Error(
      `PT 면접 생성 실패 (${response.status}): ${
        errorText ||
        response.statusText
      }`,
    );
  }

  return response.json();
}


/**
 * PT 발표 자료 업로드
 */
export async function uploadPtDocument(
  ptInterviewId: number,
  file: File,
): Promise<PtDocumentUploadResponse> {
  const formData =
    new FormData();

  formData.append(
    "file",
    file,
  );

  const response =
    await fetch(
      `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/document`,
      {
        method: "POST",
        body: formData,
      },
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `PT 발표 자료 업로드 실패 (${response.status}): ${
        errorText ||
        response.statusText
      }`,
    );
  }

  return response.json();
}


/**
 * PT 발표 자료 조회
 */
export async function getPtDocument(
  ptInterviewId: number,
): Promise<PtDocumentDetailResponse> {
  const response =
    await fetch(
      `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/document`,
      {
        method: "GET",
      },
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `PT 발표 자료 조회 실패 (${response.status}): ${
        errorText ||
        response.statusText
      }`,
    );
  }

  return response.json();
}


/**
 * PT 예상 질문 생성
 */
export async function generatePtQuestions(
  ptInterviewId: number,
): Promise<PtQuestionResponse[]> {
  const response =
    await fetch(
      `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/questions/generate`,
      {
        method: "POST",
      },
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `PT 예상 질문 생성 실패 (${response.status}): ${
        errorText ||
        response.statusText
      }`,
    );
  }

  return response.json();
}


/**
 * PT 예상 질문 조회
 */
export async function getPtQuestions(
  ptInterviewId: number,
): Promise<PtQuestionResponse[]> {
  const response =
    await fetch(
      `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/questions`,
      {
        method: "GET",
      },
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `PT 예상 질문 조회 실패 (${response.status}): ${
        errorText ||
        response.statusText
      }`,
    );
  }

  return response.json();
}


/**
 * PT 질문 답변 영상 업로드
 */
export async function uploadPtAnswer(
  params: {
    ptInterviewId: number;
    ptQuestionId: number;
    file: Blob;
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
    await fetch(
      `${API_BASE_URL}/api/pt-interviews/${params.ptInterviewId}/answers`,
      {
        method: "POST",
        body: formData,
      },
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `PT 답변 영상 업로드 실패 (${response.status}): ${
        errorText ||
        response.statusText
      }`,
    );
  }

  return response.json();
}


/**
 * PT 종합 리포트 생성
 */
export async function generatePtReport(
  ptInterviewId: number,
): Promise<PtReportResponse> {
  const response =
    await fetch(
      `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/report/generate`,
      {
        method: "POST",
      },
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `PT 종합 리포트 생성 실패 (${response.status}): ${
        errorText ||
        response.statusText
      }`,
    );
  }

  return response.json();
}


/**
 * PT 종합 리포트 조회
 */
export async function getPtReport(
  ptInterviewId: number,
): Promise<PtReportResponse> {
  const response =
    await fetch(
      `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/report`,
      {
        method: "GET",
      },
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `PT 종합 리포트 조회 실패 (${response.status}): ${
        errorText ||
        response.statusText
      }`,
    );
  }

  return response.json();
}


/* =========================================================
 * Navigation / UI constants
 * ========================================================= */


export const MARKETING_NAV_ITEMS = [
  {
    label: "기능 소개",
    href: "/features",
  },
  {
    label: "커뮤니티",
    href: "/community",
  },
  {
    label: "사용법",
    href: "/how-to",
  },
  {
    label: "소개",
    href: "/about",
  },
] as const;


export const APP_NAV_ITEMS = [
  {
    label: "대시보드",
    href: "/dashboard",
  },
  {
    label: "연습 기록",
    href: "/history",
  },
  {
    label: "추천 질문",
    href: "/questions",
  },
] as const;


export const HERO = {
  title:
    "Practice smarter.",

  subtitle:
    "AI-powered interview coaching that analyzes your tone, gaze, and answers.",
} as const;


export const LIVE_STATS = {
  users: 12847,

  passRate: {
    first: 52,
    repeat: 86,
  },

  satisfaction: 4.8,
} as const;


export const BRAND = {
  name: "InterviewFit",
} as const;