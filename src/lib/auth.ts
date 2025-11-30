export type UserRole = "student" | "agent" | "staff" | "admin";

export type AuthSession = {
  email: string;
  role: UserRole;
};

export const AUTH_COOKIE_NAME = "churchill_auth";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const encodeSession = (session: AuthSession) =>
  encodeURIComponent(JSON.stringify(session));

export const parseAuthCookie = (value?: string | null): AuthSession | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as AuthSession;
  } catch {
    return null;
  }
};

export const setBrowserAuthSession = (session: AuthSession) => {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeSession(session)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
};

export const clearBrowserAuthSession = () => {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
};
