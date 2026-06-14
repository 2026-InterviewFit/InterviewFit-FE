"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Camera, Mic, FileText, Activity, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Variants } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function FeaturesPage() {
  return (
    <main className="min-h-screen w-full font-sans bg-bg dark:bg-[#0f1729] transition-colors duration-300 overflow-x-hidden">
      <Navbar />

      {/* 1. 히어로 섹션 — 메인 페이지의 블루/퍼플/옐로우 블러 유지 */}
      <section className="relative flex h-screen w-full items-center justify-center px-6 text-center pt-20">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-10 md:-left-20 -top-20 md:-top-40 h-[400px] md:h-[650px] w-[400px] md:w-[650px] rounded-full bg-[#fef08a]/30 blur-[100px] md:blur-[150px]" />
          <div className="absolute top-10 -right-10 md:-right-20 h-[500px] md:h-[750px] w-[500px] md:w-[750px] rounded-full bg-[#bfdbfe]/40 blur-[120px] md:blur-[170px]" />
          <div className="absolute bottom-[-100px] left-1/4 h-[400px] w-[600px] rounded-full bg-[#e9d5ff]/30 blur-[100px]" />
        </div>

        <motion.div
          initial="hidden" animate="visible" variants={fadeInUp}
          className="relative z-10 max-w-3xl"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 dark:bg-navy/30 text-blue-600 dark:text-blue-300 text-xs font-bold tracking-widest mb-6 border border-blue-100 dark:border-blue-800 backdrop-blur-md shadow-sm">
            CORE FEATURES
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-navy dark:text-white tracking-tight leading-tight">
            면접의 모든 순간을<br />
            데이터로 완벽하게 분석하다
          </h1>
          <p className="mt-6 text-base md:text-lg text-navy/70 dark:text-gray-300 leading-relaxed break-keep max-w-2xl mx-auto font-medium">
            인터뷰핏은 단순한 녹화 도구가 아닙니다. 당신의 시선, 목소리의 떨림, 그리고 답변의 논리 구조까지 3D AI 엔진이 정밀하게 스캔하여 합격의 지름길을 안내합니다.
          </p>
        </motion.div>
      </section>

      {/* 2. 기능 스크롤텔링 */}
      <section className="w-full max-w-[1280px] mx-auto px-6 py-20 flex flex-col gap-32">

        {/* 기능 1: 시각 분석 (블루 테마) */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer} className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
        >
          <motion.div variants={fadeInUp} className="flex-1 space-y-6">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Camera className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-navy dark:text-white leading-snug tracking-tight">
              AI가 당신의 눈동자와<br />자세를 추적합니다.
            </h2>
            <p className="text-navy/70 dark:text-gray-400 leading-relaxed font-medium">
              카메라 정면 응시율, 고개 숙임 빈도, 그리고 미세한 표정 변화까지. Face Mesh 기술을 통해 면접관에게 신뢰감을 주는 최적의 비주얼 피드백을 제공합니다.
            </p>
            <ul className="space-y-3 mt-4">
              {["초당 30프레임 안구 추적 및 화면 이탈 감지", "코/턱/어깨 좌표 기반 자세 불안정 및 고개 숙임 분석", "입가 비대칭 및 부정적 감정 비율 측정"].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium text-navy/80 dark:text-gray-300 leading-relaxed">
                  <CheckCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex-1 w-full max-h-[360px] rounded-[32px] bg-gradient-to-br from-blue-50/80 to-white/40 dark:from-[#1e293b] p-8 overflow-hidden flex items-center justify-center border border-white/60 shadow-sm">
            <div className="relative z-10 w-full max-w-sm bg-white/90 dark:bg-[#1e293b] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/50 backdrop-blur-md p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-blue-400 tracking-wider">VISUAL TRACKING</span>
                <span className="text-2xl font-bold text-navy dark:text-white">82%</span>
              </div>
              <div className="h-1.5 w-full bg-blue-100/50 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[82%] rounded-full" />
              </div>
              <p className="mt-4 text-xs text-center text-navy/60 font-medium">카메라 정면 응시율이 우수합니다.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* 기능 2: 청각 분석 (퍼플 테마) */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer} className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20"
        >
          <motion.div variants={fadeInUp} className="flex-1 space-y-6">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Mic className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-navy dark:text-white leading-snug tracking-tight">
              떨리는 목소리와 침묵의<br />순간도 놓치지 않습니다.
            </h2>
            <p className="text-navy/70 dark:text-gray-400 leading-relaxed font-medium">
              긴장하면 말이 빨라지거나 침묵이 길어지나요? 분당 발화 단어 수(WPM)와 오디오 파형 분석으로 가장 안정적인 목소리 톤과 템포를 찾아드립니다.
            </p>
            <ul className="space-y-3 mt-4">
              {["실시간 WPM 측정 및 적절성 판정", "3초 이상 무음 구간 탐지 및 흐름 단절 분석", '"어, 음" 등 무의미한 습관어 횟수 카운팅'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium text-navy/80 dark:text-gray-300 leading-relaxed">
                  <CheckCircle className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex-1 w-full max-h-[360px] rounded-[32px] bg-gradient-to-br from-purple-50/80 to-white/40 dark:from-[#1e293b] p-8 overflow-hidden flex items-center justify-center border border-white/60 shadow-sm">
            <div className="relative z-10 w-full max-w-sm bg-white/90 dark:bg-[#1e293b] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/50 backdrop-blur-md p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-purple-400 tracking-wider">AUDIO ANALYSIS</span>
                <Activity className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex items-end gap-1.5 h-12 w-full">
                {[19, 34, 22, 43, 29, 38, 24, 48, 31, 14].map((heightPx, i) => (
                  <div key={i} className="flex-1 bg-purple-400 rounded-t-sm opacity-80" style={{ height: `${heightPx}px` }} />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs font-bold text-navy dark:text-white">
                <span>125 WPM</span>
                <span className="text-purple-400">습관어 4회 감지</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 기능 3: 논리 분석 (옐로우/앰버 테마) */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer} className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
        >
          <motion.div variants={fadeInUp} className="flex-1 space-y-6">
            <div className="h-12 w-12 rounded-2xl bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-navy dark:text-white leading-snug tracking-tight">
              STAR 기법으로<br />답변의 구조를 완성합니다.
            </h2>
            <p className="text-navy/70 dark:text-gray-400 leading-relaxed font-medium">
              사용자의 육성 답변을 텍스트로 변환(STT)한 뒤, 상황(S), 과제(T), 행동(A), 결과(R) 구조에 맞게 잘 말했는지 AI가 문맥을 뜯어보고 논리성을 평가합니다.
            </p>
            <ul className="space-y-3 mt-4">
              {["Whisper STT 기반 정밀 텍스트 변환", "STAR 구조 매칭률 분석 및 직무 핵심 키워드 추출", "답변 내용을 기반으로 한 압박 꼬리 질문 자동 생성"].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium text-navy/80 dark:text-gray-300 leading-relaxed">
                  <CheckCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex-1 w-full max-h-[360px] rounded-[32px] bg-gradient-to-br from-yellow-50/80 to-white/40 dark:from-[#1e293b] p-8 overflow-hidden flex items-center justify-center border border-white/60 shadow-sm">
            <div className="relative z-10 w-full max-w-sm bg-white/90 dark:bg-[#1e293b] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/50 backdrop-blur-md p-6 flex flex-col gap-2.5">
              {[
                { label: "S/T", text: "프로젝트 기간이 촉박한 상황에서..." },
                { label: "A",   text: "우선순위를 정해 팀원들과 역할을 분담하고..." },
                { label: "R",   text: "성공적으로 런칭하여 우수상을 받았습니다." },
              ].map((row) => (
                <div key={row.label} className="flex gap-3 items-start p-2.5 rounded-xl bg-yellow-50/50 dark:bg-neutral-800/50">
                  <div className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold rounded">{row.label}</div>
                  <p className="text-xs text-navy/80 dark:text-gray-300 leading-relaxed font-medium">{row.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

      </section>

      {/* 3. CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="w-full max-w-[1280px] mx-auto px-6 py-24 mb-12 flex flex-col items-center text-center"
      >
        <h2 className="text-3xl font-bold text-navy dark:text-white mb-8 tracking-tight">이제 직접 경험해 볼 차례입니다.</h2>
        <Link
          href="/practice"
          className="flex items-center gap-3 bg-navy dark:bg-white text-white dark:text-navy px-10 py-4.5 rounded-full font-bold text-[15px] hover:scale-105 transition-transform shadow-[0_8px_30px_rgba(31,44,70,0.15)]"
        >
          모의면접 스튜디오 입장하기
          <ArrowRight className="h-5 w-5" />
        </Link>
      </motion.section>

      <Footer />
    </main>
  );
}