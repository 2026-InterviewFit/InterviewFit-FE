"use client";

import { useRouter } from "next/navigation";
import InterviewRecording from "@/components/practice/InterviewRecording";

export default function InterviewPage() {
  const router = useRouter();

  return (
    // 대시보드 팝업이 아니라 아예 독립된 풀스크린 페이지로 작동합니다!
    <main className="fixed inset-0 z-[100] h-screen w-screen bg-black">
      <InterviewRecording onExit={() => router.push("/mypage/dashboard")} />
    </main>
  );
}