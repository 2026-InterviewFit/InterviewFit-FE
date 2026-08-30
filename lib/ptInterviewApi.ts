// lib/ptInterviewApi.ts
import type {
  CreatePtInterviewPayload,
  PtInterviewMeta,
  Slide,
  DocumentSummary,
  PtQuestion,
  PtReport,
} from "@/types/ptInterview";
import {
  MOCK_SLIDES,
  MOCK_DOC_SUMMARY,
  MOCK_PT_QUESTIONS,
  MOCK_PT_REPORT,
} from "@/lib/ptInterviewData";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// 면접 생성
export async function createPtInterview(
  payload: CreatePtInterviewPayload
): Promise<{ ptInterviewId: string }> {
  const res = await fetch(`${API_BASE_URL}/api/pt-interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("PT 면접 생성 실패");
  return res.json();
}

// 문서 분석 결과 조회
export async function getPtDocument(
  ptInterviewId: string
): Promise<{ meta: PtInterviewMeta; slides: Slide[]; summary: DocumentSummary }> {
  const res = await fetch(
    `${API_BASE_URL}/api/pt-interview/${ptInterviewId}/document`
  );
  if (!res.ok) throw new Error("발표 자료 분석 결과 조회 실패");
  return res.json();
}

// 질문 조회
export async function getPtQuestions(
  ptInterviewId: string
): Promise<PtQuestion[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/pt-interview/${ptInterviewId}/questions`
  );
  if (!res.ok) throw new Error("질문 조회 실패");
  return res.json();
}

// 리포트 조회
export async function getPtReport(ptInterviewId: string): Promise<PtReport> {
  const res = await fetch(
    `${API_BASE_URL}/api/pt-interview/${ptInterviewId}/report`
  );
  if (!res.ok) throw new Error("리포트 조회 실패");
  return res.json();
}

// ── 백엔드 미가동 시 폴백용 (기존 프로젝트 정책 동일) ────────
export const FALLBACK_SLIDES = MOCK_SLIDES;
export const FALLBACK_SUMMARY = MOCK_DOC_SUMMARY;
export const FALLBACK_QUESTIONS = MOCK_PT_QUESTIONS;
export const FALLBACK_REPORT = MOCK_PT_REPORT;