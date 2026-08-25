"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu, X } from "lucide-react";

const LANDING_MENUS = [
  { label: "기능 소개", href: "/features" },
  { label: "커뮤니티", href: "/community" },
  { label: "사용법", href: "/how-to" },
  { label: "소개", href: "/about" },
];

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userName = "김은재"; 

  useEffect(() => {
    const session = sessionStorage.getItem("mockSession");
    if (session === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("mockSession");
    setIsLoggedIn(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute top-0 left-0 z-50 w-full bg-transparent"
    >
      <div className="relative mx-auto flex h-20 max-w-[1280px] items-center justify-between px-6 md:px-8">
        
        {/* 좌측 로고 */}
        <div className="flex w-auto md:w-1/3 justify-start z-50">
          <Link href="/" className="font-serif text-xl md:text-2xl font-bold tracking-tight text-ink">
            InterviewFit
          </Link>
        </div>

        {/* 데스크톱 중앙 고정 메뉴 (모바일에서는 숨김) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-chip px-2 py-2">
          {LANDING_MENUS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-white hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* 우측 로그인 & 모바일 메뉴 토글 영역 */}
        <div className="flex w-auto md:w-1/3 justify-end items-center gap-3 z-50">
          {isLoggedIn ? (
            <div className="flex items-center gap-2 md:gap-4">
              <Link 
                href="/mypage/dashboard"
                className="flex items-center gap-2 md:gap-2.5 rounded-full md:pl-1.5 pr-2 md:pr-4 py-1.5 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <User className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <span className="hidden sm:block text-sm font-medium text-ink">
                  <strong className="font-bold">{userName}</strong>님
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="hidden sm:block rounded-full border border-line bg-white px-4 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-gray-50 hover:text-ink"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex h-10 items-center gap-1.5 rounded-full bg-navy px-5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
            >
              시작하기
              <span aria-hidden>→</span>
            </Link>
          )}

          {/* 모바일 햄버거 메뉴 버튼 */}
          <button 
            className="md:hidden flex items-center justify-center p-2 text-ink"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 (햄버거 버튼 클릭 시 등장) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-line shadow-lg md:hidden flex flex-col px-6 py-6 gap-4 z-40"
          >
            {LANDING_MENUS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-medium text-ink transition-colors hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!isLoggedIn ? (
              <Link
                href="/login"
                className="mt-4 flex w-full h-12 items-center justify-center rounded-xl bg-navy text-base font-bold text-white"
              >
                지금 시작하기
              </Link>
            ) : (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="mt-4 flex w-full h-12 items-center justify-center rounded-xl bg-gray-100 text-base font-bold text-ink"
              >
                로그아웃
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}