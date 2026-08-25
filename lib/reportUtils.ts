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

// 🔑 신규: STAR 평가 점수를 0~100 척도로 환산해서 평균
// 백엔드가 speech 전용 종합 점수를 아직 내려주지 않아서,
// AI 평가(aiEvaluationJson) 안의 star_score(S/T/A/R)를 임시로 활용합니다.
// ⚠️ star_score가 항목별 0~25점(4개 합 100점) 구조라고 가정한 근사치입니다.
//    백엔드 척도가 다르다면 이 함수만 조정하면 됩니다.
export const getAverageSpeechContentScore = (report?: InterviewReportResponse) => {
  const scores = getSortedReports(report)
    .map((answer) => {
      if (!answer.speech?.aiEvaluationJson) return undefined;
      try {
        const parsed = JSON.parse(answer.speech.aiEvaluationJson);
        const star = parsed?.star_score;
        if (!star || typeof star !== "object") return undefined;

        const values = Object.values(star).filter((v): v is number => typeof v === "number");
        if (values.length === 0) return undefined;

        const total = values.reduce((sum, v) => sum + v, 0);
        return Math.max(0, Math.min(100, total));
      } catch {
        return undefined;
      }
    })
    .filter((v): v is number => typeof v === "number");

  return average(scores);
};

// 🔑 신규: 발화 속도 점수 + STAR 내용 점수를 함께 반영한 종합 발화 점수.
// 기존에는 속도(글자/초)만으로 점수를 매겨서, 말은 빨리 해도 내용이 부실하면
// 오히려 점수가 높게 나오는 문제가 있었습니다. 이제 내용 점수 비중을 더 둡니다.
export const getSpeechScore = (report?: InterviewReportResponse) => {
  const pace = getAverageSpeechPace(report);
  const paceScore =
    typeof pace === "number" ? Math.max(0, Math.min(100, 100 - Math.abs(pace - 3.5) * 12)) : undefined;
  const contentScore = getAverageSpeechContentScore(report);

  if (typeof paceScore === "number" && typeof contentScore === "number") {
    // 속도 40% + 내용 60% 가중 평균 (내용이 더 중요하다고 보고 가중치를 둠)
    return paceScore * 0.4 + contentScore * 0.6;
  }

  return paceScore ?? contentScore;
};

export const getOverallScore = (report?: InterviewReportResponse) => {
  const eyeScore = getAverageEyeScore(report);
  const poseScore = getAveragePoseScore(report);
  const speechScore = getSpeechScore(report); // 🔑 개선된 함수로 교체
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