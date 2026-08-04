// app/pt-interview/[ptInterviewId]/waiting/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, Camera, CameraOff, Mic, MicOff, Eye, MessageSquare, Play } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import SlideStage from "@/components/pt-interview/shared/SlideStage";
import { usePtMedia } from "@/hooks/usePtMedia";
import { usePtInterviewStore } from "@/store/usePtInterviewStore";
import { formatSeconds } from "@/lib/ptInterviewData";

export default function PtWaitingPage() {
  const router = useRouter();
  const params = useParams();
  const ptInterviewId = params.ptInterviewId as string;

  const {
    meta,
    slides,
    currentSlideIdx,
    nextSlide,
    prevSlide,
    setCurrentSlideIdx,
    loadFallbackDocument,
  } = usePtInterviewStore();

  const { videoRef, cameraOn, micOn, error, toggleCamera, toggleMic } = usePtMedia();

  const prepSeconds = meta?.prepSeconds ?? 180;
  const [remaining, setRemaining] = useState(prepSeconds);

  useEffect(() => {
    loadFallbackDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRemaining(prepSeconds);
  }, [prepSeconds]);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => Math.max(r - 1, 0)), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  const goPresentation = () =>
    router.push(`/pt-interview/${ptInterviewId}/presentation`);

  return (
    <main className="relative flex min-h-screen flex-col bg-bg transition-colors duration-300 dark:bg-[#0f1729]">
      <Navbar />

      <div className="mx-auto w-full max-w-6xl flex-1 px-6 pb-28 pt-32">
        {/* 카운트다운 헤더 */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="flex items-center gap-1.5 rounded-full bg-brand-soft/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-navy">
            <Clock className="h-3 w-3" /> 준비 시간
          </span>
          <p className="font-serif text-6xl font-bold tracking-tight text-navy dark:text-white">
            {formatSeconds(remaining)}
          </p>
          <p className="text-sm font-medium text-muted">
            발표 전 자료와 장치를 점검하세요. 시간이 끝나면 자동으로 시작할 수 있어요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 좌측: 슬라이드 미리보기 */}
          <div className="lg:col-span-7">
            {slides.length > 0 && (
              <SlideStage
                slides={slides}
                currentIdx={currentSlideIdx}
                onPrev={prevSlide}
                onNext={nextSlide}
                onSelect={setCurrentSlideIdx}
              />
            )}
          </div>

          {/* 우측: 발표 정보 + 장치 테스트 */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {/* 발표 핵심 정보 */}
            <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-ink">발표 핵심 정보</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium text-muted">발표 주제</dt>
                  <dd className="max-w-[60%] truncate text-right font-bold text-ink">
                    {meta?.topic ?? "발표 주제"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-muted">직무</dt>
                  <dd className="font-bold text-ink">{meta?.job ?? "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-muted">발표 제한 시간</dt>
                  <dd className="font-bold text-ink">
                    {formatSeconds(meta?.limitSeconds ?? 300)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-muted">총 슬라이드 수</dt>
                  <dd className="font-bold text-ink">{slides.length}장</dd>
                </div>
              </dl>
            </div>

            {/* 장치 테스트 */}
            <div className="rounded-[24px] border border-line bg-surface p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-ink">장치 테스트</h3>
              <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-xl bg-[#0f1729]">
                {/* video는 항상 렌더 — 트랙만 켜고 끔 */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full -scale-x-100 object-cover"
                />
                {/* 카메라 OFF 오버레이 */}
                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0f1729] text-white/40">
                    <CameraOff className="h-8 w-8" />
                    <span className="text-xs font-bold">카메라 꺼짐</span>
                  </div>
                )}
                {/* 마이크 OFF 뱃지 */}
                {!micOn && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-red-500/90 px-2 py-1 text-[10px] font-bold text-white">
                    <MicOff className="h-3 w-3" /> 음소거
                  </span>
                )}
              </div>

              {error && (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-500">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={toggleCamera}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-xs font-bold transition-all ${
                    cameraOn
                      ? "border-navy bg-brand-soft/15 text-navy"
                      : "border-red-200 bg-red-50 text-red-500"
                  }`}
                >
                  {cameraOn ? <Camera className="h-3.5 w-3.5" /> : <CameraOff className="h-3.5 w-3.5" />}
                  카메라 {cameraOn ? "ON" : "OFF"}
                </button>
                <button
                  onClick={toggleMic}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-xs font-bold transition-all ${
                    micOn
                      ? "border-navy bg-brand-soft/15 text-navy"
                      : "border-red-200 bg-red-50 text-red-500"
                  }`}
                >
                  {micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                  마이크 {micOn ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {/* 발표 안내 */}
            <div
              className="flex flex-col gap-2 rounded-[20px] p-5"
              style={{ backgroundColor: "rgba(231,241,168,0.3)" }}
            >
              <p className="flex items-center gap-2 text-xs font-bold" style={{ color: "#3F4A1B" }}>
                <Eye className="h-3.5 w-3.5" /> 발표 중 시선·자세·음성·발표 내용을 분석합니다.
              </p>
              <p className="flex items-center gap-2 text-xs font-bold" style={{ color: "#3F4A1B" }}>
                <MessageSquare className="h-3.5 w-3.5" /> 발표 종료 후 AI 질의응답이 진행됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 발표 시작 버튼 */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={goPresentation}
            className="flex items-center gap-2 rounded-full bg-navy px-12 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            <Play className="h-5 w-5 fill-current" /> 발표 시작
          </button>
        </div>
      </div>
    </main>
  );
}