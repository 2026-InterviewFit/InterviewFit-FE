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

const LEGACY_LOCAL_STORAGE_KEYS = [
  "interviewfit_user",
  "interviewfit_user_id",
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

export function setAuthUser(
  user: InterviewFitUser,
): void {
  validateUser(user);

  currentUser = user;
  authInitialized = true;

  clearLegacyBrowserAuth();
  emitAuthChanged();
}

export function saveAuth(
  token: string,
  user: InterviewFitUser,
): void {
  if (isBrowser() && token) {
    localStorage.setItem("interviewfit_access_token", token);
  }
  setAuthUser(user);
}

export function saveLogin(
  response: LoginResponse,
): void {
  if (!response?.user) {
    throw new Error(
      "로그인 응답에 사용자 정보가 없습니다.",
    );
  }

  const token = response.token ?? response.accessToken ?? response.jwt;
  if (isBrowser() && token) {
    localStorage.setItem("interviewfit_access_token", token);
  }

  setAuthUser(response.user);
}

/**
 * 🔑 핵심 수정: localStorage에서 Access Token을 명시적으로 가져옴
 */
export function getAuthToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem("interviewfit_access_token");
}

export function getAccessToken(): string | null {
  return getAuthToken();
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
        if (isBrowser()) {
          localStorage.removeItem("interviewfit_access_token");
        }
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
      if (isBrowser()) {
        localStorage.removeItem("interviewfit_access_token");
      }
      clearLegacyBrowserAuth();
      emitAuthChanged();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function authenticatedFetch(
  input: string,
  init: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    input,
    {
      ...init,
      headers,
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

  const retryToken = getAuthToken();
  const retryHeaders = new Headers(init.headers);
  if (retryToken && !retryHeaders.has("Authorization")) {
    retryHeaders.set("Authorization", `Bearer ${retryToken}`);
  }

  return fetch(
    input,
    {
      ...init,
      headers: retryHeaders,
      credentials: "include",
    },
  );
}

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

export function clearAuth(): void {
  currentUser = null;
  authInitialized = true;

  if (isBrowser()) {
    localStorage.removeItem("interviewfit_access_token");
  }
  clearLegacyBrowserAuth();
  emitAuthChanged();
}

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