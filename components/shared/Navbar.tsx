"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, User, X } from "lucide-react";

import {
  getAuthUser,
  isAuthenticated,
  logout,
  subscribeToAuthChanges,
} from "@/lib/auth";

const LANDING_MENUS = [
  { label: "기능 소개", href: "/features" },
  { label: "커뮤니티", href: "/community" },
  { label: "그룹 면접", href: "/group-interview" },
  { label: "PT 면접", href: "/pt-interview" },
  { label: "사용법", href: "/how-to" },
];

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("사용자");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      const authenticated = isAuthenticated();
      const user = getAuthUser();

      setIsLoggedIn(authenticated);
      setUserName(user?.name?.trim() || "사용자");
    };

    syncAuthState();

    const unsubscribe = subscribeToAuthChanges(() => {
      syncAuthState();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setUserName("사용자");
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-line bg-white/70 shadow-sm backdrop-blur-md dark:bg-[#0f1729]/70"
            : "bg-transparent"
        }`}
      >
        <div className="relative mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 md:h-20 md:px-8">
          {/* 좌측 로고 */}
          <div className="z-50 flex w-auto justify-start md:w-1/3">
            <Link
              href="/"
              className="font-serif text-xl font-bold tracking-tight text-ink transition-opacity hover:opacity-80 md:text-2xl"
            >
              InterviewFit
            </Link>
          </div>

          {/* 데스크톱 중앙 메뉴 */}
          <div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-line/50 bg-chip/50 px-2 py-1.5 backdrop-blur-sm md:flex">
            {LANDING_MENUS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink/80 transition-all hover:bg-white hover:text-ink hover:shadow-sm dark:hover:bg-surface"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* 우측 액션 영역 */}
          <div className="z-50 flex w-auto items-center justify-end gap-3 md:w-1/3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2 md:gap-4">
                <Link
                  href="/mypage/dashboard"
                  className="hidden rounded-full border border-navy bg-navy/5 px-4 py-1.5 text-xs font-bold text-navy transition-colors hover:bg-navy hover:text-white sm:block"
                >
                  대시보드
                </Link>

                <Link
                  href="/mypage/dashboard"
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-chip"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft/20 text-navy">
                    <User className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </div>
                  <span className="hidden text-sm font-medium text-ink sm:block">
                    <strong className="font-bold">{userName}</strong>님
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    void handleLogout();
                  }}
                  className="hidden rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-muted transition-colors hover:bg-chip hover:text-ink sm:block"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden h-9 items-center gap-1.5 rounded-full bg-navy px-5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.03] hover:shadow-md sm:flex"
              >
                시작하기
                <span aria-hidden>→</span>
              </Link>
            )}

            {/* 모바일 햄버거 */}
            <button
              type="button"
              aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
              className="flex items-center justify-center p-2 text-ink md:hidden"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 left-0 z-40 flex w-full flex-col gap-2 border-b border-line bg-surface-glass px-6 py-6 shadow-lg backdrop-blur-xl md:hidden"
            >
              {LANDING_MENUS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl p-3 text-base font-bold text-ink transition-colors hover:bg-chip hover:text-navy"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-2 h-px bg-line" />

              {isLoggedIn ? (
                <>
                  <Link
                    href="/mypage/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-navy text-sm font-bold text-navy transition-colors hover:bg-navy/5"
                  >
                    대시보드로 이동
                  </Link>

                  <Link
                    href="/mypage/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-chip text-sm font-bold text-ink"
                  >
                    <User className="h-4 w-4" strokeWidth={2.5} />
                    <strong className="font-bold">{userName}</strong>님
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      void handleLogout();
                    }}
                    className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-chip text-sm font-bold text-ink"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-navy text-sm font-bold text-white"
                >
                  지금 시작하기
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      <div className="h-16 md:h-20" />
    </>
  );
}