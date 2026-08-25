import { authFetch, getJobRoles, readErrorMessage } from "@/lib/api";
import type {
  CreateRoomPayload,
  GroupInterviewAnswerAnalysis,
  GroupInterviewComparison,
  GroupInterviewHistory,
  GroupInterviewMyAnswer,
  GroupParticipant,
  GroupInterviewProgress,
  GroupRoom,
  LiveKitCredentials,
  RoomStatus,
} from "@/types/groupInterview";
import type { JobRole } from "@/types";

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

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function roomStatus(raw: JsonObject, current: number, max: number): RoomStatus {
  const value = text(raw.roomStatus ?? raw.status).toUpperCase();
  if (["IN_PROGRESS", "LIVE", "ONGOING"].includes(value)) return "live";
  if (["COMPLETED", "FINISHED", "CLOSED"].includes(value)) return "finished";
  if (["WAITING", "RECRUITING", "ALMOSTFULL", "ALMOST_FULL", "FULL"].includes(value)) {
    if (value === "FULL" || current >= max) return "full";
    if (current === max - 1) return "almostFull";
    return "recruiting";
  }
  return "finished";
}

function normalizeRoom(value: unknown, jobRolesById?: ReadonlyMap<number, JobRole>): GroupRoom {
  const raw = (value ?? {}) as JsonObject;
  const jobRole = (raw.jobRole ?? {}) as JsonObject;
  const host = (raw.host ?? raw.hostUser ?? {}) as JsonObject;
  const id = number(raw.id ?? raw.roomId);
  const jobRoleId = number(raw.jobRoleId ?? jobRole.id);
  const matchedJobRole = jobRolesById?.get(jobRoleId);
  const current = number(raw.currentParticipants ?? raw.participantCount ?? raw.currentParticipantCount);
  const max = number(raw.maxParticipants, 4);
  return {
    id,
    roomId: String(raw.id ?? raw.roomId ?? ""),
    title: text(raw.title),
    category: text(raw.category ?? jobRole.category ?? matchedJobRole?.category, "기타"),
    role: text(raw.role ?? raw.jobRoleName ?? jobRole.name ?? matchedJobRole?.name),
    jobRoleId: jobRoleId || undefined,
    currentParticipants: current,
    maxParticipants: max,
    status: roomStatus(raw, current, max),
    startAt: text(raw.scheduledStartTime ?? raw.startAt),
    createdAt: text(raw.createdAt ?? raw.created_at) || undefined,
    hostName: text(raw.hostName ?? host.name, "방장"),
  };
}

function normalizeParticipant(value: unknown): GroupParticipant {
  const raw = (value ?? {}) as JsonObject;
  const user = (raw.user ?? {}) as JsonObject;
  return {
    id: number(raw.id) || undefined,
    userId: String(raw.userId ?? user.id ?? raw.id ?? ""),
    nickname: text(raw.nickname ?? raw.userName ?? raw.name ?? user.name, "참가자"),
    isHost: Boolean(raw.isHost ?? raw.host),
    isReady: text(raw.status).toUpperCase() === "READY" || Boolean(raw.isReady ?? raw.ready),
    cameraOn: raw.cameraOn !== false,
    micOn: raw.micOn !== false,
  };
}

function normalizeComparison(value: unknown): GroupInterviewComparison {
  const raw = (value ?? {}) as JsonObject;
  const status = text(raw.status).toUpperCase() === "PARTIAL" ? "PARTIAL" : "DONE";
  const scope = text(raw.scope).toUpperCase() === "QUESTION" ? "QUESTION" : "OVERALL";
  return {
    participantUserId: number(raw.participantUserId),
    participantName: nullableText(raw.participantName),
    scope,
    questionIndex: nullableNumber(raw.questionIndex),
    contentScore: nullableNumber(raw.contentScore),
    speechScore: nullableNumber(raw.speechScore),
    gazeScore: nullableNumber(raw.gazeScore),
    poseScore: nullableNumber(raw.poseScore),
    blinkScore: nullableNumber(raw.blinkScore),
    totalScore: nullableNumber(raw.totalScore),
    rank: nullableNumber(raw.rank),
    participantCount: number(raw.participantCount),
    strengthSummary: nullableText(raw.strengthSummary),
    improvementSummary: nullableText(raw.improvementSummary),
    status,
  };
}

export async function getGroupRooms(): Promise<GroupRoom[]> {
  const [data, jobRoles] = await Promise.all([
    fetch(GROUP_API).then(unwrap),
    getJobRoles(),
  ]);
  const jobRolesById = new Map(jobRoles.map((jobRole) => [jobRole.id, jobRole]));
  const list = Array.isArray(data) ? data : ((data as JsonObject)?.content ?? []);
  return (Array.isArray(list) ? list : [])
    .map((room) => normalizeRoom(room, jobRolesById))
    .sort((first, second) => {
      const firstCreatedAt = first.createdAt ? Date.parse(first.createdAt) : Number.NaN;
      const secondCreatedAt = second.createdAt ? Date.parse(second.createdAt) : Number.NaN;
      if (Number.isFinite(firstCreatedAt) && Number.isFinite(secondCreatedAt)) {
        return secondCreatedAt - firstCreatedAt;
      }
      return second.id - first.id;
    });
}

