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
  saveAuth,
} from "@/lib/auth";


function KakaoCallbackContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  /**
   * React Strict Mode에서
   * useEffect가 두 번 실행되면서
   * 동일한 카카오 인가 코드를
   * 두 번 백엔드로 보내는 것을 방지한다.
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
    /**
     * 이미 로그인 요청을 실행했다면
     * 중복 요청하지 않는다.
     */
    if (
      requestedRef.current
    ) {
      return;
    }

    requestedRef.current =
      true;


    /**
     * 카카오 callback query parameter
     *
     * 성공:
     * ?code=...
     *
     * 실패:
     * ?error=...
     */
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
     * 카카오 자체 로그인 단계에서
     * 오류가 발생한 경우
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
     * 인가 코드가 없는 경우
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

          console.log(
            "[Kakao] 인가 코드 수신 완료",
          );


          /**
           * lib/api.ts의 kakaoLogin() 사용
           *
           * POST
           * /api/users/kakao-login
           */
          const response =
            await kakaoLogin(
              code,
            );


          console.log(
            "[Kakao] 백엔드 로그인 응답:",
            response,
          );


          /**
           * 백엔드 정상 응답 구조:
           *
           * {
           *   token: "...",
           *   user: {
           *     id: ...,
           *     name: ...,
           *     ...
           *   }
           * }
           */
          if (
            !response ||
            !response.token
          ) {
            throw new Error(
              "백엔드 로그인 응답에 JWT 토큰이 없습니다.",
            );
          }


          if (
            !response.user ||
            response.user.id ==
              null
          ) {
            throw new Error(
              "백엔드 로그인 응답에 사용자 정보가 없습니다.",
            );
          }


          /**
           * JWT + 사용자 정보 저장
           *
           * lib/auth.ts에서
           *
           * interviewfit_access_token
           * interviewfit_user
           * interviewfit_user_id
           *
           * 로 저장된다.
           */
          saveAuth(
            response.token,
            response.user,
          );


          console.log(
            "[Kakao] JWT 및 사용자 정보 저장 완료",
          );


          setMessage(
            "로그인 성공! 홈으로 이동합니다...",
          );


          /**
           * 로그인 성공 후 메인 페이지 이동
           */
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
              : "로그인 처리 중 알 수 없는 오류가 발생했습니다.",
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