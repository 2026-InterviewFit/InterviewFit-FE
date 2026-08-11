// components/community/views/FeedView.tsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Lock, Heart, TrendingUp, Clock, Trophy, ChevronDown, Sparkles } from "lucide-react";
import { MOCK_BEST_ANSWERS, JOB_CATEGORIES, PALETTE, maskText } from "@/lib/communityData";

// 대분류 탭 (전체 + job_role 테이블의 category)
const MAIN_TABS = ["전체", ...JOB_CATEGORIES.map((c) => c.category)];

const SORTS = [
  { id: "popular", label: "인기순", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { id: "recent", label: "최신순", icon: <Clock className="h-3.5 w-3.5" /> },
  { id: "score", label: "점수순", icon: <Trophy className="h-3.5 w-3.5" /> },
];

const PAGE_SIZE = 12;

const gradeOf = (score: number) => {
  if (score >= 95) return { label: "A+", bg: PALETTE.navy, fg: PALETTE.lime };
  if (score >= 90) return { label: "A", bg: PALETTE.navy, fg: PALETTE.cream };
  if (score >= 85) return { label: "B+", bg: PALETTE.sky, fg: PALETTE.navyDark };
  return { label: "B", bg: PALETTE.sky, fg: PALETTE.navyDark };
};

const pseudoLikes = (id: number, score: number) => (score - 60) * 3 + (id * 7) % 23;

export default function FeedView() {
  const [mainCat, setMainCat] = useState("전체");
  const [subRole, setSubRole] = useState<string | null>(null);
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const subRoles = useMemo(() => {
    if (mainCat === "전체") return [];
    return JOB_CATEGORIES.find((c) => c.category === mainCat)?.roles ?? [];
  }, [mainCat]);

  const resetPaging = () => setVisible(PAGE_SIZE);

  const handleMainCat = (cat: string) => {
    setMainCat(cat);
    setSubRole(null);
    resetPaging();
  };

  const processed = useMemo(() => {
    let list = [...MOCK_BEST_ANSWERS];

    if (mainCat !== "전체") {
      const rolesInCat = JOB_CATEGORIES.find((c) => c.category === mainCat)?.roles ?? [];
      list = list.filter((a) => rolesInCat.includes(a.category));
    }

    if (subRole) list = list.filter((a) => a.category === subRole);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          maskText(a.script).toLowerCase().includes(q) ||
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sort === "score") return b.score - a.score;
      if (sort === "recent") return b.id - a.id;
      return pseudoLikes(b.id, b.score) - pseudoLikes(a.id, a.score);
    });

    return list;
  }, [mainCat, subRole, sort, search]);

  const shown = processed.slice(0, visible);
  const hasMore = visible < processed.length;

  return (
    <div className="flex w-full flex-col animate-in fade-in duration-500">
      {/* 헤더 */}
      <div className="mb-5 px-1">
        <h2 className="text-lg font-bold tracking-tight text-ink">우수 답변 갤러리</h2>
        <p className="mt-0.5 text-xs font-medium text-muted">
          AI 검증 80점 이상 · 개인정보 마스킹 완료 · 총 {processed.length}건
        </p>
      </div>

      {/* 툴바: 검색 + 정렬 */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm md:flex-row md:items-center">
        <div className="relative w-full flex-1">
          <input
            type="text"
            placeholder="답변 내용, 기업, 직무 검색..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPaging();
            }}
            className="w-full rounded-xl border border-line bg-bg py-2.5 pl-10 pr-4 text-sm text-ink transition-all focus:border-navy focus:outline-none focus:ring-2 focus:ring-brand-soft/40"
          />
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-line bg-bg p-1">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                sort === s.id ? "bg-navy text-white shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1행: 대분류 탭 */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {MAIN_TABS.map((cat) => (
          <button
            key={cat}
            onClick={() => handleMainCat(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              mainCat === cat
                ? "bg-navy text-white shadow-sm"
                : "border border-line bg-surface text-muted hover:border-navy/40 hover:text-ink"
            }`}
          >
            {cat === "IT/개발" ? "IT · 개발" : cat}
          </button>
        ))}
      </div>

      {/* 2행: 세부 직무 (대분류 선택 시에만 등장) */}
      <AnimatePresence initial={false}>
        {subRoles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-8 flex flex-wrap gap-2 border-l-2 border-brand-soft/50 pl-3">
              <button
                onClick={() => {
                  setSubRole(null);
                  resetPaging();
                }}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                  subRole === null
                    ? "bg-brand-soft/25 text-navy"
                    : "text-muted hover:bg-chip hover:text-ink"
                }`}
              >
                전체 직무
              </button>
              {subRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setSubRole(role);
                    resetPaging();
                  }}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                    subRole === role
                      ? "bg-brand-soft/25 text-navy"
                      : "text-muted hover:bg-chip hover:text-ink"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {subRoles.length === 0 && <div className="mb-5" />}

      {/* 결과 */}
      {processed.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface py-20 text-center shadow-sm">
          <Sparkles className="h-8 w-8 text-line" />
          <p className="text-sm font-bold text-ink">조건에 맞는 답변이 없어요</p>
          <p className="text-xs text-muted">필터나 검색어를 바꿔보세요.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((ans, i) => {
              const grade = gradeOf(ans.score);
              const likes = pseudoLikes(ans.id, ans.score);
              const masked = maskText(ans.script);
              const isExpanded = expandedId === ans.id;
              const isLong = masked.length > 90;

              return (
                <motion.article
                  key={ans.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % PAGE_SIZE) * 0.03 }}
                  className="flex flex-col rounded-[20px] border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="shrink-0 rounded-md bg-chip px-2 py-0.5 text-[11px] font-bold text-ink">
                        {ans.company}
                      </span>
                      <span className="truncate text-[11px] font-bold text-muted">{ans.role}</span>
                    </div>
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                      style={{ backgroundColor: grade.bg, color: grade.fg }}
                    >
                      {grade.label}
                    </div>
                  </div>

                  <p
                    className={`flex-1 text-sm font-medium leading-relaxed text-ink ${
                      isExpanded ? "" : "line-clamp-4"
                    }`}
                  >
                    “{masked}”
                  </p>

                  {isLong && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : ans.id)}
                      className="mt-2 self-start text-[11px] font-bold text-navy hover:underline"
                    >
                      {isExpanded ? "접기" : "더보기"}
                    </button>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px] font-medium text-muted">
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" style={{ color: PALETTE.sky }} /> {likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" /> 마스킹
                      </span>
                    </span>
                    <span className="font-bold" style={{ color: PALETTE.navy }}>
                      {ans.author}
                    </span>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-6 py-3 text-sm font-bold text-ink shadow-sm transition-all hover:border-navy/40 hover:-translate-y-0.5"
              >
                답변 더 보기 <ChevronDown className="h-4 w-4" />
                <span className="text-muted">({processed.length - visible})</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}