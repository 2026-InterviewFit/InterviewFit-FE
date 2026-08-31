import { authenticatedFetch } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

export const COMPANY_TIERS = [
  "대기업",
  "중견기업",
  "중소기업",
  "스타트업",
] as const;

export type CompanyTier = (typeof COMPANY_TIERS)[number];

export type CommunityWikiQuestion = {
  id: number;
  companyName: string;
  tier: CompanyTier;
  role: string;
  text: string;
  date: string | null;
  verifiedCount: number;
  verified: boolean;
  verifiedByMe: boolean;
};

export type CommunityWikiCreateRequest = {
  companyName: string;
  tier: CompanyTier;
  role: string;
  questionText: string;
};

export type CommunityBestAnswer = {
  id: number;
  category: string;
  company: string;
  role: string;
  score: number;
  author: string;
  script: string;
  likeCount: number;
  likedByMe: boolean;
  publishedAt: string | null;
};

export type CommunityBestAnswerPublishRequest = {
  answerId: number;
  companyName?: string;
};

export type CommunityRanker = {
  userId: number;
  rank: number;
  name: string;
  score: number;
  tier: string;
  metricType: string;
  metricValue: string;
  script: string;
  publishedAnswerCount: number;
  totalLikeCount: number;
  role: string | null;
};

export type CommunityRankerAnswer = {
  id: number;
  company: string;
  role: string;
  score: number;
  script: string;
  likeCount: number;
  publishedAt: string | null;
};

export type CommunityRankerProfile = {
  userId: number;
  rank: number;
  name: string;
  score: number;
  tier: string;
  publishedAnswerCount: number;
  totalLikeCount: number;
  answers: CommunityRankerAnswer[];
};

type ErrorBody = {
  message?: string;
  error?: string;
  detail?: string;
};

export class CommunityApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CommunityApiError";
    this.status = status;
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text();

  if (!text) {
    return response.statusText || "요청에 실패했습니다.";
  }

  try {
    const body = JSON.parse(text) as ErrorBody;
    return body.message ?? body.error ?? body.detail ?? text;
  } catch {
    return text;
  }
}

async function ensureOk(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }

  const message = await readErrorMessage(response);
  throw new CommunityApiError(response.status, message);
}

export async function getCommunityWikiQuestions(): Promise<CommunityWikiQuestion[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/community/wiki`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  await ensureOk(response);
  return (await response.json()) as CommunityWikiQuestion[];
}

export async function createCommunityWikiQuestion(
  request: CommunityWikiCreateRequest,
): Promise<CommunityWikiQuestion> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/community/wiki`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  await ensureOk(response);
  return (await response.json()) as CommunityWikiQuestion;
}

export async function verifyCommunityWikiQuestion(
  wikiQuestionId: number,
): Promise<CommunityWikiQuestion> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/community/wiki/${wikiQuestionId}/verify`,
    {
      method: "POST",
    },
  );

  await ensureOk(response);
  return (await response.json()) as CommunityWikiQuestion;
}

export async function getCommunityBestAnswers(): Promise<CommunityBestAnswer[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/community/answers`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  await ensureOk(response);
  return (await response.json()) as CommunityBestAnswer[];
}

export async function publishCommunityBestAnswer(
  request: CommunityBestAnswerPublishRequest,
): Promise<CommunityBestAnswer> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/community/answers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  await ensureOk(response);
  return (await response.json()) as CommunityBestAnswer;
}

export async function likeCommunityBestAnswer(
  answerId: number,
): Promise<CommunityBestAnswer> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/community/answers/${answerId}/likes`,
    {
      method: "POST",
    },
  );

  await ensureOk(response);
  return (await response.json()) as CommunityBestAnswer;
}

export async function unlikeCommunityBestAnswer(
  answerId: number,
): Promise<CommunityBestAnswer> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/community/answers/${answerId}/likes`,
    {
      method: "DELETE",
    },
  );

  await ensureOk(response);
  return (await response.json()) as CommunityBestAnswer;
}

/**
 * 공개 우수답변을 기준으로 계산된 TOP 10 랭킹.
 */
export async function getCommunityRankings(): Promise<CommunityRanker[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/community/rankings`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  await ensureOk(response);
  return (await response.json()) as CommunityRanker[];
}

/**
 * 특정 랭커가 공개한 우수답변 모음.
 */
export async function getCommunityRankerProfile(
  userId: number,
): Promise<CommunityRankerProfile> {
  const response = await fetch(
    `${API_BASE_URL}/api/community/rankings/${userId}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  await ensureOk(response);
  return (await response.json()) as CommunityRankerProfile;
}
