"use client";

import { useState } from "react";
import { Eye, UserSquare2, ChevronDown, User, ScanFace } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AnswerReport, EyeReport, PoseReport } from "@/types";

interface VisualAnalysisCardProps {
  answerData?: AnswerReport;
  eyeReport?: EyeReport | null;
  poseReport?: PoseReport | null;
  showGaze?: boolean;
}

export default function VisualAnalysisCard({
  answerData,
  eyeReport,
  poseReport,
  showGaze = false,
}: VisualAnalysisCardProps) {
  // 현재 BE는 eye / pose를 InterviewReportResponse 최상위에 내려준다.
  // answerData의 eye / pose는 과거 구조 호환용 fallback으로 유지한다.
  const eye = eyeReport ?? answerData?.eye;
  const gaze = answerData?.gaze;
  const pose = poseReport ?? answerData?.pose;
  
  // 아코디언 상태 관리
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 데이터가 없을 경우 빈 상태(Empty State) 반환
  if (!eye && !(showGaze && gaze) && !pose) {
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
              {formatScore(eye.score)}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <StatBox label="분당 깜빡임(BPM)" value={formatCount(eye.blinkRate)} />
            <StatBox label="총 깜빡임 횟수" value={formatCount(eye.blinkCount)} />
            <StatBox label="영상 길이" value={pose?.totalDuration ? `${Math.round(pose.totalDuration)}초` : "분석 데이터 없음"} />
          </div>
          <p className="text-xs text-muted bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-black/5 leading-relaxed text-center font-medium">
            {eye.feedback || "상세 분석 피드백이 없습니다."}
          </p>
        </div>
      )}

      {/* --- 시선 방향 분석 카드 --- */}
      {showGaze && gaze && (
        <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300">
                <ScanFace className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-navy dark:text-white">시선 방향 분석</h4>
            </div>
            <span className="text-2xl font-bold text-cyan-600">
              {formatScore(gaze.score)}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <StatBox label="정면 응시 비율" value={formatRatio(gaze.centerRatio)} />
            <StatBox label="시선 이탈 비율" value={formatRatio(gaze.gazeAwayRatio)} isWarning={isRatioWarning(gaze.gazeAwayRatio)} />
            <StatBox label="시선 이탈 횟수" value={formatCount(gaze.gazeAwayCount)} />
          </div>
          <p className="text-xs text-muted bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-black/5 leading-relaxed text-center font-medium">
            {gaze.feedback || gaze.evaluation || "시선 방향에 대한 상세 피드백이 없습니다."}
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
              <span className="text-2xl font-bold text-indigo-600">
                {formatScore(pose.score)}
              </span>
            </div>
          </div>

          {/* 1. 최상단: 전체 요약 (비율, 총 횟수, 총 시간) */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <StatBox label="전체 불안정 비율" value={formatRatio(pose.badRatio)} isWarning={isRatioWarning(pose.badRatio)} />
            <StatBox label="총 불안정 감지 횟수" value={formatCount(pose.badCount)} />
            <StatBox label="총 불안정 지속 시간" value={formatDuration(pose.badDuration)} />
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
                        <StatBox label="이탈 감지 횟수" value={formatCount(pose.faceBadCount)} />
                        <StatBox label="이탈 지속 시간" value={formatDuration(pose.faceBadDuration)} />
                      </div>
                    </div>

                    <div className="h-px w-full bg-black/5 dark:bg-white/5" />

                    {/* 어깨 흔들림 상세 */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 dark:text-indigo-400">
                        <User className="h-4 w-4" /> 어깨 흔들림 (Shoulder Bad)
                      </div>
                      <div className="flex justify-center gap-4">
                        <StatBox label="흔들림 감지 횟수" value={formatCount(pose.shoulderBadCount)} />
                        <StatBox label="흔들림 지속 시간" value={formatDuration(pose.shoulderBadDuration)} />
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

function formatScore(value: number) {
  return Number.isFinite(value)
    ? <>{value}<span className="text-sm text-muted">점</span></>
    : <span className="text-sm text-muted">분석 데이터 없음</span>;
}

const formatCount = (value: number) => Number.isFinite(value) ? `${value}회` : "분석 데이터 없음";
const formatDuration = (value: number) => Number.isFinite(value) ? `${value.toFixed(1)}초` : "분석 데이터 없음";

// 분석 API별로 비율이 0~1 또는 0~100 단위로 내려올 수 있어 퍼센트로 통일한다.
const toPercent = (value: number) => Math.abs(value) <= 1 ? value * 100 : value;
const formatRatio = (value: number) => Number.isFinite(value)
  ? `${toPercent(value).toFixed(1)}%`
  : "분석 데이터 없음";
const isRatioWarning = (value: number) => Number.isFinite(value) && toPercent(value) > 30;

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
