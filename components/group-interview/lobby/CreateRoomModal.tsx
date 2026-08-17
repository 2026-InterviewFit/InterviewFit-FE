"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Briefcase, Type, CalendarClock, UserPlus } from "lucide-react";
import { getJobRoles } from "@/lib/api";
import type { JobRole } from "@/types";
import type { CreateRoomPayload } from "@/types/groupInterview";

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateRoomPayload) => Promise<void>;
}

export default function CreateRoomModal({ open, onClose, onCreate }: CreateRoomModalProps) {
  const [title, setTitle] = useState("");
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [jobRoleId, setJobRoleId] = useState(0);
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [scheduledStartTime, setScheduledStartTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 💡 선택된 대분류(category)에 따른 세부 직무 리스트 추출
  useEffect(() => {
    if (!open || jobRoles.length > 0) return;
    void getJobRoles().then((roles) => {
      setJobRoles(roles);
      setJobRoleId(roles[0]?.id ?? 0);
    }).catch(() => alert("직무 목록을 불러오지 못했습니다."));
  }, [open, jobRoles.length]);

  const reset = () => {
    setTitle("");
    setJobRoleId(jobRoles[0]?.id ?? 0);
    setMaxParticipants(4);
    setScheduledStartTime("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledStartTime || !jobRoleId) {
      alert("방 제목, 직무, 시작 시간을 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreate({ title: title.trim(), jobRoleId, maxParticipants, scheduledStartTime });
      reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b border-line px-7 py-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "#364C84", color: "#E7F1A8" }}
                >
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink">면접방 만들기</h2>
                  <p className="text-xs font-medium text-muted">함께 연습할 지원자를 모집해요</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-muted transition-colors hover:bg-chip hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-7">
              {/* 방 제목 */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
                  <Type className="h-4 w-4" style={{ color: "#364C84" }} /> 방 제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 네카라쿠배 백엔드 최종 대비방"
                  className="w-full rounded-xl border border-line bg-bg p-3.5 text-sm text-ink transition-all focus:border-navy focus:outline-none focus:ring-2 focus:ring-brand-soft/40"
                />
              </div>

              {/* 직무 */}
              <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
                    <Briefcase className="h-4 w-4" style={{ color: "#95B1EE" }} /> 직군
                  </label>
                  <select
                    value={jobRoleId}
                    onChange={(e) => setJobRoleId(Number(e.target.value))}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-line bg-bg p-3.5 text-sm text-ink transition-all focus:border-navy focus:outline-none focus:ring-2 focus:ring-brand-soft/40"
                  >
                    {jobRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.category} · {role.name}
                      </option>
                    ))}
                  </select>
              </div>

              {/* 최대 인원 */}
<div className="space-y-2">
  <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
    <Users className="h-4 w-4" style={{ color: "#364C84" }} /> 최대 인원 (2~4명)
  </label>
  <div className="flex gap-2">
    {[2, 3, 4].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => setMaxParticipants(n)}
        className={`flex-1 rounded-xl border-2 py-3 text-sm font-bold transition-all ${
          maxParticipants === n
            ? "border-navy bg-brand-soft/15 text-navy"
            : "border-line bg-bg text-muted hover:border-navy/40"
        }`}
      >
        {n}명
      </button>
    ))}
  </div>
</div>

              {/* 시작 시간 */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
                  <CalendarClock className="h-4 w-4" style={{ color: "#95B1EE" }} /> 시작 시간
                </label>
                <input
                  type="datetime-local"
                  value={scheduledStartTime}
                  onChange={(e) => setScheduledStartTime(e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg p-3.5 text-sm text-ink transition-all focus:border-navy focus:outline-none focus:ring-2 focus:ring-brand-soft/40"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || jobRoles.length === 0}
                className="w-full rounded-xl bg-navy py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-navy-dark hover:-translate-y-0.5"
              >
                {isSubmitting ? "개설 중..." : "방 개설하고 입장하기"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
