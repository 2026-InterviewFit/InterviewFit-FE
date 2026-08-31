// lib/reportUtils.ts
import type { DashboardRecord, InterviewHistoryItem, InterviewReportResponse } from "@/types";

export const formatKoreanDate = (value?: string) => {
  if (!value) return "날짜 정보 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "날짜 정보 없음";
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월 ${String(date.getDate()).padStart(2, "0")}일`;
};

export const formatKoreanDateTime = (value?: string | null) => {
  if (!value) return "시간 정보 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "시간 정보 없음";
  return `${formatKoreanDate(value)} ${date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
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
export const getAverageEyeScore = (report?: InterviewReportResponse) => {
  const topLevelScore = report?.eye?.score;

  if (
    typeof topLevelScore === "number" &&
    Number.isFinite(topLevelScore)
  ) {
    return topLevelScore;
  }

  // 과거 답변별 eye 구조와의 호환을 위한 fallback
  return (
    average(
      getSortedReports(report).map(
        (answer) => answer.eye?.score,
      ),
    ) ?? 0
  );
};

export const getAverageGazeScore = (report?: InterviewReportResponse) => {
  const topLevelScore = report?.gaze?.score;

  if (
    typeof topLevelScore === "number" &&
    Number.isFinite(topLevelScore)
  ) {
    return topLevelScore;
  }

  return (
    average(
      getSortedReports(report).map(
        (answer) => answer.gaze?.score,
      ),
    ) ?? 0
  );
};

export const getAveragePoseScore = (report?: InterviewReportResponse) => {
  const topLevelScore = report?.pose?.score;

  if (
    typeof topLevelScore === "number" &&
    Number.isFinite(topLevelScore)
  ) {
    return topLevelScore;
  }

  // 과거 답변별 pose 구조와의 호환을 위한 fallback
  return (
    average(
      getSortedReports(report).map(
        (answer) => answer.pose?.score,
      ),
    ) ?? 0
  );
};
export const getSpeechScore = (report?: InterviewReportResponse) => {
  return average(getSortedReports(report).map((answer) => answer.speech?.speechScore));
};

// 기존 Gemini STAR 평가를 답변 내용 점수(0~100)로 환산하는 프로젝트 기존 기준.
export const getAnswerContentScore = (report?: InterviewReportResponse) => {
  const scores = getSortedReports(report).map((answer) => {
    if (!answer.speech?.aiEvaluationJson) return undefined;
    try {
      const parsed = JSON.parse(answer.speech.aiEvaluationJson) as {
        star_score?: Record<string, unknown>;
      };
      const starScore = parsed.star_score;
      if (!starScore) return undefined;

      const values = [
        ["S", "s", "situation"],
        ["T", "t", "task"],
        ["A", "a", "action"],
        ["R", "r", "result"],
      ].map((keys) => keys
        .map((key) => starScore[key])
        .find((value): value is number => typeof value === "number" && Number.isFinite(value)));

      if (!values.every((value): value is number => typeof value === "number")) return undefined;
      return Math.max(0, Math.min(100, values.reduce((sum, value) => sum + value, 0) * 2.5));
    } catch {
      return undefined;
    }
  });

  return average(scores);
};

export function calculateInterviewTotalScore(scores: {
  blinkScore: number | null | undefined;
  gazeScore: number | null | undefined;
  poseScore: number | null | undefined;
  speechScore: number | null | undefined;
  contentScore: number | null | undefined;
}): number | undefined {
  const { blinkScore, gazeScore, poseScore, speechScore, contentScore } = scores;
  const isFiniteScore = (score: number | null | undefined): score is number => (
    typeof score === "number" && Number.isFinite(score)
  );
  if (
    !isFiniteScore(blinkScore)
    || !isFiniteScore(gazeScore)
    || !isFiniteScore(poseScore)
    || !isFiniteScore(speechScore)
    || !isFiniteScore(contentScore)
  ) {
    return undefined;
  }

  return blinkScore * 0.15
    + gazeScore * 0.2
    + poseScore * 0.2
    + speechScore * 0.2
    + contentScore * 0.25;
}

export const getOverallScore = (report?: InterviewReportResponse) => {
  const blinkScore = getAverageEyeScore(report);
  const gazeScore = getAverageGazeScore(report);
  const poseScore = getAveragePoseScore(report);
  const speechScore = getSpeechScore(report);
  const contentScore = getAnswerContentScore(report);

  return calculateInterviewTotalScore({
    blinkScore,
    gazeScore,
    poseScore,
    speechScore,
    contentScore,
  });
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
