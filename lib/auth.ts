export type AuthUser = {
  id: number;
  kakaoId: number;
  email: string | null;
  name: string;
  createdAt: string;
};

const TOKEN_KEY = "interviewfit_access_token";
const USER_KEY = "interviewfit_user";
const AUTH_CHANGED_EVENT = "interviewfit-auth-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveAuth(token: string, user: AuthUser): void {
  if (!isBrowser()) return;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem("interviewfit_user_id", String(user.id));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getAuthToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (!isBrowser()) return null;

  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export function clearAuth(): void {
  if (!isBrowser()) return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("interviewfit_user_id");
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function subscribeToAuthChanges(listener: () => void): () => void {
  if (!isBrowser()) return () => undefined;

  window.addEventListener(AUTH_CHANGED_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
