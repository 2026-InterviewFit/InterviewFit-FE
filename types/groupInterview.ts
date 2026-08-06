// types/groupInterview.ts

// 방 모집/진행 상태
export type RoomStatus =
  | "recruiting" // 모집중
  | "almostFull" // 마감임박 (1자리 남음 등)
  | "full" // 모집완료 (시작 대기)
  | "live" // 면접 진행중
  | "finished"; // 종료

export interface GroupRoom {
  roomId: string;
  title: string;
  category: string; // 대분류 (예: "IT/개발")
  role: string; // 세부 직무 (예: "백엔드", 없으면 "")
  currentParticipants: number;
  maxParticipants: number; // 2 ~ 4 (최대 4명)
  status: RoomStatus;
  startAt: string; //
  hostName: string;
}

export interface GroupParticipant {
  userId: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  cameraOn: boolean;
  micOn: boolean;
}

export interface CreateRoomPayload {
  title: string;
  category: string;
  role: string;
  maxParticipants: number;
  startAt: string;
}