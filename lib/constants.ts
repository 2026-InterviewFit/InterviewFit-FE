export const MARKETING_NAV_ITEMS = [
  { label: "기능 소개", href: "/features" },
  { label: "커뮤니티", href: "/community" },
  { label: "사용법", href: "/how-to" },
  { label: "소개", href: "/about" },
] as const;

export const APP_NAV_ITEMS = [
  { label: "대시보드", href: "/dashboard" },
  { label: "연습 기록", href: "/history" },
  { label: "추천 질문", href: "/questions" },
] as const;

export const HERO = {
  title: "Practice smarter.",
  subtitle:
    "AI-powered interview coaching that analyzes your tone, gaze, and answers.",
} as const;

export const LIVE_STATS = {
  users: 12847,
  passRate: {
    first: 52,
    repeat: 86,
  },
  satisfaction: 4.8,
} as const;

export const BRAND = {
  name: "InterviewFit",
} as const;