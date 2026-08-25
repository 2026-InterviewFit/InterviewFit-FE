// components/pt-interview/create/JobSelector.tsx
"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";
import { PT_JOB_CATEGORIES } from "@/lib/ptInterviewData";

interface JobSelectorProps {
  value: string; // 선택된 세부 직무명
  onChange: (job: string) => void;
}

export default function JobSelector({ value, onChange }: JobSelectorProps) {
  // 현재 선택된 직무가 속한 카테고리를 초기 탭으로
  const initialCategory =
    PT_JOB_CATEGORIES.find((c) => c.roles.includes(value))?.category ??
    PT_JOB_CATEGORIES[0].category;

  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const roles =
    PT_JOB_CATEGORIES.find((c) => c.category === activeCategory)?.roles ?? [];

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
        <Briefcase className="h-4 w-4" style={{ color: "#95B1EE" }} /> 직무 선택
      </label>

      {/* 대분류 탭 */}
      <div className="flex flex-wrap gap-2">
        {PT_JOB_CATEGORIES.map((c) => (
          <button
            key={c.category}
            type="button"
            onClick={() => setActiveCategory(c.category)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              activeCategory === c.category
                ? "bg-navy text-white shadow-sm"
                : "border border-line bg-surface text-muted hover:border-navy/40 hover:text-ink"
            }`}
          >
            {c.category === "IT/개발" ? "IT · 개발" : c.category}
          </button>
        ))}
      </div>

      {/* 세부 직무 칩 */}
      <div className="flex flex-wrap gap-2 border-l-2 border-brand-soft/50 pl-3">
        {roles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={`rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all ${
              value === role
                ? "border-navy bg-brand-soft/15 text-navy"
                : "border-line bg-bg text-muted hover:border-navy/40 hover:text-ink"
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
}