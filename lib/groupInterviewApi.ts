// lib/groupInterviewApi.ts
import type { GroupRoom, CreateRoomPayload } from "@/types/groupInterview";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// 방 목록 조회
export async function getGroupRooms(category?: string): Promise<GroupRoom[]> {
  const query =
    category && category !== "전체" ? `?category=${encodeURIComponent(category)}` : "";
  const res = await fetch(`${API_BASE_URL}/api/group-interview/rooms${query}`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("면접방 목록 조회 실패");
  return res.json();
}

// 방 상세 조회 (2단계 대기실에서 사용)
export async function getGroupRoom(roomId: string): Promise<GroupRoom> {
  const res = await fetch(`${API_BASE_URL}/api/group-interview/rooms/${roomId}`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("면접방 조회 실패");
  return res.json();
}

// 방 생성
export async function createGroupRoom(
  payload: CreateRoomPayload
): Promise<GroupRoom> {
  const res = await fetch(`${API_BASE_URL}/api/group-interview/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`면접방 생성 실패 (${res.status}): ${body || res.statusText}`);
  }
  return res.json();
}

// 방 참여
export async function joinGroupRoom(roomId: string): Promise<GroupRoom> {
  const res = await fetch(
    `${API_BASE_URL}/api/group-interview/rooms/${roomId}/join`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("면접방 참여 실패");
  return res.json();
}

// lib/groupInterviewApi.ts 하단에 추가
// 그룹 면접: 발언자 한 명의 답변(슬라이스) 녹화본을 즉시 서버로 전송
export async function uploadGroupAnswerSlice(params: {
  roomId: string;
  userId: string;
  questionIndex: number;
  speakerIndex: number;
  file: Blob;
}): Promise<void> {
  const formData = new FormData();
  formData.append("file", params.file, `slice_q${params.questionIndex}_s${params.speakerIndex}.webm`);
  formData.append("userId", params.userId);
  formData.append("questionIndex", String(params.questionIndex));
  formData.append("speakerIndex", String(params.speakerIndex));

  const res = await fetch(
    `${API_BASE_URL}/api/group-interview/rooms/${params.roomId}/answers`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("그룹 면접 답변 슬라이스 업로드 실패");
}