export async function getGroupRoom(roomId: string): Promise<GroupRoom> {
  return normalizeRoom(await unwrap(await authFetch(`${GROUP_API}/${encodeURIComponent(roomId)}`)));
}

export async function getGroupParticipants(roomId: string): Promise<GroupParticipant[]> {
  const data = await unwrap(await authFetch(`${GROUP_API}/${encodeURIComponent(roomId)}/participants`));
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

export async function setGroupReady(roomId: string, ready: boolean): Promise<GroupParticipant> {
  const response = await authFetch(`${GROUP_API}/${encodeURIComponent(roomId)}/ready`, {
    method: ready ? "POST" : "DELETE",
  });
  return normalizeParticipant(await unwrap(response));
}

export async function leaveGroupRoom(roomId: string): Promise<void> {
  await unwrap(await authFetch(
    `${GROUP_API}/${encodeURIComponent(roomId)}/participants/me`,
    { method: "DELETE" },
  ));
}

async function mutateSession(roomId: string, action: string): Promise<GroupInterviewProgress> {
  return (await unwrap(await authFetch(
    `${GROUP_API}/${encodeURIComponent(roomId)}/${action}`,
    { method: "POST" },
  ))) as GroupInterviewProgress;
}

export function startGroupInterview(roomId: string) {
  return mutateSession(roomId, "start");
}

export function startGroupAnswer(roomId: string) {
  return mutateSession(roomId, "answer/start");
}

export function completeGroupAnswer(roomId: string) {
  return mutateSession(roomId, "answer-complete");
}

export async function uploadGroupAnswerVideo(
  roomId: string,
  answerId: number,
  blob: Blob,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", blob, `group-answer-${answerId}.webm`);
  await unwrap(await authFetch(
    `${GROUP_API}/${encodeURIComponent(roomId)}/answers/${answerId}/video`,
    {
      method: "POST",
      body: formData,
    },
  ));
}

export async function getGroupAnswerAnalysis(
  roomId: string,
  answerId: number,
): Promise<GroupInterviewAnswerAnalysis> {
  const value = (await unwrap(await authFetch(
    `${GROUP_API}/${encodeURIComponent(roomId)}/answers/${answerId}/analysis`,
  ))) as JsonObject;
  return {
    ...value,
    answerId: number(value.answerId, answerId),
    status: text(value.status ?? value.analysisStatus) as GroupInterviewAnswerAnalysis["status"],
  } as GroupInterviewAnswerAnalysis;
}

export async function getGroupInterviewComparisons(
  roomId: string,
): Promise<GroupInterviewComparison[]> {
  const data = await unwrap(await authFetch(
    `${GROUP_API}/${encodeURIComponent(roomId)}/comparisons`,
  ));
  return Array.isArray(data) ? data.map(normalizeComparison) : [];
}

export async function getGroupInterviewQuestionComparisons(
  roomId: string,
  questionIndex: number,
): Promise<GroupInterviewComparison[]> {
  const data = await unwrap(await authFetch(
    `${GROUP_API}/${encodeURIComponent(roomId)}/comparisons/questions/${questionIndex}`,
  ));
  return Array.isArray(data) ? data.map(normalizeComparison) : [];
}

export async function retryGroupAnswerAnalysis(roomId: string, answerId: number): Promise<void> {
  const response = await authFetch(
    `${GROUP_API}/${encodeURIComponent(roomId)}/answers/${answerId}/analysis`,
    { method: "POST" },
  );
  if (!response.ok) await unwrap(response);
}

export async function getMyGroupInterviewHistory(): Promise<GroupInterviewHistory[]> {
  const data = await unwrap(await authFetch(`${GROUP_API}/me/history`));
  return Array.isArray(data) ? data as GroupInterviewHistory[] : [];
}

export async function getMyGroupInterviewAnswers(roomId: string): Promise<GroupInterviewMyAnswer[]> {
  const data = await unwrap(await authFetch(
    `${GROUP_API}/${encodeURIComponent(roomId)}/answers/me`,
  ));
  return Array.isArray(data) ? data as GroupInterviewMyAnswer[] : [];
}

export function finishGroupInterview(roomId: string) {
  return mutateSession(roomId, "finish");
}

export async function getGroupSession(roomId: string): Promise<GroupInterviewProgress | null> {
  const response = await authFetch(`${GROUP_API}/${encodeURIComponent(roomId)}/session`);
  // 면접 시작 전에는 백엔드가 아직 세션이 없다는 의미로 400 또는 404를 반환한다.
  if (response.status === 400 || response.status === 404) return null;
  return (await unwrap(response)) as GroupInterviewProgress;
}

export async function getLiveKitCredentials(roomId: string): Promise<LiveKitCredentials> {
  const data = (await unwrap(await authFetch(
    `${GROUP_API}/${encodeURIComponent(roomId)}/livekit-token`,
    { method: "POST" },
  ))) as Partial<LiveKitCredentials>;
  if (!data?.url || !data.token) throw new Error("LiveKit 연결 정보가 올바르지 않습니다.");
  return { url: data.url, token: data.token };
}
