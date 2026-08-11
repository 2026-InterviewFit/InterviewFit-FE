// lib/auth.ts

export type InterviewFitUser = {
  id: number;
  kakaoId?: number | null;
  email?: string | null;
  name?: string | null;
  createdAt?: string | null;
};

// 기존 코드에서 AuthUser 타입을 사용하는 곳 호환용
export type AuthUser = InterviewFitUser;

export type LoginResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: InterviewFitUser;
};

/**
 * 실제 InterviewFit 인증 저장 키
 */
const TOKEN_KEY = "interviewfit_access_token";
const USER_KEY = "interviewfit_user";
const USER_ID_KEY = "interviewfit_user_id";

/**
 * 로그인/로그아웃 상태 변경 이벤트
 *
 * 기존 컴포넌트들이 "auth-changed"를 사용하고 있으므로
 * 이 이름으로 통일한다.
 */
const AUTH_CHANGED_EVENT = "auth-changed";

/**
 * 이전 브랜치/개발 코드에서 사용하던 인증 키.
 *
 * 새 로그인에서는 사용하지 않지만,
 * 기존 브라우저에 남아 있는 값을 정리하거나
 * 임시 호환하기 위해 유지한다.
 */
const LEGACY_TOKEN_KEYS = [
  "accessToken",
  "token",
];

const LEGACY_USER_KEYS = [
  "user",
];

const LEGACY_SESSION_KEYS = [
  "mockSession",
];


/**
 * 브라우저 환경인지 확인
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}


/**
 * 로그인 응답 검증
 */
