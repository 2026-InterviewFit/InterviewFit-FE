"use client";

interface RadarChartProps {
  eyeScore?: number;
  poseScore?: number;
  speechScore?: number;
}

// 실제로 측정 가능한 3개 지표만 사용합니다.
// (논리성/음량분석 등은 백엔드가 별도 점수를 내려주지 않아 제외했습니다.
//  나중에 해당 데이터가 생기면 이 배열에 축을 추가하면 됩니다.)
const AXES = [
  { label: "시선/표정", angle: -90 },
  { label: "발화 안정성", angle: 30 },
  { label: "자세 안정", angle: 150 },
];

const CENTER = 110;
const MAX_RADIUS = 80;
const MIN_RADIUS = 14; // 점수 0이어도 점 하나로 뭉개지지 않도록 하는 최소 반지름

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
  // AXES 순서(시선/표정, 발화 안정성, 자세 안정)와 정확히 맞춰서 배열 구성
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

        {/* 🔑 실제 점수 기반 다각형 (더 이상 고정값 아님) */}
        <polygon points={dataPolygon} fill="rgba(37, 99, 235, 0.15)" stroke="#2563eb" strokeWidth="2" />

        {/* 각 축 끝점 강조 점 */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#2563eb" />
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