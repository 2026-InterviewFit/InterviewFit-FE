// lib/interviewHistoryStore.ts
"use client";

import { MOCK_PT_REPORT } from "@/lib/ptInterviewData";

export type InterviewKind = "single" | "group" | "pt";

export interface UnifiedRecord {
  id: string;
  kind: InterviewKind;
  title: string;
  jobName: string;
  overallScore: number;
  savedAt: string;
  detail?: unknown;
}

const PT_HISTORY_KEY = "ptInterviewHistory";

// ── 저장 (PT/그룹만) ──
export function saveRecord(kind: "pt", record: Omit<UnifiedRecord, "kind">) {
  if (typeof window === "undefined") return;
  const prevRaw = localStorage.getItem(PT_HISTORY_KEY);
  let list: UnifiedRecord[] = [];
  try {
    if (prevRaw) {
      const parsed = JSON.parse(prevRaw);
      if (Array.isArray(parsed)) list = parsed;
    }
  } catch {}
  list.unshift({ ...record, kind });
  localStorage.setItem(PT_HISTORY_KEY, JSON.stringify(list));
}

function loadPtRecords(): UnifiedRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(PT_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((r: UnifiedRecord, idx: number) => ({
      id: String(r.id ?? `pt_${idx}`),
      kind: "pt",
      title: r.title ?? "저장된 면접 기록",
      jobName: r.jobName ?? "직무 미지정",
      overallScore: typeof r.overallScore === "number" ? r.overallScore : 0,
      savedAt: r.savedAt ?? new Date(0).toISOString(),
      detail: r.detail,
    }));
  } catch {
    return [];
  }
}

// ── PT + 그룹만 조회 (1:1은 기존 로직이 담당) ──
export function loadPtGroupRecords(): UnifiedRecord[] {
  // 그룹 기록은 백엔드 /me/history가 source of truth다. 이 저장소는 PT만 담당한다.
  const all = loadPtRecords();
  const seen = new Set<string>();
  const unique = all.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
  return unique.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export function deletePtGroupRecord(id: string) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(PT_HISTORY_KEY);
  if (!raw) return;
  try {
    const list: UnifiedRecord[] = JSON.parse(raw);
    localStorage.setItem(PT_HISTORY_KEY, JSON.stringify(list.filter((r) => r.id !== id)));
  } catch {}
}

// ── 회차 라벨 (종류별로 오래된 순 1회차) ──
export function withRoundLabels(records: UnifiedRecord[]): (UnifiedRecord & { round: number; roundLabel: string })[] {
  const byKind: Record<string, UnifiedRecord[]> = {};
  records.forEach((r) => { (byKind[r.kind] ??= []).push(r); });
  const roundMap = new Map<string, number>();
  Object.values(byKind).forEach((list) => {
    [...list].sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime())
      .forEach((r, i) => roundMap.set(r.id, i + 1));
  });
  return records.map((r) => {
    const round = roundMap.get(r.id) ?? 1;
    return { ...r, round, roundLabel: `${round}회차` };
  });
}

// ── 데모 시드 (PT/그룹만) ──
export function seedDemoIfEmpty() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("ptGroupDemoSeeded") === "1") return;
  const now = Date.now();
  const day = 86400000;

  if (!localStorage.getItem(PT_HISTORY_KEY)) {
    localStorage.setItem(PT_HISTORY_KEY, JSON.stringify([
      { id: "pt_seed_3", kind: "pt", title: "데이터 파이프라인 설계 발표", jobName: "데이터분석", overallScore: 88, savedAt: new Date(now - day).toISOString(), detail: MOCK_PT_REPORT },
      { id: "pt_seed_2", kind: "pt", title: "신규 서비스 제안 발표", jobName: "백엔드", overallScore: 79, savedAt: new Date(now - day * 5).toISOString(), detail: MOCK_PT_REPORT },
      { id: "pt_seed_1", kind: "pt", title: "AI 모의면접 플랫폼 소개", jobName: "프론트엔드", overallScore: 84, savedAt: new Date(now - day * 12).toISOString(), detail: MOCK_PT_REPORT },
    ]));
  }
  
  localStorage.setItem("ptGroupDemoSeeded", "1");
}
