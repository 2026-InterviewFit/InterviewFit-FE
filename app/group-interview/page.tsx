// app/group-interview/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import LobbyHeader from "@/components/group-interview/lobby/LobbyHeader";
import CategoryFilter from "@/components/group-interview/lobby/CategoryFilter";
import RoomCard from "@/components/group-interview/lobby/RoomCard";
import CreateRoomModal from "@/components/group-interview/lobby/CreateRoomModal";
import { getGroupRooms, createGroupRoom } from "@/lib/groupInterviewApi";
import { initializeAuth } from "@/lib/auth";
import type { GroupRoom, CreateRoomPayload } from "@/types/groupInterview";

export default function GroupInterviewLobbyPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<GroupRoom[]>([]);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [onlyRecruiting, setOnlyRecruiting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      setRooms(await getGroupRooms());
      setError("");
    } catch (cause) {
      setRooms([]);
      setError(cause instanceof Error ? cause.message : "면접방 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // API 응답으로 초기 화면 상태를 동기화한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRooms();
  }, [loadRooms]);

  const filtered = rooms.filter((r) => {
    const catOk = activeCategory === "전체" || r.category === activeCategory;
    const recruitOk =
      !onlyRecruiting || r.status === "recruiting" || r.status === "almostFull";
    return catOk && recruitOk;
  });

  const handleCreate = async (payload: CreateRoomPayload) => {
    const user = await initializeAuth();
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const room = await createGroupRoom(payload);
      router.push(`/group-interview/room/${room.roomId}`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "면접방 개설에 실패했습니다.";
      setError(message);
      alert(message);
      throw cause;
    }
  };

  const handleJoin = (roomId: string) => {
    router.push(`/group-interview/room/${roomId}`);
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-bg transition-colors duration-300 dark:bg-[#0f1729]">
      {/* 배경 블롭 (커뮤니티와 동일 톤) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-[#E7F1A8]/30 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-[600px] w-[600px] rounded-full bg-[#95B1EE]/40 blur-[160px]" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto w-full max-w-[1100px] flex-1 px-6 pb-28 pt-32">
        <LobbyHeader roomCount={filtered.length} onCreate={() => setShowCreate(true)} />

        {error && <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
          <button
            onClick={() => setOnlyRecruiting((v) => !v)}
            className={`shrink-0 self-start rounded-full border px-4 py-2 text-xs font-bold transition-all md:self-auto ${
              onlyRecruiting
                ? "border-navy bg-navy text-white"
                : "border-line bg-surface text-muted hover:border-navy/40 hover:text-ink"
            }`}
          >
            모집중만 보기
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[196px] animate-pulse rounded-[20px] border border-line bg-surface"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface py-20 text-center shadow-sm">
            <Users className="h-8 w-8 text-line" />
            <p className="text-sm font-bold text-ink">열려 있는 면접방이 없어요</p>
            <p className="text-xs text-muted">직접 방을 만들어 다른 지원자들을 기다려보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((room, i) => (
              <RoomCard key={room.roomId} room={room} index={i} onJoin={handleJoin} />
            ))}
          </div>
        )}
      </div>

      <Footer />

      <CreateRoomModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
    </main>
  );
}
