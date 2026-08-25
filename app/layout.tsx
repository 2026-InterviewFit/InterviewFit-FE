// app/layout.tsx

import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import { ThemeProvider } from "@/components/shared/ThemeProvider";
import AuthBootstrap from "@/components/shared/AuthBootstrap";

import "./globals.css";

const satoshi = localFont({
  src: "../public/fonts/Satoshi.ttf",
  variable: "--font-satoshi",
  display: "swap",
});

const playfair = localFont({
  src: "../public/fonts/PlayfairDisplay-Bold.ttf",
  variable: "--font-playfair",
  display: "swap",
  weight: "700",
});

export const metadata: Metadata = {
  title: "InterviewFit — Practice smarter.",
  description:
    "AI-powered interview coaching that analyzes your tone, gaze, and answers.",
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
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthBootstrap />
          {children}
        </ThemeProvider>

        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}