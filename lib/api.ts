const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type JobRole = {
  id: number;
  category: string;
  name: string;
};

export type VideoUploadResponse = {
  message: string;

  /**
   * Spring VideoService가 MinIO에 저장한 objectKey.
   * 예: videos/uuid_interview.webm
   */
  videoUrl: string;

  /**
   * 혹시 BE 응답 필드명이 objectKey로 올 경우 대비
   */
  objectKey?: string;
};

export type QuestionRequest = {
  count: number;
  jobRoleId: number;
  coverLetter?: string;
};

export type Question = {
  id: number;
  question: string;
  jobName: string;
};

export type InterviewStartResponse = {
  interviewId: number;
  userId: number;
  jobRoleId: number;
  jobName: string;
  status: string;
};

export type InterviewAnswerUploadResponse = {
  answerId: number;
  interviewId: number;
  questionId?: number;
  questionText?: string;
  videoObjectKey: string;
  answerOrder: number;
  analysisStatus: "UPLOADED" | "RUNNING" | "DONE" | "FAILED" | string;
};


export type InterviewReportResponse = {
  interviewId: number;
  userId: number;
  jobRoleId: number;
  jobCategory?: string;
  jobName?: string;
  createdAt?: string;
  analysisStatus: "EMPTY" | "UPLOADED" | "RUNNING" | "DONE" | "FAILED" | string;
  completed: boolean;
  answers: InterviewAnswerReport[];
};

export type InterviewAnswerReport = {
  answerId: number;
  questionId?: number;
  questionText?: string;
  videoObjectKey?: string;
  answerOrder: number;
  analysisStatus: "UPLOADED" | "RUNNING" | "DONE" | "FAILED" | string;
  errorMessage?: string | null;
  eye?: {
    reportId?: number;
    blinkCount?: number;
    blinkRate?: number;
    score?: number;
    feedback?: string;
  } | null;
  pose?: {
    reportId?: number;
    totalDuration?: number;
    badCount?: number;
    badDuration?: number;
    shoulderBadCount?: number;
    faceBadCount?: number;
    shoulderBadDuration?: number;
    faceBadDuration?: number;
    badRatio?: number;
    score?: number;
    grade?: string;
  } | null;
  speech?: {
    reportId?: number;
    textScript?: string;
    totalFillerCount?: number;
    fillerDetailsJson?: string;
    paceEvaluation?: string;
    paceFeedback?: string;
    charactersPerSecond?: number;
    totalSilenceSeconds?: number;
    criticalSilenceCount?: number;
    aiEvaluationJson?: string;
    modelAnswer?: string | null;
  } | null;
};

export type EyeBlinkingRawResult = {
  total_frames?: number;
  fps?: number;
  duration_seconds?: number;
  face_detected_frames?: number;
  blink_count?: number;
  blinks_per_minute?: number;
  average_ear?: number;
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
  followUpId?: number;
  followUpQuestionId?: number;
  followUpQuestion?: string;
  follow_up_question?: string;
  [key: string]: unknown;
};

export async function getJobRoles(): Promise<JobRole[]> {
  const response = await fetch(`${API_BASE_URL}/api/job-role/all`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`직무 목록 조회 실패: ${errorText}`);
  }

  return response.json();
}

/**
 * 새 면접 세션 생성.
 *
 * Spring:
 * POST /api/interview/start
 */
export async function startInterview(params: {
  jobRoleId: number;
  userId?: number;
}): Promise<InterviewStartResponse> {
  const response = await fetch(`${API_BASE_URL}/api/interview/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobRoleId: params.jobRoleId,
      userId: params.userId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`면접 시작 실패: ${errorText}`);
  }

  return response.json();
}

/**
 * 질문별 답변 영상 업로드.
 *
 * Spring:
 * POST /api/interview/{interviewId}/answers
 *
 * 업로드 직후 응답은 보통 analysisStatus=UPLOADED가 정상이다.
 * 실제 eye/pose/speech 분석은 Spring에서 비동기로 진행되고, DB에서 DONE으로 바뀐다.
 */
export async function uploadInterviewAnswer(params: {
  interviewId: number;
  file: Blob;
  questionId?: number;
  questionText?: string;
  answerOrder: number;
}): Promise<InterviewAnswerUploadResponse> {
  const formData = new FormData();
  formData.append("file", params.file, `answer-${params.answerOrder}.webm`);
  formData.append("answerOrder", String(params.answerOrder));

  if (params.questionId !== undefined) {
    formData.append("questionId", String(params.questionId));
  }

  if (params.questionText !== undefined) {
    formData.append("questionText", params.questionText);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/interview/${params.interviewId}/answers`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`답변 영상 업로드 실패: ${errorText}`);
  }

  return response.json();
}


