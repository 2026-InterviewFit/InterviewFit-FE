"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Play, CheckSquare } from "lucide-react";

interface WikiFloatingBarProps {
  selectedQuestions: string[];
}

export default function WikiFloatingBar({ selectedQuestions }: WikiFloatingBarProps) {
  const router = useRouter();

  const handleStartWikiInterview = () => {
    localStorage.setItem("wikiSelectedQuestions", JSON.stringify(selectedQuestions));
    router.push("/practice");
  };

  return (
    <AnimatePresence>
      {selectedQuestions.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px]"
        >
          <div className="bg-navy dark:bg-white text-white dark:text-navy rounded-full shadow-2xl p-2 pl-6 flex items-center justify-between">
            <span className="text-sm font-bold flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-400 dark:text-blue-600" />
              {selectedQuestions.length}개 질문 선택됨
            </span>
            <button 
              onClick={handleStartWikiInterview}
              className="bg-blue-600 dark:bg-blue-600 text-white rounded-full px-6 py-3 text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
            >
              모의면접 시작 <Play className="w-4 h-4 fill-white" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}