"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Crown, Medal, ChevronRight, RefreshCw } from "lucide-react";
import { PALETTE } from "@/lib/communityData";
import {
  CommunityRanker,
  getCommunityRankings,
} from "@/lib/communityApi";

const NAVY = PALETTE.navy;
const CREAM = PALETTE.cream;
const LIME = PALETTE.lime;
const SKY = PALETTE.sky;

export default function RankingView() {
  const router = useRouter();
  const [rankers, setRankers] = useState<CommunityRanker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRankings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCommunityRankings();
      setRankers(data);
    } catch (err) {
      console.error("커뮤니티 랭킹 조회 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "랭킹을 불러오지 못했어요.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRankings();
  }, [loadRankings]);

  const top3 = useMemo(() => rankers.slice(0, 3), [rankers]);
  const others = useMemo(() => rankers.slice(3, 10), [rankers]);

  const podium = useMemo(
    () => [2, 1, 3].map((rank) => top3.find((r) => r.rank === rank)),
    [top3],
  );

  const go = (userId: number) =>
    router.push(`/community/ranker/${userId}`);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[420px] w-full max-w-3xl items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-muted">
          <RefreshCw className="h-4 w-4 animate-spin" />
          랭킹을 불러오는 중이에요
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[420px] w-full max-w-3xl items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-sm font-bold text-red-500">{error}</p>
          <button
            type="button"
            onClick={() => void loadRankings()}
            className="rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white"
          >
            다시 불러오기
          </button>
        </div>
      </div>
    );
  }

  if (rankers.length === 0) {
    return (
      <div className="mx-auto flex min-h-[420px] w-full max-w-3xl items-center justify-center">
        <div className="text-center">
          <Crown className="mx-auto mb-4 h-8 w-8 text-muted" />
          <p className="font-bold text-navy dark:text-white">
            아직 랭킹에 등록된 사용자가 없어요
          </p>
          <p className="mt-2 text-sm text-muted">
            우수 답변이 공개되면 실제 점수를 기준으로 랭킹이 만들어집니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl animate-in fade-in duration-500">
      <div
        className="relative overflow-hidden rounded-[28px] px-5 py-10 md:px-10 md:py-14"
        style={{
          backgroundColor: NAVY,
          boxShadow: "0 24px 60px -18px rgba(54,76,132,0.55)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#95B1EE]/25 blur-[110px]" />
          <div className="absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-[#E7F1A8]/12 blur-[100px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#95B1EE]/40 to-transparent" />
        </div>

        <div className="relative z-10 mb-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: LIME }}
            />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: SKY }}
            >
              공개 우수답변 평균 점수
            </span>
          </div>
          <span
            className="text-[11px] font-bold"
            style={{ color: `${CREAM}66` }}
          >
            TOP 10
          </span>
        </div>

        <div className="relative z-10 flex items-end justify-center gap-3 pt-6 md:gap-6">
          {podium.map((user, i) => {
            if (!user) return null;

            const isFirst = user.rank === 1;
            const accent = isFirst ? LIME : SKY;
            const pillarH = isFirst
              ? "h-44 md:h-52"
              : user.rank === 2
                ? "h-32 md:h-40"
                : "h-24 md:h-32";
            const avatarSize = isFirst
              ? "h-16 w-16 text-2xl md:h-20 md:w-20 md:text-3xl"
              : "h-12 w-12 text-lg md:h-14 md:w-14 md:text-xl";

            return (
              <motion.button
                key={user.userId}
                onClick={() => go(user.userId)}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-1 flex-col items-center"
                style={{ maxWidth: 150 }}
              >
                <div className="relative mb-3 transition-transform duration-300 group-hover:-translate-y-1.5">
                  {isFirst ? (
                    <Crown
                      className="absolute -top-8 left-1/2 h-7 w-7 -translate-x-1/2 drop-shadow-md"
                      style={{ color: LIME, fill: LIME }}
                    />
                  ) : (
                    <Medal
                      className="absolute -top-6 left-1/2 h-5 w-5 -translate-x-1/2"
                      style={{ color: SKY }}
                    />
                  )}
                  <div
                    className={`flex items-center justify-center rounded-2xl font-bold ${avatarSize}`}
                    style={{
                      backgroundColor: accent,
                      color: NAVY,
                      boxShadow: isFirst ? `0 0 34px ${accent}80` : "none",
                      border: "3px solid rgba(255,255,255,0.14)",
                    }}
                  >
                    {user.name[0] ?? "*"}
                  </div>
                </div>

                <p
                  className="mb-1.5 max-w-[110px] truncate text-xs font-bold md:text-sm"
                  style={{ color: CREAM }}
                >
                  {user.name}
                </p>

                <span
                  className="mb-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: `${accent}26`, color: accent }}
                >
                  {user.tier}
                </span>

                <div
                  className={`relative flex w-full items-center justify-center overflow-hidden rounded-t-[20px] ${pillarH}`}
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.02) 100%)",
                    borderTop: `2px solid ${accent}`,
                  }}
                >
                  <span
                    className="absolute -bottom-4 select-none font-serif text-[72px] font-bold leading-none md:text-[96px]"
                    style={{ color: accent, opacity: 0.13 }}
                  >
                    {user.rank}
                  </span>
                  <div className="relative z-10 flex flex-col items-center">
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.15em]"
                      style={{ color: SKY }}
                    >
                      Average
                    </span>
                    <span
                      className="text-2xl font-bold md:text-3xl"
                      style={{ color: CREAM }}
                    >
                      {user.score}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="relative z-10 my-8 h-px bg-gradient-to-r from-transparent via-[#95B1EE]/25 to-transparent" />

        <div className="relative z-10 flex flex-col gap-1">
          {others.map((user, i) => (
            <motion.button
              key={user.userId}
              onClick={() => go(user.userId)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/[0.06] md:gap-4 md:px-4"
            >
              <span
                className="absolute left-0 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-full transition-all duration-300 group-hover:h-7"
                style={{ backgroundColor: LIME }}
              />
              <span className="w-7 shrink-0 text-center font-serif text-xl font-bold text-[#95B1EE]/45 transition-colors group-hover:text-[#E7F1A8]">
                {user.rank}
              </span>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-[#FFFDF5]">
                {user.name[0] ?? "*"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#FFFDF5]">
                  {user.name}
                </p>
                <p className="truncate text-[11px] font-medium text-[#95B1EE]/70">
                  {user.script}
                </p>
              </div>
              <span className="hidden shrink-0 rounded-md border border-white/10 px-2 py-0.5 text-[10px] font-bold text-[#95B1EE] sm:block">
                {user.tier}
              </span>
              <span className="w-10 shrink-0 text-right text-sm font-bold text-[#FFFDF5]">
                {user.score}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#95B1EE]/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#E7F1A8]" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