/**
 * 면접 분석 결과 조회.
 *
 * Spring:
 * GET /api/interview/{interviewId}/report
 */
export async function getInterviewReport(
  interviewId: number
): Promise<InterviewReportResponse> {
  const response = await fetch(`${API_BASE_URL}/api/interview/${interviewId}/report`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`면접 분석 결과 조회 실패: ${errorText}`);
  }

  return response.json();
}


/**
 * 기존 영상 업로드 API.
 *
 * 현재 질문별 분석 플로우에서는 uploadInterviewAnswer()를 사용한다.
 * 이 함수는 기존 화면 호환용으로 유지한다.
 */
export async function uploadInterviewVideo(params: {
  file: Blob;
  userId?: number;
  interviewId?: number;
}): Promise<VideoUploadResponse> {
  const formData = new FormData();
  formData.append("file", params.file, "interview.webm");

  if (params.userId !== undefined) {
    formData.append("userId", String(params.userId));
  }

  if (params.interviewId !== undefined) {
    formData.append("interviewId", String(params.interviewId));
  }

  const response = await fetch(`${API_BASE_URL}/videos/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`영상 업로드 실패: ${errorText}`);
  }

  return response.json();
}

export async function analyzeEyeBlinkingByVideoUrl(params: {
  videoUrl: string;
  userId?: number;
  interviewId?: number;
}): Promise<EyeBlinkingAnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/eye-blinking/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      videoUrl: params.videoUrl,
      userId: params.userId,
      interviewId: params.interviewId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`눈 깜빡임 분석 실패: ${errorText}`);
  }

  return response.json();
}

export async function analyzeEyeBlinking(params: {
  file: Blob;
  userId?: number;
  interviewId?: number;
}): Promise<EyeBlinkingAnalyzeResponse> {
  const uploadResult = await uploadInterviewVideo({
    file: params.file,
    userId: params.userId,
    interviewId: params.interviewId,
  });

  const videoUrl = uploadResult.videoUrl ?? uploadResult.objectKey;

  if (!videoUrl) {
    throw new Error("영상 업로드 응답에 videoUrl/objectKey가 없습니다.");
  }

  return analyzeEyeBlinkingByVideoUrl({
    videoUrl,
    userId: params.userId,
    interviewId: params.interviewId,
  });
}

export async function analyzeEyeBlinkingUploadOnly(params: {
  file: Blob;
  userId?: number;
  interviewId?: number;
}): Promise<EyeBlinkingAnalyzeResponse> {
  return analyzeEyeBlinking({
    file: params.file,
    userId: params.userId,
    interviewId: params.interviewId,
  });
}

export async function createFollowUpQuestion(params: {
  jobRoleId?: number;
  job?: string;
  questionId?: number;
  originalQuestion?: string;
  answer: string;
  interviewStyle?: string;
  userId?: number;
  interviewId?: number;
}): Promise<FollowUpCreateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/followup/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobRoleId: params.jobRoleId,
      job: params.job,
      questionId: params.questionId,
      original_question: params.originalQuestion,
      answer: params.answer,
      interview_style: params.interviewStyle ?? "normal",
      userId: params.userId,
      interviewId: params.interviewId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`꼬리질문 생성 실패: ${errorText}`);
  }

  return response.json();
}

export async function createQuestions(
  request: QuestionRequest
): Promise<Question[]> {
  console.log("질문 생성 요청", request);

  const response = await fetch(`${API_BASE_URL}/api/question/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  console.log("질문 생성 응답 상태", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("질문 생성 실패", errorText);
    throw new Error(`질문 생성 실패: ${errorText}`);
  }

  const data: Question[] = await response.json();

  console.log("질문 생성 응답", data);

  return data;
}
