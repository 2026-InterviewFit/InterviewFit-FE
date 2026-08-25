// components/pt-interview/document/SlidePreviewList.tsx
"use client";

import { motion } from "framer-motion";
import { Sparkles, ImageOff } from "lucide-react";
import type { Slide } from "@/types/ptInterview";
import { PALETTE } from "@/lib/communityData";

interface SlidePreviewListProps {
  slides: Slide[];
}

export default function SlidePreviewList({
  slides,
}: SlidePreviewListProps) {
  return (
    <div className="space-y-4">
      <h3 className="px-1 text-sm font-bold text-ink">
        슬라이드 미리보기{" "}
        <span className="text-muted">
          ({slides.length}장)
        </span>
      </h3>

      <div className="flex flex-col gap-5">
        {slides.map((slide, i) => (
          <motion.article
            key={slide.slideNumber}
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: i * 0.05,
            }}
            className="
              flex
              flex-col
              gap-5
              rounded-[20px]
              border
              border-line
              bg-surface
              p-5
              shadow-sm
              lg:flex-row
            "
          >
            {/* 실제 PDF / PPT 슬라이드 이미지 */}
            <div
              className="
                relative
                aspect-video
                w-full
                shrink-0
                overflow-hidden
                rounded-xl
                border
                border-line
                bg-white
                lg:w-[320px]
              "
            >
              {slide.thumbnailUrl ? (
                <img
                  src={slide.thumbnailUrl}
                  alt={`Slide ${slide.slideNumber}`}
                  className="
                    h-full
                    w-full
                    object-contain
                    bg-white
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-full
                    w-full
                    flex-col
                    items-center
                    justify-center
                    gap-2
                    bg-slate-50
                    text-muted
                  "
                >
                  <ImageOff className="h-7 w-7" />

                  <span className="text-xs font-semibold">
                    슬라이드 이미지 없음
                  </span>
                </div>
              )}

              <span
                className="
                  absolute
                  bottom-2
                  left-2
                  rounded-md
                  bg-black/60
                  px-2
                  py-1
                  text-[10px]
                  font-bold
                  text-white
                  backdrop-blur-sm
                "
              >
                Slide {slide.slideNumber}
              </span>
            </div>

            {/* 분석 결과 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <span
                  className="
                    mt-0.5
                    rounded-md
                    bg-slate-100
                    px-2
                    py-1
                    text-xs
                    font-bold
                    text-muted
                  "
                >
                  {slide.slideNumber}
                </span>

                <h4 className="text-lg font-bold leading-snug text-ink">
                  {slide.title?.trim() ||
                    `슬라이드 ${slide.slideNumber}`}
                </h4>
              </div>

              <div
                className="
                  mt-4
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  p-4
                "
                style={{
                  backgroundColor:
                    "rgba(231,241,168,0.3)",
                }}
              >
                <Sparkles
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                  "
                  style={{
                    color: PALETTE.limeInk,
                  }}
                />

                <div className="min-w-0">
                  <p
                    className="
                      mb-1
                      text-xs
                      font-bold
                    "
                    style={{
                      color: PALETTE.limeInk,
                    }}
                  >
                    AI 핵심 분석
                  </p>

                  <p
                    className="
                      whitespace-pre-line
                      text-sm
                      font-medium
                      leading-7
                    "
                    style={{
                      color: PALETTE.limeInk,
                    }}
                  >
                    {slide.aiSummary?.trim() ||
                      "분석 결과가 없습니다."}
                  </p>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}