"use client";

import { useState, useEffect, useCallback } from "react";
import type { GroupParticipant } from "@/types/groupInterview";

export interface RoomParticipant extends GroupParticipant {
  isMe?: boolean;
}

export function useRoomConnection(roomId: string, userId: string, nickname: string) {
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);

  useEffect(() => {
    // [0초] 나 자신 입장
    setParticipants([
      {
        userId: userId,
        nickname: nickname,
        isHost: true,
        isReady: false,
        cameraOn: true,
        micOn: true,
        isMe: true,
      },
    ]);

    // [3초] 가짜 참여자 1 입장 (캠 OFF, 마이크 ON)
    const t1 = setTimeout(() => {
      setParticipants((prev) => [
        ...prev,
        { userId: "user_2", nickname: "프론트장인", isHost: false, isReady: false, cameraOn: false, micOn: true },
      ]);
    }, 3000);

    // [7초] 가짜 참여자 2 입장 (캠 OFF, 마이크 OFF)
    const t2 = setTimeout(() => {
      setParticipants((prev) => [
        ...prev,
        { userId: "user_3", nickname: "스프링깎는노인", isHost: false, isReady: false, cameraOn: false, micOn: false },
      ]);
    }, 7000);

    // [9초] 가짜 참여자 1 '준비 완료'
    const t3 = setTimeout(() => {
      setParticipants((prev) =>
        prev.map((p) => (p.userId === "user_2" ? { ...p, isReady: true } : p))
      );
    }, 9000);

    // [12초] 마지막 유저 입장 (캠 ON, 마이크 ON, 들어오자마자 준비 완료)
    const t4 = setTimeout(() => {
      setParticipants((prev) => [
        ...prev,
        { userId: "user_4", nickname: "면접마스터", isHost: false, isReady: true, cameraOn: true, micOn: true },
      ]);
    }, 12000);

    // 💡 [15초] 가짜 참여자 2 (스프링깎는노인) '준비 완료'
    const t5 = setTimeout(() => {
      setParticipants((prev) =>
        prev.map((p) => (p.userId === "user_3" ? { ...p, isReady: true } : p))
      );
    }, 15000);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [roomId, userId, nickname]);

  // 내 준비 상태 토글 함수
  const toggleReady = useCallback(() => {
    setParticipants((prev) =>
      prev.map((p) => (p.isMe ? { ...p, isReady: !p.isReady } : p))
    );
  }, []);

  // 💡 참여자의 캠/마이크 UI 상태를 동기화하는 함수
  const toggleCamera = useCallback(() => {
    setParticipants((prev) => prev.map((p) => (p.isMe ? { ...p, cameraOn: !p.cameraOn } : p)));
  }, []);

  const toggleMic = useCallback(() => {
    setParticipants((prev) => prev.map((p) => (p.isMe ? { ...p, micOn: !p.micOn } : p)));
  }, []);

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