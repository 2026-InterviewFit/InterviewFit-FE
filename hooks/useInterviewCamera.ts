// hooks/useInterviewCamera.ts
import { useState, useEffect, useRef } from "react";
// 💡 getInterviewReport API를 가져와서 백엔드 분석 완료 여부를 체크할 거야!
import { uploadAnswerVideo, getInterviewReport } from "@/lib/api";
import { fixWebmBlobDuration, getSupportedWebmMimeType } from "@/lib/mediaRecorder";

interface UseInterviewCameraProps {
  step: string;
  interviewId: number | null;
  startedUserId: number | null;
  jobRoleId: number | null;
  jobName?: string;
  currentQuestions: string[];
  questionTimestamps: number[];
  onExit: () => void;
}

export function useInterviewCamera({
  step,
  interviewId,
  startedUserId,
  jobRoleId,
  jobName,
  currentQuestions,
  questionTimestamps,
  onExit,
}: UseInterviewCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  
  // 💡 폴링(주기적 확인) 인터벌을 저장할 ref 추가
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [analysisProgress, setAnalysisProgress] = useState(1);
  const [analysisResult, setAnalysisResult] = useState<{ message?: string } | null>(null);
  const [analysisError, setAnalysisError] = useState("");

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  };

  // 컴포넌트 언마운트 시 인터벌 정리
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = mediaStream;
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch {
        alert("카메라와 마이크 권한을 허용해주세요!");
        onExit();
      }
    };
    startCamera();
    return () => stopCamera();
  }, [onExit]);

  useEffect(() => {
    if (step === "recording" && streamRef.current && !mediaRecorderRef.current) {
      chunksRef.current = [];
      const mimeType = getSupportedWebmMimeType();
      const recorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recordStartTimeRef.current = Date.now();
      recorder.start(1000);
    }

    if (step === "analyzing" && mediaRecorderRef.current?.state === "recording") {
      setAnalysisResult(null);
      setAnalysisError("");
      setAnalysisProgress(1);

      mediaRecorderRef.current.onstop = async () => {
        try {
          const rawBlob = new Blob(chunksRef.current, { type: "video/webm" });
          if (rawBlob.size === 0) throw new Error("녹화된 영상 파일이 비어 있습니다.");
          if (!interviewId) throw new Error("면접 세션 정보가 없습니다. 다시 시작해주세요.");

          setAnalysisProgress(15);

          const recordedDurationMs = Date.now() - recordStartTimeRef.current;
          const blob = await fixWebmBlobDuration(rawBlob, recordedDurationMs);

          setAnalysisProgress(30);
          const result = await uploadAnswerVideo({
            interviewId,
            file: blob,
            answerOrder: 1,
            questionText: currentQuestions.join(" | "),
          });

          // 로컬 스토리지에 기록 저장 (중간에 나가더라도 대시보드에 남도록)
          const historyItem = {
            interviewId,
            userId: startedUserId,
            jobRoleId,
            jobName: jobName ?? "모의면접",
            answers: [{ answerId: result.answerId, answerOrder: result.answerOrder, analysisStatus: result.analysisStatus }],
            questionTexts: currentQuestions,
            questionTimestamps,
            savedAt: new Date().toISOString(),
          };

          localStorage.setItem("latestInterviewAnalysisJob", JSON.stringify(historyItem));
          const prev = JSON.parse(localStorage.getItem("interviewAnalysisHistory") || "[]");
          localStorage.setItem(
            "interviewAnalysisHistory",
            JSON.stringify([
              historyItem,
              ...prev.filter((item: { interviewId?: number }) => item.interviewId !== interviewId),
            ].slice(0, 20))
          );

          setAnalysisProgress(40); // 💡 업로드 완료 지점 (이제 백엔드 분석을 기다립니다)

          // 💡 [핵심 변경 포인트] 백엔드 분석이 완료될 때까지 기다리는 폴링 로직 추가!
          pollIntervalRef.current = setInterval(async () => {
            try {
              const report = await getInterviewReport(interviewId);
              if (report.analysisStatus === "DONE") {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                setAnalysisProgress(100);
                setAnalysisResult({ message: "모든 AI 분석이 완료되었습니다. 결과를 확인해 보세요!" });
              } else if (report.analysisStatus === "FAILED") {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                setAnalysisError("AI 분석 중 오류가 발생했습니다.");
              } else {
                // RUNNING 상태일 때 진행률을 천천히 99%까지 올림 (심리적 안정감 제공)
                setAnalysisProgress((prev) => (prev < 98 ? prev + Math.floor(Math.random() * 3) + 1 : 99));
              }
            } catch {
              // 폴링 중 일시적 네트워크 에러는 무시하고 계속 진행
            }
          }, 3000); // 3초마다 상태 확인

        } catch (error) {
          setAnalysisError(error instanceof Error ? error.message : "업로드 중 오류가 발생했습니다.");
        } finally {
          mediaRecorderRef.current = null;
        }
      };

      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, [step, currentQuestions, interviewId, jobRoleId, jobName, startedUserId, questionTimestamps]);

  return {
    videoRef,
    analysisProgress,
    analysisResult,
    analysisError,
    stopCamera,
  };
}
