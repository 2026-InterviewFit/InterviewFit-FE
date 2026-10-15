// types/ptInterview.ts

// =========================================================
// 문서 분석 상태 (2번 화면)
// =========================================================

export type DocumentAnalysisStatus =
  | "UPLOADED" // 업로드 완료
  | "EXTRACTING" // 텍스트 추출 중
  | "ANALYZING" // 슬라이드 분석 중
  | "DONE" // 분석 완료
  | "FAILED"; // 분석 실패

export interface Slide {
  slideNumber: number;
  thumbnailUrl?: string; // 없으면 그라데이션 플레이스홀더
  title: string;
  body: string;
  aiSummary: string;
}

export interface DocumentSummary {
  coreTopic: string;
  keywords: string[];
  flow: string[];
  expectedQuestionAreas: string[];
}

export interface PtInterviewMeta {
  ptInterviewId: number;
  job: string;
  topic: string;
  instruction: string;
  prepSeconds: number;
  limitSeconds: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: DocumentAnalysisStatus;
}

export interface CreatePtInterviewPayload {
  job: string;
  topic: string;
  instruction: string;
  prepSeconds: number;
  limitSeconds: number;
  fileName: string;
  fileSize: number;
  fileType: string;
}

// =========================================================
// 질의응답 (5번 화면)
// =========================================================

export type QuestionType =
  | "content" // 발표 내용 확인
  | "job" // 직무 연계
  | "problem" // 문제 해결
  | "followup" // 꼬리질문
  | "rebuttal"; // 반박

export interface PtQuestion {
  id: string;
  order: number;
  type: QuestionType;
  text: string;
  relatedSlide?: number;
  relatedSlideSummary?: string;
}

// =========================================================
// 기존 PT 리포트 화면용 타입
// =========================================================

export interface PtScore {
  overall: number;
  presentation: number;
  qna: number;
  nonverbal: number;
  content: number;
}

export interface RadarMetric {
  label: string;
  score: number; // 0~100
}

export interface TimelineEvent {
  atSeconds: number;
  type: "gaze" | "silence" | "pace" | "posture";
  label: string;
}

export interface PtReport {
  score: PtScore;
  radar: RadarMetric[];

  presentation: {
    label: string;
    score: number;
  }[];

  speech: {
    label: string;
    value: string;
    warning?: boolean;
  }[];

  nonverbal: {
    label: string;
    value: string;
    warning?: boolean;
  }[];

  qna: {
    label: string;
    score: number;
  }[];

  feedback: {
    good: string[];
    improve: string[];
    nextAction: string[];
  };

  timeline: TimelineEvent[];
}

// =========================================================
// PT 면접 API 응답
// =========================================================

export interface PtInterviewResponse {
  id: number;
  interviewId: number;
  topic: string;
  instruction: string;
  preparationSeconds: number;
  presentationSeconds: number;
  status: string;
}

export interface PtDocumentUploadResponse {
  documentId: number;
  ptInterviewId: number;
  originalFileName: string;
  objectKey: string;
  analysisStatus: string;
}

export interface PtSlideResponse {
  slideId: number;
  slideNumber: number;
  title: string | null;
  extractedText: string | null;
  summary: string | null;
  imageObjectKey?: string | null;
  analysisJson?: string | null;
}

export interface PtDocumentDetailResponse {
  documentId: number;
  ptInterviewId: number;
  originalFileName: string;
  objectKey: string;
  contentType: string;
  fileSize: number;
  analysisStatus: DocumentAnalysisStatus;
  totalSlides: number;
  summary: string | null;
  errorMessage: string | null;
  slides: PtSlideResponse[];
}

export interface PtQuestionResponse {
  id: number;
  questionNumber: number;
  question: string;
  reason: string | null;
}

/**
 * PT 질문별 답변 조회 응답
 */
export interface PtAnswerResponse {
  answerId: number;
  ptQuestionId: number;
  questionNumber: number;
  question: string;
  answerText: string | null;
  analysisStatus: string;
  createdAt: string;
}

/**
 * PT 질문별 영상 재생 URL 응답
 */
export interface PtAnswerVideoResponse {
  videoUrl: string;
}

// =========================================================
// PT 상세 리포트
// =========================================================

/**
 * STAR 구조 평가
 *
 * 각 항목 0~10점
 * 총점 0~40점
 */
export interface PtStarAnalysisResponse {
  situation: number;
  task: number;
  action: number;
  result: number;
  totalScore: number;
}

/**
 * 눈 깜빡임 상세 분석
 */
export interface PtEyeBlinkingDetailResponse {
  score: number | null;
  durationSeconds: number | null;
  blinkCount: number | null;
  blinkRate: number | null;
  notDetectedCount: number | null;
  notDetectedRatio: number | null;
  grade: string | null;
  feedback: string | null;
}

/**
 * 시선 방향 상세 분석
 */
export interface PtEyeGazeDetailResponse {
  score: number | null;
  durationSeconds: number | null;
  centerRatio: number | null;
  gazeAwayRatio: number | null;
  gazeAwayCount: number | null;
  notDetectedCount: number | null;
  notDetectedRatio: number | null;
  grade: string | null;
  evaluation: string | null;
}

/**
 * 음성 / STT 상세 분석
 */
export interface PtSpeechDetailResponse {
  score: number | null;
  textScript: string | null;

  totalFillerCount: number | null;

  fillerDetailsJson: string | null;
  repeatedExpressionsJson: string | null;

  paceEvaluation: string | null;
  paceFeedback: string | null;

  charactersPerSecond: number | null;

  totalSilenceSeconds: number | null;
  pauseRatePercent: number | null;
  criticalSilenceCount: number | null;
}

/**
 * 발표 전체 상세 분석
 */
export interface PtPresentationAnalysisResponse {
  eyeBlinking: PtEyeBlinkingDetailResponse | null;
  eyeGaze: PtEyeGazeDetailResponse | null;
  speech: PtSpeechDetailResponse | null;
}

/**
 * 질문별 답변 상세 분석
 */
export interface PtQuestionAnalysisResponse {
  questionNumber: number;

  question: string;

  /**
   * 실제 사용자가 말한 답변
   */
  answer: string;

  understandingScore: number;
  logicScore: number;
  specificityScore: number;
  evidenceScore: number;
  overallScore: number;

  strengths: string;
  weaknesses: string;
  improvement: string;

  /**
   * 기존 PT 분석에서 생성된 개선 답변
   */
  improvedAnswer: string;

  /**
   * Gemini 답변 평가 피드백
   */
  aiFeedback: string | null;

  /**
   * Gemini 모범 답변
   */
  modelAnswer: string | null;

  /**
   * STAR 평가
   */
  starAnalysis: PtStarAnalysisResponse | null;
}

/**
 * PT 종합 리포트 API 응답
 */
export interface PtReportResponse {
  reportId: number;
  ptInterviewId: number;

  // 종합 점수
  contentScore: number;
  structureScore: number;
  deliveryScore: number;
  qaScore: number;
  overallScore: number;

  // 발표 분석
  presentationMaterialSummary: string;
  actualPresentationSummary: string;
  presentationComparison: string;

  /**
   * 눈 깜빡임 / 시선 / 음성 상세 분석
   */
  presentationAnalysis: PtPresentationAnalysisResponse | null;

  /**
   * 질문별 상세 분석
   */
  questionAnalyses: PtQuestionAnalysisResponse[];

  // 종합 피드백
  strengths: string;
  weaknesses: string;
  improvement: string;

  createdAt: string;
  updatedAt: string;
}