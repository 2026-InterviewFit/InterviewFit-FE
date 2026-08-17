"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, CheckCircle2, Radio } from "lucide-react";
import type { RoomParticipant } from "@/hooks/useRoomConnection";
import { Track } from "livekit-client";
import { useTracks, VideoTrack } from "@livekit/components-react";

const getAvatarColor = (name?: string) => {
  if (!name) return { bg: "#364C84", fg: "#FFFDF5" };
  const colors = [
    { bg: "#364C84", fg: "#FFFDF5" },
    { bg: "#95B1EE", fg: "#273761" },
    { bg: "#E7F1A8", fg: "#3F4A1B" },
    { bg: "#64748B", fg: "#F8FAFC" },
  ];
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
};

interface ParticipantGridProps {
  participants: RoomParticipant[];
  activeSpeakerId?: string;
}

export default function ParticipantGrid({ participants, activeSpeakerId }: ParticipantGridProps) {
  const cameraTracks = useTracks([Track.Source.Camera]);
  return (
    // 💡 변경됨: h-fit 대신 flex-1 min-h-0 h-full 적용, sm:grid-rows-2 추가로 세로 2줄 강제 배분
    <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-3 md:gap-4 w-full max-w-5xl mx-auto flex-1 min-h-0 h-full">
      <AnimatePresence>
        {participants.map((p) => {
          const avatar = getAvatarColor(p.nickname);
          const displayName = p.nickname || "익명";
          const isSpeaking = !!activeSpeakerId && p.userId === activeSpeakerId;
          const cameraTrack = cameraTracks.find((track) => track.participant.identity === p.userId);

          return (
            <motion.div
              key={p.userId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              // 💡 변경됨: aspect-video 제거 -> w-full h-full 적용하여 그리드 칸에 맞게 자동 리사이징
              className={`relative w-full h-full min-h-[160px] overflow-hidden rounded-[20px] md:rounded-[24px] bg-[#111827] shadow-lg transition-all duration-300 ${
                isSpeaking
                  ? "border-2 border-amber-400 shadow-[0_0_28px_rgba(251,191,36,0.45)]"
                  : p.isReady
                  ? "border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  : "border-2 border-transparent dark:border-white/5"
              }`}
            >
              {cameraTrack && p.cameraOn && <VideoTrack trackRef={cameraTrack} className={`absolute inset-0 h-full w-full object-cover ${p.isMe ? "-scale-x-100" : ""}`} />}

              {!p.cameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#111827]/80 backdrop-blur-sm z-10">
                  <div
                    className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full text-xl md:text-2xl font-bold shadow-2xl"
                    style={{ backgroundColor: avatar.bg, color: avatar.fg }}
                  >
                    {displayName[0]}
                  </div>
                </div>
              )}

              {isSpeaking && (
                <div className="absolute left-3 top-3 md:left-4 md:top-4 z-30 flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1 text-[11px] font-bold text-[#3F2D00] shadow-lg backdrop-blur-sm">
                  <Radio className="h-3 w-3 animate-pulse" /> 발언 중
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-3 pt-12 md:px-5 md:pb-4 md:pt-16 z-20">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex gap-1.5 p-1 md:p-1.5 rounded-lg bg-black/40 backdrop-blur-md">
                    {p.micOn ? <Mic className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" /> : <MicOff className="h-3 w-3 md:h-3.5 md:w-3.5 text-red-400" />}
                    {p.cameraOn ? <Video className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" /> : <VideoOff className="h-3 w-3 md:h-3.5 md:w-3.5 text-red-400" />}
                  </div>
                  <span className="text-xs md:text-sm font-bold text-white drop-shadow-md truncate max-w-[100px] md:max-w-[150px]">
                    {displayName} {p.isMe && <span className="text-white/60 text-[10px] md:text-xs font-medium ml-1">(나)</span>}
                  </span>
                </div>

                {!activeSpeakerId && (
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-[11px] font-bold backdrop-blur-md transition-all ${
                      p.isReady
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-white/10 text-white/60 border border-white/10"
                    }`}
                  >
                    {p.isReady && <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3" />}
                    {p.isReady ? "준비 완료" : "준비 중"}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
