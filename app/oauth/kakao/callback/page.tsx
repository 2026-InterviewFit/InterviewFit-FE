// app/oauth/kakao/callback/page.tsx

"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  kakaoLogin,
} from "@/lib/api";

import {
  setAuthUser,
} from "@/lib/auth";


function KakaoCallbackContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const requestedRef =
    useRef(false);

  const [
    message,
    setMessage,
  ] = useState(
    "카카오 로그인 처리 중입니다...",
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  useEffect(() => {
    if (
      requestedRef.current
    ) {
      return;
    }

    requestedRef.current =
      true;


    const code =
      searchParams.get(
        "code",
      );

    const error =
      searchParams.get(
        "error",
      );

    const errorDescription =
      searchParams.get(
        "error_description",
      );


    if (error) {
      setErrorMessage(
        `카카오 로그인 실패: ${
          errorDescription ??
          error
        }`,
      );

      return;
    }


    if (!code) {
      setErrorMessage(
        "카카오 인가 코드가 없습니다.",
      );

      return;
    }


    const completeLogin =
      async () => {
        try {
          setMessage(
            "백엔드로 로그인 정보를 전달하는 중입니다...",
          );

          console.log(
            "[Kakao] 인가 코드 수신 완료",
          );

          const response =
            await kakaoLogin(
              code,
            );


          console.log(
            "[Kakao] 백엔드 로그인 응답:",
            response,
          );

          // 🔑 핵심 수정: 백엔드에서 받은 토큰을 localStorage에 저장하여 인증 헤더에서 사용하도록 함
          if (response?.token) {
            localStorage.setItem("interviewfit_access_token", response.token);
          } else if ((response as any)?.accessToken) {
            localStorage.setItem("interviewfit_access_token", (response as any).accessToken);
          } else if ((response as any)?.jwt) {
            localStorage.setItem("interviewfit_access_token", (response as any).jwt);
          }


          if (
            !response?.user ||
            response.user.id ==
              null
          ) {
            throw new Error(
              "백엔드 로그인 응답에 사용자 정보가 없습니다.",
            );
          }


          setAuthUser(
            response.user,
          );


          console.log(
            "[Kakao] 사용자 정보 반영 완료:",
            response.user,
          );


          setMessage(
            "로그인 성공! 홈으로 이동합니다...",
          );


          router.replace(
            "/",
          );

        } catch (
          errorValue
        ) {
          console.error(
            "[Kakao] 로그인 처리 실패:",
            errorValue,
          );

          setErrorMessage(
            errorValue instanceof
              Error
              ? errorValue.message
              : "카카오 로그인 처리 중 오류가 발생했습니다.",
          );
        }
      };


    void completeLogin();

  }, [
    router,
    searchParams,
  ]);


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
              onClick={() =>
                router.replace(
                  "/login",
                )
              }
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
    <Suspense
      fallback={
        <KakaoCallbackFallback />
      }
    >
      <KakaoCallbackContent />
    </Suspense>
  );
}