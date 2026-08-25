// app/community/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import FeedView from "@/components/community/views/FeedView";
import RankingView from "@/components/community/views/RankingView";
import WikiView from "@/components/community/views/WikiView";
import WikiFloatingBar from "@/components/community/WikiFloatingBar";

function CommunityContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "feed";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const toggleQuestion = (id: string, text: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(text) ? prev.filter((q) => q !== text) : [...prev, text]
    );
  };

  return (
    <>
      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-start gap-8 px-6 pb-28 pt-32 md:flex-row">
        {/* 좌측 탭 사이드바 */}
        <div className="z-20 w-full shrink-0 self-start md:sticky md:top-32 md:w-[220px]">
          <CommunitySidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* 메인 영역 — 세 탭 모두 배너 없이 각자의 헤더로 진입 */}
        <div className="min-w-0 flex-1">
          {activeTab === "feed" && <FeedView />}
          {activeTab === "ranking" && <RankingView />}
          {activeTab === "wiki" && (
            <WikiView selectedQuestions={selectedQuestions} onToggleQuestion={toggleQuestion} />
          )}
        </div>
      </div>

      {/* 위키는 우측 사이드 레일이 담당하므로 데스크톱에선 플로팅 바 숨김.
          모바일에서는 플로팅 바로 시작 버튼 제공 */}
      {activeTab === "wiki" && (
        <div className="lg:hidden">
          <WikiFloatingBar selectedQuestions={selectedQuestions} />
        </div>
      )}
    </>
  );
}

export default function CommunityPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-bg transition-colors duration-300 dark:bg-[#0f1729]">
      {/* 배경 블롭 (팔레트 톤) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-[#E7F1A8]/30 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-[600px] w-[600px] rounded-full bg-[#95B1EE]/40 blur-[160px]" />
      </div>

      <Navbar />
      <Suspense fallback={<div className="min-h-screen" />}>
        <CommunityContent />
      </Suspense>
      <Footer />
    </main>
  );
}