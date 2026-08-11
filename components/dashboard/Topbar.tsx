// components/dashboard/Topbar.tsx

"use client";

import { useEffect, useState } from "react";

import {
  getAuthUser,
  subscribeToAuthChanges,
} from "@/lib/auth";

interface TopbarProps {
  userName?: string;
}

export default function Topbar({
  userName,
}: TopbarProps) {
  const [
    displayName,
    setDisplayName,
  ] = useState(
    userName ?? "사용자",
  );

  useEffect(() => {
    /**
     * props로 이름을 직접 넘겨준 경우에는
     * 해당 이름을 우선 사용한다.
     */
    if (userName) {
      setDisplayName(
        userName,
      );

      return;
    }

    /**
     * userName prop이 없으면
     * 실제 카카오 로그인 사용자 정보를 사용한다.
     */
    const syncName = () => {
      const user =
        getAuthUser();

      setDisplayName(
        user?.name?.trim() ||
          "사용자",
      );
    };

    // 최초 렌더링 시 사용자 정보 적용
    syncName();

    // 로그인 / 로그아웃 상태 변경 감지
    return subscribeToAuthChanges(
      syncName,
    );
  }, [userName]);

  const initial =
    displayName.charAt(0) ||
    "?";

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted dark:text-gray-400">
          환영합니다, {displayName}님
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-navy dark:text-white">
          대시보드
        </h2>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white dark:bg-blue-600">
        {initial}
      </div>
    </div>
  );
}