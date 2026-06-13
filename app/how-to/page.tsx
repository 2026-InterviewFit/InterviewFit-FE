"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import {
  Camera, Briefcase, Mic2, ChevronDown,
  ArrowRight, CheckCircle, Wifi, Volume2, MonitorSmartphone,
} from "lucide-react";

// ─── 3단계 튜토리얼 데이터 ────────────────────────────────────────
const STEPS = [
  {
    number: "01",
    label: "STEP 1",
    title: "장비 세팅",
    subtitle: "카메라 · 마이크 권한 허용",
    icon: <Camera className="h-7 w-7" />,
    color: {
      badge: "text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-900/20 dark:border-sky-800",
      icon: "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
      number: "text-sky-200 dark:text-sky-900",
      glow: "from-sky-100/60 to-white dark:from-sky-900/10 dark:to-[#1e293b]",
      dot: "bg-sky-500",
    },
    checks: [
      "브라우저 상단의 카메라 아이콘을 클릭해 권한을 허용합니다.",
      "마이크도 함께 허용해 주세요. 음성 분석에 필수입니다.",
      "역광을 피해 얼굴에 조명이 잘 들어오는 장소를 선택하세요.",
      "조용한 환경에서 진행하면 음성 인식 정확도가 높아집니다.",
    ],
  },
  {
    number: "02",
    label: "STEP 2",
    title: "직무 & 질문 선택",
    subtitle: "원하는 기업 · 직무의 기출 문제 고르기",
    icon: <Briefcase className="h-7 w-7" />,
    color: {
      badge: "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-900/20 dark:border-violet-800",
      icon: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
      number: "text-violet-200 dark:text-violet-900",
      glow: "from-violet-100/60 to-white dark:from-violet-900/10 dark:to-[#1e293b]",
      dot: "bg-violet-500",
    },
    checks: [
      "IT/개발, 비즈니스, 디자인 중 본인 직군을 선택합니다.",
      "세부 직무(프론트엔드, 마케팅 등)를 골라 맞춤 질문을 받으세요.",
      "질문은 실제 기출 데이터 기반으로 AI가 자동 생성합니다.",
      "원하는 기업을 지정하면 해당 기업 특화 질문이 포함됩니다.",
    ],
  },
  {
    number: "03",
    label: "STEP 3",
    title: "실전처럼 말하기",
    subtitle: "AI 피드백으로 완성도 높이기",
    icon: <Mic2 className="h-7 w-7" />,
    color: {
      badge: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800",
      icon: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      number: "text-emerald-200 dark:text-emerald-900",
      glow: "from-emerald-100/60 to-white dark:from-emerald-900/10 dark:to-[#1e293b]",
      dot: "bg-emerald-500",
    },
    checks: [
      "카운트다운 이후 질문이 화면에 표시되면 바로 답변을 시작합니다.",
      "답변이 끝나면 '답변 완료' 버튼을 눌러 다음 질문으로 넘어갑니다.",
      "모든 질문을 마치면 AI가 시선·발화 속도·논리성을 자동 분석합니다.",
      "대시보드에서 상세 리포트와 개선 포인트를 확인하세요.",
    ],
  },
];

