"use client";

import { motion } from "framer-motion";
import { MessageSquareQuote, Trophy, Library } from "lucide-react";

interface CommunitySidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = [
  { id: "feed", label: "우수 답변 피드", icon: <MessageSquareQuote className="w-4 h-4" /> },
  { id: "ranking", label: "명예의 전당", icon: <Trophy className="w-4 h-4" /> },
  { id: "wiki", label: "기출문제 위키", icon: <Library className="w-4 h-4" /> },
];

export default function CommunitySidebar({ activeTab, setActiveTab }: CommunitySidebarProps) {
  return (
    <aside className="w-full md:w-[220px] md:sticky md:top-24 bg-transparent p-0 z-20">
      <h2 className="text-[10px] font-bold text-slate-400 mb-3 tracking-widest pl-4 uppercase">Community</h2>
      <nav className="flex md:flex-col gap-1.5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive 
                  ? "bg-slate-900 text-white shadow-lg dark:bg-white dark:text-navy" 
                  : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}