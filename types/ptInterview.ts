// types/ptInterview.ts

// 문서 분석 상태 (2번 화면)
export type DocumentAnalysisStatus =
  | "UPLOADED"    // 업로드 완료
  | "EXTRACTING"  // 텍스트 추출 중
  | "ANALYZING"   // 슬라이드 분석 중
  | "DONE"        // 분석 완료
  | "FAILED";     // 분석 실패

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

// 질의응답 (5번 화면)
export type QuestionType =
  | "content"   // 발표 내용 확인
  | "job"       // 직무 연계
  | "problem"   // 문제 해결
  | "followup"  // 꼬리질문
  | "rebuttal"; // 반박

export interface PtQuestion {
  id: string;
  order: number;
  type: QuestionType;
  text: string;
  relatedSlide?: number;
  relatedSlideSummary?: string;
}

// 리포트 (7번 화면)
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
  presentation: { label: string; score: number }[];
  speech: { label: string; value: string; warning?: boolean }[];
  nonverbal: { label: string; value: string; warning?: boolean }[];
  qna: { label: string; score: number }[];
  feedback: {
    good: string[];
    improve: string[];
    nextAction: string[];
  };
  timeline: TimelineEvent[];
}
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
  imageObjectKey: string | null;
  analysisJson: string | null;
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

export interface PtReportResponse {
  reportId: number;
  ptInterviewId: number;
  contentScore: number;
  structureScore: number;
  deliveryScore: number;
  qaScore: number;
  overallScore: number;
  presentationSummary: string;
  strengths: string;
  weaknesses: string;
  improvement: string;
  createdAt: string;
  updatedAt: string;
}