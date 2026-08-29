// app/mypage/settings/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AccountSettings from "@/components/settings/AccountSettings";
import DeviceSettings from "@/components/settings/DeviceSettings";
import ThemeSettings from "@/components/settings/ThemeSettings";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      {/* 💡 h-full 제거 및 하단 여백(pb-32) 추가 */}
      <main className="px-6 pb-32 pt-6 lg:px-10 lg:pt-10 flex flex-col w-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white">설정</h2>
            <p className="mt-2 text-sm text-muted dark:text-gray-400">계정 정보 및 기기, 디스플레이 환경을 설정합니다.</p>
          </div>

          <div className="flex flex-col gap-6">
            <AccountSettings />
            <DeviceSettings />
            <ThemeSettings />
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}