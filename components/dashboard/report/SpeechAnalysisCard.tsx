"use client";

import { Mic, MessageSquare, Star, KeyRound } from "lucide-react";
import type { AnswerReport } from "@/types";

interface SpeechAnalysisCardProps {
  answerData?: AnswerReport;
}

export default function SpeechAnalysisCard({ answerData }: SpeechAnalysisCardProps) {
  const speech = answerData?.speech;
  if (!speech) return null;

  // AI 평가 JSON 파싱 (에러 방지 처리)
  let aiEvaluation = { star_score: {}, feedback: "", keywords: [] };
  try {
    if (speech.aiEvaluationJson) {
      aiEvaluation = JSON.parse(speech.aiEvaluationJson);
    }
  } catch (e) {
    console.error("AI Evaluation JSON 파싱 실패:", e);
  }

  // 백엔드 명세 확정 전 임시 변수 처리
  const volumeStability = "우수"; // TODO: API에서 넘어올 음량 안정성 데이터 매핑
  const keywordRate = 78; // TODO: API에서 넘어올 키워드 포함율 데이터 매핑
  const silenceRatio = speech.totalSilenceSeconds ? (speech.totalSilenceSeconds / (speech.charactersPerSecond * 10)) * 100 : 0; // 임시 계산식

  return (
    <div className="flex flex-col gap-6 w-full mt-6">
      {/* 1. 발화 및 키워드 통계 */}
      <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="rounded-lg bg-purple-50 dark:bg-purple-900/30 p-2 text-purple-600 dark:text-purple-300">
            <Mic className="h-4 w-4" />
          </div>
          <h4 className="text-base font-bold text-navy dark:text-white">발화 및 습관어 분석</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatBox label="발화 속도 (CPS)" value={`${speech.charactersPerSecond.toFixed(1)}자/초`} />
          <StatBox label="침묵 시간 (비율)" value={`${speech.totalSilenceSeconds.toFixed(1)}초 (${silenceRatio.toFixed(1)}%)`} isWarning={silenceRatio > 15} />
          <StatBox label="음량 안정성" value={volumeStability} />
          <StatBox label="핵심 키워드 포함률" value={`${keywordRate}%`} />
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

      {/* 3. STAR 평가 (제미나이) */}
      <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-2 text-amber-600 dark:text-amber-300">
            <Star className="h-4 w-4" />
          </div>
          <h4 className="text-base font-bold text-navy dark:text-white">STAR 구조 평가</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {["S (Situation)", "T (Task)", "A (Action)", "R (Result)"].map((label, idx) => {
            const scoreValues = Object.values(aiEvaluation.star_score || {});
            const score = typeof scoreValues[idx] === "number" ? scoreValues[idx] : "-";
            
            return (
              <div key={label} className="p-3 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-slate-800 text-center flex flex-col gap-1 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500">{label}</span>
                <span className="text-lg font-bold text-amber-500">{score}점</span>
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