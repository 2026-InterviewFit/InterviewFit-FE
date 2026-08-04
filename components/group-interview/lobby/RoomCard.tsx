// components/group-interview/lobby/RoomCard.tsx
"use client";

import { motion } from "framer-motion";
import { Users, Clock, Crown, ChevronRight } from "lucide-react";
import type { GroupRoom } from "@/types/groupInterview";
import { statusMeta, formatStartTime } from "@/lib/groupInterviewData";
import { PALETTE } from "@/lib/communityData";

interface RoomCardProps {
  room: GroupRoom;
  index: number;
  onJoin: (roomId: string) => void;
}

export default function RoomCard({ room, index, onJoin }: RoomCardProps) {
  const meta = statusMeta(room.status);
  const isFull = room.currentParticipants >= room.maxParticipants;
  const joinable = room.status === "recruiting" || room.status === "almostFull";
  const fillPct = Math.min((room.currentParticipants / room.maxParticipants) * 100, 100);

  const buttonLabel =
    room.status === "full"
      ? "모집 완료됨"
      : room.status === "live"
      ? "면접 진행중"
      : room.status === "finished"
      ? "종료된 방"
      : "입장하기";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 8) * 0.04 }}
      className="flex flex-col rounded-[20px] border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-chip px-2 py-0.5 text-[11px] font-bold text-ink">
              {room.category === "IT/개발" ? "IT · 개발" : room.category}
            </span>
            {room.role && (
              <span
                className="rounded-md px-2 py-0.5 text-[11px] font-bold"
                style={{ backgroundColor: "rgba(149,177,238,0.18)", color: PALETTE.navy }}
              >
                {room.role}
              </span>
            )}
          </div>
          <h3 className="truncate text-base font-bold text-ink">{room.title}</h3>
        </div>

        <span
          className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{ backgroundColor: meta.bg, color: meta.fg }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
          {meta.label}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
        <Crown className="h-3 w-3" style={{ color: PALETTE.lime }} /> {room.hostName}
        <span className="text-line">·</span>
        <Clock className="h-3 w-3" /> {formatStartTime(room.startAt)}
      </div>

      {/* 인원 게이지 */}
      <div className="mb-4 mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
          <span className="flex items-center gap-1 text-muted">
            <Users className="h-3.5 w-3.5" /> 참여 인원
          </span>
          <span className="text-navy">
            {room.currentParticipants}/{room.maxParticipants}명
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-chip">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${fillPct}%`, backgroundColor: isFull ? PALETTE.navy : PALETTE.sky }}
          />
        </div>
      </div>

      <button
        onClick={() => onJoin(room.roomId)}
        disabled={!joinable}
        className={`mt-auto flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold transition-all ${
          joinable
            ? "bg-navy text-white shadow-sm hover:bg-navy-dark hover:-translate-y-0.5"
            : "cursor-not-allowed bg-chip text-muted"
        }`}
      >
        {buttonLabel}
        {joinable && <ChevronRight className="h-4 w-4" />}
      </button>
    </motion.article>
  );
}