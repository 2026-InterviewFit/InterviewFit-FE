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

export type KakaoLoginResponse = {
  token: string;
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

export type FollowUpAnswerCreateResponse = {
  message?: string;
  followUpAnswerId?: number;
  interviewId?: number | null;
  followUpQuestionId?: number;
  answerText?: string;
  analysisStatus?: string;
};

/* =========================================================
 * 공통 함수
 * ========================================================= */

export async function readErrorMessage(
  response: Response,
): Promise<string> {
  const text = await response.text();

  if (!text) {
    return response.statusText || "요청에 실패했습니다.";
  }

  try {
    const data = JSON.parse(text) as {
      message?: string;
      error?: string;
    };

    return data.message ?? data.error ?? text;
  } catch {
    return text;
  }
}

export async function authFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include", 
  });

  if (response.status === 401) {
    const errorMessage = await readErrorMessage(response);
    clearAuth();
    throw new Error(
      `인증 실패 (401): ${
        errorMessage || "다시 로그인해주세요."
      }`,
    );
  }

  return response;
}

/* =========================================================
 * 카카오 로그인
 * ========================================================= */

export async function kakaoLogin(
  code: string,
): Promise<KakaoLoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/users/kakao-login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
      // 브라우저 쿠키 저장 허용
      credentials: "include", 
    },
  );

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(
      `카카오 로그인 실패 (${response.status}): ${errorMessage}`,
    );
  }

  return response.json();
}

/* =========================================================
 * 직무
 * ========================================================= */

export async function getJobRoles(): Promise<JobRole[]> {
  const response = await fetch(`${API_BASE_URL}/api/job-role/all`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`직무 목록 조회 실패: ${errorMessage}`);
  }

  return response.json();
}

/* =========================================================
 * 1:1 면접
 * ========================================================= */

export async function startInterview(params: {
  jobRoleId: number;
}): Promise<InterviewStartResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/interview/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobRoleId: params.jobRoleId,
    }),
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`면접 시작 실패 (${response.status}): ${errorMessage}`);
  }

  return response.json();
}

export async function uploadAnswerVideo(params: {
  interviewId: number;
  file: Blob;
  answerOrder: number;
  questionId?: number;
  questionText?: string;
}): Promise<AnswerUploadResponse> {
  const formData = new FormData();

  formData.append("file", params.file, "interview.webm");
  formData.append("answerOrder", String(params.answerOrder));

  if (params.questionId !== undefined) {
    formData.append("questionId", String(params.questionId));
  }

  if (params.questionText) {
    formData.append("questionText", params.questionText);
  }

  const response = await authFetch(
    `${API_BASE_URL}/api/interview/${params.interviewId}/answers`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`답변 영상 업로드 실패: ${errorMessage}`);
  }

  return response.json();
}

export async function getInterviewReport(
  interviewId: number,
): Promise<InterviewReportResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/api/interview/${interviewId}/report`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`리포트 조회 실패 (${response.status}): ${errorMessage}`);
  }

  return response.json();
}

/* =========================================================
 * 꼬리질문
 * ========================================================= */

export async function transcribeFollowUpAnswer(
  file: Blob,
): Promise<FollowUpTranscriptionResponse> {
  const formData = new FormData();
  formData.append("file", file, "answer.webm");

  const response = await authFetch(`${API_BASE_URL}/api/followup/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`답변 STT 실패 (${response.status}): ${errorMessage}`);
  }

  const result = (await response.json()) as FollowUpTranscriptionResponse;

  if (!result.text || !result.text.trim()) {
    throw new Error("답변 음성을 텍스트로 변환하지 못했습니다.");
  }

  return {
    text: result.text.trim(),
  };
}

