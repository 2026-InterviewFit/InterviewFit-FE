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
  fitHeight?: boolean;
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

  if (!slide) {
    return null;
  }

  const activeBorder =
    activeColor === "white"
      ? "border-white"
      : "border-navy";

  return (
    <div
      className={`flex w-full flex-col gap-3 ${
        fitHeight ? "h-full min-h-0" : ""
      }`}
    >
      {/* 메인 슬라이드 */}
      <div
        className={
          fitHeight
            ? "flex min-h-0 flex-1 items-center justify-center"
            : "w-full"
        }
      >
        <div
          className={`relative flex items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-white ${
            fitHeight
              ? "aspect-video h-full max-h-full w-auto max-w-full"
              : "aspect-video w-full"
          }`}
        >
          {slide.thumbnailUrl ? (
            <img
              key={slide.thumbnailUrl}
              src={slide.thumbnailUrl}
              alt={`Slide ${slide.slideNumber}`}
              className="h-full w-full object-contain bg-white"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${PALETTE.navy} 0%, ${PALETTE.sky} 100%)`,
              }}
            >
              <span className="font-serif text-[clamp(60px,12vw,120px)] font-bold text-white/15">
                {slide.slideNumber}
              </span>
            </div>
          )}

          {/* 슬라이드 번호 */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-6">
            <span className="mb-1 w-fit rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
              Slide {slide.slideNumber} / {slides.length}
            </span>

            {!compact && !slide.thumbnailUrl && (
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

          {/* 이전 */}
          <button
            type="button"
            onClick={onPrev}
            disabled={currentIdx === 0}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/65 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* 다음 */}
          <button
            type="button"
            onClick={onNext}
            disabled={currentIdx === slides.length - 1}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/65 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="다음 슬라이드"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 하단 썸네일 */}
      <div className="flex shrink-0 justify-center gap-2 overflow-x-auto pb-1">
        {slides.map((item, index) => (
          <button
            type="button"
            key={item.slideNumber}
            onClick={() => onSelect?.(index)}
            className={`relative flex aspect-video h-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-white transition-all ${
              index === currentIdx
                ? activeBorder
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
            aria-label={`${item.slideNumber}번 슬라이드`}
          >
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={`Slide ${item.slideNumber}`}
                className="h-full w-full object-contain"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${PALETTE.navy} 0%, ${PALETTE.sky} 100%)`,
                }}
              >
                <span className="text-sm font-bold text-white/60">
                  {item.slideNumber}
                </span>
              </div>
            )}

            <span className="absolute bottom-0.5 right-1 rounded bg-black/55 px-1 text-[8px] font-bold text-white">
              {item.slideNumber}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}