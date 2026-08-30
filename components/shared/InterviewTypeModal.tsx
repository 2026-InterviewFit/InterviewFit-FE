"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, User, Users, Presentation } from "lucide-react";
import { useModalStore } from "@/store/useModalStore";

export default function InterviewTypeModal() {
  const router = useRouter();
  
  // 💡 Zustand 전역 상태 가져오기 (반드시 함수 안쪽에 있어야 합니다!)
  const { isInterviewModalOpen, closeInterviewModal } = useModalStore();

  const interviewTypes = [
    {
      id: "solo",
      title: "1:1 면접",
      description: "개인 맞춤형 1:1 심층 면접",
      icon: <User className="h-6 w-6 text-navy dark:text-brand-soft" />,
      href: "/interview", 
    },
    {
      id: "group",
      title: "그룹 면접",
      description: "여러 참여자와 함께 실전처럼 진행하는 그룹 면접",
      icon: <Users className="h-6 w-6 text-navy dark:text-brand-soft" />,
      href: "/group-interview",
    },
    {
      id: "pt",
      title: "PT 면접",
      description: "자료를 띄우고 프레젠테이션 역량을 평가받는 면접",
      icon: <Presentation className="h-6 w-6 text-navy dark:text-brand-soft" />,
      href: "/pt-interview",
    },
  ];

  const handleSelect = (href: string) => {
    closeInterviewModal();
    setTimeout(() => {
      router.push(href);
    }, 200); 
  };

  return (
    <AnimatePresence>
      {isInterviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeInterviewModal}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* 모달 콘텐츠: 패딩 증가 및 라디우스(32px) 확대 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-[32px] bg-surface p-8 shadow-2xl ring-1 ring-border-glass"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-ink">어떤 면접을 연습할까요?</h2>
              <button
                onClick={closeInterviewModal}
                className="rounded-full p-2.5 text-muted transition-colors hover:bg-bg hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {interviewTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSelect(type.href)}
                  /* 카드: 둥근 모서리(24px) 적용, 호버 시 brand-soft 배경색과 그림자로 떠오르는 효과 */
                  className="group flex w-full items-center gap-5 rounded-[24px] border border-line bg-surface p-5 text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-navy hover:bg-brand-soft/10 hover:shadow-[0_8px_20px_rgba(54,76,132,0.08)] dark:hover:border-brand-soft"
                >
                  {/* 아이콘: 부드러운 스퀘어(18px) 적용, 호버 시 강조색(brand-accent)으로 반전 */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-bg transition-colors duration-300 group-hover:bg-brand-accent dark:group-hover:text-ink">
                    <div className="transition-transform duration-300 group-hover:scale-110">
                      {type.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-ink transition-colors group-hover:text-navy dark:group-hover:text-brand-soft">
                      {type.title}
                    </h3>
                    <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-muted">
                      {type.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}