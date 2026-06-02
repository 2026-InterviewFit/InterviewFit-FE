"use client";

import { LayoutDashboard, Video, FileText, Settings, LogOut } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menus = [
    { id: "dashboard", label: "대시보드", icon: <LayoutDashboard className="h-4 w-4 shrink-0" /> },
    { id: "practice", label: "면접 연습", icon: <Video className="h-4 w-4 shrink-0" /> },
    { id: "report", label: "분석 리포트", icon: <FileText className="h-4 w-4 shrink-0" /> },
    { id: "settings", label: "설정", icon: <Settings className="h-4 w-4 shrink-0" /> },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("mockSession");
    window.location.href = "/";
  };

  return (
    // 💡 반응형 포인트: 기본 너비는 80px(아이콘만), 큰 화면(md 이상)에서 260px로 확장!
    <aside className="flex w-[80px] md:w-[260px] flex-col border-r border-black/[0.04] bg-white px-3 md:px-6 py-8 justify-between shrink-0 transition-all duration-300">
      <div>
        {/* 로고도 작은 화면에서는 대문자 I만 보이고 큰 화면에서 전체 노출 */}
        <h1 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-navy text-center md:text-left md:px-4">
          I<span className="hidden md:inline">nterview</span><span className="font-light">F<span className="hidden md:inline">it</span></span>
        </h1>

        <nav className="mt-12 flex flex-col gap-1.5">
          {menus.map((menu) => {
            const isActive = activeTab === menu.id;
            return (
              <button
                key={menu.id}
                onClick={() => setActiveTab(menu.id)}
                // 💡 작은 화면에서는 중앙 정렬, 큰 화면에서는 좌측 정렬
                className={`flex items-center justify-center md:justify-start gap-3.5 rounded-2xl p-3.5 md:px-4 md:py-3.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-navy text-white shadow-md shadow-navy/10"
                    : "text-muted hover:bg-black/[0.02] hover:text-ink"
                }`}
                title={menu.label}
              >
                {menu.icon}
                {/* 💡 핵심: 작은 화면에서는 글씨를 숨김(hidden), md 크기 이상에서만 노출(inline) */}
                <span className="hidden md:inline">{menu.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <button 
        onClick={handleLogout}
        className="flex items-center justify-center md:justify-start gap-3.5 rounded-2xl p-3.5 md:px-4 md:py-3.5 text-sm font-semibold text-red-500/80 hover:bg-red-50/50 transition-colors text-left"
        title="로그아웃"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span className="hidden md:inline">로그아웃</span>
      </button>
    </aside>
  );
}