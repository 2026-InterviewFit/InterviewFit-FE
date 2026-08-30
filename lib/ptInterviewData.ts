// lib/ptInterviewData.ts
import type {
  DocumentAnalysisStatus,
  Slide,
  DocumentSummary,
  PtQuestion,
  QuestionType,
  PtReport,
} from "@/types/ptInterview";
import { PALETTE } from "@/lib/communityData";

// 🔑 job_role 테이블과 1:1로 맞춘 직무 (커뮤니티/설정 화면과 동일 구조)
export const PT_JOB_CATEGORIES: { category: string; roles: string[] }[] = [
  { category: "IT/개발", roles: ["프론트엔드", "백엔드", "AI", "데이터분석"] },
  { category: "비즈니스", roles: ["마케팅", "인사", "재무·회계"] },
  { category: "디자인", roles: ["UX/UI 디자이너", "영상 제작", "그래픽 디자이너"] },
];

// 세부 직무만 평평하게 뽑은 리스트
export const PT_ALL_ROLES: string[] = PT_JOB_CATEGORIES.flatMap((c) => c.roles);

// 준비 시간 / 발표 제한 시간 옵션 (분 단위 → 초 변환은 store에서)
export const PREP_MINUTE_OPTIONS = [1, 3, 5] as const;
export const LIMIT_MINUTE_OPTIONS = [3, 5, 7, 10] as const;

export const ACCEPTED_DOC_TYPES = [".ppt", ".pptx", ".pdf"];

// ── 상태 배지 메타 (커뮤니티 팔레트 통일) ─────────────────
export const docStatusMeta = (
  status: DocumentAnalysisStatus
): { label: string; bg: string; fg: string; dot: string } => {
  switch (status) {
    case "UPLOADED":
      return { label: "업로드 완료", bg: "rgba(149,177,238,0.18)", fg: PALETTE.navy, dot: PALETTE.sky };
    case "EXTRACTING":
      return { label: "텍스트 추출 중", bg: "rgba(149,177,238,0.18)", fg: PALETTE.navy, dot: PALETTE.sky };
    case "ANALYZING":
      return { label: "슬라이드 분석 중", bg: "rgba(231,241,168,0.5)", fg: PALETTE.limeInk, dot: PALETTE.lime };
    case "DONE":
      return { label: "분석 완료", bg: PALETTE.navy, fg: PALETTE.cream, dot: PALETTE.cream };
    case "FAILED":
    default:
      return { label: "분석 실패", bg: "rgba(239,68,68,0.12)", fg: "#dc2626", dot: "#ef4444" };
  }
};

// 분석 단계 순서 (2번 스텝퍼)
export const DOC_STEPS: { key: DocumentAnalysisStatus; label: string }[] = [
  { key: "UPLOADED", label: "업로드 완료" },
  { key: "EXTRACTING", label: "텍스트 추출" },
  { key: "ANALYZING", label: "슬라이드 분석" },
  { key: "DONE", label: "분석 완료" },
];

// 질문 유형 메타
export const questionTypeMeta = (
  type: QuestionType
): { label: string; bg: string; fg: string } => {
  switch (type) {
    case "content":
      return { label: "발표 내용 확인", bg: "rgba(149,177,238,0.18)", fg: PALETTE.navy };
    case "job":
      return { label: "직무 연계", bg: "rgba(231,241,168,0.5)", fg: PALETTE.limeInk };
    case "problem":
      return { label: "문제 해결", bg: "rgba(54,76,132,0.1)", fg: PALETTE.navy };
    case "followup":
      return { label: "꼬리질문", bg: "rgba(239,68,68,0.1)", fg: "#dc2626" };
    case "rebuttal":
    default:
      return { label: "반박 질문", bg: "rgba(168,85,247,0.12)", fg: "#7c3aed" };
  }
};

