"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Trash2, ListVideo, Play } from "lucide-react";
import type { DashboardRecord } from "@/types";
import {
  getOverallScore, getAverageEyeScore, getAveragePoseScore, getSpeechScore,
  getReportStatusLabel, getMainFeedback, getSortedReports, getVideoPlaybackUrl, 
  getRecordDate, formatKoreanDate, getRecordJobName
} from "@/lib/reportUtils";

import FeedbackAccordion from "./report/FeedbackAccordion";
import VisualAnalysisCard from "./report/VisualAnalysisCard";
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
  const [activePlaybackTime, setActivePlaybackTime] = useState(0); // 🔑 현재 재생 위치
  const playerRef = useRef<MirroredVideoPlayerHandle>(null);

  const report = record.report;
  const sortedAnswers = getSortedReports(report);
  const selectedAnswerData = sortedAnswers[selectedAnswerIndex] ?? sortedAnswers[0];
  const selectedVideoUrl = getVideoPlaybackUrl(selectedAnswerData?.videoObjectKey);
  
  const overallScore = getOverallScore(report);
  const eyeScore = getAverageEyeScore(report);
  const poseScore = getAveragePoseScore(report);
  const speechScore = getSpeechScore(report); // 🔑 개선된 함수 사용

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

  // 🔑 현재 재생 시각 기준으로 "지금 몇 번째 질문 구간인지" 계산
  // 마지막으로 시작 시각이 activePlaybackTime보다 작거나 같은 질문이 현재 재생 중인 질문
  const activeQuestionIndex =
    timestamps.length > 0
      ? timestamps.reduce((activeIdx, ts, idx) => (ts <= activePlaybackTime ? idx : activeIdx), 0)
      : -1;

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
        <button
          onClick={() => onDelete(record.interviewId)}
          aria-label="이 분석 기록 삭제"
          className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-500 shadow-sm transition-colors hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" /> 기록 삭제
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
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
                  {typeof overallScore === "number" ? `${Math.round(overallScore)}` : "-"}<span className="text-lg text-muted">%</span>
                </div>
              </div>
            </div>
            <FeedbackAccordion feedback={getMainFeedback(report)} />
            <OverviewVisualizer eyeScore={eyeScore} poseScore={poseScore} speechScore={speechScore} />
          </div>
          <VisualAnalysisCard answerData={selectedAnswerData} />
        </div>

        <div className="xl:col-span-5 flex flex-col gap-6 w-full">
          <div className="rounded-[32px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.04] dark:border-white/[0.04] flex-1 flex flex-col">
            <h4 className="text-base font-bold text-navy dark:text-white mb-4">답변 영상 다시보기</h4>
            
            <div className="mb-5 flex flex-wrap gap-2">
              {sortedAnswers.map((answer, index) => (
                <button 
                  key={answer.answerId} 
                  onClick={() => setSelectedAnswerIndex(index)}
                  aria-label={`${answer.answerOrder}번 질문 답변 보기`}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all border ${
                    selectedAnswerIndex === index 
                      ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800" 
                      : "bg-transparent border-line text-muted hover:bg-gray-50"
                  }`}
                >
                  Q{answer.answerOrder}
                </button>
              ))}
            </div>

            <div className="mb-6">
              {selectedVideoUrl ? (
                <MirroredVideoPlayer
                  ref={playerRef}
                  src={selectedVideoUrl}
                  onTimeUpdate={setActivePlaybackTime} // 🔑 재생 위치 실시간 수신
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
                  const isActive = hasTimestamp && idx === activeQuestionIndex; // 🔑 현재 재생 중인 질문 여부

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleJumpToQuestion(idx)}
                      disabled={!hasTimestamp}
                      aria-label={`${idx + 1}번 질문으로 이동`}
                      aria-current={isActive ? "true" : undefined}
                      className={`text-left p-3 rounded-xl border transition-colors ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 ring-1 ring-blue-300" // 🔑 하이라이트 스타일
                          : hasTimestamp
                          ? "bg-white dark:bg-slate-700/50 border-black/5 dark:border-white/5 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer"
                          : "bg-white dark:bg-slate-700/50 border-black/5 dark:border-white/5 cursor-default"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className={`text-[10px] font-bold ${isActive ? "text-blue-600" : "text-slate-400"}`}>
                          Q{idx + 1} {isActive && "· 재생 중"}
                        </span>
                        {hasTimestamp && (
                          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                            ▶ {formatTimestamp(timestamps[idx])}
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
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