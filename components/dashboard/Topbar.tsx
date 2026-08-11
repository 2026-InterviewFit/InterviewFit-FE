// components/dashboard/Topbar.tsx

"use client";

import { useEffect, useState } from "react";
import { getLoginUser } from "@/lib/auth";

interface TopbarProps {
  userName?: string;
}

export default function Topbar({ userName }: TopbarProps) {
  const [displayName, setDisplayName] = useState(userName ?? "사용자");

  const refreshUser = () => {
    const user = getLoginUser();
    setDisplayName(userName ?? user?.name?.trim() ?? "사용자");
  };

  useEffect(() => {
    refreshUser();

    window.addEventListener("auth-changed", refreshUser);
    window.addEventListener("storage", refreshUser);

    return () => {
      window.removeEventListener("auth-changed", refreshUser);
      window.removeEventListener("storage", refreshUser);
    };
  }, [userName]);

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
        {displayName.charAt(0)}
      </div>
    </div>
  );
}