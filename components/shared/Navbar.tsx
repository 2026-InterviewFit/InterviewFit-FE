"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu, X } from "lucide-react";
import {
  clearAuth,
  getAuthUser,
  isAuthenticated,
  subscribeToAuthChanges,
  type AuthUser,
} from "@/lib/auth";

const LANDING_MENUS = [
  { label: "기능 소개", href: "/features" },
  { label: "커뮤니티", href: "/community" },
  { label: "사용법", href: "/how-to" },
  { label: "소개", href: "/about" },
];

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setIsLoggedIn(isAuthenticated());
      setUser(getAuthUser());
    };

    syncAuthState();
    return subscribeToAuthChanges(syncAuthState);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setUser(null);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute left-0 top-0 z-50 w-full bg-transparent"
    >
      <div className="relative mx-auto flex h-20 max-w-[1280px] items-center justify-between px-6 md:px-8">
        <div className="z-50 flex w-auto justify-start md:w-1/3">
          <Link
            href="/"
            className="font-serif text-xl font-bold tracking-tight text-ink md:text-2xl"
          >
            InterviewFit
          </Link>
        </div>

        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-chip px-2 py-2 md:flex">
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

        <div className="z-50 flex w-auto items-center justify-end gap-3 md:w-1/3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2 md:gap-4">
              <Link
                href="/mypage/dashboard"
                className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-2 transition-colors hover:bg-gray-100 md:gap-2.5 md:pr-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <User className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <span className="hidden text-sm font-medium text-ink sm:block">
                  <strong className="font-bold">{user?.name ?? "사용자"}</strong>님
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="hidden rounded-full border border-line bg-white px-4 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-gray-50 hover:text-ink sm:block"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden h-10 items-center gap-1.5 rounded-full bg-navy px-5 text-sm font-medium text-white transition-transform hover:scale-[1.03] sm:flex"
            >
              시작하기
              <span aria-hidden>→</span>
            </Link>
          )}

          <button
            type="button"
            aria-label="메뉴 열기"
            className="flex items-center justify-center p-2 text-ink md:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 top-20 z-40 flex w-full flex-col gap-4 border-b border-line bg-white/95 px-6 py-6 shadow-lg backdrop-blur-xl md:hidden"
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
                className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-navy text-base font-bold text-white"
              >
                지금 시작하기
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-gray-100 text-base font-bold text-ink"
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
