"use client";

import { Calendar, Play } from "lucide-react";

export interface VideoRecord {
  id: number;
  round: number;
  date: string;
  title: string;
  subtitle: string;
  score: number;
  badge: string;
  badgeColor: "blue" | "red" | "emerald";
}

interface VideoHistoryProps {
  records: VideoRecord[];
  onSelect: (id: number) => void;
}

const BADGE_COLORS: Record<VideoRecord["badgeColor"], string> = {
  blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  red: "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400",
  emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
};

export default function VideoHistory({ records, onSelect }: VideoHistoryProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {records.map((record) => (
        <div
          key={record.id}
          className="flex w-full items-center justify-between rounded-[24px] bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-bg dark:bg-[#0f1729] border border-line dark:border-white/5">
              <span className="text-[9px] font-medium text-muted dark:text-gray-400">회차</span>
              <span className="text-sm font-bold text-navy dark:text-white">{record.round}회차</span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted dark:text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                {record.date}
                <span className={`rounded px-1.5 py-0.5 ${BADGE_COLORS[record.badgeColor]}`}>
                  {record.badge}
                </span>
              </div>
              <h3 className="mt-1.5 text-base font-bold text-ink dark:text-white line-clamp-1">
                {record.title}
              </h3>
              <p className="mt-1 text-xs text-muted dark:text-gray-400">{record.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-medium text-muted dark:text-gray-400">종합 점수</p>
              <p className="text-2xl font-bold text-navy dark:text-white">
                {record.score}<span className="text-sm font-medium">점</span>
              </p>
            </div>
            <button
              onClick={() => onSelect(record.id)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg dark:bg-[#0f1729] text-navy dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <Play className="h-4 w-4 fill-navy dark:fill-white pl-0.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}