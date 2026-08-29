// app/mypage/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Calendar, Play, Trash2, X, UserCheck, Monitor, Users } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ReportDetailView from "@/components/dashboard/ReportDetailView";
import InterviewTabs from "@/components/dashboard/InterviewTabs";
import PtReportDetail from "@/components/dashboard/pt/PtReportDetail";
import { useCounter } from "@/hooks/useCounter";
import { useDashboard } from "@/hooks/useDashboard";
import { GROUP_ANALYSIS_STATUS_LABEL, getGroupAnalysisStatusClassName } from "@/lib/groupInterviewDashboard";
import { formatKoreanDate, formatKoreanDateTime, getOverallScore, getStatusClassName, getReportStatusLabel, getRecordDate, getRecordJobName } from "@/lib/reportUtils";
import type { PtReport } from "@/types/ptInterview";
import type { InterviewKind } from "@/lib/interviewHistoryStore";

function AnimatedScore({ score }: { score: number }) {
  const animatedValue = useCounter({ target: score, duration: 1200 });
  return <>{animatedValue}</>;
}

const KIND_BADGE: Record<InterviewKind, { label: string; bg: string; fg: string }> = {
  single: { label: "1:1 면접", bg: "rgba(55,138,221,0.12)", fg: "#0C447C" },
  group: { label: "그룹 면접", bg: "rgba(29,158,117,0.12)", fg: "#0F6E56" },
  pt: { label: "PT 면접", bg: "rgba(83,74,183,0.12)", fg: "#3C3489" },
};

