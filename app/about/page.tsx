"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import { Coffee, GitBranch, Zap, Heart, ArrowRight, Code2, Brain, Layers, Server, Cpu } from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: EASE } }),
};

const TEAM = [
  { role: "Backend Lead", roleKo: "팀장 현진", name: "현진", icon: <Layers className="h-6 w-6" />, mbti: "INTP", tags: ["Spring", "AWS"], glow: "from-blue-200/50", color: "text-blue-600" },
  { role: "AI Engineer", roleKo: "AI 현진", name: "현진", icon: <Brain className="h-6 w-6" />, mbti: "ENFP", tags: ["PyTorch", "OpenCV"], glow: "from-purple-200/50", color: "text-purple-600" },
  { role: "Backend Developer", roleKo: "백엔드 보영", name: "보영", icon: <Server className="h-6 w-6" />, mbti: "INFP", tags: ["Spring", "Docker"], glow: "from-blue-200/50", color: "text-blue-600" },
  { role: "Backend / AI", roleKo: "백엔드 예은", name: "예은", icon: <Cpu className="h-6 w-6" />, mbti: "ISTJ", tags: ["Python", "FastAPI"], glow: "from-yellow-200/50", color: "text-yellow-600" },
  { role: "Frontend Developer", roleKo: "프론트엔드 은재", name: "은재", icon: <Code2 className="h-6 w-6" />, mbti: "ENFJ", tags: ["React", "TypeScript"], glow: "from-blue-200/50", color: "text-blue-600" }
];

const STATS = [
  { icon: <Coffee className="h-6 w-6" />, value: "1,247잔", label: "팀 누적 커피 소비량", color: "text-yellow-400" },
  { icon: <GitBranch className="h-6 w-6" />, value: "834회", label: "GitHub 커밋", color: "text-blue-400" },
  { icon: <Zap className="h-6 w-6" />, value: "새벽 3시", label: "평균 퇴근(?) 시간", color: "text-purple-400" },
  { icon: <Heart className="h-6 w-6" />, value: "5명", label: "함께 고군분투한 팀원", color: "text-pink-400" },
];

const STORY_ITEMS = [
  { emoji: "😰", title: "우리도 취준생이었습니다", desc: "포트폴리오는 있는데 말이 안 나오고, 말은 나오는데 논리가 없고. 면접이 끝난 뒤 '그 질문에 이렇게 말할걸' 하는 후회를 반복했습니다." },
  { emoji: "💡", title: "연습할 공간이 없다는 걸 깨달았습니다", desc: "스터디원에게 부탁하는 것도 한계가 있고, 혼자 거울 앞에서 연습하는 건 피드백이 없었습니다. 객관적인 시각이 필요했지만 어디에도 없었어요." },
  { emoji: "🛠️", title: "그래서 직접 만들기 시작했습니다", desc: "단순 과제로 만들고 싶지 않았습니다. 우리처럼 불안해하는 누군가에게 실제로 도움이 되는 서비스를 만들자고 다짐했습니다." },
  { emoji: "🚀", title: "밤새워 만들었습니다, 진짜로", desc: "새벽 2시 편의점 삼각김밥, 카페인 쩐 눈. 그래도 화면에 결과가 뜨는 순간만큼은 모두 같이 소리질렀습니다." },
];

