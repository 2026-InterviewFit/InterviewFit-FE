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

  /**
   * React Strict Mode에서
   * 동일한 인가 코드로 로그인 요청이
   * 두 번 실행되는 것을 방지한다.
   */
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


    /**
     * 카카오 로그인 자체가
     * 취소되거나 실패한 경우
     */
    if (error) {
      setErrorMessage(
        `카카오 로그인 실패: ${
          errorDescription ??
          error
        }`,
      );

      return;
    }


    /**
     * Authorization Code 없음
     */
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


          /**
           * Spring:
           * POST /api/users/kakao-login
           *
           * 이 요청에서 Spring이
           *
           * interviewfit_access_token
           * interviewfit_refresh_token
           *
           * 두 HttpOnly Cookie를 내려준다.
           */
          const response =
            await kakaoLogin(
              code,
            );


          /**
           * JWT는 HttpOnly Cookie에 있으므로
           * 프론트 localStorage에 저장하지 않는다.
           *
           * 화면 표시용 사용자 정보만
           * 브라우저 메모리에 저장한다.
           */
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