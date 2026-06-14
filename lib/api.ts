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

export async function uploadInterviewVideo(params: {
  file: Blob;
  userId?: number;
  interviewId?: number;
}): Promise<VideoUploadResponse> {
  /**
   * 팀원 VideoService와 연결되는 영상 저장 API.
   *
   * 변경 이유:
   * - 기존에는 eye-blink API가 영상을 직접 multipart로 받아 로컬에 저장했다.
   * - 하지만 팀원 코드에 /videos/upload → MinIO 저장 → videoUrl 반환 흐름이 이미 있으므로
   *   FE도 이 API를 먼저 호출해야 영상 저장 방식이 하나로 통일된다.
   */
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
  /**
   * 저장된 영상 objectKey를 기반으로 눈 깜빡임 분석을 요청한다.
   *
   * FE → Spring /api/eye-blinking/analyze
   * Spring → FastAPI /api/v1/vision/blinks
   * FastAPI → MinIO에서 videoUrl 다운로드 후 OpenCV 분석
   */
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
  /**
   * 기존 InterviewRecording.tsx 호환용 함수.
   *
   * 수정 전:
   * - FE가 영상을 바로 /api/eye-blinking/analyze/upload 로 전송했다.
   *
   * 수정 후:
   * - 먼저 팀원 VideoService의 /videos/upload 로 영상을 MinIO에 저장한다.
   * - 반환받은 videoUrl(videos/xxx.webm)을 /api/eye-blinking/analyze 로 넘겨 분석한다.
   *
   * 이렇게 해두면 아직 어딘가에서 analyzeEyeBlinking()을 호출해도
   * 내부적으로 새 흐름을 타게 된다.
   */
  const uploadResult = await uploadInterviewVideo({
    file: params.file,
    userId: params.userId,
    interviewId: params.interviewId,
  });

  return analyzeEyeBlinkingByVideoUrl({
    videoUrl: uploadResult.videoUrl,
    userId: params.userId,
    interviewId: params.interviewId,
  });
}

export async function analyzeEyeBlinkingUploadOnly(params: {
  file: Blob;
  userId?: number;
  interviewId?: number;
}): Promise<EyeBlinkingAnalyzeResponse> {
  /**
   * 과거 단독 테스트용 이름.
   *
   * 현재는 팀원 VideoService 흐름에 맞춰
   * 내부적으로 analyzeEyeBlinking()을 호출한다.
   *
   * 즉 이 함수도 더 이상 /api/eye-blinking/analyze/upload 를 직접 호출하지 않는다.
   */
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
  /**
   * 답변 텍스트 기반 꼬리질문 생성 API.
   *
   * 주의:
   * - followup은 영상 파일이 아니라 답변 텍스트가 필요하다.
   * - 따라서 STT 결과가 준비되면 answer에 STT 텍스트를 넣어 호출하면 된다.
   * - questionId가 있으면 Spring이 QuestionEntity에서 원본 질문을 조회할 수 있다.
   */
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
