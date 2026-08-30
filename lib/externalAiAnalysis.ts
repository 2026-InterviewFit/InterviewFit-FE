import type { ExternalAiAnalysis } from "@/types";

export const EXTERNAL_AI_STAR_ITEMS = [
  { key: "situation", label: "Situation" },
  { key: "task", label: "Task" },
  { key: "action", label: "Action" },
  { key: "result", label: "Result" },
] as const;

const nonEmptyStrings = (values: string[] | null | undefined): string[] =>
  (values ?? []).filter((value) => typeof value === "string" && value.trim().length > 0);

export const externalAiAnalysisView = (analysis: ExternalAiAnalysis) => ({
  star: EXTERNAL_AI_STAR_ITEMS.map(({ key, label }) => ({
    key,
    label,
    value: analysis.star?.[key]?.trim() || null,
  })),
  strengths: nonEmptyStrings(analysis.strengths),
  improvements: nonEmptyStrings(analysis.improvements),
});
