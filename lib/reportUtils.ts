// lib/reportUtils.ts
import type { DashboardRecord, InterviewHistoryItem, InterviewReportResponse } from "@/types";

export const formatKoreanDate = (value?: string) => {
  if (!value) return "날짜 정보 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "날짜 정보 없음";
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월 ${String(date.getDate()).padStart(2, "0")}일`;
};

export const average = (values: Array<number | undefined | null>) => {
  const validValues = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (validValues.length === 0) return undefined;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
};

export const getReportStatusLabel = (record?: DashboardRecord) => {
  const status = record?.report?.analysisStatus;
  if (record?.reportError) return "조회 실패";
  if (status === "DONE") return "분석완료";
  if (status === "FAILED") return "분석실패";
  return "분석중";
};

export const getStatusClassName = (record?: DashboardRecord) => {
  const status = record?.report?.analysisStatus;
  if (record?.reportError || status === "FAILED") return "rounded bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 text-red-600 dark:text-red-400";
  if (status === "DONE") return "rounded bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 text-blue-600 dark:text-blue-400";
  return "rounded bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400";
};

export const getRecordDate = (record?: DashboardRecord) => record?.report?.createdAt ?? record?.savedAt;
export const getRecordJobName = (record?: DashboardRecord) => record?.report?.jobName ?? record?.jobName ?? "모의면접";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const getVideoPlaybackUrl = (objectKey?: string) => {
  if (!objectKey) return undefined;
  if (objectKey.startsWith("http://") || objectKey.startsWith("https://")) return objectKey;

  return `${API_BASE_URL.replace(/\/$/, "")}/api/videos/stream?objectKey=${encodeURIComponent(
    objectKey.replace(/^\/+/, "")
  )}`;
};

export const getSortedReports = (report?: InterviewReportResponse) => [...(report?.answers ?? [])].sort((a, b) => a.answerOrder - b.answerOrder);
export const getAverageEyeScore = (report?: InterviewReportResponse) => average(getSortedReports(report).map((a) => a.eye?.score));
export const getAveragePoseScore = (report?: InterviewReportResponse) => average(getSortedReports(report).map((a) => a.pose?.score));
export const getAverageSpeechPace = (report?: InterviewReportResponse) => average(getSortedReports(report).map((a) => a.speech?.charactersPerSecond));

export const getOverallScore = (report?: InterviewReportResponse) => {
  const eyeScore = getAverageEyeScore(report);
  const poseScore = getAveragePoseScore(report);
  const speechPace = getAverageSpeechPace(report);
  const speechScore = typeof speechPace === "number" ? Math.max(0, Math.min(100, 100 - Math.abs(speechPace - 3.5) * 12)) : undefined;
  return average([eyeScore, poseScore, speechScore]);
};

export const getMainFeedback = (report?: InterviewReportResponse) => {
  const answers = getSortedReports(report);
  const answerWithFeedback = answers.find((answer) => {
    if (!answer.speech?.aiEvaluationJson) return false;
    try { return typeof JSON.parse(answer.speech.aiEvaluationJson).feedback === "string"; } catch { return false; }
  });

  if (!answerWithFeedback?.speech?.aiEvaluationJson) {
    if (report?.analysisStatus === "DONE") return "분석은 완료되었습니다. Gemini 한도 초과 등으로 일부 AI 상세 피드백은 비어 있을 수 있습니다.";
    return "분석 결과 조회 API 응답을 기다리는 중입니다. 백엔드 분석이 완료되었는지 확인해주세요.";
  }
  try { return JSON.parse(answerWithFeedback.speech.aiEvaluationJson).feedback ?? "AI 상세 피드백을 확인할 수 없습니다."; } 
  catch { return "AI 상세 피드백을 파싱할 수 없습니다."; }
};

export const loadInterviewHistory = (): DashboardRecord[] => {
  if (typeof window === "undefined") return [];
  const latestRaw = localStorage.getItem("latestInterviewAnalysisJob");
  const historyRaw = localStorage.getItem("interviewAnalysisHistory");
  const records: InterviewHistoryItem[] = [];

  try { if (historyRaw) { const parsed = JSON.parse(historyRaw); if (Array.isArray(parsed)) records.push(...parsed); } } catch {}
  try { if (latestRaw) { const latest = JSON.parse(latestRaw); if (latest?.interviewId) records.unshift(latest); } } catch {}

  const unique = new Map<number, InterviewHistoryItem>();
  records.forEach((record) => { if (record?.interviewId) unique.set(record.interviewId, record); });

  return Array.from(unique.values()).sort((a, b) => new Date(b.savedAt ?? 0).getTime() - new Date(a.savedAt ?? 0).getTime());
};