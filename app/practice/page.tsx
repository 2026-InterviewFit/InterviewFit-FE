// app/practice/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  Video, 
  CheckCircle, 
  Lightbulb, 
  Play, 
  X, 
  UserCheck, 
  Monitor, 
  Users 
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function PracticeLandingPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <main className="px-6 pb-32 pt-6 lg:px-10 lg:pt-10 flex flex-col w-full max-w-5xl mx-auto">
        <div className="flex flex-col gap-10 animate-in fade-in duration-500">
          
          {/* ── 헤더 영역 ── */}
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-white tracking-tight">
              면접 연습 스튜디오
            </h2>
            <p className="text-base text-muted">
              실전과 동일한 환경에서 AI와 함께 모의면접을 진행합니다.
            </p>
          </div>

          {/* ── 안내 카드 섹션 (호버 시 입체감 부여) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative rounded-[24px] bg-surface p-8 border border-line shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-navy/30 dark:hover:border-brand-soft/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-transparent transition-colors duration-300 group-hover:bg-navy dark:group-hover:bg-brand-soft" />
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-chip text-navy transition-all duration-300 group-hover:bg-navy group-hover:text-white dark:group-hover:bg-brand-soft dark:group-hover:text-navy">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-ink dark:text-white text-lg mb-2">카메라 및 조명</h3>
              <p className="text-sm text-muted leading-relaxed">
                얼굴이 화면 중앙에 오도록 웹캠을 조절해 주세요. 역광을 피하고 밝은 곳을 권장합니다.
              </p>
            </div>

            <div className="group relative rounded-[24px] bg-surface p-8 border border-line shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-navy/30 dark:hover:border-brand-soft/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-transparent transition-colors duration-300 group-hover:bg-navy dark:group-hover:bg-brand-soft" />
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-chip text-navy transition-all duration-300 group-hover:bg-navy group-hover:text-white dark:group-hover:bg-brand-soft dark:group-hover:text-navy">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-ink dark:text-white text-lg mb-2">마이크 환경</h3>
              <p className="text-sm text-muted leading-relaxed">
                주변 소음이 적은 곳에서 진행해 주세요. 무선 이어폰 사용 시 음성 인식이 더욱 정밀해집니다.
              </p>
            </div>

            <div className="group relative rounded-[24px] bg-surface p-8 border border-line shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-navy/30 dark:hover:border-brand-soft/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-transparent transition-colors duration-300 group-hover:bg-navy dark:group-hover:bg-brand-soft" />
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-chip text-navy transition-all duration-300 group-hover:bg-navy group-hover:text-white dark:group-hover:bg-brand-soft dark:group-hover:text-navy">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-ink dark:text-white text-lg mb-2">실전처럼 임하기</h3>
              <p className="text-sm text-muted leading-relaxed">
                답변이 막히더라도 당황하지 마세요. 실제 면접관이 앞에 있다고 생각하고 끝까지 답변하는 것이 중요합니다.
              </p>
            </div>
          </div>

          {/* ── CTA 섹션 (단조로움 탈피, 프리미엄 포커스 영역) ── */}
          <div className="mt-6 flex flex-col items-center justify-center rounded-[32px] bg-gradient-to-br from-navy to-navy-dark p-12 text-center shadow-2xl relative overflow-hidden">
            {/* 배경 글로우 효과 */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-soft opacity-20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white opacity-10 blur-[60px] pointer-events-none" />
            
            <h3 className="text-2xl md:text-3xl font-bold text-white relative z-10 tracking-tight">
              모든 준비가 끝났나요?
            </h3>
            <p className="mt-4 text-sm md:text-base text-brand-soft relative z-10 max-w-md">
              버튼을 누르면 면접 유형을 선택하고 전체화면으로 연습을 시작할 수 있습니다.
            </p>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-10 flex items-center gap-3 rounded-full bg-brand-accent px-10 py-4 text-[16px] font-bold text-navy shadow-[0_0_20px_rgba(231,241,168,0.3)] hover:shadow-[0_0_30px_rgba(231,241,168,0.5)] hover:-translate-y-1 transition-all duration-300 relative z-10"
            >
              <Play className="h-5 w-5 fill-navy" />
              모의면접 시작하기
            </button>
          </div>

        </div>
      </main>

      {/* ── 모달 ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6 backdrop-blur-md" 
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()} 
              className="w-full max-w-xl overflow-hidden rounded-[28px] border border-line bg-surface p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-ink dark:text-white tracking-tight">어떤 면접을 연습할까요?</h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="rounded-full p-2 text-muted hover:bg-chip hover:text-ink transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => router.push("/interview")} 
                  className="group flex items-center gap-5 rounded-2xl border border-line p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-navy hover:shadow-lg hover:bg-surface"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-chip text-muted transition-all duration-300 group-hover:bg-navy group-hover:text-white dark:group-hover:bg-brand-soft dark:group-hover:text-navy">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-[17px] font-bold text-ink dark:text-white mb-1 group-hover:text-navy dark:group-hover:text-brand-soft transition-colors">1:1 AI 모의면접</h4>
                    <p className="text-sm text-muted">이력서와 직무를 분석한 맞춤형 꼬리 질문 대비</p>
                  </div>
                </button>

                <button 
                  onClick={() => router.push("/pt-interview")} 
                  className="group flex items-center gap-5 rounded-2xl border border-line p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-navy hover:shadow-lg hover:bg-surface"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-chip text-muted transition-all duration-300 group-hover:bg-navy group-hover:text-white dark:group-hover:bg-brand-soft dark:group-hover:text-navy">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-[17px] font-bold text-ink dark:text-white mb-1 group-hover:text-navy dark:group-hover:text-brand-soft transition-colors">PT 면접</h4>
                    <p className="text-sm text-muted">화면 공유를 통한 발표 논리 및 비언어적 역량 점검</p>
                  </div>
                </button>

                <button 
                  onClick={() => router.push("/group-interview")} 
                  className="group flex items-center gap-5 rounded-2xl border border-line p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-navy hover:shadow-lg hover:bg-surface"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-chip text-muted transition-all duration-300 group-hover:bg-navy group-hover:text-white dark:group-hover:bg-brand-soft dark:group-hover:text-navy">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-[17px] font-bold text-ink dark:text-white mb-1 group-hover:text-navy dark:group-hover:text-brand-soft transition-colors">다대일 그룹 면접</h4>
                    <p className="text-sm text-muted">다른 지원자들과 함께 참여하는 실전 화상 대기실 환경</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}