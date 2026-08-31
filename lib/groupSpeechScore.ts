import type { SpeechScoreStatus } from "@/types";

export type SpeechScoreDisplay = {
  label: string;
  isInsufficient: boolean;
  reason: string | null;
};

export function getSpeechScoreDisplay(
  score: number | null | undefined,
  status: SpeechScoreStatus | null | undefined,
  reason: string | null | undefined,
): SpeechScoreDisplay {
  const isInsufficient = status === "INSUFFICIENT_DATA"
    || score == null
    || !Number.isFinite(score);

  if (isInsufficient) {
    return {
      label: "분석 데이터 부족",
      isInsufficient: true,
      reason: reason?.trim() || null,
    };
  }

  return {
    label: `${Number.isInteger(score) ? score : score.toFixed(1)}점`,
    isInsufficient: false,
    reason: null,
  };
}
