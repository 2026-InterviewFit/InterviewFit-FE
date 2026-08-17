"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocalParticipant, useParticipants } from "@livekit/components-react";
import { getGroupParticipants } from "@/lib/groupInterviewApi";
import { getAuthUser } from "@/lib/auth";
import type { GroupParticipant } from "@/types/groupInterview";

export interface RoomParticipant extends GroupParticipant {
  isMe?: boolean;
}

export function useRoomConnection(roomId: string) {
  const liveParticipants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [apiParticipants, setApiParticipants] = useState<GroupParticipant[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => void getGroupParticipants(roomId).then((value) => {
      if (!cancelled) setApiParticipants(value);
    }).catch(() => undefined);
    load();
    const timer = window.setInterval(load, 5000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [roomId]);

  const participants = useMemo<RoomParticipant[]>(() => {
    const me = getAuthUser();
    return liveParticipants.map((participant) => {
      const api = apiParticipants.find((item) => item.userId === participant.identity);
      return {
        userId: participant.identity,
        nickname: participant.name || api?.nickname || "참가자",
        isHost: api?.isHost ?? false,
        isReady: participant.isLocal ? ready : api?.isReady ?? false,
        cameraOn: participant.isCameraEnabled,
        micOn: participant.isMicrophoneEnabled,
        isMe: participant.isLocal || participant.identity === String(me?.id ?? ""),
      };
    });
  }, [apiParticipants, liveParticipants, ready]);

  // 내 준비 상태 토글 함수
  const toggleReady = useCallback(() => {
    setReady((value) => !value);
  }, []);

  // 💡 참여자의 캠/마이크 UI 상태를 동기화하는 함수
  const toggleCamera = useCallback(() => void localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled), [localParticipant]);

  const toggleMic = useCallback(() => void localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled), [localParticipant]);

  // 참여자가 2명 이상이고, 모두 Ready 상태인지 확인
  const isAllReady = participants.length > 1 && participants.every((p) => p.isReady);

  return {
    participants,
    toggleReady,
    toggleCamera,
    toggleMic,
    isAllReady,
  };
}
