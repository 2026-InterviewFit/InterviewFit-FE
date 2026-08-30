"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, ListVideo, Play, Share2, Loader2 } from "lucide-react";
import type { DashboardRecord } from "@/types";
import {
  CommunityApiError,
  publishCommunityBestAnswer,
} from "@/lib/communityApi";
import {
  getOverallScore, getAverageEyeScore, getAveragePoseScore, getSpeechScore,
  getReportStatusLabel, getMainFeedback, getSortedReports, getVideoPlaybackUrl,
  getRecordDate, formatKoreanDate, getRecordJobName
} from "@/lib/reportUtils";

import FeedbackAccordion from "./report/FeedbackAccordion";
import VisualAnalysisCard from "./report/VisualAnalysisCard";
import SpeechAnalysisCard from "./report/SpeechAnalysisCard";
import ExternalAiAnalysisCard from "./report/ExternalAiAnalysisCard";
import OverviewVisualizer from "./report/OverviewVisualizer";
import MirroredVideoPlayer, { MirroredVideoPlayerHandle } from "./report/MirroredVideoPlayer";

interface ReportDetailViewProps {
  record: DashboardRecord;
  roundLabel: string;
  onBack: () => void;
  onDelete: (id: number) => void;
  onStartNew: () => void;
}

export default function ReportDetailView({ record, roundLabel, onBack, onDelete, onStartNew }: ReportDetailViewProps) {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(0);
  const [activePlaybackTime, setActivePlaybackTime] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedAnswerIds, setPublishedAnswerIds] = useState<number[]>([]);
  const playerRef = useRef<MirroredVideoPlayerHandle>(null);
  
  const report = record.report;
  const sortedAnswers = getSortedReports(report);
  const selectedAnswerData = sortedAnswers[selectedAnswerIndex] ?? sortedAnswers[0];

  console.log("선택된 답변 전체:", selectedAnswerData);
  console.log("시선 분석 데이터:", selectedAnswerData?.gaze);

  const selectedVideoUrl = getVideoPlaybackUrl(selectedAnswerData?.videoObjectKey);
  
  const overallScore = getOverallScore(report);
  const eyeScore = getAverageEyeScore(report);
  const poseScore = getAveragePoseScore(report);
  const speechScore = getSpeechScore(report); 
  
  const selectedDate = formatKoreanDate(getRecordDate(record));
  const selectedJobName = getRecordJobName(record);
  
  const rawQuestions = selectedAnswerData?.questionText || "";
  const parsedQuestions = rawQuestions.split("|").map(q => q.trim()).filter(q => q.length > 0);
  const questionsList = record.questionTexts && record.questionTexts.length > 0 ? record.questionTexts : parsedQuestions;
  const timestamps = record.questionTimestamps ?? [];
  
  const formatTimestamp = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleJumpToQuestion = (idx: number) => {
    const target = timestamps[idx];
    if (typeof target === "number") {
      playerRef.current?.seekTo(target);
    }
  };

  const activeQuestionIndex = timestamps.length > 0
    ? timestamps.reduce((activeIdx, ts, idx) => (ts <= activePlaybackTime ? idx : activeIdx), 0)
    : -1;

  const handlePublishBestAnswer = async () => {
    const answerId = selectedAnswerData?.answerId;

    if (!answerId) {
      alert("공개할 답변 정보를 찾을 수 없습니다.");
      return;
    }

    const companyInput = window.prompt(
      "기업명을 입력해주세요. 기업명을 공개하지 않으려면 빈칸으로 두고 확인을 눌러주세요.",
      "",
    );

    if (companyInput === null) {
      return;
    }

    const confirmed = window.confirm(
      "현재 답변의 STT 스크립트를 우수 답변 피드에 공개할까요? 작성자 이름은 마스킹되어 표시됩니다.",
    );

    if (!confirmed) {
      return;
    }

    setIsPublishing(true);

    try {
      await publishCommunityBestAnswer({
        answerId,
        companyName: companyInput.trim() || undefined,
      });

      setPublishedAnswerIds((prev) =>
        prev.includes(answerId) ? prev : [...prev, answerId],
      );

      alert("우수 답변 피드에 공개되었습니다.");
    } catch (error) {
      console.error("우수 답변 공개 실패:", error);

      if (error instanceof CommunityApiError && error.status === 409) {
        alert(error.message || "이미 공개된 답변입니다.");
        return;
      }

      alert(
        error instanceof Error
          ? error.message
          : "우수 답변 공개에 실패했습니다.",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col w-full animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between w-full mb-6">
        <button
          onClick={onBack}
          aria-label="목록으로 돌아가기"
          className="flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted" /> 목록으로 돌아가기
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handlePublishBestAnswer()}
            disabled={
              isPublishing ||
              !selectedAnswerData?.answerId ||
              publishedAnswerIds.includes(selectedAnswerData.answerId)
            }
            aria-label="현재 답변을 우수 답변 피드에 공개"
            className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-600 shadow-sm transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {selectedAnswerData?.answerId &&
            publishedAnswerIds.includes(selectedAnswerData.answerId)
              ? "공개 완료"
              : "우수 답변 공개"}
          </button>

          <button
            onClick={() => onDelete(record.interviewId)}
            aria-label="이 분석 기록 삭제"
            className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-500 shadow-sm transition-colors hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" /> 기록 삭제
          </button>
        </div>
      </div>

      {/* grid에 items-start 추가 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
        <div className="xl:col-span-7 flex flex-col gap-6 w-full">
          <div className="rounded-[32px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.04] dark:border-white/[0.04]">
            <div className="flex items-center gap-3 text-sm font-medium text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full mb-4">
              {roundLabel} ({getReportStatusLabel(record)})
            </div>
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-2xl font-bold text-navy dark:text-white leading-snug">
                {selectedJobName} 모의면접<br />AI 진단 리포트
              </h3>
              <div className="text-right">
                <p className="text-xs text-muted mb-1">종합 점수</p>
                <div className="text-4xl font-bold text-blue-600">
                  {typeof overallScore === "number" ? `${Math.round(overallScore)}` : "-"}<span className="text-lg text-muted"> 점</span>
                </div>
              </div>
            </div>
            <FeedbackAccordion feedback={getMainFeedback(report)} />
            <OverviewVisualizer eyeScore={eyeScore} poseScore={poseScore} speechScore={speechScore} />
          </div>
          
          <VisualAnalysisCard
            answerData={selectedAnswerData}
            eyeReport={report?.eye}
            poseReport={report?.pose}
          />
          <SpeechAnalysisCard answerData={selectedAnswerData} />
          <ExternalAiAnalysisCard analysis={selectedAnswerData?.speech?.externalAiAnalysis} />
        </div>

        {/* sticky 및 top-6 추가 */}
        <div className="xl:col-span-5 flex flex-col gap-6 w-full sticky top-6">
          <div className="rounded-[32px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.04] dark:border-white/[0.04] flex-1 flex flex-col">
            <h4 className="text-base font-bold text-navy dark:text-white mb-4">답변 영상 다시보기</h4>

            <div className="mb-6">
              {selectedVideoUrl ? (
                <MirroredVideoPlayer
                  ref={playerRef}
                  src={selectedVideoUrl}
                  onTimeUpdate={setActivePlaybackTime}
                />
              ) : (
                <div className="aspect-video w-full rounded-2xl bg-[#0f172a] relative flex items-center justify-center overflow-hidden shadow-inner">
                  <Play className="h-10 w-10 fill-white opacity-40" />
                  <p className="absolute bottom-4 text-[10px] text-white/40">영상 주소가 없습니다</p>
                </div>
              )}
            </div>
            
            <div className="mt-auto bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-black/5">
              <h5 className="font-bold text-sm text-navy dark:text-white flex items-center gap-2 mb-4">
                <ListVideo className="h-4 w-4 text-blue-600" />
                질문 목록
              </h5>
              <div className="flex flex-col gap-2">
                {questionsList.map((question, idx) => {
                  const hasTimestamp = typeof timestamps[idx] === "number";
                  const isActive = hasTimestamp && idx === activeQuestionIndex;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleJumpToQuestion(idx)}
                      disabled={!hasTimestamp}
                      aria-label={`${idx + 1}번 질문으로 이동`}
                      aria-current={isActive ? "true" : undefined}
                      // 💡 relative 속성을 추가하고, isActive일 때 겉 테두리는 투명하게 처리
                      className={`relative text-left p-3 rounded-xl border transition-colors ${
                        isActive
                          ? "border-transparent" 
                          : hasTimestamp
                          ? "bg-white dark:bg-slate-700/50 border-black/5 dark:border-white/5 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer"
                          : "bg-white dark:bg-slate-700/50 border-black/5 dark:border-white/5 cursor-default"
                      }`}
                    >
                      {/* 💡 Magic Motion 하이라이트 박스 (활성화 시 부드럽게 위아래로 이동!) */}
                      {isActive && (
                        <motion.div
                          layoutId="activeQuestionBackground"
                          className="absolute inset-0 z-0 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                      
                      {/* 💡 글자와 뱃지가 하이라이트 박스 위로 올라오도록 relative z-10 추가 */}
                      <div className="relative z-10 flex items-center justify-between mb-1 gap-2">
                        <span className={`text-[10px] font-bold ${isActive ? "text-blue-600" : "text-slate-400"}`}>
                          Q{idx + 1} {isActive && "· 재생 중"}
                        </span>
                        {hasTimestamp && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isActive ? "text-blue-600 bg-blue-100/50 dark:text-blue-300 dark:bg-blue-800/50" : "text-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          }`}>
                            ▶ {formatTimestamp(timestamps[idx])}
                          </span>
                        )}
                      </div>
                      <p className={`relative z-10 text-[13px] leading-relaxed font-medium ${
                        isActive ? "text-blue-900 dark:text-blue-100" : "text-slate-600 dark:text-slate-300"
                      }`}>
                        {question}
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted mt-5 pt-4 border-t border-black/5">
                촬영 일시 : {selectedDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
