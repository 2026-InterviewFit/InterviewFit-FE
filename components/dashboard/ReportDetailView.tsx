// components/dashboard/ReportDetailView.tsx
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, ListVideo, Play, Share2, Loader2 } from "lucide-react";
import type { DashboardRecord } from "@/types";
import { CommunityApiError, publishCommunityBestAnswer } from "@/lib/communityApi";
import {
  getOverallScore,
  getAverageEyeScore,
  getAveragePoseScore,
  getSpeechScore,
  getReportStatusLabel,
  getMainFeedback,
  getSortedReports,
  getVideoPlaybackUrl,
  getRecordDate,
  formatKoreanDate,
  getRecordJobName,
} from "@/lib/reportUtils";

import FeedbackAccordion from "./report/FeedbackAccordion";
import VisualAnalysisCard from "./report/VisualAnalysisCard";
import SpeechAnalysisCard from "./report/SpeechAnalysisCard";
import OverviewVisualizer from "./report/OverviewVisualizer";
import MirroredVideoPlayer, { MirroredVideoPlayerHandle } from "./report/MirroredVideoPlayer";

interface ReportDetailViewProps {
  record: DashboardRecord;
  roundLabel: string;
  onBack: () => void;
  onDelete: (id: number) => void;
  onStartNew: () => void;
}

