"use client";

import { useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Target,
  Search,
  Building2,
  CheckSquare,
} from "lucide-react";

import { MOCK_WIKI } from "@/lib/communityData";

interface WikiSectionProps {
  selectedQuestions: string[];
  onToggleQuestion: (id: string, text: string) => void;
}

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: index * 0.1,
    },
  }),
};

export default function WikiSection({
  selectedQuestions,
  onToggleQuestion,
}: WikiSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWiki = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return MOCK_WIKI;
    }

    return MOCK_WIKI.filter((wiki) => {
      return (
        wiki.companyName.toLowerCase().includes(keyword) ||
        wiki.role.toLowerCase().includes(keyword) ||
        wiki.text.toLowerCase().includes(keyword)
      );
    });
  }, [searchTerm]);

  return (
    <section
      id="wiki-section"
      className="relative z-10 w-full px-6 py-24"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="mb-3 flex items-center gap-3 text-3xl font-bold tracking-tight text-navy dark:text-white">
              <Target className="h-8 w-8 text-blue-600" />
              집단지성 기출문제 위키
            </h2>

            <p className="font-medium text-muted">
              기업별, 직무별 실제 출제된 면접 질문을 모아두었습니다.
              원하는 질문을 체크하여 바로 연습해보세요.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="기업명 또는 직무 검색..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              className="w-full rounded-full border border-black/10 bg-white py-3 pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-[#1e293b]"
            />

            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {filteredWiki.length === 0 ? (
          <div className="rounded-[24px] border border-line bg-surface px-6 py-12 text-center text-sm font-medium text-muted">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredWiki.map((wiki, index) => {
              const isChecked =
                selectedQuestions.includes(wiki.text);

              return (
                <motion.div
                  key={wiki.id}
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-sm dark:border-white/5 dark:bg-[#1e293b]"
                >
                  <div className="border-b border-black/5 bg-gray-50/50 p-6 dark:border-white/5 dark:bg-white/[0.02]">
                    <div className="mb-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />

                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {wiki.companyName}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-navy dark:text-white">
                      {wiki.role}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium text-muted">
                      <span>{wiki.tier}</span>
                      <span>·</span>
                      <span>검증 {wiki.verifiedCount}회</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                        isChecked
                          ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                          : "border-black/5 bg-white hover:border-gray-300 dark:border-white/5 dark:bg-[#111827]"
                      }`}
                    >
                      <div className="relative mt-0.5 flex shrink-0 items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            onToggleQuestion(
                              wiki.id,
                              wiki.text
                            )
                          }
                          className="absolute h-5 w-5 cursor-pointer opacity-0"
                        />

                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                            isChecked
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                          }`}
                        >
                          {isChecked && (
                            <CheckSquare className="h-3.5 w-3.5 text-white" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold leading-relaxed text-navy dark:text-gray-200">
                          {wiki.text}
                        </p>

                        <p className="mt-2 text-[10px] text-muted">
                          {wiki.date}
                        </p>
                      </div>
                    </label>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}