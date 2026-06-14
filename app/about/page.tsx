"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import {
  Coffee, GitBranch, Zap, Heart,
  ArrowRight, Code2, Brain,
  BarChart3, Layers, Server, Cpu,
} from "lucide-react";

// ─── 타입 ────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: EASE },
  }),
};

// ─── 팀원 데이터 ──────────────────────────────────────────────────
const TEAM = [
  {
    role: "Backend Lead 👑",
    roleKo: "팀장",
    name: "현진",
    icon: <Layers className="h-8 w-8" />,
    color: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    mbti: "INTP",
    coffeeCount: "하루 3잔 (팀장이니까)",
    darkHistory: "최종 면접에서 '팀장 경험 있으세요?'에 5분째 대답 못함",
    quote: "코드는 혼자 짜는 게 아닙니다. 팀이 함께 설계하는 겁니다.",
    tags: ["Spring", "Node.js", "AWS"],
  },
  {
    role: "AI Engineer",
    roleKo: "백엔드 현진",
    name: "현진",
    icon: <Brain className="h-8 w-8" />,
    color: "from-violet-400 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    mbti: "ENFP",
    coffeeCount: "새벽 2시에도 마심",
    darkHistory: "'딥러닝이 뭔지 설명해보세요'에 오버피팅 얘기만 10분 함",
    quote: "데이터는 거짓말을 하지 않습니다. 다만 우리가 잘못 읽을 뿐이죠.",
    tags: ["PyTorch", "OpenCV", "Whisper"],
  },
  {
    role: "Backend Developer",
    roleKo: "백엔드 보영",
    name: "보영",
    icon: <Server className="h-8 w-8" />,
    color: "from-rose-400 to-pink-500",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    mbti: "INFP",
    coffeeCount: "커피대신 냉수마찰",
    darkHistory: "서버 배포하다 실수로 프로덕션 DB 날릴 뻔함 (다행히 백업 있었음)",
    quote: "조용히 돌아가는 API가 가장 아름다운 코드입니다.",
    tags: ["Spring", "MySQL", "Docker"],
  },
  {
    role: "Backend / AI",
    roleKo: "백엔드 예은",
    name: "예은",
    icon: <Cpu className="h-8 w-8" />,
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    mbti: "ISTJ",
    coffeeCount: "커피 대신 녹차",
    darkHistory: "면접 전날 밤새 준비하다가 면접 당일 지각, 그래도 합격함 (전설)",
    quote: "백엔드와 AI 사이 어딘가에서 오늘도 디버깅 중입니다.",
    tags: ["Python", "FastAPI", "SQL"],
  },
  {
    role: "Frontend Developer",
    roleKo: "프론트엔드 은재",
    name: "은재",
    icon: <Code2 className="h-8 w-8" />,
    color: "from-blue-400 to-indigo-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    mbti: "ENFJ",
    coffeeCount: "메가리카노로는 부족해",
    darkHistory: '"1분 자기소개 해보세요"라는 말에 긴장해서 자기 이름을 틀림',
    quote: "사용자가 아름답다고 느끼는 화면을 만드는 게 제 존재 이유입니다.",
    tags: ["React", "TypeScript", "Tailwind"],
  }
];

const STATS = [
  { icon: <Coffee className="h-6 w-6" />,    value: "1,247잔",  label: "팀 누적 커피 소비량",   color: "text-amber-400"  },
  { icon: <GitBranch className="h-6 w-6" />, value: "834회",    label: "GitHub 커밋",           color: "text-blue-400"   },
  { icon: <Zap className="h-6 w-6" />,       value: "새벽 3시", label: "평균 퇴근(?) 시간",     color: "text-yellow-400" },
  { icon: <Heart className="h-6 w-6" />,     value: "5명",      label: "함께 고군분투한 팀원",  color: "text-rose-400"   },
];

