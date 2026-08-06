// lib/groupInterviewData.ts
import { PALETTE } from "@/lib/communityData";
import type { GroupRoom, RoomStatus } from "@/types/groupInterview";

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

// 백엔드 미가동 시 폴백용 mock 방 목록
export const MOCK_GROUP_ROOMS: GroupRoom[] = [
  { roomId: "room_001", title: "네카라쿠배 백엔드 최종 면접 대비", category: "IT/개발", role: "백엔드", currentParticipants: 3, maxParticipants: 4, status: "almostFull", startAt: "2026-07-28T21:00", hostName: "취뽀가즈아" },
  { roomId: "room_002", title: "프론트엔드 신입 모의면접 같이해요", category: "IT/개발", role: "프론트엔드", currentParticipants: 2, maxParticipants: 4, status: "recruiting", startAt: "2026-07-28T20:00", hostName: "리액트여신" },
  { roomId: "room_003", title: "은행권 하반기 공채 대비방", category: "금융권", role: "일반행원", currentParticipants: 4, maxParticipants: 4, status: "full", startAt: "2026-07-27T19:30", hostName: "금융치트키" },
{ roomId: "room_004", title: "퍼포먼스 마케터 실전 면접", category: "마케팅", role: "퍼포먼스 마케팅", currentParticipants: 1, maxParticipants: 4, status: "recruiting", startAt: "2026-07-29T18:00", hostName: "그로스해커" },
{ roomId: "room_005", title: "UX/UI 포트폴리오 면접 스터디", category: "디자인", role: "UX/UI 디자이너", currentParticipants: 3, maxParticipants: 4, status: "recruiting", startAt: "2026-07-29T14:00", hostName: "픽셀장인" },
  { roomId: "room_006", title: "AI·데이터 직무 압박면접방", category: "IT/개발", role: "데이터분석", currentParticipants: 2, maxParticipants: 4, status: "recruiting", startAt: "2026-07-30T21:00", hostName: "데이터요정" },
];


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

export const MOCK_GROUP_REPORT: GroupReport = {
  score: { overall: 87, speech: 85, nonverbal: 82, content: 90, attitude: 92 },
  participants: [
    { name: "면접마스터", isMe: false, overall: 94, rank: 1 },
    { name: "김은재", isMe: true, overall: 87, rank: 2 },
    { name: "프론트장인", isMe: false, overall: 82, rank: 3 },
    { name: "스프링깎는노인", isMe: false, overall: 75, rank: 4 },
  ],
  perQuestion: [
    {
      question: "본인이 주도적으로 갈등을 해결했던 경험을 말씀해주세요.",
      myAnswerSummary: "의견 대립 상황에서 데이터 기반으로 중재안을 제시하여 해결함",
      score: 90,
      aiComment: "STAR 구조가 명확하며 객관적인 근거(데이터)를 활용한 점이 매우 훌륭합니다.",
    },
    {
      question: "협업 시 다른 사람의 코드를 리뷰할 때 가장 중요하게 보는 것은?",
      myAnswerSummary: "가독성과 유지보수성을 중시하며, 비판보다는 제안 위주로 리뷰함",
      score: 85,
      aiComment: "태도적인 측면은 좋으나, 실제 적용했던 코드 컨벤션 등 구체적 사례가 추가되면 더 좋겠습니다.",
    },
  ],
  radar: [
    { label: "논리성", score: 90 },
    { label: "전달력", score: 85 },
    { label: "비언어", score: 82 },
    { label: "경청 태도", score: 92 },
    { label: "직무 적합", score: 88 },
  ],
  feedback: {
    good: [
      "다른 지원자가 답변할 때 고개를 끄덕이는 등 경청 태도가 매우 우수합니다.",
      "질문의 핵심을 파악하고 두괄식으로 명확하게 답변했습니다.",
    ],
    improve: [
      "일부 답변에서 시선이 카메라가 아닌 화면 아래를 향하는 경향이 있습니다.",
      "긴장했을 때 말끝을 흐리는 습관이 관찰되었습니다.",
    ],
    nextAction: [
      "답변을 마무리할 때 의식적으로 목소리 톤을 유지하는 연습을 해보세요.",
      "모니터 높이를 눈높이에 맞춰 시선이 자연스럽게 카메라를 향하도록 세팅하세요.",
    ],
  },
};