export async function createFollowUpQuestion(params: {
  jobRoleId: number;
  originalQuestion: string;
  answer: string;
  interviewStyle?: string;
  interviewId?: number;
  sourceQuestionId?: number;
  sourceAnswerId?: number;
}): Promise<FollowUpQuestionResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/followup/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      interviewId: params.interviewId,
      jobRoleId: params.jobRoleId,
      source_question_id: params.sourceQuestionId,
      source_answer_id: params.sourceAnswerId,
      original_question: params.originalQuestion,
      answer: params.answer,
      interview_style: params.interviewStyle ?? "normal",
    }),
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`꼬리질문 생성 실패 (${response.status}): ${errorMessage}`);
  }

  return response.json();
}

export async function saveFollowUpAnswer(params: {
  interviewId: number;
  followUpQuestionId: number;
  answerText: string;
  startTime?: number;
  endTime?: number;
}): Promise<FollowUpAnswerCreateResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/followup/answers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      interviewId: params.interviewId,
      followUpQuestionId: params.followUpQuestionId,
      answerText: params.answerText,
      startTime: params.startTime,
      endTime: params.endTime,
    }),
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`꼬리질문 답변 저장 실패 (${response.status}): ${errorMessage}`);
  }

  return response.json();
}

/* =========================================================
 * 영상 저장
 * ========================================================= */

export async function uploadVideo(params: {
  file: File | Blob;
  fileName?: string;
}): Promise<VideoUploadResponse> {
  const formData = new FormData();
  formData.append("file", params.file, params.fileName ?? "interview.webm");

  const response = await authFetch(`${API_BASE_URL}/videos/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`영상 업로드 실패: ${errorMessage}`);
  }

  return response.json();
}

/* =========================================================
 * 눈 깜빡임
 * ========================================================= */

export async function analyzeEyeBlinking(params: {
  file: Blob;
  userId?: number;
  interviewId?: number;
}) {
  const formData = new FormData();
  formData.append("file", params.file, "interview.webm");

  if (params.userId !== undefined) {
    formData.append("userId", String(params.userId));
  }

  if (params.interviewId !== undefined) {
    formData.append("interviewId", String(params.interviewId));
  }

  const response = await authFetch(
    `${API_BASE_URL}/api/eye-blinking/analyze/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`눈 깜빡임 분석 실패 (${response.status}): ${errorMessage}`);
  }

  return response.json();
}

/* =========================================================
 * PT 면접
 * ========================================================= */

