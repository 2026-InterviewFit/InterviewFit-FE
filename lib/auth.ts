// lib/auth.ts

export type AuthUser = {
  id: number;
  kakaoId: number;
  email: string | null;
  name: string;
  createdAt: string;
};

// 기존 코드 호환용
export type InterviewFitUser = AuthUser;

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

const TOKEN_KEY = "interviewfit_access_token";
const USER_KEY = "interviewfit_user";
const USER_ID_KEY = "interviewfit_user_id";

const AUTH_CHANGED_EVENT =
  "interviewfit-auth-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * 로그인 응답 검증
 */
function validateAuth(
  token: string,
  user: AuthUser,
): void {
  if (
    !token ||
    typeof token !== "string"
  ) {
    throw new Error(
      "로그인 응답에 JWT 토큰이 없습니다.",
    );
  }

  if (
    !user ||
    typeof user !== "object" ||
    user.id == null
  ) {
    throw new Error(
      "로그인 응답에 사용자 정보가 없습니다.",
    );
  }
}

/**
 * JWT + 사용자 정보 저장
 */
export function saveAuth(
  token: string,
  user: AuthUser,
): void {
  if (!isBrowser()) {
    return;
  }

  validateAuth(
    token,
    user,
  );

  localStorage.setItem(
    TOKEN_KEY,
    token,
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user),
  );

  localStorage.setItem(
    USER_ID_KEY,
    String(user.id),
  );

  // 이전 mock 로그인 흔적 제거
  sessionStorage.removeItem(
    "mockSession",
  );

  window.dispatchEvent(
    new Event(
      AUTH_CHANGED_EVENT,
    ),
  );
}

/**
 * 기존 saveLogin(response) 코드 호환
 */
export function saveLogin(
  response: LoginResponse,
): void {
  if (
    !response ||
    !response.token ||
    !response.user
  ) {
    throw new Error(
      "로그인 응답 형식이 올바르지 않습니다.",
    );
  }

  saveAuth(
    response.token,
    response.user,
  );
}

/**
 * JWT 반환
 */
export function getAuthToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const token =
    localStorage.getItem(
      TOKEN_KEY,
    );

  if (
    !token ||
    token === "undefined" ||
    token === "null"
  ) {
    return null;
  }

  return token;
}

/**
 * 기존 코드 호환
 */
export function getAccessToken(): string | null {
  return getAuthToken();
}

/**
 * 사용자 정보 반환
 */
export function getAuthUser(): AuthUser | null {
  if (!isBrowser()) {
    return null;
  }

  const rawUser =
    localStorage.getItem(
      USER_KEY,
    );

  if (!rawUser) {
    return null;
  }

  try {
    const user =
      JSON.parse(
        rawUser,
      ) as AuthUser;

    if (
      !user ||
      user.id == null
    ) {
      clearAuth();

      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "사용자 정보 파싱 실패:",
      error,
    );

    clearAuth();

    return null;
  }
}

/**
 * 기존 코드 호환
 */
export function getLoginUser(): AuthUser | null {
  return getAuthUser();
}

/**
 * 로그인 사용자 ID
 */
export function getLoginUserId(): number | null {
  if (!isBrowser()) {
    return null;
  }

  const storedId =
    localStorage.getItem(
      USER_ID_KEY,
    );

  if (storedId) {
    const parsedId =
      Number(storedId);

    if (
      !Number.isNaN(
        parsedId,
      )
    ) {
      return parsedId;
    }
  }

  const user =
    getAuthUser();

  return user?.id ?? null;
}

/**
 * 로그인 여부
 */
export function isAuthenticated(): boolean {
  return Boolean(
    getAuthToken(),
  );
}

/**
 * 사용자 이름
 */
export function getDisplayName(): string {
  const user =
    getAuthUser();

  return (
    user?.name?.trim() ||
    "사용자"
  );
}

/**
 * 기존 코드 호환
 */
export function getLoginUserName(): string {
  return getDisplayName();
}

/**
 * 프로필 첫 글자
 */
export function getProfileInitial(): string {
  const name =
    getDisplayName();

  return (
    name.charAt(0) ||
    "U"
  );
}

/**
 * 인증 정보 삭제
 */
export function clearAuth(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(
    TOKEN_KEY,
  );

  localStorage.removeItem(
    USER_KEY,
  );

  localStorage.removeItem(
    USER_ID_KEY,
  );

  // 이전 코드 잔재도 같이 제거
  localStorage.removeItem(
    "accessToken",
  );

  localStorage.removeItem(
    "token",
  );

  sessionStorage.removeItem(
    "mockSession",
  );

  window.dispatchEvent(
    new Event(
      AUTH_CHANGED_EVENT,
    ),
  );
}

/**
 * logout 이름을 쓰는 기존 코드 호환
 */
export function logout(): void {
  clearAuth();
}

/**
 * 로그인 상태 변경 구독
 */
export function subscribeToAuthChanges(
  listener: () => void,
): () => void {
  if (!isBrowser()) {
    return () => undefined;
  }

  window.addEventListener(
    AUTH_CHANGED_EVENT,
    listener,
  );

  window.addEventListener(
    "storage",
    listener,
  );

  return () => {
    window.removeEventListener(
      AUTH_CHANGED_EVENT,
      listener,
    );

    window.removeEventListener(
      "storage",
      listener,
    );
  };
}