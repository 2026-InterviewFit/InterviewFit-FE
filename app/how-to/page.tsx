// app/how-to/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Camera, Briefcase, Mic2, ChevronDown, ArrowRight, Wifi, Volume2, MonitorSmartphone } from "lucide-react";
import { useModalStore } from "@/store/useModalStore";

const STEPS = [
  {
    number: "01",
    label: "STEP 1",
    title: "장비 세팅",
    subtitle: "카메라 · 마이크 권한 허용",
    icon: <Camera className="h-7 w-7 transition-transform duration-500 group-hover:scale-110" />,
  },
  {
    number: "02",
    label: "STEP 2",
    title: "직무 & 질문 선택",
    subtitle: "원하는 기업 · 직무의 기출 문제 고르기",
    icon: <Briefcase className="h-7 w-7 transition-transform duration-500 group-hover:scale-110" />,
  },
  {
    number: "03",
    label: "STEP 3",
    title: "실전처럼 말하기",
    subtitle: "AI 피드백으로 완성도 높이기",
    icon: <Mic2 className="h-7 w-7 transition-transform duration-500 group-hover:scale-110" />,
  },
];

const FAQS = [
  {
    category: "카메라 · 마이크 세팅",
    items: [
      { q: "카메라가 켜지지 않아요.", a: "브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭한 뒤, 카메라 권한을 '허용'으로 변경하고 새로고침 해주세요." },
      { q: "마이크 소리가 인식되지 않아요.", a: "마이크 권한을 허용해 주세요. 이어폰이나 헤드셋을 사용하면 인식률이 높아집니다." },
      { q: "주변 소음이 심한데 괜찮을까요?", a: "조용한 환경을 권장합니다. 소음이 많으면 분당 발화 단어 수(WPM) 측정과 무음 구간 감지의 정확도가 떨어질 수 있습니다." },
    ],
  },
  {
    category: "서비스 이용 · 결과 분석",
    items: [
      { q: "AI 분석 리포트는 면접 종료 후 언제 나오나요?", a: "답변 길이에 따라 약간의 차이가 있으나, 일반적으로 면접 종료 직후 1~3분 내에 상세 분석 리포트가 완성됩니다." },
      { q: "면접 영상이나 스크립트가 다른 사람에게 유출될 수 있나요?", a: "본인의 면접 영상과 상세 기록은 철저히 암호화되어 본인만 확인할 수 있습니다. 단, 커뮤니티에 스크립트를 공유하실 때는 이름, 기업명 등 고유명사가 AI에 의해 100% 자동 마스킹 처리됩니다." },
      { q: "면접 위키에 있는 남의 질문을 제 모의면접에서 써보고 싶어요.", a: "면접 위키에서 마음에 들거나 연습하고 싶은 기출 질문의 '장바구니' 아이콘을 클릭하세요. 이후 면접 세팅 단계에서 해당 질문들을 바로 불러와 연습할 수 있습니다." },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HowToPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const toggleFaq = (key: string) => setOpenFaq((prev) => (prev === key ? null : key));
  
  const openInterviewModal = useModalStore((state) => state.openInterviewModal);

  return (
    <main className="min-h-screen w-full font-sans bg-bg transition-colors duration-300 overflow-hidden">
      <Navbar />

      <section className="relative w-full pt-32 pb-16 px-6 overflow-hidden">
        {/* 기존에 있던 파란색/보라색 배경 블러(blur) 효과 div를 제거했습니다. */}
        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto max-w-[1280px] text-center flex flex-col items-center"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-surface border border-line text-navy text-xs font-bold tracking-widest mb-6 shadow-sm">
            HOW TO USE
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-ink leading-tight tracking-tight">
            누구나 3분 안에 마스터하는<br />
            <span className="relative inline-block text-navy">
              <span className="relative z-10">인터뷰핏 사용법</span>
              <span className="absolute bottom-1 left-0 -z-10 h-4 w-full rounded-sm bg-brand-accent/50 md:bottom-2 md:h-5"></span>
            </span>
          </h1>
          <p className="mt-8 text-base md:text-lg text-muted leading-relaxed max-w-2xl font-medium">
            복잡한 대형 가이드는 걷어내고, 핵심적인 스튜디오 진행 프로세스 3단계만 요약했습니다.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-6 pb-28 pt-8">
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hidden md:block absolute top-[52px] left-[calc(33.33%-24px)] right-[calc(33.33%-24px)] h-px border-t border-dashed border-line z-0" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
              className="group relative z-10 rounded-[32px] bg-surface border border-line p-10 shadow-sm overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-navy hover:shadow-[0_12px_32px_rgba(54,76,132,0.08)]"
            >
              <span className="pointer-events-none absolute -right-4 -bottom-6 text-[140px] font-black leading-none select-none text-chip font-serif opacity-50 transition-opacity duration-500 group-hover:opacity-100">
                {step.number}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-bg text-navy mb-8 border border-line/50 transition-colors duration-500 group-hover:border-navy">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                {step.label}
              </span>
              
              <div className="h-14 w-14 rounded-2xl bg-chip text-navy flex items-center justify-center mb-6 transition-colors duration-500 group-hover:bg-navy group-hover:text-brand-accent">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-ink tracking-tight transition-colors duration-300 group-hover:text-navy">{step.title}</h3>
              <p className="mt-2 text-[15px] text-muted font-medium break-keep pr-8 relative z-10">{step.subtitle}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-20 flex justify-center">
          <button
            onClick={openInterviewModal}
            className="flex items-center gap-3 rounded-full bg-brand-accent px-10 py-5 font-bold text-[16px] text-navy shadow-lg transition-transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
          >
            지금 바로 시작하기 <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-[32px] bg-navy p-10 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="flex-1 relative z-10">
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">원활한 사용을 위한 환경 안내</h3>
            <p className="text-[15px] text-white/80 leading-relaxed font-medium">
              인터뷰핏은 최신 브라우저와 안정적인 인터넷 환경에서 가장 완벽하게 작동합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 relative z-10 shrink-0">
            {[
              { icon: <MonitorSmartphone className="h-5 w-5" />, label: "Chrome / Safari", sub: "최신 버전 권장" },
              { icon: <Wifi className="h-5 w-5" />, label: "10Mbps 이상", sub: "안정적인 인터넷" },
              { icon: <Volume2 className="h-5 w-5" />, label: "웹캠 + 마이크", sub: "하드웨어 필수" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-sm border border-white/10">
                <div className="text-brand-accent">{item.icon}</div>
                <div>
                  <p className="text-[15px] font-bold text-white">{item.label}</p>
                  <p className="text-[13px] text-white/60 font-medium">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-[800px] px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-ink tracking-tight">자주 묻는 질문</h2>
          <p className="mt-3 text-muted text-[15px] font-medium">찾으시는 내용이 없다면 좌측 하단의 이메일을 통해 문의해 주세요.</p>
        </motion.div>

        <div className="flex flex-col gap-5">
          {FAQS.map((group, gi) => (
            <motion.div key={gi} custom={gi} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} className="rounded-[28px] bg-surface border border-line overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-line bg-bg/50">
                <p className="text-[13px] font-bold text-navy">{group.category}</p>
              </div>
              {group.items.map((item, ii) => {
                const key = `${gi}-${ii}`;
                const isOpen = openFaq === key;
                return (
                  <div key={ii} className="border-b border-line last:border-b-0">
                    <button
                      onClick={() => toggleFaq(key)}
                      className="w-full flex items-center justify-between px-8 py-6 text-left gap-4 hover:bg-chip/30 transition-colors"
                    >
                      <span className="text-[16px] font-bold text-ink leading-relaxed transition-colors group-hover:text-navy">{item.q}</span>
                      <ChevronDown className={`h-5 w-5 text-muted shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-navy" : ""}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                          <p className="px-8 pb-8 pt-2 text-[15px] text-muted leading-relaxed font-medium break-keep">
                            {item.a}
                          </p>
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