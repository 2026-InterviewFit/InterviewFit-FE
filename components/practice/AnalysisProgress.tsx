"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { type JobRole } from "@/lib/api";

const LOADING_TIPS = [
  { category: "💡 면접 꿀팁", text: "답변을 하다가 막힐 때는 1~2초간 천천히 숨을 고르고 '잠시 생각할 시간을 주시겠습니까?'라고 정중히 양해를 구해보세요." },
  { category: "👔 면접 복장 추천", text: "IT/개발 직군은 너무 딱딱한 정장보다 깔끔한 셔츠나 슬랙스, 단정한 니트 레이어드가 훨씬 세련되고 전문적인 인상을 줍니다." },
  { category: "🗣️ 면접 멘트 추천", text: "협업 갈등을 묻는 질문에는 '제 의견이 옳다'보다는 '팀의 목표를 위해 어떤 조율 과정을 거쳤는지' STAR 구조로 풀어내는 것이 핵심입니다." },
  { category: "💻 개발일화", text: "인터뷰핏의 AI 엔진은 은재님 팀이 새벽에 마시는 커피의 양과 정비례해서 고도화되고 있다는 소문이 있습니다...☕" },
  { category: "💡 실시간 채용 정보", text: "최근 테크 기업들은 단순 기술 나열보다, 하나의 프로젝트라도 깊게 파고들어 직면한 한계를 어떻게 트러블슈팅했는지를 집중적으로 평가합니다." },
];

interface AnalysisProgressProps {
  analysisProgress: number;
  analysisResult: { message?: string } | null;
  analysisError: string;
  selectedJobData?: JobRole;
  onExit: () => void;
}

export default function AnalysisProgress({
  analysisProgress,
  analysisResult,
  analysisError,
  selectedJobData,
  onExit,
}: AnalysisProgressProps) {
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 4000);
    return () => clearInterval(tipInterval);
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-bg text-ink p-8 relative font-sans select-none">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-40 -left-20 h-[650px] w-[650px] rounded-full bg-[#fef08a]/40 blur-[140px]" />
        <div className="absolute top-10 -right-20 h-[750px] w-[750px] rounded-full bg-[#bfdbfe]/60 blur-[160px]" />
        <div className="absolute bottom-[-150px] left-1/4 h-[600px] w-[600px] rounded-full bg-[#e9d5ff]/30 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl text-center space-y-8 w-full">
        {/* 진행률 원형 */}
        <div className="relative flex items-center justify-center w-28 h-28">
          <div className="absolute inset-0 rounded-full border-4 border-black/[0.04]" />
          {!analysisResult && !analysisError && (
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-transparent animate-[spin_2s_linear_infinite]" />
          )}
          {analysisResult && <CheckCircle2 className="h-12 w-12 text-emerald-500" />}
          {analysisError && <AlertCircle className="h-12 w-12 text-red-500" />}
          {!analysisResult && !analysisError && (
            <span className="font-serif text-xl font-bold tracking-tight text-navy">
              {analysisProgress}%
            </span>
          )}
        </div>

        {/* 상태 텍스트 */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-navy">
            {analysisResult
              ? "업로드 완료!"
              : analysisError
              ? "오류가 발생했습니다"
              : "면접 영상 업로드 중..."}
          </h2>
          <p className="text-sm text-muted">
            <span className="font-bold text-navy">{selectedJobData?.name}</span>{" "}
            {analysisResult
              ? "직무 면접 영상이 저장됐습니다. 대시보드에서 분석 결과를 확인하세요."
              : "직무 기준으로 녹화 영상을 서버로 전송하고 있습니다."}
          </p>
        </div>

        {/* 로딩 팁 */}
        {!analysisResult && !analysisError && (
          <div className="w-full bg-white/70 border border-black/[0.04] backdrop-blur-md rounded-[32px] p-8 text-center min-h-[160px] flex flex-col items-center justify-center overflow-hidden shadow-sm">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
            <AnimatePresence mode="wait">
              <motion.div
                key={tipIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center space-y-3"
              >
                <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {LOADING_TIPS[tipIdx].category}
                </span>
                <p className="text-sm font-semibold leading-relaxed text-navy max-w-md">
                  {LOADING_TIPS[tipIdx].text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* 업로드 완료 결과 카드 */}
        {analysisResult && (
          <div className="w-full rounded-[32px] bg-white/80 p-8 text-left shadow-sm border border-black/[0.04] backdrop-blur-md">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-xs font-bold text-blue-600">눈 깜빡임 분석</p>
                <p className="mt-2 text-sm font-bold text-navy">백엔드 처리 중</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="text-xs font-bold text-emerald-600">자세 분석</p>
                <p className="mt-2 text-sm font-bold text-navy">백엔드 처리 중</p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-5">
                <p className="text-xs font-bold text-purple-600">발화 분석</p>
                <p className="mt-2 text-sm font-bold text-navy">백엔드 처리 중</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-bold text-gray-500">안내</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-navy">
                {analysisResult.message}
              </p>
            </div>
          </div>
        )}

        {/* 에러 */}
        {analysisError && (
          <div className="w-full rounded-[28px] border border-red-100 bg-red-50 p-6 text-left text-sm font-semibold leading-relaxed text-red-600">
            {analysisError}
          </div>
        )}

        <button
          onClick={onExit}
          className="rounded-full bg-navy px-10 py-4 text-sm font-bold text-white shadow-lg shadow-navy/10 hover:bg-navy-dark transition-colors"
        >
          대시보드에서 결과 확인하기
        </button>
      </div>
    </div>
  );
}