import type { Metadata } from "next";
import localFont from "next/font/local"; // 💡 next/font/local로 변경!
import "./globals.css";

// 1. Satoshi 폰트 설정 (기본 텍스트용)
const satoshi = localFont({
  src: "../public/fonts/Satoshi.ttf", // 경로 주의: app 폴더 기준
  variable: "--font-satoshi",
  display: "swap",
});

// 2. Playfair Display 폰트 설정 (포인트 타이틀용)
const playfair = localFont({
  src: "../public/fonts/PlayfairDisplay-Bold.ttf",
  variable: "--font-playfair",
  display: "swap",
  weight: "700", // 볼드체 파일이므로 700 지정
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
      lang="en"
      // 3. html 태그에 폰트 변수 등록
      className={`${satoshi.variable} ${playfair.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}