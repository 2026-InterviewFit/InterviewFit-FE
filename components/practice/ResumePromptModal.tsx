"use client";

import { motion } from "framer-motion";
import { FileText, ArrowRight, X } from "lucide-react";

interface ResumePromptModalProps {
  onYes: () => void;
  onNo: () => void;
}

export default function ResumePromptModal({ onYes, onNo }: ResumePromptModalProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl border border-white/30 p-8 text-center"
      >
        <div className="mx-auto h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        
        <h2 className="text-xl font-bold text-navy leading-tight mb-2">
          자기소개서(PDF, PNG)를<br />기입하시겠습니까?
        </h2>
        <p className="text-xs text-muted mb-8 break-keep">
          파일을 첨부하시면 AI가 내용을 분석하여<br />더욱 날카로운 맞춤형 꼬리 질문을 제공합니다.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onYes}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-navy py-4 text-sm font-bold text-white transition-all duration-200 hover:bg-navy-dark shadow-lg shadow-navy/20 hover:-translate-y-0.5"
          >
            예, 파일 첨부할게요
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onNo}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-50 py-4 text-sm font-bold text-gray-500 transition-all duration-200 hover:bg-gray-100"
          >
            아니오, 바로 직무 선택할게요
          </button>
        </div>
      </motion.div>
    </div>
  );
}