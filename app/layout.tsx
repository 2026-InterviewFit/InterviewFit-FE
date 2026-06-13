import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/shared/ThemeProvider"; // 💡 ThemeProvider 불러오기!
import "./globals.css";

// 1. Satoshi 폰트 설정 (기본 텍스트용)
const satoshi = localFont({
  src: "../public/fonts/Satoshi.ttf",
  variable: "--font-satoshi",
  display: "swap",
});

// 2. Playfair Display 폰트 설정 (포인트 타이틀용)
const playfair = localFont({
  src: "../public/fonts/PlayfairDisplay-Bold.ttf",
  variable: "--font-playfair",
  display: "swap",
  weight: "700",
});

export const metadata: Metadata = {
  title: "InterviewFit — Practice smarter.",
  description: "AI-powered interview coaching that analyzes your tone, gaze, and answers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${satoshi.variable} ${playfair.variable}`}
      suppressHydrationWarning // 💡 다크모드 사용 시 화면 깜빡임(에러)을 막아주는 필수 속성입니다!
    >
      <body>
        {/* 💡 앱 전체를 ThemeProvider로 감싸줍니다 */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}