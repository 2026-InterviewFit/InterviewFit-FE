// lib/auth.ts

export type InterviewFitUser = {
  id: number;
  kakaoId?: number | null;
  email?: string | null;
  name?: string | null;
  createdAt?: string | null;
};

export type AuthUser = InterviewFitUser;

export type LoginResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: InterviewFitUser;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

const AUTH_CHANGED_EVENT = "auth-changed";

/**
 * 과거 localStorage/sessionStorage 인증 데이터.
 *
 * 이제 JWT와 사용자 정보는 localStorage에 저장하지 않는다.
 * 기존 브라우저에 남아 있는 값만 정리하기 위해 키 이름을 유지한다.
 */
const LEGACY_LOCAL_STORAGE_KEYS = [
  "interviewfit_access_token",
  "interviewfit_user",
  "interviewfit_user_id",
  "accessToken",
  "token",
  "user",
  "mockSession",
];

const LEGACY_SESSION_STORAGE_KEYS = [
  "mockSession",
];

let currentUser: InterviewFitUser | null = null;
let authInitialized = false;
let initializePromise: Promise<InterviewFitUser | null> | null = null;
let refreshPromise: Promise<boolean> | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emitAuthChanged(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new Event(AUTH_CHANGED_EVENT),
  );
}

function clearLegacyBrowserAuth(): void {
  if (!isBrowser()) {
    return;
  }

  LEGACY_LOCAL_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });

  LEGACY_SESSION_STORAGE_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
  });
}

function validateUser(
  user: InterviewFitUser,
): void {
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
 * 서버에서 받은 사용자 정보를 프론트 메모리에 반영한다.
 *
 * JWT/사용자 정보는 localStorage에 저장하지 않는다.
 */
export function setAuthUser(
  user: InterviewFitUser,
): void {
  validateUser(user);

  currentUser = user;
  authInitialized = true;

  clearLegacyBrowserAuth();
  emitAuthChanged();
}

/**
 * 과거 callback 코드 호환용.
 * token 인자는 더 이상 브라우저에 저장하지 않는다.
 */
export function saveAuth(
  _token: string,
  user: InterviewFitUser,
): void {
  setAuthUser(user);
}

/**
 * 과거 saveLogin(response) 코드 호환용.
 */
export function saveLogin(
  response: LoginResponse,
): void {
  if (!response?.user) {
    throw new Error(
      "로그인 응답에 사용자 정보가 없습니다.",
    );
  }

  setAuthUser(response.user);
}

/**
 * HttpOnly Cookie 방식에서는 JavaScript가 JWT를 읽지 않는다.
 * 기존 import 호환을 위해 함수만 남기고 항상 null을 반환한다.
 */
export function getAuthToken(): null {
  return null;
}

export function getAccessToken(): null {
  return null;
}

export function getAuthUser(): InterviewFitUser | null {
  return currentUser;
}

export function getLoginUser(): InterviewFitUser | null {
  return getAuthUser();
}

export function getLoginUserId(): number | null {
  return currentUser?.id ?? null;
}

export function isLoggedIn(): boolean {
  return currentUser !== null;
}

export function isAuthenticated(): boolean {
  return isLoggedIn();
}

export function isAuthInitialized(): boolean {
  return authInitialized;
}

export function getDisplayName(): string {
  return (
    currentUser?.name?.trim() ||
    "사용자"
  );
}

export function getLoginUserName(): string {
  return getDisplayName();
}

export function getProfileInitial(): string {
  return (
    getDisplayName().charAt(0) ||
    "U"
  );
}

/**
 * Access Token 재발급.
 * Refresh Token은 HttpOnly Cookie이므로 브라우저가 자동 전송한다.
 */
export async function refreshAuthSession(): Promise<boolean> {
  if (!isBrowser()) {
    return false;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/refresh`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!response.ok) {
        currentUser = null;
        authInitialized = true;
        clearLegacyBrowserAuth();
        emitAuthChanged();
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        "Access Token 재발급 실패:",
        error,
      );

      currentUser = null;
      authInitialized = true;
      clearLegacyBrowserAuth();
      emitAuthChanged();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * HttpOnly Cookie 인증 API 공통 fetch.
 *
 * 1. 쿠키 포함 요청
 * 2. 401이면 Refresh Cookie로 Access Token 재발급
 * 3. 성공하면 원 요청 1회 재시도
 */
export async function authenticatedFetch(
  input: string,
  init: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<Response> {
  const response = await fetch(
    input,
    {
      ...init,
      credentials: "include",
    },
  );

  if (
    response.status !== 401 ||
    !retryOnUnauthorized
  ) {
    return response;
  }

  const refreshed =
    await refreshAuthSession();

  if (!refreshed) {
    return response;
  }

  return fetch(
    input,
    {
      ...init,
      credentials: "include",
    },
  );
}

/**
 * 현재 로그인 사용자 정보를 Spring /api/users/me에서 복구한다.
 *
 * 새로고침 후 currentUser 메모리가 비어 있어도
 * HttpOnly Cookie가 살아 있으면 여기서 다시 로그인 상태가 복구된다.
 */
export async function initializeAuth(
  force = false,
): Promise<InterviewFitUser | null> {
  if (!isBrowser()) {
    return null;
  }

  if (
    authInitialized &&
    !force
  ) {
    return currentUser;
  }

  if (initializePromise) {
    return initializePromise;
  }

  initializePromise = (async () => {
    try {
      clearLegacyBrowserAuth();

      const response =
        await authenticatedFetch(
          `${API_BASE_URL}/api/users/me`,
          {
            method: "GET",
          },
        );

      if (!response.ok) {
        currentUser = null;
        authInitialized = true;
        emitAuthChanged();
        return null;
      }

      const user =
        (await response.json()) as InterviewFitUser;

      validateUser(user);

      currentUser = user;
      authInitialized = true;
      emitAuthChanged();

      return user;
    } catch (error) {
      console.error(
        "로그인 사용자 정보 복구 실패:",
        error,
      );

      currentUser = null;
      authInitialized = true;
      emitAuthChanged();
      return null;
    } finally {
      initializePromise = null;
    }
  })();

  return initializePromise;
}

/**
 * 프론트 메모리 인증 상태만 제거한다.
 * 실제 로그아웃은 logout()을 사용한다.
 */
export function clearAuth(): void {
  currentUser = null;
  authInitialized = true;

  clearLegacyBrowserAuth();
  emitAuthChanged();
}

/**
 * Spring에서 Access/Refresh HttpOnly Cookie를 삭제하고
 * 프론트 사용자 상태도 제거한다.
 */
export async function logout(): Promise<void> {
  try {
    await fetch(
      `${API_BASE_URL}/api/users/logout`,
      {
        method: "POST",
        credentials: "include",
      },
    );
  } catch (error) {
    console.error(
      "로그아웃 API 호출 실패:",
      error,
    );
  } finally {
    clearAuth();
  }
}

export function subscribeToAuthChanges(
  callback: (
    authenticated: boolean,
  ) => void,
): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  const handleAuthChange = () => {
    callback(
      isAuthenticated(),
    );
  };

  window.addEventListener(
    AUTH_CHANGED_EVENT,
    handleAuthChange,
  );

  return () => {
    window.removeEventListener(
      AUTH_CHANGED_EVENT,
      handleAuthChange,
    );
  };
}