function validateAuth(
  token: string,
  user: InterviewFitUser,
): void {
  if (
    !token ||
    typeof token !== "string" ||
    token.trim() === ""
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
 * JWT + 사용자 정보를 localStorage에 저장
 *
 * 카카오 로그인 성공 후 callback 페이지에서 사용한다.
 */
export function saveAuth(
  token: string,
  user: InterviewFitUser,
): void {
  if (!isBrowser()) {
    return;
  }

  validateAuth(
    token,
    user,
  );

  /**
   * 실제 사용하는 키
   */
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

  /**
   * 이전 mock 로그인 상태 제거
   */
  LEGACY_SESSION_KEYS.forEach(
    (key) => {
      sessionStorage.removeItem(
        key,
      );
    },
  );

  /**
   * Navbar / Hero / IntroSection 등에
   * 로그인 상태가 변경되었음을 알린다.
   */
  window.dispatchEvent(
    new Event(
      AUTH_CHANGED_EVENT,
    ),
  );
}


/**
 * 기존 코드에서 saveLogin(response)를
 * 사용하는 경우를 위한 호환 함수.
 *
 * 백엔드 현재 정상 응답:
 *
 * {
 *   token: "...",
 *   user: {...}
 * }
 *
 * 이전 코드의 accessToken / jwt 형식도
 * 혹시 남아 있을 수 있으므로 읽을 수 있게 해둔다.
 */
export function saveLogin(
  response: LoginResponse,
): void {
  if (!response) {
    throw new Error(
      "로그인 응답이 없습니다.",
    );
  }

  const token =
    response.token ??
    response.accessToken ??
    response.jwt;

  if (!token) {
    throw new Error(
      "로그인 응답에 JWT 토큰이 없습니다.",
    );
  }

  if (!response.user) {
    throw new Error(
      "로그인 응답에 사용자 정보가 없습니다.",
    );
  }

  saveAuth(
    token,
    response.user,
  );
}


/**
 * JWT 반환
 *
 * 새 키를 가장 먼저 확인한다.
 *
 * 이전 브랜치에서 accessToken 또는 token으로
 * 저장됐던 값이 있으면 한 번 읽어서
 * 새 TOKEN_KEY로 자동 이전한다.
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
    token &&
    token !== "undefined" &&
    token !== "null"
  ) {
    return token;
  }

  /**
   * 이전 저장 키 호환
   */
  for (
    const legacyKey
    of LEGACY_TOKEN_KEYS
  ) {
    const legacyToken =
      localStorage.getItem(
        legacyKey,
      );

    if (
      legacyToken &&
      legacyToken !== "undefined" &&
      legacyToken !== "null"
    ) {
      /**
       * 새 키로 자동 이전
       */
      localStorage.setItem(
        TOKEN_KEY,
        legacyToken,
      );

      return legacyToken;
    }
  }

  return null;
}


/**
 * 기존 코드 호환용 이름
 */
export function getAccessToken(): string | null {
  return getAuthToken();
}


/**
 * 로그인 사용자 정보 반환
 */
export function getAuthUser(): InterviewFitUser | null {
  if (!isBrowser()) {
    return null;
  }

  let rawUser =
    localStorage.getItem(
      USER_KEY,
    );

  /**
   * 이전 user 키 호환
   */
  if (!rawUser) {
    for (
      const legacyKey
      of LEGACY_USER_KEYS
    ) {
      const legacyUser =
        localStorage.getItem(
          legacyKey,
        );

      if (legacyUser) {
        rawUser =
          legacyUser;

        localStorage.setItem(
          USER_KEY,
          legacyUser,
        );

        break;
      }
    }
  }

  if (!rawUser) {
    return null;
  }

  try {
    const user =
      JSON.parse(
        rawUser,
      ) as InterviewFitUser;

    if (
      !user ||
      user.id == null
    ) {
      return null;
    }

    /**
     * userId 별도 키가 없으면 생성
     */
    if (
      !localStorage.getItem(
        USER_ID_KEY,
      )
    ) {
      localStorage.setItem(
        USER_ID_KEY,
        String(user.id),
      );
    }

    return user;
  } catch (error) {
    console.error(
      "로그인 사용자 정보 파싱 실패:",
      error,
    );

    return null;
  }
}


/**
 * 기존 코드 호환
 */
export function getLoginUser(): InterviewFitUser | null {
  return getAuthUser();
}


/**
 * 로그인 사용자 ID 반환
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

  if (
    user?.id != null
  ) {
    localStorage.setItem(
      USER_ID_KEY,
      String(user.id),
    );

    return user.id;
  }

  return null;
}


/**
 * 로그인 여부
 *
 * 프론트 화면 표시에서는
 * JWT가 존재하는지를 확인한다.
 *
 * 실제 JWT가 유효한지는
 * Spring Security가 API 요청 시 검증한다.
 */
export function isLoggedIn(): boolean {
  return Boolean(
    getAuthToken(),
  );
}


/**
 * 기존 코드 호환
 */
export function isAuthenticated(): boolean {
  return isLoggedIn();
}


/**
 * 화면 표시용 사용자 이름
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
 * 프로필 원형 아이콘에 사용할 첫 글자
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

  /**
   * 현재 인증 정보
   */
  localStorage.removeItem(
    TOKEN_KEY,
  );

  localStorage.removeItem(
    USER_KEY,
  );

  localStorage.removeItem(
    USER_ID_KEY,
  );

  /**
   * 과거 인증 정보
   */
  LEGACY_TOKEN_KEYS.forEach(
    (key) => {
      localStorage.removeItem(
        key,
      );
    },
  );

  LEGACY_USER_KEYS.forEach(
    (key) => {
      localStorage.removeItem(
        key,
      );
    },
  );

  LEGACY_SESSION_KEYS.forEach(
    (key) => {
      localStorage.removeItem(
        key,
      );

      sessionStorage.removeItem(
        key,
      );
    },
  );

  /**
   * Navbar 등에게 로그아웃 알림
   */
  window.dispatchEvent(
    new Event(
      AUTH_CHANGED_EVENT,
    ),
  );
}


/**
 * 기존 코드 호환
 */
export function logout(): void {
  clearAuth();
}


/**
 * 로그인 / 로그아웃 상태 변경 감지
 *
 * callback 인자로 현재 로그인 여부를 전달한다.
 *
 * 아래 두 방식 모두 사용 가능:
 *
 * subscribeToAuthChanges(() => {...})
 *
 * subscribeToAuthChanges((authenticated) => {...})
 */
export function subscribeToAuthChanges(
  callback: (
    authenticated: boolean,
  ) => void,
): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  const handleAuthChange =
    () => {
      callback(
        isAuthenticated(),
      );
    };

  window.addEventListener(
    AUTH_CHANGED_EVENT,
    handleAuthChange,
  );

  /**
   * 다른 탭에서 로그인/로그아웃했을 때도
   * 상태 갱신
   */
  window.addEventListener(
    "storage",
    handleAuthChange,
  );

  return () => {
    window.removeEventListener(
      AUTH_CHANGED_EVENT,
      handleAuthChange,
    );

    window.removeEventListener(
      "storage",
      handleAuthChange,
    );
  };
}