// ─── FAQ 데이터 ───────────────────────────────────────────────────
const FAQS = [
  {
    category: "🎥 카메라 · 화면",
    items: [
      {
        q: "카메라가 켜지지 않아요.",
        a: "브라우저 주소창 왼쪽의 자물쇠(또는 카메라) 아이콘을 클릭한 뒤, 카메라 권한을 '허용'으로 변경하고 페이지를 새로고침 해주세요. Chrome 기준으로 설정 → 개인정보 보호 → 사이트 설정 → 카메라에서도 변경할 수 있습니다.",
      },
      {
        q: "화면이 좌우 반전되어 보여요. 정상인가요?",
        a: "네, 정상입니다. 인터뷰핏은 자연스러운 면접 환경을 위해 카메라 미러링(좌우 반전)을 기본으로 적용합니다. 실제 녹화 분석은 반전 없는 원본 데이터로 처리됩니다.",
      },
    ],
  },
  {
    category: "🎤 마이크 · 음성",
    items: [
      {
        q: "마이크 소리가 인식되지 않아요.",
        a: "카메라 권한과 동일하게 브라우저에서 마이크 권한을 허용해 주세요. 노트북 내장 마이크보다 유선 이어폰이나 헤드셋을 사용하면 인식률이 훨씬 높아집니다. macOS의 경우 시스템 환경설정 → 보안 및 개인 정보 → 마이크 항목도 확인하세요.",
      },
      {
        q: "주변 소음이 심한데 괜찮을까요?",
        a: "AI 음성 분석의 정확도를 위해 가능한 조용한 환경을 권장합니다. 소음이 많은 환경에서는 WPM(발화 속도) 측정과 무음 구간 감지의 정확도가 떨어질 수 있습니다.",
      },
    ],
  },
  {
    category: "📊 분석 결과",
    items: [
      {
        q: "분석 결과는 얼마나 기다려야 하나요?",
        a: "면접 영상 길이에 따라 다르지만, 보통 30초~2분 이내에 대시보드에서 확인하실 수 있습니다. 분석 중에는 유용한 면접 팁도 함께 제공되니 잠시 기다려 주세요!",
      },
      {
        q: "이전 면접 기록은 어디서 확인하나요?",
        a: "상단 메뉴 또는 사이드바의 '대시보드'로 이동하시면 지금까지의 모든 촬영 회차별 분석 리포트를 날짜순으로 확인하실 수 있습니다.",
      },
    ],
  },
  {
    category: "🔧 기타",
    items: [
      {
        q: "모바일에서도 사용할 수 있나요?",
        a: "현재 인터뷰핏은 데스크톱(PC/노트북) 환경에 최적화되어 있습니다. 모바일 브라우저에서도 기본 기능은 작동하지만, 카메라 각도와 화면 크기 특성상 PC 사용을 강력히 권장드립니다.",
      },
      {
        q: "면접 영상이 외부에 저장되거나 공개되나요?",
        a: "아니요. 촬영된 영상은 분석 목적으로만 사용되며, 외부 서버에 영구 저장되거나 제3자에게 공개되지 않습니다. 자세한 내용은 개인정보처리방침을 참고해 주세요.",
      },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HowToPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (key: string) =>
    setOpenFaq((prev) => (prev === key ? null : key));

  return (
    <main className="min-h-screen w-full font-sans bg-bg dark:bg-[#0f1729] transition-colors duration-300">
      <Navbar />

      {/* ── 히어로 섹션 ─────────────────────────────────────────── */}
      <section className="relative w-full pt-36 pb-24 px-6 overflow-hidden">
        {/* 배경 블롭 — 사용법 전용: 코럴 + 바나나 + 민트 */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-20 top-0 h-[560px] w-[560px] rounded-full bg-[#fed7aa]/35 blur-[140px]" />
          <div className="absolute -right-10 -top-10 h-[600px] w-[600px] rounded-full bg-[#fef9c3]/40 blur-[150px]" />
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] rounded-full bg-[#bbf7d0]/25 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto max-w-[1280px] text-center flex flex-col items-center"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-bold tracking-wide mb-6 border border-orange-100 dark:border-orange-800 backdrop-blur-md">
            HOW TO USE
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-navy dark:text-white leading-tight">
            누구나{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
              3분 안에
            </span>{" "}
            마스터하는<br />인터뷰핏 사용법
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted dark:text-gray-400 leading-relaxed max-w-2xl">
            복잡한 줄글 매뉴얼은 없습니다. 딱 3단계만 따라오시면 바로 AI 모의면접을 시작할 수 있습니다.
          </p>
        </motion.div>
      </section>

      {/* ── 3단계 튜토리얼 ─────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1280px] px-6 pb-28">

        {/* 스텝 연결 라인 + 카드 그리드 */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 데스크톱용 점선 연결선 */}
          <div className="hidden md:block absolute top-[52px] left-[calc(33.33%-24px)] right-[calc(33.33%-24px)] h-px border-t-2 border-dashed border-gray-200 dark:border-white/10 z-0" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              className={`relative z-10 rounded-[28px] bg-gradient-to-br ${step.color.glow} border border-black/[0.04] dark:border-white/[0.05] p-8 shadow-sm overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md`}
            >
              {/* 배경 큰 숫자 */}
              <span className={`pointer-events-none absolute -right-3 -bottom-5 text-[120px] font-black leading-none select-none ${step.color.number}`}>
                {step.number}
              </span>

              {/* 스텝 배지 */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${step.color.badge} mb-6`}>
                <span className={`h-1.5 w-1.5 rounded-full ${step.color.dot}`} />
                {step.label}
              </span>

              {/* 아이콘 */}
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-5 ${step.color.icon}`}>
                {step.icon}
              </div>

              {/* 제목 */}
              <h3 className="text-2xl font-bold text-navy dark:text-white">{step.title}</h3>
              <p className="mt-1 text-sm text-muted dark:text-gray-400">{step.subtitle}</p>

              {/* 체크리스트 */}
              <ul className="mt-6 flex flex-col gap-3 relative z-10">
                {step.checks.map((check, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-ink dark:text-gray-300 leading-relaxed">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                    {check}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 flex justify-center"
        >
          <Link
            href="/practice"
            className="flex items-center gap-3 rounded-full bg-navy dark:bg-white text-white dark:text-navy px-10 py-5 font-bold text-base hover:scale-105 transition-transform shadow-xl"
          >
            지금 바로 시작하기
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      {/* ── 시스템 요구사항 배너 ──────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1280px] px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[28px] bg-[#1f2937] dark:bg-[#1e293b] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex-1 relative z-10">
            <h3 className="text-xl font-bold text-white mb-2">원활한 사용을 위한 환경 안내</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              인터뷰핏은 최신 브라우저와 안정적인 인터넷 환경에서 가장 잘 작동합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 relative z-10 shrink-0">
            {[
              { icon: <MonitorSmartphone className="h-5 w-5" />, label: "Chrome / Edge / Safari", sub: "최신 버전 권장" },
              { icon: <Wifi className="h-5 w-5" />, label: "10Mbps 이상", sub: "안정적인 인터넷" },
              { icon: <Volume2 className="h-5 w-5" />, label: "웹캠 + 마이크", sub: "하드웨어 필수" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-3.5">
                <div className="text-blue-400">{item.icon}</div>
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs text-white/50">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── FAQ 아코디언 섹션 ────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1280px] px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold text-navy dark:text-white">자주 묻는 질문</h2>
          <p className="mt-2 text-muted dark:text-gray-400 text-sm">
            문제가 해결되지 않으면 고객센터로 문의해 주세요.
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {FAQS.map((group, gi) => (
            <motion.div
              key={gi}
              custom={gi}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="rounded-[24px] bg-white dark:bg-[#1e293b] border border-black/[0.03] dark:border-white/[0.05] overflow-hidden shadow-sm"
            >
              {/* 카테고리 헤더 */}
              <div className="px-7 py-4 border-b border-line/60 dark:border-white/[0.05]">
                <p className="text-sm font-bold text-muted dark:text-gray-400">{group.category}</p>
              </div>

              {/* FAQ 아이템 */}
              {group.items.map((item, ii) => {
                const key = `${gi}-${ii}`;
                const isOpen = openFaq === key;
                return (
                  <div key={ii} className="border-b border-line/50 dark:border-white/[0.04] last:border-b-0">
                    <button
                      onClick={() => toggleFaq(key)}
                      className="w-full flex items-center justify-between px-7 py-5 text-left gap-4 hover:bg-gray-50/70 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="text-sm font-semibold text-navy dark:text-white leading-relaxed">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted dark:text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="px-7 pb-6 text-sm text-muted dark:text-gray-400 leading-relaxed">
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