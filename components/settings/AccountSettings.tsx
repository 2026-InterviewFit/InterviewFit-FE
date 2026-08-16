// components/settings/AccountSettings.tsx

"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";

import {
  getAuthUser,
  subscribeToAuthChanges,
  type AuthUser,
} from "@/lib/auth";

export default function AccountSettings() {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  useEffect(() => {
    /**
     * 실제 카카오 로그인으로 저장된
     * 사용자 정보를 가져온다.
     */
    const syncUser = () => {
      const loginUser =
        getAuthUser();

      setUser(loginUser);
    };

    /**
     * 페이지 최초 진입 시
     * 사용자 정보 불러오기
     */
    syncUser();

    /**
     * 로그인 / 로그아웃 상태가 바뀌면
     * 사용자 정보도 다시 갱신한다.
     */
    return subscribeToAuthChanges(
      syncUser,
    );
  }, []);

  const displayName =
    user?.name?.trim() ||
    "사용자";

  const displayEmail =
    user?.email?.trim() ||
    "이메일 정보 없음";

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
        {/* 연결된 계정 */}
        <div className="flex items-center justify-between border-b border-line/50 py-3 dark:border-white/10">
          <div>
            <p className="font-medium text-ink dark:text-white">
              연결된 계정
            </p>

            <p className="mt-1 text-xs text-muted dark:text-gray-400">
              카카오 소셜 로그인 연동 중
            </p>
          </div>

          <span className="rounded-full bg-[#FEE500] px-3 py-1 text-xs font-bold text-[#191600]">
            Kakao
          </span>
        </div>

        {/* 이름 */}
        <div className="flex items-center justify-between border-b border-line/50 py-3 dark:border-white/10">
          <div>
            <p className="font-medium text-ink dark:text-white">
              이름
            </p>
          </div>

          <p className="text-sm font-bold text-navy dark:text-white">
            {displayName}
          </p>
        </div>

        {/* 이메일 */}
        <div className="flex items-center justify-between border-b border-line/50 py-3 dark:border-white/10">
          <div>
            <p className="font-medium text-ink dark:text-white">
              이메일
            </p>
          </div>

          <p className="text-sm font-medium text-muted dark:text-gray-300">
            {displayEmail}
          </p>
        </div>

        {/* 회원 ID */}
        <div className="flex items-center justify-between border-b border-line/50 py-3 dark:border-white/10">
          <div>
            <p className="font-medium text-ink dark:text-white">
              회원 ID
            </p>
          </div>

          <p className="text-sm font-medium text-muted dark:text-gray-300">
            {user?.id ?? "-"}
          </p>
        </div>

        {/* 계정 탈퇴 */}
        <div className="flex items-center justify-between py-3">
          <p className="font-medium text-ink dark:text-white">
            계정 탈퇴
          </p>

          <button
            type="button"
            className="text-xs font-medium text-red-500 transition-colors hover:text-red-600"
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
}