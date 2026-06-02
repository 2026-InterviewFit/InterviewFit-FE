"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem("mockSession");
    if (session === "true") setIsLoggedIn(true);
  }, []);

  const handleStart = () => {
    if (isLoggedIn) {
      router.push("/interview");
    } else {
      router.push("/login");
    }
  };

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-bg pt-20">
      
      {/* 토스풍 멀티 그라데이션 블롭 배경 */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-20 -top-40 h-[650px] w-[650px] rounded-full bg-[#fef08a]/30 blur-[150px]" />
        <div className="absolute top-10 -right-20 h-[750px] w-[750px] rounded-full bg-[#bfdbfe]/50 blur-[170px]" />
        <div className="absolute bottom-[-150px] left-1/4 h-[600px] w-[600px] rounded-full bg-[#e9d5ff]/30 blur-[140px]" />
      </div>
      
      {/* 메인 콘텐츠 영역 */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOut }}
          className="flex flex-col items-center"
        >
          <h1 className="font-serif text-[84px] font-light uppercase tracking-[-0.03em] text-navy drop-shadow-sm whitespace-nowrap">
            Interview<span className="font-bold">fit</span>
          </h1>
          <p className="mt-8 text-2xl font-medium tracking-tight text-ink/80">
            AI 분석과 함께 더욱 영리해지는 면접 연습
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: easeOut }}
          className="mt-14"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStart}
            className="flex cursor-pointer items-center gap-3 rounded-full bg-navy px-12 py-5 text-base font-bold text-white shadow-lg transition-colors hover:bg-navy-dark hover:shadow-xl"
          >
            <Video className="h-5 w-5" />
            지금 바로 모의면접 시작
          </motion.button>
        </motion.div>
      </div>

      {/* 💡 1번 수정 사항: 토스 스타일의 계속 위아래로 튕기는 스크롤 유도 라인 화살표 */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 cursor-pointer opacity-60 transition-opacity hover:opacity-100"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-navy" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" />
        </svg>
      </motion.div>

    </section>
  );
}