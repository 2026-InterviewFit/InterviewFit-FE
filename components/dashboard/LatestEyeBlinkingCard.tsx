"use client";

import { useEffect, useState } from "react";

type EyeBlinkingResult = {
  blink_count?: number;
  blink_rate?: number;
  blinks_per_minute?: number;
  score?: number;
  feedback?: string;
  evaluation?: string;
};

type StoredEyeBlinkingAnalysis = {
  message?: string;
  reportId?: number;
  result?: EyeBlinkingResult;
  savedAt?: string;
};

export default function LatestEyeBlinkingCard() {
  const [analysis, setAnalysis] = useState<StoredEyeBlinkingAnalysis | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("latestEyeBlinkingAnalysis");

    if (!raw) {
      return;
    }

    try {
      setAnalysis(JSON.parse(raw));
    } catch {
      localStorage.removeItem("latestEyeBlinkingAnalysis");
    }
  }, []);

  const result = analysis?.result;

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">눈 깜빡임 분석 결과</h2>

      {!result ? (
        <p className="mt-4 text-sm text-gray-500">
          아직 저장된 눈 깜빡임 분석 결과가 없습니다.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">깜빡임 횟수</p>
              <p className="mt-1 text-2xl font-bold">
                {result.blink_count ?? "-"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">분당 깜빡임</p>
              <p className="mt-1 text-2xl font-bold">
                {result.blink_rate ?? result.blinks_per_minute ?? "-"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">점수</p>
              <p className="mt-1 text-2xl font-bold">
                {result.score ?? "-"}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">피드백</p>
            <p className="mt-1 text-sm">
              {result.feedback ?? result.evaluation ?? analysis.message ?? "분석 결과가 저장되었습니다."}
            </p>
          </div>

          {analysis.savedAt && (
            <p className="text-xs text-gray-400">
              저장 시간: {new Date(analysis.savedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
