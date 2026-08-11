// lib/auth.ts

export type InterviewFitUser = {
  id: number;
  kakaoId?: number | null;
  email?: string | null;
  name?: string | null;
  createdAt?: string | null;
};

// 기존 코드 호환용 타입 별칭
export type AuthUser = InterviewFitUser;

export type LoginResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: InterviewFitUser;
};

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "interviewfit_user";
const USER_ID_KEY = "interviewfit_user_id";

const LEGACY_KEYS = [
  "mockSession",
  "token",
  "user",
];

export function saveLogin(response: LoginResponse): void {
  if (typeof window === "undefined") {
    return;
  }

  const token =
    response.token ??
    response.accessToken ??
    response.jwt;

  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);

    // 이전 코드 호환
    localStorage.setItem("token", token);
  }

  if (response.user) {
    const serializedUser = JSON.stringify(response.user);

    localStorage.setItem(USER_KEY, serializedUser);

    // 이전 코드 호환
    localStorage.setItem("user", serializedUser);

    if (response.user.id != null) {
      localStorage.setItem(
        USER_ID_KEY,
        String(response.user.id),
      );
    }
  }

  sessionStorage.removeItem("mockSession");

  window.dispatchEvent(
    new Event("auth-changed"),
  );
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ??
    localStorage.getItem("token")
  );
}

// lib/api.ts 호환용 함수
export function getAuthToken(): string | null {
  return getAccessToken();
}

export function getLoginUser(): InterviewFitUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw =
    localStorage.getItem(USER_KEY) ??
    localStorage.getItem("user");

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as InterviewFitUser;
  } catch (error) {
    console.error(
      "로그인 사용자 정보 파싱 실패:",
      error,
    );

    return null;
  }
}

export function getLoginUserId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(USER_ID_KEY);

  if (raw) {
    const id = Number(raw);

    if (!Number.isNaN(id)) {
      return id;
    }
  }

  const user = getLoginUser();

  return user?.id ?? null;
}

export function isLoggedIn(): boolean {
  return Boolean(getAccessToken());
}

export function isAuthenticated(): boolean {
  return isLoggedIn();
}

export function getDisplayName(): string {
  const user = getLoginUser();

  return user?.name?.trim() || "사용자";
}

export function getLoginUserName(): string {
  return getDisplayName();
}

export function getProfileInitial(): string {
  const name = getDisplayName();

  return name.charAt(0) || "U";
}

export function subscribeToAuthChanges(
  callback: (authenticated: boolean) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleAuthChange = () => {
    callback(isAuthenticated());
  };

  window.addEventListener(
    "auth-changed",
    handleAuthChange,
  );

  window.addEventListener(
    "storage",
    handleAuthChange,
  );

  return () => {
    window.removeEventListener(
      "auth-changed",
      handleAuthChange,
    );

    window.removeEventListener(
      "storage",
      handleAuthChange,
    );
  };
}

export function clearAuth(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_ID_KEY);

  LEGACY_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  window.dispatchEvent(
    new Event("auth-changed"),
  );
}

export function logout(): void {
  clearAuth();
}