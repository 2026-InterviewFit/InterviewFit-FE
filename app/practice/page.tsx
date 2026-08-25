"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Video, CheckCircle, Lightbulb, Play, Menu, X } from "lucide-react";

export default function PracticeLandingPage() {
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg font-sans text-ink relative transition-colors duration-300">
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 transform bg-white dark:bg-[#111827] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shrink-0
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onMenuClick={() => setIsMobileSidebarOpen(false)} />
        <button 
          className="absolute top-6 right-4 lg:hidden rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <X className="h-5 w-5 text-muted" />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto w-full">
        <div className="flex items-center px-6 pt-6 lg:px-10 lg:pt-8 w-full">
          <button 
            className="mr-4 lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-navy dark:text-white" />
          </button>
          <div className="flex-1">
            <Topbar />
          </div>
        </div>

        <main className="px-6 pb-12 pt-6 lg:px-10 lg:pt-10 flex flex-col w-full h-full max-w-5xl mx-auto">
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white">면접 연습 스튜디오</h2>
              <p className="mt-2 text-sm md:text-base text-muted dark:text-gray-400">실전과 동일한 환경에서 AI와 함께 모의면접을 진행합니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-colors duration-300">
                <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  <Video className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-navy dark:text-white text-lg">카메라 및 조명</h3>
                <p className="mt-2 text-sm text-muted dark:text-gray-400 leading-relaxed">
                  얼굴이 화면 중앙에 오도록 웹캠 각도를 조절해 주세요. 역광을 피하고 얼굴에 조명이 잘 받도록 밝은 곳을 권장합니다.
                </p>
              </div>

              <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-colors duration-300">
                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-navy dark:text-white text-lg">마이크 환경</h3>
                <p className="mt-2 text-sm text-muted dark:text-gray-400 leading-relaxed">
                  주변 소음이 적은 조용한 곳에서 진행해 주세요. 무선 이어폰 사용 시 음성 인식이 더욱 정밀해집니다.
                </p>
              </div>

              <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-colors duration-300">
                <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-navy dark:text-white text-lg">실전처럼 임하기</h3>
                <p className="mt-2 text-sm text-muted dark:text-gray-400 leading-relaxed">
                  답변이 막히더라도 당황하지 마세요. 실제 면접관이 앞에 있다고 생각하고 끝까지 답변하는 것이 중요합니다.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center rounded-[32px] bg-gradient-to-br from-[#1f2937] to-navy p-10 text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
              <h3 className="text-xl md:text-2xl font-bold text-white relative z-10">모든 준비가 끝났나요?</h3>
              <p className="mt-2 text-white/60 relative z-10">버튼을 누르면 전체화면으로 전환되며 카메라가 활성화됩니다.</p>
              
              <button 
                onClick={() => router.push("/interview")}
                className="mt-8 flex items-center gap-3 rounded-full bg-blue-600 px-10 py-4 text-base font-bold text-white shadow-xl hover:bg-blue-500 hover:-translate-y-1 transition-all relative z-10"
              >
                <Play className="h-5 w-5 fill-white" />
                실전 모의면접 시작하기
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}