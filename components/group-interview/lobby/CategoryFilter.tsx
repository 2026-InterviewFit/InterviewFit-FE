// components/group-interview/lobby/CategoryFilter.tsx
"use client";

import { GROUP_CATEGORIES } from "@/lib/groupInterviewData";

const TABS = ["전체", ...GROUP_CATEGORIES];

interface CategoryFilterProps {
  active: string;
  onChange: (category: string) => void;
  counts?: Readonly<Record<string, number>>;
}

export default function CategoryFilter({ active, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="relative min-w-0 after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-8 after:bg-gradient-to-l after:from-bg after:to-transparent md:after:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1 pr-7 md:pr-0">
        {TABS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              active === cat
                ? "bg-navy text-white shadow-sm"
                : "border border-line bg-surface text-muted hover:border-navy/40 hover:text-ink"
            }`}
          >
            {cat === "IT/개발" ? "IT · 개발" : cat} {counts ? counts[cat] ?? 0 : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
