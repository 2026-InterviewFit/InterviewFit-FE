"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MessageSquareQuote,
  RefreshCw,
  Trophy,
} from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import {
  CommunityRankerProfile,
  getCommunityRankerProfile,
} from "@/lib/communityApi";

export default function RankerProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<CommunityRankerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = useMemo(() => {
    const parsed = Number(params.id);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [params.id]);

  useEffect(() => {
    if (userId === null) {
      setError("잘못된 랭커 주소입니다.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCommunityRankerProfile(userId);

        if (!cancelled) {
          setProfile(data);
        }
      } catch (err) {
        console.error("랭커 상세 조회 실패:", err);
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "랭커 정보를 불러오지 못했어요.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-bg dark:bg-[#0f1729]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute -top-40 right-20 h-[600px] w-[600px] rounded-full bg-[#e9d5ff]/30 blur-[150px]" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto w-full max-w-[800px] flex-1 px-6 pb-20 pt-32">
        <button
          onClick={() => router.push("/community?tab=ranking")}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-navy dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> 커뮤니티로 돌아가기
        </button>

        {loading && (
          <div className="flex min-h-[360px] items-center justify-center rounded-[32px] border border-white/50 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3 text-sm font-bold text-muted">
              <RefreshCw className="h-4 w-4 animate-spin" />
              랭커 정보를 불러오는 중이에요
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[32px] border border-white/50 bg-white/60 p-10 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <p className="font-bold text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && profile && (
          <div className="rounded-[32px] border border-white/50 bg-white/60 p-7 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:p-10">
            <div className="mb-8 flex items-center gap-6 border-b border-black/5 pb-8 dark:border-white/5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-bold text-white shadow-lg">
                {profile.name[0] ?? "*"}
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-sm font-bold text-blue-600">
                  #{profile.rank} · {profile.tier} · 평균 {profile.score}점
                </p>
                <h1 className="truncate text-3xl font-bold text-navy dark:text-white">
                  {profile.name}
                </h1>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-muted">
                  <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/10">
                    공개 답변 {profile.publishedAnswerCount}개
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-black/5 px-3 py-1 dark:bg-white/10">
                    <Heart className="h-3.5 w-3.5" /> 받은 좋아요 {profile.totalLikeCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="flex items-center gap-2 font-bold text-navy dark:text-white">
                <MessageSquareQuote className="h-5 w-5 text-blue-500" />
                공개 우수 답변 모아보기
              </h3>

              {profile.answers.length === 0 ? (
                <div className="rounded-2xl border border-black/5 bg-gray-50 p-6 text-center dark:bg-[#0f1729]">
                  <p className="text-sm font-medium text-muted">
                    공개된 답변이 없습니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.answers.map((answer) => (
                    <article
                      key={answer.id}
                      className="rounded-2xl border border-black/5 bg-gray-50 p-6 dark:border-white/5 dark:bg-[#0f1729]"
                    >
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                          {answer.role}
                        </span>
                        <span className="rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-bold text-muted dark:bg-white/10">
                          {answer.company}
                        </span>
                        <span className="ml-auto flex items-center gap-1 text-xs font-bold text-muted">
                          <Heart className="h-3.5 w-3.5" /> {answer.likeCount}
                        </span>
                      </div>

                      <div className="mb-4 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-bold text-navy dark:text-white">
                          종합 {answer.score}점
                        </span>
                      </div>

                      <p className="whitespace-pre-wrap text-sm font-medium leading-7 text-navy/80 dark:text-gray-300">
                        “{answer.script}”
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
