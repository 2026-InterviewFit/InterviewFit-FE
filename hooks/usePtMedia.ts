// hooks/usePtMedia.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function usePtMedia() {
  const videoNodeRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // 💡 콜백 ref: video 엘리먼트가 (재)마운트될 때마다 실행되어 스트림을 재연결
  //    화면 전환(대기실→실전)으로 video가 새로 생겨도 카메라가 유지됨
  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    videoNodeRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoNodeRef.current) {
          videoNodeRef.current.srcObject = stream;
        }
        setReady(true);
      } catch (e) {
        setError("카메라·마이크 권한을 확인해주세요.");
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // 스트림이 먼저 준비되고 video가 나중에 붙는 경우 대비
  useEffect(() => {
    if (ready && videoNodeRef.current && streamRef.current) {
      videoNodeRef.current.srcObject = streamRef.current;
    }
  }, [ready]);

  const toggleCamera = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    const next = !cameraOn;
    stream.getVideoTracks().forEach((t) => (t.enabled = next));
    setCameraOn(next);
  }, [cameraOn]);

  const toggleMic = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    const next = !micOn;
    stream.getAudioTracks().forEach((t) => (t.enabled = next));
    setMicOn(next);
  }, [micOn]);

  // 💡 슬라이스 녹화(MediaRecorder)에서 실제 스트림에 접근하기 위한 헬퍼
  const getStream = useCallback(() => streamRef.current, []);

  return { videoRef, cameraOn, micOn, error, ready, toggleCamera, toggleMic, getStream };
}