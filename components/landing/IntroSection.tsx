"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link"; // 💡 Next.js의 Link 컴포넌트 추가!

const FEATURES = [
  {
    icon: "/3d-computer.png",
    alt: "컴퓨터 3D 아이콘",
    badge: "기능소개",
    title: "인터뷰핏의\n기능을 소개합니다",
    bgClass: "bg-gradient-to-br from-[#fef08a]/25 via-[#fef9c3]/10 to-white/50",
    href: "/features", // 💡 기능 소개 페이지 연결
  },
  {
    icon: "/3d-chat.png",
    alt: "채팅 3D 아이콘",
    badge: "커뮤니티",
    title: "취준생분들과\n꿀팁과 고민을 나눠보세요",
    bgClass: "bg-gradient-to-br from-[#bfdbfe]/25 via-[#dbeafe]/10 to-white/50",
    href: "/community", // 💡 커뮤니티 페이지 연결
  },
  {
    icon: "/3d-thumb.png",
    alt: "따봉 3D 아이콘",
    badge: "사용법",
    title: "인터뷰핏을\n똑똑하게 이용하는 방법",
    bgClass: "bg-gradient-to-br from-[#bfdbfe]/25 via-[#dbeafe]/10 to-white/50",
    href: "/how-to", // 💡 사용법 페이지 연결
  },
  {
    icon: "/3d-tool.png",
    alt: "도구 3D 아이콘",
    badge: "인터뷰핏 소개",
    title: "인터뷰핏과\n개발자들",
    bgClass: "bg-gradient-to-br from-[#fef08a]/25 via-[#fef9c3]/10 to-white/50",
    href: "/about", // 💡 소개 페이지 연결
  },
];

export default function IntroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem("mockSession");
    if (session === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <section className="w-full bg-white py-32">
      <div className="mx-auto w-full max-w-[1280px] px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8">
          
          {/* 좌측 텍스트 영역 */}
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

            {/* 빠른 시작 링크 버튼 */}
            <div className="mt-10 flex items-center">
              <a 
                href={isLoggedIn ? "/interview" : "/login"}
                className="group flex items-center gap-3 text-lg font-bold text-navy transition-all hover:text-blue-600"
              >
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-blue-600">
                  모의면접 빠른 시작하기
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chip text-navy transition-transform group-hover:translate-x-1.5 group-hover:bg-blue-600 group-hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </a>
            </div>
          </motion.div>

          {/* 우측 4개 기능 카드 구역 */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }} // 💡 마우스 올렸을 때 위로 더 부드럽게 들리는 효과 추가!
                className="h-full"
              >
                {/* 💡 카드의 div 껍데기를 <Link>로 전면 변경하여 상자 전체 클릭 기능 부여 */}
                <Link
                  href={feature.href}
                  className={`group flex h-full cursor-pointer flex-col justify-between rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] border border-black/[0.03] backdrop-blur-md transition-all duration-300 hover:shadow-[0_12px_32px_rgba(31,44,70,0.06)] ${feature.bgClass}`}
                >
                  {/* 깔끔하게 외부 3D 일러스트 에셋을 띄우는 공간 */}
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

                  <div className="mt-8 flex items-center text-xs font-semibold text-gray-400 transition-colors group-hover:text-navy">
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