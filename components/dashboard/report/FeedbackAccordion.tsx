"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquareText } from "lucide-react";

interface FeedbackAccordionProps {
  feedback: string;
}

export default function FeedbackAccordion({ feedback }: FeedbackAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-4 rounded-2xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/30 p-5 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquareText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-bold text-navy dark:text-white">AI 종합 피드백</span>
      </div>
      
      <div className="relative">
        <p className={`text-sm text-muted dark:text-gray-400 leading-relaxed break-keep transition-all ${isExpanded ? "" : "line-clamp-2"}`}>
          {feedback}
        </p>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isExpanded ? (
            <><ChevronUp className="h-3.5 w-3.5" /> 닫기</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> 자세히 보기</>
          )}
        </button>
      </div>
    </div>
  );
}