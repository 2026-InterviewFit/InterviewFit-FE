// components/community/SectionBanner.tsx
"use client";
import { motion } from "framer-motion";

export default function SectionBanner({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className="relative w-full rounded-[32px] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 p-10 mb-8 overflow-hidden backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-navy dark:text-white"
    >
      {/* 은은한 배경 블롭 */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-10 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center gap-5">
        <div className="p-3 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <p className="text-navy/60 dark:text-gray-400 mt-1.5 font-medium">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}