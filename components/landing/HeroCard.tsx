"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useCounter } from "@/hooks/useCounter";
import { LIVE_STATS } from "@/lib/constants";

const easeOut = [0.22, 1, 0.36, 1] as const;

// 일단 화면 띄워볼 수 있게 만든 가라 데이터 (나중에 백엔드 연동할 때 교체하면 됨!)
const MOCK_TESTIMONIALS = [
  { text: "인터뷰핏을 사용하고 자신감이 생겼어요.", user: "사용자 A님" },
  { text: "시선 처리 피드백이 정말 큰 도움이 됐습니다!", user: "취준생 B님" },
  { text: "덕분에 원하던 기업에 찰떡같이 합격했습니다!", user: "합격자 C님" },
];

// 큐브 회전 애니메이션 컴포넌트
function TestimonialCube({ testimonials }: { testimonials: typeof MOCK_TESTIMONIALS }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // 5초마다 다음 후기로 변경

    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="relative h-20 w-full overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: -16 }} // 위에서 등장
          animate={{ opacity: 1, y: 0 }}   // 중앙에 안착
          exit={{ opacity: 0, y: 16 }}     // 아래로 퇴장
          transition={{ duration: 0.6, ease: easeOut }} 
          className="flex flex-col items-center justify-center gap-2 px-4 absolute w-full"
        >
          <p className="font-sans text-lg font-medium leading-relaxed text-white/90 text-center tracking-tight">
            {testimonials[currentIndex].text}
          </p>
          <p className="text-xs text-white/40 font-normal">- {testimonials[currentIndex].user} -</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function HeroCard() {
  const usersCount = useCounter({
    target: LIVE_STATS.users,
    duration: 1500,
    delay: 600,
  });
  
  const satisfaction = useCounter({
    target: LIVE_STATS.satisfaction,
    duration: 1500,
    delay: 800,
    decimals: 1,
  });

  return (
    <section className="mx-auto w-full max-w-[1280px] px-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: easeOut }}
        className="relative mx-auto h-[380px] w-full max-w-5xl"
      >
        {/* 은은한 배경 글로우 효과로 카드의 무거운 느낌을 상쇄 */}
        <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-r from-navy/20 to-transparent blur-2xl opacity-50 pointer-events-none" />

        {/* 입체감을 주는 서브 레이어 (뒷판 디자인 고도화) */}
        <div className="absolute inset-x-6 -bottom-3 top-6 rounded-[32px] bg-navy/40 border border-white/5 backdrop-blur-sm pointer-events-none" />

        {/* 메인 비주얼 카드 */}
        <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#1b2538] via-navy-dark to-[#0b101a] shadow-2xl">
          {/* 부드러운 내부 은은한 광원 효과 */}
          <div className="absolute -left-10 -top-20 h-80 w-80 rounded-full bg-white/[0.05] blur-3xl pointer-events-none" />
          <div className="absolute right-10 bottom-0 h-72 w-72 rounded-full bg-navy/20 blur-3xl pointer-events-none" />

          {/* 상단 라이브 인디케이터 (유리 효과와 패딩으로 감싸 밸런스 조절) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="absolute top-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 backdrop-blur-md"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80">
              Live
            </span>
          </motion.div>

          {/* 통계 3분할 레이아웃 (강제 패딩 대신 내부 정렬 구조로 변경하여 시각적 안정감 부여) */}
          <div className="relative z-10 grid h-full grid-cols-3 items-center divide-x divide-white/[0.08] px-6 pt-6">
            
            {/* 1. 활성 사용자 */}
            <StatItem delay={0.8} label="활성 사용자">
              <div className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-white">
                {usersCount}
              </div>
              <div className="mt-2.5 text-xs text-white/40 font-normal tracking-wide">현재 연습 중</div>
            </StatItem>

            {/* 2. 사용자 한줄 후기 */}
            <StatItem delay={0.9} label="수강생 리얼 후기">
              <TestimonialCube testimonials={MOCK_TESTIMONIALS} />
            </StatItem>

            {/* 3. 만족도 */}
            <StatItem delay={1.0} label="사용자 만족도">
              <div className="flex items-baseline justify-center gap-1">
                <div className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-white">
                  {satisfaction}
                </div>
                <div className="text-xl text-white/30 font-light">/5</div>
              </div>
              <div className="mt-2.5 text-xs text-white/40 font-normal tracking-wide">★★★★★ 기준</div>
            </StatItem>

          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   재사용 컴포넌트
   ───────────────────────────────────────────── */

interface StatItemProps {
  children: React.ReactNode;
  label: string;
  delay: number;
}

function StatItem({ children, label, delay }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: easeOut }}
      className="flex flex-col items-center justify-center text-center h-full py-12 px-2"
    >
      <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
        {label}
      </div>
      <div className="w-full flex flex-col items-center justify-center min-h-[72px]">
        {children}
      </div>
    </motion.div>
  );
}