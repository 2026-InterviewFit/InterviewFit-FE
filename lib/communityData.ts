// lib/communityData.ts

// 🔑 실제 job_role 테이블과 1:1로 맞춘 직무 상수 (모든 커뮤니티 화면이 이걸 공유)
export const JOB_CATEGORIES: { category: string; roles: string[] }[] = [
  { category: "IT/개발", roles: ["프론트엔드", "백엔드", "AI", "데이터분석"] },
  { category: "비즈니스", roles: ["마케팅", "인사", "재무·회계"] },
  { category: "디자인", roles: ["UX/UI 디자이너", "영상 제작", "그래픽 디자이너"] },
];

// 세부 직무만 평평하게 뽑은 리스트 (위키 필터 등에서 사용)
export const ALL_ROLES: string[] = JOB_CATEGORIES.flatMap((c) => c.roles);

export type WikiQuestion = {
  id: string;
  companyName: string;
  tier: "대기업" | "중견기업" | "중소기업" | "스타트업";
  role: string;
  text: string;
  date: string;
  verifiedCount: number;
};

export type BestAnswer = {
  id: number;
  category: string; // 세부 직무명 (예: "프론트엔드", "UX/UI 디자이너")
  company: string;
  role: string;
  score: number;
  author: string;
  script: string;
};

export type Ranker = {
  id: string;
  rank: number;
  name: string;
  score: number;
  tier: string;
  metricType: string;
  metricValue: string;
  script: string;
};

export const MOCK_RANKINGS: Record<string, Ranker[]> = {
  score: [
    { id: "user_001", rank: 1, name: "프론트엔드마스터", score: 98, tier: "Challenger", metricType: "score", metricValue: "종합 98점", script: "저는 네이버 인턴십 당시 React 렌더링 최적화를 주도하여 성능을 30% 개선했습니다." },
    { id: "user_002", rank: 2, name: "새벽형인간", score: 95, tier: "Grandmaster", metricType: "score", metricValue: "종합 95점", script: "STAR 기법을 활용해 서비스 장애 대응 과정을 구조화하여 설명했습니다." },
    { id: "user_003", rank: 3, name: "취뽀가즈아", score: 92, tier: "Master", metricType: "score", metricValue: "종합 92점", script: "빠른 기술 습득 능력을 바탕으로 2주 만에 신규 아키텍처를 도입했습니다." },
    { id: "user_004", rank: 4, name: "코드비행기", score: 90, tier: "Diamond", metricType: "score", metricValue: "종합 90점", script: "TypeScript 전환 과정에서의 타입 안정성 확보 경험을 공유합니다." },
    { id: "user_005", rank: 5, name: "알고리즘도깨비", score: 89, tier: "Diamond", metricType: "score", metricValue: "종합 89점", script: "대규모 트래픽 분산을 위한 Redis 캐싱 전략을 설명했습니다." },
    { id: "user_006", rank: 6, name: "디자인웨이브", score: 88, tier: "Platinum", metricType: "score", metricValue: "종합 88점", script: "데이터 기반 UX 의사결정 프로세스를 피그마와 연동하여 발표했습니다." },
    { id: "user_007", rank: 7, name: "백엔드루키", score: 87, tier: "Platinum", metricType: "score", metricValue: "종합 87점", script: "Spring Boot 비동기 처리 도입을 통한 응답 속도 단축 경험입니다." },
    { id: "user_008", rank: 8, name: "모의면접왕", score: 86, tier: "Gold", metricType: "score", metricValue: "종합 86점", script: "협업 갈등 상황에서 중재자 역할을 맡아 프로젝트를 완수한 사례입니다." },
    { id: "user_009", rank: 9, name: "면접프리패스", score: 85, tier: "Gold", metricType: "score", metricValue: "종합 85점", script: "오픈소스 기여 경험과 코드 리뷰 문화를 팀에 정착시킨 경험입니다." },
    { id: "user_010", rank: 10, name: "열공하는라이언", score: 84, tier: "Silver", metricType: "score", metricValue: "종합 84점", script: "클라우드 인프라 마이그레이션 프로젝트 회고 내용입니다." },
  ]
};

