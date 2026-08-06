// app/pt-interview/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Presentation, Sparkles, ArrowRight } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import JobSelector from "@/components/pt-interview/create/JobSelector";
import PtInfoForm from "@/components/pt-interview/create/PtInfoForm";
import DocumentUploader from "@/components/pt-interview/create/DocumentUploader";
import { usePtInterviewStore } from "@/store/usePtInterviewStore";
import { createPtInterview } from "@/lib/ptInterviewApi";

export default function PtInterviewCreatePage() {
  const router = useRouter();
  const { form, setForm, createInterview } = usePtInterviewStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic.trim()) return alert("발표 주제를 입력해주세요.");
    if (!form.file) return alert("발표 자료를 업로드해주세요.");

    // 로컬 store에 우선 기록 → id 확보
    const localId = createInterview();

    try {
      // 백엔드 연동 시도 (실패해도 로컬 id로 진행)
      const { ptInterviewId } = await createPtInterview({
        job: form.job,
        topic: form.topic,
        instruction: form.instruction,
        prepSeconds: form.prepMinutes * 60,
        limitSeconds: form.limitMinutes * 60,
        fileName: form.file.name,
        fileSize: form.file.size,
        fileType: form.file.type,
      });
      router.push(`/pt-interview/${ptInterviewId}/document`);
    } catch {
      // 폴백: 백엔드 없이도 다음 화면 진입
      router.push(`/pt-interview/${localId}/document`);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-bg transition-colors duration-300 dark:bg-[#0f1729]">
      {/* 배경 블롭 */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-[#E7F1A8]/30 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-[600px] w-[600px] rounded-full bg-[#95B1EE]/40 blur-[160px]" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto w-full max-w-[720px] flex-1 px-6 pb-28 pt-32">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-navy">
            <Presentation className="h-3 w-3" /> PT Interview
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            PT 면접 시작하기
          </h1>
          <p className="mt-1.5 text-sm font-medium text-muted">
            발표 주제와 자료를 등록하면 AI가 자료를 분석해 실전 발표와 질의응답을 준비해 드려요.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[24px] border border-line bg-surface shadow-sm"
        >
          {/* 카드 헤더 */}
          <div className="flex items-center gap-3 border-b border-line px-8 py-6">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#364C84", color: "#E7F1A8" }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-ink">발표 정보 입력</h2>
              <p className="mt-0.5 text-xs font-medium text-muted">
                모든 항목을 채우면 면접을 생성할 수 있어요.
              </p>
            </div>
          </div>

          <div className="space-y-7 p-8">
            <JobSelector value={form.job} onChange={(job) => setForm({ job })} />

            <PtInfoForm
              topic={form.topic}
              instruction={form.instruction}
              prepMinutes={form.prepMinutes}
              limitMinutes={form.limitMinutes}
              onChange={setForm}
            />

            <DocumentUploader
              file={form.file}
              onSelect={(file) => setForm({ file })}
            />

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-4 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-dark"
            >
              PT 면접 시작하기 <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.form>
      </div>

      <Footer />
    </main>
  );
}