export default function AboutPage() {
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <main className="min-h-screen w-full font-sans bg-bg dark:bg-[#0f1729] transition-colors duration-300">
      <Navbar />

      <section className="relative flex h-screen w-full items-center justify-center px-6 pt-20">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-20 -top-10 h-[500px] w-[500px] rounded-full bg-[#fef08a]/30 blur-[140px]" />
          <div className="absolute -right-20 top-10 h-[520px] w-[520px] rounded-full bg-[#bfdbfe]/30 blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}
          className="relative z-10 mx-auto max-w-[1280px] flex flex-col items-center text-center"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 dark:bg-navy/30 text-blue-600 text-xs font-bold tracking-widest mb-5 border border-white/50 backdrop-blur-md shadow-sm">
            ABOUT US
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-navy dark:text-white leading-tight tracking-tight">
            취준생의 불안을 <span className="text-blue-500">우리도 압니다</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-navy/70 dark:text-gray-400 leading-relaxed max-w-xl font-medium">
            인터뷰핏은 화려한 스타트업이 만든 서비스가 아닙니다.<br />
            취업 걱정을 안고 밤샘 코딩하는 학생 개발자들이 만든, 진짜 이야기입니다.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-[860px] px-6 pt-4 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white tracking-tight">우리가 인터뷰핏을 만든 이유</h2>
        </motion.div>

        <div className="relative flex flex-col gap-6">
          <div className="absolute left-[27px] top-4 bottom-4 w-px bg-black/10 dark:bg-white/10" />
          {STORY_ITEMS.map((item, i) => (
            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} className="relative flex items-start gap-5">
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#1e293b] border border-black/5 shadow-sm text-2xl">
                {item.emoji}
              </div>
              <div className="flex-1 rounded-[20px] bg-white dark:bg-[#1e293b] border border-black/[0.03] p-6 shadow-sm">
                <h3 className="text-base font-bold text-navy dark:text-white mb-1.5">{item.title}</h3>
                <p className="text-sm text-navy/60 dark:text-gray-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-[32px] bg-navy dark:bg-[#1e293b] p-10 md:p-12 relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 text-center mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">숫자로 보는 인터뷰핏 개발 여정</h2>
            <p className="mt-1.5 text-blue-100/60 text-sm font-medium">졸업 프로젝트지만, 진심은 졸업급입니다</p>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col items-center text-center gap-2">
                <div className={stat.color}>{stat.icon}</div>
                <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-xs text-blue-100/60 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-6 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white tracking-tight">팀원 소개</h2>
          <p className="mt-2 text-sm text-navy/60 dark:text-gray-400 font-medium">카드를 클릭하면 면접 흑역사가 공개됩니다 👀</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {TEAM.map((member, i) => (
            <div key={i} className="cursor-pointer" onClick={() => setFlipped(flipped === i ? null : i)}>
              <div className="relative w-full" style={{ perspective: "1000px" }}>
                <AnimatePresence mode="wait" initial={false}>
                  {flipped !== i ? (
                    <motion.div
                      key="front" initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.3 }}
                      className="rounded-[24px] bg-white dark:bg-[#1e293b] border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col items-center text-center gap-4 min-h-[260px] relative overflow-hidden"
                    >
                      <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${member.glow} to-transparent blur-xl pointer-events-none`} />
                      <div className={`h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center ${member.color} relative z-10`}>
                        {member.icon}
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-bold text-navy/40 mb-0.5">{member.role}</p>
                        <p className="text-lg font-bold text-navy tracking-tight">{member.roleKo}</p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-center relative z-10">
                        {member.tags.map(t => <span key={t} className="text-[9px] font-bold px-2 py-0.5 bg-gray-50 border border-black/5 rounded text-navy/60">{t}</span>)}
                      </div>
                      <div className="w-full pt-4 border-t border-black/5 mt-auto flex justify-between text-[11px] text-navy/50 font-medium">
                        <span>MBTI</span>
                        <span className="font-bold text-navy">{member.mbti}</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back" initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.3 }}
                      className="rounded-[24px] bg-navy p-6 shadow-lg flex flex-col justify-between min-h-[260px] text-white"
                    >
                      <div>
                        <p className="text-[9px] font-bold text-blue-300 tracking-wider mb-2">EPISODE</p>
                        <p className="text-sm font-semibold leading-relaxed text-white">팀원 흑역사 데이터가 곧 공개됩니다!</p>
                      </div>
                      <div className="border-t border-white/10 pt-3">
                        <p className="text-[10px] text-blue-100/60 italic leading-relaxed">"조용히 돌아가는 API가 가장 아름답습니다."</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-[32px] bg-white border border-black/[0.03] p-10 md:p-14 text-center shadow-sm"
        >
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-navy leading-snug tracking-tight">
              이 서비스를 사용해 주셔서 감사합니다
            </h2>
            <p className="mt-4 text-navy/60 text-sm md:text-base leading-relaxed max-w-xl mx-auto font-medium">
              우리도 아직 취업을 준비하고 있습니다. 인터뷰핏이 여러분의 합격에 조금이라도 도움이 된다면, 그게 저희에게는 가장 큰 보람입니다.
            </p>
            <Link
              href="/practice"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-navy text-white px-10 py-4.5 font-bold text-[15px] hover:bg-blue-600 transition-colors shadow-lg shadow-navy/20"
            >
              지금 바로 연습 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}