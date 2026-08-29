// components/community/views/WikiView.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Check,
  ShieldCheck,
  Filter,
  Plus,
  Play,
  X,
  Building2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ALL_ROLES, PALETTE } from "@/lib/communityData";
import {
  COMPANY_TIERS,
  CommunityApiError,
  getCommunityWikiQuestions,
  verifyCommunityWikiQuestion,
  type CommunityWikiQuestion,
} from "@/lib/communityApi";

const TIERS = [...COMPANY_TIERS];
const ROLES = ALL_ROLES;

// 기업명 → 이니셜 칩 색상 (팔레트 3색을 해시로 순환 배정)
const CHIP_COLORS = [
  { bg: PALETTE.navy, fg: PALETTE.cream },
  { bg: PALETTE.sky, fg: PALETTE.navyDark },
  { bg: PALETTE.lime, fg: PALETTE.limeInk },
];

const chipColorFor = (name: string) => {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CHIP_COLORS[sum % CHIP_COLORS.length];
};

interface WikiViewProps {
  selectedQuestions: string[];
  onToggleQuestion: (id: string, text: string) => void;
}

export default function WikiView({
  onToggleQuestion,
  selectedQuestions,
}: WikiViewProps) {
  const router = useRouter();

  const [questions, setQuestions] = useState<CommunityWikiQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [openDropdown, setOpenDropdown] = useState<"tier" | "role" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getCommunityWikiQuestions();
      setQuestions(data);
    } catch (error) {
      console.error("커뮤니티 위키 조회 실패:", error);
      setLoadError(
        error instanceof Error
          ? error.message
          : "기출문제를 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFilter = (
    item: string,
    list: string[],
    setList: (arr: string[]) => void,
  ) => {
    setList(
      list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item],
    );
  };

  const filtered = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return questions.filter((q) => {
      const matchesTier =
        selectedTiers.length === 0 || selectedTiers.includes(q.tier);
      const matchesRole =
        selectedRoles.length === 0 || selectedRoles.includes(q.role);
      const matchesSearch =
        keyword.length === 0 ||
        q.companyName.toLowerCase().includes(keyword) ||
        q.role.toLowerCase().includes(keyword) ||
        q.text.toLowerCase().includes(keyword);

      return matchesTier && matchesRole && matchesSearch;
    });
  }, [questions, searchTerm, selectedRoles, selectedTiers]);

  const hasActiveFilter =
    selectedTiers.length > 0 ||
    selectedRoles.length > 0 ||
    searchTerm.length > 0;

  const clearAll = () => {
    setSelectedTiers([]);
    setSelectedRoles([]);
    setSearchTerm("");
  };

  const handleVerify = async (question: CommunityWikiQuestion) => {
    if (question.verified || question.verifiedByMe || verifyingId !== null) {
      return;
    }

    setVerifyingId(question.id);

    try {
      const updated = await verifyCommunityWikiQuestion(question.id);

      setQuestions((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      console.error("기출문제 검증 실패:", error);

      if (error instanceof CommunityApiError && error.status === 401) {
        alert("기출문제 검증은 로그인 후 참여할 수 있습니다.");
        router.push("/login");
        return;
      }

      alert(
        error instanceof Error
          ? error.message
          : "기출문제 검증에 실패했습니다.",
      );
    } finally {
      setVerifyingId(null);
    }
  };

  const startWikiInterview = () => {
    localStorage.setItem(
      "wikiSelectedQuestions",
      JSON.stringify(selectedQuestions),
    );
    router.push("/interview");
  };

  return (
    <div className="flex w-full animate-in fade-in duration-500 gap-6">
      {/* ───────── 좌측: 도구(필터 + 리스트) ───────── */}
      <div className="min-w-0 flex-1">
        <div className="mb-5 flex items-end justify-between px-1">
          <p className="text-sm font-bold text-ink">
            총 <span className="text-navy">{filtered.length}</span>건의 기출문제
          </p>
          <button
            onClick={() => router.push("/community/add-wiki")}
            className="flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-navy-dark"
          >
            <Plus className="h-3.5 w-3.5" /> 기출문제 등록
          </button>
        </div>

        {/* 필터 바 */}
        <div
          ref={dropdownRef}
          className="mb-4 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm md:flex-row md:items-center"
        >
          <div className="relative w-full flex-1">
            <input
              type="text"
              placeholder="기업명 또는 질문 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-line bg-bg py-2.5 pl-10 pr-4 text-sm text-ink transition-all focus:border-navy focus:outline-none focus:ring-2 focus:ring-brand-soft/40"
            />
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* 기업 규모 */}
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "tier" ? null : "tier")
                }
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all ${
                  selectedTiers.length > 0
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-bg text-ink hover:border-navy/40"
                }`}
              >
                <Filter className="h-3.5 w-3.5" /> 규모
                {selectedTiers.length > 0 && ` ${selectedTiers.length}`}
              </button>

              {openDropdown === "tier" && (
                <div className="absolute right-0 top-full z-30 mt-2 flex w-44 flex-col gap-0.5 rounded-xl border border-line bg-surface p-2 shadow-xl">
                  {TIERS.map((tier) => (
                    <label
                      key={tier}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 hover:bg-chip"
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                          selectedTiers.includes(tier)
                            ? "border-navy bg-navy text-white"
                            : "border-line bg-bg"
                        }`}
                      >
                        {selectedTiers.includes(tier) && (
                          <Check className="h-3 w-3" strokeWidth={3} />
                        )}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedTiers.includes(tier)}
                        onChange={() =>
                          toggleFilter(tier, selectedTiers, setSelectedTiers)
                        }
                        className="hidden"
                      />
                      <span className="text-sm font-medium text-ink">{tier}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 직무 */}
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "role" ? null : "role")
                }
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all ${
                  selectedRoles.length > 0
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-bg text-ink hover:border-navy/40"
                }`}
              >
                직무{selectedRoles.length > 0 && ` ${selectedRoles.length}`}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {openDropdown === "role" && (
                <div className="absolute right-0 top-full z-30 mt-2 flex max-h-64 w-52 flex-col gap-0.5 overflow-y-auto rounded-xl border border-line bg-surface p-2 shadow-xl">
                  {ROLES.map((role) => (
                    <label
                      key={role}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 hover:bg-chip"
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                          selectedRoles.includes(role)
                            ? "border-navy bg-navy text-white"
                            : "border-line bg-bg"
                        }`}
                      >
                        {selectedRoles.includes(role) && (
                          <Check className="h-3 w-3" strokeWidth={3} />
                        )}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role)}
                        onChange={() =>
                          toggleFilter(role, selectedRoles, setSelectedRoles)
                        }
                        className="hidden"
                      />
                      <span className="truncate text-sm font-medium text-ink">
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 활성 필터 표시 + 초기화 */}
        {hasActiveFilter && (
          <div className="mb-4 flex flex-wrap items-center gap-2 px-1">
            {[...selectedTiers, ...selectedRoles].map((filter) => (
              <span
                key={filter}
                className="flex items-center gap-1 rounded-md bg-brand-soft/20 px-2 py-1 text-[11px] font-bold text-navy"
              >
                {filter}
              </span>
            ))}
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-[11px] font-bold text-muted hover:text-navy"
            >
              <X className="h-3 w-3" /> 초기화
            </button>
          </div>
        )}

        {/* 질문 리스트 */}
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Loader2 className="h-7 w-7 animate-spin text-navy" />
              <p className="text-sm font-bold text-ink">기출문제를 불러오는 중이에요</p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <p className="text-sm font-bold text-ink">기출문제를 불러오지 못했어요</p>
              <p className="max-w-md px-6 text-xs text-muted">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadQuestions()}
                className="mt-1 flex items-center gap-1.5 rounded-lg border border-line bg-bg px-3 py-2 text-xs font-bold text-navy hover:border-navy/40"
              >
                <RefreshCw className="h-3.5 w-3.5" /> 다시 불러오기
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <Search className="h-8 w-8 text-line" />
              <p className="text-sm font-bold text-ink">검색 결과가 없어요</p>
              <p className="text-xs text-muted">
                필터를 바꾸거나 새 기출문제를 등록해보세요.
              </p>
            </div>
          ) : (
            filtered.map((question) => {
              const isChecked = selectedQuestions.includes(question.text);
              const chip = chipColorFor(question.companyName);
              const verifyPct = Math.min((question.verifiedCount / 5) * 100, 100);
              const isVerifying = verifyingId === question.id;
              const canSelect = question.verified;

              return (
                <div
                  key={question.id}
                  className={`group flex items-center gap-4 border-b border-line px-4 py-3.5 transition-colors last:border-b-0 ${
                    isChecked ? "bg-brand-soft/10" : "hover:bg-chip/40"
                  }`}
                >
                  {/* 검증 완료된 질문만 모의면접에 담을 수 있음 */}
                  <button
                    type="button"
                    aria-label={
                      canSelect
                        ? isChecked
                          ? "선택 해제"
                          : "질문 선택"
                        : "검증 완료 후 선택 가능"
                    }
                    aria-pressed={isChecked}
                    disabled={!canSelect}
                    onClick={() =>
                      onToggleQuestion(String(question.id), question.text)
                    }
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                      !canSelect
                        ? "cursor-not-allowed border-line bg-chip/50 opacity-60"
                        : isChecked
                          ? "border-navy bg-navy text-white"
                          : "border-line bg-bg group-hover:border-navy/40"
                    }`}
                  >
                    {isChecked && (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    )}
                  </button>

                  {/* 기업 이니셜 칩 */}
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                    style={{ backgroundColor: chip.bg, color: chip.fg }}
                  >
                    {question.companyName.charAt(0)}
                  </div>

                  {/* 질문 본문 */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-ink">
                        {question.companyName}
                      </span>
                      <span className="text-[10px] font-bold text-muted">·</span>
                      <span className="rounded-md bg-chip px-1.5 py-0.5 text-[10px] font-bold text-muted">
                        {question.tier}
                      </span>
                      <span
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                        style={{
                          backgroundColor: "rgba(149,177,238,0.18)",
                          color: PALETTE.navy,
                        }}
                      >
                        {question.role}
                      </span>
                    </div>
                    <p className="truncate text-sm font-semibold text-ink">
                      {question.text}
                    </p>
                    <p className="mt-1 text-[10px] font-medium text-muted sm:hidden">
                      {question.verified
                        ? "검증완료"
                        : `${question.verifiedCount}/5 검증중`}
                    </p>
                  </div>

                  {/* 검증 상태 / 참여 */}
                  <div className="hidden w-28 shrink-0 flex-col items-end gap-1.5 sm:flex">
                    {question.verified ? (
                      <span
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          backgroundColor: "rgba(231,241,168,0.5)",
                          color: PALETTE.limeInk,
                        }}
                      >
                        <ShieldCheck className="h-3 w-3" /> 검증완료
                      </span>
                    ) : question.verifiedByMe ? (
                      <span className="flex items-center gap-1 rounded-full bg-brand-soft/20 px-2 py-0.5 text-[10px] font-bold text-navy">
                        <Check className="h-3 w-3" /> 참여완료
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isVerifying || verifyingId !== null}
                        onClick={() => void handleVerify(question)}
                        className="flex items-center gap-1 rounded-full border border-navy/20 bg-bg px-2 py-1 text-[10px] font-bold text-navy transition-colors hover:bg-brand-soft/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isVerifying ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3 w-3" />
                        )}
                        검증하기
                      </button>
                    )}

                    <span className="text-[10px] font-bold text-muted">
                      {question.verifiedCount}/5
                    </span>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-chip">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${verifyPct}%`,
                          backgroundColor: question.verified
                            ? PALETTE.lime
                            : PALETTE.sky,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ───────── 우측: 담은 질문 사이드 레일 ───────── */}
      <aside className="hidden w-[260px] shrink-0 lg:block">
        <div className="sticky top-32 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-xs font-bold text-ink">담은 질문</span>
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: PALETTE.navy }}
            >
              {selectedQuestions.length}
            </span>
          </div>

          <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-3">
            {selectedQuestions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-2 py-10 text-center">
                <Building2 className="h-7 w-7 text-line" />
                <p className="text-xs font-medium leading-relaxed text-muted">
                  왼쪽에서 검증 완료된 질문을 체크하면
                  <br />
                  여기에 담겨요.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {selectedQuestions.map((text, index) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="rounded-xl border border-line bg-bg p-2.5"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white"
                          style={{ backgroundColor: PALETTE.sky }}
                        >
                          {index + 1}
                        </span>
                        <p className="line-clamp-2 text-[11px] font-medium leading-relaxed text-ink">
                          {text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="border-t border-line p-3">
            <button
              onClick={startWikiInterview}
              disabled={selectedQuestions.length === 0}
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold transition-all ${
                selectedQuestions.length > 0
                  ? "bg-navy text-white shadow-md hover:-translate-y-0.5 hover:bg-navy-dark"
                  : "cursor-not-allowed bg-chip text-muted"
              }`}
            >
              모의면접 시작 <Play className="h-3.5 w-3.5 fill-current" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
