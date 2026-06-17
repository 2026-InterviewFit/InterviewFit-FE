"use client";

import { useState } from "react";
import { ArrowLeft, Trash2, BarChart3, CheckCircle, Mic, Play } from "lucide-react";
import type { DashboardRecord } from "@/types";
import {
  getOverallScore, getAverageEyeScore, getAveragePoseScore,
  getAverageSpeechPace, getReportStatusLabel, getMainFeedback,
  getSortedReports, getVideoPlaybackUrl, getRecordDate, formatKoreanDate, getRecordJobName
} from "@/lib/reportUtils";

interface ReportDetailViewProps {
  record: DashboardRecord;
  roundLabel: string;
  onBack: () => void;
  onDelete: (id: number) => void;
  onStartNew: () => void;
}

export default function ReportDetailView({ record, roundLabel, onBack, onDelete, onStartNew }: ReportDetailViewProps) {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(0);

  const report = record.report;
  const sortedAnswers = getSortedReports(report);
  const selectedAnswerForVideo = sortedAnswers[selectedAnswerIndex] ?? sortedAnswers[0];
  const selectedVideoUrl = getVideoPlaybackUrl(selectedAnswerForVideo?.videoObjectKey);
  
  const overallScore = getOverallScore(report);
  const visualScore = ((getAverageEyeScore(report) || 0) + (getAveragePoseScore(report) || 0)) / 2 || undefined;
  const averagePace = getAverageSpeechPace(report);
  
  const selectedDate = formatKoreanDate(getRecordDate(record));
  const selectedJobName = getRecordJobName(record);

  return (
    <div className="flex flex-col w-full animate-in slide-in-from-right-4 duration-300">
      {/* 상단 버튼 영역 */}
      <div className="flex items-center justify-between w-full mb-6">
        <button onClick={onBack} className="flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink shadow-sm hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4 text-muted" /> 목록으로 돌아가기
        </button>
        <button onClick={() => onDelete(record.interviewId)} className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-500 shadow-sm transition-colors hover:bg-red-100">
          <Trash2 className="h-4 w-4" /> 기록 삭제
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
        {/* 좌측: 스파이더 차트 및 코멘트 */}
        <div className="xl:col-span-8 flex flex-col gap-6 w-full">
          <div className="flex flex-col md:flex-row items-center gap-10 rounded-[32px] bg-white dark:bg-[#1e293b] p-8 md:p-10 shadow-sm border border-black/[0.02]">
            <div className="relative flex w-full md:w-[280px] shrink-0 flex-col items-center">
              <span className="text-xs font-bold text-muted dark:text-gray-400 mb-4 flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5 text-blue-500" /> 역량 밸런스 지표
              </span>
              <svg viewBox="0 0 240 230" className="w-full max-w-[240px] h-auto overflow-visible drop-shadow-sm">
                <polygon points="110,20 188,65 188,155 110,200 32,155 32,65" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                <polygon points="110,65 149,87 149,132 110,155 71,132 71,87" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3" />
                <line x1="110" y1="20" x2="110" y2="200" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="32" y1="65" x2="188" y2="155" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="32" y1="155" x2="188" y2="65" stroke="#f3f4f6" strokeWidth="1" />
                <polygon points="110,45 170,75 165,140 110,175 55,135 45,75" fill="rgba(167, 139, 250, 0.4)" stroke="#8b5cf6" strokeWidth="2" />
                <text x="110" y="14" textAnchor="middle" className="text-[9px] font-bold fill-navy dark:fill-white">논리성</text>
                <text x="226" y="68" textAnchor="end" className="text-[9px] font-bold fill-navy dark:fill-white">발화 속도</text>
                <text x="226" y="160" textAnchor="end" className="text-[9px] font-bold fill-navy dark:fill-white">음량 분석</text>
                <text x="110" y="218" textAnchor="middle" className="text-[9px] font-bold fill-navy dark:fill-white">시선 처리</text>
                <text x="8" y="160" textAnchor="start" className="text-[9px] font-bold fill-navy dark:fill-white">표정 분석</text>
                <text x="8" y="68" textAnchor="start" className="text-[9px] font-bold fill-navy dark:fill-white">자세 안정</text>
              </svg>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-4xl font-bold text-navy dark:text-white">
                {typeof overallScore === "number" ? `${Math.round(overallScore)}%` : "-%"}
                <span className="text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                  {roundLabel} ({getReportStatusLabel(record)})
                </span>
              </div>
              <h3 className="mt-4 text-xl md:text-2xl font-bold text-navy dark:text-white leading-snug">
                {selectedJobName} 모의면접<br className="hidden md:block" />AI 상세 진단 리포트입니다.
              </h3>
              <p className="mt-4 max-h-[180px] overflow-y-auto pr-2 text-sm text-muted leading-relaxed break-keep">
                {getMainFeedback(report)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <div className="rounded-[28px] bg-[#f0fdf4] dark:bg-emerald-900/10 p-6 border border-black/[0.02]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 mb-1">VISUAL</p>
                  <h4 className="text-lg font-bold text-navy dark:text-white">시선 및 자세 안정도</h4>
                </div>
                <div className="rounded-full bg-white p-2 text-emerald-500 shadow-sm"><CheckCircle className="w-4 h-4" /></div>
              </div>
              <div className="mt-8 flex justify-between items-end">
                <p className="text-xs text-emerald-700/70">카메라 정면 응시율</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {typeof visualScore === "number" ? Math.round(visualScore) : "-"}<span className="text-base font-medium">%</span>
                </p>
              </div>
            </div>

            <div className="rounded-[28px] bg-[#fefce8] dark:bg-yellow-900/10 p-6 border border-black/[0.02]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-yellow-600 mb-1">VOICE</p>
                  <h4 className="text-lg font-bold text-navy dark:text-white">발화 속도 (BPM)</h4>
                </div>
                <div className="rounded-full bg-white p-2 text-yellow-500 shadow-sm"><Mic className="w-4 h-4" /></div>
              </div>
              <div className="mt-8 flex justify-between items-end">
                <p className="text-xs text-yellow-700/70">분당 평균 발화 단어 수</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {typeof averagePace === "number" ? Math.round(averagePace * 60) : "-"}<span className="text-sm font-medium"> WPM</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 영상 플레이어 및 버튼 */}
        <div className="xl:col-span-4 flex flex-col gap-6 w-full">
          <div onClick={onStartNew} className="group cursor-pointer rounded-[32px] bg-[#1f2937] p-8 text-white shadow-lg transition-transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all" />
            <h4 className="text-lg font-bold">새로운 연습 세션 시작하기</h4>
            <p className="mt-2 text-xs text-white/60">웹캠과 마이크를 통해 정밀 분석을 시작합니다.</p>
            <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 group-hover:bg-blue-500 transition-colors">
              <Play className="h-5 w-5 fill-white pl-0.5" />
            </div>
          </div>

          <div className="rounded-[32px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.02] flex-1 flex flex-col">
            <h4 className="text-lg font-bold text-navy dark:text-white mb-4">선택된 영상 다시보기</h4>
            {sortedAnswers.length > 1 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {sortedAnswers.map((answer, index) => (
                  <button key={answer.answerId} type="button" onClick={() => setSelectedAnswerIndex(index)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedAnswerIndex === index ? "bg-navy text-white" : "bg-bg text-muted hover:bg-gray-200"}`}>
                    답변 {answer.answerOrder}
                  </button>
                ))}
              </div>
            )}

            <div className="aspect-video w-full rounded-2xl bg-[#0f172a] relative flex items-center justify-center overflow-hidden mb-6">
              {selectedVideoUrl ? (
                <video key={selectedVideoUrl} src={selectedVideoUrl} controls preload="metadata" className="h-full w-full bg-[#0f172a] object-contain" />
              ) : (
                <><Play className="h-12 w-12 fill-white opacity-80" /><p className="absolute bottom-4 text-[10px] text-white/60">영상 주소가 없습니다</p></>
              )}
            </div>
            <div className="mt-auto">
              <h5 className="font-bold text-ink dark:text-white">{selectedJobName} 모의면접</h5>
              <p className="text-xs text-muted mt-1">촬영 일시 : {selectedDate}</p>
              {selectedAnswerForVideo?.questionText && (
                <p className="mt-3 text-xs leading-relaxed text-muted">
                  {selectedAnswerForVideo.answerOrder}번 질문: {selectedAnswerForVideo.questionText}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}