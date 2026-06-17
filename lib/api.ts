// lib/api.ts

import type {
  JobRole,
  InterviewStartResponse,
  AnswerUploadResponse,
  InterviewReportResponse,
  VideoUploadResponse,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// ── 함수 ──────────────────────────────────────────────────────

export async function getJobRoles(): Promise<JobRole[]> {
  const response = await fetch(`${API_BASE_URL}/api/job-role/all`, {
    method: "GET",
  });
  if (!response.ok) throw new Error("직무 목록 조회 실패");
  return response.json();
}

export async function startInterview(params: {
  jobRoleId: number;
  userId?: number | null;
}): Promise<InterviewStartResponse> {
  const response = await fetch(`${API_BASE_URL}/api/interview/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobRoleId: params.jobRoleId, userId: params.userId ?? null }),
  });
  if (!response.ok) throw new Error("면접 시작 실패");
  return response.json();
}

export async function uploadAnswerVideo(params: {
  interviewId: number;
  file: Blob;
  answerOrder: number;
  questionText?: string;
}): Promise<AnswerUploadResponse> {
  const formData = new FormData();
  formData.append("file", params.file, "interview.webm");
  formData.append("answerOrder", String(params.answerOrder));
  if (params.questionText) formData.append("questionText", params.questionText);

  const response = await fetch(
    `${API_BASE_URL}/api/interview/${params.interviewId}/answers`,
    { method: "POST", body: formData }
  );
  if (!response.ok) throw new Error("답변 영상 업로드 실패");
  return response.json();
}

export async function getInterviewReport(
  interviewId: number
): Promise<InterviewReportResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/interview/${interviewId}/report`
  );
  if (!response.ok) throw new Error("리포트 조회 실패");
  return response.json();
}

export async function createFollowUpQuestion(params: {
  jobRoleId: number;
  originalQuestion: string;
  answer: string;
  interviewStyle?: string;
  userId?: number;
  interviewId?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/api/followup/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jobRoleId: params.jobRoleId,
      original_question: params.originalQuestion,
      answer: params.answer,
      interview_style: params.interviewStyle ?? "normal",
      userId: params.userId,
      interviewId: params.interviewId,
    }),
  });
  if (!response.ok) throw new Error("꼬리질문 생성 실패");
  return response.json();
}

export async function uploadVideo(params: {
  file: File | Blob;
  fileName?: string;
}): Promise<VideoUploadResponse> {
  const formData = new FormData();
  formData.append("file", params.file, params.fileName ?? "interview.webm");

  const response = await fetch(`${API_BASE_URL}/videos/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`영상 업로드 실패: ${errorText}`);
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
  if (params.userId !== undefined) formData.append("userId", String(params.userId));
  if (params.interviewId !== undefined) formData.append("interviewId", String(params.interviewId));

  const response = await fetch(
    `${API_BASE_URL}/api/eye-blinking/analyze/upload`,
    { method: "POST", body: formData }
  );
  if (!response.ok) throw new Error("눈 깜빡임 분석 실패");
  return response.json();
}

// ── 상수 ──────────────────────────────────────────────────────

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
  subtitle: "AI-powered interview coaching that analyzes your tone, gaze, and answers.",
} as const;

export const LIVE_STATS = {
  users: 12847,
  passRate: { first: 52, repeat: 86 },
  satisfaction: 4.8,
} as const;

export const BRAND = { name: "InterviewFit" } as const;