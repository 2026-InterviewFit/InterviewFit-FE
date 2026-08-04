"use client";

import { useState } from "react";
import { Eye, UserSquare2, ChevronDown, User, ScanFace } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AnswerReport } from "@/types";

interface VisualAnalysisCardProps {
  answerData?: AnswerReport;
}

export default function VisualAnalysisCard({ answerData }: VisualAnalysisCardProps) {
  const eye = answerData?.eye;
  const pose = answerData?.pose;
  
  // 아코디언 상태 관리
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 데이터가 없을 경우 빈 상태(Empty State) 반환
  if (!eye && !pose) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-10 border border-black/[0.04] dark:border-white/[0.04] shadow-sm flex flex-col items-center justify-center text-center gap-3 min-h-[200px]">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 text-gray-400">
            <Eye className="h-6 w-6 opacity-50" />
          </div>
          <h4 className="text-base font-bold text-navy dark:text-white">
            시각 분석 결과가 없습니다
          </h4>
          <p className="text-xs text-muted dark:text-gray-400">
            영상 분석에 실패하였거나 데이터를 불러오지 못했습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* --- 시선 분석 카드 --- */}
      {eye && (
        <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2 text-blue-600 dark:text-blue-300">
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

      {/* --- 자세 안정성 카드 --- */}
      {pose && (
        <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-line dark:border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/30 p-2 text-indigo-600 dark:text-indigo-300">
                <UserSquare2 className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-navy dark:text-white">자세 안정성 분석</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold">
                {pose.grade} Grade
              </span>
              <span className="text-2xl font-bold text-indigo-600">
                {pose.score}<span className="text-sm text-muted">점</span>
              </span>
            </div>
          </div>

          {/* 1. 최상단: 전체 요약 (비율, 총 횟수, 총 시간) */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <StatBox label="전체 불안정 비율" value={`${(pose.badRatio * 100).toFixed(1)}%`} isWarning={pose.badRatio > 0.3} />
            <StatBox label="총 불안정 감지 횟수" value={`${pose.badCount}회`} />
            <StatBox label="총 불안정 지속 시간" value={`${pose.badDuration.toFixed(1)}초`} />
          </div>

          {/* 2. 아코디언: 세부 부위별 분석 (얼굴, 어깨) */}
          <div className="rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800/30 overflow-hidden transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50">
            <button 
              onClick={() => setIsDetailOpen(!isDetailOpen)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="text-sm font-bold text-navy dark:text-white">세부 부위별 불안정(Bad) 분석 보기</span>
              <ChevronDown className={`h-4 w-4 text-muted transition-transform duration-200 ${isDetailOpen ? "rotate-180" : ""}`} />
            </button>
            
            <AnimatePresence initial={false}>
              {isDetailOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="p-4 pt-0 flex flex-col gap-5">
                    
                    {/* 얼굴 이탈 상세 */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 dark:text-indigo-400">
                        <ScanFace className="h-4 w-4" /> 얼굴 이탈 (Face Bad)
                      </div>
                      
                      <div className="flex justify-center gap-4">
                        <StatBox label="이탈 감지 횟수" value={`${pose.faceBadCount}회`} />
                        <StatBox label="이탈 지속 시간" value={`${pose.faceBadDuration.toFixed(1)}초`} />
                      </div>
                    </div>

                    <div className="h-px w-full bg-black/5 dark:bg-white/5" />

                    {/* 어깨 흔들림 상세 */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 dark:text-indigo-400">
                        <User className="h-4 w-4" /> 어깨 흔들림 (Shoulder Bad)
                      </div>
                      <div className="flex justify-center gap-4">
                        <StatBox label="흔들림 감지 횟수" value={`${pose.shoulderBadCount}회`} />
                        <StatBox label="흔들림 지속 시간" value={`${pose.shoulderBadDuration.toFixed(1)}초`} />
                      </div>
                    </div>
                    
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}
    </div>
  );
}

// 스탯 박스 헬퍼 컴포넌트
function StatBox({ label, value, isWarning = false }: { label: string; value: string | number; isWarning?: boolean }) {
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