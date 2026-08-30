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
    // 기존 로직 유지
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
    // 기존 로직 유지
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
      alert("선택한 직무를 백엔드 직무 목록에서 찾을 수 없습니다.");
      return;
    }

    try {
      const interviewResponse = (await startInterview({
        jobRoleId: selectedJobRole.id,
      })) as InterviewStartResponse;

      const ptInterviewId = await createInterview(
        interviewResponse.interviewId
      );

      await uploadDocument(ptInterviewId);
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

      {/* 변경점 1: max-w를 720px에서 6xl(1152px)로 넓혀서 웹페이지다운 캔버스 확보 */}
      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 pb-28 pt-32">
        
        {/* 변경점 2: CSS Grid를 사용하여 데스크탑에서 12칸(5칸/7칸) 비율로 좌우 분할 */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
          
          {/* 좌측 영역: 타이틀 및 설명 (스크롤 시 고정되도록 sticky 적용) */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-soft/20 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-navy">
                <Presentation className="h-3.5 w-3.5" />
                PT Interview
              </span>

              <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl lg:text-5xl lg:leading-tight">
                실전처럼 준비하는<br />
                <span className="text-navy">PT 면접</span>
              </h1>

              <p className="mt-4 text-base font-medium leading-relaxed text-muted">
                발표 주제와 자료를 등록해 주세요.<br />
                AI가 자료를 꼼꼼히 분석하여 실제 면접관처럼 날카로운 질의응답을 준비해 드립니다.
              </p>
            </motion.div>
          </div>

          {/* 우측 영역: 입력 폼 */}
          <div className="lg:col-span-7">
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-[24px] border border-line bg-surface shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-line px-8 py-6 bg-slate-50/50 dark:bg-slate-800/20">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
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
                    정확한 분석을 위해 모든 항목을 채워주세요.
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

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoadingJobs || Boolean(jobError)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-4 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {isCreating
                          ? "PT 면접 생성 중..."
                          : "발표 자료 분석 및 업로드 중..."}
                      </>
                    ) : (
                      <>
                        PT 면접 시작하기
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.form>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}