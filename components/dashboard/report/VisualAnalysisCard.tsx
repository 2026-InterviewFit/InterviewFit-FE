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
  const eye = eyeReport ?? answerData?.eye;
  const gaze = answerData?.gaze;
  const pose = poseReport ?? answerData?.pose;
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  if (!eye && !(showGaze && gaze) && !pose) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-[24px] border border-black/[0.04] bg-white p-10 text-center shadow-sm dark:border-white/[0.04] dark:bg-[#1e293b]">
          <div className="rounded-lg bg-gray-50 p-3 text-gray-400 dark:bg-gray-800/50">
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
    <div className="flex w-full flex-col gap-6">
      {/* --- 1. 시선 및 눈 깜빡임 분석 --- */}
      {eye && (
        <div className="rounded-[24px] border border-black/[0.04] bg-white p-6 shadow-sm dark:border-white/[0.04] dark:bg-[#1e293b]">
          {/* 공통 헤더 규격 */}
          <div className="mb-6 flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                <Eye className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-navy dark:text-white">시선 및 눈 깜빡임 분석</h4>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {formatScore(eye.score)}
            </span>
          </div>

          {/* 공통 스탯 간격 (mb-6) */}
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <StatBox label="분당 깜빡임(BPM)" value={formatCount(eye.blinkRate)} />
            <StatBox label="총 깜빡임 횟수" value={formatCount(eye.blinkCount)} />
            {/* 영상 길이는 소수점 제거를 위해 Math.round 유지 (원치 않으시면 pose.totalDuration으로 변경 가능) */}
            <StatBox label="영상 길이" value={pose?.totalDuration ? `${Math.round(pose.totalDuration)}초` : "분석 데이터 없음"} />
          </div>
          
          {/* 공통 하단 박스 규격 */}
          <div className="rounded-xl border border-black/5 bg-slate-50 p-4 text-center dark:border-white/5 dark:bg-slate-800/30">
            <p className="text-sm font-medium leading-relaxed text-muted">
              {eye.feedback || "상세 분석 피드백이 없습니다."}
            </p>
          </div>
        </div>
      )}

      {/* --- 2. 시선 방향 분석 --- */}
      {showGaze && gaze && (
        <div className="rounded-[24px] border border-black/[0.04] bg-white p-6 shadow-sm dark:border-white/[0.04] dark:bg-[#1e293b]">
          {/* 공통 헤더 규격 */}
          <div className="mb-6 flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/5">
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
          
          {/* 공통 스탯 간격 (mb-6) */}
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <StatBox label="정면 응시 비율" value={formatRatio(gaze.centerRatio)} />
            <StatBox label="시선 이탈 비율" value={formatRatio(gaze.gazeAwayRatio)} isWarning={isRatioWarning(gaze.gazeAwayRatio)} />
            <StatBox label="시선 이탈 횟수" value={formatCount(gaze.gazeAwayCount)} />
          </div>

          {/* 공통 하단 박스 규격 */}
          <div className="rounded-xl border border-black/5 bg-slate-50 p-4 text-center dark:border-white/5 dark:bg-slate-800/30">
            <p className="text-sm font-medium leading-relaxed text-muted">
              {gaze.feedback || gaze.evaluation || "시선 방향에 대한 상세 피드백이 없습니다."}
            </p>
          </div>
        </div>
      )}

      {/* --- 3. 자세 안정성 분석 --- */}
      {pose && (
        <div className="rounded-[24px] border border-black/[0.04] bg-white p-6 shadow-sm dark:border-white/[0.04] dark:bg-[#1e293b]">
          {/* 공통 헤더 규격 */}
          <div className="mb-6 flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
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

          {/* 공통 스탯 간격 (mb-6) */}
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <StatBox label="전체 불안정 비율" value={formatRatio(pose.badRatio)} isWarning={isRatioWarning(pose.badRatio)} />
            <StatBox label="총 불안정 감지 횟수" value={formatCount(pose.badCount)} />
            <StatBox label="총 불안정 지속 시간" value={formatDuration(pose.badDuration)} />
          </div>

          {/* 공통 하단 박스 규격 (아코디언이지만 배경/테두리 일치) */}
          <div className=" overflow-hidden rounded-xl border border-black/5 bg-slate-50 transition-colors hover:bg-gray-100 dark:border-white/5 dark:bg-slate-800/30 dark:hover:bg-slate-800/50">
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
                  <div className="flex flex-col gap-5 p-4 pt-0">
                    
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

// 💡 Math.round 제거! 백엔드에서 주는 값을 그대로 출력합니다.
function formatScore(value: number) {
  return Number.isFinite(value)
    ? <>{value}<span className="text-sm text-muted">점</span></>
    : <span className="text-sm text-muted">분석 데이터 없음</span>;
}

const formatCount = (value: number) => Number.isFinite(value) ? `${value}회` : "분석 데이터 없음";
const formatDuration = (value: number) => Number.isFinite(value) ? `${value.toFixed(1)}초` : "분석 데이터 없음";

const toPercent = (value: number) => Math.abs(value) <= 1 ? value * 100 : value;
const formatRatio = (value: number) => Number.isFinite(value)
  ? `${toPercent(value).toFixed(1)}%`
  : "분석 데이터 없음";
const isRatioWarning = (value: number) => Number.isFinite(value) && toPercent(value) > 30;

function StatBox({ label, value, isWarning = false }: { label: string; value: string | number; isWarning?: boolean }) {
  return (
    <div
      className={`flex min-w-[140px] max-w-[240px] flex-1 flex-col items-center justify-center rounded-xl border p-4 text-center ${
        isWarning
          ? "border-red-100 bg-red-50/50 dark:border-red-900/40 dark:bg-red-900/20"
          : "border-black/5 bg-white dark:border-white/5 dark:bg-slate-800/50"
      }`}
    >
      <span className="mb-1.5 text-[11px] font-bold text-slate-500">{label}</span>
      <span className={`text-base font-bold ${isWarning ? "text-red-600 dark:text-red-400" : "text-navy dark:text-white"}`}>
        {value}
      </span>
    </div>
  );
}