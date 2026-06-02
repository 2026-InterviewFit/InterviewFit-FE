"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import InterviewRecording from "@/components/practice/InterviewRecording";
import { Mic, Video, FileText, Play, Award, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const [isInterviewing, setIsInterviewing] = useState(false);

  if (isInterviewing) {
    return (
      <main className="fixed inset-0 z-[100] h-screen w-screen bg-black">
        <InterviewRecording onExit={() => setIsInterviewing(false)} />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg font-sans text-ink">
      {/* 1. 좌측 고정 사이드바 */}
      <Sidebar />

      {/* 2. 우측 메인 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col px-10 py-8 overflow-y-auto">
        <Topbar />

        {/* 메인 대시보드 레이아웃 */}
        <main className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* 💡 [좌측 영역] 종합 분석 및 육각형 그래프 (7칸 차지) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* 1. 종합 AI 분석 리포트 (육각형 차트 중앙 배치) */}
            <div className="rounded-[32px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-black/[0.02] flex flex-col md:flex-row items-center gap-8">
              
              {/* SVG로 정교하게 그린 육각형 레이더 차트 */}
              <div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-[#bfdbfe]/10 to-[#fef08a]/10 rounded-[24px] p-6 border border-black/[0.01]">
                <span className="text-xs font-bold text-muted mb-4 flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5 text-blue-500" /> 역량 밸런스 점수
                </span>
                <svg width="220" height="220" viewBox="0 0 220 220" className="drop-shadow-sm">
                  {/* 기본 가이드라인 육각형 백그라운드 */}
                  <polygon points="110,20 188,65 188,155 110,200 32,155 32,65" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                  <polygon points="110,65 149,87 149,132 110,155 71,132 71,87" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3" />
                  
                  {/* 중심축 라인 */}
                  <line x1="110" y1="20" x2="110" y2="200" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="32" y1="65" x2="188" y2="155" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="32" y1="155" x2="188" y2="65" stroke="#f3f4f6" strokeWidth="1" />

                  {/* 🔥 실제 매칭 데이터 육각형 (은재님의 평가 기준치 반영) */}
                  {/* 순서: 내용(논리), 속도/BPM, 음량안정성, 시선처리, 표정/감정, 자세/고개 */}
                  <polygon 
                    points="110,45 170,75 165,140 110,175 55,135 45,75" 
                    fill="url(#radarGradient)" 
                    stroke="#3b82f6" 
                    strokeWidth="2" 
                  />

                  {/* 텍스트 레이블 좌표 매칭 */}
                  <text x="110" y="14" textAnchor="middle" className="text-[10px] font-bold fill-navy">논리성(STAR)</text>
                  <text x="194" y="68" textAnchor="start" className="text-[10px] font-bold fill-navy">발화 속도</text>
                  <text x="194" y="160" textAnchor="start" className="text-[10px] font-bold fill-navy">음량 안정성</text>
                  <text x="110" y="214" textAnchor="middle" className="text-[10px] font-bold fill-navy">시선 처리</text>
                  <text x="26" y="160" textAnchor="end" className="text-[10px] font-bold fill-navy">표정 분석</text>
                  <text x="26" y="68" textAnchor="end" className="text-[10px] font-bold fill-navy">자세 안정</text>

                  {/* 그라데이션 정의 (인터뷰핏 시그니처 컬러 믹스) */}
                  <defs>
                    <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* 종합 한줄 평 및 코칭 메시지 */}
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                  <Award className="h-3.5 w-3.5" />종합 평가 우수
                </div>
                <h2 className="text-2xl font-bold text-navy leading-snug">
                  전체적으로 안정적인<br />면접 페이스를 유지하고 있어요.
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  STAR 구조에 맞춘 답변 논리성은 매우 뛰어납니다. 다만, 답변 중반부에 고개를 숙이는 습관과 "그니까" 등의 반복 표현이 일부 감지되었으니 이 부분만 유의해 주세요.
                </p>
              </div>
            </div>

            {/* 2. 세부 평가 세부 요소 카드 (오디오, 비전, 텍스트) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 가. 언어 및 텍스트 평가 (GPT-4o & Whisper) */}
              <div className="rounded-[28px] bg-white p-6 border border-black/[0.02] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-navy text-base">답변 내용 및 논리</h4>
                  <p className="text-xs text-muted mt-1">STAR 구조 기반 분석</p>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-xs font-medium">
                      <span>STAR 구조 매칭</span>
                      <span className="text-purple-600 font-bold">90%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-3 border-t border-gray-50 text-[11px] text-muted">
                  정교한 문맥 매칭 완료
                </div>
              </div>

              {/* 나. 음성 평가 영역 (Librosa & WPM) */}
              <div className="rounded-[28px] bg-white p-6 border border-black/[0.02] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                    <Mic className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-navy text-base">음성 및 습관어</h4>
                  <p className="text-xs text-muted mt-1">오디오 파형 전수 조사</p>
                  
                  <div className="mt-6 space-y-4">
                    <div>
                      <div className="flex justify-between text-[11px] text-muted mb-1">
                        <span>말하는 속도 (WPM)</span>
                        <span className="font-bold text-navy">125 단어/분 (정상)</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-muted">
                        <span>반복 표현 ("어, 음")</span>
                        <span className="font-bold text-red-500">4회 감지</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-3 border-t border-gray-50 text-[11px] text-muted">
                  음량 안정성 지표 안정
                </div>
              </div>

              {/* 다. 표정 및 자세 평가 (MediaPipe & ResNet) */}
              <div className="rounded-[28px] bg-white p-6 border border-black/[0.02] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
                    <Video className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-navy text-base">시선 및 비주얼 피드백</h4>
                  <p className="text-xs text-muted mt-1">안구 추적 및 Face Mesh</p>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-xs font-medium">
                      <span>카메라 정면 응시율</span>
                      <span className="text-amber-500 font-bold">78%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: "78%" }} />
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-3 border-t border-gray-50 text-[11px] text-muted">
                  고개 숙임 타임스탬프 기록됨
                </div>
              </div>

            </div>
          </div>

          {/* 💡 [우측 영역] 최근 면접 다시보기 목록 및 빠른 시작 (5칸 차지) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* 새로운 면접 시작 퀵 배너 */}
            <div 
              onClick={() => setIsInterviewing(true)}
              className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-navy to-navy-dark p-8 text-white shadow-lg cursor-pointer transition-all hover:shadow-xl"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-400/20" />
              <h4 className="text-lg font-bold">새로운 연습 세션 시작하기</h4>
              <p className="text-xs text-white/60 mt-1">웹캠과 마이크를 통해 즉시 분석을 시작합니다.</p>
              <div className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-transform group-hover:translate-x-1">
                <Play className="h-4 w-4 fill-white" />
              </div>
            </div>

            {/* 면접 다시보기 타임라인 리스트 */}
            <div className="rounded-[32px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-black/[0.02] flex-1">
              <h3 className="text-xl font-bold text-navy mb-6">최근 면접 영상 기록</h3>
              
              <div className="space-y-4">
                {/* 비디오 카드 Item 1 */}
                <div className="group flex items-center justify-between rounded-2xl border border-black/[0.04] p-4 transition-all hover:bg-bg/40 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-20 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center border border-black/[0.02]">
                      <span className="text-[10px] font-bold text-muted">다시보기</span>
                      <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 flex items-center justify-center transition-colors">
                        <Play className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-ink">Q. 카카오 지원 동기 및 자기소개</h5>
                      <p className="text-xs text-muted mt-1">2026.06.02 연습 완료 • 02:15</p>
                    </div>
                  </div>
                </div>

                {/* 비디오 카드 Item 2 */}
                <div className="group flex items-center justify-between rounded-2xl border border-black/[0.04] p-4 transition-all hover:bg-bg/40 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-20 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center border border-black/[0.02]">
                      <span className="text-[10px] font-bold text-muted">다시보기</span>
                      <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 flex items-center justify-center transition-colors">
                        <Play className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-ink">Q. 프로젝트 중 갈등 해결 경험</h5>
                      <p className="text-xs text-muted mt-1">2026.05.29 연습 완료 • 03:40</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}