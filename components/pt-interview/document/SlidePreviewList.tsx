// components/pt-interview/document/SlidePreviewList.tsx
"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Slide } from "@/types/ptInterview";
import { PALETTE } from "@/lib/communityData";

interface SlidePreviewListProps {
  slides: Slide[];
}

export default function SlidePreviewList({ slides }: SlidePreviewListProps) {
  return (
    <div className="space-y-4">
      <h3 className="px-1 text-sm font-bold text-ink">
        슬라이드 미리보기 <span className="text-muted">({slides.length}장)</span>
      </h3>

      <div className="flex flex-col gap-4">
        {slides.map((slide, i) => (
          <motion.article
            key={slide.slideNumber}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col gap-4 rounded-[20px] border border-line bg-surface p-5 shadow-sm sm:flex-row"
          >
            {/* 썸네일 (mock: 그라데이션 + 번호) */}
            <div
              className="relative flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-xl sm:w-48"
              style={{
                background: `linear-gradient(135deg, ${PALETTE.navy} 0%, ${PALETTE.sky} 100%)`,
              }}
            >
              <span className="font-serif text-5xl font-bold text-white/25">
                {slide.slideNumber}
              </span>
              <span className="absolute bottom-2 left-2 rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                Slide {slide.slideNumber}
              </span>
            </div>

            {/* 본문 */}
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-bold text-ink">{slide.title}</h4>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-muted">
                {slide.body}
              </p>
              <div
                className="mt-3 flex items-start gap-2 rounded-xl p-3"
                style={{ backgroundColor: "rgba(231,241,168,0.3)" }}
              >
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: PALETTE.limeInk }} />
                <p className="text-xs font-semibold leading-relaxed" style={{ color: PALETTE.limeInk }}>
                  {slide.aiSummary}
                </p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}