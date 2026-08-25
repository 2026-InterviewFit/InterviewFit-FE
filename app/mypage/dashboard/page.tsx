"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image"; // 💡 빈 화면 3D 이미지를 위해 추가
import { motion } from "framer-motion"; // 💡 애니메이션을 위해 추가
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import InterviewRecording from "@/components/practice/InterviewRecording";
import ReportDetailView from "@/components/dashboard/ReportDetailView";
import { Video, Calendar, Play, SlidersHorizontal, Trash2, Menu, X } from "lucide-react";
import { getInterviewReport } from "@/lib/api";
import type { DashboardRecord } from "@/types";
import {
  loadInterviewHistory, formatKoreanDate, getOverallScore,
  getStatusClassName, getReportStatusLabel, getRecordDate, getRecordJobName
} from "@/lib/reportUtils";
import { useCounter } from "@/hooks/useCounter"; // 💡 점수 카운팅 애니메이션 훅 추가

// 💡 리스트 안에서 훅을 안전하게 사용하기 위한 미니 컴포넌트
function AnimatedScore({ score }: { score: number }) {
  const animatedValue = useCounter({ target: score, duration: 1200 });
  return <>{animatedValue}</>;
}

export default function DashboardPage() {
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [records, setRecords] = useState<DashboardRecord[]>([]);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  // 데이터 로드
  useEffect(() => {
    const history = loadInterviewHistory();
    setRecords(history);
    if (history.length === 0) return;

    let cancelled = false;
    Promise.all(
      history.map(async (record) => {
        try {
          const report = await getInterviewReport(record.interviewId);
          return { ...record, report };
        } catch (error) {
          return { ...record, reportError: error instanceof Error ? error.message : "분석 결과 조회 실패" };
        }
      })
    ).then((nextRecords) => {
      if (!cancelled) setRecords(nextRecords);
    });
    return () => { cancelled = true; };
  }, [isInterviewing]);

  // 주기적 폴링
  useEffect(() => {
    if (records.length === 0) return;
    const hasRunning = records.some(r => !r.report?.analysisStatus || r.report.analysisStatus === "RUNNING" || r.report.analysisStatus === "UPLOADED");
    if (!hasRunning) return;

    const interval = window.setInterval(async () => {
      const nextRecords = await Promise.all(
        records.map(async (record) => {
          const status = record.report?.analysisStatus;
          if (status === "DONE" || status === "FAILED") return record;
          try {
            const report = await getInterviewReport(record.interviewId);
            return { ...record, report, reportError: undefined };
          } catch (error) {
            return { ...record, reportError: "조회 실패" };
          }
        })
      );
      setRecords(nextRecords);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [records]);

  // 정렬
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const timeA = new Date(a.savedAt ?? 0).getTime();
      const timeB = new Date(b.savedAt ?? 0).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
  }, [records, sortOrder]);

  // 삭제 및 체크 로직
  const toggleCheck = (id: number) => setCheckedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const toggleCheckAll = () => setCheckedIds(checkedIds.length === records.length && records.length > 0 ? [] : records.map(r => r.interviewId));

  const handleBulkDelete = () => {
    if (checkedIds.length === 0) return;
    if (!window.confirm(`선택한 ${checkedIds.length}개의 기록을 삭제하시겠습니까?`)) return;

    const newRecords = records.filter(r => !checkedIds.includes(r.interviewId));
    setRecords(newRecords);
    localStorage.setItem("interviewAnalysisHistory", JSON.stringify(newRecords));
    setCheckedIds([]);
    if (selectedRecord && checkedIds.includes(selectedRecord)) setSelectedRecord(null);
  };

  const handleSingleDelete = (id: number) => {
    if (!window.confirm("정말 이 분석 기록을 삭제하시겠습니까?")) return;
    const newRecords = records.filter(r => r.interviewId !== id);
    setRecords(newRecords);
    localStorage.setItem("interviewAnalysisHistory", JSON.stringify(newRecords));
    setSelectedRecord(null);
  };

  const selectedRecordData = sortedRecords.find((r) => r.interviewId === selectedRecord);
  const selectedRound = selectedRecordData ? `${records.length - records.findIndex(r => r.interviewId === selectedRecordData.interviewId)}회차` : "-회차";

  if (isInterviewing) {
    return (
      <main className="fixed inset-0 z-[100] h-screen w-screen bg-black">
        <InterviewRecording onExit={() => setIsInterviewing(false)} />
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg font-sans text-ink relative transition-colors duration-300">
      <div className={`fixed inset-y-0 left-0 z-50 transform bg-white dark:bg-[#111827] transition-transform duration-300 lg:relative lg:translate-x-0 lg:shrink-0 ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar onMenuClick={() => setIsMobileSidebarOpen(false)} />
        <button className="absolute top-6 right-4 lg:hidden rounded-full p-2" onClick={() => setIsMobileSidebarOpen(false)}>
          <X className="h-5 w-5 text-muted" />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto w-full">
        <div className="flex items-center px-6 pt-6 lg:px-10 lg:pt-8 w-full">
          <button className="mr-4 lg:hidden p-2 -ml-2 rounded-lg" onClick={() => setIsMobileSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-navy dark:text-white" />
          </button>
          <div className="flex-1"><Topbar /></div>
        </div>

<main className="px-6 pb-32 pt-6 lg:px-10 lg:pt-10 flex flex-col w-full h-full">          {!selectedRecordData ? (
            <div className="flex flex-col w-full animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div>
                  <h2 className="text-2xl font-bold text-navy dark:text-white">면접 분석 히스토리</h2>
                  <p className="mt-2 text-sm text-muted dark:text-gray-400">촬영 회차의 분석 결과를 선택해 주세요.</p>
                </div>
                <button onClick={() => setIsInterviewing(true)} className="flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-navy-dark shrink-0">
                  <Video className="h-4 w-4" />새 면접 촬영하기
                </button>
              </div>

              <div className="mt-8 flex w-full items-center justify-between border-b border-line dark:border-white/10 pb-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={checkedIds.length === records.length && records.length > 0} onChange={toggleCheckAll} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"/>
                    <span className="text-sm font-bold text-navy dark:text-gray-300 group-hover:text-blue-600">전체 선택</span>
                  </label>
                  {checkedIds.length > 0 && (
                    <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1.5 rounded-lg animate-in fade-in">
                      <Trash2 className="w-4 h-4" /> 선택 삭제 ({checkedIds.length})
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <button onClick={() => setSortOrder("desc")} className={sortOrder === "desc" ? "text-blue-600 font-bold" : "text-muted hover:text-ink"}>최신순</button>
                  <span className="text-line dark:text-white/10">|</span>
                  <button onClick={() => setSortOrder("asc")} className={sortOrder === "asc" ? "text-blue-600 font-bold" : "text-muted hover:text-ink"}>오래된순</button>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 w-full">
                {/* 💡 4번 제안 적용: 비어있는 화면 3D 아이콘 둥둥 애니메이션 */}
                {sortedRecords.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-[32px] bg-white/60 dark:bg-[#1e293b]/60 py-20 px-8 text-center shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
                    <motion.div
                      animate={{ y: [0, -12, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      className="relative w-32 h-32 mb-6"
                    >
                      <Image src="/3d-computer.png" alt="Empty records" fill className="object-contain drop-shadow-lg" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-navy dark:text-white mb-2 tracking-tight">아직 면접 기록이 없어요!</h3>
                    <p className="text-sm text-muted dark:text-gray-400 font-medium">
                      우측 상단의 '새 면접 촬영하기' 버튼을 눌러 첫 모의면접을 시작해보세요.
                    </p>
                  </div>
                )}
                {sortedRecords.map((record, index) => {
                  const total = sortedRecords.length;
                  const roundNumber = sortOrder === "desc" ? total - index : index + 1;
                  const roundLabel = `${roundNumber}회차`;
                  const recordScore = getOverallScore(record.report);
                  const recordDate = formatKoreanDate(getRecordDate(record));

                  return (
                    <div key={record.interviewId} className="flex items-center gap-4 w-full group">
                      <input type="checkbox" checked={checkedIds.includes(record.interviewId)} onChange={() => toggleCheck(record.interviewId)} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ml-2" />
                      
                      {/* 💡 3번 제안 적용: Hover Glow Effect 및 부드러운 트랜지션 추가 */}
                      <div 
                        className="flex flex-1 items-center justify-between rounded-[24px] bg-white dark:bg-[#1e293b] p-6 border border-black/[0.02] dark:border-white/[0.02] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(37,99,235,0.12)] hover:border-blue-200 dark:hover:border-blue-800" 
                        onClick={() => setSelectedRecord(record.interviewId)}
                      >
                        <div className="flex items-center gap-5">
                          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-bg dark:bg-[#0f1729] border border-line">
                            <span className="text-[9px] font-medium text-muted">회차</span>
                            <span className="text-sm font-bold text-navy dark:text-white">{roundLabel}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
                              <Calendar className="h-3.5 w-3.5" />{recordDate}
                              <span className={getStatusClassName(record)}>{getReportStatusLabel(record)}</span>
                            </div>
                            <h3 className="mt-1.5 text-base font-bold text-ink dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {recordDate} {roundLabel} 면접영상 분석 결과
                            </h3>
                            <p className="mt-1 text-xs text-muted font-medium">{getRecordJobName(record)} 직무 대비 모의면접</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-[11px] font-medium text-muted">종합 점수</p>
                            
                            {/* 💡 1번 제안 적용: AnimatedScore 컴포넌트로 숫자 롤링 */}
                            <p className="text-2xl font-bold text-navy dark:text-white">
                              {typeof recordScore === "number" ? <AnimatedScore score={Math.round(recordScore)} /> : "-"}<span className="text-sm font-medium">점</span>
                            </p>

                          </div>
                          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg text-navy hover:bg-blue-100 transition-colors">
                            <Play className="h-4 w-4 pl-0.5" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <ReportDetailView 
              record={selectedRecordData} 
              roundLabel={selectedRound} 
              onBack={() => setSelectedRecord(null)} 
              onDelete={handleSingleDelete}
              onStartNew={() => setIsInterviewing(true)} 
            />
          )}
        </main>
      </div>
    </div>
  );
}