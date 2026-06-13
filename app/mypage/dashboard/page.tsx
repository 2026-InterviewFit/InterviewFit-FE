"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import InterviewRecording from "@/components/practice/InterviewRecording";
import { 
  Video, Calendar, Play, SlidersHorizontal, ArrowLeft, 
  BarChart3, CheckCircle, Mic, Menu, X 
} from "lucide-react";

export default function DashboardPage() {
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (isInterviewing) {
    return (
      <main className="fixed inset-0 z-[100] h-screen w-screen bg-black">
        <InterviewRecording onExit={() => setIsInterviewing(false)} />
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg font-sans text-ink relative transition-colors duration-300">
      
      {/* 1. 모바일용 사이드바 오버레이 배경 */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 2. 좌측 고정 사이드바 */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform bg-white dark:bg-[#111827] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shrink-0
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onMenuClick={() => setIsMobileSidebarOpen(false)} />
        <button 
          className="absolute top-6 right-4 lg:hidden rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <X className="h-5 w-5 text-muted dark:text-gray-400" />
        </button>
      </div>

      {/* 3. 우측 메인 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col overflow-y-auto w-full">
        {/* 모바일 헤더 */}
        <div className="flex items-center px-6 pt-6 lg:px-10 lg:pt-8 w-full">
          <button 
            className="mr-4 lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-navy dark:text-white" />
          </button>
          <div className="flex-1">
            <Topbar />
          </div>
        </div>

        <main className="px-6 pb-12 pt-6 lg:px-10 lg:pt-10 flex flex-col w-full h-full">
          {!selectedRecord ? (
            
            /* =========================================
               [뷰 1] 면접 분석 히스토리 리스트
               ========================================= */
            <div className="flex flex-col w-full animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div>
                  <h2 className="text-2xl font-bold text-navy dark:text-white">면접 분석 히스토리</h2>
                  <p className="mt-2 text-sm text-muted dark:text-gray-400">확인하고 싶은 촬영 회차의 분석 결과를 선택해 주세요.</p>
                </div>
                
                <button 
                  onClick={() => setIsInterviewing(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-navy-dark whitespace-nowrap shrink-0"
                >
                  <Video className="h-4 w-4" />
                  새 면접 촬영하기
                </button>
              </div>

              <div className="mt-8 flex w-full items-center justify-between border-b border-line dark:border-white/10 pb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted dark:text-gray-400">
                  <SlidersHorizontal className="h-4 w-4" />
                  정렬 기준
                </div>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <button className="text-blue-600 dark:text-blue-400">최신순</button>
                  <span className="text-line dark:text-white/10">|</span>
                  <button className="text-muted dark:text-gray-400 hover:text-ink dark:hover:text-white transition-colors">오래된순</button>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 w-full">
                {/* 3회차 리스트 카드 */}
                <div className="flex w-full items-center justify-between rounded-[24px] bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-bg dark:bg-[#0f1729] border border-line dark:border-white/5">
                      <span className="text-[9px] font-medium text-muted dark:text-gray-400">회차</span>
                      <span className="text-sm font-bold text-navy dark:text-white">3회차</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-muted dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        2026년 06월 18일
                        <span className="rounded bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 text-blue-600 dark:text-blue-400">우수</span>
                      </div>
                      <h3 className="mt-1.5 text-base font-bold text-ink dark:text-white line-clamp-1">2026년 06월 18일 3회차 면접영상 분석 결과</h3>
                      <p className="mt-1 text-xs text-muted dark:text-gray-400">네이버 신입 개발자 대비 모의면접</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[11px] font-medium text-muted dark:text-gray-400">종합 점수</p>
                      <p className="text-2xl font-bold text-navy dark:text-white">85<span className="text-sm font-medium">점</span></p>
                    </div>
                    <button 
                      onClick={() => setSelectedRecord(3)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg dark:bg-[#0f1729] text-navy dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                      <Play className="h-4 w-4 fill-navy dark:fill-white pl-0.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* 2회차 리스트 카드 */}
                <div className="flex w-full items-center justify-between rounded-[24px] bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-bg dark:bg-[#0f1729] border border-line dark:border-white/5">
                      <span className="text-[9px] font-medium text-muted dark:text-gray-400">회차</span>
                      <span className="text-sm font-bold text-navy dark:text-white">2회차</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-muted dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        2026년 06월 02일
                        <span className="rounded bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 text-blue-600 dark:text-blue-400">반성</span>
                      </div>
                      <h3 className="mt-1.5 text-base font-bold text-ink dark:text-white line-clamp-1">2026년 06월 02일 2회차 면접영상 분석 결과</h3>
                      <p className="mt-1 text-xs text-muted dark:text-gray-400">카카오 공채 대비 밸런스 면접</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[11px] font-medium text-muted dark:text-gray-400">종합 점수</p>
                      <p className="text-2xl font-bold text-navy dark:text-white">68<span className="text-sm font-medium">점</span></p>
                    </div>
                    <button onClick={() => setSelectedRecord(2)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg dark:bg-[#0f1729] text-navy dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-800">
                      <Play className="h-4 w-4 fill-navy dark:fill-white pl-0.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          ) : (

            /* =========================================
               [뷰 2] 상세 분석 리포트 화면
               ========================================= */
            <div className="flex flex-col w-full animate-in slide-in-from-right-4 duration-300">
              
              <button 
                onClick={() => setSelectedRecord(null)} 
                className="flex w-fit items-center gap-2 rounded-full border border-line dark:border-white/10 bg-white dark:bg-[#1e293b] px-5 py-2.5 text-sm font-medium text-ink dark:text-white shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-[#0f1729] mb-6"
              >
                <ArrowLeft className="h-4 w-4 text-muted dark:text-gray-400" /> 목록으로 돌아가기
              </button>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
                
                <div className="xl:col-span-8 flex flex-col gap-6 w-full">
                  <div className="flex flex-col md:flex-row items-center gap-10 rounded-[32px] bg-white dark:bg-[#1e293b] p-8 md:p-10 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-colors">
                    <div className="relative flex w-full md:w-[280px] shrink-0 flex-col items-center">
                      <span className="text-xs font-bold text-muted dark:text-gray-400 mb-4 flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5 text-blue-500" /> 역량 밸런스 지표
                      </span>
                      <svg viewBox="0 0 220 220" className="w-full max-w-[220px] h-auto drop-shadow-sm">
                        <polygon points="110,20 188,65 188,155 110,200 32,155 32,65" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                        <polygon points="110,65 149,87 149,132 110,155 71,132 71,87" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3" />
                        <line x1="110" y1="20" x2="110" y2="200" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="32" y1="65" x2="188" y2="155" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="32" y1="155" x2="188" y2="65" stroke="#f3f4f6" strokeWidth="1" />
                        <polygon points="110,45 170,75 165,140 110,175 55,135 45,75" fill="rgba(167, 139, 250, 0.4)" stroke="#8b5cf6" strokeWidth="2" />
                        <text x="110" y="10" textAnchor="middle" className="text-[10px] font-bold fill-navy dark:fill-white">논리성</text>
                        <text x="194" y="68" textAnchor="start" className="text-[10px] font-bold fill-navy dark:fill-white">발화 속도</text>
                        <text x="194" y="160" textAnchor="start" className="text-[10px] font-bold fill-navy dark:fill-white">음량 분석</text>
                        <text x="110" y="218" textAnchor="middle" className="text-[10px] font-bold fill-navy dark:fill-white">시선 처리</text>
                        <text x="26" y="160" textAnchor="end" className="text-[10px] font-bold fill-navy dark:fill-white">표정 분석</text>
                        <text x="26" y="68" textAnchor="end" className="text-[10px] font-bold fill-navy dark:fill-white">자세 안정</text>
                      </svg>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 text-4xl font-bold text-navy dark:text-white">
                        85% <span className="text-sm font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">{selectedRecord}회차 (우수권)</span>
                      </div>
                      <h3 className="mt-4 text-xl md:text-2xl font-bold text-navy dark:text-white leading-snug">
                        네이버 신입 개발자 대비<br className="hidden md:block" />
                        모의면접에 대한 AI 상세<br className="hidden md:block" />
                        진단 리포트입니다.
                      </h3>
                      <p className="mt-4 text-sm text-muted dark:text-gray-400 leading-relaxed break-keep">
                        시선 처리 및 발화 속도 데이터 세트 밸런스는 우수하게 유지되었습니다. 하단 스퀘어 지표를 통해 타임라인별 교정 피드백을 확인하세요.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                    <div className="rounded-[28px] bg-[#f0fdf4] dark:bg-emerald-900/10 p-6 border border-black/[0.02] dark:border-emerald-500/10 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">VISUAL</p>
                          <h4 className="text-lg font-bold text-navy dark:text-white">시선 및 자세 안정도</h4>
                        </div>
                        <div className="rounded-full bg-white dark:bg-emerald-900/40 p-2 text-emerald-500 shadow-sm"><CheckCircle className="w-4 h-4" /></div>
                      </div>
                      <div className="mt-8 flex justify-between items-end">
                        <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70">카메라 정면 응시율</p>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">82<span className="text-base font-medium">%</span></p>
                      </div>
                    </div>

                    <div className="rounded-[28px] bg-[#fefce8] dark:bg-yellow-900/10 p-6 border border-black/[0.02] dark:border-yellow-500/10 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 mb-1">VOICE</p>
                          <h4 className="text-lg font-bold text-navy dark:text-white">발화 속도 (BPM)</h4>
                        </div>
                        <div className="rounded-full bg-white dark:bg-yellow-900/40 p-2 text-yellow-500 shadow-sm"><Mic className="w-4 h-4" /></div>
                      </div>
                      <div className="mt-8 flex justify-between items-end">
                        <p className="text-xs text-yellow-700/70 dark:text-yellow-400/70">분당 평균 발화 단어 수</p>
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">125 <span className="text-sm font-medium">WPM</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-4 flex flex-col gap-6 w-full">
                  <div 
                    onClick={() => setIsInterviewing(true)}
                    className="group cursor-pointer rounded-[32px] bg-[#1f2937] p-8 text-white shadow-lg transition-transform hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all" />
                    <h4 className="text-lg font-bold">새로운 연습 세션 시작하기</h4>
                    <p className="mt-2 text-xs text-white/60">웹캠과 마이크를 통해 정밀 분석을 시작합니다.</p>
                    <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-blue-500">
                      <Play className="h-5 w-5 fill-white pl-0.5" />
                    </div>
                  </div>

                  <div className="rounded-[32px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.02] dark:border-white/[0.05] flex-1 flex flex-col transition-colors">
                    <h4 className="text-lg font-bold text-navy dark:text-white mb-4">선택된 영상 다시보기</h4>
                    <div className="aspect-video w-full rounded-2xl bg-[#0f172a] relative flex items-center justify-center overflow-hidden mb-6">
                      <Play className="h-12 w-12 fill-white opacity-80" />
                      <p className="absolute bottom-4 text-[10px] text-white/60">{selectedRecord}회차 스트리밍 완료</p>
                    </div>
                    <div className="mt-auto">
                      <h5 className="font-bold text-ink dark:text-white">네이버 신입 개발자 대비 모의면접</h5>
                      <p className="text-xs text-muted dark:text-gray-400 mt-1">촬영 일시 : 2026년 06월 18일</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}