// app/group-interview/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Users } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import LobbyHeader from "@/components/group-interview/lobby/LobbyHeader";
import CategoryFilter from "@/components/group-interview/lobby/CategoryFilter";
import RoomCard from "@/components/group-interview/lobby/RoomCard";
import CreateRoomModal from "@/components/group-interview/lobby/CreateRoomModal";
import { getGroupRooms, createGroupRoom } from "@/lib/groupInterviewApi";
import { initializeAuth } from "@/lib/auth";
import type { GroupRoom, CreateRoomPayload } from "@/types/groupInterview";

type RoomTab = "recruiting" | "active" | "finished";
type SortOrder = "upcoming" | "newest" | "oldest";

function parseRoomTime(value?: string) {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function getRoomSortValue(room: GroupRoom, field: "createdAt" | "startAt" | "endedAt") {
  return parseRoomTime(room[field]) ?? parseRoomTime(room.createdAt) ?? room.id;
}

export default function GroupInterviewLobbyPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<GroupRoom[]>([]);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [activeTab, setActiveTab] = useState<RoomTab>("recruiting");
  const [sortOrder, setSortOrder] = useState<SortOrder>("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  const loadRooms = useCallback(async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      setRooms(await getGroupRooms());
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "면접방 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
      if (showLoading) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // API 응답으로 초기 화면 상태를 동기화한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    const timer = window.setInterval(() => void loadRooms(), 15_000);
    return () => window.clearInterval(timer);
  }, [loadRooms]);

  const roomsInActiveTab = rooms.filter((room) => {
    if (activeTab === "finished") return room.status === "finished";
    if (activeTab === "active") return room.status === "full" || room.status === "live";
    return room.status === "recruiting" || room.status === "almostFull";
  });

  const categoryCounts = roomsInActiveTab.reduce<Record<string, number>>(
    (counts, room) => {
      counts["전체"] += 1;
      if (room.category in counts) counts[room.category] += 1;
      else if (room.role in counts) counts[room.role] += 1;
      return counts;
    },
    { "전체": 0, "IT/개발": 0, "금융권": 0, "마케팅": 0, "디자인": 0 },
  );

  const filtered = roomsInActiveTab.filter((r) => {
    const catOk = activeCategory === "전체"
      || r.category === activeCategory
      || r.role === activeCategory;
    return catOk;
  }).sort((first, second) => {
    const field = sortOrder === "upcoming"
      ? "startAt"
      : activeTab === "finished"
        ? "endedAt"
        : "createdAt";
    const comparison = getRoomSortValue(first, field) - getRoomSortValue(second, field);
    return sortOrder === "newest" ? -comparison : comparison;
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
    if (joiningRoomId) return;
    setJoiningRoomId(roomId);
    router.push(`/group-interview/room/${roomId}`);
  };

  const handleTabChange = (tab: RoomTab) => {
    setActiveTab(tab);
    setSortOrder(tab === "recruiting" ? "upcoming" : "newest");
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

        <div className="mb-5 flex flex-col gap-3 border-b border-line sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex gap-6" role="tablist" aria-label="면접방 상태">
            {([
              ["recruiting", "모집 중"],
              ["active", "진행 중"],
              ["finished", "종료"],
            ] as const).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => handleTabChange(tab)}
                className={`relative pb-3 text-sm font-bold transition-colors ${
                  activeTab === tab ? "text-navy" : "text-muted hover:text-ink"
                }`}
              >
                {label}
                {activeTab === tab && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-navy" />
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 pb-3 text-xs font-bold">
            {activeTab === "recruiting" && (
              <>
                <button
                  type="button"
                  onClick={() => setSortOrder("upcoming")}
                  aria-pressed={sortOrder === "upcoming"}
                  className={sortOrder === "upcoming" ? "text-navy" : "text-muted hover:text-ink"}
                >
                  시작 임박순
                </button>
                <span className="text-line">·</span>
              </>
            )}
            <button
              type="button"
              onClick={() => setSortOrder("newest")}
              aria-pressed={sortOrder === "newest"}
              className={sortOrder === "newest" ? "text-navy" : "text-muted hover:text-ink"}
            >
              {activeTab === "finished" ? "최근 종료순" : "최근 등록순"}
            </button>
            <span className="text-line">·</span>
            <button
              type="button"
              onClick={() => setSortOrder("oldest")}
              aria-pressed={sortOrder === "oldest"}
              className={sortOrder === "oldest" ? "text-navy" : "text-muted hover:text-ink"}
            >
              {activeTab === "finished" ? "오래된 종료순" : "오래된 등록순"}
            </button>
            <button
              type="button"
              onClick={() => void loadRooms(true)}
              disabled={isRefreshing}
              aria-label="면접방 목록 새로고침"
              className="ml-2 rounded-full border border-line bg-surface p-1.5 text-muted transition-colors hover:text-ink disabled:cursor-wait"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <CategoryFilter active={activeCategory} onChange={setActiveCategory} counts={categoryCounts} />
        </div>

        {isLoading ? (
          <div className="flex min-h-[196px] items-center justify-center rounded-2xl border border-line bg-surface">
            <p className="text-sm font-bold text-muted">면접방 목록을 불러오는 중입니다.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface py-20 text-center shadow-sm">
            <Users className="h-8 w-8 text-line" />
            <p className="text-sm font-bold text-ink">
              {activeTab === "finished"
                ? "종료된 면접방이 없어요"
                : activeTab === "active"
                  ? "진행 중인 면접방이 없어요"
                  : "모집 중인 면접방이 없어요"}
            </p>
            <p className="text-xs text-muted">
              {activeTab === "finished"
                ? "종료된 면접방은 이곳에서 확인할 수 있어요."
                : activeTab === "active"
                  ? "모집이 완료되거나 면접이 시작된 방은 이곳에 표시돼요."
                : "직접 방을 만들어 다른 지원자들을 기다려보세요."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((room, i) => (
              <RoomCard
                key={room.roomId}
                room={room}
                index={i}
                onJoin={handleJoin}
                isJoining={joiningRoomId === room.roomId}
              />
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
