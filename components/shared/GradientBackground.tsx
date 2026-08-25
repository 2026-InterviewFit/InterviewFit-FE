// components/shared/GradientBackground.tsx
"use client";

import { ReactNode } from "react";

interface GradientBackgroundProps {
  children: ReactNode;
}

export default function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 백그라운드 블롭 효과 (단일화) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-50 dark:opacity-30">
        <div className="absolute -left-20 -top-20 h-[600px] w-[600px] rounded-full bg-[#fef08a]/30 blur-[140px]" />
        <div className="absolute -right-10 top-20 h-[700px] w-[700px] rounded-full bg-[#bfdbfe]/40 blur-[150px]" />
        <div className="absolute bottom-[-100px] left-1/4 h-[500px] w-[700px] rounded-full bg-[#e9d5ff]/30 blur-[140px]" />
      </div>

      {/* 컨텐츠 레이어 */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}