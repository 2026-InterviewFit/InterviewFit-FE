// components/group-interview/lobby/CategoryFilter.tsx
"use client";

import { GROUP_CATEGORIES } from "@/lib/groupInterviewData";

const TABS = ["전체", ...GROUP_CATEGORIES];

interface CategoryFilterProps {
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {TABS.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
            active === cat
              ? "bg-navy text-white shadow-sm"
              : "border border-line bg-surface text-muted hover:border-navy/40 hover:text-ink"
          }`}
        >
          {cat === "IT/개발" ? "IT · 개발" : cat}
        </button>
      ))}
    </div>
  );
}
