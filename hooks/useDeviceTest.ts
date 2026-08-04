import { useState, useEffect, useRef } from "react";

export function useDeviceTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function setupDevice() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        activeStream = mediaStream;
        setStream(mediaStream);

        // video 태그에 스트림 연결
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("장치 연결 에러:", err);
        setError("카메라와 마이크 권한을 허용해주세요.");
      }
    }

    setupDevice();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { videoRef, stream, error };
}