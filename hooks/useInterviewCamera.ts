// hooks/useInterviewCamera.ts
import { useState, useEffect, useRef } from "react";
import { uploadAnswerVideo } from "@/lib/api";
// @ts-expect-error - fix-webm-duration에는 타입 정의가 없습니다
import fixWebmDuration from "fix-webm-duration";

interface UseInterviewCameraProps {
  step: string;
  interviewId: number | null;
  startedUserId: number | null;
  jobRoleId: number | null;
  jobName?: string;
  currentQuestions: string[];
  questionTimestamps: number[]; // 🔑 추가: 질문별 시작 시각(초)
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

  const [analysisProgress, setAnalysisProgress] = useState(1);
  const [analysisResult, setAnalysisResult] = useState<{ message?: string } | null>(null);
  const [analysisError, setAnalysisError] = useState("");

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  };

  // 1. 카메라 시작
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = mediaStream;
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (error) {
        alert("카메라와 마이크 권한을 허용해주세요!");
        onExit();
      }
    };
    startCamera();
    return () => stopCamera();
  }, [onExit]);

  // 2. 녹화 제어 및 업로드
  useEffect(() => {
    if (step === "recording" && streamRef.current && !mediaRecorderRef.current) {
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";
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

          setAnalysisProgress(20);

          // webm duration 헤더 수리
          const recordedDurationMs = Date.now() - recordStartTimeRef.current;
          const blob: Blob = await new Promise((resolve, reject) => {
            fixWebmDuration(rawBlob, recordedDurationMs, (fixedBlob: Blob) => {
              if (fixedBlob) resolve(fixedBlob);
              else reject(new Error("영상 길이 정보 복구에 실패했습니다."));
            });
          });

          setAnalysisProgress(40);
          const result = await uploadAnswerVideo({
            interviewId,
            file: blob,
            answerOrder: 1,
            questionText: currentQuestions.join(" | "),
          });

          setAnalysisProgress(80);
          const historyItem = {
            interviewId,
            userId: startedUserId,
            jobRoleId,
            jobName: jobName ?? "모의면접",
            answers: [{ answerId: result.answerId, answerOrder: result.answerOrder, analysisStatus: result.analysisStatus }],
            questionTexts: currentQuestions,       // 🔑 질문 원문 저장
            questionTimestamps,                     // 🔑 타임스탬프 저장
            savedAt: new Date().toISOString(),
          };

          localStorage.setItem("latestInterviewAnalysisJob", JSON.stringify(historyItem));
          const prev = JSON.parse(localStorage.getItem("interviewAnalysisHistory") || "[]");
          localStorage.setItem(
            "interviewAnalysisHistory",
            JSON.stringify([historyItem, ...prev.filter((h: any) => h.interviewId !== interviewId)].slice(0, 20))
          );

          setAnalysisProgress(100);
          setAnalysisResult({ message: "업로드 완료! 백엔드에서 분석이 시작됐습니다." });
        } catch (error) {
          setAnalysisProgress(100);
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