// components/pt-interview/create/DocumentUploader.tsx
"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileText, X, RefreshCcw } from "lucide-react";
import { ACCEPTED_DOC_TYPES, formatFileSize } from "@/lib/ptInterviewData";

interface DocumentUploaderProps {
  file: File | null;
  onSelect: (file: File | null) => void;
}

export default function DocumentUploader({ file, onSelect }: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    onSelect(f);
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
        <UploadCloud className="h-4 w-4" style={{ color: "#364C84" }} /> 발표 자료 업로드
      </label>

      {file ? (
        // 업로드 완료 상태
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "#364C84", color: "#E7F1A8" }}
          >
            <FileText className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{file.name}</p>
            <p className="mt-0.5 text-xs font-medium text-muted">
              {formatFileSize(file.size)} ·{" "}
              {file.name.split(".").pop()?.toUpperCase() ?? "FILE"}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-xs font-bold text-muted transition-colors hover:border-navy/40 hover:text-ink"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> 재업로드
            </button>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        // 드롭존
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            pickFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${
            isDragging
              ? "border-navy bg-brand-soft/10"
              : "border-line bg-bg hover:bg-chip/40"
          }`}
        >
          <UploadCloud className="mb-3 h-10 w-10 text-muted" />
          <p className="text-sm font-bold text-ink">클릭하거나 파일을 드래그하세요</p>
          <p className="mt-1 text-xs font-medium text-muted">
            PPT, PPTX, PDF 파일을 지원합니다
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_DOC_TYPES.join(",")}
        className="hidden"
        onChange={(e) => pickFile(e.target.files?.[0])}
      />
    </div>
  );
}