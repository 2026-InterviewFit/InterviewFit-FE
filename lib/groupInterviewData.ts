// lib/groupInterviewData.ts
import { PALETTE } from "@/lib/communityData";
import type { RoomStatus } from "@/types/groupInterview";

// 그룹 면접 직군 카테고리 (설계서 기준: IT, 금융권, 마케팅 등)
export const GROUP_CATEGORIES: string[] = ["IT/개발", "금융권", "마케팅", "디자인"];

export const GROUP_INTERVIEW_QUESTIONS: string[] = [
  "먼저 간단한 자기소개와 이 직무에 지원하신 동기를 말씀해 주세요.",
  "본인의 가장 큰 강점과, 그것을 실제로 발휘했던 경험을 구체적으로 설명해 주세요.",
  "팀 프로젝트에서 의견 충돌이 있었을 때 어떻게 조율했는지 말씀해 주세요.",
  "지원하신 직무에서 가장 중요하다고 생각하는 역량은 무엇이며, 그 이유는 무엇인가요?",
  "마지막으로 입사 후 이루고 싶은 목표 한 가지를 말씀해 주세요.",
];

// 상태 배지 메타 (커뮤니티 팔레트로 통일)
export const statusMeta = (
  status: RoomStatus
): { label: string; bg: string; fg: string; dot: string } => {
  switch (status) {
    case "recruiting":
      return { label: "모집중", bg: "rgba(149,177,238,0.18)", fg: PALETTE.navy, dot: PALETTE.sky };
    case "almostFull":
      return { label: "마감임박", bg: "rgba(231,241,168,0.5)", fg: PALETTE.limeInk, dot: PALETTE.lime };
    case "full":
      return { label: "모집완료", bg: PALETTE.navy, fg: PALETTE.cream, dot: PALETTE.cream };
    case "live":
      return { label: "진행중", bg: "rgba(239,68,68,0.12)", fg: "#dc2626", dot: "#ef4444" };
    case "finished":
    default:
      return { label: "종료", bg: "#E2E8F0", fg: "#64748B", dot: "#94a3b8" };
  }
};

// "YYYY-MM-DDTHH:mm" 문자열을 하이드레이션 안전하게 표시용으로 변환
// (Date 객체 대신 문자열 파싱 → 서버/클라 렌더 결과가 항상 동일)
export const formatStartTime = (iso: string): string => {
  const m = iso.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return iso;
  const [, , month, day, hour, minute] = m;
  const h = Number(hour);
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${Number(month)}/${Number(day)} ${ampm} ${h12}:${minute}`;
};

// lib/groupInterviewData.ts (하단에 추가)

export interface GroupReportParticipant {
  name: string;
  isMe: boolean;
  overall: number;
  rank: number;
}

export interface GroupReportQuestion {
  question: string;
  myAnswerSummary: string;
  score: number;
  aiComment: string;
}

export interface GroupReport {
  score: {
    overall: number;
    speech: number;
    nonverbal: number;
    content: number;
    attitude: number; // 그룹 면접 특유: 경청 태도
  };
  participants: GroupReportParticipant[];
  perQuestion: GroupReportQuestion[];
  radar: { label: string; score: number }[];
  feedback: {
    good: string[];
    improve: string[];
    nextAction: string[];
  };
}
