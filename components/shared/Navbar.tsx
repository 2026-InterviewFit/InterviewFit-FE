"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User } from "lucide-react";

const LANDING_MENUS = [
  { label: "기능 소개", href: "/features" },
  { label: "커뮤니티", href: "/community" },
  { label: "사용법", href: "/how-to" },
  { label: "소개", href: "/about" },
];

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
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
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      // 💡 수정: bg-bg/80 backdrop-blur-md를 빼고 완벽히 투명하게 상단에 얹어지도록 설정
      className="absolute top-0 left-0 z-50 w-full bg-transparent"
    >
      <div className="relative mx-auto flex h-20 max-w-[1280px] items-center justify-between px-8">
        
        {/* 좌측 로고 */}
        <div className="flex w-1/3 justify-start">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-ink">
            InterviewFit
          </Link>
        </div>

        {/* 중앙 고정 메뉴 */}
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-chip px-2 py-2">
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

        {/* 우측 로그인 영역 */}
        <div className="flex w-1/3 justify-end">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link 
                href="/mypage/dashboard"
                className="flex items-center gap-2.5 rounded-full pl-1.5 pr-4 py-1.5 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <User className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-medium text-ink">
                  <strong className="font-bold">{userName}</strong>님
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-full border border-line bg-white px-4 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-gray-50 hover:text-ink"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-10 items-center gap-1.5 rounded-full bg-navy px-5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
            >
              시작하기
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>

      </div>
    </motion.nav>
  );
}