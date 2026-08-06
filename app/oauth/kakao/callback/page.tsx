"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { kakaoLogin } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const requestedRef = useRef(false);
  const [message, setMessage] = useState("카카오 로그인 처리 중입니다...");

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    if (error) {
      setMessage(errorDescription ?? "카카오 로그인이 취소되었거나 실패했습니다.");
      return;
    }

    if (!code) {
      setMessage("카카오 인가 코드가 없습니다. 로그인 페이지에서 다시 시도해주세요.");
      return;
    }

    const completeLogin = async () => {
      try {
        const response = await kakaoLogin(code);
        saveAuth(response.token, response.user);
        router.replace("/");
      } catch (errorValue) {
        setMessage(
          errorValue instanceof Error
            ? errorValue.message
            : "카카오 로그인 처리 중 오류가 발생했습니다."
        );
      }
    };

    void completeLogin();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-10 text-center shadow-xl">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#FEE500] border-t-transparent" />
        <h1 className="mt-6 text-xl font-bold text-navy">카카오 로그인</h1>
        <p className="mt-3 break-keep text-sm leading-relaxed text-muted">{message}</p>
        {!message.includes("처리 중") && (
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-6 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white"
          >
            로그인 페이지로 돌아가기
          </button>
        )}
      </div>
    </main>
  );
}