// 초 → "MM:SS"
export const formatSeconds = (total: number): string => {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = Math.floor(total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// 파일 용량 표시
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// ── Mock 데이터 ──────────────────────────────────────────
export const MOCK_SLIDES: Slide[] = [
  {
    slideNumber: 1,
    title: "프로젝트 개요 · InterviewFit",
    body: "AI 기반 모의면접 플랫폼의 문제 정의와 목표를 소개합니다.",
    aiSummary: "발표의 도입부. 서비스가 해결하려는 취업준비생의 페인포인트를 명확히 제시.",
  },
  {
    slideNumber: 2,
    title: "시장 현황 및 문제 정의",
    body: "기존 면접 준비 방식의 한계와 피드백 부재 문제를 데이터로 설명합니다.",
    aiSummary: "정량 지표로 문제의 심각성을 뒷받침. 예상 질문: 데이터 출처와 신뢰도.",
  },
  {
    slideNumber: 3,
    title: "핵심 기능 아키텍처",
    body: "시선·음성·자세 분석 파이프라인과 AI 질의응답 생성 구조를 도식화했습니다.",
    aiSummary: "기술 핵심 슬라이드. 직무 연계 질문이 집중될 구간.",
  },
  {
    slideNumber: 4,
    title: "차별화 포인트",
    body: "실시간 WebRTC 그룹 면접과 집단지성 위키를 경쟁 서비스와 비교합니다.",
    aiSummary: "경쟁 우위 강조. 반박 질문(진짜 차별화인가?)에 대비 필요.",
  },
  {
    slideNumber: 5,
    title: "성과 및 지표",
    body: "베타 테스트 사용자 만족도와 재사용률, 합격률 개선 수치를 제시합니다.",
    aiSummary: "결과(Result) 파트. STAR의 R에 해당. 근거 제시 수준이 평가 대상.",
  },
  {
    slideNumber: 6,
    title: "향후 로드맵 · Q&A",
    body: "다음 분기 개발 계획과 확장 방향을 정리하며 발표를 마무리합니다.",
    aiSummary: "마무리 슬라이드. 발표 흐름을 매끄럽게 닫는지 전달력 평가.",
  },
];

export const MOCK_DOC_SUMMARY: DocumentSummary = {
  coreTopic: "AI 기반 모의면접 플랫폼의 문제 정의부터 성과까지를 아우르는 서비스 소개 발표",
  keywords: ["AI 면접", "WebRTC", "시선·자세 분석", "집단지성", "차별화", "성과 지표"],
  flow: ["문제 정의", "시장 현황", "핵심 기술", "차별화", "성과", "로드맵"],
  expectedQuestionAreas: [
    "슬라이드 3의 분석 파이프라인 정확도",
    "슬라이드 4 차별화의 실제 진입장벽",
    "슬라이드 5 지표의 측정 방법",
  ],
};

export const MOCK_PT_QUESTIONS: PtQuestion[] = [
  {
    id: "q1",
    order: 1,
    type: "content",
    text: "발표에서 언급하신 시선·자세 분석 파이프라인이 실제로 어떤 데이터를 입력받아 동작하는지 설명해 주시겠어요?",
    relatedSlide: 3,
    relatedSlideSummary: "시선·음성·자세 분석 파이프라인 도식",
  },
  {
    id: "q2",
    order: 2,
    type: "job",
    text: "해당 직무 관점에서 실시간 분석 트래픽이 몰릴 때 어떤 방식으로 확장성을 확보하실 계획인가요?",
    relatedSlide: 3,
    relatedSlideSummary: "핵심 기능 아키텍처",
  },
  {
    id: "q3",
    order: 3,
    type: "problem",
    text: "베타 테스트에서 합격률이 개선됐다고 하셨는데, 표본 편향 문제는 어떻게 통제하셨나요?",
    relatedSlide: 5,
    relatedSlideSummary: "성과 및 지표",
  },
  {
    id: "q4",
    order: 4,
    type: "rebuttal",
    text: "경쟁 서비스도 유사한 화상 면접 기능이 있는데, 이것을 진정한 차별화라고 볼 수 있을까요?",
    relatedSlide: 4,
    relatedSlideSummary: "차별화 포인트",
  },
  {
    id: "q5",
    order: 5,
    type: "followup",
    text: "방금 말씀하신 확장 전략에서, 비용 최적화는 어느 시점부터 고려하실 생각인가요?",
    relatedSlide: 3,
    relatedSlideSummary: "핵심 기능 아키텍처",
  },
];

export const MOCK_PT_REPORT: PtReport = {
  score: { overall: 84, presentation: 86, qna: 81, nonverbal: 88, content: 82 },
  radar: [
    { label: "발표 구조", score: 88 },
    { label: "논리성", score: 82 },
    { label: "전달력", score: 85 },
    { label: "질의응답", score: 81 },
    { label: "비언어", score: 90 },
  ],
  presentation: [
    { label: "발표 구조", score: 88 },
    { label: "논리성", score: 82 },
    { label: "핵심 전달력", score: 85 },
    { label: "슬라이드 활용도", score: 79 },
    { label: "시간 배분", score: 90 },
    { label: "주제 이해도", score: 86 },
  ],
  speech: [
    { label: "말하기 속도", value: "3.6자/초" },
    { label: "침묵 시간", value: "12.4초", warning: true },
    { label: "반복 표현", value: "4회" },
    { label: "필러 사용", value: "9회", warning: true },
    { label: "발음·전달력", value: "우수" },
    { label: "목소리 크기", value: "안정" },
  ],
  nonverbal: [
    { label: "시선 정면 유지율", value: "78%" },
    { label: "시선 이탈 횟수", value: "11회", warning: true },
    { label: "자세 안정성", value: "89%" },
    { label: "머리·몸 움직임", value: "적음" },
    { label: "발표 집중도", value: "높음" },
  ],
  qna: [
    { label: "질문 이해도", score: 85 },
    { label: "답변 정확성", score: 80 },
    { label: "답변 논리성", score: 82 },
    { label: "근거 제시", score: 76 },
    { label: "꼬리질문 대응", score: 79 },
    { label: "직무 연계성", score: 84 },
  ],
  feedback: {
    good: [
      "발표 전체 흐름이 문제→해결→성과 구조로 매끄럽게 이어졌습니다.",
      "시간 배분이 안정적이었고 자세 안정성이 높았습니다.",
    ],
    improve: [
      "슬라이드 5의 지표에서 측정 방법에 대한 근거 제시가 부족했습니다.",
      "필러(음, 어)와 침묵 구간이 다소 잦았습니다.",
    ],
    nextAction: [
      "핵심 수치를 말할 때 근거를 한 문장으로 덧붙이는 연습을 해보세요.",
      "슬라이드 전환 시 1초의 침묵을 의도적으로 활용해 필러를 줄여보세요.",
    ],
  },
  timeline: [
    { atSeconds: 42, type: "gaze", label: "시선 이탈" },
    { atSeconds: 118, type: "silence", label: "긴 침묵" },
    { atSeconds: 160, type: "pace", label: "말 속도 빨라짐" },
    { atSeconds: 205, type: "posture", label: "자세 불안정" },
  ],
};