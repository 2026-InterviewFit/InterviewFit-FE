// lib/interviewHistoryStore.ts
"use client";

import { MOCK_PT_REPORT } from "@/lib/ptInterviewData";
import { MOCK_GROUP_REPORT } from "@/lib/groupInterviewData";

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

const KIND_KEYS: Record<Exclude<InterviewKind, "single">, string> = {
  group: "groupInterviewHistory",
  pt: "ptInterviewHistory",
};

// ── 저장 (PT/그룹만) ──
export function saveRecord(kind: "group" | "pt", record: Omit<UnifiedRecord, "kind">) {
  if (typeof window === "undefined") return;
  const key = KIND_KEYS[kind];
  const prevRaw = localStorage.getItem(key);
  let list: UnifiedRecord[] = [];
  try {
    if (prevRaw) {
      const parsed = JSON.parse(prevRaw);
      if (Array.isArray(parsed)) list = parsed;
    }
  } catch {}
  list.unshift({ ...record, kind });
  localStorage.setItem(key, JSON.stringify(list));
}

function loadKind(kind: "group" | "pt"): UnifiedRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KIND_KEYS[kind]);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((r: UnifiedRecord, idx: number) => ({
      id: String(r.id ?? `${kind}_${idx}`),
      kind: r.kind ?? kind,
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
  const all = [...loadKind("group"), ...loadKind("pt")];
  const seen = new Set<string>();
  const unique = all.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
  return unique.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export function deletePtGroupRecord(kind: "group" | "pt", id: string) {
  if (typeof window === "undefined") return;
  const key = KIND_KEYS[kind];
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const list: UnifiedRecord[] = JSON.parse(raw);
    localStorage.setItem(key, JSON.stringify(list.filter((r) => r.id !== id)));
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

  if (!localStorage.getItem(KIND_KEYS.pt)) {
    localStorage.setItem(KIND_KEYS.pt, JSON.stringify([
      { id: "pt_seed_3", kind: "pt", title: "데이터 파이프라인 설계 발표", jobName: "데이터분석", overallScore: 88, savedAt: new Date(now - day).toISOString(), detail: MOCK_PT_REPORT },
      { id: "pt_seed_2", kind: "pt", title: "신규 서비스 제안 발표", jobName: "백엔드", overallScore: 79, savedAt: new Date(now - day * 5).toISOString(), detail: MOCK_PT_REPORT },
      { id: "pt_seed_1", kind: "pt", title: "AI 모의면접 플랫폼 소개", jobName: "프론트엔드", overallScore: 84, savedAt: new Date(now - day * 12).toISOString(), detail: MOCK_PT_REPORT },
    ]));
  }
  
  if (!localStorage.getItem(KIND_KEYS.group)) {
    localStorage.setItem(KIND_KEYS.group, JSON.stringify([
      { 
        id: "grp_seed_2", kind: "group", title: "백엔드 3인 그룹 면접", jobName: "백엔드", 
        overallScore: 87, savedAt: new Date(now - day * 3).toISOString(),
        detail: MOCK_GROUP_REPORT
      },
      { 
        id: "grp_seed_1", kind: "group", title: "IT 직무 공통 그룹 면접", jobName: "프론트엔드", 
        overallScore: 77, savedAt: new Date(now - day * 8).toISOString() 
      },
    ]));
  }
  localStorage.setItem("ptGroupDemoSeeded", "1");
}