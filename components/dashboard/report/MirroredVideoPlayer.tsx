"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface MirroredVideoPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number) => void; // 🔑 현재 재생 위치를 부모에 알림
}

export interface MirroredVideoPlayerHandle {
  seekTo: (seconds: number) => void;
}

const MirroredVideoPlayer = forwardRef<MirroredVideoPlayerHandle, MirroredVideoPlayerProps>(
  ({ src, onTimeUpdate }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    // 🔑 터치 기기(hover 불가능한 환경) 감지 — 감지되면 컨트롤을 항상 보이게 함
    useEffect(() => {
      if (typeof window !== "undefined" && window.matchMedia) {
        setIsTouchDevice(window.matchMedia("(hover: none)").matches);
      }
    }, []);

    const formatTime = (t: number) => {
      if (!t || !Number.isFinite(t)) return "00:00";
      const m = Math.floor(t / 60).toString().padStart(2, "0");
      const s = Math.floor(t % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    };

    // webm duration=Infinity 버그 우회
    const fixDuration = () => {
      const video = videoRef.current;
      if (!video) return;

      if (video.duration === Infinity || Number.isNaN(video.duration)) {
        video.currentTime = 1e101;
        const onLoadedTimeUpdate = () => {
          video.removeEventListener("timeupdate", onLoadedTimeUpdate);
          video.currentTime = 0;
          setDuration(video.duration);
        };
        video.addEventListener("timeupdate", onLoadedTimeUpdate);
      } else {
        setDuration(video.duration);
      }
    };

    const handleTimeUpdate = () => {
      const time = videoRef.current?.currentTime || 0;
      setCurrentTime(time);
      onTimeUpdate?.(time); // 🔑 부모에 현재 시각 전달
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;
      if (video && Number.isFinite(video.duration)) {
        video.currentTime = (Number(e.target.value) / 100) * video.duration;
      }
    };

    const togglePlay = () => {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    };

    const toggleMute = () => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = !video.muted;
      setIsMuted(video.muted);
    };

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = seconds;
        video.play();
        setIsPlaying(true);
      },
    }));

    return (
      <div ref={containerRef} className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden group">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain -scale-x-100"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={fixDuration}
          onClick={togglePlay}
          onEnded={() => setIsPlaying(false)}
        />

        {/* 🔑 터치 기기에서는 항상 opacity-100, 데스크톱은 기존처럼 hover 시에만 표시 */}
        <div
          className={`absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity ${
            isTouchDevice ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            aria-label="재생 위치 조절"
            className="w-full h-1.5 mb-3 cursor-pointer accent-blue-500"
          />
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white" aria-label={isPlaying ? "일시정지" : "재생"}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button onClick={toggleMute} className="text-white" aria-label={isMuted ? "음소거 해제" : "음소거"}>
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <span className="text-xs font-mono text-white/80 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button
              onClick={() => containerRef.current?.requestFullscreen()}
              className="text-white ml-auto"
              aria-label="전체화면"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

MirroredVideoPlayer.displayName = "MirroredVideoPlayer";
export default MirroredVideoPlayer;