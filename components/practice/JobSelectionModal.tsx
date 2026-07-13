"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, CheckCircle2, ChevronRight, Sparkles } from "lucide-react"; // Sparkles 추가
import type { JobRole } from "@/types";

interface JobSelectionModalProps {
  jobRoles: JobRole[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedJobId: number | null;
  setSelectedJobId: (id: number | null) => void;
  filteredJobs: JobRole[];
  uniqueCategories: string[];
  recommendedJobId?: number | null; // 💡 추가
  onStartInterview: () => void;
}

export default function JobSelectionModal({
  jobRoles,
  selectedCategory,
  setSelectedCategory,
  selectedJobId,
  setSelectedJobId,
  filteredJobs,
  uniqueCategories,
  recommendedJobId, // 💡 추가
  onStartInterview,
}: JobSelectionModalProps) {
  const selectedJobData = jobRoles.find((job) => job.id === selectedJobId);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl border border-white/30 p-8"
      >
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-navy flex items-center justify-center shrink-0">
            {recommendedJobId ? (
              <Sparkles className="h-5 w-5 text-yellow-300" />
            ) : (
              <Briefcase className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-navy leading-tight">
              {recommendedJobId ? "AI가 맞춤 직무를 추천했어요!" : "직무를 선택해 주세요"}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {recommendedJobId ? "추천된 직무가 맞다면 바로 시작해주세요." : "계열을 먼저 선택하면 세부 직무가 나타납니다."}
            </p>
          </div>
        </div>

        {/* 대분류 탭 */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {uniqueCategories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSelectedJobId(null);
              }}
              className={`shrink-0 px-4 py-2.5 rounded-full text-xs font-bold transition-colors ${
                selectedCategory === category
                  ? "bg-navy text-white shadow-md shadow-navy/10"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 세부 직무 칩 영역 */}
        <div className="mb-8 min-h-[140px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-2.5 content-start"
            >
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`px-4 py-3.5 rounded-2xl transition-all border-2 flex items-center justify-between group ${
                      selectedJobId === job.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col items-start gap-1 w-full truncate pr-2">
                      <span className="text-[13px] font-bold">{job.name}</span>
                      {/* 💡 추천 직무일 경우 뱃지 추가 */}
                      {recommendedJobId === job.id && (
                        <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-md">
                          ✨ AI 추천
                        </span>
                      )}
                    </div>
                    {selectedJobId === job.id && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                    )}
                  </button>
                ))
              ) : (
                <div className="col-span-2 text-center text-xs text-gray-400 py-6">
                  데이터를 불러오는 중입니다...
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 시작 버튼 */}
        <button
          disabled={!selectedJobId}
          onClick={onStartInterview}
          className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4.5 text-sm font-bold transition-all duration-200 ${
            selectedJobId
              ? "bg-navy text-white hover:bg-navy-dark shadow-lg shadow-navy/20 hover:-translate-y-0.5"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {selectedJobData ? `${selectedJobData.name} 맞춤 면접 시작` : "세부 직무를 선택해 주세요"}
          {selectedJobId && <ChevronRight className="h-4 w-4" />}
        </button>
      </motion.div>
    </div>
  );
}