// app/features/page.tsx
"use client";

import { motion, type Variants } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import GradientBackground from "@/components/shared/GradientBackground";
import GlassCard from "@/components/shared/GlassCard";
import Image from "next/image";
import Link from "next/link";
import { UserCheck, Users, Monitor, BookOpen, ArrowRight, Camera, Mic, FileText, ShieldCheck, Trophy, BrainCircuit, Network } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function FeaturesPage() {
  return (
    <main className="font-sans bg-bg transition-colors duration-300">
      <Navbar />

      <GradientBackground>
        {/* 1. 히어로 섹션 */}
        <section className="flex min-h-[70vh] w-full items-center justify-center px-6 pt-32 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 dark:bg-navy/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest mb-6 border border-border-glass backdrop-blur-md shadow-sm">
              ALL-IN-ONE INTERVIEW PLATFORM
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-navy dark:text-white tracking-tight leading-tight">
              당신이 마주할 모든 면접,<br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">인터뷰핏 하나로 완벽하게.</span>
            </h1>
            <p className="mt-8 text-base md:text-lg text-navy/70 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto font-medium">
              일대일 AI 압박 면접부터 긴장감 넘치는 다대일 화상 면접, 그리고 집단지성으로 뭉친 기출문제 위키까지. 취업을 위한 가장 완벽한 훈련 공간을 경험하세요.
            </p>
          </motion.div>
        </section>

        {/* 2. 메인 특장점 (Bento Grid UI) */}
        <section className="w-full max-w-[1280px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
            
            {/* [일대일 면접] - 크게 (2칸 차지) */}
            <motion.div custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="md:col-span-2 group">
              <div className="h-full w-full rounded-[32px] bg-gradient-to-br from-blue-50/80 to-white dark:from-[#1e293b] dark:to-[#0f172a] p-8 md:p-12 border border-black/[0.04] dark:border-white/[0.05] shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 opacity-20 transition-transform duration-500 group-hover:scale-110">
                  <Image src="/3d-computer.png" alt="1:1 AI 면접" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between w-full md:w-2/3">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg mb-6">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-navy dark:text-white leading-tight mb-3">일대일 AI 모의면접</h3>
                    <p className="text-navy/70 dark:text-gray-400 font-medium leading-relaxed">
                      나의 이력서와 직무를 기반으로 생성된 날카로운 꼬리 질문. 
                      실제 면접관이 앞에 있는 것처럼, 딥러닝 AI가 시선 처리부터 목소리의 떨림까지 정밀하게 분석합니다.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* [PT 면접] - 중간 (1칸 차지) */}
            <motion.div custom={1} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="md:col-span-1 group">
              <div className="h-full w-full rounded-[32px] bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-900/20 dark:to-[#0f172a] p-8 border border-black/[0.04] dark:border-white/[0.05] shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg mb-6">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy dark:text-white leading-tight mb-3">PT 면접 모드</h3>
                  <p className="text-navy/70 dark:text-gray-400 font-medium leading-relaxed">
                    화면 공유 기능을 통해 내 발표 자료를 띄워놓고 실전처럼 프레젠테이션을 연습하세요.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* [다대일 면접] - 중간 (1칸 차지) */}
            <motion.div custom={2} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="md:col-span-1 group">
              <div className="h-full w-full rounded-[32px] bg-gradient-to-br from-purple-50/80 to-white dark:from-purple-900/20 dark:to-[#0f172a] p-8 border border-black/[0.04] dark:border-white/[0.05] shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-lg mb-6">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy dark:text-white leading-tight mb-3">다대일 그룹 면접</h3>
                  <p className="text-navy/70 dark:text-gray-400 font-medium leading-relaxed">
                    다른 취준생들과 실시간으로 연결되는 화상 면접 대기실. 타인의 답변을 듣고 실전의 긴장감을 경험하세요.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* [면접 위키] - 넓게 (2칸 차지) */}
            <motion.div custom={3} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="md:col-span-2 group">
              <div className="h-full w-full rounded-[32px] bg-gradient-to-br from-yellow-50/80 to-white dark:from-yellow-900/20 dark:to-[#0f172a] p-8 md:p-12 border border-black/[0.04] dark:border-white/[0.05] shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
                <div className="absolute right-0 bottom-0 w-56 h-56 opacity-30 transition-transform duration-500 group-hover:scale-110">
                  <Image src="/3d-tool.png" alt="면접 위키" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between w-full md:w-2/3">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500 text-white shadow-lg mb-6">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-navy dark:text-white leading-tight mb-3">상위 1%의 합격 비법,<br />집단지성 면접 위키</h3>
                    <p className="text-navy/70 dark:text-gray-400 font-medium leading-relaxed">
                      네카라쿠배부터 금융권까지, 실제 출제된 기출문제와 합격자들의 마스킹된 스크립트를 열람하고 원하는 질문을 장바구니에 담아 바로 연습해 보세요.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* 3. NEW: Why InterviewFit? (차별점 섹션) */}
        <section className="w-full max-w-[1280px] mx-auto px-6 py-24">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-navy dark:text-white tracking-tight">수많은 면접 서비스 중, 인터뷰핏이어야 하는 이유</h2>
            <p className="mt-3 text-muted font-medium">취준생의 입장에서 가장 완벽하게 설계된 디테일을 확인하세요.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldCheck />, title: "개인정보 완벽 마스킹", desc: "내 자소서와 스펙이 유출될 걱정은 끝. 공유 전 이름, 기업명 등 고유명사를 AI가 100% 가려줍니다.", color: "text-emerald-500" },
              { icon: <Trophy />, title: "성장하는 명예의 전당", desc: "혼자 하는 지루한 연습이 아닙니다. 분야별 랭커들의 압도적인 기록을 보며 자극받고 성장하세요.", color: "text-yellow-500" },
              { icon: <Network />, title: "WebRTC 실전 대기실", desc: "단순한 AI 챗봇이 아닙니다. 실제 사람들과 연결되어 화상으로 대면하는 극한의 실전 환경을 제공합니다.", color: "text-indigo-500" },
              { icon: <BrainCircuit />, title: "경험을 구조화하는 STAR", desc: "목소리의 크기만 평가하지 않습니다. 상황, 과제, 행동, 결과 논리에 맞게 대답했는지 문맥을 분석합니다.", color: "text-rose-500" }
            ].map((item, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} className="flex flex-col">
                <div className="rounded-3xl bg-white dark:bg-[#1e293b] border border-black/5 dark:border-white/5 p-8 h-full shadow-sm hover:shadow-md transition-shadow">
                  <div className={`mb-5 ${item.color}`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-navy dark:text-white mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed font-medium break-keep">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. AI 코어 기술 요약 */}
        <section className="w-full max-w-[1280px] mx-auto px-6 py-12">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-navy dark:text-white tracking-tight">비주얼부터 논리까지, 빈틈없는 AI 엔진</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Camera />, title: "시선 & 자세 추적", desc: "Face Mesh 기술로 안구 움직임과 고개 흔들림, 표정 비대칭을 분석합니다.", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30" },
              { icon: <Mic />, title: "오디오 파형 & 발화 분석", desc: "분당 발화 단어 수(WPM)와 무음 구간을 측정하여 가장 안정적인 템포를 찾습니다.", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30" },
              { icon: <FileText />, title: "음성 인식 & 꼬리 질문", desc: "정밀 STT 변환 후, 답변을 분석하여 면접관처럼 압박 꼬리 질문을 던집니다.", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30" }
            ].map((tech, i) => (
              <GlassCard key={i} delay={0.2 + (i * 0.1)} className="p-8 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                <div className={`p-4 rounded-2xl mb-5 ${tech.color}`}>{tech.icon}</div>
                <h3 className="text-lg font-bold text-navy dark:text-white mb-2">{tech.title}</h3>
                <p className="text-sm text-muted leading-relaxed font-medium break-keep">{tech.desc}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* 5. CTA */}
        <section className="w-full max-w-[1280px] mx-auto px-6 pb-32 pt-16 text-center">
          <GlassCard delay={0.4} className="p-12 md:p-16 border-none bg-navy dark:bg-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-3xl font-bold mb-6 tracking-tight relative z-10">당신의 첫 번째 실전 모의면접, 지금 시작하세요.</h2>
            <Link href="/practice" className="relative z-10 inline-flex items-center gap-2 bg-white text-navy dark:text-blue-600 px-8 py-4 rounded-full font-bold text-[15px] hover:scale-105 transition-transform shadow-xl">
              스튜디오 입장하기 <ArrowRight className="h-4 w-4" />
            </Link>
          </GlassCard>
        </section>
      </GradientBackground>

      <Footer />
    </main>
  );
}