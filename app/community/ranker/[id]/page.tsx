// app/community/ranker/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageSquareQuote } from "lucide-react";
import Navbar from "@/components/shared/Navbar";

export default function RankerProfilePage() {
  const params = useParams();
  const router = useRouter();
  
  return (
    <main className="min-h-screen bg-bg dark:bg-[#0f1729] flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute -top-40 right-20 h-[600px] w-[600px] rounded-full bg-[#e9d5ff]/30 blur-[150px]" />
      </div>

      <Navbar />
      <div className="relative z-10 flex-1 w-full max-w-[800px] mx-auto pt-32 px-6 pb-20">
        <button 
          onClick={() => router.push('/community?tab=ranking')}
          className="flex items-center gap-2 text-sm font-bold text-muted hover:text-navy dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> 커뮤니티로 돌아가기
        </button>

        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-[32px] p-10 border border-white/50 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-6 border-b border-black/5 dark:border-white/5 pb-8 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
              T
            </div>
            <div>
              <p className="text-sm font-bold text-blue-600 mb-1">Grandmaster · 종합 95점</p>
              <h1 className="text-3xl font-bold text-navy dark:text-white">랭커의 프로필</h1>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="font-bold flex items-center gap-2"><MessageSquareQuote className="w-5 h-5 text-blue-500" /> 합격 답변 모아보기</h3>
            {/* 유저가 공개를 허락한 스크립트 리스트가 들어갈 자리 */}
            <div className="p-6 bg-gray-50 dark:bg-[#0f1729] rounded-2xl border border-black/5">
              <p className="text-sm font-medium text-navy/80 dark:text-gray-300">"여기에 해당 유저의 훌륭한 답변 스크립트가 노출됩니다."</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}