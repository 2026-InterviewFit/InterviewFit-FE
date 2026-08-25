// app/pt-interview/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Presentation,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import JobSelector from "@/components/pt-interview/create/JobSelector";
import PtInfoForm from "@/components/pt-interview/create/PtInfoForm";
import DocumentUploader from "@/components/pt-interview/create/DocumentUploader";

import { usePtInterviewStore } from "@/store/usePtInterviewStore";
import { getJobRoles, startInterview } from "@/lib/api";

import type { JobRole, InterviewStartResponse } from "@/types";

export default function PtInterviewCreatePage() {
  const router = useRouter();

  const {
    form,
    setForm,
    createInterview,
    uploadDocument,
    isCreating,
    isUploading,
    error,
    clearError,
  } = usePtInterviewStore();

  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobError, setJobError] = useState<string | null>(null);

  const isSubmitting = isCreating || isUploading;

  useEffect(() => {
    const fetchJobRoles = async () => {
      setIsLoadingJobs(true);
      setJobError(null);

      try {
        const response = await getJobRoles();
        setJobRoles(response);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "직무 목록을 불러오지 못했습니다.";

        setJobError(message);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    void fetchJobRoles();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    if (!form.job.trim()) {
      alert("직무를 선택해 주세요.");
      return;
    }

    if (!form.topic.trim()) {
      alert("발표 주제를 입력해 주세요.");
      return;
    }

    if (!form.file) {
      alert("발표 자료를 업로드해 주세요.");
      return;
    }

    const selectedJobRole = jobRoles.find(
      (jobRole) => jobRole.name === form.job
    );

    if (!selectedJobRole) {
      alert(
        "선택한 직무를 백엔드 직무 목록에서 찾을 수 없습니다. 직무 데이터를 확인해 주세요."
      );
      return;
    }

    try {
      // 1. 일반 Interview 생성
      const interviewResponse =
      (await startInterview({
        jobRoleId: selectedJobRole.id,
      })) as InterviewStartResponse;

      // 2. 일반 interviewId로 PT Interview 생성
      const ptInterviewId = await createInterview(
        interviewResponse.interviewId
      );

      // 3. PT 발표 자료 업로드 및 분석 요청
      await uploadDocument(ptInterviewId);

      // 4. 문서 분석 화면 이동
      router.push(`/pt-interview/${ptInterviewId}/document`);
    } catch (submitError) {
      console.error("PT 면접 생성 실패:", submitError);

      const message =
        submitError instanceof Error
          ? submitError.message
          : "PT 면접 생성 중 오류가 발생했습니다.";

      alert(message);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-bg transition-colors duration-300 dark:bg-[#0f1729]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-[#E7F1A8]/30 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-[600px] w-[600px] rounded-full bg-[#95B1EE]/40 blur-[160px]" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto w-full max-w-[720px] flex-1 px-6 pb-28 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-navy">
            <Presentation className="h-3 w-3" />
            PT Interview
          </span>

          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            PT 면접 시작하기
          </h1>

          <p className="mt-1.5 text-sm font-medium text-muted">
            발표 주제와 자료를 등록하면 AI가 자료를 분석해 실전 발표와
            질의응답을 준비해 드려요.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[24px] border border-line bg-surface shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-line px-8 py-6">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "#364C84",
                color: "#E7F1A8",
              }}
            >
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight text-ink">
                발표 정보 입력
              </h2>

              <p className="mt-0.5 text-xs font-medium text-muted">
                모든 항목을 채우면 면접을 생성할 수 있어요.
              </p>
            </div>
          </div>

          <div className="space-y-7 p-8">
            {isLoadingJobs ? (
              <div className="flex items-center gap-2 rounded-xl border border-line bg-bg px-4 py-3 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                직무 목록을 불러오는 중입니다.
              </div>
            ) : (
              <JobSelector
                value={form.job}
                onChange={(job) => setForm({ job })}
              />
            )}

            {jobError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {jobError}
              </p>
            )}

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

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isLoadingJobs || Boolean(jobError)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-4 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isCreating
                    ? "PT 면접 생성 중..."
                    : "발표 자료 업로드 중..."}
                </>
              ) : (
                <>
                  PT 면접 시작하기
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>

      <Footer />
    </main>
  );
}