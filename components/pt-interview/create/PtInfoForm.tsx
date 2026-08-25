// components/pt-interview/create/PtInfoForm.tsx
"use client";

import { FileText, ListChecks, Clock, Timer } from "lucide-react";
import { PREP_MINUTE_OPTIONS, LIMIT_MINUTE_OPTIONS } from "@/lib/ptInterviewData";

interface PtInfoFormProps {
  topic: string;
  instruction: string;
  prepMinutes: number;
  limitMinutes: number;
  onChange: (patch: {
    topic?: string;
    instruction?: string;
    prepMinutes?: number;
    limitMinutes?: number;
  }) => void;
}

export default function PtInfoForm({
  topic,
  instruction,
  prepMinutes,
  limitMinutes,
  onChange,
}: PtInfoFormProps) {
  return (
    <div className="space-y-6">
      {/* 발표 주제 */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <FileText className="h-4 w-4" style={{ color: "#364C84" }} /> 발표 주제
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => onChange({ topic: e.target.value })}
          placeholder="예: AI 기반 모의면접 플랫폼 서비스 제안"
          className="w-full rounded-xl border border-line bg-bg p-3.5 text-sm text-ink transition-all focus:border-navy focus:outline-none focus:ring-2 focus:ring-brand-soft/40"
        />
      </div>

      {/* 면접 지시사항 */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <ListChecks className="h-4 w-4" style={{ color: "#95B1EE" }} /> 면접 지시사항
        </label>
        <textarea
          value={instruction}
          onChange={(e) => onChange({ instruction: e.target.value })}
          placeholder="예: 서비스의 차별점과 기술적 구현 방식을 중심으로 발표해 주세요."
          className="h-28 w-full resize-none rounded-xl border border-line bg-bg p-3.5 text-sm text-ink transition-all focus:border-navy focus:outline-none focus:ring-2 focus:ring-brand-soft/40"
        />
      </div>

      {/* 준비 시간 / 발표 제한 시간 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <Clock className="h-4 w-4" style={{ color: "#364C84" }} /> 준비 시간
          </label>
          <div className="flex gap-2">
            {PREP_MINUTE_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ prepMinutes: m })}
                className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-all ${
                  prepMinutes === m
                    ? "border-navy bg-brand-soft/15 text-navy"
                    : "border-line bg-bg text-muted hover:border-navy/40"
                }`}
              >
                {m}분
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <Timer className="h-4 w-4" style={{ color: "#95B1EE" }} /> 발표 제한 시간
          </label>
          <div className="flex gap-2">
            {LIMIT_MINUTE_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ limitMinutes: m })}
                className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-all ${
                  limitMinutes === m
                    ? "border-navy bg-brand-soft/15 text-navy"
                    : "border-line bg-bg text-muted hover:border-navy/40"
                }`}
              >
                {m}분
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}