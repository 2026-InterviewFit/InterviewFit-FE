// components/login/LoginCard.tsx

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

const easeOut = [0.22, 1, 0.36, 1] as const;

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth?: {
        authorize: (options: { redirectUri: string }) => void;
      };
    };
  }
}

export default function LoginCard() {
  const [isKakaoReady, setIsKakaoReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

    if (!kakaoKey) {
      setErrorMessage("NEXT_PUBLIC_KAKAO_JS_KEY가 .env.local에 없습니다.");
      return;
    }

    const timer = setInterval(() => {
      if (!window.Kakao) return;

      try {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoKey);
        }

        setIsKakaoReady(true);
        clearInterval(timer);
      } catch (error) {
        console.error("카카오 초기화 실패:", error);
        setErrorMessage("카카오 SDK 초기화에 실패했습니다.");
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const handleLogin = () => {
    setErrorMessage("");

    if (!window.Kakao?.Auth) {
      setErrorMessage("카카오 SDK가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    window.Kakao.Auth.authorize({
      redirectUri: `${window.location.origin}/oauth/kakao/callback`,
    });
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[1280px] items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: easeOut }}
        className="relative w-full max-w-[440px]"
      >
        <div className="pointer-events-none absolute -inset-6 rounded-[36px] bg-gradient-to-br from-white/30 to-navy/5 blur-2xl" />

        <div className="relative overflow-hidden rounded-[28px] border border-white/50 bg-white/40 px-10 py-14 shadow-[0_24px_70px_-20px_rgba(31,44,70,0.25)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeOut }}
            className="text-center text-base font-bold tracking-tight text-navy/70"
          >
            {BRAND.name}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: easeOut }}
            className="mt-3 text-center text-5xl font-bold tracking-[-0.02em] text-navy"
          >
            Login
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: easeOut }}
            className="mt-4 text-center text-sm leading-relaxed text-muted"
          >
            카카오 계정으로 바로 시작하세요.
          </motion.p>

          <motion.button
            onClick={handleLogin}
            disabled={!isKakaoReady}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: easeOut }}
            type="button"
            className="mt-10 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#FEE500] text-[15px] font-semibold text-[#191600] transition-all hover:scale-[1.015] hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KakaoIcon />
            {isKakaoReady ? "카카오로 시작하기" : "카카오 로그인 준비 중..."}
          </motion.button>

          {errorMessage && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-xs font-medium text-red-600">
              {errorMessage}
            </p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="mt-5 text-center text-[13px] text-muted"
          >
            처음이신가요? 카카오 로그인 한 번으로 자동 가입됩니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="mt-8 h-px w-full bg-navy/10"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-5 text-center text-[11px] leading-relaxed text-muted/90"
          >
            로그인 시{" "}
            <Link
              href="/terms"
              className="underline underline-offset-2 hover:text-navy"
            >
              이용약관
            </Link>{" "}
            및{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 hover:text-navy"
            >
              개인정보처리방침
            </Link>
            에 동의합니다.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}

function KakaoIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1.667c-4.602 0-8.333 2.948-8.333 6.583 0 2.358 1.572 4.428 3.937 5.59-.174.65-.628 2.348-.72 2.713-.111.454.166.448.35.326.144-.097 2.293-1.558 3.22-2.188.512.076 1.04.116 1.546.116 4.602 0 8.333-2.948 8.333-6.557C18.333 4.615 14.602 1.667 10 1.667z"
        fill="#191600"
      />
    </svg>
  );
}