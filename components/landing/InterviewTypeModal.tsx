"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, User, Users, Presentation } from "lucide-react";

interface InterviewTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InterviewTypeModal({ isOpen, onClose }: InterviewTypeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const interviewTypes = [
    {
      id: "solo",
      title: "일대일 면접",
      description: "AI 면접관과 진행하는 맞춤형 1:1 모의면접",
      icon: <User className="h-6 w-6 text-navy" />,
      href: "/interview", // 일대일 면접 진입점
    },
    {
      id: "group",
      title: "다대일 면접",
      description: "여러 참여자와 함께 실전처럼 진행하는 그룹 면접",
      icon: <Users className="h-6 w-6 text-navy" />,
      href: "/group-interview", // 그룹 면접(로비) 진입점
    },
    {
      id: "pt",
      title: "PT 면접",
      description: "자료를 띄워놓고 발표 역량을 평가받는 면접",
      icon: <Presentation className="h-6 w-6 text-navy" />,
      href: "/pt-interview", // PT 면접 진입점
    },
  ];

  const handleSelect = (href: string) => {
    onClose(); // 모달 닫기
    router.push(href); // 선택한 면접 페이지로 이동
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        {/* 배경 오버레이 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* 모달 콘텐츠 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-surface"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink">어떤 면접을 연습할까요?</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted transition-colors hover:bg-chip hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {interviewTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelect(type.href)}
                className="group flex w-full items-center gap-4 rounded-xl border border-line bg-surface p-4 text-left transition-all hover:border-navy hover:bg-navy/5 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chip transition-colors group-hover:bg-white group-hover:shadow-sm">
                  {type.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">{type.title}</h3>
                  <p className="mt-1 text-sm text-muted">{type.description}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}