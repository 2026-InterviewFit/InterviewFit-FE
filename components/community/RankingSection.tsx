"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Eye, User, Crown } from "lucide-react";
import { MOCK_RANKINGS } from "@/lib/communityData";

const RANKING_CATEGORIES = [
  { id: "score", title: "종합 점수 랭킹", icon: <Trophy className="h-5 w-5 text-yellow-400" /> },
  { id: "count", title: "최다 연습 랭킹", icon: <Flame className="h-5 w-5 text-red-400" /> },
  { id: "gaze", title: "시선 안정성 랭킹", icon: <Eye className="h-5 w-5 text-blue-400" /> },
  { id: "posture", title: "자세 마스터 랭킹", icon: <User className="h-5 w-5 text-emerald-400" /> },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } })
};

export default function RankingSection() {
  return (
    <section className="w-full bg-[#111827] pt-12 pb-24 px-6 relative">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-3">명예의 전당 (Top 1%)</h2>
          <p className="text-gray-400 font-medium">분야별 상위 랭커들의 압도적인 기록을 확인하세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {RANKING_CATEGORIES.map((cat, i) => (
            <motion.div 
              key={cat.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-[#1e293b] rounded-[24px] p-6 border border-white/5 shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2.5 bg-gray-800 rounded-xl">{cat.icon}</div>
                <h3 className="font-bold text-white text-lg">{cat.title}</h3>
              </div>
              <div className="flex flex-col gap-4 relative z-10">
                {MOCK_RANKINGS[cat.id as keyof typeof MOCK_RANKINGS].map((user) => (
                  <div key={user.rank} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <span className={`font-black text-lg ${user.rank === 1 ? "text-yellow-400" : user.rank === 2 ? "text-gray-300" : "text-amber-600"}`}>
                        {user.rank}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white truncate max-w-[90px]">{user.name}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Crown className="h-3 w-3" /> {user.tier}
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-bold text-blue-400">{user.score}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}