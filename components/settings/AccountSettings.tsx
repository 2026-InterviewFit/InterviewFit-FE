<<<<<<< HEAD
=======
// components/settings/AccountSettings.tsx

>>>>>>> 1ce31347900df66ee67e56d098bfc7ee860a6214
"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
<<<<<<< HEAD
import {
  getAuthUser,
  subscribeToAuthChanges,
  type AuthUser,
} from "@/lib/auth";

export default function AccountSettings() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => {
      setUser(getAuthUser());
    };

    syncUser();
    return subscribeToAuthChanges(syncUser);
  }, []);

  const displayName = user?.name ?? "-";
  const displayEmail = user?.email ?? "-";

=======
import { getLoginUser, type InterviewFitUser } from "@/lib/auth";

export default function AccountSettings() {
  const [user, setUser] = useState<InterviewFitUser | null>(null);

  const refreshUser = () => {
    setUser(getLoginUser());
  };

  useEffect(() => {
    refreshUser();

    window.addEventListener("auth-changed", refreshUser);
    window.addEventListener("storage", refreshUser);

    return () => {
      window.removeEventListener("auth-changed", refreshUser);
      window.removeEventListener("storage", refreshUser);
    };
  }, []);

>>>>>>> 1ce31347900df66ee67e56d098bfc7ee860a6214
  return (
    <div className="rounded-[24px] border border-black/[0.02] bg-white p-8 shadow-sm transition-colors duration-300 dark:border-white/[0.05] dark:bg-[#1e293b]">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <User className="h-5 w-5" />
        </div>

        <h3 className="text-lg font-bold text-navy dark:text-white">
          계정 관리
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-line/50 py-3 dark:border-white/10">
          <div>
            <p className="font-medium text-ink dark:text-white">연결된 계정</p>
<<<<<<< HEAD
            <p className="text-xs text-muted dark:text-gray-400 mt-1">
              카카오 소셜 로그인 연동 중
            </p>
          </div>
          <span className="px-3 py-1 bg-[#FEE500] text-[#191600] text-xs font-bold rounded-full">
=======
            <p className="mt-1 text-xs text-muted dark:text-gray-400">
              카카오 소셜 로그인 연동 중
            </p>
          </div>

          <span className="rounded-full bg-[#FEE500] px-3 py-1 text-xs font-bold text-[#191600]">
>>>>>>> 1ce31347900df66ee67e56d098bfc7ee860a6214
            Kakao
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-line/50 py-3 dark:border-white/10">
          <div>
            <p className="font-medium text-ink dark:text-white">이름</p>
          </div>
<<<<<<< HEAD
          <p className="text-sm font-bold text-navy dark:text-white">
            {displayName}
          </p>
        </div>
        {user?.email && (
          <div className="flex justify-between items-center py-3 border-b border-line/50 dark:border-white/10">
            <div>
              <p className="font-medium text-ink dark:text-white">이메일</p>
            </div>
            <p className="text-sm font-bold text-navy dark:text-white">
              {displayEmail}
            </p>
          </div>
        )}
        <div className="flex justify-between items-center py-3">
          <p className="font-medium text-ink dark:text-white">계정 탈퇴</p>
          <button className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors">
=======

          <p className="text-sm font-bold text-navy dark:text-white">
            {user?.name ?? "사용자"}
          </p>
        </div>

        <div className="flex items-center justify-between border-b border-line/50 py-3 dark:border-white/10">
          <div>
            <p className="font-medium text-ink dark:text-white">이메일</p>
          </div>

          <p className="text-sm font-medium text-muted dark:text-gray-300">
            {user?.email ?? "이메일 정보 없음"}
          </p>
        </div>

        <div className="flex items-center justify-between border-b border-line/50 py-3 dark:border-white/10">
          <div>
            <p className="font-medium text-ink dark:text-white">회원 ID</p>
          </div>

          <p className="text-sm font-medium text-muted dark:text-gray-300">
            {user?.id ?? "-"}
          </p>
        </div>

        <div className="flex items-center justify-between py-3">
          <p className="font-medium text-ink dark:text-white">계정 탈퇴</p>

          <button
            className="text-xs font-medium text-red-500 transition-colors hover:text-red-600"
            type="button"
          >
>>>>>>> 1ce31347900df66ee67e56d098bfc7ee860a6214
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
}