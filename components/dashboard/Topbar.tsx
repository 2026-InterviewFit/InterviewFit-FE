"use client";

import { useEffect, useState } from "react";
import {
  getAuthUser,
  subscribeToAuthChanges,
  type AuthUser,
} from "@/lib/auth";

interface TopbarProps {
  userName?: string;
}

export default function Topbar({ userName }: TopbarProps) {
  const [displayName, setDisplayName] = useState<string>(userName ?? "");

  useEffect(() => {
    // props로 이름이 주어진 경우 우선 사용
    if (userName) {
      setDisplayName(userName);
      return;
    }

    // 아니면 카카오 로그인 사용자 이름 사용
    const syncName = () => {
      const user: AuthUser | null = getAuthUser();
      setDisplayName(user?.name ?? "");
    };

    syncName();
    return subscribeToAuthChanges(syncName);
  }, [userName]);

  const initial = displayName ? displayName.charAt(0) : "?";

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted dark:text-gray-400">
          환영합니다{displayName ? `, ${displayName}님` : ""}
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-navy dark:text-white">
          대시보드
        </h2>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy dark:bg-blue-600 text-sm font-bold text-white">
        {initial}
      </div>
    </div>
  );
}