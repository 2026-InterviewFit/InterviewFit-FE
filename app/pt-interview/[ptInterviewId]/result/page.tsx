// app/pt-interview/[ptInterviewId]/result/page.tsx
"use client";

import { useState } from "react"; // 💡 에러 원인 해결: useState import 추가
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Save,
  LayoutDashboard,
  ThumbsUp,
  AlertTriangle,
  Target,
  Play,
  Eye,
  Clock,
  Activity,
} from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import { MOCK_PT_REPORT, formatSeconds } from "@/lib/ptInterviewData";
import { PALETTE } from "@/lib/communityData";
import { saveRecord } from "@/lib/interviewHistoryStore";
import { usePtInterviewStore } from "@/store/usePtInterviewStore";

// ── 간단 레이더 (기존 RadarChart 스타일, 5축) ──────────────
const CENTER = 120;
const MAX_R = 88;
const MIN_R = 14;
function radarPoint(angleDeg: number, score: number) {
  const clamped = Math.max(0, Math.min(100, score));
  const r = MIN_R + (clamped / 100) * (MAX_R - MIN_R);
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}
function outer(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

function ScoreCard({ label, value, primary }: { label: string; value: number; primary?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border p-5 text-center ${
        primary
          ? "border-transparent bg-navy text-white"
          : "border-line bg-surface text-ink"
      }`}
    >
      <span className={`text-[11px] font-bold ${primary ? "text-white/70" : "text-muted"}`}>
        {label}
      </span>
      <span className="mt-1 text-3xl font-bold">
        {value}
        <span className={`text-sm ${primary ? "text-white/60" : "text-muted"}`}>점</span>
      </span>
    </div>
  );
}

export default function PtResultPage() {
  const router = useRouter();
  const params = useParams();
  const ptInterviewId = params.ptInterviewId as string;
  const { meta } = usePtInterviewStore();
  const report = MOCK_PT_REPORT; // TODO: getPtReport 연동

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveRecord("pt", {
      id: ptInterviewId,
      title: meta?.topic ?? "PT 발표 면접",
      jobName: meta?.job ?? "직무 미지정",
      overallScore: report.score.overall,
      savedAt: new Date().toISOString(),
      detail: report, // PtReport 전체를 담아 상세에서 복원
    });
    setSaved(true);
  };

  const axes = report.radar.map((_, i) => -90 + (360 / report.radar.length) * i);
  const dataPolygon = report.radar
    .map((m, i) => {
      const p = radarPoint(axes[i], m.score);
      return `${p.x},${p.y}`;
    })
    .join(" ");
  const outerPolygon = axes.map((a) => {
    const p = outer(a, MAX_R);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <main className="relative flex min-h-screen flex-col bg-bg transition-colors duration-300 dark:bg-[#0f1729]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-[#E7F1A8]/30 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-[600px] w-[600px] rounded-full bg-[#95B1EE]/40 blur-[160px]" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pb-28 pt-32">
        <div className="mb-8">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-navy">
            PT Interview Report
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            PT 면접 종합 리포트
          </h1>
        </div>

        {/* 종합 점수 */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <ScoreCard label="종합 점수" value={report.score.overall} primary />
          <ScoreCard label="발표" value={report.score.presentation} />
          <ScoreCard label="질의응답" value={report.score.qna} />
          <ScoreCard label="비언어적" value={report.score.nonverbal} />
          <ScoreCard label="발표 내용" value={report.score.content} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 레이더 차트 */}
          <div className="rounded-[24px] border border-line bg-surface p-8 shadow-sm lg:col-span-5">
            <h3 className="mb-4 text-sm font-bold text-ink">역량별 레이더</h3>
            <div className="flex justify-center">
              <svg viewBox="0 0 240 240" className="w-full max-w-[280px] overflow-visible">
                <polygon points={outerPolygon} fill="none" stroke={PALETTE.chip ?? "#e2e8f0"} strokeWidth="1" />
                <motion.polygon
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
                  points={dataPolygon}
                  fill="rgba(54,76,132,0.18)"
                  stroke={PALETTE.navy}
                  strokeWidth="2"
                />
                {report.radar.map((m, i) => {
                  const lp = outer(axes[i], MAX_R + 20);
                  return (
                    <text
                      key={m.label}
                      x={lp.x}
                      y={lp.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-500 text-[10px] font-bold"
                    >
                      {m.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* 발표 역량 분석 */}
          <div className="rounded-[24px] border border-line bg-surface p-8 shadow-sm lg:col-span-7">
            <h3 className="mb-5 text-sm font-bold text-ink">발표 역량 분석</h3>
            <div className="flex flex-col gap-3.5">
              {report.presentation.map((item, i) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-semibold text-muted">
                    {item.label}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-chip">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: PALETTE.navy }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ delay: i * 0.08, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-bold text-ink">{item.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 음성 / 비언어 분석 */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
              <Activity className="h-4 w-4" style={{ color: PALETTE.navy }} /> 음성 분석
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {report.speech.map((s) => (
                <div
                  key={s.label}
                  className={`flex flex-col rounded-xl border p-3 ${
                    s.warning ? "border-red-100 bg-red-50/40" : "border-line bg-bg"
                  }`}
                >
                  <span className="text-[11px] font-bold text-muted">{s.label}</span>
                  <span className={`mt-1 text-sm font-bold ${s.warning ? "text-red-500" : "text-ink"}`}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
              <Eye className="h-4 w-4" style={{ color: PALETTE.navy }} /> 비언어적 분석
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {report.nonverbal.map((s) => (
                <div
                  key={s.label}
                  className={`flex flex-col rounded-xl border p-3 ${
                    s.warning ? "border-red-100 bg-red-50/40" : "border-line bg-bg"
                  }`}
                >
                  <span className="text-[11px] font-bold text-muted">{s.label}</span>
                  <span className={`mt-1 text-sm font-bold ${s.warning ? "text-red-500" : "text-ink"}`}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI 종합 피드백 */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
              <ThumbsUp className="h-4 w-4 text-emerald-500" /> 잘한 점
            </h4>
            <ul className="space-y-2">
              {report.feedback.good.map((t) => (
                <li key={t} className="text-xs font-medium leading-relaxed text-muted">• {t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> 개선이 필요한 점
            </h4>
            <ul className="space-y-2">
              {report.feedback.improve.map((t) => (
                <li key={t} className="text-xs font-medium leading-relaxed text-muted">• {t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
              <Target className="h-4 w-4 text-blue-500" /> 다음에 적용할 행동
            </h4>
            <ul className="space-y-2">
              {report.feedback.nextAction.map((t) => (
                <li key={t} className="text-xs font-medium leading-relaxed text-muted">• {t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 리플레이 & 타임라인 */}
        <div className="mt-6 rounded-[24px] border border-line bg-surface p-8 shadow-sm">
          <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-ink">
            <Play className="h-4 w-4" style={{ color: PALETTE.navy }} /> 발표 리플레이 & 타임라인
          </h3>
          <div className="mb-5 flex aspect-video w-full items-center justify-center rounded-2xl bg-[#0f172a]">
            <Play className="h-10 w-10 fill-white opacity-40" />
          </div>
          <div className="flex flex-col gap-2">
            {report.timeline.map((ev) => {
              const icon =
                ev.type === "gaze" ? <Eye className="h-3.5 w-3.5" /> :
                ev.type === "silence" ? <Clock className="h-3.5 w-3.5" /> :
                ev.type === "pace" ? <Activity className="h-3.5 w-3.5" /> :
                <AlertTriangle className="h-3.5 w-3.5" />;
              return (
                <button
                  key={`${ev.type}-${ev.atSeconds}`}
                  className="flex items-center justify-between rounded-xl border border-line bg-bg px-4 py-3 text-left transition-colors hover:border-navy/40"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span className="text-muted">{icon}</span> {ev.label}
                  </span>
                  <span
                    className="rounded-md px-2 py-0.5 text-[11px] font-bold"
                    style={{ backgroundColor: "rgba(149,177,238,0.18)", color: PALETTE.navy }}
                  >
                    ▶ {formatSeconds(ev.atSeconds)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.push("/pt-interview")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-surface py-4 text-sm font-bold text-ink shadow-sm transition-all hover:border-navy/40"
          >
            <RotateCcw className="h-4 w-4" /> 다시 면접하기
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-4 text-sm font-bold shadow-sm transition-all ${
              saved
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-line bg-surface text-ink hover:border-navy/40"
            }`}
          >
            <Save className="h-4 w-4" /> {saved ? "저장됨" : "리포트 저장"}
          </button>
          <button
            onClick={() => router.push("/mypage/dashboard")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy py-4 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-dark"
          >
            <LayoutDashboard className="h-4 w-4" /> 대시보드로 이동
          </button>
        </div>
      </div>
    </main>
  );
}