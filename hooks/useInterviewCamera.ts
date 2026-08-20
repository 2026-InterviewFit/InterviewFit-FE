// hooks/useInterviewCamera.ts
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getInterviewReport,
  uploadAnswerVideo,
} from "@/lib/api";

import fixWebmDuration from "fix-webm-duration";


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
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  /**
   * 면접 전체 영상 녹화용 MediaRecorder.
   *
   * 기존 눈깜빡임 / 자세 / 전체 분석 기능을 위해
   * 면접 시작부터 analyzing 전까지 계속 유지한다.
   */
  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const chunksRef =
    useRef<Blob[]>([]);

  const recordStartTimeRef =
    useRef<number>(0);


  /**
   * =====================================================
   * 꼬리질문용 답변 음성 녹음
   * =====================================================
   *
   * 전체 영상 녹화와 별개로 같은 마이크 트랙을 사용해
   * 현재 질문의 답변 구간만 audio/webm Blob으로 만든다.
   *
   * 기본 질문 답변:
   * Blob -> STT -> 꼬리질문 생성
   *
   * 꼬리질문 답변:
   * 다음 단계에서 Blob -> STT -> follow_up_answers 저장
   */
  const answerRecorderRef =
    useRef<MediaRecorder | null>(null);

  const answerChunksRef =
    useRef<Blob[]>([]);


  const pollIntervalRef =
    useRef<NodeJS.Timeout | null>(null);


  const [analysisProgress, setAnalysisProgress] =
    useState(1);

  const [analysisResult, setAnalysisResult] =
    useState<{ message?: string } | null>(null);

  const [analysisError, setAnalysisError] =
    useState("");


  const stopCamera =
    useCallback(() => {
      streamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop(),
        );
    }, []);


  /**
   * 현재 질문 답변용 오디오 녹음 시작.
   *
   * 이미 녹음 중이면 중복 생성하지 않는다.
   */
  const startAnswerRecording =
    useCallback((): boolean => {
      const sourceStream =
        streamRef.current;


      if (!sourceStream) {
        console.warn(
          "[FollowUp STT] 카메라/마이크 스트림이 아직 준비되지 않았습니다.",
        );

        return false;
      }


      if (
        answerRecorderRef.current &&
        answerRecorderRef.current.state ===
          "recording"
      ) {
        return true;
      }


      const audioTracks =
        sourceStream.getAudioTracks();


      if (
        audioTracks.length === 0
      ) {
        console.warn(
          "[FollowUp STT] 사용할 수 있는 마이크 트랙이 없습니다.",
        );

        return false;
      }


      const audioStream =
        new MediaStream(
          audioTracks,
        );


      const mimeType =
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus",
        )
          ? "audio/webm;codecs=opus"
          : "audio/webm";


      const recorder =
        new MediaRecorder(
          audioStream,
          {
            mimeType,
          },
        );


      answerChunksRef.current = [];


      recorder.ondataavailable =
        (event) => {
          if (
            event.data.size > 0
          ) {
            answerChunksRef.current.push(
              event.data,
            );
          }
        };


      recorder.start(250);

      answerRecorderRef.current =
        recorder;


      console.log(
        "[FollowUp STT] 현재 질문 답변 오디오 녹음 시작",
      );


      return true;
    }, []);


  /**
   * 현재 질문 답변 녹음을 종료하고 audio/webm Blob을 반환한다.
   */
  const stopAnswerRecording =
    useCallback(async (): Promise<Blob> => {
      const recorder =
        answerRecorderRef.current;


      if (
        !recorder ||
        recorder.state !==
          "recording"
      ) {
        throw new Error(
          "현재 녹음 중인 답변 음성이 없습니다.",
        );
      }


      return new Promise<Blob>(
        (
          resolve,
          reject,
        ) => {
          recorder.onerror =
            () => {
              answerRecorderRef.current =
                null;

              reject(
                new Error(
                  "답변 음성 녹음 중 오류가 발생했습니다.",
                ),
              );
            };


          recorder.onstop =
            () => {
              const blob =
                new Blob(
                  answerChunksRef.current,
                  {
                    type:
                      recorder.mimeType ||
                      "audio/webm",
                  },
                );


              answerChunksRef.current = [];

              answerRecorderRef.current =
                null;


              if (
                blob.size === 0
              ) {
                reject(
                  new Error(
                    "녹음된 답변 음성 파일이 비어 있습니다.",
                  ),
                );

                return;
              }


              console.log(
                "[FollowUp STT] 답변 오디오 녹음 완료:",
                blob.size,
                "bytes",
              );


              resolve(blob);
            };


          recorder.stop();
        },
      );
    }, []);


  /**
   * 면접 중단 등으로 현재 답변 Blob이 필요하지 않을 때
   * 별도 답변 녹음을 정리한다.
   */
  const discardAnswerRecording =
    useCallback(() => {
      const recorder =
        answerRecorderRef.current;


      if (
        recorder &&
        recorder.state ===
          "recording"
      ) {
        recorder.onstop =
          () => {
            answerChunksRef.current = [];
            answerRecorderRef.current =
              null;
          };

        recorder.stop();
      }
    }, []);


  /**
   * 컴포넌트 언마운트 시 폴링 및 답변 녹음 정리.
   */
  useEffect(() => {
    return () => {
      if (
        pollIntervalRef.current
      ) {
        clearInterval(
          pollIntervalRef.current,
        );
      }


      const recorder =
        answerRecorderRef.current;

      if (
        recorder &&
        recorder.state ===
          "recording"
      ) {
        recorder.stop();
      }
    };
  }, []);


  /**
   * 카메라 + 마이크 스트림 준비.
   */
  useEffect(() => {
    const startCamera =
      async () => {
        try {
          const mediaStream =
            await navigator.mediaDevices
              .getUserMedia({
                video: true,
                audio: true,
              });


          streamRef.current =
            mediaStream;


          if (
            videoRef.current
          ) {
            videoRef.current.srcObject =
              mediaStream;
          }

        } catch {
          alert(
            "카메라와 마이크 권한을 허용해주세요!",
          );

          onExit();
        }
      };


    void startCamera();


    return () => {
      stopCamera();
    };
  }, [
    onExit,
    stopCamera,
  ]);


  /**
   * 기존 전체 영상 녹화 / 업로드 / 분석 로직.
   */
  useEffect(() => {
    if (
      step === "recording" &&
      streamRef.current &&
      !mediaRecorderRef.current
    ) {
      chunksRef.current = [];


      const mimeType =
        MediaRecorder.isTypeSupported(
          "video/webm;codecs=vp8,opus",
        )
          ? "video/webm;codecs=vp8,opus"
          : "video/webm";


      const recorder =
        new MediaRecorder(
          streamRef.current,
          {
            mimeType,
          },
        );


      mediaRecorderRef.current =
        recorder;


      recorder.ondataavailable =
        (event) => {
          if (
            event.data.size > 0
          ) {
            chunksRef.current.push(
              event.data,
            );
          }
        };


      recordStartTimeRef.current =
        Date.now();

      recorder.start(1000);
    }


    if (
      step === "analyzing"
    ) {
      /**
       * 면접 중단/최종 종료 시 남아 있는
       * 답변 구간 녹음은 정리한다.
       */
      discardAnswerRecording();
    }


    if (
      step === "analyzing" &&
      mediaRecorderRef.current?.state ===
        "recording"
    ) {
      setAnalysisResult(null);
      setAnalysisError("");
      setAnalysisProgress(1);


      mediaRecorderRef.current.onstop =
        async () => {
          try {
            const rawBlob =
              new Blob(
                chunksRef.current,
                {
                  type:
                    "video/webm",
                },
              );


            if (
              rawBlob.size === 0
            ) {
              throw new Error(
                "녹화된 영상 파일이 비어 있습니다.",
              );
            }


            if (!interviewId) {
              throw new Error(
                "면접 세션 정보가 없습니다. 다시 시작해주세요.",
              );
            }


            setAnalysisProgress(15);


            const recordedDurationMs =
              Date.now() -
              recordStartTimeRef.current;


            const blob: Blob =
              await new Promise(
                (
                  resolve,
                  reject,
                ) => {
                  fixWebmDuration(
                    rawBlob,
                    recordedDurationMs,
                    (
                      fixedBlob: Blob,
                    ) => {
                      if (fixedBlob) {
                        resolve(
                          fixedBlob,
                        );
                      } else {
                        reject(
                          new Error(
                            "영상 길이 정보 복구에 실패했습니다.",
                          ),
                        );
                      }
                    },
                  );
                },
              );


            setAnalysisProgress(30);


            const result =
              await uploadAnswerVideo({
                interviewId,
                file: blob,
                answerOrder: 1,
                questionText:
                  currentQuestions.join(
                    " | ",
                  ),
              });


            const historyItem = {
              interviewId,
              userId:
                startedUserId,
              jobRoleId,
              jobName:
                jobName ??
                "모의면접",
              answers: [
                {
                  answerId:
                    result.answerId,
                  answerOrder:
                    result.answerOrder,
                  analysisStatus:
                    result.analysisStatus,
                },
              ],
              questionTexts:
                currentQuestions,
              questionTimestamps,
              savedAt:
                new Date()
                  .toISOString(),
            };


            localStorage.setItem(
              "latestInterviewAnalysisJob",
              JSON.stringify(
                historyItem,
              ),
            );


            const prev =
              JSON.parse(
                localStorage.getItem(
                  "interviewAnalysisHistory",
                ) || "[]",
              );


            localStorage.setItem(
              "interviewAnalysisHistory",
              JSON.stringify(
                [
                  historyItem,
                  ...prev.filter(
                    (item: {
                      interviewId?: number;
                    }) =>
                      item.interviewId !==
                      interviewId,
                  ),
                ].slice(0, 20),
              ),
            );


            setAnalysisProgress(40);


            pollIntervalRef.current =
              setInterval(
                async () => {
                  try {
                    const report =
                      await getInterviewReport(
                        interviewId,
                      );


                    if (
                      report.analysisStatus ===
                      "DONE"
                    ) {
                      if (
                        pollIntervalRef.current
                      ) {
                        clearInterval(
                          pollIntervalRef.current,
                        );
                      }


                      setAnalysisProgress(
                        100,
                      );


                      setAnalysisResult({
                        message:
                          "모든 AI 분석이 완료되었습니다. 결과를 확인해 보세요!",
                      });

                    } else if (
                      report.analysisStatus ===
                      "FAILED"
                    ) {
                      if (
                        pollIntervalRef.current
                      ) {
                        clearInterval(
                          pollIntervalRef.current,
                        );
                      }


                      setAnalysisError(
                        "AI 분석 중 오류가 발생했습니다.",
                      );

                    } else {
                      setAnalysisProgress(
                        (prevProgress) =>
                          prevProgress < 98
                            ? prevProgress +
                              Math.floor(
                                Math.random() *
                                  3,
                              ) +
                              1
                            : 99,
                      );
                    }

                  } catch {
                    /**
                     * 폴링 중 일시적 네트워크 오류는
                     * 다음 주기에 다시 확인한다.
                     */
                  }
                },
                3000,
              );

          } catch (error) {
            setAnalysisError(
              error instanceof Error
                ? error.message
                : "업로드 중 오류가 발생했습니다.",
            );

          } finally {
            mediaRecorderRef.current =
              null;
          }
        };


      mediaRecorderRef.current.stop();


      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop(),
          );

        streamRef.current =
          null;
      }
    }
  }, [
    step,
    currentQuestions,
    interviewId,
    jobRoleId,
    jobName,
    startedUserId,
    questionTimestamps,
    discardAnswerRecording,
  ]);


  return {
    videoRef,
    analysisProgress,
    analysisResult,
    analysisError,
    stopCamera,
    startAnswerRecording,
    stopAnswerRecording,
    discardAnswerRecording,
  };
}