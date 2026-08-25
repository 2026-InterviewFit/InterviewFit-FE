// app/community/add-wiki/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Building2, Briefcase, FileQuestion, Sparkles, ShieldCheck } from "lucide-react";
import Navbar from "@/components/shared/Navbar";

// 자동완성용 추천 기업 리스트
const MOCK_COMPANIES = ["네이버", "카카오", "라인", "쿠팡", "배달의민족", "토스", "당근", "우아한형제들", "삼성전자", "현대자동차", "SK텔레콤"];

const JOB_ROLES = [
  { category: "IT/개발", roles: ["프론트엔드", "백엔드", "AI", "데이터분석"] },
  { category: "비즈니스", roles: ["마케팅", "인사", "재무·회계"] },
  { category: "디자인", roles: ["UX/UI 디자이너", "영상 제작", "그래픽 디자이너"] },
];

export default function AddWikiPage() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [questionText, setQuestionText] = useState("");

  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredCompanies = MOCK_COMPANIES.filter((c) =>
    c.toLowerCase().includes(company.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowCompanySuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role || !questionText) return alert("모든 항목을 입력해주세요.");
    alert("기출문제가 성공적으로 등록 요청되었습니다. (5인 이상 검증 후 등재됩니다.)");
    router.push("/community?tab=wiki");
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-bg transition-colors duration-300 dark:bg-[#0f1729]">
      {/* 배경 블롭 (팔레트 톤) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute right-10 top-0 h-[500px] w-[500px] rounded-full bg-[#95B1EE]/40 blur-[150px]" />
        <div className="absolute bottom-[-100px] left-[-50px] h-[400px] w-[400px] rounded-full bg-[#E7F1A8]/25 blur-[120px]" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto w-full max-w-[640px] flex-1 px-6 pb-20 pt-32">
        <button
          onClick={() => router.push("/community?tab=wiki")}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" /> 위키로 돌아가기
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[24px] border border-line bg-surface shadow-sm"
        >
          {/* 헤더 */}
          <div className="flex items-center gap-3 border-b border-line px-8 py-6">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#364C84", color: "#E7F1A8" }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ink">면접 기출문제 기여하기</h1>
              <p className="mt-0.5 text-xs font-medium text-muted">
                실제 면접에서 받은 소중한 질문을 공유해주세요.
              </p>
            </div>
          </div>

          {/* 검증 안내 배너 */}
          <div
            className="mx-8 mt-6 flex items-center gap-2.5 rounded-xl px-4 py-3"
            style={{ backgroundColor: "rgba(231,241,168,0.35)" }}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: "#3F4A1B" }} />
            <p className="text-xs font-semibold" style={{ color: "#3F4A1B" }}>
              5명의 동의를 얻으면 정식으로 위키에 등재됩니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-8">
            {/* 기업명 자동완성 */}
            <div ref={wrapperRef} className="relative space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
                <Building2 className="h-4 w-4" style={{ color: "#364C84" }} /> 기업명
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  setShowCompanySuggestions(true);
                }}
                onFocus={() => setShowCompanySuggestions(true)}
                className="w-full rounded-xl border border-line bg-bg p-3.5 text-sm text-ink transition-all focus:border-navy focus:outline-none focus:ring-2 focus:ring-brand-soft/40"
                placeholder="기업명을 입력하세요 (예: 네이버)"
              />
              <AnimatePresence>
                {showCompanySuggestions && company.length > 0 && filteredCompanies.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-xl border border-line bg-surface p-2 shadow-xl"
                  >
                    {filteredCompanies.map((c) => (
                      <li
                        key={c}
                        onClick={() => {
                          setCompany(c);
                          setShowCompanySuggestions(false);
                        }}
                        className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-chip"
                      >
                        {c}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* 직무 선택 */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
                <Briefcase className="h-4 w-4" style={{ color: "#95B1EE" }} /> 지원 직무
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-line bg-bg p-3.5 text-sm text-ink transition-all focus:border-navy focus:outline-none focus:ring-2 focus:ring-brand-soft/40"
              >
                <option value="" disabled>
                  지원하신 직무를 선택해주세요
                </option>
                {JOB_ROLES.map((group) => (
                  <optgroup key={group.category} label={group.category}>
                    {group.roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* 질문 내용 */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
                <FileQuestion className="h-4 w-4" style={{ color: "#364C84" }} /> 기출 질문 내용
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="h-40 w-full resize-none rounded-xl border border-line bg-bg p-3.5 text-sm text-ink transition-all focus:border-navy focus:outline-none focus:ring-2 focus:ring-brand-soft/40"
                placeholder="실제 면접에서 받았던 질문을 최대한 구체적으로 작성해주세요."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-navy py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-navy-dark hover:-translate-y-0.5"
            >
              검증 요청 및 기여하기
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}