export async function createPtInterview(params: {
  interviewId: number;
  topic: string;
  instruction: string;
  preparationSeconds: number;
  presentationSeconds: number;
}): Promise<PtInterviewResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/pt-interviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PT 면접 생성 실패 (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function uploadPtDocument(
  ptInterviewId: number,
  file: File,
): Promise<PtDocumentUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await authFetch(
    `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/document`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PT 발표 자료 업로드 실패 (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function getPtDocument(
  ptInterviewId: number,
): Promise<PtDocumentDetailResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/document`,
    { method: "GET" },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PT 발표 자료 조회 실패 (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function generatePtQuestions(
  ptInterviewId: number,
): Promise<PtQuestionResponse[]> {
  const response = await authFetch(
    `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/questions/generate`,
    { method: "POST" },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PT 예상 질문 생성 실패 (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function getPtQuestions(
  ptInterviewId: number,
): Promise<PtQuestionResponse[]> {
  const response = await authFetch(
    `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/questions`,
    { method: "GET" },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PT 예상 질문 조회 실패 (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function uploadPtAnswer(params: {
  ptInterviewId: number;
  ptQuestionId: number;
  file: Blob;
}): Promise<unknown> {
  const formData = new FormData();
  formData.append("ptQuestionId", String(params.ptQuestionId));
  formData.append("file", params.file, `pt-answer-${params.ptQuestionId}.webm`);

  const response = await authFetch(
    `${API_BASE_URL}/api/pt-interviews/${params.ptInterviewId}/answers`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PT 답변 영상 업로드 실패 (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * PT 발표 전체 영상 업로드.
 *
 * 발표 화면에서 녹화한 영상을 BE로 전송한다.
 * BE에서 영상 저장 후 STT/스피치 분석을 수행한다.
 */
export async function uploadPtPresentation(params: {
  ptInterviewId: number;
  file: Blob;
}): Promise<number> {
  const formData = new FormData();
  formData.append(
    "file",
    params.file,
    `pt-presentation-${params.ptInterviewId}.webm`,
  );

  const response = await authFetch(
    `${API_BASE_URL}/api/pt-interviews/${params.ptInterviewId}/presentation`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`PT 발표 영상 업로드 실패 (${response.status}): ${errorMessage}`);
  }

  return response.json();
}

export async function generatePtReport(
  ptInterviewId: number,
): Promise<PtReportResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/report/generate`,
    { method: "POST" },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PT 종합 리포트 생성 실패 (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function getPtReport(
  ptInterviewId: number,
): Promise<PtReportResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/report`,
    { method: "GET" },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PT 종합 리포트 조회 실패 (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

/* =========================================================
 * Navigation / UI constants
 * ========================================================= */

export const MARKETING_NAV_ITEMS = [
  { label: "기능 소개", href: "/features" },
  { label: "커뮤니티", href: "/community" },
  { label: "사용법", href: "/how-to" },
  { label: "소개", href: "/about" },
] as const;

export const APP_NAV_ITEMS = [
  { label: "대시보드", href: "/dashboard" },
  { label: "연습 기록", href: "/history" },
  { label: "추천 질문", href: "/questions" },
] as const;

export const HERO = {
  title: "Practice smarter.",
  subtitle:
    "AI-powered interview coaching that analyzes your tone, gaze, and answers.",
} as const;

export const LIVE_STATS = {
  users: 12847,
  passRate: { first: 52, repeat: 86 },
  satisfaction: 4.8,
} as const;

export const BRAND = {
  name: "InterviewFit",
} as const;

/* =========================================================
 * 자기소개서 분석 및 1:1 면접 질문 생성
 * ========================================================= */

export type CoverLetterAnalysisResponse = {
  coverLetterId: number;
  jobRoleId: number;
  recommendedJobName: string;
};

export async function analyzeCoverLetter(
  file: File,
): Promise<CoverLetterAnalysisResponse> {
  const formData = new FormData();
  formData.append("coverLetterFile", file);

  const response = await authFetch(`${API_BASE_URL}/api/coverletter/analysis`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`자소서 분석 실패 (${response.status}): ${errorMessage}`);
  }

  return response.json();
}

export async function createQuestions(params: {
  interviewId?: number;
  count?: number;
  jobRoleId: number;
  jobName: string;
  coverLetterId?: number;
}): Promise<Array<{ id: number; question: string; questionOrder?: number | null }>> {
  const payload = {
    interviewId: params.interviewId,
    count: params.count ?? 3,
    jobRoleId: params.jobRoleId,
    jobName: params.jobName,
    coverLetterId: params.coverLetterId,
  };

  const response = await authFetch(`${API_BASE_URL}/api/question/one-to-one/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return response.json();
  }

  const errorText = await response.text();
  let errorObj;
  try {
    errorObj = JSON.parse(errorText);
  } catch {
    errorObj = { message: errorText, code: "UNKNOWN_ERROR" };
  }

  const err = new Error(errorObj.message || "질문 생성에 실패했습니다.") as Error & { status?: number; code?: string };
  err.status = response.status;
  err.code = errorObj.code;

  throw err;
}

export async function createQuestionsWithRetry(params: {
  interviewId?: number;
  count?: number;
  jobRoleId: number;
  jobName: string;
  coverLetterId?: number;
}): Promise<Array<{ id: number; question: string; questionOrder?: number | null }>> {
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await createQuestions(params);
    } catch (err: unknown) {
      const error = err as { status?: number; code?: string };
      const shouldRetry =
        error?.status === 409 &&
        error?.code === "COVER_LETTER_PROCESSING_NOT_COMPLETED";

      if (!shouldRetry || attempt === MAX_RETRIES) {
        throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  throw new Error("질문 생성 재시도에 실패했습니다.");
}
