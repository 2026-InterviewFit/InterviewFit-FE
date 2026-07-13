"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, File, X, ChevronRight, Loader2 } from "lucide-react"; // Loader2 추가

interface ResumeUploadModalProps {
  onNext: (file: File) => void;
  onSkip: () => void;
  isUploading: boolean; // 💡 추가
}

export default function ResumeUploadModal({ onNext, onSkip, isUploading }: ResumeUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl border border-white/30 p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-navy leading-tight">
            자기소개서 업로드
          </h2>
          {!isUploading && (
            <button onClick={onSkip} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div
          className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-colors ${
            isUploading ? "opacity-50 pointer-events-none" : ""
          } ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
          } ${selectedFile ? "border-blue-500 bg-blue-50/30" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]);
          }}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept=".pdf, image/png"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          {selectedFile ? (
            <div className="flex flex-col items-center text-center px-4">
              <File className="h-10 w-10 text-blue-500 mb-3" />
              <p className="text-sm font-bold text-navy truncate w-full max-w-[200px]">{selectedFile.name}</p>
              {!isUploading && <p className="text-xs text-blue-500 mt-2 hover:underline cursor-pointer">다른 파일 선택하기</p>}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center pointer-events-none">
              <UploadCloud className="h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm font-bold text-gray-600">클릭하거나 파일을 드래그하세요</p>
              <p className="text-xs text-gray-400 mt-1">PDF, PNG 파일만 지원합니다</p>
            </div>
          )}
        </div>

        {/* 💡 업로드 중일 때는 스피너와 함께 로딩 상태 표시 */}
        <button
          disabled={!selectedFile || isUploading}
          onClick={() => selectedFile && onNext(selectedFile)}
          className={`mt-6 w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all duration-200 ${
            selectedFile && !isUploading
              ? "bg-navy text-white hover:bg-navy-dark shadow-lg shadow-navy/20 hover:-translate-y-0.5"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI가 자소서를 분석 중입니다...
            </>
          ) : (
            <>
              업로드하고 직무 추천받기
              {selectedFile && <ChevronRight className="h-4 w-4" />}
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}