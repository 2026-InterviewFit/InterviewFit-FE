"use client";

import { Mic, MessageSquare, Star, KeyRound } from "lucide-react";
import type { AnswerReport } from "@/types";

interface SpeechAnalysisCardProps {
  answerData?: AnswerReport;
  useActualMetrics?: boolean;
}

const STAR_RAW_ITEM_MAX_SCORE = 10;
const STAR_TOTAL_MAX_SCORE = STAR_RAW_ITEM_MAX_SCORE * 4;
const STAR_ITEMS = [
  { label: "S (Situation)", keys: ["S", "s", "situation"] },
  { label: "T (Task)", keys: ["T", "t", "task"] },
  { label: "A (Action)", keys: ["A", "a", "action"] },
  { label: "R (Result)", keys: ["R", "r", "result"] },
] as const;

function normalizeStarScore(rawScore: number) {
  return Math.max(0, Math.min(STAR_RAW_ITEM_MAX_SCORE, rawScore));
}

function formatScore(score: number) {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

export default function SpeechAnalysisCard({ answerData, useActualMetrics = false }: SpeechAnalysisCardProps) {
  const speech = answerData?.speech;
  
  if (!speech) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-10 border border-black/[0.04] dark:border-white/[0.04] shadow-sm flex flex-col items-center justify-center text-center gap-3 min-h-[200px]">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 text-gray-400">
            <Mic className="h-6 w-6 opacity-50" />
          </div>
          <h4 className="text-base font-bold text-navy dark:text-white">
            발화 및 내용 분석 결과가 없습니다
          </h4>
          <p className="text-xs text-muted dark:text-gray-400">
            음성 분석에 실패하였거나 텍스트 변환 데이터를 불러오지 못했습니다.
          </p>
        </div>
      </div>
    );
  }

  let aiEvaluation = { star_score: {}, feedback: "", keywords: [] };
  try {
    if (speech.aiEvaluationJson) {
      aiEvaluation = JSON.parse(speech.aiEvaluationJson);
    }
  } catch (e) {
    console.error("AI Evaluation JSON 파싱 실패:", e);
  }

  const pauseRate = Number.isFinite(speech.pauseRatePercent) ? speech.pauseRatePercent : undefined;
  const volumeDeviation = Number.isFinite(speech.volumeDbStd) ? speech.volumeDbStd : undefined;
  const starScore = aiEvaluation.star_score as Record<string, unknown>;
  const normalizedStarScores = STAR_ITEMS.map(({ keys }) => {
    const rawScore = keys.map((key) => starScore?.[key]).find((value) => typeof value === "number");
    return typeof rawScore === "number" && Number.isFinite(rawScore)
      ? normalizeStarScore(rawScore)
      : undefined;
  });
  const totalStarScore = normalizedStarScores.every((score): score is number => score !== undefined)
    ? normalizedStarScores.reduce((sum, score) => sum + score, 0)
    : undefined;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. 발화 및 키워드 통계 */}
      <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="rounded-lg bg-purple-50 dark:bg-purple-900/30 p-2 text-purple-600 dark:text-purple-300">
            <Mic className="h-4 w-4" />
          </div>
          <h4 className="text-base font-bold text-navy dark:text-white">발화 및 습관어 분석</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatBox label="발화 속도 (CPS)" value={formatMetric(speech.charactersPerSecond, "자/초")} />
          {useActualMetrics ? (
            <>
              <StatBox label="침묵 시간" value={formatMetric(speech.totalSilenceSeconds, "초")} />
              <StatBox label="침묵 비율" value={pauseRate === undefined ? "분석 데이터 없음" : `${pauseRate.toFixed(1)}%`} isWarning={pauseRate !== undefined && pauseRate > 15} />
              <StatBox label="음량 편차" value={volumeDeviation === undefined ? "분석 데이터 없음" : `${volumeDeviation.toFixed(1)}dB`} />
            </>
          ) : (
            <>
              <StatBox label="침묵 시간 (비율)" value={`${speech.totalSilenceSeconds.toFixed(1)}초 (${speech.totalSilenceSeconds ? (speech.totalSilenceSeconds / (speech.charactersPerSecond * 10) * 100).toFixed(1) : "0.0"}%)`} />
              <StatBox label="음량 안정성" value="우수" />
              <StatBox label="핵심 키워드 포함률" value="78%" />
            </>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-black/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-navy dark:text-white flex items-center gap-1.5">
              <KeyRound className="h-4 w-4 text-amber-500" /> 습관어 및 반복 표현
            </span>
            <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">
              {Number.isFinite(speech.totalFillerCount) ? `총 ${speech.totalFillerCount}회 감지` : "분석 데이터 없음"}
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed break-keep">
            {speech.paceFeedback || "분석된 발화 피드백이 없습니다."}
          </p>
        </div>
      </div>

      {/* 2. 답변 관련 (현재 답변 vs 최적의 답변) */}
      <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2 text-emerald-600 dark:text-emerald-300">
            <MessageSquare className="h-4 w-4" />
          </div>
          <h4 className="text-base font-bold text-navy dark:text-white">답변 내용 분석</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 p-4 rounded-xl border border-black/5 bg-gray-50/50 dark:bg-slate-800/30">
            <span className="text-xs font-bold text-slate-500">현재 답변 (STT)</span>
            <p className="text-sm text-navy dark:text-slate-300 leading-relaxed font-medium break-keep h-32 overflow-y-auto scrollbar-hide">
              {speech.textScript || "답변 내용을 불러올 수 없습니다."}
            </p>
          </div>
          <div className="flex flex-col gap-2 p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-900/10">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">최적의 답변 (AI 제안)</span>
            <p className="text-sm text-navy dark:text-slate-300 leading-relaxed font-medium break-keep h-32 overflow-y-auto scrollbar-hide">
              {speech.modelAnswer || "AI 모델 답변을 생성 중입니다."}
            </p>
          </div>
        </div>
      </div>

      {/* 3. STAR 평가 */}
      <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-sm flex flex-col gap-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
              <Star className="h-4 w-4" />
            </div>
            <h4 className="text-base font-bold text-navy dark:text-white">STAR 구조 평가</h4>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              총점 {totalStarScore === undefined ? "분석 데이터 없음" : formatScore(totalStarScore)} / {STAR_TOTAL_MAX_SCORE}점
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STAR_ITEMS.map(({ label }, index) => {
            const score = normalizedStarScores[index];
            return (
              <div key={label} className="p-3 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-slate-800 text-center flex flex-col gap-1 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500">{label}</span>
                <span className="text-lg font-bold text-amber-500">
                  {score === undefined ? "분석 데이터 없음" : `${formatScore(score)} / ${STAR_RAW_ITEM_MAX_SCORE}점`}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 rounded-xl border border-black/5 bg-gray-50/50 p-4 text-sm font-medium leading-relaxed text-navy break-keep dark:bg-slate-800/30 dark:text-slate-300">
          {aiEvaluation.feedback || "STAR 기법에 맞춰 경험을 구체적으로 설명해 보세요."}
        </p>
      </div>
    </div>
  );
}

function formatMetric(value: number, suffix: string) {
  return Number.isFinite(value) ? `${value.toFixed(1)}${suffix}` : "분석 데이터 없음";
}

function StatBox({ label, value, isWarning = false }: { label: string; value: string | number; isWarning?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-4 rounded-xl border flex-1 min-w-[120px] ${
        isWarning 
          ? "bg-red-50/50 dark:bg-red-900/20 border-red-100 dark:border-red-900/40" 
          : "bg-white dark:bg-slate-800/50 border-black/5 dark:border-white/5"
      }`}
    >
      <span className="text-[11px] font-bold text-slate-500 mb-1.5">{label}</span>
      <span className={`text-base font-bold ${isWarning ? "text-red-600 dark:text-red-400" : "text-navy dark:text-white"}`}>
        {value}
      </span>
    </div>
  );
}
