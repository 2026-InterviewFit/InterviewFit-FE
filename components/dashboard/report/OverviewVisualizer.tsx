"use client";

import RadarChart from "./RadarChart";
import { BarChart3 } from "lucide-react";

interface OverviewVisualizerProps {
  eyeScore?: number;
  poseScore?: number;
  speechScore?: number;
}

export default function OverviewVisualizer({ eyeScore = 0, poseScore = 0, speechScore = 0 }: OverviewVisualizerProps) {
  const scores = [
    { label: "시선/표정", score: eyeScore, color: "bg-blue-500" },
    { label: "자세 안정", score: poseScore, color: "bg-indigo-500" },
    { label: "답변/발화", score: speechScore, color: "bg-sky-400" },
  ];

  return (
    <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-black/5 dark:border-white/5 pt-6">
      
      <div className="flex-1 w-full flex flex-col items-center border-r-0 md:border-r border-black/5 dark:border-white/5 pr-0 md:pr-8">
        <div className="flex items-center gap-1.5 w-full mb-4">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-navy dark:text-white">역량 밸런스</span>
        </div>
        {/* 🔑 실제 점수 전달 */}
        <RadarChart eyeScore={eyeScore} poseScore={poseScore} speechScore={speechScore} />
      </div>

      <div className="flex-1 w-full flex flex-col justify-center">
        <h4 className="text-sm font-bold text-navy dark:text-white mb-4">상세 점수 분포</h4>
        <div className="flex flex-col gap-4">
          {scores.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-16 text-[11px] font-semibold text-slate-500">{s.label}</span>
              <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${s.color} transition-all duration-1000 ease-out`} 
                  style={{ width: `${s.score || 0}%` }} 
                />
              </div>
              <span className="w-8 text-right text-xs font-bold text-navy dark:text-white">{Math.round(s.score || 0)}점</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}