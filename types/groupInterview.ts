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
  id: number;
  title: string;
  category: string; // 대분류 (예: "IT/개발")
  role: string; // 세부 직무 (예: "백엔드", 없으면 "")
  currentParticipants: number;
  maxParticipants: number; // 2 ~ 4 (최대 4명)
  status: RoomStatus;
  startAt: string; //
  hostName: string;
  jobRoleId?: number;
}

export interface GroupParticipant {
  id?: number;
  userId: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  cameraOn: boolean;
  micOn: boolean;
}

export interface CreateRoomPayload {
  title: string;
  jobRoleId: number;
  maxParticipants: number;
  scheduledStartTime: string;
}

export interface LiveKitCredentials {
  url: string;
  token: string;
}

export interface GroupInterviewProgress {
  roomId: number;
  currentRound: number;
  currentQuestionIndex: number;
  currentQuestionId: number | null;
  currentQuestionText: string;
  currentParticipantIndex: number;
  currentParticipantUserId: number | null;
  status: string;
  answerId: number | null;
  answerStartedAt: string | null;
  answerDeadlineAt: string | null;
}

export interface GroupInterviewEvent {
  type:
    | "PARTICIPANT_JOINED"
    | "PARTICIPANT_LEFT"
    | "PARTICIPANT_READY"
    | "PARTICIPANT_UNREADY"
    | "INTERVIEW_STARTED"
    | "ANSWER_STARTED"
    | "ANSWER_COMPLETED_SPEAKER_CHANGED"
    | "ANSWER_COMPLETED_QUESTION_CHANGED"
    | "ANSWER_COMPLETED_INTERVIEW_FINISHED"
    | "ANSWER_TIMED_OUT_SPEAKER_CHANGED"
    | "ANSWER_TIMED_OUT_QUESTION_CHANGED"
    | "ANSWER_TIMED_OUT_INTERVIEW_FINISHED"
    | "INTERVIEW_FINISHED";
  roomId: number;
  actorUserId: number | null;
  answerId?: number | null;
  participant?: unknown;
  progress?: GroupInterviewProgress;
  occurredAt: string;
}
