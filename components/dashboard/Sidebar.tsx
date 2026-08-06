"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearAuth } from "@/lib/auth";

interface SidebarProps {
  onMenuClick?: () => void;
}

export default function Sidebar({ onMenuClick }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  const menuItems = [
    { name: "대시보드", path: "/mypage/dashboard" },
    { name: "면접 연습", path: "/practice" }, 
    { name: "설정", path: "/mypage/settings" },
  ];

  return (
    // 💡 배경을 dark:bg-[#111827]로 연동하고 테두리도 어둡게 처리!
    <aside className="flex w-[240px] shrink-0 flex-col justify-between border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#111827] px-6 py-8 h-full min-h-screen transition-colors duration-300">
      <div>
        <Link href="/" className="text-2xl font-semibold tracking-tight text-ink hover:text-blue-600 transition-colors">
          InterviewFit
        </Link>

        <nav className="mt-10 flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");
            
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onMenuClick}
                className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-black text-white dark:bg-white dark:text-black" // 활성화 시 흑백 반전
                    : "text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5" // 비활성화 시 색상
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mb-4">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}