const STORY_ITEMS = [
  {
    emoji: "😰",
    title: "우리도 취준생이었습니다",
    desc: "포트폴리오는 있는데 말이 안 나오고, 말은 나오는데 논리가 없고. 면접이 끝난 뒤 '그 질문에 이렇게 말할걸' 하는 후회를 반복했습니다.",
  },
  {
    emoji: "💡",
    title: "연습할 공간이 없다는 걸 깨달았습니다",
    desc: "스터디원에게 부탁하는 것도 한계가 있고, 혼자 거울 앞에서 연습하는 건 피드백이 없었습니다. 객관적인 시각이 필요했지만 어디에도 없었어요.",
  },
  {
    emoji: "🛠️",
    title: "그래서 직접 만들기 시작했습니다",
    desc: "졸업 프로젝트이지만 단순 과제로 만들고 싶지 않았습니다. 우리처럼 불안해하는 누군가에게 실제로 도움이 되는 서비스를 만들자고 다짐했습니다.",
  },
  {
    emoji: "🚀",
    title: "밤새워 만들었습니다, 진짜로",
    desc: "새벽 2시 편의점 삼각김밥, 카페인 쩐 눈, 깃허브 커밋 메시지에 욕설 포함. 그래도 화면에 결과가 뜨는 순간만큼은 모두 같이 소리질렀습니다.",
  },
];

