// app/features/page.tsx
"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import {
  UserCheck,
  Users,
  Monitor,
  BookOpen,
  ArrowRight,
  Camera,
  Mic,
  FileText,
  ShieldCheck,
  Trophy,
  BrainCircuit,
  Network,
} from "lucide-react";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import GradientBackground from "@/components/shared/GradientBackground";
import GlassCard from "@/components/shared/GlassCard";
import { useModalStore } from "@/store/useModalStore"; // 💡 모달 스토어 추가

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: index * 0.1,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function FeaturesPage() {
  // 💡 모달 열기 함수 가져오기
  const openInterviewModal = useModalStore((state) => state.openInterviewModal);

  return (
    <main className="bg-bg font-sans transition-colors duration-300">
      <Navbar />

      <GradientBackground>
        {/* 1. 히어로 섹션 */}
        <section className="flex min-h-[70vh] w-full items-center justify-center px-6 pb-16 pt-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
            className="max-w-4xl"
          >
            <span className="mb-6 inline-block rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-bold tracking-widest text-navy shadow-sm">
              ALL-IN-ONE INTERVIEW PLATFORM
            </span>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink md:text-6xl lg:text-7xl">
              당신이 마주할 모든 면접,
              <br />
              <span className="relative inline-block text-navy">
                <span className="relative z-10">인터뷰핏 하나로 완벽하게.</span>
                <span className="absolute bottom-1 left-0 -z-10 h-4 w-full rounded-sm bg-brand-accent/50 md:bottom-2 md:h-5"></span>
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-base font-medium leading-relaxed text-muted md:text-lg">
              AI 기반 1:1 면접, 긴장감 넘치는 그룹 면접 그리고 PT 면접까지.<br />
              취업을 위한 가장 완벽한 훈련 공간을 경험하세요.
            </p>
          </motion.div>
        </section>

        {/* 2. 메인 특장점 */}
        <section className="mx-auto w-full max-w-[1280px] px-6 py-12">
          <div className="grid auto-rows-[minmax(280px,auto)] grid-cols-1 gap-6 md:grid-cols-3">
            {/* 1:1 면접 */}
            <motion.div custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="group md:col-span-2">
              <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-line bg-surface p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-navy hover:shadow-[0_12px_32px_rgba(54,76,132,0.08)] md:p-12">
                <div className="absolute -bottom-10 -right-10 h-64 w-64 opacity-40 transition-transform duration-700 group-hover:scale-110">
                  <Image src="/3d-computer.png" alt="1:1 면접" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain" />
                </div>
                <div className="relative z-10 flex h-full w-full flex-col justify-between md:w-2/3">
                  <div>
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-chip text-navy transition-colors duration-500 group-hover:bg-navy group-hover:text-brand-accent">
                      <UserCheck className="h-7 w-7 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <h3 className="mb-3 text-2xl font-bold leading-tight text-ink transition-colors duration-300 group-hover:text-navy md:text-3xl">
                      1:1 면접
                    </h3>
                    <p className="font-medium leading-relaxed text-muted">
                      나의 자소서와 희망 직무를 기반으로 생성된 기본 질문과 기본 질문을 토대로 생성되는 날카로운 꼬리 질문. 실제 면접관이 앞에 있는 것처럼, AI가 시선 처리부터 목소리의 떨림까지 정밀하게 분석합니다.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* PT 면접 */}
            <motion.div custom={1} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="group md:col-span-1">
              <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-line bg-surface p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-navy hover:shadow-[0_12px_32px_rgba(54,76,132,0.08)]">
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-chip text-navy transition-colors duration-500 group-hover:bg-navy group-hover:text-brand-accent">
                    <Monitor className="h-7 w-7 transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold leading-tight text-ink transition-colors duration-300 group-hover:text-navy">
                    PT 면접
                  </h3>
                  <p className="font-medium leading-relaxed text-muted">
                    화면 공유 기능을 통해 내 발표 자료를 띄워놓고 실전처럼 프레젠테이션을 연습하세요.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 그룹 면접 */}
            <motion.div custom={2} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="group md:col-span-1">
              <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-line bg-surface p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-navy hover:shadow-[0_12px_32px_rgba(54,76,132,0.08)]">
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-chip text-navy transition-colors duration-500 group-hover:bg-navy group-hover:text-brand-accent">
                    <Users className="h-7 w-7 transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold leading-tight text-ink transition-colors duration-300 group-hover:text-navy">
                    그룹 면접
                  </h3>
                  <p className="font-medium leading-relaxed text-muted">
                    다른 취준생들과 실시간으로 연결되는 화상 면접 대기실. 타인의 답변을 듣고 실전의 긴장감을 경험하세요.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 면접 위키 */}
            <motion.div custom={3} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="group md:col-span-2">
              <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-line bg-surface p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-navy hover:shadow-[0_12px_32px_rgba(54,76,132,0.08)] md:p-12">
                <div className="absolute bottom-0 right-0 h-56 w-56 opacity-40 transition-transform duration-700 group-hover:scale-110">
                  <Image src="/3d-tool.png" alt="면접 위키" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain" />
                </div>
                <div className="relative z-10 flex h-full w-full flex-col justify-between md:w-2/3">
                  <div>
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-chip text-navy transition-colors duration-500 group-hover:bg-navy group-hover:text-brand-accent">
                      <BookOpen className="h-7 w-7 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <h3 className="mb-3 text-2xl font-bold leading-tight text-ink transition-colors duration-300 group-hover:text-navy md:text-3xl">
                      상위 1%의 합격 비법,<br />집단지성 면접 위키
                    </h3>
                    <p className="font-medium leading-relaxed text-muted">
                      네카라쿠배부터 금융권까지, 실제 출제된 기출문제와 합격자들의 마스킹된 스크립트를 열람하고 원하는 질문을 장바구니에 담아 바로 연습해 보세요.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 3. 차별점 */}
        <section className="mx-auto w-full max-w-[1280px] px-6 py-24">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink">
              수많은 면접 서비스 중, 인터뷰핏이어야 하는 이유
            </h2>
            <p className="mt-3 font-medium text-muted">
              취준생의 입장에서 가장 완벽하게 설계된 디테일을 확인하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: "개인정보 완벽 마스킹",
                desc: "내 자소서와 스펙이 유출될 걱정은 끝. 공유 전 이름, 기업명 등 고유명사를 AI가 100% 가려줍니다.",
              },
              {
                icon: <Trophy className="h-6 w-6" />,
                title: "성장하는 명예의 전당",
                desc: "혼자 하는 지루한 연습이 아닙니다. 분야별 랭커들의 압도적인 기록을 보며 자극받고 성장하세요.",
              },
              {
                icon: <Network className="h-6 w-6" />,
                title: "AI 기반 맞춤형 면접 훈련",
                desc:"1:1 면접부터 그룹 면접, PT 면접까지 다양한 면접 유형을 AI와 결합해 경험하세요. 지원자의 답변과 상황에 맞춰 개인화된 질문을 제공합니다.",
              },
              {
                icon: <BrainCircuit className="h-6 w-6" />,
                title: "경험을 구조화하는 STAR",
                desc: "목소리의 크기만 평가하지 않습니다. 상황, 과제, 행동, 결과 논리에 맞게 대답했는지 문맥을 분석합니다.",
              },
            ].map((item, index) => (
              <motion.div key={item.title} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} className="flex flex-col">
                <div className="group h-full rounded-[28px] border border-line bg-surface p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-navy hover:shadow-md">
                  <div className="mb-5 inline-flex text-navy transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <h3 className="mb-3 text-lg font-bold tracking-tight text-ink transition-colors duration-300 group-hover:text-navy">
                    {item.title}
                  </h3>
                  <p className="break-keep text-sm font-medium leading-relaxed text-muted">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. AI 코어 기술 */}
        <section className="mx-auto w-full max-w-[1280px] px-6 py-12">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink">
              비주얼부터 논리까지, 빈틈없는 AI 엔진
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: <Camera className="h-7 w-7" />,
                title: "시선 & 자세 추적",
                desc: "Face Mesh 기술로 안구 움직임과 고개 흔들림, 표정 비대칭을 분석합니다.",
              },
              {
                icon: <Mic className="h-7 w-7" />,
                title: "오디오 파형 & 발화 분석",
                desc: "분당 발화 단어 수(WPM)와 무음 구간을 측정하여 가장 안정적인 템포를 찾습니다.",
              },
              {
                icon: <FileText className="h-7 w-7" />,
                title: "음성 인식 & 꼬리 질문",
                desc: "정밀 STT 변환 후, 답변을 분석하여 면접관처럼 압박 꼬리 질문을 던집니다.",
              },
            ].map((tech, index) => (
              <motion.div key={tech.title} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp}>
                <div className="group relative flex h-full flex-col items-center overflow-hidden rounded-[32px] border border-line bg-surface p-10 text-center transition-all duration-500 hover:-translate-y-2 hover:border-navy hover:shadow-[0_12px_32px_rgba(54,76,132,0.12)]">
                  <div className="relative z-10 flex w-full flex-col items-center">
                    <div className="mb-8 flex h-16 w-32 items-center justify-center rounded-[20px] bg-chip text-navy transition-colors duration-500 group-hover:bg-navy group-hover:text-brand-accent">
                      <div className="transition-transform duration-500 group-hover:scale-110">
                        {tech.icon}
                      </div>
                    </div>
                    <h3 className="mb-3 text-xl font-bold tracking-tight text-ink transition-colors duration-300 group-hover:text-navy">
                      {tech.title}
                    </h3>
                    <p className="break-keep text-[15px] font-medium leading-relaxed text-muted">
                      {tech.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 5. CTA */}
        <section className="mx-auto w-full max-w-[1280px] px-6 pb-32 pt-16 text-center">
          <GlassCard delay={0.4} className="relative overflow-hidden border-none bg-navy p-12 md:p-16">
            <h2 className="relative z-10 mb-8 text-3xl font-bold tracking-tight text-white">
              당신의 첫 번째 실전 모의면접, 지금 시작하세요.
            </h2>
            {/* 💡 Link 태그를 button 태그로 교체하고 모달 열기 함수 연결 */}
            <button
              onClick={openInterviewModal}
              className="relative z-10 inline-flex items-center gap-3 rounded-full bg-brand-accent px-10 py-5 text-[16px] font-bold text-navy shadow-lg transition-transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
            >
              스튜디오 입장하기
              <ArrowRight className="h-5 w-5" />
            </button>
          </GlassCard>
        </section>
      </GradientBackground>

      <Footer />
    </main>
  );
}