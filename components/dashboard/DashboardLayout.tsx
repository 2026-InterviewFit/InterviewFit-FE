// components/dashboard/DashboardLayout.tsx
"use client";

import { useState, ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Menu, X } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    // 💡 강제 bg-white를 제거하고, 다시 테마 변수인 bg-bg(우리가 방금 설정한 가짜 흰색)를 적용합니다.
    <div className="flex h-screen overflow-hidden bg-bg dark:bg-[#0f1729] font-sans text-ink relative transition-colors duration-300">
      
      {/* 모바일 사이드바 배경 오버레이 */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 좌측 사이드바 (여기는 배경과 분리감을 주기 위해 순백색 bg-white 유지) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform bg-white dark:bg-[#111827] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shrink-0 border-r border-line shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onMenuClick={() => setIsMobileSidebarOpen(false)} />
        <button 
          className="absolute top-6 right-4 lg:hidden rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <X className="h-5 w-5 text-muted dark:text-gray-400" />
        </button>
      </div>

      {/* 우측 메인 콘텐츠 영역 (스크롤 영역) */}
      <div className="flex flex-1 flex-col overflow-y-auto w-full">
        {/* 공통 탑바 */}
        <div className="flex items-center px-6 pt-6 lg:px-10 lg:pt-8 w-full shrink-0">
          <button 
            className="mr-4 lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-navy dark:text-white" />
          </button>
          <div className="flex-1">
            <Topbar />
          </div>
        </div>

        {/* 💡 각 페이지의 알맹이 컨텐츠가 들어갈 자리 */}
        {children}
      </div>
    </div>
  );
}