"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon } from "lucide-react";

export default function ThemeSettings() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
          <Moon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-navy dark:text-white">테마 설정</h3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3">
          <div>
            <p className="font-medium text-ink dark:text-white">🦉 심야/새벽 집중 모드</p>
            <p className="text-xs text-muted dark:text-gray-400 mt-1">늦은 시간 눈의 피로를 덜어주는 다크 테마를 적용합니다.</p>
          </div>
          <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-12 h-6 rounded-full transition-colors relative ${isDark ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isDark ? "left-6.5 translate-x-[2px]" : "left-0.5"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}