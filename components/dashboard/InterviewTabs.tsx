// components/dashboard/InterviewTabs.tsx
"use client";

import type { InterviewKind } from "@/lib/interviewHistoryStore";

export type TabKey = "all" | InterviewKind;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "single", label: "1:1 면접" },
  { key: "group", label: "그룹 면접" },
  { key: "pt", label: "PT 면접" },
];

interface InterviewTabsProps {
  active: TabKey;
  counts: Record<TabKey, number>;
  onChange: (key: TabKey) => void;
}

export default function InterviewTabs({ active, counts, onChange }: InterviewTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all ${
              isActive
                ? "bg-navy text-white shadow-sm"
                : "border border-line bg-surface text-muted hover:border-navy/40 hover:text-ink dark:bg-[#1e293b] dark:border-white/10"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                isActive ? "bg-white/20 text-white" : "bg-chip text-muted"
              }`}
            >
              {counts[tab.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}