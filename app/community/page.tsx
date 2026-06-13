"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import {
  ThumbsUp, MessageCircle, Eye, Flame, CheckCircle2,
  Lightbulb, Building2, PenLine, ChevronRight, Award,
} from "lucide-react";

// ─── 타입 ───────────────────────────────────────────────────────
type Category = "전체" | "합격 후기" | "면접 후기" | "꿀팁 공유" | "기업 정보";

interface Post {
  id: number;
  category: Exclude<Category, "전체">;
  company: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  isPinned?: boolean;
  isHot?: boolean;
}

// ─── 카테고리 설정 ───────────────────────────────────────────────
const CATEGORIES: { label: Category; icon: React.ReactNode; color: string }[] = [
  { label: "전체", icon: null, color: "" },
  {
    label: "합격 후기",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800",
  },
  {
    label: "면접 후기",
    icon: <MessageCircle className="h-3.5 w-3.5" />,
    color: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800",
  },
  {
    label: "꿀팁 공유",
    icon: <Lightbulb className="h-3.5 w-3.5" />,
    color: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800",
  },
  {
    label: "기업 정보",
    icon: <Building2 className="h-3.5 w-3.5" />,
    color: "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800",
  },
];

// ─── 목 데이터 ────────────────────────────────────────────────────
const MOCK_POSTS: Post[] = [
  {
    id: 1,
    category: "합격 후기",
    company: "네이버",
    title: "네이버 신입 프론트엔드 최종 합격했습니다 🎉 면접 3번 후기 총정리",
    excerpt:
      "코테 → 1차 실무 → 2차 임원 면접까지 전 과정을 공유합니다. 인터뷰핏으로 두 달 연습한 결과 시선처리 점수가 68점 → 91점까지 올랐어요.",
    author: "익명",
    date: "2026.06.04",
    views: 4821,
    likes: 312,
    comments: 47,
    isPinned: true,
    isHot: true,
  },
  {
    id: 2,
    category: "합격 후기",
    company: "카카오",
    title: "카카오 공채 백엔드 합격 후기 — 압박 질문 대처법이 핵심이었어요",
    excerpt:
      "2차 면접에서 '왜 카카오여야 하나요?'라는 질문에 버벅였는데 덕분에 연습해뒀던 답변 구조로 커버했습니다. STAR 기법이 정말 효과적이에요.",
    author: "익명",
    date: "2026.06.01",
    views: 3104,
    likes: 198,
    comments: 33,
    isHot: true,
  },
  {
    id: 3,
    category: "면접 후기",
    company: "토스",
    title: "토스 UX 디자이너 1차 면접 후기 — 포트폴리오 질문이 80%였어요",
    excerpt:
      "포트폴리오 각 프로젝트의 의사결정 근거를 파고드는 질문이 많았습니다. 직접 그 과정에 대해 논리적으로 설명할 수 있도록 준비하시길 추천드려요.",
    author: "익명",
    date: "2026.05.29",
    views: 2287,
    likes: 141,
    comments: 28,
  },
  {
    id: 4,
    category: "꿀팁 공유",
    company: "",
    title: "인터뷰핏으로 WPM 측정하면서 발견한 나쁜 습관 TOP 3",
    excerpt:
      "'그니까', '뭐랄까', '좋은 것 같습니다' — AI가 잡아준 습관어 3가지를 고쳤더니 면접관 반응이 완전히 달라졌어요. 구체적인 교정법도 공유합니다.",
    author: "익명",
    date: "2026.05.27",
    views: 1893,
    likes: 227,
    comments: 61,
    isHot: true,
  },
  {
    id: 5,
    category: "기업 정보",
    company: "라인",
    title: "라인 2026 하반기 채용 일정 & 면접 프로세스 정리",
    excerpt:
      "공식 채용 공고 기반으로 코딩테스트 → 1차 직무 → 2차 컬쳐핏 면접 순서와 각 단계별 팁을 정리했습니다. 지원 예정이신 분들 참고하세요!",
    author: "익명",
    date: "2026.05.25",
    views: 3412,
    likes: 189,
    comments: 22,
  },
  {
    id: 6,
    category: "면접 후기",
    company: "당근",
    title: "당근마켓 데이터분석가 면접 — 실제 데이터 케이스 스터디 나왔습니다",
    excerpt:
      "가상의 사용자 이탈 데이터를 주고 분석 방향을 즉석에서 제안하는 문제가 나왔어요. SQL보다 인사이트 도출 능력을 더 중요하게 보는 느낌이었습니다.",
    author: "익명",
    date: "2026.05.22",
    views: 1654,
    likes: 98,
    comments: 19,
  },
  {
    id: 7,
    category: "꿀팁 공유",
    company: "",
    title: "면접 전날 밤 루틴 공유 — 이것만 해도 긴장이 반으로 줄어요",
    excerpt:
      "거울 앞 5분 발성 연습, 지원 직무 JD 3번 정독, 그리고 인터뷰핏으로 가장 약한 질문 하나만 집중 연습. 단순하지만 효과 확실해요.",
    author: "익명",
    date: "2026.05.20",
    views: 2109,
    likes: 174,
    comments: 39,
  },
  {
    id: 8,
    category: "합격 후기",
    company: "쿠팡",
    title: "쿠팡 AI 엔지니어 최종 합격 — 6개월 준비 여정 회고",
    excerpt:
      "서류 탈락만 12번. 그래도 포기 안 하고 면접 피드백을 하나하나 분석했어요. 인터뷰핏의 논리성 분석이 답변 구조를 잡는 데 가장 도움됐습니다.",
    author: "익명",
    date: "2026.05.18",
    views: 5233,
    likes: 441,
    comments: 72,
    isHot: true,
  },
];

