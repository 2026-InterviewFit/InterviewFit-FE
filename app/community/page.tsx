"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { ThumbsUp, MessageCircle, Eye, Flame, CheckCircle2, Lightbulb, Building2, PenLine, ChevronRight, Award } from "lucide-react";

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

const CATEGORIES: { label: Category; icon: React.ReactNode }[] = [
  { label: "전체", icon: null },
  { label: "합격 후기", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { label: "면접 후기", icon: <MessageCircle className="h-3.5 w-3.5" /> },
  { label: "꿀팁 공유", icon: <Lightbulb className="h-3.5 w-3.5" /> },
  { label: "기업 정보", icon: <Building2 className="h-3.5 w-3.5" /> },
];

const MOCK_POSTS: Post[] = [
  {
    id: 1, category: "합격 후기", company: "네이버",
    title: "네이버 신입 프론트엔드 최종 합격했습니다 🎉 면접 3번 후기 총정리",
    excerpt: "코테 → 1차 실무 → 2차 임원 면접까지 전 과정을 공유합니다. 인터뷰핏으로 두 달 연습한 결과 시선처리 점수가 올랐어요.",
    author: "익명", date: "2026.06.04", views: 4821, likes: 312, comments: 47, isPinned: true, isHot: true,
  },
  {
    id: 2, category: "합격 후기", company: "카카오",
    title: "카카오 공채 백엔드 합격 후기 — 압박 질문 대처법이 핵심이었어요",
    excerpt: "2차 면접에서 '왜 카카오여야 하나요?'라는 질문에 버벅였는데 덕분에 연습해뒀던 답변 구조로 커버했습니다. STAR 기법이 정말 효과적이에요.",
    author: "익명", date: "2026.06.01", views: 3104, likes: 198, comments: 33, isHot: true,
  },
  {
    id: 3, category: "면접 후기", company: "토스",
    title: "토스 UX 디자이너 1차 면접 후기 — 포트폴리오 질문이 80%였어요",
    excerpt: "포트폴리오 각 프로젝트의 의사결정 근거를 파고드는 질문이 많았습니다. 직접 그 과정에 대해 논리적으로 설명할 수 있도록 준비하시길 추천드려요.",
    author: "익명", date: "2026.05.29", views: 2287, likes: 141, comments: 28,
  },
];

function CategoryBadge({ category }: { category: Exclude<Category, "전체"> }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
      {category}
    </span>
  );
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.05 } }),
};

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("전체");

  const filtered = activeCategory === "전체" ? MOCK_POSTS : MOCK_POSTS.filter((p) => p.category === activeCategory);
  const pinned = filtered.filter((p) => p.isPinned);
  const normal = filtered.filter((p) => !p.isPinned);

  return (
    <main className="relative min-h-screen w-full font-sans bg-bg dark:bg-[#0f1729] transition-colors duration-300 overflow-x-hidden">
      <Navbar />

      {/* 💡 배경 블롭을 컨텐츠 섹션 제약 없이 위쪽에 크게 깔고, 밑으로 갈수록 부드럽게 지워지도록 마스크(gradient)를 추가했습니다. */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-[900px] z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg dark:to-[#0f1729] z-10" />
        <div className="absolute -left-20 -top-20 h-[600px] w-[600px] rounded-full bg-[#bfdbfe]/50 blur-[150px]" />
        <div className="absolute -right-20 top-0 h-[700px] w-[700px] rounded-full bg-[#fef08a]/40 blur-[160px]" />
      </div>

      {/* 💡 기존 pt-32 pb-16 을 pt-40 pb-24 로 늘려 위아래 여백을 확보하고 답답함을 없앴습니다. */}
      <section className="relative z-10 w-full pt-40 pb-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="mx-auto max-w-[1280px] flex flex-col md:flex-row md:items-end justify-between gap-10"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/60 dark:bg-navy/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest mb-5 border border-white/50 backdrop-blur-md shadow-sm">
              COMMUNITY
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy dark:text-white leading-tight tracking-tight">
              혼자 하는 취준의<br />외로움을 달래는 공간
            </h1>
            <p className="mt-5 text-base text-navy/70 dark:text-gray-400 leading-relaxed max-w-xl font-medium">
              실제 면접을 다녀온 취준생들의 생생한 후기와 합격 노하우를 공유합니다.<br />우리 모두의 경험이 모여 더 나은 준비가 됩니다.
            </p>
          </div>

          <div className="flex gap-3 shrink-0 flex-wrap">
            {[
              { label: "누적 후기", value: "2,841", icon: <MessageCircle className="h-4 w-4" />, color: "text-blue-500" },
              { label: "이번 주 합격", value: "38명", icon: <Award className="h-4 w-4" />, color: "text-purple-500" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4 rounded-3xl bg-white/80 dark:bg-[#1e293b]/80 border border-black/[0.03] px-6 py-4 shadow-sm backdrop-blur-md">
                <div className={s.color}>{s.icon}</div>
                <div>
                  <p className="text-[11px] text-navy/50 font-medium mb-0.5">{s.label}</p>
                  <p className="text-lg font-bold text-navy dark:text-white">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 💡 컨텐츠 섹션 상단 여백 추가로 탭과의 거리 확보 */}
      <section className="relative z-10 mx-auto w-full max-w-[1280px] px-6 pb-24">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(({ label, icon }) => (
              <button
                key={label} onClick={() => setActiveCategory(label)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  activeCategory === label
                    ? "bg-navy text-white border-navy dark:bg-white dark:text-navy"
                    : "bg-white dark:bg-[#1e293b] text-navy/60 border-black/5 hover:border-black/10"
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 rounded-xl bg-navy dark:bg-white px-5 py-2.5 text-sm font-bold text-white dark:text-navy shadow-sm hover:opacity-90 transition-opacity shrink-0">
            <PenLine className="h-4 w-4" /> 후기 작성하기
          </button>
        </div>

        {pinned.length > 0 && (
          <div className="mb-4 flex flex-col gap-3">
            {pinned.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} isPinnedSection />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {normal.map((post, i) => (
            <PostCard key={post.id} post={post} index={i + pinned.length} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button className="flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#1e293b] px-8 py-4 text-sm font-semibold text-navy/60 hover:text-navy transition-colors shadow-sm">
            더 많은 후기 보기 <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function PostCard({ post, index, isPinnedSection = false }: { post: Post; index: number; isPinnedSection?: boolean }) {
  return (
    <motion.div
      custom={index} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-30px" }}
      variants={fadeUp} whileHover={{ y: -2 }}
      className={`group cursor-pointer rounded-2xl bg-white dark:bg-[#1e293b] border transition-all shadow-sm
        ${isPinnedSection ? "border-blue-100 bg-gradient-to-r from-blue-50/50 to-purple-50/20" : "border-black/[0.04] dark:border-white/[0.04] hover:shadow-md hover:border-blue-200"}
      `}
    >
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {isPinnedSection && <span className="text-[10px] font-bold text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-md">📌 공지</span>}
            <CategoryBadge category={post.category} />
            {post.company && <span className="text-[11px] font-semibold text-navy/50 pl-1 border-l border-black/10 ml-1">{post.company}</span>}
            {post.isHot && <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">HOT</span>}
          </div>
          <h3 className="text-base font-bold text-navy dark:text-white leading-snug line-clamp-1 tracking-tight group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
          <p className="mt-1.5 text-sm text-navy/60 dark:text-neutral-400 line-clamp-1 font-medium">{post.excerpt}</p>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 shrink-0 text-xs text-navy/50 font-medium">
          <span>{post.date}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {fmt(post.views)}</span>
            <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {fmt(post.likes)}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.comments}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}