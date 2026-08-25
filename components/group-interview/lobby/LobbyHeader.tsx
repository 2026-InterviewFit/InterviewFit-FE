// components/group-interview/lobby/LobbyHeader.tsx
"use client";

import { motion } from "framer-motion";
import { Users, Plus } from "lucide-react";

interface LobbyHeaderProps {
  roomCount: number;
  onCreate: () => void;
}

export default function LobbyHeader({ roomCount, onCreate }: LobbyHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
    >
      <div>
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-navy">
          <Users className="h-3 w-3" /> Group Interview
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
          다대일 모의면접 로비
        </h1>
        <p className="mt-1.5 text-sm font-medium text-muted">
          실제 그룹 면접처럼 여러 지원자와 함께 연습하세요 · 현재{" "}
          <span className="font-bold text-navy">{roomCount}</span>개의 방
        </p>
      </div>

      <button
        onClick={onCreate}
        className="flex shrink-0 items-center gap-1.5 self-start rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-navy-dark hover:-translate-y-0.5 md:self-auto"
      >
        <Plus className="h-4 w-4" /> 방 만들기
      </button>
    </motion.div>
  );
}