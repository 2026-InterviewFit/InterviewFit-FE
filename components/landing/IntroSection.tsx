"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { isAuthenticated, subscribeToAuthChanges } from "@/lib/auth";

const FEATURES = [
  {
    icon: "/3d-computer.png",
    alt: "컴퓨터 3D 아이콘",
    badge: "기능소개",
    title: "인터뷰핏의\n기능을 소개합니다",
    // 💡 다크 모드일 때는 그라데이션을 없애고 다크 네이비 카드로 변신!
    bgClass: "bg-gradient-to-br from-[#fef08a]/25 via-[#fef9c3]/10 to-white/50 dark:from-[#1e293b] dark:to-[#1e293b]",
    href: "/features",
  },
  {
    icon: "/3d-chat.png",
    alt: "채팅 3D 아이콘",
    badge: "커뮤니티",
    title: "취준생분들과\n꿀팁과 고민을 나눠보세요",
    bgClass: "bg-gradient-to-br from-[#bfdbfe]/25 via-[#dbeafe]/10 to-white/50 dark:from-[#1e293b] dark:to-[#1e293b]",
    href: "/community",
  },
  {
    icon: "/3d-thumb.png",
    alt: "따봉 3D 아이콘",
    badge: "사용법",
    title: "인터뷰핏을\n똑똑하게 이용하는 방법",
    bgClass: "bg-gradient-to-br from-[#bfdbfe]/25 via-[#dbeafe]/10 to-white/50 dark:from-[#1e293b] dark:to-[#1e293b]",
    href: "/how-to",
  },
  {
    icon: "/3d-tool.png",
    alt: "도구 3D 아이콘",
    badge: "인터뷰핏 소개",
    title: "인터뷰핏과\n개발자들",
    bgClass: "bg-gradient-to-br from-[#fef08a]/25 via-[#fef9c3]/10 to-white/50 dark:from-[#1e293b] dark:to-[#1e293b]",
    href: "/about",
  },
];

export default function IntroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const syncAuthState = () => setIsLoggedIn(isAuthenticated());
    syncAuthState();
    return subscribeToAuthChanges(syncAuthState);
  }, []);

  return (
    // 💡 bg-white를 bg-bg로 변경!
    <section className="w-full bg-bg py-32 transition-colors duration-300">
      <div className="mx-auto w-full max-w-[1280px] px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center lg:col-span-5 lg:pr-10"
          >
            <div>
              <h2 className="text-[clamp(32px,4vw,44px)] font-bold leading-tight text-ink">
                반가워요<br />
                interviewFit과 함께<br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">취업 성공!</span>
              </h2>
              <p className="mt-6 text-base font-medium leading-relaxed text-muted">
                핵심을 품은 인터뷰핏<br />
                내가 직접 설계하는 든든한 면접
              </p>
            </div>

            <div className="mt-10 flex items-center">
              <a 
                href={isLoggedIn ? "/interview" : "/login"}
                className="group flex items-center gap-3 text-lg font-bold text-navy dark:text-white transition-all hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-blue-600">
                  모의면접 빠른 시작하기
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chip text-navy dark:text-white transition-transform group-hover:translate-x-1.5 group-hover:bg-blue-600 group-hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </a>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }} 
                className="h-full"
              >
                <Link
                  href={feature.href}
                  className={`group flex h-full cursor-pointer flex-col justify-between rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] border border-black/[0.03] dark:border-white/[0.05] backdrop-blur-md transition-all duration-300 hover:shadow-[0_12px_32px_rgba(31,44,70,0.06)] ${feature.bgClass}`}
                >
                  <div className="relative mb-8 h-14 w-14 transition-transform duration-300 group-hover:scale-110">
                    <Image
                      src={feature.icon}
                      alt={feature.alt}
                      fill
                      className="object-contain"
                    />
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold text-muted">
                      {feature.badge}
                    </span>
                    <h4 className="mt-2 whitespace-pre-line text-lg font-bold leading-snug text-ink">
                      {feature.title}
                    </h4>
                  </div>

                  <div className="mt-8 flex items-center text-xs font-semibold text-gray-400 transition-colors group-hover:text-navy dark:group-hover:text-blue-400">
                    자세히보기
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}