export default function DashboardPage() {
  const router = useRouter();
  
  const {
    activeTab, setActiveTab, sortOrder, setSortOrder, checkedIds, toggleCheck, handleBulkDelete,
    counts, sortedSingle, sortedPtGroup, sortedGroup, showSingle, showPt, showGroup,
    isGroupLoading, groupError, deleteSingle, deletePtGroup, singleRecords
  } = useDashboard();

  // 순수 UI 상태만 관리
  const [selectedSingleId, setSelectedSingleId] = useState<number | null>(null);
  const [selectedPtGroupId, setSelectedPtGroupId] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // ── 상세 화면: 1:1 ──
  const selectedSingle = sortedSingle.find(r => r.interviewId === selectedSingleId);
  if (selectedSingle) {
    const roundLabel = `${singleRecords.length - singleRecords.findIndex(r => r.interviewId === selectedSingle.interviewId)}회차`;
    return (
      <DashboardLayout>
        <main className="flex w-full flex-col px-6 pb-32 pt-6 lg:px-10 lg:pt-10">
          <ReportDetailView
            record={selectedSingle} roundLabel={roundLabel}
            onBack={() => setSelectedSingleId(null)}
            onDelete={(id) => { if(window.confirm("기록을 삭제하시겠습니까?")) { deleteSingle(id); setSelectedSingleId(null); } }}
            onStartNew={() => setIsNewModalOpen(true)}
          />
        </main>
      </DashboardLayout>
    );
  }

  // ── 상세 화면: PT ──
  const selectedPtGroup = sortedPtGroup.find(r => r.id === selectedPtGroupId);
  if (selectedPtGroup) {
    // 1. PT 면접 렌더링
    if (selectedPtGroup.kind === "pt" && selectedPtGroup.detail) {
      return (
        <DashboardLayout>
          <main className="px-6 pb-32 pt-6 lg:px-10 lg:pt-10">
            <PtReportDetail
              title={selectedPtGroup.title} jobName={selectedPtGroup.jobName} roundLabel={selectedPtGroup.roundLabel} savedAt={selectedPtGroup.savedAt} report={selectedPtGroup.detail as PtReport}
              onBack={() => setSelectedPtGroupId(null)}
              onDelete={() => {if (window.confirm("기록을 삭제하시겠습니까?")) {deletePtGroup(selectedPtGroup.id);setSelectedPtGroupId(null);}}}
            />
          </main>
        </DashboardLayout>
      );
    }
    
    // detail이 없는 과거 PT 데이터 폴백
    return (
      <DashboardLayout>
        <main className="px-6 pb-32 pt-6 lg:px-10 lg:pt-10">
          <button onClick={() => setSelectedPtGroupId(null)} className="mb-6 text-sm font-bold text-muted hover:text-ink">← 목록으로</button>
          <div className="rounded-[24px] border border-line bg-surface p-10 text-center shadow-sm dark:bg-[#1e293b] dark:border-white/10">
            <span className="inline-block rounded-full px-3 py-1 text-[11px] font-bold" style={{ backgroundColor: KIND_BADGE[selectedPtGroup.kind].bg, color: KIND_BADGE[selectedPtGroup.kind].fg }}>
              {KIND_BADGE[selectedPtGroup.kind].label} · {selectedPtGroup.roundLabel}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-navy dark:text-white">{selectedPtGroup.title}</h2>
            <p className="mt-2 text-sm text-muted">{selectedPtGroup.jobName} 직무 · 종합 {selectedPtGroup.overallScore}점</p>
            <p className="mt-6 text-xs text-muted">분석 데이터가 없는 과거 기록입니다.</p>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  // ── 메인 목록 화면 ──
  return (
    <DashboardLayout>
      <main className="relative flex w-full flex-col px-6 pb-32 pt-6 lg:px-10 lg:pt-10">
        <div className="flex w-full animate-in flex-col fade-in duration-300">
          {/* 헤더 */}
          <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-navy dark:text-white">면접 분석 히스토리</h2>
              <p className="mt-2 text-sm text-muted dark:text-gray-400">면접 종류별로 회차를 선택해 상세 분석을 확인하세요.</p>
            </div>
            <button onClick={() => setIsNewModalOpen(true)} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:bg-navy-dark hover:scale-[1.02]">
              <Video className="h-4 w-4" /> 새 면접 시작하기
            </button>
          </div>

          <div className="mt-8">
            <InterviewTabs active={activeTab} counts={counts} onChange={setActiveTab} />
          </div>

          {/* 유틸바 (삭제 & 정렬) */}
          <div className="mt-6 flex w-full items-center justify-between border-b border-line pb-4 dark:border-white/10">
            <div className="flex items-center gap-2 min-h-[32px]">
              <AnimatePresence>
                {checkedIds.length > 0 && (
                  <motion.button 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onClick={handleBulkDelete} 
                    className="flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100 transition-colors border border-red-100 dark:border-red-900/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> 선택 삭제 ({checkedIds.length})
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
              <button onClick={() => setSortOrder("desc")} className={sortOrder === "desc" ? "font-bold text-blue-600" : "text-muted hover:text-ink"}>최신순</button>
              <span className="text-line dark:text-white/10">|</span>
              <button onClick={() => setSortOrder("asc")} className={sortOrder === "asc" ? "font-bold text-blue-600" : "text-muted hover:text-ink"}>오래된순</button>
            </div>
          </div>

          {/* 카드 목록 */}
          <div className="mt-6 flex w-full flex-col gap-4">
            {activeTab !== "group" && !isGroupLoading && !groupError && ((showSingle ? sortedSingle.length : 0)
              + (showPt ? sortedPtGroup.length : 0)
              + (showGroup ? sortedGroup.length : 0)) === 0 && (
              <div className="flex flex-col items-center justify-center rounded-[32px] border border-line bg-white px-8 py-20 text-center shadow-sm dark:border-white/[0.02] dark:bg-[#1e293b]/60">
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} className="relative mb-6 h-32 w-32">
                  <Image src="/3d-computer.png" alt="Empty" fill className="object-contain drop-shadow-lg" />
                </motion.div>
                <h3 className="mb-2 text-xl font-bold tracking-tight text-navy dark:text-white">아직 이 종류의 기록이 없어요!</h3>
                <p className="text-sm font-medium text-muted dark:text-gray-400">면접을 진행하고 리포트를 저장하면 여기에 회차별로 쌓입니다.</p>
              </div>
            )}

            {/* 1:1 리스트 */}
            {showSingle && sortedSingle.map((record, index) => {
              const roundLabel = `${sortOrder === "desc" ? sortedSingle.length - index : index + 1}회차`;
              const recordScore = getOverallScore(record.report);
              const stringId = String(record.interviewId);
              
              return (
                <div key={`single_${stringId}`} className="flex items-center gap-4 w-full group">
                  <input type="checkbox" checked={checkedIds.includes(stringId)} onChange={() => toggleCheck(stringId)} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ml-2" />
                  <div className="flex flex-1 items-center justify-between rounded-[24px] bg-white dark:bg-[#1e293b] p-6 border border-line dark:border-white/10 shadow-sm cursor-pointer transition-all hover:-translate-y-1 hover:border-blue-300" onClick={() => setSelectedSingleId(record.interviewId)}>
                    <div className="flex items-center gap-5">
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-slate-50 dark:bg-[#0f1729] border border-line">
                        <span className="text-[9px] font-medium text-muted">회차</span>
                        <span className="text-sm font-bold text-navy dark:text-white">{roundLabel}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
                          <Calendar className="h-3.5 w-3.5" />{formatKoreanDate(getRecordDate(record))}
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: KIND_BADGE.single.bg, color: KIND_BADGE.single.fg }}>1:1 면접</span>
                          <span className={getStatusClassName(record)}>{getReportStatusLabel(record)}</span>
                        </div>
                        <h3 className="mt-1.5 text-base font-bold text-ink dark:text-white line-clamp-1 group-hover:text-blue-600">{formatKoreanDate(getRecordDate(record))} {roundLabel} 면접영상 분석 결과</h3>
                        <p className="mt-1 text-xs text-muted font-medium">{getRecordJobName(record)} 직무 대비 모의면접</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-[11px] font-medium text-muted">종합 점수</p>
                        <p className="text-2xl font-bold text-navy dark:text-white">{typeof recordScore === "number" ? <AnimatedScore score={Math.round(recordScore)} /> : "-"}<span className="text-sm font-medium">점</span></p>
                      </div>
                      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-navy hover:bg-blue-100 border border-line dark:border-none">
                        <Play className="h-4 w-4 pl-0.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {showGroup && isGroupLoading && (
              <div className="rounded-[24px] border border-line bg-white p-8 text-center text-sm font-bold text-muted dark:border-white/10 dark:bg-[#1e293b]">
                그룹 면접 기록을 불러오는 중입니다.
              </div>
            )}

            {showGroup && groupError && (
              <div className="rounded-[24px] border border-red-200 bg-red-50 p-8 text-center text-sm font-bold text-red-600">
                {groupError}
              </div>
            )}

            {/* 그룹 면접: 백엔드 /me/history */}
            {showGroup && sortedGroup.map((record) => (
              <div key={`group_${record.roomId}`} className="flex w-full items-center gap-4 group">
                <div
                  onClick={() => router.push(`/mypage/dashboard/group/${record.roomId}`)}
                  className="flex flex-1 cursor-pointer items-center justify-between rounded-[24px] border border-line bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-300 dark:border-white/10 dark:bg-[#1e293b]"
                >
                  <div className="flex min-w-0 items-center gap-5">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border border-line bg-slate-50 dark:bg-[#0f1729]">
                      <span className="text-[9px] font-medium text-muted">참가자</span>
                      <span className="text-sm font-bold text-navy dark:text-white">{record.participantCount}명</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatKoreanDate(record.endedAt ?? record.startedAt ?? undefined)}
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: KIND_BADGE.group.bg, color: KIND_BADGE.group.fg }}>그룹 면접</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getGroupAnalysisStatusClassName(record.analysisStatus)}`}>
                          {GROUP_ANALYSIS_STATUS_LABEL[record.analysisStatus]}
                        </span>
                      </div>
                      <h3 className="mt-1.5 line-clamp-1 text-base font-bold text-ink group-hover:text-emerald-600 dark:text-white">{record.title}</h3>
                      <p className="mt-1 text-xs font-medium text-muted">
                        {[record.jobCategory, record.jobName].filter(Boolean).join(" · ") || "직무 미지정"}
                        {` · 내 답변 ${record.totalAnswers}개 · 분석 완료 ${record.completedAnalyses}/${record.totalAnswers}`}
                        {record.failedAnalyses > 0 ? ` · 분석 실패 ${record.failedAnalyses}개` : ""}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-muted">
                        {formatKoreanDateTime(record.startedAt)} → {formatKoreanDateTime(record.endedAt)}
                      </p>
                    </div>
                  </div>
                  <button type="button" aria-label="그룹 면접 상세 보기" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-slate-50 text-navy hover:bg-emerald-100 dark:border-none">
                    <Play className="h-4 w-4 pl-0.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}

            {showGroup && !isGroupLoading && !groupError && sortedGroup.length === 0 && activeTab === "group" && (
              <div className="rounded-[24px] border border-line bg-white p-10 text-center text-sm font-bold text-muted dark:border-white/10 dark:bg-[#1e293b]">
                완료된 다대일 면접 기록이 없습니다.
              </div>
            )}

            {/* PT 리스트 */}
            {showPt && sortedPtGroup.map((record) => {
              const badge = KIND_BADGE[record.kind];
              return (
                <div key={record.id} className="flex items-center gap-4 w-full group">
                  <input type="checkbox" checked={checkedIds.includes(record.id)} onChange={() => toggleCheck(record.id)} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ml-2" />
                  <div onClick={() => setSelectedPtGroupId(record.id)} className="flex flex-1 cursor-pointer items-center justify-between rounded-[24px] border border-line bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 dark:bg-[#1e293b] dark:border-white/10">
                    <div className="flex items-center gap-5">
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border border-line bg-slate-50 dark:bg-[#0f1729]">
                        <span className="text-[9px] font-medium text-muted">회차</span>
                        <span className="text-sm font-bold text-navy dark:text-white">{record.roundLabel}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
                          <Calendar className="h-3.5 w-3.5" />{new Date(record.savedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: badge.bg, color: badge.fg }}>{badge.label}</span>
                        </div>
                        <h3 className="mt-1.5 line-clamp-1 text-base font-bold text-ink dark:text-white group-hover:text-blue-600">{record.title}</h3>
                        <p className="mt-1 text-xs font-medium text-muted">{record.jobName} 직무 대비 모의면접</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-6">
                      <div className="hidden text-right sm:block">
                        <p className="text-[11px] font-medium text-muted">종합 점수</p>
                        <p className="text-2xl font-bold text-navy dark:text-white"><AnimatedScore score={Math.round(record.overallScore)} /><span className="text-sm font-medium">점</span></p>
                      </div>
                      <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-slate-50 text-navy hover:bg-blue-100 dark:border-none">
                        <Play className="h-4 w-4 pl-0.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 모달 ── */}
        <AnimatePresence>
          {isNewModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm" onClick={() => setIsNewModalOpen(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-[28px] border border-line bg-surface p-8 shadow-2xl dark:bg-[#1e293b] dark:border-white/10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-navy dark:text-white tracking-tight">어떤 면접을 연습할까요?</h3>
                  <button onClick={() => setIsNewModalOpen(false)} className="rounded-full p-2 text-muted hover:bg-chip hover:text-ink"><X className="h-5 w-5" /></button>
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={() => router.push("/interview")} className="group flex items-center gap-5 rounded-2xl border border-line p-5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50/50 dark:border-white/10 dark:bg-[#0f1729]/50">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white"><UserCheck className="h-6 w-6" /></div>
                    <div><h4 className="text-base font-bold text-ink dark:text-white mb-1">1:1 AI 모의면접</h4><p className="text-sm font-medium text-muted">이력서와 직무를 분석한 맞춤형 꼬리 질문 대비</p></div>
                  </button>
                  <button onClick={() => router.push("/pt-interview")} className="group flex items-center gap-5 rounded-2xl border border-line p-5 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-white/10 dark:bg-[#0f1729]/50">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white"><Monitor className="h-6 w-6" /></div>
                    <div><h4 className="text-base font-bold text-ink dark:text-white mb-1">PT 면접</h4><p className="text-sm font-medium text-muted">화면 공유를 통한 발표 논리 및 비언어적 역량 점검</p></div>
                  </button>
                  <button onClick={() => router.push("/group-interview")} className="group flex items-center gap-5 rounded-2xl border border-line p-5 text-left transition-all hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50/50 dark:border-white/10 dark:bg-[#0f1729]/50">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white"><Users className="h-6 w-6" /></div>
                    <div><h4 className="text-base font-bold text-ink dark:text-white mb-1">다대일 그룹 면접</h4><p className="text-sm font-medium text-muted">다른 지원자들과 함께 참여하는 실전 화상 대기실 환경</p></div>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </DashboardLayout>
  );
}
