'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [statusText, setStatusText] = useState(
    '카카오 로그인 인증을 처리하고 있습니다...'
  );

  useEffect(() => {
    if (!code) return;

    const sendCodeToBackend = async () => {
      try {
        console.log("백엔드로 카카오 인가 코드 전송:", code);

        const response = await fetch(
          'http://localhost:8080/api/users/kakao-login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          }
        );

        // 응답 확인
        console.log("응답 상태:", response.status);
        console.log("응답 성공 여부:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();

          console.error("========== 백엔드 오류 ==========");
          console.error("Status :", response.status);
          console.error("Body :", errorText);
          console.error("===============================");

          throw new Error(
            `백엔드 로그인 실패 (${response.status})`
          );
        }

        const data = await response.json();
        console.log("로그인 성공:", data);

        localStorage.setItem('accessToken', data.token);

        router.push('/mypage/dashboard');

      } catch (error) {
        console.error("로그인 에러:", error);
        setStatusText('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    };

    sendCodeToBackend();
  }, [code, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg font-semibold text-gray-700">
        {statusText}
      </p>
    </div>
  );
}