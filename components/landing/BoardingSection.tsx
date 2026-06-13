"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

const NOTICES = [
  { id: 1, title: "하반기 결산 안내", date: "2026.05.29" },
  { id: 2, title: "홈페이지를 오픈하였습니다.", date: "2026.05.20" },
];

const FAQS = [
  { id: 1, title: "모의면접 분석은 얼마나 걸리나요?", date: "2026.05.29" },
  { id: 2, title: "무료 이용은 어떻게 가능한가요?", date: "2026.05.20" },
];

export default function BoardSection() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-8">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        
        {/* 공지사항 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
            <h3 className="text-xl font-bold text-ink">공지사항</h3>
            <Link href="/notice" className="flex h-8 w-8 items-center justify-center rounded-md bg-chip text-muted transition-colors hover:bg-gray-200 hover:text-ink">
              <Plus className="h-5 w-5" />
            </Link>
          </div>
          <ul className="flex flex-col gap-4">
            {NOTICES.map((item) => (
              <li key={item.id} className="flex cursor-pointer items-center justify-between group">
                <span className="text-sm font-medium text-ink group-hover:underline">
                  {item.title}
                </span>
                <span className="text-xs text-muted">{item.date}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* 자주하는 질문 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
            <h3 className="text-xl font-bold text-ink">자주하는 질문</h3>
            <Link href="/faq" className="flex h-8 w-8 items-center justify-center rounded-md bg-chip text-muted transition-colors hover:bg-gray-200 hover:text-ink">
              <Plus className="h-5 w-5" />
            </Link>
          </div>
          <ul className="flex flex-col gap-4">
            {FAQS.map((item) => (
              <li key={item.id} className="flex cursor-pointer items-center justify-between group">
                <span className="text-sm font-medium text-ink group-hover:underline">
                  {item.title}
                </span>
                <span className="text-xs text-muted">{item.date}</span>
              </li>
            ))}
          </ul>
        </motion.div>

      </div>
    </section>
  );
}