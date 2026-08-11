// components/shared/GlassCard.tsx
"use client";

import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function GlassCard({ children, className, delay = 0, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        // 기존의 투박한 border 대신, 빛을 받는 느낌의 얇은 링(ring)과 이너 섀도우 적용
        "relative rounded-[28px] bg-surface-glass shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10",
        className
      )}
      {...props}
    >
      {/* 상단 하이라이트 효과 (글래스모피즘 디테일) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
      
      {/* 실제 컨텐츠가 들어갈 공간 */}
      <div className="relative z-10 p-8 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}