"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Menu, X } from "lucide-react";

// 분리한 설정 컴포넌트 불러오기
import AccountSettings from "@/components/settings/AccountSettings";
import JobSettings from "@/components/settings/JobSettings";
import DeviceSettings from "@/components/settings/DeviceSettings";
import ThemeSettings from "@/components/settings/ThemeSettings";

export default function SettingsPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg font-sans text-ink relative transition-colors duration-300">
      {/* 모바일 사이드바 배경 */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* 사이드바 */}
      <div className={`fixed inset-y-0 left-0 z-50 transform bg-white dark:bg-[#111827] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shrink-0 ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar onMenuClick={() => setIsMobileSidebarOpen(false)} />
        <button className="absolute top-6 right-4 lg:hidden rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsMobileSidebarOpen(false)}>
          <X className="h-5 w-5 text-muted dark:text-gray-400" />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto w-full">
        {/* 탑바 */}
        <div className="flex items-center px-6 pt-6 lg:px-10 lg:pt-8 w-full">
          <button className="mr-4 lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors" onClick={() => setIsMobileSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-navy dark:text-white" />
          </button>
          <div className="flex-1"><Topbar /></div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <main className="px-6 pb-12 pt-6 lg:px-10 lg:pt-10 flex flex-col w-full h-full max-w-4xl mx-auto">
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white">설정</h2>
              <p className="mt-2 text-sm text-muted dark:text-gray-400">계정 정보 및 기기, 디스플레이 환경을 설정합니다.</p>
            </div>

            {/* 💡 깔끔하게 조립된 4개의 설정 컴포넌트들 */}
            <div className="flex flex-col gap-6">
              <AccountSettings />
              <JobSettings />
              <DeviceSettings />
              <ThemeSettings />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}