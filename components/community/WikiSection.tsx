"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Search, Building2, CheckSquare } from "lucide-react";
import { MOCK_WIKI } from "@/lib/communityData";

interface WikiSectionProps {
  selectedQuestions: string[];
  onToggleQuestion: (id: string, text: string) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } })
};

export default function WikiSection({ selectedQuestions, onToggleQuestion }: WikiSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <section id="wiki-section" className="w-full py-24 px-6 relative z-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-bold text-navy dark:text-white tracking-tight flex items-center gap-3 mb-3">
              <Target className="h-8 w-8 text-blue-600" /> 집단지성 기출문제 위키
            </h2>
            <p className="text-muted font-medium">기업별, 직무별 실제 출제된 면접 질문을 모아두었습니다. 원하는 질문을 체크하여 바로 연습해보세요.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="기업명 또는 직무 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#1e293b] border border-black/10 dark:border-white/10 rounded-full pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_WIKI.map((wiki, i) => (
            <motion.div 
              key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-white dark:bg-[#1e293b] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{wiki.company}</span>
                </div>
                <h3 className="text-xl font-bold text-navy dark:text-white">{wiki.role}</h3>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {wiki.questions.map((q) => {
                  const isChecked = selectedQuestions.includes(q.text);
                  return (
                    <label 
                      key={q.id} 
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        isChecked 
                          ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" 
                          : "bg-white border-black/5 dark:bg-[#111827] dark:border-white/5 hover:border-gray-300"
                      }`}
                    >
                      <div className="mt-0.5 relative flex items-center justify-center shrink-0">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => onToggleQuestion(q.id, q.text)}
                          className="w-5 h-5 opacity-0 absolute cursor-pointer"
                        />
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isChecked ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                        }`}>
                          {isChecked && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-navy dark:text-gray-200 leading-relaxed">{q.text}</p>
                        <p className="text-[10px] text-muted mt-2">{q.date}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}