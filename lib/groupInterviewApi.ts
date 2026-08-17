import { authFetch, readErrorMessage } from "@/lib/api";
import type {
  CreateRoomPayload,
  GroupParticipant,
  GroupRoom,
  LiveKitCredentials,
  RoomStatus,
} from "@/types/groupInterview";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const GROUP_API = `${API_BASE_URL}/api/group-interviews`;

type JsonObject = Record<string, unknown>;

export class GroupInterviewApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "GroupInterviewApiError";
  }
}

async function unwrap(response: Response): Promise<unknown> {
  if (!response.ok) {
    throw new GroupInterviewApiError(response.status, await readErrorMessage(response));
  }
  if (response.status === 204) return undefined;
  const data = await response.json();
  if (data && typeof data === "object" && "data" in data) return (data as JsonObject).data;
  return data;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function number(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roomStatus(raw: JsonObject, current: number, max: number): RoomStatus {
  const value = text(raw.status).toLowerCase();
  if (["live", "in_progress", "ongoing"].includes(value)) return "live";
  if (["finished", "completed", "closed"].includes(value)) return "finished";
  if (["full"].includes(value) || current >= max) return "full";
  if (current === max - 1) return "almostFull";
  return "recruiting";
}

function normalizeRoom(value: unknown): GroupRoom {
  const raw = (value ?? {}) as JsonObject;
  const jobRole = (raw.jobRole ?? {}) as JsonObject;
  const host = (raw.host ?? raw.hostUser ?? {}) as JsonObject;
  const id = number(raw.id ?? raw.roomId);
  const current = number(raw.currentParticipants ?? raw.participantCount ?? raw.currentParticipantCount);
  const max = number(raw.maxParticipants, 4);
  return {
    id,
    roomId: String(raw.id ?? raw.roomId ?? ""),
    title: text(raw.title),
    category: text(raw.category ?? jobRole.category, "기타"),
    role: text(raw.role ?? raw.jobRoleName ?? jobRole.name),
    jobRoleId: number(raw.jobRoleId ?? jobRole.id) || undefined,
    currentParticipants: current,
    maxParticipants: max,
    status: roomStatus(raw, current, max),
    startAt: text(raw.scheduledStartTime ?? raw.startAt),
    hostName: text(raw.hostName ?? host.name, "방장"),
  };
}

function normalizeParticipant(value: unknown): GroupParticipant {
  const raw = (value ?? {}) as JsonObject;
  const user = (raw.user ?? {}) as JsonObject;
  return {
    userId: String(raw.userId ?? user.id ?? raw.id ?? ""),
    nickname: text(raw.nickname ?? raw.userName ?? raw.name ?? user.name, "참가자"),
    isHost: Boolean(raw.isHost ?? raw.host),
    isReady: Boolean(raw.isReady ?? raw.ready),
    cameraOn: raw.cameraOn !== false,
    micOn: raw.micOn !== false,
  };
}

export async function getGroupRooms(): Promise<GroupRoom[]> {
  const data = await unwrap(await fetch(GROUP_API));
  const list = Array.isArray(data) ? data : ((data as JsonObject)?.content ?? []);
  return (Array.isArray(list) ? list : []).map(normalizeRoom);
}

export async function getGroupRoom(roomId: string): Promise<GroupRoom> {
  return normalizeRoom(await unwrap(await fetch(`${GROUP_API}/${encodeURIComponent(roomId)}`)));
}

export async function getGroupParticipants(roomId: string): Promise<GroupParticipant[]> {
  const data = await unwrap(await fetch(`${GROUP_API}/${encodeURIComponent(roomId)}/participants`));
  const list = Array.isArray(data) ? data : ((data as JsonObject)?.content ?? []);
  return (Array.isArray(list) ? list : []).map(normalizeParticipant);
}

export async function createGroupRoom(payload: CreateRoomPayload): Promise<GroupRoom> {
  const response = await authFetch(GROUP_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return normalizeRoom(await unwrap(response));
}

export async function joinGroupRoom(roomId: string): Promise<void> {
  await unwrap(await authFetch(`${GROUP_API}/${encodeURIComponent(roomId)}/join`, { method: "POST" }));
}

export async function getLiveKitCredentials(roomId: string): Promise<LiveKitCredentials> {
  const data = (await unwrap(await authFetch(
    `${GROUP_API}/${encodeURIComponent(roomId)}/livekit-token`,
    { method: "POST" },
  ))) as Partial<LiveKitCredentials>;
  if (!data?.url || !data.token) throw new Error("LiveKit 연결 정보가 올바르지 않습니다.");
  return { url: data.url, token: data.token };
}
