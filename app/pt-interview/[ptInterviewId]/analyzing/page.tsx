// app/pt-interview/[ptInterviewId]/analyzing/page.tsx
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

import {
  authFetch,
  generatePtReport,
  getPtQuestions,
  readErrorMessage,
} from "@/lib/api";

function Spinner({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`inline-block animate-[spin_1s_linear_infinite] rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

const ANALYZE_STEPS = [
  "답변 영상 확인",
  "음성 분석 결과 수집",
  "발표 내용 분석",
  "시선 및 자세 분석",
  "질의응답 분석",
  "종합 리포트 생성",
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

const POLLING_INTERVAL_MS = 1500;
const MAX_WAIT_MS = 5 * 60 * 1000;

type PtAnswerStatusResponse = {
  answerId: number;
  ptQuestionId: number;
  questionNumber: number;
  question: string;
  answerText: string | null;
  analysisStatus:
    | "UPLOADED"
    | "PENDING"
    | "RUNNING"
    | "DONE"
    | "FAILED"
    | string;
  createdAt?: string;
};

async function getPtAnswers(
  ptInterviewId: number
): Promise<PtAnswerStatusResponse[]> {
  const response = await authFetch(
    `${API_BASE_URL}/api/pt-interviews/${ptInterviewId}/answers`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorMessage =
      await readErrorMessage(response);

    throw new Error(
      `PT 답변 분석 상태 조회 실패 (${response.status}): ${errorMessage}`
    );
  }

  return response.json();
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default function PtAnalyzingPage() {
  const router = useRouter();
  const params = useParams();

  const rawPtInterviewId =
    params.ptInterviewId;

  const ptInterviewId = Number(
    Array.isArray(rawPtInterviewId)
      ? rawPtInterviewId[0]
      : rawPtInterviewId
  );

  const [progress, setProgress] =
    useState(5);

  const [failed, setFailed] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null
  );

  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false);

  const startedRef =
    useRef(false);

  const runningRef =
    useRef(false);

  const mountedRef =
    useRef(true);

  const isValidId =
    Number.isInteger(ptInterviewId) &&
    ptInterviewId > 0;

  /**
   * 질문별 비동기 분석 완료 대기
   */
  const waitForAnswerAnalysis =
    useCallback(async () => {
      const questions =
        await getPtQuestions(
          ptInterviewId
        );

      if (
        !questions ||
        questions.length === 0
      ) {
        throw new Error(
          "생성된 PT 질문을 찾을 수 없습니다."
        );
      }

      const expectedAnswerCount =
        questions.length;

      const startedAt =
        Date.now();

      while (true) {
        if (!mountedRef.current) {
          return;
        }

        if (
          Date.now() - startedAt >
          MAX_WAIT_MS
        ) {
          throw new Error(
            "답변 분석 시간이 너무 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요."
          );
        }

        const answers =
          await getPtAnswers(
            ptInterviewId
          );

        /*
         * 아직 모든 답변이 업로드되지 않음
         */
        if (
          answers.length <
          expectedAnswerCount
        ) {
          setProgress((current) =>
            Math.max(current, 10)
          );

          await delay(
            POLLING_INTERVAL_MS
          );

          continue;
        }

        /*
         * 분석 실패 답변 확인
         */
        const failedAnswer =
          answers.find(
            (answer) =>
              answer.analysisStatus ===
              "FAILED"
          );

        if (failedAnswer) {
          throw new Error(
            `${failedAnswer.questionNumber}번 답변 분석에 실패했습니다.`
          );
        }

        /*
         * DONE 개수 확인
         */
        const doneCount =
          answers.filter(
            (answer) =>
              answer.analysisStatus ===
              "DONE"
          ).length;

        const analysisProgress =
          15 +
          Math.floor(
            (doneCount /
              expectedAnswerCount) *
              63
          );

        setProgress(
          Math.min(
            analysisProgress,
            78
          )
        );

        /*
         * 모든 답변 분석 완료
         */
        if (
          doneCount >=
          expectedAnswerCount
        ) {
          /*
           * 마지막 DB 반영 대기
           */
          await delay(500);

          return;
        }

        await delay(
          POLLING_INTERVAL_MS
        );
      }
    }, [ptInterviewId]);

  /**
   * 전체 분석 진행
   */
  const startAnalysis =
    useCallback(async () => {
      if (
        !isValidId ||
        runningRef.current
      ) {
        return;
      }

      runningRef.current = true;

      setIsGenerating(true);
      setFailed(false);
      setErrorMessage(null);
      setProgress(8);

      try {
        /*
         * 1.
         * 1~5번 질문 분석이 모두 DONE일 때까지 대기
         */
        await waitForAnswerAnalysis();

        if (!mountedRef.current) {
          return;
        }

        setProgress(82);

        /*
         * 2.
         * 모든 STT 저장 완료 후
         * PT 종합 리포트 생성
         */
        await generatePtReport(
          ptInterviewId
        );

        if (!mountedRef.current) {
          return;
        }

        setProgress(100);

        await delay(500);

        if (!mountedRef.current) {
          return;
        }

        router.replace(
          `/pt-interview/${ptInterviewId}/result`
        );
      } catch (error) {
        if (!mountedRef.current) {
          return;
        }

        console.error(
          "[PT 분석 실패]",
          error
        );

        setFailed(true);
        setProgress(0);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "PT 종합 리포트 생성에 실패했습니다."
        );
      } finally {
        runningRef.current = false;

        if (mountedRef.current) {
          setIsGenerating(false);
        }
      }
    }, [
      isValidId,
      ptInterviewId,
      router,
      waitForAnswerAnalysis,
    ]);

  /**
   * 최초 진입 시 실행
   */
  useEffect(() => {
    mountedRef.current = true;

    if (!isValidId) {
      setFailed(true);
      setErrorMessage(
        "잘못된 PT 면접 ID입니다."
      );

      return;
    }

    /*
     * 중복 실행 방지
     */
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    void startAnalysis();

    return () => {
      mountedRef.current = false;
    };
  }, [
    isValidId,
    startAnalysis,
  ]);

  /**
   * 재시도
   */
  const handleRetry =
    useCallback(async () => {
      if (
        isGenerating ||
        runningRef.current
      ) {
        return;
      }

      mountedRef.current = true;

      setFailed(false);
      setErrorMessage(null);
      setProgress(5);

      await startAnalysis();
    }, [
      isGenerating,
      startAnalysis,
    ]);

  const activeStep =
    progress >= 100
      ? ANALYZE_STEPS.length
      : Math.min(
          Math.floor(
            (progress / 100) *
              ANALYZE_STEPS.length
          ),
          ANALYZE_STEPS.length - 1
        );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg p-8 transition-colors duration-300 dark:bg-[#0f1729]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-50">
        <div className="absolute -left-20 -top-40 h-[650px] w-[650px] rounded-full bg-[#E7F1A8]/40 blur-[130px]" />
        <div className="absolute -right-20 top-10 h-[750px] w-[750px] rounded-full bg-[#95B1EE]/50 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-black/[0.04]" />

          {!failed ? (
            <>
              <div className="absolute inset-0 animate-[spin_2s_linear_infinite] rounded-full border-4 border-transparent border-t-navy" />

              <span className="font-serif text-xl font-bold text-navy dark:text-white">
                {progress}%
              </span>
            </>
          ) : (
            <AlertCircle className="h-12 w-12 text-red-500" />
          )}
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-navy dark:text-white">
          {failed
            ? "분석에 실패했습니다"
            : "발표 역량을 분석하고 있습니다"}
        </h2>

        <p className="mt-2 text-sm font-medium text-muted">
          {failed
            ? errorMessage ??
              "분석을 완료하지 못했습니다."
            : "발표와 질의응답 분석 결과를 수집해 종합 리포트를 생성합니다."}
        </p>

        {!failed ? (
          <div className="mt-8 flex flex-col gap-2.5 rounded-[24px] border border-line bg-surface p-6 text-left shadow-sm">
            {ANALYZE_STEPS.map(
              (step, index) => {
                const done =
                  index < activeStep;

                const current =
                  index === activeStep &&
                  progress < 100;

                return (
                  <motion.div
                    key={step}
                    initial={{
                      opacity: 0,
                      x: -8,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay:
                        index * 0.05,
                    }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? "bg-navy text-white"
                          : current
                            ? "bg-brand-soft/25 text-navy"
                            : "bg-chip text-muted"
                      }`}
                    >
                      {done ? (
                        <Check
                          className="h-3.5 w-3.5"
                          strokeWidth={3}
                        />
                      ) : current ? (
                        <Spinner className="h-3.5 w-3.5" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    <span
                      className={`text-sm font-bold ${
                        done || current
                          ? "text-ink"
                          : "text-muted"
                      }`}
                    >
                      {step}
                    </span>
                  </motion.div>
                );
              }
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              void handleRetry()
            }
            disabled={
              isGenerating ||
              !isValidId
            }
            className="mx-auto mt-8 flex items-center gap-2 rounded-full bg-navy px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <RefreshCcw className="h-4 w-4" />
            다시 분석하기
          </button>
        )}
      </div>
    </main>
  );
}