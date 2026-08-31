"use client";

import { motion } from "framer-motion";
import RadarChart from "./RadarChart";
import { BarChart3 } from "lucide-react";
import { useCounter } from "@/hooks/useCounter"; 

interface OverviewVisualizerProps {
  eyeScore?: number;
  poseScore?: number;
  speechScore?: number;
}

// 💡 숫자를 개별적으로 굴리기 위한 미니 컴포넌트
function AnimatedBarScore({ score }: { score: number }) {
  const animatedValue = useCounter({ target: score, duration: 1500, delay: 200 });
  return <>{animatedValue}</>;
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
        <RadarChart eyeScore={eyeScore} poseScore={poseScore} speechScore={speechScore} />
      </div>

      <div className="flex-1 w-full flex flex-col justify-center">
        <h4 className="text-sm font-bold text-navy dark:text-white mb-4">상세 점수 분포</h4>
        <div className="flex flex-col gap-4">
          {scores.map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <span className="w-16 text-[11px] font-semibold text-slate-500">{s.label}</span>
              <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full rounded-full ${s.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.score || 0}%` }}
                  transition={{ delay: i * 0.2, duration: 1.5, ease: [0.22, 1, 0.36, 1] }} 
                />
              </div>
              <span className="w-8 text-right text-xs font-bold text-navy dark:text-white">
                <AnimatedBarScore score={Math.round(s.score || 0)} />점
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}