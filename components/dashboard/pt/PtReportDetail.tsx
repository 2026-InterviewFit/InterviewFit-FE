// components/dashboard/pt/PtReportDetail.tsx
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, Activity, Eye, ThumbsUp, AlertTriangle, Target, Play, Clock, ListVideo } from "lucide-react";
import type { PtReport } from "@/types/ptInterview";
import { PALETTE } from "@/lib/communityData";
import MirroredVideoPlayer, { MirroredVideoPlayerHandle } from "../report/MirroredVideoPlayer";
import { useCounter } from "@/hooks/useCounter";

interface PtReportDetailProps {
  title: string;
  jobName: string;
  roundLabel: string;
  savedAt: string;
  report: PtReport;
  onBack: () => void;
  onDelete: () => void;
}

// ── 애니메이션 숫자 헬퍼 ──
function AnimatedScore({ score }: { score: number }) {
  const animatedValue = useCounter({ target: score, duration: 1200 });
  return <>{animatedValue}</>;
}

// ── 레이더 지오메트리 ──
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

export default function PtReportDetail({
  title,
  jobName,
  roundLabel,
  savedAt,
  report,
  onBack,
  onDelete,
}: PtReportDetailProps) {
  // 영상 재생 상태 관리
  const [activePlaybackTime, setActivePlaybackTime] = useState(0);
  const playerRef = useRef<MirroredVideoPlayerHandle>(null);

  // 레이더 차트 포인트 계산
  const axes = report.radar.map((_, i) => -90 + (360 / report.radar.length) * i);
  const dataPolygon = report.radar.map((m, i) => `${radarPoint(axes[i], m.score).x},${radarPoint(axes[i], m.score).y}`).join(" ");
  const outerPolygon = axes.map((a) => `${outer(a, MAX_R).x},${outer(a, MAX_R).y}`).join(" ");

  const dateLabel = new Date(savedAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
  });

  // 타임스탬프 포맷 (초 -> MM:SS)
  const formatTimestamp = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 타임라인 클릭 시 영상 이동
  const handleJumpToTimeline = (seconds: number) => {
    playerRef.current?.seekTo(seconds);
  };

  // 현재 재생 시간에 맞는 타임라인 인덱스 계산
  const activeTimelineIndex = report.timeline.length > 0
    ? report.timeline.reduce((activeIdx, ev, idx) => (ev.atSeconds <= activePlaybackTime ? idx : activeIdx), -1)
    : -1;

  // 💡 백엔드 연동 전까지 데모 환경에서는 영상을 비워두거나 더미를 쓸 수 있습니다.
  const selectedVideoUrl = (report as any).videoObjectKey ? `/api/videos/stream?objectKey=${(report as any).videoObjectKey}` : "";

  return (
    <div className="flex flex-col w-full animate-in slide-in-from-right-4 duration-300">
      {/* ── 상단 네비게이션 ── */}
      <div className="flex items-center justify-between w-full mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted" /> 목록으로 돌아가기
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-500 shadow-sm transition-colors hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" /> 기록 삭제
        </button>
      </div>

      {/* ── 7:5 레이아웃 컨테이너 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
        
        {/* 1. 좌측 영역 (상세 리포트, 7칸 차지) */}
        <div className="xl:col-span-7 flex flex-col gap-6 w-full">
          
          {/* 종합 요약 카드 */}
          <div className="rounded-[32px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.04] dark:border-white/[0.04]">
            <div className="flex items-center gap-3 text-sm font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 w-fit px-3 py-1 rounded-full mb-4">
              PT 면접 · {roundLabel}
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-2xl font-bold text-navy dark:text-white leading-snug">
                  {title}<br />AI 진단 리포트
                </h3>
                <p className="mt-1 text-sm font-medium text-muted">{jobName} 직무 대비 발표 면접 · {dateLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted mb-1">종합 점수</p>
                <div className="text-4xl font-bold text-indigo-600">
                  <AnimatedScore score={Math.round(report.score.overall)} /><span className="text-lg text-muted">%</span>
                </div>
              </div>
            </div>

            {/* 세부 4가지 점수 요약 */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-8 border-y border-line/50 dark:border-white/10 py-6">
              {[
                { label: "발표 역량", value: report.score.presentation },
                { label: "질의응답", value: report.score.qna },
                { label: "비언어(시선/자세)", value: report.score.nonverbal },
                { label: "내용 구조", value: report.score.content },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center justify-center border-r border-line/50 dark:border-white/10 last:border-r-0">
                  <span className="text-[11px] font-bold text-muted mb-1">{s.label}</span>
                  <span className="text-2xl font-bold text-navy dark:text-white">
                    {s.value}<span className="text-sm font-medium text-muted">점</span>
                  </span>
                </div>
              ))}
            </div>

            {/* 레이더 차트 & 발표 역량 분석 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
              <div className="flex flex-col items-center border-r-0 lg:border-r border-line/50 dark:border-white/10 pr-0 lg:pr-8">
                <h4 className="text-sm font-bold text-navy dark:text-white w-full mb-6">역량 밸런스</h4>
                <svg viewBox="0 0 240 240" className="w-full max-w-[240px] overflow-visible drop-shadow-sm">
                  <polygon points={outerPolygon} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                  <motion.polygon
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: `${CENTER}px ${CENTER}px` }} points={dataPolygon}
                    fill="rgba(79, 70, 229, 0.15)" stroke="#4f46e5" strokeWidth="2"
                  />
                  {report.radar.map((m, i) => {
                    const lp = outer(axes[i], MAX_R + 20);
                    return (
                      <text key={m.label} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 dark:fill-slate-400 text-[10px] font-bold">
                        {m.label}
                      </text>
                    );
                  })}
                </svg>
              </div>

              <div className="flex flex-col justify-center">
                <h4 className="text-sm font-bold text-navy dark:text-white mb-5">발표 상세 분석</h4>
                <div className="flex flex-col gap-4">
                  {report.presentation.map((item, i) => (
                    <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-[11px] font-semibold text-slate-500">{item.label}</span>
                      <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ delay: i * 0.1, duration: 1.5, ease: [0.22, 1, 0.36, 1] }} />
                      </div>
                      <span className="w-8 text-right text-xs font-bold text-navy dark:text-white">
                        <AnimatedScore score={item.score} />점
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI 종합 피드백 카드 */}
          <div className="rounded-[32px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.04] dark:border-white/[0.04]">
            <h4 className="text-base font-bold text-navy dark:text-white mb-6">AI 발표 종합 피드백</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: <ThumbsUp className="h-5 w-5 text-emerald-500" />, title: "잘한 점", items: report.feedback.good, bg: "bg-emerald-50 dark:bg-emerald-900/10", border: "border-emerald-100 dark:border-emerald-900/30" },
                { icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, title: "개선이 필요한 점", items: report.feedback.improve, bg: "bg-amber-50 dark:bg-amber-900/10", border: "border-amber-100 dark:border-amber-900/30" },
                { icon: <Target className="h-5 w-5 text-indigo-500" />, title: "다음에 적용할 행동", items: report.feedback.nextAction, bg: "bg-indigo-50 dark:bg-indigo-900/10", border: "border-indigo-100 dark:border-indigo-900/30" },
              ].map((col) => (
                <div key={col.title} className={`rounded-2xl border ${col.border} ${col.bg} p-5`}>
                  <h5 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink dark:text-white">
                    {col.icon} {col.title}
                  </h5>
                  <ul className="space-y-3">
                    {col.items.map((t, idx) => (
                      <li key={idx} className="text-[13px] font-medium leading-relaxed text-muted dark:text-gray-300 break-keep">
                        • {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 음성 & 비언어 상세 분석 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 음성 */}
            <div className="rounded-[32px] bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-black/[0.04] dark:border-white/[0.04]">
              <h4 className="mb-5 flex items-center gap-2 text-sm font-bold text-navy dark:text-white">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2 text-blue-600"><Activity className="h-4 w-4" /></div>
                음성 및 발화 분석
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {report.speech.map((s) => (
                  <div key={s.label} className={`flex flex-col rounded-xl border p-3.5 ${s.warning ? "border-red-100 bg-red-50/40 dark:bg-red-900/20" : "border-line bg-bg dark:bg-[#0f1729] dark:border-white/10"}`}>
                    <span className="text-[11px] font-bold text-muted mb-1">{s.label}</span>
                    <span className={`text-sm font-bold ${s.warning ? "text-red-500" : "text-ink dark:text-white"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 비언어 */}
            <div className="rounded-[32px] bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-black/[0.04] dark:border-white/[0.04]">
              <h4 className="mb-5 flex items-center gap-2 text-sm font-bold text-navy dark:text-white">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2 text-emerald-600"><Eye className="h-4 w-4" /></div>
                비언어적(시선/자세) 분석
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {report.nonverbal.map((s) => (
                  <div key={s.label} className={`flex flex-col rounded-xl border p-3.5 ${s.warning ? "border-red-100 bg-red-50/40 dark:bg-red-900/20" : "border-line bg-bg dark:bg-[#0f1729] dark:border-white/10"}`}>
                    <span className="text-[11px] font-bold text-muted mb-1">{s.label}</span>
                    <span className={`text-sm font-bold ${s.warning ? "text-red-500" : "text-ink dark:text-white"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* 2. 우측 영역 (비디오 & 타임라인, 5칸 차지, Sticky) */}
        <div className="xl:col-span-5 flex flex-col gap-6 w-full sticky top-6">
          <div className="rounded-[32px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.04] dark:border-white/[0.04] flex-1 flex flex-col max-h-[calc(100vh-48px)]">
            <h4 className="text-base font-bold text-navy dark:text-white mb-4">발표 영상 다시보기</h4>

            {/* 비디오 플레이어 */}
            <div className="mb-6 shrink-0">
              {selectedVideoUrl ? (
                <MirroredVideoPlayer
                  ref={playerRef}
                  src={selectedVideoUrl}
                  onTimeUpdate={setActivePlaybackTime}
                />
              ) : (
                <div className="aspect-video w-full rounded-2xl bg-[#0f172a] relative flex items-center justify-center overflow-hidden shadow-inner border border-white/5">
                  <Play className="h-10 w-10 fill-white opacity-20" />
                  <p className="absolute bottom-4 text-[10px] font-medium text-white/40">이 데모는 원본 영상이 포함되어 있지 않습니다.</p>
                </div>
              )}
            </div>
            
            {/* 타임라인 영역 (스크롤 가능하게 처리) */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-black/5 dark:border-white/5">
              <h5 className="font-bold text-sm text-navy dark:text-white flex items-center gap-2 mb-4 shrink-0">
                <ListVideo className="h-4 w-4 text-indigo-600" />
                분석 타임라인
              </h5>
              
              <div className="flex flex-col gap-2 overflow-y-auto pr-2 pb-2 scrollbar-hide">
                {report.timeline.map((ev, idx) => {
                  const isActive = idx === activeTimelineIndex;
                  const icon =
                    ev.type === "gaze" ? <Eye className="h-3.5 w-3.5" /> :
                    ev.type === "silence" ? <Clock className="h-3.5 w-3.5" /> :
                    ev.type === "pace" ? <Activity className="h-3.5 w-3.5" /> :
                    <AlertTriangle className="h-3.5 w-3.5" />;

                  return (
                    <button
                      key={`${ev.type}-${ev.atSeconds}-${idx}`}
                      type="button"
                      onClick={() => handleJumpToTimeline(ev.atSeconds)}
                      className={`relative text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                        isActive
                          ? "border-transparent" 
                          : "bg-white dark:bg-slate-700/50 border-black/5 dark:border-white/5 hover:border-indigo-300 hover:bg-indigo-50/50"
                      }`}
                    >
                      {/* Magic Motion 하이라이트 배경 */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTimelineBackground"
                          className="absolute inset-0 z-0 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                      
                      {/* 텍스트 컨텐츠 */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className={`flex items-center gap-2 text-[13px] font-semibold ${isActive ? "text-indigo-900 dark:text-indigo-100" : "text-ink dark:text-slate-200"}`}>
                          <span className={`${isActive ? "text-indigo-500" : "text-muted"}`}>{icon}</span>
                          {ev.label}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isActive ? "text-indigo-600 bg-indigo-100/50 dark:text-indigo-300 dark:bg-indigo-800/50" : "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                        }`}>
                          ▶ {formatTimestamp(ev.atSeconds)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}