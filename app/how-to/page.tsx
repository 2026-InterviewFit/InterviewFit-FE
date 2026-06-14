"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import { Camera, Briefcase, Mic2, ChevronDown, ArrowRight, CheckCircle, Wifi, Volume2, MonitorSmartphone } from "lucide-react";

const STEPS = [
  {
    number: "01", label: "STEP 1", title: "장비 세팅", subtitle: "카메라 · 마이크 권한 허용",
    icon: <Camera className="h-6 w-6" />,
    bgClass: "bg-blue-50/50 border-blue-100/50",
    iconColor: "text-blue-600 bg-white",
    numColor: "text-blue-100",
  },
  {
    number: "02", label: "STEP 2", title: "직무 & 질문 선택", subtitle: "원하는 기업 · 직무의 기출 문제 고르기",
    icon: <Briefcase className="h-6 w-6" />,
    bgClass: "bg-purple-50/50 border-purple-100/50",
    iconColor: "text-purple-600 bg-white",
    numColor: "text-purple-100",
  },
  {
    number: "03", label: "STEP 3", title: "실전처럼 말하기", subtitle: "AI 피드백으로 완성도 높이기",
    icon: <Mic2 className="h-6 w-6" />,
    bgClass: "bg-yellow-50/50 border-yellow-100/50",
    iconColor: "text-yellow-600 bg-white",
    numColor: "text-yellow-100/80",
  },
];

const FAQS = [
  {
    category: "카메라 · 화면",
    items: [
      { q: "카메라가 켜지지 않아요.", a: "브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭한 뒤, 카메라 권한을 '허용'으로 변경하고 새로고침 해주세요." },
      { q: "화면이 좌우 반전되어 보여요.", a: "자연스러운 면접 환경을 위해 카메라 미러링이 적용됩니다. 실제 녹화 분석은 원본 데이터로 처리됩니다." },
    ],
  },
  {
    category: "마이크 · 음성",
    items: [
      { q: "마이크 소리가 인식되지 않아요.", a: "마이크 권한을 허용해 주세요. 이어폰이나 헤드셋을 사용하면 인식률이 높아집니다." },
      { q: "주변 소음이 심한데 괜찮을까요?", a: "조용한 환경을 권장합니다. 소음이 많으면 WPM 측정과 무음 구간 감지의 정확도가 떨어질 수 있습니다." },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

export default function HowToPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const toggleFaq = (key: string) => setOpenFaq((prev) => (prev === key ? null : key));

  return (
    <main className="min-h-screen w-full font-sans bg-bg dark:bg-[#0f1729] transition-colors duration-300 overflow-hidden">
      <Navbar />

      <section className="relative w-full pt-36 pb-24 px-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-20 top-0 h-[560px] w-[560px] rounded-full bg-[#bfdbfe]/30 blur-[140px]" />
          <div className="absolute -right-10 -top-10 h-[600px] w-[600px] rounded-full bg-[#e9d5ff]/30 blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="relative z-10 mx-auto max-w-[1280px] text-center flex flex-col items-center"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 dark:bg-navy/30 text-purple-600 dark:text-purple-400 text-xs font-bold tracking-widest mb-6 border border-white/50 backdrop-blur-md shadow-sm">
            HOW TO USE
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-navy dark:text-white leading-tight tracking-tight">
            누구나 3분 안에 마스터하는<br />인터뷰핏 사용법
          </h1>
          <p className="mt-6 text-base md:text-lg text-navy/70 dark:text-neutral-400 leading-relaxed max-w-2xl font-medium">
            복잡한 대형 가이드는 걷어내고, 핵심적인 스튜디오 진행 프로세스 3단계만 요약했습니다.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-6 pb-28">
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hidden md:block absolute top-[52px] left-[calc(33.33%-24px)] right-[calc(33.33%-24px)] h-px border-t border-dashed border-black/10 dark:border-neutral-700 z-0" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
              className={`relative z-10 rounded-[28px] ${step.bgClass} border p-8 shadow-sm overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md`}
            >
              <span className={`pointer-events-none absolute -right-2 -bottom-5 text-[120px] font-black leading-none select-none ${step.numColor} font-serif`}>
                {step.number}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/60 text-navy mb-6 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-navy" />
                {step.label}
              </span>
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm ${step.iconColor}`}>
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-navy dark:text-white tracking-tight">{step.title}</h3>
              <p className="mt-1 text-sm text-navy/70 font-medium">{step.subtitle}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-14 flex justify-center">
          <Link
            href="/practice"
            className="flex items-center gap-3 rounded-full bg-navy dark:bg-white text-white dark:text-navy px-10 py-5 font-bold text-[15px] hover:scale-105 transition-transform shadow-lg shadow-navy/20"
          >
            지금 바로 시작하기 <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-[28px] bg-navy dark:bg-[#1e293b] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="flex-1 relative z-10">
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">원활한 사용을 위한 환경 안내</h3>
            <p className="text-sm text-blue-100/70 leading-relaxed font-medium">
              인터뷰핏은 최신 브라우저와 안정적인 인터넷 환경에서 가장 잘 작동합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 relative z-10 shrink-0">
            {[
              { icon: <MonitorSmartphone className="h-5 w-5" />, label: "Chrome / Safari", sub: "최신 버전 권장" },
              { icon: <Wifi className="h-5 w-5" />, label: "10Mbps 이상", sub: "안정적인 인터넷" },
              { icon: <Volume2 className="h-5 w-5" />, label: "웹캠 + 마이크", sub: "하드웨어 필수" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-3.5 backdrop-blur-sm border border-white/5">
                <div className="text-blue-300">{item.icon}</div>
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs text-blue-100/60 font-medium">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-navy dark:text-white tracking-tight">자주 묻는 질문</h2>
          <p className="mt-2 text-navy/60 dark:text-neutral-400 text-sm font-medium">문제가 해결되지 않으면 고객센터로 문의해 주세요.</p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {FAQS.map((group, gi) => (
            <motion.div key={gi} custom={gi} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} className="rounded-[24px] bg-white dark:bg-[#1e293b] border border-black/[0.04] dark:border-white/[0.04] overflow-hidden shadow-sm">
              <div className="px-7 py-4 border-b border-black/5 dark:border-white/[0.05]">
                <p className="text-xs font-bold text-navy/50 dark:text-neutral-500">{group.category}</p>
              </div>
              {group.items.map((item, ii) => {
                const key = `${gi}-${ii}`;
                const isOpen = openFaq === key;
                return (
                  <div key={ii} className="border-b border-black/5 dark:border-white/[0.04] last:border-b-0">
                    <button
                      onClick={() => toggleFaq(key)}
                      className="w-full flex items-center justify-between px-7 py-5 text-left gap-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-sm font-bold text-navy dark:text-white leading-relaxed">{item.q}</span>
                      <ChevronDown className={`h-4 w-4 text-navy/40 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                          <p className="px-7 pb-6 text-sm text-navy/70 dark:text-neutral-400 leading-relaxed font-medium">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}