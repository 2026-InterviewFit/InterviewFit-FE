// hooks/useDashboard.ts
"use client";

import { useState, useEffect, useMemo } from "react";
import { getInterviewReport } from "@/lib/api";
import { loadInterviewHistory } from "@/lib/reportUtils";
import {
  loadPtGroupRecords,
  deletePtGroupRecord,
  withRoundLabels,
  seedDemoIfEmpty,
  type UnifiedRecord,
  type InterviewKind,
} from "@/lib/interviewHistoryStore";
import type { DashboardRecord } from "@/types";
import type { TabKey } from "@/components/dashboard/InterviewTabs";

export function useDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // ── 데이터 상태 ──
  const [singleRecords, setSingleRecords] = useState<DashboardRecord[]>([]);
  const [ptGroupRecords, setPtGroupRecords] = useState<UnifiedRecord[]>([]);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  // 1. 1:1 면접 초기 로드 및 폴링
  useEffect(() => {
    const history = loadInterviewHistory();
    setSingleRecords(history);
    if (history.length === 0) return;

    let cancelled = false;
    Promise.all(
      history.map(async (record) => {
        try {
          const report = await getInterviewReport(record.interviewId);
          return { ...record, report };
        } catch (error) {
          return { ...record, reportError: error instanceof Error ? error.message : "조회 실패" };
        }
      })
    ).then((next) => { if (!cancelled) setSingleRecords(next); });
    
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (singleRecords.length === 0) return;
    const hasRunning = singleRecords.some(r => !r.report?.analysisStatus || r.report.analysisStatus === "RUNNING" || r.report.analysisStatus === "UPLOADED");
    if (!hasRunning) return;
    
    const interval = window.setInterval(async () => {
      const next = await Promise.all(
        singleRecords.map(async (record) => {
          const status = record.report?.analysisStatus;
          if (status === "DONE" || status === "FAILED") return record;
          try {
            const report = await getInterviewReport(record.interviewId);
            return { ...record, report, reportError: undefined };
          } catch {
            return { ...record, reportError: "조회 실패" };
          }
        })
      );
      setSingleRecords(next);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [singleRecords]);

  // 2. PT/그룹 초기 로드
  useEffect(() => {
    seedDemoIfEmpty();
    setPtGroupRecords(loadPtGroupRecords());
  }, []);

  // 3. 통계 및 정렬 연산
  const counts = useMemo(() => {
    return {
      all: singleRecords.length + ptGroupRecords.length,
      single: singleRecords.length,
      group: ptGroupRecords.filter(r => r.kind === "group").length,
      pt: ptGroupRecords.filter(r => r.kind === "pt").length,
    } as Record<TabKey, number>;
  }, [singleRecords, ptGroupRecords]);

  const sortedSingle = useMemo(() => {
    return [...singleRecords].sort((a, b) => {
      const t1 = new Date(a.savedAt ?? 0).getTime();
      const t2 = new Date(b.savedAt ?? 0).getTime();
      return sortOrder === "desc" ? t2 - t1 : t1 - t2;
    });
  }, [singleRecords, sortOrder]);

  const sortedPtGroup = useMemo(() => {
    const withRounds = withRoundLabels(ptGroupRecords);
    const filtered = activeTab === "all" ? withRounds : withRounds.filter(r => r.kind === activeTab);
    return filtered.sort((a, b) => {
      const t1 = new Date(a.savedAt).getTime();
      const t2 = new Date(b.savedAt).getTime();
      return sortOrder === "desc" ? t2 - t1 : t1 - t2;
    });
  }, [ptGroupRecords, activeTab, sortOrder]);

  // 4. 체크 및 삭제 액션
  const toggleCheck = (id: string) => {
    setCheckedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`선택한 ${checkedIds.length}개의 기록을 삭제하시겠습니까?`)) return;

    const remainingSingle = singleRecords.filter(r => !checkedIds.includes(String(r.interviewId)));
    if (remainingSingle.length !== singleRecords.length) {
      setSingleRecords(remainingSingle);
      localStorage.setItem("interviewAnalysisHistory", JSON.stringify(remainingSingle));
    }

    let ptGroupChanged = false;
    checkedIds.forEach(id => {
      const record = ptGroupRecords.find(r => r.id === id);
      if (record && (record.kind === "group" || record.kind === "pt")) {
        deletePtGroupRecord(record.kind, id);
        ptGroupChanged = true;
      }
    });
    
    if (ptGroupChanged) setPtGroupRecords(loadPtGroupRecords());
    setCheckedIds([]);
  };

  const deleteSingle = (id: number) => {
    const next = singleRecords.filter(r => r.interviewId !== id);
    setSingleRecords(next);
    localStorage.setItem("interviewAnalysisHistory", JSON.stringify(next));
  };

  const deletePtGroup = (kind: InterviewKind, id: string) => {
    if (kind !== "group" && kind !== "pt") {
      return;
    }

    deletePtGroupRecord(kind, id);
    setPtGroupRecords(loadPtGroupRecords());
  };

  return {
    activeTab, setActiveTab,
    sortOrder, setSortOrder,
    checkedIds, toggleCheck, handleBulkDelete,
    counts, sortedSingle, sortedPtGroup,
    showSingle: activeTab === "all" || activeTab === "single",
    showPtGroup: activeTab === "all" || activeTab === "group" || activeTab === "pt",
    deleteSingle, deletePtGroup,
    singleRecords // 회차 계산용
  };
}