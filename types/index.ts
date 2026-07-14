// types/index.ts

export type JobRole = {
  id: number;
  category: string;
  name: string;
};

export type VideoUploadResponse = {
  videoUrl?: string;
  objectKey?: string;
  [key: string]: unknown;
};

export type EyeBlinkingRawResult = {
  total_frames?: number;
  fps?: number;
  duration_seconds?: number;
  face_detected_frames?: number;
  blink_count?: number;
  blinks_per_minute?: number;
  average_ear?: number;
  min_ear?: number;
  max_ear?: number;
  ear_threshold?: number;
  ear_consec_frames?: number;
  closed_frame_count?: number;
  blink_timestamps?: number[];
  evaluation?: string;
  blink_rate?: number;
  score?: number;
  feedback?: string;
  [key: string]: unknown;
};

export type EyeBlinkingAnalyzeResponse = {
  message?: string;
  reportId?: number;
  result?: EyeBlinkingRawResult;
  data?: EyeBlinkingRawResult;
  [key: string]: unknown;
};

export type FollowUpCreateResponse = {
  message?: string;
  followUpQuestionId?: number;
  followUpQuestion?: string;
  follow_up_question?: string;
  [key: string]: unknown;
};

export type InterviewStartResponse = {
  interviewId: number;
  userId: number;
  jobRoleId: number;
  jobName: string;
  status: string;
};

export type AnswerUploadResponse = {
  answerId: number;
  interviewId: number;
  questionId: number | null;
  questionText: string | null;
  videoObjectKey: string;
  answerOrder: number;
  analysisStatus: string;
};

export type GazeResultJson = {
  total_frames?: number;
  fps?: number;
  duration_seconds?: number;
  face_detected_frames?: number;
  gaze_detected_frames?: number;
  center_frames?: number;
  left_frames?: number;
  right_frames?: number;
  up_frames?: number;
  down_frames?: number;
  center_ratio?: number;
  gaze_away_ratio?: number;
  gaze_away_count?: number;
  [key: string]: unknown;
};

export type GazeReport = {
  reportId?: number;
  centerRatio: number;
  gazeAwayRatio: number;
  gazeAwayCount: number;
  score: number;
  evaluation?: string;
  feedback?: string;
  resultJson?: GazeResultJson;
};

export type AnswerReport = {
  answerId: number;
  questionId: number | null;
  questionText: string | null;
  videoObjectKey: string;
  answerOrder: number;
  analysisStatus: string;
  errorMessage: string | null;

  eye: {
    reportId: number;
    blinkCount: number;
    blinkRate: number;
    durationSeconds?: number;
    score: number;
    feedback: string;
    blinkLogs?: {
      logId?: number;
      timestamp: number;
      eventType?: string;
    }[];
  } | null;

  gaze?: GazeReport | null;

  pose: {
    reportId: number;
    totalDuration: number;
    badCount: number;
    badDuration: number;
    shoulderBadCount: number;
    faceBadCount: number;
    shoulderBadDuration: number;
    faceBadDuration: number;
    badRatio: number;
    score: number;
    grade: string;
  } | null;

  speech: {
    reportId: number;
    textScript: string;
    totalFillerCount: number;
    fillerDetailsJson: string;
    repeatedExpressionsJson: string;
    paceEvaluation: string;
    paceFeedback: string;
    charactersPerSecond: number;
    totalSilenceSeconds: number;
    pauseRatePercent: number;
    criticalSilenceCount: number;
    volumeDbMean: number;
    volumeDbStd: number;
    aiEvaluationJson: string;
    modelAnswer: string;
  } | null;
  gaze: {
    reportId: number;
    centerRatio: number;
    gazeAwayRatio: number;
    gazeAwayCount: number;
    score: number;
    feedback?: string;
    evaluation?: string;
  } | null;
};

export type InterviewReportResponse = {
  interviewId: number;
  userId: number;
  jobRoleId: number;
  jobCategory: string;
  jobName: string;
  createdAt: string;
  analysisStatus: string;
  completed: boolean;
  answers: AnswerReport[];
};

// Dashboard 전용 타입
export type InterviewHistoryItem = {
  interviewId: number;
  userId?: number;
  jobRoleId?: number;
  jobName?: string;
  answers?: {
    answerId: number;
    answerOrder?: number;
    analysisStatus?: string;
  }[];
  questionTexts?: string[];
  questionTimestamps?: number[];
  savedAt?: string;
};

export type DashboardRecord = InterviewHistoryItem & {
  report?: InterviewReportResponse;
  reportError?: string;
};
