"use client";

import { Eye, UserSquare2 } from "lucide-react";
import type { AnswerReport } from "@/types";

interface VisualAnalysisCardProps {
  answerData?: AnswerReport;
}

export default function VisualAnalysisCard({
  answerData,
}: VisualAnalysisCardProps) {
  const eye = answerData?.eye ?? null;
  const gaze = answerData?.gaze ?? null;
  const pose = answerData?.pose ?? null;

  if (!eye && !gaze && !pose) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {gaze && (
        <div className="rounded-[24px] border border-black/[0.04] bg-white p-6 shadow-sm dark:border-white/[0.04] dark:bg-[#1e293b]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                <Eye className="h-4 w-4" />
              </div>

              <h4 className="text-base font-bold text-navy dark:text-white">
                시선 분석
              </h4>
            </div>

            <span className="text-2xl font-bold text-blue-600">
              {gaze.score ?? 0}
              <span className="text-sm text-muted">점</span>
            </span>
          </div>

          <div className="mb-4 flex flex-wrap justify-center gap-4">
            <StatBox
              label="정면 응시율"
              value={`${Number(gaze.centerRatio ?? 0).toFixed(1)}%`}
            />

            <StatBox
              label="시선 이탈 비율"
              value={`${Number(gaze.gazeAwayRatio ?? 0).toFixed(1)}%`}
              isWarning={Number(gaze.gazeAwayRatio ?? 0) > 20}
            />

            <StatBox
              label="시선 이탈 횟수"
              value={`${gaze.gazeAwayCount ?? 0}회`}
              isWarning={Number(gaze.gazeAwayCount ?? 0) >= 5}
            />
          </div>

          <p className="rounded-xl border border-black/5 bg-slate-50 p-3 text-center text-xs font-medium leading-relaxed text-muted dark:bg-slate-800/50">
            {gaze.feedback ||
              gaze.evaluation ||
              "시선 분석 결과가 없습니다."}
          </p>
        </div>
      )}

      {eye && (
        <div className="rounded-[24px] border border-black/[0.04] bg-white p-6 shadow-sm dark:border-white/[0.04] dark:bg-[#1e293b]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300">
                <Eye className="h-4 w-4" />
              </div>

              <h4 className="text-base font-bold text-navy dark:text-white">
                눈 깜빡임 분석
              </h4>
            </div>

            <span className="text-2xl font-bold text-cyan-600">
              {eye.score ?? 0}
              <span className="text-sm text-muted">점</span>
            </span>
          </div>

          <div className="mb-4 flex flex-wrap justify-center gap-4">
            <StatBox
              label="분당 깜빡임(BPM)"
              value={`${Number(eye.blinkRate ?? 0).toFixed(1)}회`}
              isWarning={Number(eye.blinkRate ?? 0) > 35}
            />

            <StatBox
              label="총 깜빡임 횟수"
              value={`${eye.blinkCount ?? 0}회`}
            />

            <StatBox
              label="영상 길이"
              value={
                pose?.totalDuration != null
                  ? `${Math.round(pose.totalDuration)}초`
                  : "-"
              }
            />
          </div>

          <p className="rounded-xl border border-black/5 bg-slate-50 p-3 text-center text-xs font-medium leading-relaxed text-muted dark:bg-slate-800/50">
            {eye.feedback || "눈 깜빡임 분석 결과가 없습니다."}
          </p>
        </div>
      )}

      {pose && (
        <div className="rounded-[24px] border border-black/[0.04] bg-white p-6 shadow-sm dark:border-white/[0.04] dark:bg-[#1e293b]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                <UserSquare2 className="h-4 w-4" />
              </div>

              <h4 className="text-base font-bold text-navy dark:text-white">
                자세 안정성 분석
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                {pose.grade || "-"} Grade
              </span>

              <span className="text-2xl font-bold text-indigo-600">
                {pose.score ?? 0}
                <span className="text-sm text-muted">점</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <StatBox
              label="전체 불안정 비율"
              value={`${Number((pose.badRatio ?? 0) * 100).toFixed(1)}%`}
              isWarning={Number(pose.badRatio ?? 0) > 0.3}
            />

            <StatBox
              label="어깨 흔들림 (횟수/시간)"
              value={`${pose.shoulderBadCount ?? 0}회 / ${Number(
                pose.shoulderBadDuration ?? 0
              ).toFixed(1)}초`}
            />

            <StatBox
              label="얼굴 이탈 (횟수/시간)"
              value={`${pose.faceBadCount ?? 0}회 / ${Number(
                pose.faceBadDuration ?? 0
              ).toFixed(1)}초`}
            />

            <StatBox
              label="총 불안정 감지 횟수"
              value={`${pose.badCount ?? 0}회`}
            />

            <StatBox
              label="총 불안정 지속 시간"
              value={`${Number(pose.badDuration ?? 0).toFixed(1)}초`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  isWarning?: boolean;
}

function StatBox({
  label,
  value,
  isWarning = false,
}: StatBoxProps) {
  return (
    <div
      className={`flex min-w-[140px] max-w-[240px] flex-1 flex-col items-center justify-center rounded-xl border p-4 text-center ${
        isWarning
          ? "border-red-100 bg-red-50/50 dark:border-red-900/40 dark:bg-red-900/20"
          : "border-black/5 bg-white dark:border-white/5 dark:bg-slate-800/50"
      }`}
    >
      <span className="mb-1.5 text-[11px] font-bold text-slate-500">
        {label}
      </span>

      <span
        className={`text-base font-bold ${
          isWarning
            ? "text-red-600 dark:text-red-400"
            : "text-navy dark:text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}