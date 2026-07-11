"use client";

import { Eye, UserSquare2 } from "lucide-react";
import type { AnswerReport } from "@/types";

interface VisualAnalysisCardProps {
  answerData?: AnswerReport;
}

export default function VisualAnalysisCard({ answerData }: VisualAnalysisCardProps) {
  const eye = answerData?.eye;
  const pose = answerData?.pose;
  
  if (!eye && !pose) return null;

  return (
    <div className="flex flex-col gap-6 w-full">
      {eye && (
        <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300">
                <Eye className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-navy dark:text-white">시선 및 눈 깜빡임 분석</h4>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {eye.score}<span className="text-sm text-muted">점</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <StatBox label="분당 깜빡임(BPM)" value={`${eye.blinkRate}회`} />
            <StatBox label="총 깜빡임 횟수" value={`${eye.blinkCount}회`} />
            <StatBox label="영상 길이" value={pose?.totalDuration ? `${Math.round(pose.totalDuration)}초` : "-"} />
          </div>
          <p className="text-xs text-muted bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-black/5 leading-relaxed text-center font-medium">
            {eye.feedback || "시선 처리가 전반적으로 안정적입니다."}
          </p>
        </div>
      )}

      {pose && (
        <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300">
                <UserSquare2 className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-navy dark:text-white">자세 안정성 분석</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
                {pose.grade} Grade
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {pose.score}<span className="text-sm text-muted">점</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <StatBox label="전체 불안정 비율" value={`${(pose.badRatio * 100).toFixed(1)}%`} isWarning={pose.badRatio > 0.3} />
            <StatBox label="어깨 흔들림 (횟수/시간)" value={`${pose.shoulderBadCount}회 / ${pose.shoulderBadDuration.toFixed(1)}초`} />
            <StatBox label="얼굴 이탈 (횟수/시간)" value={`${pose.faceBadCount}회 / ${pose.faceBadDuration.toFixed(1)}초`} />
            <StatBox label="총 불안정 감지 횟수" value={`${pose.badCount}회`} />
            <StatBox label="총 불안정 지속 시간" value={`${pose.badDuration.toFixed(1)}초`} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, isWarning = false }: { label: string; value: string; isWarning?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-4 rounded-xl border flex-1 min-w-[140px] max-w-[240px] ${
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