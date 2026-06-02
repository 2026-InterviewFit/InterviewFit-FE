"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import InterviewRecording from "@/components/practice/InterviewRecording";
import { Mic, Video, FileText, Play, Award, BarChart3, AlertTriangle, CheckCircle, ArrowLeft, Calendar, SlidersHorizontal } from "lucide-react";

const MOCK_HISTORY_LIST = [
  { id: 3, round: "3회차", date: "2026년 06월 18일", timestamp: 20260618, title: "네이버 신입 개발자 대비 모의면접", score: 85, status: "우수" },
  { id: 2, round: "2회차", date: "2026년 06월 02일", timestamp: 20260602, title: "카카오 공채 대비 밸런스 면접", score: 68, status: "안정" },
  { id: 1, round: "1회차", date: "2026년 05월 20일", timestamp: 20260520, title: "첫 AI 기술 면접 테스트", score: 45, status: "노력" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<typeof MOCK_HISTORY_LIST[0] | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");

  if (isInterviewing) {
    return (
      <main className="fixed inset-0 z-[100] h-screen w-screen bg-black">
        <InterviewRecording onExit={() => setIsInterviewing(false)} />
      </main>
    );
  }

  const getSortedList = () => {
    return [...MOCK_HISTORY_LIST].sort((a, b) => {
      return sortBy === "latest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "practice":
        return (
          <div className="rounded-[32px] bg-white p-8 sm:p-12 text-center border border-black/[0.02] shadow-sm mt-8">
            <h3 className="text-xl font-bold text-navy">면접 연습 공간</h3>
            <p className="text-muted mt-2 text-sm">AI 모의면접을 시작할 수 있습니다.</p>
            <button onClick={() => setIsInterviewing(true)} className="mt-6 rounded-full bg-navy px-6 py-3 text-sm font-bold text-white hover:bg-navy-dark transition-colors">
              새 면접 시작하기
            </button>
          </div>
        );
      case "report":
        return (
          <div className="rounded-[32px] bg-white p-8 sm:p-12 text-center border border-black/[0.02] shadow-sm mt-8">
            <h3 className="text-xl font-bold text-navy">상세 분석 리포트</h3>
            <p className="text-muted mt-2 text-sm">누적 데이터 추이 그래프 분석 구역입니다.</p>
          </div>
        );
      case "settings":
        return (
          <div className="rounded-[32px] bg-white p-8 sm:p-12 text-center border border-black/[0.02] shadow-sm mt-8">
            <h3 className="text-xl font-bold text-navy">대시보드 설정</h3>
            <p className="text-muted mt-2 text-sm">장치 설정 및 개인정보 관리 구역입니다.</p>
          </div>
        );
      case "dashboard":
      default:
        if (selectedHistory === null) {
          return (
            <div className="mt-8 w-full max-w-4xl space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-navy">면접 분석 히스토리</h2>
                  <p className="text-xs sm:text-sm text-muted mt-1">확인하고 싶은 촬영 회차의 분석 결과를 선택해 주세요.</p>
                </div>
                <button 
                  onClick={() => setIsInterviewing(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-bold text-white hover:bg-navy-dark transition-colors shadow-sm self-start sm:self-auto w-full sm:w-auto"
                >
                  <Video className="h-4 w-4" /> 새 면접 촬영하기
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-black/[0.04] pb-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>정렬 기준</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <button onClick={() => setSortBy("latest")} className={`px-2 py-1 rounded-md transition-colors ${sortBy === "latest" ? "text-blue-600 bg-blue-50" : "text-muted hover:text-ink"}`}>최신순</button>
                  <span className="text-black/10">|</span>
                  <button onClick={() => setSortBy("oldest")} className={`px-2 py-1 rounded-md transition-colors ${sortBy === "oldest" ? "text-blue-600 bg-blue-50" : "text-muted hover:text-ink"}`}>오래된순</button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {getSortedList().map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedHistory(item)}
                    className="group flex flex-col md:flex-row md:items-center justify-between rounded-[24px] bg-white p-5 md:p-6 border border-black/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.01)] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(31,44,70,0.05)] hover:border-blue-500/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-xl bg-bg flex flex-col items-center justify-center font-bold text-navy shrink-0 text-[11px]">
                        <span className="text-[9px] text-muted font-normal">회차</span>
                        {item.round}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-muted">
                          <Calendar className="h-3 w-3" />
                          <span>{item.date}</span>
                          <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[9px]">{item.status}</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-navy group-hover:text-blue-600 transition-colors">
                          {item.date} {item.round} 면접영상 분석 결과
                        </h4>
                        <p className="text-xs text-muted/80">{item.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4 md:mt-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-black/[0.02]">
                      <div className="text-left md:text-right">
                        <span className="text-[11px] text-muted">종합 점수</span>
                        <p className="text-lg font-bold text-navy tracking-tight">{item.score}점</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-chip text-navy flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Play className="h-3 w-3 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div className="mt-6 space-y-6 w-full">
            <button 
              onClick={() => setSelectedHistory(null)} 
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted hover:text-navy transition-colors bg-white px-4 py-2 rounded-full border border-black/[0.02] shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> 목록으로 돌아가기
            </button>

            {/* 💡 반응형 포인트: lg 이하 크기에서는 가로 배치가 아니라 세로 1열(grid-cols-1)로 자동 누적 */}
            <main className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start w-full">
              
              {/* [좌측 7칸 분량] */}
              <div className="lg:col-span-7 flex flex-col gap-6 w-full">
                
                {/* 메인 요약 차트 카드 */}
                <div className="rounded-[32px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] border border-black/[0.02] flex flex-col sm:flex-row items-center gap-6 sm:gap-8 w-full">
                  <div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-[#bfdbfe]/10 to-[#fef08a]/10 rounded-[24px] p-4 shrink-0 mx-auto sm:mx-0">
                    <span className="text-[11px] font-bold text-muted mb-2 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3 text-blue-500" /> 역량 밸런스 지표
                    </span>
                    <div className="p-1">
                      {/* 차트가 창 크기에 따라 찌그러지지 않게 뷰박스 고정 */}
                      <svg width="180" height="180" viewBox="0 0 220 220" className="overflow-visible">
                        <polygon points="110,20 188,65 188,155 110,200 32,155 32,65" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                        <polygon points="110,65 149,87 149,132 110,155 71,132 71,87" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3" />
                        <line x1="110" y1="20" x2="110" y2="200" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="32" y1="65" x2="188" y2="155" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="32" y1="155" x2="188" y2="65" stroke="#f3f4f6" strokeWidth="1" />
                        <polygon points="110,45 170,75 165,140 110,175 55,135 45,75" fill="url(#radarGradient)" stroke="#3b82f6" strokeWidth="2" />
                        
                        <text x="110" y="8" textAnchor="middle" className="text-[12px] font-bold fill-navy">논리성</text>
                        <text x="202" y="68" textAnchor="start" className="text-[12px] font-bold fill-navy">발화 속도</text>
                        <text x="202" y="160" textAnchor="start" className="text-[12px] font-bold fill-navy">음량 분석</text>
                        <text x="110" y="218" textAnchor="middle" className="text-[12px] font-bold fill-navy">시선 처리</text>
                        <text x="18" y="160" textAnchor="end" className="text-[12px] font-bold fill-navy">표정 분석</text>
                        <text x="18" y="68" textAnchor="end" className="text-[12px] font-bold fill-navy">자세 안정</text>
                        <defs>
                          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-3 w-full text-center sm:text-left">
                    <div className="flex items-baseline justify-center sm:justify-start gap-1">
                      <span className="text-4xl sm:text-5xl font-bold text-navy tracking-tight">{selectedHistory.score}%</span>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">{selectedHistory.round} ({selectedHistory.status}권)</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-navy leading-snug">
                      {selectedHistory.title}에 대한 AI 상세 진단 리포트입니다.
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                      시선 처리 및 발화 속도 데이터 세트 밸런스는 우수하게 유지되었습니다. 하단 스퀘어 지표를 통해 타임라인별 교정 피드백을 확인하세요.
                    </p>
                  </div>
                </div>

                {/* 격자 2x2 스퀘어 (창 좁아지면 모바일 1열 자동 스위칭) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="rounded-[24px] bg-[#f2f9f5] border border-[#e2ede7] p-5 flex flex-col justify-between h-[140px]">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-[#448e63] uppercase tracking-wider">Visual</p>
                        <h4 className="text-sm sm:text-base font-bold text-navy">시선 및 자세 안정도</h4>
                      </div>
                      <div className="h-7 w-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#448e63] shrink-0"><CheckCircle className="h-3.5 w-3.5" /></div>
                    </div>
                    <div className="flex items-baseline justify-between"><span className="text-xs text-muted">카메라 정면 응시율</span><span className="text-xl font-bold text-[#448e63]">82%</span></div>
                  </div>

                  <div className="rounded-[24px] bg-[#fffdf0] border border-[#fef7c3] p-5 flex flex-col justify-between h-[140px]">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-[#bfa113] uppercase tracking-wider">Voice</p>
                        <h4 className="text-sm sm:text-base font-bold text-navy">발화 속도 (BPM)</h4>
                      </div>
                      <div className="h-7 w-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#bfa113] shrink-0"><Mic className="h-3.5 w-3.5" /></div>
                    </div>
                    <div className="flex items-baseline justify-between"><span className="text-xs text-muted">분당 평균 발화 단어 수</span><span className="text-xl font-bold text-[#bfa113]">125 <span className="text-xs font-medium">WPM</span></span></div>
                  </div>

                  <div className="rounded-[24px] bg-[#f5f3ff] border border-[#ebe5ff] p-5 flex flex-col justify-between h-[140px]">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-[#6d28d9] uppercase tracking-wider">NLP Text</p>
                        <h4 className="text-sm sm:text-base font-bold text-navy">STAR 구조 매칭률</h4>
                      </div>
                      <div className="h-7 w-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#6d28d9] shrink-0"><FileText className="h-3.5 w-3.5" /></div>
                    </div>
                    <div className="flex items-baseline justify-between"><span className="text-xs text-muted">문맥 논리 정성 평가</span><span className="text-xl font-bold text-[#6d28d9]">90%</span></div>
                  </div>

                  <div className="rounded-[24px] bg-[#fff5f5] border border-[#fee2e2] p-5 flex flex-col justify-between h-[140px]">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-[#dc2626] uppercase tracking-wider">Warning</p>
                        <h4 className="text-sm sm:text-base font-bold text-navy">부정 표정 및 긴장도</h4>
                      </div>
                      <div className="h-7 w-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#dc2626] shrink-0"><AlertTriangle className="h-3.5 w-3.5" /></div>
                    </div>
                    <div className="flex items-baseline justify-between"><span className="text-xs text-muted">입가 비대칭성 감지</span><span className="text-xl font-bold text-[#dc2626]">주의 <span className="text-xs font-medium text-muted">(4회)</span></span></div>
                  </div>
                </div>

              </div>

              {/* [우측 5칸 분량] */}
              <div className="lg:col-span-5 flex flex-col gap-6 w-full">
                <div 
                  onClick={() => setIsInterviewing(true)}
                  className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-navy to-navy-dark p-6 sm:p-8 text-white shadow-md cursor-pointer transition-all hover:shadow-xl w-full"
                >
                  <h4 className="text-base sm:text-lg font-bold">새로운 연습 세션 시작하기</h4>
                  <p className="text-xs text-white/60 mt-1">웹캠과 마이크를 통해 정밀 분석을 시작합니다.</p>
                  <div className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-transform group-hover:translate-x-1">
                    <Play className="h-3.5 w-3.5 fill-white" />
                  </div>
                </div>

                <div className="rounded-[32px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] border border-black/[0.02] w-full">
                  <h3 className="text-base sm:text-lg font-bold text-navy mb-4">선택된 영상 다시보기</h3>
                  <div className="aspect-video w-full rounded-2xl bg-navy-dark flex flex-col items-center justify-center text-white relative group overflow-hidden">
                    <Play className="h-10 w-10 fill-white cursor-pointer transition-transform group-hover:scale-110" />
                    <span className="text-[11px] text-white/60 mt-2">{selectedHistory.round} 스트리밍 완료</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs sm:text-sm font-bold text-ink">{selectedHistory.title}</p>
                    <p className="text-[11px] text-muted mt-0.5">촬영 일시 : {selectedHistory.date}</p>
                  </div>
                </div>
              </div>

            </main>
          </div>
        );
    }
  };

  return (
    // 💡 전체 패딩을 작은창일 때 px-4, 큰 창일 때 px-10으로 부드럽게 무빙되도록 조율
    <div className="flex h-screen w-screen bg-bg font-sans text-ink overflow-hidden select-none">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-1 flex-col px-4 sm:px-10 py-8 overflow-y-auto transition-all duration-300">
        <Topbar />
        {renderContent()}
      </div>
    </div>
  );
}