export const MOCK_BEST_ANSWERS: BestAnswer[] = [
  { id: 1, category: "프론트엔드", company: "OO버", role: "프론트엔드", score: 95, author: "김**", script: "저는 React 성능 최적화를 위해 useMemo와 useCallback을 적극 도입하여 불필요한 리렌더링을 40% 이상 줄인 경험이 있습니다." },
  { id: 2, category: "백엔드", company: "카**오", role: "백엔드", score: 92, author: "이**", script: "대규모 트래픽 폭주 상황을 가정하여 Redis 캐시 레이어를 선제적으로 구축하고 DB Read Lock 병목 현상을 해결했습니다." },
  { id: 3, category: "AI", company: "토*", role: "AI 엔지니어", score: 94, author: "박**", script: "PyTorch를 활용한 경량화 모델 파인튜닝으로 추론 속도를 2배 단축시키고 모바일 환경에 성공적으로 배포했습니다." },
  // 🔑 category를 대분류 "디자인" → 세부 직무 "UX/UI 디자이너"로 정정
  { id: 4, category: "UX/UI 디자이너", company: "당**근", role: "UX/UI", score: 91, author: "최**", script: "유저 이탈률 데이터를 분석하여 온보딩 퍼널 UX를 간소화하고 전환율을 15% 끌어올린 프로젝트를 진행했습니다." },
];

export const MOCK_WIKI_QUESTIONS: WikiQuestion[] = [
  { id: "w1", companyName: "네이버", tier: "대기업", role: "프론트엔드", text: "React에서 상태 관리를 위해 사용하는 라이브러리와 그 이유는 무엇인가요?", date: "2026.06.20", verifiedCount: 7 },
  { id: "w2", companyName: "카카오뱅크", tier: "대기업", role: "Android", text: "Jetpack Compose 상태 관리와 Recomposition 최적화 경험에 대해 설명해주세요.", date: "2026.07.20", verifiedCount: 12 },
  { id: "w3", companyName: "토스", tier: "스타트업", role: "UX/UI", text: "가장 최근에 진행한 프로젝트에서 유저 데이터를 바탕으로 의사결정한 경험을 말씀해주세요.", date: "2026.06.10", verifiedCount: 5 },
  { id: "w4", companyName: "우아한형제들", tier: "중견기업", role: "백엔드", text: "JPA N+1 문제의 원인과 이를 해결했던 구체적인 경험을 설명해주세요.", date: "2026.06.05", verifiedCount: 8 },
  { id: "w5", companyName: "당근", tier: "스타트업", role: "프론트엔드", text: "웹 퍼포먼스 최적화를 위해 LCP와 CLS를 개선해본 경험이 있나요?", date: "2026.06.01", verifiedCount: 5 },
];

export const MOCK_WIKI = MOCK_WIKI_QUESTIONS;

// 🎨 커뮤니티 팔레트 (Color Palette 04 기준). 색을 바꾸려면 여기 한 곳만 수정.
export const PALETTE = {
  cream: "#FFFDF5", // 기본 배경 (가짜 흰색)
  sky: "#95B1EE",   // 서브 포인트
  lime: "#E7F1A8",  // 강조/하이라이트
  navy: "#364C84",  // 메인 포인트
  navyDark: "#273761",
  limeInk: "#3F4A1B", // 라임 배경 위 글씨색
} as const;

// 🔒 개인정보 마스킹 (기업명·이름 등을 O로 치환). 로직이라 UI와 분리.
export const maskText = (text: string): string =>
  text.replace(/(네이버|카카오|토스|김은재|현진|보영|예은)/g, (m) => "O".repeat(m.length));