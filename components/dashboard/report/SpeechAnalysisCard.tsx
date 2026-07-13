"use client";

import { Mic, MessageSquare, Star, KeyRound, Repeat } from "lucide-react";
import type { AnswerReport } from "@/types";

interface SpeechAnalysisCardProps {
  answerData?: AnswerReport;
}

type AiEvaluation = {
  star_score: Record<string, number>;
  feedback: string;
  keywords: string[];
};

type RepeatedExpression = {
  expression: string;
  count: number;
};

// STAR 점수 만점 기준 (Gemini 프롬프트 기준과 반드시 일치해야 함)
const STAR_MAX_SCORE = 10;

export default function SpeechAnalysisCard({ answerData }: SpeechAnalysisCardProps) {
  const speech = answerData?.speech;
  if (!speech) return null;

  // AI 평가 JSON 파싱 (에러 방지 처리)
  let aiEvaluation: AiEvaluation = { star_score: {}, feedback: "", keywords: [] };
  try {
    if (speech.aiEvaluationJson) {
      aiEvaluation = JSON.parse(speech.aiEvaluationJson);
    }
  } catch (e) {
    console.error("AI Evaluation JSON 파싱 실패:", e);
  }

  // 반복 표현 JSON 파싱 (에러 방지 처리)
  let repeatedExpressions: RepeatedExpression[] = [];
  try {
    if (speech.repeatedExpressionsJson) {
      repeatedExpressions = JSON.parse(speech.repeatedExpressionsJson);
    }
  } catch (e) {
    console.error("반복 표현 JSON 파싱 실패:", e);
  }

  // 침묵 비율은 백엔드에서 계산된 값을 그대로 사용
  const silenceRatio = speech.pauseRatePercent ?? 0;
  const silenceLevel =
    silenceRatio < 10 ? "적절" : silenceRatio < 20 ? "보통" : "많음";

  // 발화 속도 평가는 이미 파이썬(speech_service.py)에서 계산해서 내려옴
  const paceLabel = speech.paceEvaluation || null;

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

        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatBox
            label="발화 속도 (CPS)"
            value={`${speech.charactersPerSecond.toFixed(1)}자/초`}
            subLabel={paceLabel ?? undefined}
            isWarning={paceLabel === "너무 느림" || paceLabel === "너무 빠름"}
          />
          <StatBox
            label="침묵 시간 (비율)"
            value={`${speech.totalSilenceSeconds.toFixed(1)}초 (${silenceRatio.toFixed(1)}%)`}
            subLabel={silenceLevel}
            isWarning={silenceRatio > 15}
          />
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-black/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-navy dark:text-white flex items-center gap-1.5">
              <KeyRound className="h-4 w-4 text-amber-500" /> 습관어 및 반복 표현
            </span>
            <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">
              총 {speech.totalFillerCount}회 감지
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed break-keep">
            {speech.paceFeedback || "분석된 발화 피드백이 없습니다."}
          </p>

          {repeatedExpressions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-black/5">
              {repeatedExpressions.map((r, idx) => (
                <span
                  key={`${r.expression}-${idx}`}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300 px-2 py-1 rounded-md"
                >
                  <Repeat className="h-3 w-3" />
                  &ldquo;{r.expression}&rdquo; {r.count}회
                </span>
              ))}
            </div>
          )}
        </div>

        {aiEvaluation.keywords && aiEvaluation.keywords.length > 0 && (
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 mb-2 block">답변에 포함된 핵심 키워드</span>
            <div className="flex flex-wrap gap-2">
              {aiEvaluation.keywords.map((kw, idx) => (
                <span
                  key={`${kw}-${idx}`}
                  className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded-md"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}
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

      {/* 3. STAR 평가 (제미나이) */}
      <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-2 text-amber-600 dark:text-amber-300">
            <Star className="h-4 w-4" />
          </div>
          <h4 className="text-base font-bold text-navy dark:text-white">STAR 구조 평가</h4>
          <span className="text-[11px] font-semibold text-slate-400 ml-auto">{STAR_MAX_SCORE}점 만점</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {["S (Situation)", "T (Task)", "A (Action)", "R (Result)"].map((label, idx) => {
            const scoreValues = Object.values(aiEvaluation.star_score || {});
            const score = typeof scoreValues[idx] === "number" ? scoreValues[idx] : "-";

            return (
              <div key={label} className="p-3 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-slate-800 text-center flex flex-col gap-1 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500">{label}</span>
                <span className="text-lg font-bold text-amber-500">
                  {score}
                  <span className="text-xs text-slate-400 font-semibold">/{STAR_MAX_SCORE}점</span>
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 leading-relaxed text-center font-medium mt-2">
          {aiEvaluation.feedback || "STAR 기법에 맞춰 경험을 구체적으로 설명해 보세요."}
        </p>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  subLabel,
  isWarning = false,
}: {
  label: string;
  value: string | number;
  subLabel?: string;
  isWarning?: boolean;
}) {
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
      {subLabel && (
        <span className={`text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded-md ${
          isWarning
            ? "text-red-500 bg-red-100/60 dark:bg-red-900/30"
            : "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
        }`}>
          {subLabel}
        </span>
      )}
    </div>
  );
}
