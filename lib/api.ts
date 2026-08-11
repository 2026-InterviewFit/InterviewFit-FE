// lib/api.ts

import type {
  JobRole,
  InterviewStartResponse,
  AnswerUploadResponse,
  InterviewReportResponse,
  VideoUploadResponse,
} from "@/types";
import {
  clearAuth,
  getAuthToken,
  type AuthUser,
} from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type KakaoLoginResponse = {
  token: string;
  user: AuthUser;
};

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text();

  if (!text) return response.statusText || "요청에 실패했습니다.";

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

async function authFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    const errorMessage = await readErrorMessage(response);

    clearAuth();

    throw new Error(
      `인증 실패 (401): ${errorMessage || "다시 로그인해주세요."}`
    );
  }

  if (response.status === 403) {
    const errorMessage = await readErrorMessage(response);

    throw new Error(
      `접근 권한 오류 (403): ${errorMessage}`
    );
  }

  return response;
}

export async function kakaoLogin(code: string): Promise<KakaoLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/kakao-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`카카오 로그인 실패 (${response.status}): ${errorMessage}`);
  }

  return response.json();
}

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

export type InterviewQuestion = {
  id: number;
  question: string;
};

export async function createInterviewQuestions(params: {
  count: number;
  jobRoleId: number;
  jobName: string;
  coverLetterId?: number;
}): Promise<InterviewQuestion[]> {
  const response = await authFetch(
    `${API_BASE_URL}/api/question/one-to-one/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        count: params.count,
        jobRoleId: params.jobRoleId,
        jobName: params.jobName,
        coverLetterId: params.coverLetterId,
      }),
    }
  );

  if (!response.ok) {
    const errorMessage =
      await readErrorMessage(response);

    throw new Error(
      `면접 질문 생성 실패 (${response.status}): ${errorMessage}`
    );
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
    }
  );

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`답변 영상 업로드 실패: ${errorMessage}`);
  }

  return response.json();
}

export async function getInterviewReport(
  interviewId: number
): Promise<InterviewReportResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/api/interview/${interviewId}/report`
  );

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`리포트 조회 실패: ${errorMessage}`);
  }

  return response.json();
}

export async function createFollowUpQuestion(params: {
  jobRoleId: number;
  originalQuestion: string;
  answer: string;
  interviewStyle?: string;
  interviewId?: number;
}) {
  const response = await authFetch(`${API_BASE_URL}/api/followup/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobRoleId: params.jobRoleId,
      original_question: params.originalQuestion,
      answer: params.answer,
      interview_style: params.interviewStyle ?? "normal",
      interviewId: params.interviewId,
    }),
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`꼬리질문 생성 실패: ${errorMessage}`);
  }

  return response.json();
}

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
    }
  );

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(`눈 깜빡임 분석 실패: ${errorMessage}`);
  }

  return response.json();
}

export const MARKETING_NAV_ITEMS = [
  { label: "기능 소개", href: "/features" },
  { label: "커뮤니티", href: "/community" },
  { label: "사용법", href: "/how-to" },
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

export const BRAND = { name: "InterviewFit" } as const;
