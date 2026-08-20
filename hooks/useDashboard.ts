// hooks/useDashboard.ts
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getInterviewReport } from "@/lib/api";
import { getMyGroupInterviewHistory, GroupInterviewApiError } from "@/lib/groupInterviewApi";
import { loadInterviewHistory } from "@/lib/reportUtils";
import {
  loadPtGroupRecords,
  deletePtGroupRecord,
  withRoundLabels,
  seedDemoIfEmpty,
  type UnifiedRecord,
} from "@/lib/interviewHistoryStore";
import type { DashboardRecord } from "@/types";
import type { GroupInterviewHistory } from "@/types/groupInterview";
import type { TabKey } from "@/components/dashboard/InterviewTabs";

export function useDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // ── 데이터 상태 ──
  const [singleRecords, setSingleRecords] = useState<DashboardRecord[]>([]);
  const [ptGroupRecords, setPtGroupRecords] = useState<UnifiedRecord[]>([]);
  const [groupRecords, setGroupRecords] = useState<GroupInterviewHistory[]>([]);
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [groupError, setGroupError] = useState("");
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  // 1. 1:1 면접 초기 로드 및 폴링
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const history = loadInterviewHistory();
      if (cancelled) return;
      setSingleRecords(history);
      if (history.length === 0) return;
      void Promise.all(
        history.map(async (record) => {
          try {
            const report = await getInterviewReport(record.interviewId);
            return { ...record, report };
          } catch (error) {
            return { ...record, reportError: error instanceof Error ? error.message : "조회 실패" };
          }
        })
      ).then((next) => { if (!cancelled) setSingleRecords(next); });
    }, 0);
    
    return () => { cancelled = true; window.clearTimeout(timer); };
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
    const timer = window.setTimeout(() => {
      seedDemoIfEmpty();
      setPtGroupRecords(loadPtGroupRecords());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getMyGroupInterviewHistory()
      .then((records) => {
        if (!cancelled) setGroupRecords(records);
      })
      .catch((cause) => {
        if (cancelled) return;
        if (cause instanceof GroupInterviewApiError && cause.status === 401) {
          router.replace("/login");
          return;
        }
        setGroupError(cause instanceof Error ? cause.message : "그룹 면접 기록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setIsGroupLoading(false);
      });
    return () => { cancelled = true; };
  }, [router]);

  const hasPendingGroupAnalysis = groupRecords.some((record) =>
    ["WAITING", "UPLOADED", "RUNNING"].includes(record.analysisStatus),
  );

  useEffect(() => {
    if (!hasPendingGroupAnalysis) return;
    let cancelled = false;
    const interval = window.setInterval(() => {
      void getMyGroupInterviewHistory()
        .then((records) => {
          if (cancelled) return;
          setGroupRecords(records);
          setGroupError("");
        })
        .catch((cause) => {
          if (cancelled) return;
          if (cause instanceof GroupInterviewApiError && cause.status === 401) {
            router.replace("/login");
            return;
          }
          setGroupError(cause instanceof Error ? cause.message : "그룹 면접 분석 상태를 확인하지 못했습니다.");
        });
    }, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [hasPendingGroupAnalysis, router]);

  // 3. 통계 및 정렬 연산
  const counts = useMemo(() => {
    return {
      all: singleRecords.length + ptGroupRecords.length + groupRecords.length,
      single: singleRecords.length,
      group: groupRecords.length,
      pt: ptGroupRecords.filter(r => r.kind === "pt").length,
    } as Record<TabKey, number>;
  }, [groupRecords, singleRecords, ptGroupRecords]);

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

  const sortedGroup = useMemo(() => [...groupRecords].sort((a, b) => {
    const first = new Date(a.endedAt ?? a.startedAt ?? 0).getTime();
    const second = new Date(b.endedAt ?? b.startedAt ?? 0).getTime();
    return sortOrder === "desc" ? second - first : first - second;
  }), [groupRecords, sortOrder]);

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

    let ptChanged = false;
    checkedIds.forEach((id) => {
  const record = ptGroupRecords.find((r) => r.id === id);

  if (record?.kind === "pt") {
    deletePtGroupRecord(id);
    ptChanged = true;
  }
});
    
    if (ptChanged) setPtGroupRecords(loadPtGroupRecords());
    setCheckedIds([]);
  };

  const deleteSingle = (id: number) => {
    const next = singleRecords.filter(r => r.interviewId !== id);
    setSingleRecords(next);
    localStorage.setItem("interviewAnalysisHistory", JSON.stringify(next));
  };

  const deletePtGroup = (id: string) => {
  deletePtGroupRecord(id);
  setPtGroupRecords(loadPtGroupRecords());
};

  return {
    activeTab, setActiveTab,
    sortOrder, setSortOrder,
    checkedIds, toggleCheck, handleBulkDelete,
    counts, sortedSingle, sortedPtGroup,
    showSingle: activeTab === "all" || activeTab === "single",
    showPt: activeTab === "all" || activeTab === "pt",
    showGroup: activeTab === "all" || activeTab === "group",
    sortedGroup, isGroupLoading, groupError,
    deleteSingle, deletePtGroup,
    singleRecords // 회차 계산용
  };
}