// ─── 카테고리 배지 컴포넌트 ──────────────────────────────────────
function CategoryBadge({ category }: { category: Exclude<Category, "전체"> }) {
  const cfg = CATEGORIES.find((c) => c.label === category);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg?.color}`}>
      {cfg?.icon}
      {category}
    </span>
  );
}

// ─── 숫자 포맷 ───────────────────────────────────────────────────
function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── 메인 페이지 ─────────────────────────────────────────────────
export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("전체");

  const filtered =
    activeCategory === "전체"
      ? MOCK_POSTS
      : MOCK_POSTS.filter((p) => p.category === activeCategory);

  const pinned = filtered.filter((p) => p.isPinned);
  const normal = filtered.filter((p) => !p.isPinned);

  return (
    <main className="min-h-screen w-full font-sans bg-bg dark:bg-[#0f1729] transition-colors duration-300">
      <Navbar />

      {/* ── 히어로 섹션 ─────────────────────────────────────────── */}
      <section className="relative w-full pt-32 pb-20 px-6 overflow-hidden">
        {/* 배경 블롭 — 커뮤니티 전용 컬러(스카이 + 라임 + 피치) */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-[#bae6fd]/35 blur-[130px]" />
          <div className="absolute -right-20 top-0 h-[600px] w-[600px] rounded-full bg-[#bbf7d0]/30 blur-[150px]" />
          <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[#fed7aa]/25 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto max-w-[1280px] flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-sm font-bold tracking-wide mb-5 border border-sky-100 dark:border-sky-800 backdrop-blur-md">
              COMMUNITY
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy dark:text-white leading-tight">
              혼자 하는 취준의<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
                외로움을 달래는 공간
              </span>
            </h1>
            <p className="mt-4 text-base text-muted dark:text-gray-400 leading-relaxed max-w-xl">
              실제 면접을 다녀온 취준생들의 생생한 후기와 합격 노하우를 공유합니다.<br />
              우리 모두의 경험이 모여 더 나은 준비가 됩니다.
            </p>
          </div>

          {/* 통계 칩 3개 */}
          <div className="flex gap-3 shrink-0 flex-wrap">
            {[
              { label: "누적 후기", value: "2,841", icon: <MessageCircle className="h-4 w-4" /> },
              { label: "이번 주 합격", value: "38명", icon: <Award className="h-4 w-4" /> },
              { label: "실시간 접속", value: "127명", icon: <Flame className="h-4 w-4" /> },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md border border-black/[0.04] dark:border-white/[0.06] px-5 py-3.5 shadow-sm"
              >
                <div className="text-sky-500 dark:text-sky-400">{s.icon}</div>
                <div>
                  <p className="text-[10px] text-muted dark:text-gray-400 font-medium">{s.label}</p>
                  <p className="text-base font-bold text-navy dark:text-white">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 본문 영역 ───────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1280px] px-6 pb-24">

        {/* 필터 탭 + 글쓰기 버튼 */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(({ label, icon, color }) => (
              <button
                key={label}
                onClick={() => setActiveCategory(label)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  activeCategory === label
                    ? label === "전체"
                      ? "bg-navy text-white border-navy dark:bg-white dark:text-navy dark:border-white"
                      : `${color} border`
                    : "bg-white dark:bg-[#1e293b] text-muted dark:text-gray-400 border-line dark:border-white/10 hover:text-ink dark:hover:text-white"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 rounded-2xl bg-navy dark:bg-white px-5 py-2.5 text-sm font-bold text-white dark:text-navy shadow-sm hover:opacity-90 transition-opacity shrink-0">
            <PenLine className="h-4 w-4" />
            후기 작성하기
          </button>
        </div>

        {/* 고정 게시물 (핀) */}
        {pinned.length > 0 && (
          <div className="mb-4 flex flex-col gap-3">
            {pinned.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} isPinnedSection />
            ))}
          </div>
        )}

        {/* 일반 게시물 */}
        <div className="flex flex-col gap-3">
          {normal.map((post, i) => (
            <PostCard key={post.id} post={post} index={i + pinned.length} />
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className="mt-10 flex justify-center">
          <button className="flex items-center gap-2 rounded-full border border-line dark:border-white/10 bg-white dark:bg-[#1e293b] px-8 py-3.5 text-sm font-medium text-muted dark:text-gray-400 hover:text-ink dark:hover:text-white transition-colors shadow-sm">
            더 많은 후기 보기
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// ─── 게시물 카드 컴포넌트 ────────────────────────────────────────
function PostCard({
  post,
  index,
  isPinnedSection = false,
}: {
  post: Post;
  index: number;
  isPinnedSection?: boolean;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      variants={fadeUp}
      whileHover={{ y: -2 }}
      className={`group cursor-pointer rounded-[20px] bg-white dark:bg-[#1e293b] border transition-all shadow-sm hover:shadow-md
        ${isPinnedSection
          ? "border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-900/10"
          : "border-black/[0.03] dark:border-white/[0.05]"
        }
      `}
    >
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">

        {/* 왼쪽: 카테고리 + 제목 + 발췌 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {isPinnedSection && (
              <span className="text-[10px] font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">
                📌 고정
              </span>
            )}
            <CategoryBadge category={post.category} />
            {post.company && (
              <span className="text-[11px] font-semibold text-muted dark:text-gray-400 bg-chip dark:bg-[#0f1729] px-2.5 py-1 rounded-full">
                {post.company}
              </span>
            )}
            {post.isHot && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-orange-500">
                <Flame className="h-3 w-3" /> HOT
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-navy dark:text-white leading-snug line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {post.title}
          </h3>
          <p className="mt-1.5 text-sm text-muted dark:text-gray-400 line-clamp-1 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* 오른쪽: 날짜 + 통계 */}
        <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 shrink-0">
          <span className="text-xs text-muted dark:text-gray-500">{post.date}</span>
          <div className="flex items-center gap-3 text-xs text-muted dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {fmt(post.views)}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" /> {fmt(post.likes)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> {post.comments}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}