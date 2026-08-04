// components/dashboard/group/GroupReportDetail.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Trash2, ThumbsUp, AlertTriangle, Target, Users, MessageSquareQuote, Ear } from "lucide-react";
import type { GroupReport } from "@/lib/groupInterviewData";
import { useCounter } from "@/hooks/useCounter";

interface GroupReportDetailProps {
  title: string;
  jobName: string;
  roundLabel: string;
  savedAt: string;
  report: GroupReport;
  onBack: () => void;
  onDelete: () => void;
}

function AnimatedScore({ score }: { score: number }) {
  const animatedValue = useCounter({ target: score, duration: 1200 });
  return <>{animatedValue}</>;
}

// 레이더 지오메트리
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

export default function GroupReportDetail({
  title, jobName, roundLabel, savedAt, report, onBack, onDelete
}: GroupReportDetailProps) {
  const axes = report.radar.map((_, i) => -90 + (360 / report.radar.length) * i);
  const dataPolygon = report.radar.map((m, i) => `${radarPoint(axes[i], m.score).x},${radarPoint(axes[i], m.score).y}`).join(" ");
  const outerPolygon = axes.map((a) => `${outer(a, MAX_R).x},${outer(a, MAX_R).y}`).join(" ");
  
  const dateLabel = new Date(savedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="flex flex-col w-full animate-in slide-in-from-right-4 duration-300">
      {/* ── 상단 네비게이션 ── */}
      <div className="flex items-center justify-between w-full mb-6">
        <button onClick={onBack} className="flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-4 w-4 text-muted" /> 목록으로 돌아가기
        </button>
        <button onClick={onDelete} className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-500 shadow-sm transition-colors hover:bg-red-100">
          <Trash2 className="h-4 w-4" /> 기록 삭제
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
        {/* 1. 좌측 영역 (7칸 차지) */}
        <div className="xl:col-span-7 flex flex-col gap-6 w-full">
          {/* 종합 요약 카드 */}
          <div className="rounded-[32px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.04] dark:border-white/[0.04]">
            <div className="flex items-center gap-3 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 w-fit px-3 py-1 rounded-full mb-4">
              다대일 그룹 면접 · {roundLabel}
            </div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-2xl font-bold text-navy dark:text-white leading-snug">
                  {title}<br />AI 진단 리포트
                </h3>
                <p className="mt-1 text-sm font-medium text-muted">{jobName} 직무 대비 그룹 면접 · {dateLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted mb-1">종합 점수</p>
                <div className="text-4xl font-bold text-emerald-600">
                  <AnimatedScore score={Math.round(report.score.overall)} /><span className="text-lg text-muted">%</span>
                </div>
              </div>
            </div>

            {/* 5가지 핵심 지표 */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5 mb-8 border-y border-line/50 dark:border-white/10 py-6">
              {[
                { label: "발화/음성", value: report.score.speech },
                { label: "비언어", value: report.score.nonverbal },
                { label: "답변 내용", value: report.score.content },
                { label: "경청 태도", value: report.score.attitude, icon: <Ear className="inline-block w-3 h-3 ml-1 text-amber-500" /> },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center justify-center border-r border-line/50 dark:border-white/10 last:border-r-0">
                  <span className="text-[11px] font-bold text-muted mb-1">{s.label} {s.icon}</span>
                  <span className="text-2xl font-bold text-navy dark:text-white">
                    {s.value}<span className="text-sm font-medium text-muted">점</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center pt-2">
              <h4 className="text-sm font-bold text-navy dark:text-white w-full mb-6 text-center">그룹 면접 역량 레이더</h4>
              <svg viewBox="0 0 240 240" className="w-full max-w-[280px] overflow-visible drop-shadow-sm">
                <polygon points={outerPolygon} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                <motion.polygon
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: `${CENTER}px ${CENTER}px` }} points={dataPolygon}
                  fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2"
                />
                {report.radar.map((m, i) => {
                  const lp = outer(axes[i], MAX_R + 20);
                  return (
                    <text key={m.label} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 dark:fill-slate-400 text-[11px] font-bold">
                      {m.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* AI 종합 피드백 카드 */}
          <div className="rounded-[32px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.04] dark:border-white/[0.04]">
            <h4 className="text-base font-bold text-navy dark:text-white mb-6">AI 종합 피드백</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: <ThumbsUp className="h-5 w-5 text-emerald-500" />, title: "잘한 점", items: report.feedback.good, bg: "bg-emerald-50 dark:bg-emerald-900/10", border: "border-emerald-100 dark:border-emerald-900/30" },
                { icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, title: "개선이 필요한 점", items: report.feedback.improve, bg: "bg-amber-50 dark:bg-amber-900/10", border: "border-amber-100 dark:border-amber-900/30" },
                { icon: <Target className="h-5 w-5 text-indigo-500" />, title: "다음에 적용할 행동", items: report.feedback.nextAction, bg: "bg-indigo-50 dark:bg-indigo-900/10", border: "border-indigo-100 dark:border-indigo-900/30" },
              ].map((col) => (
                <div key={col.title} className={`rounded-2xl border ${col.border} ${col.bg} p-5`}>
                  <h5 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink dark:text-white">{col.icon} {col.title}</h5>
                  <ul className="space-y-3">
                    {col.items.map((t, idx) => (
                      <li key={idx} className="text-[13px] font-medium leading-relaxed text-muted dark:text-gray-300 break-keep">• {t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. 우측 영역 (랭킹 & 답변 카드, 5칸 차지, Sticky) */}
        <div className="xl:col-span-5 flex flex-col gap-6 w-full sticky top-6">
          
          {/* 참여자 비교 랭킹 (심플 막대 리스트) */}
          <div className="rounded-[32px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.04] dark:border-white/[0.04]">
            <h4 className="flex items-center gap-2 text-base font-bold text-navy dark:text-white mb-6">
              <Users className="h-5 w-5 text-blue-500" /> 그룹 내 성과 비교
            </h4>
            <div className="flex flex-col gap-3">
              {report.participants.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${
                    p.isMe 
                      ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" 
                      : "bg-white border-line dark:bg-[#0f1729] dark:border-white/10"
                  }`}
                >
                  <span className={`text-xl font-black w-6 text-center ${p.rank === 1 ? 'text-yellow-500' : p.rank === 2 ? 'text-slate-400' : 'text-amber-600'}`}>
                    {p.rank}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-bold text-sm ${p.isMe ? "text-blue-700 dark:text-blue-300" : "text-navy dark:text-white"}`}>
                        {p.name} {p.isMe && <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded bg-blue-200 text-blue-800">ME</span>}
                      </span>
                      <span className="text-sm font-bold">{p.overall}점</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full rounded-full ${p.isMe ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"}`}
                        initial={{ width: 0 }} animate={{ width: `${p.overall}%` }} transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 질문별 타임라인 */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-black/5 dark:border-white/5">
            <h5 className="font-bold text-base text-navy dark:text-white flex items-center gap-2 mb-5 shrink-0">
              <MessageSquareQuote className="h-5 w-5 text-indigo-500" /> 내 답변 요약 및 코멘트
            </h5>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-2 scrollbar-hide max-h-[400px]">
              {report.perQuestion.map((q, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-700/50 p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[11px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <p className="text-sm font-bold text-navy dark:text-white flex-1 leading-snug">{q.question}</p>
                    <span className="font-bold text-indigo-600 text-sm shrink-0">{q.score}점</span>
                  </div>
                  <div className="pl-9 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-muted mb-1">내 답변 요약</p>
                      <p className="text-xs font-medium text-ink dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#0f1729] p-3 rounded-lg border border-line/50 dark:border-white/5">
                        "{q.myAnswerSummary}"
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 mb-1">AI 코멘트</p>
                      <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        {q.aiComment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}