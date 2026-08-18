"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useLocalParticipant, useParticipants } from "@livekit/components-react";
import SockJS from "sockjs-client";
import {
  getGroupParticipants,
  getGroupSession,
  setGroupReady,
} from "@/lib/groupInterviewApi";
import { getAuthUser } from "@/lib/auth";
import type {
  GroupInterviewEvent,
  GroupInterviewProgress,
  GroupParticipant,
} from "@/types/groupInterview";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const PARTICIPANT_EVENTS = new Set([
  "PARTICIPANT_JOINED",
  "PARTICIPANT_LEFT",
  "PARTICIPANT_READY",
  "PARTICIPANT_UNREADY",
]);

export interface RoomParticipant extends GroupParticipant {
  isMe?: boolean;
}

export function useRoomConnection(roomId: string) {
  const liveParticipants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [apiParticipants, setApiParticipants] = useState<GroupParticipant[]>([]);
  const [progress, setProgress] = useState<GroupInterviewProgress | null>(null);
  const [connectionError, setConnectionError] = useState("");
  const [isReadyUpdating, setIsReadyUpdating] = useState(false);

  const loadParticipants = useCallback(async () => {
    const value = await getGroupParticipants(roomId);
    setApiParticipants(value);
  }, [roomId]);

  const loadProgress = useCallback(async () => {
    setProgress(await getGroupSession(roomId));
  }, [roomId]);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([getGroupParticipants(roomId), getGroupSession(roomId)])
      .then(([participantValue, progressValue]) => {
        if (cancelled) return;
        setApiParticipants(participantValue);
        setProgress(progressValue);
      })
      .catch((cause) => {
        if (!cancelled) {
          setConnectionError(cause instanceof Error ? cause.message : "면접방 상태를 불러오지 못했습니다.");
        }
      });

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws-interview`),
      reconnectDelay: 3000,
      onConnect: () => {
        setConnectionError("");
        // 재연결 사이에 놓친 broadcast가 있어도 서버의 현재 세션으로 복구한다.
        void loadProgress();
        client.subscribe(`/topic/room/${roomId}`, (frame) => {
          try {
            const event = JSON.parse(frame.body) as GroupInterviewEvent;
            // 진행 상태는 이벤트명을 해석해 계산하지 않고 서버 payload를 그대로 쓴다.
            if (event.progress) setProgress(event.progress);
            if (PARTICIPANT_EVENTS.has(event.type)) void loadParticipants();
          } catch {
            setConnectionError("면접방 실시간 이벤트를 해석하지 못했습니다.");
          }
        });
      },
      onStompError: (frame) => {
        setConnectionError(frame.headers.message || "면접방 실시간 연결에 실패했습니다.");
      },
      onWebSocketError: () => {
        setConnectionError("면접방 실시간 연결이 끊겼습니다. 재연결 중입니다.");
      },
    });

    client.activate();
    return () => {
      cancelled = true;
      void client.deactivate();
    };
  }, [loadParticipants, loadProgress, roomId]);

  const participants = useMemo<RoomParticipant[]>(() => {
    const me = getAuthUser();
    return liveParticipants.map((participant) => {
      const api = apiParticipants.find((item) => item.userId === participant.identity);
      return {
        userId: participant.identity,
        nickname: participant.name || api?.nickname || "참가자",
        isHost: api?.isHost ?? false,
        isReady: api?.isReady ?? false,
        cameraOn: participant.isCameraEnabled,
        micOn: participant.isMicrophoneEnabled,
        isMe: participant.isLocal || participant.identity === String(me?.id ?? ""),
      };
    });
  }, [apiParticipants, liveParticipants]);

  const toggleReady = useCallback(async () => {
    if (isReadyUpdating) return;
    try {
      setIsReadyUpdating(true);
      setConnectionError("");
      const me = getAuthUser();
      const current = apiParticipants.find((participant) => participant.userId === String(me?.id));
      const updated = await setGroupReady(roomId, !current?.isReady);
      setApiParticipants((participantsValue) => participantsValue.map((participant) => (
        participant.userId === updated.userId ? updated : participant
      )));
    } catch (cause) {
      setConnectionError(cause instanceof Error ? cause.message : "준비 상태를 변경하지 못했습니다.");
    } finally {
      setIsReadyUpdating(false);
    }
  }, [apiParticipants, isReadyUpdating, roomId]);

  const toggleCamera = useCallback(
    () => void localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled),
    [localParticipant],
  );
  const toggleMic = useCallback(
    () => void localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled),
    [localParticipant],
  );

  const isAllReady = participants.length > 1 && participants.every((participant) => participant.isReady);

  return {
    participants,
    progress,
    connectionError,
    isReadyUpdating,
    toggleReady,
    toggleCamera,
    toggleMic,
    isAllReady,
  };
}
