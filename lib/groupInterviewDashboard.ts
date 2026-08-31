import type { GroupAnalysisStatus, GroupAnswerCompletionType } from "@/types/groupInterview";

export const GROUP_ANALYSIS_STATUS_LABEL = {
  WAITING: "분석 대기",
  UPLOADED: "분석 준비 중",
  RUNNING: "분석 중",
  DONE: "분석 완료",
  FAILED: "분석 실패",
} satisfies Record<GroupAnalysisStatus, string>;

export function getGroupAnalysisStatusClassName(status: GroupAnalysisStatus): string {
  if (status === "DONE") return "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300";
  if (status === "FAILED") return "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300";
  if (status === "RUNNING") return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300";
  return "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300";
}

export function getGroupQuestionIndices(questionIndices: readonly number[]): number[] {
  return [...new Set(questionIndices.filter((index) => Number.isInteger(index) && index >= 0))]
    .sort((left, right) => left - right);
}

export type GroupAnswerVideoState = "AVAILABLE" | "RECORDING_FAILED" | "HIDDEN";

export function getGroupAnswerVideoState(
  videoUploaded: boolean,
  completionType: GroupAnswerCompletionType | null,
): GroupAnswerVideoState {
  if (completionType === "SKIPPED") return "HIDDEN";
  if (videoUploaded) return "AVAILABLE";
  return completionType === "RECORDING_FAILED" ? "RECORDING_FAILED" : "HIDDEN";
}
