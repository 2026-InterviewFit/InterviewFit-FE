"use client";

import { motion } from "framer-motion";
import { Zap, Trophy, Lock, MessageSquareQuote } from "lucide-react";
import { MOCK_BEST_ANSWERS } from "@/lib/communityData";

const maskText = (text: string) => {
  return text.replace(/(네이버|카카오|토스|김은재|현진|보영|예은)/g, (match) => {
    return "O".repeat(match.length);
  });
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } })
};

export default function BestAnswerFeed() {
  return (
    <section id="feed-section" className="w-full py-24 px-6 bg-white dark:bg-[#111827] border-t border-black/5 dark:border-white/5 relative z-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-navy dark:text-white tracking-tight mb-3 flex items-center justify-center gap-3">
            <Zap className="h-8 w-8 text-yellow-500 fill-yellow-500" /> 우수 답변 갤러리
          </h2>
          <p className="text-muted font-medium">종합 80점 이상의 AI 검증을 통과한 답변 스크립트입니다. (개인정보 보호 마스킹 적용)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MOCK_BEST_ANSWERS.map((ans, i) => (
            <motion.div 
              key={ans.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-gray-50 dark:bg-[#1e293b] rounded-[32px] p-8 border border-black/5 dark:border-white/5 relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-bold text-navy dark:text-white shadow-sm">
                    {ans.company}
                  </span>
                  <span className="text-xs font-bold text-muted">{ans.role}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full">
                  <Trophy className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{ans.score}점</span>
                </div>
              </div>

              <div className="relative">
                <MessageSquareQuote className="absolute -top-3 -left-3 h-10 w-10 text-black/5 dark:text-white/5" />
                <p className="relative z-10 text-base font-medium text-navy/80 dark:text-gray-300 leading-relaxed p-4 bg-white dark:bg-[#0f1729] rounded-2xl shadow-sm">
                  {maskText(ans.script)}
                </p>
              </div>
              
              <div className="mt-6 flex items-center justify-between text-xs text-muted font-medium border-t border-black/5 dark:border-white/5 pt-4">
                <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> 프라이버시 마스킹 완료</span>
                <span>AI 분석 통과 답변</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}