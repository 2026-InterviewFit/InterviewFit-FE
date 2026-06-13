"use client";

import { BarChart3, TrendingUp, Award, Clock } from "lucide-react";

const STATS = [
  {
    icon: BarChart3,
    label: "평균 종합 점수",
    value: "76.5점",
    badge: "+8.5점",
    badgeLabel: "지난 회차 대비",
    color: "blue",
  },
  {
    icon: TrendingUp,
    label: "총 연습 횟수",
    value: "3회",
    badge: "+1회",
    badgeLabel: "이번 주",
    color: "emerald",
  },
  {
    icon: Award,
    label: "최고 점수",
    value: "85점",
    badge: "3회차",
    badgeLabel: "달성 회차",
    color: "amber",
  },
  {
    icon: Clock,
    label: "총 연습 시간",
    value: "47분",
    badge: "+12분",
    badgeLabel: "지난 주 대비",
    color: "purple",
  },
];

const COLOR_MAP: Record<string, { wrap: string; icon: string; badge: string }> = {
  blue: {
    wrap: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  emerald: {
    wrap: "bg-emerald-50 dark:bg-emerald-900/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    wrap: "bg-amber-50 dark:bg-amber-900/20",
    icon: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  },
  purple: {
    wrap: "bg-purple-50 dark:bg-purple-900/20",
    icon: "text-purple-600 dark:text-purple-400",
    badge: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
};

export default function AnalyticsSection() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {STATS.map((stat) => {
        const c = COLOR_MAP[stat.color];
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-[24px] bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-colors duration-300 flex flex-col gap-4"
          >
            <div className={`h-10 w-10 rounded-full ${c.wrap} flex items-center justify-center ${c.icon}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted dark:text-gray-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-navy dark:text-white">{stat.value}</p>
            </div>
            <span className={`self-start text-xs font-bold px-2 py-1 rounded-full ${c.badge}`}>
              {stat.badge} {stat.badgeLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}