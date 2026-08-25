"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";
import { isLoggedIn } from "@/lib/auth";
import InterviewTypeModal from "./InterviewTypeModal";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshAuthState = () => {
    setLoggedIn(isLoggedIn());
  };

  useEffect(() => {
    refreshAuthState();

    window.addEventListener("auth-changed", refreshAuthState);
    window.addEventListener("storage", refreshAuthState);

    return () => {
      window.removeEventListener("auth-changed", refreshAuthState);
      window.removeEventListener("storage", refreshAuthState);
    };
  }, []);

  const handleStart = () => {
    if (loggedIn) {
      // 로그인되어 있으면 모달을 엽니다.
      setIsModalOpen(true);
    } else {
      // 로그인되어 있지 않으면 로그인 페이지로 보냅니다.
      router.push("/login");
    }
  };

  return (
    <>
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-bg pt-20">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-10 -top-20 h-[400px] w-[400px] rounded-full bg-[#fef08a]/30 blur-[100px] md:-left-20 md:-top-40 md:h-[650px] md:w-[650px] md:blur-[150px]" />
          <div className="absolute -right-10 top-10 h-[500px] w-[500px] rounded-full bg-[#bfdbfe]/50 blur-[120px] md:-right-20 md:h-[750px] md:w-[750px] md:blur-[170px]" />
          <div className="absolute bottom-[-100px] left-1/4 h-[400px] w-[400px] rounded-full bg-[#e9d5ff]/30 blur-[100px] md:bottom-[-150px] md:h-[600px] md:w-[600px] md:blur-[140px]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-center justify-center px-6 text-center md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeOut }}
            className="flex flex-col items-center"
          >
            <h1 className="flex flex-col gap-2 font-serif text-5xl font-light uppercase tracking-[-0.03em] text-navy drop-shadow-sm md:flex-row md:gap-0 md:text-7xl lg:text-[84px]">
              <span>Interview</span>
              <span className="font-bold">fit</span>
            </h1>

            <p className="mt-6 break-keep text-lg font-medium tracking-tight text-ink/80 md:mt-8 md:text-2xl">
              AI 분석과 함께 더욱 영리해지는 면접 연습
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: easeOut }}
            className="mt-10 md:mt-14"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleStart}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-navy px-8 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-navy-dark hover:shadow-xl sm:w-auto md:px-12 md:py-5 md:text-base"
              type="button"
            >
              <Video className="h-5 w-5" />
              {loggedIn ? "지금 바로 모의면접 시작" : "로그인하고 모의면접 시작"}
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 cursor-pointer opacity-60 transition-opacity hover:opacity-100 md:bottom-10"
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
          }
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-navy"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5V19M12 19L5 12M12 19L19 12" />
          </svg>
        </motion.div>
      </section>

      {/* 면접 종류 선택 모달 렌더링 */}
      <InterviewTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}