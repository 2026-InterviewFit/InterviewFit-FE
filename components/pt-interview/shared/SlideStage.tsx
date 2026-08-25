// components/pt-interview/shared/SlideStage.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Slide } from "@/types/ptInterview";
import { PALETTE } from "@/lib/communityData";

interface SlideStageProps {
  slides: Slide[];
  currentIdx: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect?: (index: number) => void;
  compact?: boolean;
  /** true면 부모의 남는 "높이"에 맞춰 슬라이드를 축소한다 (풀스크린 발표용) */
  fitHeight?: boolean;
  /** 선택된 썸네일 테두리 색 (밝은 배경=navy, 어두운 배경=white) */
  activeColor?: "navy" | "white";
}

export default function SlideStage({
  slides,
  currentIdx,
  onPrev,
  onNext,
  onSelect,
  compact = false,
  fitHeight = false,
  activeColor = "navy",
}: SlideStageProps) {
  const slide = slides[currentIdx];
  if (!slide) return null;

  const activeBorder = activeColor === "white" ? "border-white" : "border-navy";

  return (
    <div
      className={`flex w-full flex-col gap-3 ${
        fitHeight ? "h-full min-h-0" : ""
      }`}
    >
      {/* 메인 슬라이드 래퍼: fitHeight면 남는 높이를 먹고 그 안에서 16:9 유지 */}
      <div
        className={
          fitHeight
            ? "flex min-h-0 flex-1 items-center justify-center"
            : "w-full"
        }
      >
        <div
          className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${
            fitHeight
              ? "aspect-video h-full max-h-full w-auto max-w-full"
              : "aspect-video w-full"
          }`}
          style={{
            background: `linear-gradient(135deg, ${PALETTE.navy} 0%, ${PALETTE.sky} 100%)`,
          }}
        >
          <span className="font-serif text-[clamp(60px,12vw,120px)] font-bold text-white/15">
            {slide.slideNumber}
          </span>
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <span className="mb-1 w-fit rounded-md bg-black/40 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
              Slide {slide.slideNumber} / {slides.length}
            </span>
            {!compact && (
              <>
                <h3 className="text-xl font-bold text-white drop-shadow">
                  {slide.title}
                </h3>
                <p className="mt-1 max-w-lg text-sm font-medium text-white/80">
                  {slide.body}
                </p>
              </>
            )}
          </div>

          {/* 좌우 네비 */}
          <button
            onClick={onPrev}
            disabled={currentIdx === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-opacity hover:bg-black/60 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onNext}
            disabled={currentIdx === slides.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-opacity hover:bg-black/60 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 썸네일 레일 (항상 보이도록 shrink-0) */}
      <div className="flex shrink-0 justify-center gap-2 overflow-x-auto pb-1">
        {slides.map((s, i) => (
          <button
            key={s.slideNumber}
            onClick={() => onSelect?.(i)}
            className={`relative flex aspect-video h-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 transition-all ${
              i === currentIdx
                ? activeBorder
                : "border-transparent opacity-50 hover:opacity-100"
            }`}
            style={{
              background: `linear-gradient(135deg, ${PALETTE.navy} 0%, ${PALETTE.sky} 100%)`,
            }}
          >
            <span className="text-sm font-bold text-white/50">{s.slideNumber}</span>
          </button>
        ))}
      </div>
    </div>
  );
}