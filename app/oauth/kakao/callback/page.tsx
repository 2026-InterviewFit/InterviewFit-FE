// app/oauth/kakao/callback/page.tsx

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveLogin } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] =
    useState("카카오 로그인 처리 중입니다...");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription =
      searchParams.get("error_description");

    if (error) {
      setErrorMessage(
        `카카오 로그인 실패: ${errorDescription ?? error}`
      );
      return;
    }

    if (!code) {
      setErrorMessage("카카오 인가 코드가 없습니다.");
      return;
    }

    const sendCodeToBackend = async () => {
      try {
        setMessage(
          "백엔드로 로그인 정보를 전달하는 중입니다..."
        );

        const response = await fetch(
          `${API_BASE_URL}/api/users/kakao-login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          console.error("========== 백엔드 오류 ==========");
          console.error("Status :", response.status);
          console.error("Body :", errorText);
          console.error("===============================");

          throw new Error(
            `백엔드 로그인 실패 (${response.status}) ${
              errorText ? `: ${errorText}` : ""
            }`
          );
        }

        const data = await response.json();

        saveLogin(data);

        setMessage("로그인 성공! 홈으로 이동합니다...");

        router.replace("/");
      } catch (error) {
        console.error("로그인 에러:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "로그인 처리 중 알 수 없는 오류가 발생했습니다."
        );
      }
    };

    void sendCodeToBackend();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-md rounded-[28px] border border-white/50 bg-white/70 px-8 py-10 text-center shadow-[0_24px_70px_-20px_rgba(31,44,70,0.25)] backdrop-blur-2xl">
        <p className="text-sm font-bold text-navy/70">
          InterviewFit
        </p>

        <h1 className="mt-3 text-2xl font-bold text-navy">
          카카오 로그인
        </h1>

        {errorMessage ? (
          <>
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="mt-6 h-11 rounded-full bg-navy px-6 text-sm font-bold text-white"
            >
              로그인으로 돌아가기
            </button>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm text-muted">
              {message}
            </p>

            <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
          </>
        )}
      </div>
    </main>
  );
}

function KakaoCallbackFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-md rounded-[28px] border border-white/50 bg-white/70 px-8 py-10 text-center shadow-[0_24px_70px_-20px_rgba(31,44,70,0.25)] backdrop-blur-2xl">
        <p className="text-sm font-bold text-navy/70">
          InterviewFit
        </p>

        <h1 className="mt-3 text-2xl font-bold text-navy">
          카카오 로그인
        </h1>

        <p className="mt-4 text-sm text-muted">
          카카오 로그인 정보를 확인하는 중입니다...
        </p>

        <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
      </div>
    </main>
  );
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<KakaoCallbackFallback />}>
      <KakaoCallbackContent />
    </Suspense>
  );
}