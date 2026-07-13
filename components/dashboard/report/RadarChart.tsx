"use client";

import { motion } from "framer-motion"; // 💡 애니메이션을 위해 추가

interface RadarChartProps {
  eyeScore?: number;
  poseScore?: number;
  speechScore?: number;
}

const AXES = [
  { label: "시선/표정", angle: -90 },
  { label: "발화 안정성", angle: 30 },
  { label: "자세 안정", angle: 150 },
];

const CENTER = 110;
const MAX_RADIUS = 80;
const MIN_RADIUS = 14; 

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

function getPoint(angleDeg: number, score: number) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = MIN_RADIUS + (clamped / 100) * (MAX_RADIUS - MIN_RADIUS);
  const rad = toRadians(angleDeg);
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function getOuterPoint(angleDeg: number, radius: number) {
  const rad = toRadians(angleDeg);
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

export default function RadarChart({ eyeScore = 0, poseScore = 0, speechScore = 0 }: RadarChartProps) {
  const scores = [eyeScore, speechScore, poseScore];

  const dataPoints = AXES.map((axis, i) => getPoint(axis.angle, scores[i]));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const outerPoints = AXES.map((axis) => getOuterPoint(axis.angle, MAX_RADIUS));
  const outerPolygon = outerPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const midPoints = AXES.map((axis) => getOuterPoint(axis.angle, MAX_RADIUS * 0.5));
  const midPolygon = midPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="relative flex w-full max-w-[220px] shrink-0 flex-col items-center mx-auto">
      <svg viewBox="0 0 220 220" className="w-full h-auto overflow-visible drop-shadow-sm">
        {/* 배경 그리드 */}
        <polygon points={outerPolygon} fill="none" stroke="#e2e8f0" strokeWidth="1" />
        <polygon points={midPolygon} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3" />

        {/* 중심에서 각 꼭짓점으로 이어지는 축선 */}
        {outerPoints.map((p, i) => (
          <line key={i} x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} stroke="#f1f5f9" strokeWidth="1" />
        ))}

        {/* 💡 애니메이션이 적용된 실제 점수 다각형! (중앙에서 퍼져나감) */}
        <motion.polygon 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
          points={dataPolygon} 
          fill="rgba(37, 99, 235, 0.15)" 
          stroke="#2563eb" 
          strokeWidth="2" 
        />

        {/* 💡 각 축 끝점 강조 점도 같이 나타나게! */}
        {dataPoints.map((p, i) => (
          <motion.circle 
            key={i} 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 + (i * 0.1), type: "spring" }}
            cx={p.x} cy={p.y} r="3" fill="#2563eb" 
          />
        ))}

        {/* 라벨 */}
        {AXES.map((axis) => {
          const labelPoint = getOuterPoint(axis.angle, MAX_RADIUS + 18);
          return (
            <text
              key={axis.label}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-bold fill-slate-500 dark:fill-slate-400"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}