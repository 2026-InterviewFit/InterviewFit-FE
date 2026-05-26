"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/shared/Navbar";

export default function PracticePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const chunksRef = useRef<Blob[]>([]);

  const [videoUrl, setVideoUrl] = useState("");

  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("카메라 접근 실패:", error);
      }
    }

    setupCamera();
  }, []);

  const startRecording = async () => {
    const stream = videoRef.current?.srcObject as MediaStream;

    if (!stream) return;

    chunksRef.current = [];

    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: "video/webm",
      });

      const url = URL.createObjectURL(blob);

      setVideoUrl(url);
    };

    mediaRecorder.start();

    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();

    setIsRecording(false);
  };

  return (
    <main className="min-h-screen bg-bg">
      <Navbar variant="app" />

      <section className="mx-auto flex max-w-[1280px] flex-col gap-8 px-8 py-12">
        <div>
          <p className="text-sm text-muted">
            INTERVIEW PRACTICE
          </p>

          <h1 className="mt-3 font-serif text-5xl">
            면접 연습 녹화
          </h1>
        </div>

        <div className="overflow-hidden rounded-[32px] bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="aspect-video w-full object-cover"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className="rounded-full bg-navy px-6 py-3 text-white disabled:opacity-50"
          >
            녹화 시작
          </button>

          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className="rounded-full bg-red-500 px-6 py-3 text-white disabled:opacity-50"
          >
            녹화 종료
          </button>
        </div>

        {videoUrl && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              녹화된 영상
            </h2>

            <video
              src={videoUrl}
              controls
              className="aspect-video w-full rounded-[24px]"
            />
          </div>
        )}
      </section>
    </main>
  );
}