export default function AboutPage() {
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <main className="min-h-screen w-full font-sans bg-bg dark:bg-[#0f1729] transition-colors duration-300">
      <Navbar />

      {/* ── 히어로 ── pt/pb 줄여서 아래 섹션과 간격 좁힘 */}
<section className="relative flex h-screen w-full items-center justify-center overflow-hidden px-6 pt-20">

        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-20 -top-10 h-[500px] w-[500px] rounded-full bg-[#fecdd3]/35 blur-[140px]" />
          <div className="absolute -right-20 top-10 h-[520px] w-[520px] rounded-full bg-[#fde68a]/30 blur-[150px]" />
          <div className="absolute bottom-0 left-1/3 h-[380px] w-[380px] rounded-full bg-[#e9d5ff]/30 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative z-10 mx-auto max-w-[1280px] flex flex-col items-center text-center"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-bold tracking-wide mb-5 border border-rose-100 dark:border-rose-800 backdrop-blur-md">
            ABOUT US
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-navy dark:text-white leading-tight">
            취준생의 불안을{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-400">
              우리도 압니다
            </span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted dark:text-gray-400 leading-relaxed max-w-xl">
            인터뷰핏은 화려한 스타트업이 만든 서비스가 아닙니다.<br />
            취업 걱정을 안고 밤샘 코딩하는 학생 개발자들이 만든, 진짜 이야기입니다.
          </p>
        </motion.div>
      </section>

      {/* ── 스토리 타임라인 ── 세로 단일 컬럼 레이아웃으로 통일 */}
<section className="mx-auto w-full max-w-[860px] px-6 pt-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white">
            우리가 인터뷰핏을 만든 이유
          </h2>
        </motion.div>

        {/* 타임라인: 왼쪽 이모지 노드 + 오른쪽 카드 */}
        <div className="relative flex flex-col gap-6">
          {/* 세로 연결선 */}
          <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-line dark:via-white/10 to-transparent" />

          {STORY_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="relative flex items-start gap-5"
            >
              {/* 이모지 노드 */}
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#1e293b] border-2 border-line dark:border-white/10 shadow-sm text-2xl">
                {item.emoji}
              </div>

              {/* 카드 */}
              <div className="flex-1 rounded-[20px] bg-white dark:bg-[#1e293b] border border-black/[0.03] dark:border-white/[0.05] p-6 shadow-sm">
                <h3 className="text-base font-bold text-navy dark:text-white mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 수치 배너 ─────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1280px] px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[32px] bg-[#1f2937] dark:bg-[#1e293b] p-10 md:p-12 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white">숫자로 보는 인터뷰핏 개발 여정</h2>
            <p className="mt-1.5 text-white/50 text-sm">졸업 프로젝트지만, 진심은 졸업급입니다</p>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={i} custom={i} initial="hidden" whileInView="visible"
                viewport={{ once: true }} variants={fadeUp}
                className="flex flex-col items-center text-center gap-2"
              >
                <div className={stat.color}>{stat.icon}</div>
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/50 leading-relaxed">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 팀원 카드 ─────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1280px] px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="mb-8 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white">팀원 소개</h2>
          <p className="mt-2 text-sm text-muted dark:text-gray-400">
            카드를 클릭하면 면접 흑역사가 공개됩니다 👀
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {TEAM.map((member, i) => (
            <motion.div
              key={i} custom={i} initial="hidden" whileInView="visible"
              viewport={{ once: true, margin: "-40px" }} variants={fadeUp}
              className="cursor-pointer"
              onClick={() => setFlipped(flipped === i ? null : i)}
            >
              <div className="relative w-full" style={{ perspective: "1000px" }}>
                <AnimatePresence mode="wait" initial={false}>
                  {flipped !== i ? (
                    <motion.div
                      key="front"
                      initial={{ rotateY: -90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-[24px] bg-white dark:bg-[#1e293b] border border-black/[0.03] dark:border-white/[0.05] p-6 shadow-sm flex flex-col items-center text-center gap-4"
                    >
                      <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white shadow-lg`}>
                        {member.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted dark:text-gray-400 mb-0.5">{member.role}</p>
                        <p className="text-lg font-bold text-navy dark:text-white">{member.roleKo}</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {member.tags.map((tag) => (
                          <span key={tag} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${member.bg} text-navy dark:text-white`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="w-full pt-3 border-t border-line dark:border-white/10 flex justify-between text-xs text-muted dark:text-gray-400">
                        <span>MBTI</span>
                        <span className="font-bold text-navy dark:text-white">{member.mbti}</span>
                      </div>
                      <div className="w-full flex justify-between text-xs text-muted dark:text-gray-400">
                        <span>☕ 커피</span>
                        <span className="font-bold text-navy dark:text-white text-right">{member.coffeeCount}</span>
                      </div>
                      <p className="text-[11px] text-muted dark:text-gray-500">탭해서 흑역사 보기 →</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ rotateY: -90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-[24px] bg-gradient-to-br ${member.color} p-6 shadow-lg flex flex-col justify-between min-h-[280px]`}
                    >
                      <div>
                        <p className="text-[10px] font-black text-white/70 tracking-widest uppercase mb-3">
                          😱 면접 최악의 흑역사
                        </p>
                        <p className="text-sm font-bold text-white leading-relaxed">
                          &ldquo;{member.darkHistory}&rdquo;
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/20">
                        <p className="text-xs text-white/70 italic leading-relaxed">&ldquo;{member.quote}&rdquo;</p>
                        <p className="text-[10px] text-white/50 mt-2 text-right">— {member.roleKo}</p>
                      </div>
                      <p className="text-[11px] text-white/60 mt-4 text-center">탭해서 돌아가기 ↩</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 마지막 CTA ───────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1280px] px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[32px] bg-gradient-to-br from-rose-50 to-amber-50 dark:from-[#1e293b] dark:to-[#1e293b] border border-rose-100/60 dark:border-white/[0.05] p-10 md:p-14 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-rose-200/30 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-amber-200/30 blur-3xl" />
          </div>
          <div className="relative z-10">
            <p className="text-3xl mb-3">🙏</p>
            <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white leading-snug">
              이 서비스를 사용해 주셔서 감사합니다
            </h2>
            <p className="mt-4 text-muted dark:text-gray-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
              우리도 아직 취업을 준비하고 있습니다. 인터뷰핏이 여러분의 합격에 조금이라도 도움이 된다면, 그게 저희에게는 가장 큰 보람입니다.
            </p>
            <Link
              href="/practice"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-navy dark:bg-white text-white dark:text-navy px-10 py-4 font-bold text-base hover:scale-105 transition-transform shadow-lg"
            >
              지금 바로 연습 시작하기
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}