export default function ReportDetailView({
  record,
  roundLabel,
  onBack,
  onDelete,
  onStartNew,
}: ReportDetailViewProps) {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(0);
  const [activePlaybackTime, setActivePlaybackTime] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedAnswerIds, setPublishedAnswerIds] = useState<number[]>([]);

  const playerRef = useRef<MirroredVideoPlayerHandle>(null);

  const report = record.report;
  const sortedAnswers = getSortedReports(report);
  const selectedAnswerData = sortedAnswers[selectedAnswerIndex] ?? sortedAnswers[0];

  // 영상 미출력 방어 로직
  const rawVideoUrl = getVideoPlaybackUrl(selectedAnswerData?.videoObjectKey);
  const fallbackVideoUrl = (record as any).videoUrl || (record as any).videoObjectKey; 
  const selectedVideoUrl = rawVideoUrl || (fallbackVideoUrl ? getVideoPlaybackUrl(fallbackVideoUrl) : null);

  const overallScore = getOverallScore(report);
  const eyeScore = getAverageEyeScore(report);
  const poseScore = getAveragePoseScore(report);
  const speechScore = getSpeechScore(report);

  const selectedDate = formatKoreanDate(getRecordDate(record));
  const selectedJobName = getRecordJobName(record);

  const rawQuestions = selectedAnswerData?.questionText || "";
  const parsedQuestions = rawQuestions.split("|").map((q) => q.trim()).filter((q) => q.length > 0);
  const questionsList = record.questionTexts && record.questionTexts.length > 0 ? record.questionTexts : parsedQuestions;
  const timestamps = record.questionTimestamps ?? [];

  const formatTimestamp = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleJumpToQuestion = (idx: number) => {
    setSelectedAnswerIndex(idx);
    const target = timestamps[idx];
    if (typeof target === "number") {
      playerRef.current?.seekTo(target);
    }
  };

  const handlePublishBestAnswer = async () => {
    const answerId = selectedAnswerData?.answerId;
    if (!answerId) return alert("공개할 답변 정보를 찾을 수 없습니다.");

    const companyInput = window.prompt("기업명을 입력해주세요. 기업명을 공개하지 않으려면 빈칸으로 두고 확인을 눌러주세요.", "");
    if (companyInput === null) return;

    if (!window.confirm("현재 답변의 STT 스크립트를 우수 답변 피드에 공개할까요? 작성자 이름은 마스킹되어 표시됩니다.")) return;

    setIsPublishing(true);
    try {
      await publishCommunityBestAnswer({ answerId, companyName: companyInput.trim() || undefined });
      setPublishedAnswerIds((prev) => prev.includes(answerId) ? prev : [...prev, answerId]);
      alert("우수 답변 피드에 공개되었습니다.");
    } catch (error) {
      if (error instanceof CommunityApiError && error.status === 409) {
        alert(error.message || "이미 공개된 답변입니다.");
        return;
      }
      alert(error instanceof Error ? error.message : "우수 답변 공개에 실패했습니다.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex w-full flex-col animate-in slide-in-from-right-4 duration-300">
      <div className="mb-6 flex w-full items-center justify-between">
        <button
          onClick={onBack}
          aria-label="목록으로 돌아가기"
          className="flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-gray-50 dark:bg-[#1e293b] dark:text-white dark:border-white/10 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4 text-muted" /> 목록으로 돌아가기
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePublishBestAnswer}
            disabled={isPublishing || !selectedAnswerData?.answerId || publishedAnswerIds.includes(selectedAnswerData.answerId)}
            className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-600 shadow-sm transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
          >
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            {selectedAnswerData?.answerId && publishedAnswerIds.includes(selectedAnswerData.answerId) ? "공개 완료" : "우수 답변 공개"}
          </button>
          <button
            onClick={() => onDelete(record.interviewId)}
            className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-500 shadow-sm transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
          >
            <Trash2 className="h-4 w-4" /> 기록 삭제
          </button>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 items-start gap-6 pb-20 xl:grid-cols-12">
        
        {/* 왼쪽 메인 분석 영역 */}
        <div className="flex w-full flex-col gap-6 xl:col-span-7">
          <div className="rounded-[32px] border border-black/[0.04] bg-white p-6 shadow-sm dark:border-white/[0.04] dark:bg-[#1e293b] lg:p-8">
            <div className="mb-4 w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              {roundLabel} ({getReportStatusLabel(record)})
            </div>
            <div className="mb-2 flex items-end justify-between">
              <h3 className="text-2xl font-bold leading-snug text-navy dark:text-white">
                {selectedJobName} 모의면접<br />AI 진단 리포트
              </h3>
              <div className="text-right">
                <p className="mb-1 text-xs text-muted">종합 점수</p>
                <div className="text-4xl font-bold text-blue-600">
                  {typeof overallScore === "number" ? `${Math.round(overallScore)}` : "-"}
                  <span className="text-lg text-muted"> 점</span>
                </div>
              </div>
            </div>
            <FeedbackAccordion feedback={getMainFeedback(report)} />
            <OverviewVisualizer eyeScore={eyeScore} poseScore={poseScore} speechScore={speechScore} />
          </div>

          <VisualAnalysisCard answerData={selectedAnswerData} eyeReport={report?.eye} poseReport={report?.pose} showGaze />
          <SpeechAnalysisCard answerData={selectedAnswerData} />
        </div>

        {/* 💡 오른쪽 스티키 영역 (최소 높이 설정 및 화면 축소 방어) */}
        <div className="sticky top-6 flex h-[calc(100vh-5rem)] min-h-[500px] w-full flex-col xl:col-span-5">
          <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-black/[0.04] bg-white shadow-sm dark:border-white/[0.04] dark:bg-[#1e293b]">
            
            {/* 영상 영역 (max-w를 걸어 높이가 과도하게 커지는 것을 방지) */}
            <div className="shrink-0 px-6 pt-6 pb-2 lg:px-8 lg:pt-8 lg:pb-4">
              <h4 className="mb-4 text-base font-bold text-navy dark:text-white">
                답변 영상 다시보기
              </h4>
              {/* 💡 해상도가 달라져도 영상 최대 너비를 통제하여 질문 목록 공간을 항상 확보합니다 */}
              <div className="mx-auto w-full max-w-[280px] sm:max-w-[340px] xl:max-w-[320px] 2xl:max-w-[400px]">
                <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-[#0f172a] shadow-inner">
                  {selectedVideoUrl ? (
                    <MirroredVideoPlayer ref={playerRef} src={selectedVideoUrl} onTimeUpdate={setActivePlaybackTime} />
                  ) : (
                    <>
                      <Play className="h-10 w-10 fill-white opacity-40" />
                      <p className="absolute bottom-4 text-[10px] text-white/40">영상 주소가 없습니다</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 질문 목록 영역 (최소 높이 보장 및 독립 스크롤) */}
            <div className="flex min-h-[200px] flex-1 flex-col bg-slate-50 dark:bg-slate-800/50">
              <div className="shrink-0 px-6 pt-5 lg:px-8">
                <h5 className="mb-4 flex items-center gap-2 text-sm font-bold text-navy dark:text-white">
                  <ListVideo className="h-4 w-4 text-blue-600" /> 질문 목록
                </h5>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 lg:px-8">
                <div className="flex flex-col gap-2">
                  {questionsList.map((question, idx) => {
                    const hasTimestamp = typeof timestamps[idx] === "number";
                    const isActive = idx === selectedAnswerIndex;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleJumpToQuestion(idx)}
                        disabled={!hasTimestamp}
                        className={`relative rounded-xl border p-3 text-left transition-colors ${
                          isActive
                            ? "border-transparent"
                            : hasTimestamp
                            ? "cursor-pointer border-black/5 bg-white hover:border-blue-300 hover:bg-blue-50/50 dark:border-white/5 dark:bg-slate-700/50"
                            : "cursor-default border-black/5 bg-white opacity-60 dark:border-white/5 dark:bg-slate-700/50"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeQuestionBackground"
                            className="absolute inset-0 z-0 rounded-xl border border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30"
                            initial={false}
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                          />
                        )}
                        <div className="relative z-10 mb-1 flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                            Q{idx + 1} {isActive && "· 재생 중"}
                          </span>
                          {hasTimestamp && (
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              isActive ? "bg-blue-100/50 text-blue-600 dark:bg-blue-800/50 dark:text-blue-300" : "bg-blue-50 text-blue-500 dark:bg-blue-900/30"
                            }`}>
                              ▶ {formatTimestamp(timestamps[idx])}
                            </span>
                          )}
                        </div>
                        <p className={`relative z-10 text-[13px] font-medium leading-relaxed ${
                          isActive ? "text-blue-900 dark:text-blue-100" : "text-slate-600 dark:text-slate-300"
                        }`}>
                          {question}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 border-t border-black/5 bg-slate-50 px-6 py-4 dark:border-white/10 dark:bg-slate-800/50 lg:px-8">
                <p className="text-[11px] text-muted">촬영 일시 : {selectedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}