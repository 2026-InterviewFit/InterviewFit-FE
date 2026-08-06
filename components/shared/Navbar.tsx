// components/shared/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu, X } from "lucide-react";

const LANDING_MENUS = [
  { label: "기능 소개", href: "/features" },
  { label: "커뮤니티", href: "/community" },
  { label: "그룹 면접", href: "/group-interview" },
  { label: "PT 면접", href: "/pt-interview" },
  { label: "사용법", href: "/how-to" },
];

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userName = "김은재"; 

  useEffect(() => {
    const session = sessionStorage.getItem("mockSession");
    if (session === "true") setIsLoggedIn(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("mockSession");
    setIsLoggedIn(false);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "bg-white/70 dark:bg-[#0f1729]/70 backdrop-blur-md shadow-sm border-b border-line" : "bg-transparent"
        }`}
      >
        <div className="relative mx-auto flex h-16 md:h-20 max-w-[1280px] items-center justify-between px-6 md:px-8">
          
          {/* 좌측 로고 */}
          <div className="flex w-auto md:w-1/3 justify-start z-50">
            <Link href="/" className="font-serif text-xl md:text-2xl font-bold tracking-tight text-ink hover:opacity-80 transition-opacity">
              InterviewFit
            </Link>
          </div>

          {/* 데스크톱 중앙 고정 메뉴 */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-chip/50 backdrop-blur-sm px-2 py-1.5 border border-line/50">
            {LANDING_MENUS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink/80 transition-all hover:bg-white dark:hover:bg-surface hover:text-ink hover:shadow-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* 우측 액션 영역 */}
          <div className="flex w-auto md:w-1/3 justify-end items-center gap-3 z-50">
            {isLoggedIn ? (
              <div className="flex items-center gap-2 md:gap-4">
                <Link 
                  href="/mypage/dashboard"
                  className="flex items-center gap-2 rounded-full py-1.5 px-3 transition-colors hover:bg-chip"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft/20 text-navy">
                    <User className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-ink">
                    <strong className="font-bold">{userName}</strong>님
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="hidden sm:block rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-muted transition-colors hover:bg-chip hover:text-ink"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex h-9 items-center gap-1.5 rounded-full bg-navy px-5 text-sm font-bold text-white transition-transform hover:scale-[1.03] shadow-sm hover:shadow-md"
              >
                시작하기 <span aria-hidden>→</span>
              </Link>
            )}

            {/* 모바일 햄버거 메뉴 버튼 */}
            <button 
              className="md:hidden flex items-center justify-center p-2 text-ink"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 left-0 w-full bg-surface-glass backdrop-blur-xl border-b border-line shadow-lg md:hidden flex flex-col px-6 py-6 gap-2 z-40"
            >
              {LANDING_MENUS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base font-bold text-ink transition-colors hover:text-navy p-3 rounded-xl hover:bg-chip"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-line my-2" />
              {!isLoggedIn ? (
                <Link
                  href="/login"
                  className="mt-2 flex w-full h-12 items-center justify-center rounded-xl bg-navy text-sm font-bold text-white"
                >
                  지금 시작하기
                </Link>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="mt-2 flex w-full h-12 items-center justify-center rounded-xl bg-chip text-sm font-bold text-ink"
                >
                  로그아웃
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      <div className="h-16 md:h-20" />
    </>
  );
}